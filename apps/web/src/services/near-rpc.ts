import axios from "axios";
import { z } from "zod";
import { NEAR_RPC_URL, RITUAL_CONTRACT_ID } from "@/constants/ritual";

const client = axios.create({ baseURL: NEAR_RPC_URL, timeout: 12_000, headers: { "Content-Type": "application/json" } });
client.interceptors.request.use((request) => {
  request.headers.set("Accept", "application/json");
  return request;
});
client.interceptors.response.use(undefined, (cause: unknown) => {
  if (axios.isAxiosError(cause)) {
    const detail = cause.response?.data?.error?.message || cause.response?.statusText || cause.message;
    return Promise.reject(new Error(`NEAR RPC request failed: ${detail}`));
  }
  return Promise.reject(cause);
});

const rpcSchema = z.object({
  result: z.object({ result: z.array(z.number().int().min(0).max(255)) }).optional(),
  error: z.object({ message: z.string().optional(), data: z.unknown().optional() }).optional(),
});

const outcomeStatusSchema = z.record(z.string(), z.unknown());
const transactionRpcSchema = z.object({
  result: z.object({
    final_execution_status: z.string(),
    status: outcomeStatusSchema,
    transaction: z.object({
      signer_id: z.string(),
      receiver_id: z.string(),
      actions: z.array(z.unknown()),
    }),
    receipts_outcome: z.array(z.object({ outcome: z.object({ status: outcomeStatusSchema }) })),
  }).optional(),
  error: z.object({ message: z.string().optional() }).optional(),
});

const ritualWriteMethods = new Set(["storage_deposit", "check_in", "finalize_day", "claim_reward"]);

export async function verifyRitualTransaction(hash: string, signerAccountId: string): Promise<{ success: boolean; reason?: string }> {
  if (!/^[1-9A-HJ-NP-Za-km-z]{40,55}$/.test(hash)) throw new Error("Invalid transaction hash");
  const response = await client.post("", {
    jsonrpc: "2.0", id: "gembull-tx-verify", method: "tx",
    params: { tx_hash: hash, sender_account_id: signerAccountId, wait_until: "FINAL" },
  }, { timeout: 20_000 });
  const envelope = transactionRpcSchema.parse(response.data);
  if (envelope.error) throw new Error(`NEAR RPC: ${envelope.error.message || "Transaction lookup failed"}`);
  const result = envelope.result;
  if (!result || result.final_execution_status !== "FINAL") throw new Error("Transaction has not reached final execution");
  if (result.transaction.signer_id !== signerAccountId || result.transaction.receiver_id !== RITUAL_CONTRACT_ID) {
    throw new Error("Transaction does not match the connected account and GemBull contract");
  }
  const hasRitualAction = result.transaction.actions.some((action) => {
    if (!action || typeof action !== "object" || !("FunctionCall" in action)) return false;
    const call = action.FunctionCall;
    return Boolean(call && typeof call === "object" && "method_name" in call && ritualWriteMethods.has(String(call.method_name)));
  });
  if (!hasRitualAction) throw new Error("Transaction does not contain a GemBull ritual action");
  const statuses = [result.status, ...result.receipts_outcome.map((receipt) => receipt.outcome.status)];
  const failure = statuses.find((status) => Object.hasOwn(status, "Failure"));
  if (failure) return { success: false, reason: JSON.stringify(failure.Failure).slice(0, 240) };
  if (statuses.some((status) => !Object.hasOwn(status, "SuccessValue") && !Object.hasOwn(status, "SuccessReceiptId"))) {
    throw new Error("Transaction outcome is not confirmed as successful");
  }
  return { success: true };
}

export async function viewContract<T>(method: string, args: Record<string, unknown>, schema: z.ZodType<T>): Promise<T> {
  if (!RITUAL_CONTRACT_ID) throw new Error("GEMBULL contract is not configured");
  const argsBase64 = btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(args))));
  const response = await client.post("", {
    jsonrpc: "2.0", id: "gembull-web", method: "query",
    params: { request_type: "call_function", finality: "final", account_id: RITUAL_CONTRACT_ID, method_name: method, args_base64: argsBase64 },
  });
  const envelope = rpcSchema.parse(response.data);
  if (envelope.error) throw new Error(`NEAR RPC: ${envelope.error.message || "Contract view failed"}`);
  if (!envelope.result) throw new Error("NEAR RPC returned no contract result");
  const raw = new TextDecoder().decode(new Uint8Array(envelope.result.result));
  try { return schema.parse(JSON.parse(raw)); }
  catch (cause) { throw new Error(`Invalid ${method} response: ${cause instanceof Error ? cause.message : String(cause)}`); }
}
