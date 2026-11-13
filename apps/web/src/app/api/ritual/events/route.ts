import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { RITUAL_CONTRACT_ID } from "@/constants/ritual";
import { parseRitualReceipts } from "@/lib/ritual-events";
import type { RitualEvent } from "@/schemas/ritual-events";

export const dynamic = "force-dynamic";

const BASE = "https://api-testnet.nearblocks.io/v3";
const METHOD_NAMES = new Set(["check_in", "finalize_day", "claim_reward"]);
const txPageSchema = z.object({
  data: z.array(z.object({
    transaction_hash: z.string(),
    receiver_account_id: z.string(),
    signer_account_id: z.string(),
    outcomes: z.object({ status: z.boolean() }).optional(),
    actions: z.array(z.object({ method: z.string().nullable().optional() })).optional(),
  })),
  meta: z.object({ next_page: z.string().nullable().optional() }).optional(),
});
const receiptSchema = z.object({ data: z.unknown() });

async function readJson(url: URL): Promise<unknown> {
  const response = await fetch(url, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(12_000) });
  if (!response.ok) throw new Error(`Indexer returned HTTP ${response.status}`);
  return response.json();
}

export async function GET(request: NextRequest) {
  if (!RITUAL_CONTRACT_ID) return NextResponse.json({ error: "Contract is not configured" }, { status: 503 });
  const next = request.nextUrl.searchParams.get("next");
  if (next && (next.length > 500 || !/^[A-Za-z0-9_+\/=.-]+$/.test(next))) {
    return NextResponse.json({ error: "Invalid page cursor" }, { status: 400 });
  }

  try {
    const listUrl = new URL(`${BASE}/accounts/${encodeURIComponent(RITUAL_CONTRACT_ID)}/txns`);
    listUrl.searchParams.set("limit", "25");
    if (next) listUrl.searchParams.set("next", next);
    const page = txPageSchema.parse(await readJson(listUrl));
    const candidates = page.data.filter((tx) =>
      tx.receiver_account_id === RITUAL_CONTRACT_ID &&
      tx.outcomes?.status === true &&
      tx.actions?.some((action) => action.method && METHOD_NAMES.has(action.method))
    );
    const events: RitualEvent[] = [];
    for (let index = 0; index < candidates.length; index += 4) {
      const batch = candidates.slice(index, index + 4);
      const receipts = await Promise.all(batch.map(async (tx) => {
        const url = new URL(`${BASE}/txns/${encodeURIComponent(tx.transaction_hash)}/receipts`);
        const envelope = receiptSchema.parse(await readJson(url));
        return parseRitualReceipts(envelope.data, tx.transaction_hash, RITUAL_CONTRACT_ID, tx.signer_account_id);
      }));
      events.push(...receipts.flat());
    }
    events.sort((a, b) => BigInt(a.blockTimestampNs) > BigInt(b.blockTimestampNs) ? -1 : 1);
    return NextResponse.json({
      events,
      nextPage: page.meta?.next_page ?? null,
      source: "NEAR Testnet · NearBlocks receipts",
    }, { headers: { "Cache-Control": "public, s-maxage=20, stale-while-revalidate=60" } });
  } catch (cause) {
    const detail = cause instanceof Error ? cause.message : "Unknown indexer error";
    return NextResponse.json({ error: `Event indexer unavailable: ${detail}` }, { status: 502 });
  }
}
