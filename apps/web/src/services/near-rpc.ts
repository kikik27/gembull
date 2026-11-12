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
