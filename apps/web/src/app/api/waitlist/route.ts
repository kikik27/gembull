import { createHash } from "node:crypto";
import { waitlistRequestSchema } from "@/schemas/waitlist";

export const runtime = "nodejs";

const WAITLIST_KEY = "gembull:waitlist:testnet:v1";

function configured() {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL &&
      process.env.UPSTASH_REDIS_REST_TOKEN,
  );
}

async function redis<T>(command: Array<string | number>): Promise<T> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error("Waitlist storage is unavailable");

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
    cache: "no-store",
    signal: AbortSignal.timeout(8_000),
  });
  if (!response.ok) throw new Error("Waitlist storage request failed");
  const body = (await response.json()) as { result?: T; error?: string };
  if (body.error || !("result" in body))
    throw new Error("Waitlist storage request failed");
  return body.result as T;
}

function unavailable() {
  return Response.json(
    { error: "Community faucet is temporarily unavailable. Please try again later." },
    { status: 503, headers: { "Cache-Control": "no-store" } },
  );
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

async function sendTelegramAdminNotification({
  accountId,
  telegram,
  twitter,
  joinedAt,
}: {
  accountId: string;
  telegram?: string;
  twitter?: string | null;
  joinedAt: string;
}) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (!botToken || !chatId) {
    return;
  }

  const tgHandle = telegram ? (telegram.startsWith("@") ? telegram : `@${telegram}`) : "—";
  const dateFormatted = new Date(joinedAt).toISOString().replace("T", " ").substring(0, 19) + " UTC";

  const message = [
    `🐂 <b>New GemBull Community Tester!</b>`,
    ``,
    `👤 <b>NEAR Account:</b> <code>${escapeHtml(accountId)}</code>`,
    `💬 <b>Telegram:</b> ${escapeHtml(tgHandle)}`,
    `🕒 <b>Time:</b> <code>${dateFormatted}</code>`,
    `⚡ <b>Status:</b> ⏳ <i>Pending Review</i>`,
    ``,
    `📋 <b>Quick Distribute Command:</b>`,
    `<code>node scripts/distribute_testnet.mjs ${escapeHtml(accountId)} 5000</code>`,
  ].join("\n");

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: "HTML",
      disable_web_page_preview: true,
      reply_markup: {
        inline_keyboard: [
          [
            { text: "✅ Approve (5,000 GEMBULL)", callback_data: `approve:${accountId}` },
            { text: "❌ Reject", callback_data: `reject:${accountId}` },
          ],
        ],
      },
    }),
    signal: AbortSignal.timeout(8_000),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error(`Telegram API alert failed (${res.status}):`, errorText);
  }
}

export async function GET(request: Request) {
  const accountId = new URL(request.url).searchParams.get("accountId");
  if (!accountId) {
    return Response.json(
      { available: true, joined: false, joinedAt: null },
      { headers: { "Cache-Control": "no-store" } },
    );
  }
  const parsed = waitlistRequestSchema.pick({ accountId: true }).safeParse({ accountId });
  if (!parsed.success)
    return Response.json({ error: "Invalid Testnet account" }, { status: 400 });

  if (!configured()) {
    return Response.json(
      { available: true, joined: false, joinedAt: null },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const raw = await redis<string | null>([
      "HGET",
      WAITLIST_KEY,
      parsed.data.accountId,
    ]);
    if (!raw) {
      return Response.json(
        { available: true, joined: false, joinedAt: null },
        { headers: { "Cache-Control": "no-store" } },
      );
    }

    try {
      const data = JSON.parse(raw);
      return Response.json(
        {
          available: true,
          joined: true,
          joinedAt: data.joinedAt || data.requestedAt || raw,
          status: data.status || "pending",
          telegram: data.telegram || null,
        },
        { headers: { "Cache-Control": "no-store" } },
      );
    } catch {
      return Response.json(
        { available: true, joined: true, joinedAt: raw, status: "pending" },
        { headers: { "Cache-Control": "no-store" } },
      );
    }
  } catch {
    return Response.json(
      { available: true, joined: false, joinedAt: null },
      { headers: { "Cache-Control": "no-store" } },
    );
  }
}

export async function POST(request: Request) {
  const length = Number(request.headers.get("content-length") || "0");
  if (length > 2_048)
    return Response.json({ error: "Request is too large" }, { status: 413 });

  let input: unknown;
  try {
    const raw = await request.text();
    if (raw.length > 2_048)
      return Response.json({ error: "Request is too large" }, { status: 413 });
    input = JSON.parse(raw);
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }
  const parsed = waitlistRequestSchema.safeParse(input);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]?.message || "Invalid input";
    return Response.json({ error: firstIssue }, { status: 400 });
  }
  if (parsed.data.website)
    return Response.json({ available: true, joined: false, joinedAt: null });

  const accountId = parsed.data.accountId;
  const joinedAt = new Date().toISOString();
  const record = {
    accountId,
    telegram: parsed.data.telegram,
    twitter: parsed.data.twitter?.trim() || null,
    joinedAt,
    status: "pending",
  };

  if (configured()) {
    try {
      const existing = await redis<string | null>(["HGET", WAITLIST_KEY, accountId]);
      if (existing) {
        let savedJoinedAt = existing;
        try {
          const parsedExisting = JSON.parse(existing);
          savedJoinedAt = parsedExisting.joinedAt || existing;
        } catch {}
        return Response.json({ available: true, joined: true, joinedAt: savedJoinedAt });
      }

      const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
      if (ip) {
        const ipHash = createHash("sha256").update(ip).digest("hex");
        const permitted = await redis<string | null>([
          "SET", `gembull:waitlist:rate:${ipHash}`, "1", "EX", 60, "NX",
        ]);
        if (permitted !== "OK")
          return Response.json(
            { error: "Please wait a minute before sending another request." },
            { status: 429 },
          );
      }

      await redis<number>([
        "HSETNX",
        WAITLIST_KEY,
        accountId,
        JSON.stringify(record),
      ]);
    } catch (redisErr) {
      console.warn("Redis write failed, proceeding with Telegram notification:", redisErr);
    }
  }

  // Deliver Telegram notification to Admin Bot
  sendTelegramAdminNotification(record).catch((err) => {
    console.error("Failed to deliver Telegram admin alert:", err);
  });

  return Response.json(
    { available: true, joined: true, joinedAt },
    { status: 201, headers: { "Cache-Control": "no-store" } },
  );
}
