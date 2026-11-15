#!/usr/bin/env node

/**
 * GemBull Community Queue Manager & Distributor
 * Reads community faucet requests from Upstash Redis and distributes GEMBULL tokens.
 *
 * Usage:
 *   node scripts/distribute_queue.mjs                # List all requests in queue
 *   node scripts/distribute_queue.mjs --list         # List all requests in queue
 *   node scripts/distribute_queue.mjs <account>      # Distribute 5000 GEMBULL to specified account & mark distributed
 *   node scripts/distribute_queue.mjs --all          # Distribute to all pending requests
 *   node scripts/distribute_queue.mjs --dry-run      # Dry run distribution
 */

import { execFileSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

// Load environment variables from apps/web/.env.local if not present
function loadEnv() {
  const envPath = join(process.cwd(), "apps", "web", ".env.local");
  if (existsSync(envPath)) {
    const lines = readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const [key, ...vals] = trimmed.split("=");
      if (key && !process.env[key.trim()]) {
        process.env[key.trim()] = vals.join("=").trim().replace(/^["']|["']$/g, "");
      }
    }
  }
}

loadEnv();

const WAITLIST_KEY = "gembull:waitlist:testnet:v1";
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!redisUrl || !redisToken) {
  console.error("Error: UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set in environment or apps/web/.env.local");
  process.exit(1);
}

async function redis(command) {
  const res = await fetch(redisUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${redisToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`Redis HTTP ${res.status}: ${await res.text()}`);
  const data = await res.json();
  if (data.error) throw new Error(`Redis error: ${data.error}`);
  return data.result;
}

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const doAll = args.includes("--all");
const listOnly = args.includes("--list") || args.length === 0 || (args.length === 1 && dryRun);
const targetAccount = args.find((a) => !a.startsWith("--"));

async function getAllRequests() {
  const rawHash = await redis(["HGETALL", WAITLIST_KEY]);
  const requests = [];
  // Upstash returns array of [key, val, key, val...] or object
  if (Array.isArray(rawHash)) {
    for (let i = 0; i < rawHash.length; i += 2) {
      const accountId = rawHash[i];
      const rawVal = rawHash[i + 1];
      let data = { accountId, joinedAt: rawVal, status: "pending", telegram: "—", twitter: "—" };
      try {
        const parsed = JSON.parse(rawVal);
        data = {
          accountId,
          joinedAt: parsed.joinedAt || rawVal,
          status: parsed.status || "pending",
          telegram: parsed.telegram || "—",
          twitter: parsed.twitter || "—",
          distributedAt: parsed.distributedAt,
        };
      } catch {}
      requests.push(data);
    }
  } else if (rawHash && typeof rawHash === "object") {
    for (const [accountId, rawVal] of Object.entries(rawHash)) {
      let data = { accountId, joinedAt: rawVal, status: "pending", telegram: "—", twitter: "—" };
      try {
        const parsed = JSON.parse(rawVal);
        data = {
          accountId,
          joinedAt: parsed.joinedAt || rawVal,
          status: parsed.status || "pending",
          telegram: parsed.telegram || "—",
          twitter: parsed.twitter || "—",
          distributedAt: parsed.distributedAt,
        };
      } catch {}
      requests.push(data);
    }
  }
  // Sort by joinedAt ascending
  requests.sort((a, b) => new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime());
  return requests;
}

async function markDistributed(accountId, existingData) {
  const updated = {
    ...existingData,
    status: "distributed",
    distributedAt: new Date().toISOString(),
  };
  await redis(["HSET", WAITLIST_KEY, accountId, JSON.stringify(updated)]);
}

function distributeToAccount(account, amount = "5000", isDryRun = false) {
  const cliScript = join(process.cwd(), "scripts", "distribute_testnet.mjs");
  const execArgs = ["node", cliScript, account, amount];
  if (isDryRun) execArgs.push("--dry-run");

  console.log(`\nExecuting: ${execArgs.join(" ")}`);
  try {
    execFileSync(process.execPath, [cliScript, account, amount, ...(isDryRun ? ["--dry-run"] : [])], {
      stdio: "inherit",
    });
    return true;
  } catch (err) {
    console.error(`Failed to distribute to ${account}:`, err.message);
    return false;
  }
}

async function main() {
  console.log("=== GemBull Community Distribution Queue ===");
  const requests = await getAllRequests();

  if (requests.length === 0) {
    console.log("Queue is empty. No requests recorded yet.");
    return;
  }

  const pending = requests.filter((r) => r.status === "pending");
  const distributed = requests.filter((r) => r.status === "distributed");

  console.log(`Total Requests: ${requests.length} (Pending: ${pending.length}, Distributed: ${distributed.length})\n`);

  if (listOnly && !doAll && !targetAccount) {
    console.table(
      requests.map((r) => ({
        "NEAR Account": r.accountId,
        Telegram: r.telegram,
        "X (Twitter)": r.twitter,
        Status: r.status.toUpperCase(),
        "Requested At": new Date(r.joinedAt).toISOString().substring(0, 16),
      }))
    );
    console.log("\nCommands:");
    console.log("  node scripts/distribute_queue.mjs <account.testnet>  # Distribute to one account");
    console.log("  node scripts/distribute_queue.mjs --all              # Distribute to all pending accounts");
    return;
  }

  if (targetAccount) {
    const item = requests.find((r) => r.accountId === targetAccount);
    if (!item) {
      console.log(`Account ${targetAccount} is not in queue. Proceeding with direct distribution...`);
    } else {
      console.log(`Found in queue: ${item.accountId} | Telegram: ${item.telegram} | Status: ${item.status}`);
    }

    const success = distributeToAccount(targetAccount, "5000", dryRun);
    if (success && !dryRun && item) {
      await markDistributed(targetAccount, item);
      console.log(`✓ Marked ${targetAccount} as DISTRIBUTED in Redis queue.`);
    }
    return;
  }

  if (doAll) {
    if (pending.length === 0) {
      console.log("No pending requests to distribute.");
      return;
    }
    console.log(`Distributing 5,000 GEMBULL to ${pending.length} pending testers...`);
    let successCount = 0;
    for (const item of pending) {
      console.log(`\n--- [${item.accountId}] Telegram: ${item.telegram} ---`);
      const success = distributeToAccount(item.accountId, "5000", dryRun);
      if (success) {
        successCount++;
        if (!dryRun) {
          await markDistributed(item.accountId, item);
          console.log(`✓ Marked ${item.accountId} as DISTRIBUTED.`);
        }
      }
    }
    console.log(`\nCompleted: ${successCount}/${pending.length} processed successfully.`);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
