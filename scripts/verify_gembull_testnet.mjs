import assert from "node:assert/strict";

const accountId = "gembull-core.testnet";
const rpcUrl = process.env.NEXT_PUBLIC_NEAR_RPC_URL || "https://test.rpc.fastnear.com";
const expectedCodeHash = "8XxqJ2Nipau9nu5bSAcXPuf8MdLqpnLdw8iDdCxSqWtc";

async function query(params) {
  const response = await fetch(rpcUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: "gembull-verify", method: "query", params }),
    signal: AbortSignal.timeout(15_000),
  });
  assert.ok(response.ok, `RPC HTTP ${response.status}`);
  const envelope = await response.json();
  assert.ok(!envelope.error, `RPC error: ${JSON.stringify(envelope.error)}`);
  return envelope.result;
}

async function view(methodName, args = {}) {
  const result = await query({
    request_type: "call_function",
    finality: "final",
    account_id: accountId,
    method_name: methodName,
    args_base64: Buffer.from(JSON.stringify(args)).toString("base64"),
  });
  return JSON.parse(Buffer.from(result.result).toString("utf8"));
}

const [metadata, rules, global, supply, account, keys] = await Promise.all([
  view("ft_metadata"),
  view("get_rules"),
  view("get_global_state"),
  view("ft_total_supply"),
  query({ request_type: "view_account", finality: "final", account_id: accountId }),
  query({ request_type: "view_access_key_list", finality: "final", account_id: accountId }),
]);

assert.equal(metadata.name, "GemBull");
assert.equal(metadata.symbol, "GEMBULL");
assert.equal(metadata.decimals, 18);
assert.equal(rules.name, metadata.name);
assert.equal(rules.symbol, metadata.symbol);
assert.equal(rules.daily_target, 50);
assert.equal(rules.max_participants, 200);
assert.equal(rules.epoch_duration_ns, "86400000000000");
assert.equal(rules.treasury_burn_bps, 5);
assert.equal(account.code_hash, expectedCodeHash);
assert.equal(global.total_supply, supply);
assert.ok(BigInt(supply) > 0n && BigInt(supply) <= BigInt(rules.max_supply));
assert.ok(BigInt(global.ritual_treasury_balance) <= BigInt(supply));

const upgradeable = keys.keys.some(({ access_key: key }) => key.permission === "FullAccess");
console.log(`Verified ${accountId} at finality`);
console.log(`Metadata: ${metadata.name} / ${metadata.symbol}, ${metadata.decimals} decimals`);
console.log(`Code hash: ${account.code_hash}`);
console.log(`Supply (base units): ${supply}`);
console.log(`Treasury (base units): ${global.ritual_treasury_balance}`);
console.log(`FullAccess upgrade key present: ${upgradeable}`);
