#!/usr/bin/env node

/**
 * GemBull Ritual Keeper Bot
 *
 * Monitors GemBull smart contract epoch progression on NEAR Testnet.
 * When an epoch duration elapses and remains unfinalized, this bot automatically
 * calls `finalize_day({ day_id })` sequentially, executing the contract-enforced
 * settlement (target check, reward reservations / treasury burns, and streak updates).
 */

import fs from "node:fs";
import path from "node:path";
import {
  Account,
  JsonRpcProvider,
  FailoverRpcProvider,
  nearToYocto,
  teraToGas,
} from "near-api-js";

// Built-in environment file loader (compatible with Node 18+)
function loadEnvFile(envPath = ".env") {
  try {
    const target = path.resolve(process.cwd(), envPath);
    if (!fs.existsSync(target)) return;
    const content = fs.readFileSync(target, "utf-8");
    for (const rawLine of content.split("\n")) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;
      const eqIdx = line.indexOf("=");
      if (eqIdx !== -1) {
        const key = line.slice(0, eqIdx).trim();
        const value = line.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
        if (key && !(key in process.env)) {
          process.env[key] = value;
        }
      }
    }
  } catch {}
}
loadEnvFile();

// Configuration
const CONTRACT_ID = process.env.GEMBULL_CONTRACT_ID || "gembull-core.testnet";
const PRIMARY_RPC = process.env.NEAR_RPC_URL || "https://test.rpc.fastnear.com";
const FALLBACK_RPCS = [
  PRIMARY_RPC,
  "https://rpc.testnet.near.org",
  "https://testnet.neardata.xyz/v0/rpc",
].filter((url, idx, arr) => arr.indexOf(url) === idx);

const KEEPER_ACCOUNT_ID = process.env.KEEPER_ACCOUNT_ID;
const KEEPER_PRIVATE_KEY = process.env.KEEPER_PRIVATE_KEY;
const POLL_INTERVAL_MS =
  (Number(process.env.POLL_INTERVAL_SECONDS) || 60) * 1000;
const ATTACHED_DEPOSIT = process.env.ATTACHED_DEPOSIT_NEAR || "0.05";
const GAS_AMOUNT = process.env.GAS_TGAS || "100";

const IS_ONCE_MODE = process.argv.includes("--once");

function log(level, message, meta = null) {
  const ts = new Date().toISOString();
  const prefix = `[${ts}] [${level.toUpperCase()}] [GemBull-Keeper]`;
  if (meta) {
    console.log(`${prefix} ${message}`, meta);
  } else {
    console.log(`${prefix} ${message}`);
  }
}

// Initialize NEAR RPC provider with failover
const providers = FALLBACK_RPCS.map((url) => new JsonRpcProvider({ url }));
const provider = new FailoverRpcProvider(providers);

// Initialize Account if credentials provided
let keeperAccount = null;
if (KEEPER_ACCOUNT_ID && KEEPER_PRIVATE_KEY) {
  try {
    keeperAccount = new Account(KEEPER_ACCOUNT_ID, provider, KEEPER_PRIVATE_KEY);
    log("info", `Keeper wallet initialized: ${KEEPER_ACCOUNT_ID}`);
  } catch (err) {
    log("error", `Failed to initialize keeper wallet: ${err.message}`);
  }
} else {
  log(
    "warn",
    "No KEEPER_ACCOUNT_ID or KEEPER_PRIVATE_KEY provided. Running in READ-ONLY / MONITOR mode."
  );
}

/**
 * Fetch contract state safely
 */
async function getContractState() {
  const [global, rules] = await Promise.all([
    provider.callFunction({
      contractId: CONTRACT_ID,
      method: "get_global_state",
      args: {},
    }),
    provider.callFunction({
      contractId: CONTRACT_ID,
      method: "get_rules",
      args: {},
    }),
  ]);
  return { global, rules };
}

/**
 * Settle a specific day
 */
async function settleDay(dayId) {
  if (!keeperAccount) {
    log(
      "warn",
      `Epoch Day ${dayId} needs settlement, but keeper wallet is not configured with private key.`
    );
    return false;
  }

  log("info", `Initiating settlement for Day ${dayId}...`);
  try {
    const rawOutcome = await keeperAccount.callFunctionRaw({
      contractId: CONTRACT_ID,
      methodName: "finalize_day",
      args: { day_id: dayId },
      gas: teraToGas(GAS_AMOUNT),
      deposit: nearToYocto(ATTACHED_DEPOSIT),
    });

    const txHash = rawOutcome.transaction?.hash || rawOutcome.transaction_outcome?.id;
    const isSuccess =
      rawOutcome.status?.SuccessValue !== undefined ||
      rawOutcome.status === "SuccessValue";

    if (isSuccess || txHash) {
      log("info", `✓ Successfully settled Day ${dayId}! Tx Hash: ${txHash || "confirmed"}`);
      return true;
    } else {
      log("error", `Settlement transaction returned failure:`, rawOutcome.status);
      return false;
    }
  } catch (err) {
    log("error", `Failed to settle Day ${dayId}: ${err.message}`);
    return false;
  }
}

/**
 * Check and process epochs
 */
async function checkAndProcess() {
  try {
    const { global, rules } = await getContractState();

    if (global.ritual_ended) {
      log("warn", "GemBull ritual has ended on-chain (max supply reached). Keeper will idle.");
      return;
    }

    const currentDay = Number(global.current_day_id);
    const lastFinalized =
      global.last_finalized_day === null || global.last_finalized_day === undefined
        ? -1
        : Number(global.last_finalized_day);

    let nextDayToSettle = lastFinalized + 1;

    // Check if there are days awaiting settlement
    if (currentDay > nextDayToSettle) {
      log(
        "info",
        `Unfinalized epochs detected: current day is ${currentDay}, last finalized is ${lastFinalized}. Next to settle: Day ${nextDayToSettle}`
      );

      while (currentDay > nextDayToSettle) {
        log("info", `Attempting settlement for Day ${nextDayToSettle} (of ${currentDay - 1})...`);
        const settled = await settleDay(nextDayToSettle);
        if (!settled) {
          log("error", `Halting sequence: Day ${nextDayToSettle} settlement did not succeed.`);
          break;
        }
        nextDayToSettle++;
      }
      return;
    }

    // If up-to-date, calculate countdown to next epoch
    const launchNs = BigInt(global.launch_timestamp_ns);
    const epochDurationNs = BigInt(rules.epoch_duration_ns);
    const currentDayNs = BigInt(currentDay);
    const epochEndNs = launchNs + (currentDayNs + 1n) * epochDurationNs;
    const nowNs = BigInt(Date.now()) * 1_000_000n;
    const diffSeconds = Number((epochEndNs - nowNs) / 1_000_000_000n);

    const hours = Math.floor(Math.max(0, diffSeconds) / 3600);
    const mins = Math.floor((Math.max(0, diffSeconds) % 3600) / 60);
    const secs = Math.max(0, diffSeconds) % 60;

    log(
      "info",
      `Epoch status: Day ${currentDay} is active. Up to date (last finalized: Day ${lastFinalized}). ` +
        `Time remaining in current epoch: ${hours}h ${mins}m ${secs}s (ends at ~${new Date(Number(epochEndNs / 1_000_000n)).toLocaleString()}). ` +
        `Streak: ${global.current_streak}, Treasury: ${(BigInt(global.ritual_treasury_balance) / 10n ** 18n).toLocaleString()} GEMBULL`
    );
  } catch (err) {
    log("error", `Error checking contract state: ${err.message}`);
  }
}

// Main execution loop
async function main() {
  log("info", `Starting GemBull Ritual Keeper Bot for contract: ${CONTRACT_ID}`);
  log("info", `RPC failover configured: ${FALLBACK_RPCS.join(", ")}`);
  log("info", `Polling interval: ${POLL_INTERVAL_MS / 1000}s`);

  // Initial check
  await checkAndProcess();

  if (IS_ONCE_MODE) {
    log("info", "Once mode flag detected. Exiting now.");
    process.exit(0);
  }

  // Periodic loop
  const interval = setInterval(async () => {
    await checkAndProcess();
  }, POLL_INTERVAL_MS);

  // Graceful shutdown
  const shutdown = () => {
    log("info", "Received shutdown signal. Stopping keeper bot...");
    clearInterval(interval);
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((err) => {
  log("error", `Fatal error in keeper bot: ${err.message}`);
  process.exit(1);
});
