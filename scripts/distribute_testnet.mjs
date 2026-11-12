#!/usr/bin/env node

/**
 * GemBull Testnet Token Distributor
 * Transfers test GEMBULL from gembull-public.testnet to a registered tester wallet.
 *
 * Usage:
 *   node scripts/distribute_testnet.mjs <recipient.testnet> [amount_tokens]
 * Example:
 *   node scripts/distribute_testnet.mjs alice.testnet 5000
 */

import { execFileSync } from "node:child_process";
import { writeFileSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import os from "node:os";

const recipient = process.argv[2];
const tokenAmount = process.argv[3] || "5000";

if (!recipient) {
  console.error("Usage: node scripts/distribute_testnet.mjs <recipient.testnet> [amount_tokens]");
  process.exit(1);
}

const DECIMALS = 18n;
const baseUnits = (BigInt(tokenAmount) * (10n ** DECIMALS)).toString();
const nearCli = join(os.homedir(), ".cargo", "bin", "near.exe");

console.log(`--- Distributing ${tokenAmount} GEMBULL to ${recipient} ---`);

const payload = JSON.stringify({
  receiver_id: recipient,
  amount: baseUnits,
  memo: "GemBull Testnet distribution",
});

const tmpFile = join(os.tmpdir(), `gembull-transfer-${Date.now()}.json`);
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
