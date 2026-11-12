#!/usr/bin/env node

/**
 * GemBull Testnet Token Distributor
 * Transfers test GEMBULL from gembull-public.testnet to a registered tester wallet.
 *
 * Usage:
 *   node scripts/distribute_testnet.mjs <recipient.testnet> [amount_tokens] [--dry-run]
 * Example:
 *   node scripts/distribute_testnet.mjs alice.testnet 5000 --dry-run
 */

import { execFileSync } from "node:child_process";
import { writeFileSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import os from "node:os";
import { randomUUID } from "node:crypto";

const dryRun = process.argv.includes("--dry-run");
const positional = process.argv.slice(2).filter((arg) => arg !== "--dry-run");
const recipient = positional[0];
const tokenAmount = positional[1] || "5000";

if (!recipient || positional.length > 2 || !/^[a-z0-9_-]+(?:\.[a-z0-9_-]+)*\.testnet$/.test(recipient) || !/^[1-9]\d*$/.test(tokenAmount)) {
  console.error("Usage: node scripts/distribute_testnet.mjs <recipient.testnet> [positive_integer_amount] [--dry-run]");
  process.exit(1);
}

const DECIMALS = 18n;
const baseUnits = (BigInt(tokenAmount) * (10n ** DECIMALS)).toString();
const nearCli = join(os.homedir(), ".cargo", "bin", "near.exe");
const rpcUrl = process.env.NEXT_PUBLIC_NEAR_RPC_URL || "https://test.rpc.fastnear.com";

async function query(params) {
  const response = await fetch(rpcUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: "gembull-distribution-check", method: "query", params }),
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`RPC HTTP ${response.status}`);
  const envelope = await response.json();
  if (envelope.error) throw new Error(`RPC error: ${envelope.error.message || JSON.stringify(envelope.error)}`);
  return envelope.result;
}

async function view(methodName, accountId) {
  const result = await query({
    request_type: "call_function", finality: "final", account_id: "gembull-core.testnet",
    method_name: methodName, args_base64: Buffer.from(JSON.stringify({ account_id: accountId })).toString("base64"),
  });
  return JSON.parse(Buffer.from(result.result).toString("utf8"));
}

try {
  await query({ request_type: "view_account", finality: "final", account_id: recipient });
  const [storage, sourceBalance] = await Promise.all([
    view("storage_balance_of", recipient),
    view("ft_balance_of", "gembull-public.testnet"),
  ]);
  if (!storage) throw new Error(`${recipient} has not registered GEMBULL storage`);
  if (BigInt(sourceBalance) < BigInt(baseUnits)) throw new Error("Public distribution balance is insufficient");
  console.log(`Preflight passed: ${recipient} registered; public allocation has enough GEMBULL.`);
  if (dryRun) {
    console.log(`DRY RUN: would transfer ${tokenAmount} GEMBULL from gembull-public.testnet to ${recipient}. No transaction sent.`);
    process.exit(0);
  }
} catch (error) {
  console.error("Preflight failed:", error instanceof Error ? error.message : String(error));
  process.exit(1);
}

console.log(`--- Distributing ${tokenAmount} GEMBULL to ${recipient} ---`);

const payload = JSON.stringify({
  receiver_id: recipient,
  amount: baseUnits,
  memo: "GemBull Testnet distribution",
});

const tmpFile = join(os.tmpdir(), `gembull-transfer-${randomUUID()}.json`);
writeFileSync(tmpFile, payload, "utf-8");

try {
  const output = execFileSync(
    nearCli,
    [
      "contract",
      "call-function",
      "as-transaction",
      "gembull-core.testnet",
      "ft_transfer",
      "file-args",
      tmpFile,
      "prepaid-gas",
      "100.0 Tgas",
      "attached-deposit",
      "1 yoctoNEAR",
      "sign-as",
      "gembull-public.testnet",
      "network-config",
      "testnet",
      "sign-with-keychain",
      "send",
    ],
    { encoding: "utf-8" }
  );
  console.log(output);
  console.log(`✓ Successfully transferred ${tokenAmount} GEMBULL to ${recipient}`);
} catch (err) {
  console.error("Transfer failed:", err.message);
  process.exit(1);
} finally {
  try {
    unlinkSync(tmpFile);
  } catch {}
}
