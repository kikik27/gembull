import type { RitualEvent } from "@/schemas/ritual-events";

const ritualEvents = new Set([
  "ritual_check_in",
  "ritual_day_finalized",
  "ritual_reward_claimed",
  "ritual_ended",
]);
const tokenEvents = new Set(["ft_mint", "ft_burn"]);

type Receipt = {
  receipt_id?: unknown;
  receiver_account_id?: unknown;
  block?: { block_height?: unknown; block_timestamp?: unknown };
  outcome?: { executor_account_id?: unknown; status?: unknown; logs?: unknown };
  receipts?: unknown;
};

function unsignedString(value: unknown): string | null {
  return typeof value === "string" && /^\d+$/.test(value) ? value : null;
}

function record(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

/** Parse only successful logs executed by the configured GEMBULL contract. */
export function parseRitualReceipts(
  root: unknown,
  transactionHash: string,
  contractId: string,
  signerId: string,
): RitualEvent[] {
  const events: RitualEvent[] = [];
  const queue: Receipt[] = [root as Receipt];
  let visited = 0;
  while (queue.length && visited++ < 64) {
    const receipt = queue.shift();
    if (!receipt || typeof receipt !== "object") continue;
    if (Array.isArray(receipt.receipts)) queue.push(...receipt.receipts.slice(0, 64) as Receipt[]);
    if (receipt.outcome?.executor_account_id !== contractId || receipt.outcome.status !== true) continue;
    const height = unsignedString(receipt.block?.block_height);
    const timestamp = unsignedString(receipt.block?.block_timestamp);
    const receiptId = typeof receipt.receipt_id === "string" ? receipt.receipt_id : null;
    if (!height || !timestamp || !receiptId || !Array.isArray(receipt.outcome.logs)) continue;
    receipt.outcome.logs.slice(0, 64).forEach((line: unknown, logIndex: number) => {
      if (typeof line !== "string" || !line.startsWith("EVENT_JSON:")) return;
      let envelope: Record<string, unknown> | null = null;
      try { envelope = record(JSON.parse(line.slice("EVENT_JSON:".length))); }
      catch { return; }
      if (!envelope) return;
      const standard = envelope.standard;
      const event = envelope.event;
      if (!(
        (standard === "gembull" && typeof event === "string" && ritualEvents.has(event)) ||
        (standard === "nep141" && typeof event === "string" && tokenEvents.has(event))
      )) return;
      if (!Array.isArray(envelope.data)) return;
      envelope.data.slice(0, 64).forEach((value: unknown, dataIndex: number) => {
        const data = record(value);
        if (!data) return;
        const accountId = data.account_id ?? data.owner_id;
        const amount = event === "ritual_day_finalized" ? data.burn_amount : data.amount;
        const dayId = data.day_id;
        events.push({
          id: `${transactionHash}:${receiptId}:${logIndex}:${dataIndex}`,
          transactionHash,
          receiptId,
          blockHeight: height,
          blockTimestampNs: timestamp,
          standard: standard as RitualEvent["standard"],
          event: event as RitualEvent["event"],
          accountId: typeof accountId === "string" ? accountId : signerId,
          amount: unsignedString(amount),
          dayId: typeof dayId === "number" && Number.isSafeInteger(dayId) && dayId >= 0 ? dayId : null,
          outcome: typeof data.outcome === "string" ? data.outcome : null,
        });
      });
    });
  }
  return events;
}
