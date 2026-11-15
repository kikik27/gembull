#!/usr/bin/env node

/**
 * GemBull Automated Telegram Distribution Daemon
 * Runs on VPS / server 24/7.
 *
 * Allows Admin to approve or reject community tester requests
 * directly from Telegram with one tap (via inline buttons),
 * automatically executing storage deposit and ft_transfer on NEAR Testnet.
 */

import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import Redis from "ioredis";
import {
  Account,
  JsonRpcProvider,
  FailoverRpcProvider,
  nearToYocto,
  teraToGas,
} from "near-api-js";

// Load environment variables from .env or .env.local
function loadEnv() {
  const dir = typeof import.meta.dirname !== "undefined"
    ? import.meta.dirname
    : path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));

  const envCandidates = [
    path.resolve(process.cwd(), ".env"),
    path.resolve(process.cwd(), ".env.local"),
    path.resolve(process.cwd(), "apps", "web", ".env.local"),
    path.resolve(dir, ".env"),
    path.resolve(dir, ".env.local"),
    path.resolve(dir, "..", "..", "apps", "web", ".env.local"),
  ];
  for (const target of envCandidates) {
    if (fs.existsSync(target)) {
      try {
        const lines = fs.readFileSync(target, "utf-8").split("\n");
        for (const raw of lines) {
          const line = raw.trim();
          if (!line || line.startsWith("#")) continue;
          const eq = line.indexOf("=");
          if (eq !== -1) {
            const key = line.slice(0, eq).trim();
            const val = line.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
            if (key && !(key in process.env)) {
              process.env[key] = val;
            }
          }
        }
      } catch {}
    }
  }
}
loadEnv();

// Configuration
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_CHAT_ID = String(process.env.TELEGRAM_ADMIN_CHAT_ID || "");
const CONTRACT_ID = process.env.GEMBULL_CONTRACT_ID || "gembull-core.testnet";
const DISTRIBUTOR_ACCOUNT_ID = process.env.DISTRIBUTOR_ACCOUNT_ID || "gembull-public.testnet";
const DISTRIBUTOR_PRIVATE_KEY = process.env.DISTRIBUTOR_PRIVATE_KEY;
const DEFAULT_DISTRIBUTION_AMOUNT = process.env.DISTRIBUTION_AMOUNT || "5000";
const PRIMARY_RPC = process.env.NEAR_RPC_URL || "https://test.rpc.fastnear.com";
const FALLBACK_RPCS = [
  PRIMARY_RPC,
  "https://rpc.testnet.near.org",
  "https://testnet.neardata.xyz/v0/rpc",
].filter((url, idx, arr) => arr.indexOf(url) === idx);

const REDIS_TCP_URL = process.env.REDIS_URL || "redis://redis:6379";
const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const WAITLIST_KEY = "gembull:waitlist:testnet:v1";

let redisClient = null;
if (REDIS_TCP_URL) {
  try {
    redisClient = new Redis(REDIS_TCP_URL, {
      lazyConnect: false,
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => Math.min(times * 200, 3000),
    });
    redisClient.on("connect", () => log("info", `Connected to Redis at ${REDIS_TCP_URL}`));
    redisClient.on("error", (err) => log("warn", `Redis connection warning: ${err.message}`));
  } catch (err) {
    log("warn", `Could not initialize Redis client: ${err.message}`);
  }
}

if (!BOT_TOKEN) {
  console.error("❌ Fatal: TELEGRAM_BOT_TOKEN is not configured.");
  process.exit(1);
}
if (!ADMIN_CHAT_ID) {
  console.error("❌ Fatal: TELEGRAM_ADMIN_CHAT_ID is not configured.");
  process.exit(1);
}

function log(level, msg, meta = null) {
  const ts = new Date().toISOString();
  const prefix = `[${ts}] [${level.toUpperCase()}] [GemBull-Distributor]`;
  if (meta) {
    console.log(`${prefix} ${msg}`, meta);
  } else {
    console.log(`${prefix} ${msg}`);
  }
}

// Initialize NEAR RPC and Account
const providers = FALLBACK_RPCS.map((url) => new JsonRpcProvider({ url }));
const provider = new FailoverRpcProvider(providers);

let distributorAccount = null;
if (DISTRIBUTOR_ACCOUNT_ID && DISTRIBUTOR_PRIVATE_KEY) {
  try {
    distributorAccount = new Account(DISTRIBUTOR_ACCOUNT_ID, provider, DISTRIBUTOR_PRIVATE_KEY);
    log("info", `Distributor signer ready: ${DISTRIBUTOR_ACCOUNT_ID}`);
  } catch (err) {
    log("error", `Failed to initialize distributor account: ${err.message}`);
  }
} else {
  log("warn", "No DISTRIBUTOR_PRIVATE_KEY found in environment. Bot running in READ-ONLY mode (transactions will fail until private key is set).");
}

// Telegram API Wrapper
async function tgRequest(method, payload) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/${method}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Telegram API ${method} failed (${res.status}): ${errorText}`);
  }
  return res.json();
}

async function answerCallbackQuery(id, text = "", showAlert = false) {
  try {
    await tgRequest("answerCallbackQuery", {
      callback_query_id: id,
      text,
      show_alert: showAlert,
    });
  } catch (err) {
    log("error", `Failed to answer callback query: ${err.message}`);
  }
}

async function editMessageText(chatId, messageId, text, replyMarkup = null) {
  try {
    await tgRequest("editMessageText", {
      chat_id: chatId,
      message_id: messageId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
      ...(replyMarkup !== null ? { reply_markup: replyMarkup } : {}),
    });
  } catch (err) {
    log("error", `Failed to edit message: ${err.message}`);
  }
}

async function sendMessage(chatId, text, replyMarkup = null) {
  try {
    return await tgRequest("sendMessage", {
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
      ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
    });
  } catch (err) {
    log("error", `Failed to send message: ${err.message}`);
    return null;
  }
}

function escapeHtml(text) {
  return String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Redis Helper (Native TCP Redis or Upstash REST fallback)
async function redis(command) {
  if (redisClient) {
    try {
      const [cmd, ...args] = command;
      return await redisClient.call(cmd, ...args);
    } catch (err) {
      log("error", `Redis command [${command[0]}] failed: ${err.message}`);
      return null;
    }
  }

  if (UPSTASH_URL && UPSTASH_TOKEN) {
    try {
      const res = await fetch(UPSTASH_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${UPSTASH_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(command),
        signal: AbortSignal.timeout(8_000),
      });
      if (!res.ok) return null;
      const body = await res.json();
      return body.result;
    } catch {
      return null;
    }
  }

  return null;
}

async function updateRedisStatus(accountId, status, txHash = null) {
  const raw = await redis(["HGET", WAITLIST_KEY, accountId]);
  if (!raw) return;
  try {
    const data = JSON.parse(raw);
    const updated = {
      ...data,
      status,
      ...(status === "distributed" ? { distributedAt: new Date().toISOString(), txHash } : {}),
    };
    await redis(["HSET", WAITLIST_KEY, accountId, JSON.stringify(updated)]);
  } catch {}
}

async function getPendingRequests() {
  const rawHash = await redis(["HGETALL", WAITLIST_KEY]);
  if (!rawHash) return [];
  const list = [];
  if (Array.isArray(rawHash)) {
    for (let i = 0; i < rawHash.length; i += 2) {
      const accountId = rawHash[i];
      const rawVal = rawHash[i + 1];
      try {
        const parsed = JSON.parse(rawVal);
        if (parsed.status === "pending") {
          list.push({ accountId, ...parsed });
        }
      } catch {}
    }
  } else if (typeof rawHash === "object") {
    for (const [accountId, rawVal] of Object.entries(rawHash)) {
      try {
        const parsed = JSON.parse(rawVal);
        if (parsed.status === "pending") {
          list.push({ accountId, ...parsed });
        }
      } catch {}
    }
  }
  return list;
}

// Blockchain Execution
async function executeDistribution(recipient, amountTokens = DEFAULT_DISTRIBUTION_AMOUNT) {
  if (!distributorAccount) {
    throw new Error("Distributor private key is not configured. Set DISTRIBUTOR_PRIVATE_KEY in .env");
  }

  log("info", `Preflight check for ${recipient}...`);

  // 1. Check if recipient account exists
  await provider.callFunction({
    contractId: CONTRACT_ID,
    method: "get_rules",
    args: {},
  });

  // 2. Check storage registration
  const storage = await provider.callFunction({
    contractId: CONTRACT_ID,
    method: "storage_balance_of",
    args: { account_id: recipient },
  });

  if (!storage) {
    log("info", `Registering NEP-145 storage for ${recipient} (0.002 NEAR)...`);
    await distributorAccount.callFunctionRaw({
      contractId: CONTRACT_ID,
      methodName: "storage_deposit",
      args: {
        account_id: recipient,
        registration_only: true,
      },
      gas: teraToGas("50"),
      deposit: nearToYocto("0.002"),
    });
    log("info", `✓ Storage registered for ${recipient}`);
  }

  // 3. Execute ft_transfer
  const DECIMALS = 18n;
  const baseUnits = (BigInt(amountTokens) * (10n ** DECIMALS)).toString();

  log("info", `Transferring ${amountTokens} GEMBULL to ${recipient}...`);
  const transferOutcome = await distributorAccount.callFunctionRaw({
    contractId: CONTRACT_ID,
    methodName: "ft_transfer",
    args: {
      receiver_id: recipient,
      amount: baseUnits,
      memo: "GemBull Community Distribution",
    },
    gas: teraToGas("100"),
    deposit: "1", // 1 yoctoNEAR
  });

  const txHash = transferOutcome.transaction?.hash || transferOutcome.transaction_outcome?.id || "confirmed";
  log("info", `✓ Successfully distributed to ${recipient}! Tx Hash: ${txHash}`);
  return txHash;
}

async function getBalances() {
  try {
    const ftBalance = await provider.callFunction({
      contractId: CONTRACT_ID,
      method: "ft_balance_of",
      args: { account_id: DISTRIBUTOR_ACCOUNT_ID },
    });
    const tokens = (BigInt(ftBalance) / (10n ** 18n)).toLocaleString();
    return { ftTokens: tokens, rawFt: ftBalance };
  } catch (err) {
    return { ftTokens: "Error", rawFt: "0" };
  }
}

// Telegram Updates Handler
async function handleUpdate(update) {
  // 1. Handle Callback Query (Button clicks)
  if (update.callback_query) {
    const cq = update.callback_query;
    const fromId = String(cq.from?.id);
    const fromUser = cq.from?.username ? `@${cq.from.username}` : (cq.from?.first_name || fromId);
    const data = cq.data || "";
    const msg = cq.message;

    log("info", `[Button Click #${cq.id}] from ${fromId} (${fromUser}), data: "${data}"`);

    if (fromId !== ADMIN_CHAT_ID) {
      log("warn", `Unauthorized callback_query from ${fromId} (${fromUser}). Configured ADMIN_CHAT_ID: ${ADMIN_CHAT_ID}`);
      await answerCallbackQuery(cq.id, `⛔ Akses ditolak. User ID Anda (${fromId}) bukan Admin terdaftar.`, true);
      return;
    }

    if (data.startsWith("approve:")) {
      const recipient = data.slice("approve:".length).trim();
      log("info", `Admin ${fromUser} approving distribution for ${recipient}...`);

      // Instantly acknowledge Telegram so the button stops spinning
      await answerCallbackQuery(cq.id, `⏳ Sedang mendistribusikan 5,000 GEMBULL ke ${recipient}...`, false);

      // Indicate progress in chat
      if (msg) {
        await editMessageText(
          msg.chat.id,
          msg.message_id,
          `${msg.text}\n\n⏳ <i>Sedang mengirim transaksi ke NEAR Testnet...</i>`,
          { inline_keyboard: [[{ text: "⏳ Processing On-Chain...", callback_data: "noop" }]] }
        );
      }

      try {
        const txHash = await executeDistribution(recipient, DEFAULT_DISTRIBUTION_AMOUNT);
        await updateRedisStatus(recipient, "distributed", txHash);

        const currentText = msg?.text || "";
        const cleanText = currentText
          .replace(/⚡ Status:.*(\n|$)/g, "")
          .replace(/📋 Quick Distribute Command:[\s\S]*/g, "")
          .replace(/⏳ <i>Sedang mengirim[\s\S]*/g, "")
          .trim();

        const updatedText = [
          cleanText,
          "",
          `⚡ <b>Status:</b> ✅ <b>DISTRIBUTED (5,000 GEMBULL)</b>`,
          `🔗 <b>Explorer:</b> <a href="https://testnet.nearblocks.io/txns/${txHash}">View Transaction on NearBlocks</a>`,
          `🕒 <b>Approved At:</b> <code>${new Date().toISOString().replace("T", " ").substring(0, 19)} UTC</code>`,
          `👤 <i>Approved by Admin ${fromUser}</i>`,
        ].join("\n");

        if (msg) {
          await editMessageText(msg.chat.id, msg.message_id, updatedText, { inline_keyboard: [] });
        }
        await answerCallbackQuery(cq.id, `✅ Sukses! 5,000 GEMBULL terkirim ke ${recipient}`, true);
      } catch (err) {
        log("error", `Approval failed for ${recipient}: ${err.message}`);
        await answerCallbackQuery(cq.id, `❌ Gagal: ${err.message}`, true);
        if (msg) {
          await editMessageText(
            msg.chat.id,
            msg.message_id,
            `${msg.text}\n\n❌ <b>Distribusi Gagal:</b> <code>${escapeHtml(err.message)}</code>`,
            {
              inline_keyboard: [
                [
                  { text: "🔄 Retry Approve", callback_data: `approve:${recipient}` },
                  { text: "❌ Reject", callback_data: `reject:${recipient}` },
                ],
              ],
            }
          );
        }
      }
      return;
    }

    if (data.startsWith("reject:")) {
      const recipient = data.slice("reject:".length).trim();
      log("info", `Admin ${fromUser} rejected request for ${recipient}`);
      await answerCallbackQuery(cq.id, `Permohonan ${recipient} ditolak.`, false);
      await updateRedisStatus(recipient, "rejected");

      const currentText = msg?.text || "";
      const cleanText = currentText
        .replace(/⚡ Status:.*(\n|$)/g, "")
        .replace(/📋 Quick Distribute Command:[\s\S]*/g, "")
        .trim();

      const updatedText = [
        cleanText,
        "",
        `⚡ <b>Status:</b> ❌ <b>REJECTED</b>`,
        `🕒 <b>Rejected At:</b> <code>${new Date().toISOString().replace("T", " ").substring(0, 19)} UTC</code>`,
        `👤 <i>Rejected by Admin ${fromUser}</i>`,
      ].join("\n");

      if (msg) {
        await editMessageText(msg.chat.id, msg.message_id, updatedText, { inline_keyboard: [] });
      }
      return;
    }

    if (data === "noop") {
      await answerCallbackQuery(cq.id, "Sedang diproses di blockchain, mohon tunggu sebentar...", false);
      return;
    }
  }

  // 2. Handle Text Messages
  if (update.message && update.message.text) {
    const msg = update.message;
    const fromId = String(msg.from?.id);
    const text = msg.text.trim();

    if (fromId !== ADMIN_CHAT_ID) {
      await sendMessage(msg.chat.id, "⛔ <b>Akses Ditolak</b>\nBot ini hanya untuk Admin GemBull yang terverifikasi.");
      return;
    }

    if (text === "/start" || text === "/help") {
      const balances = await getBalances();
      const helpMsg = [
        `🐂 <b>GemBull Admin Distribution Control</b>`,
        ``,
        `Halo Admin! Bot ini berjalan 24/7 di server untuk memproses permohonan tester langsung dari Telegram.`,
        ``,
        `💰 <b>Distributor Balance:</b> <code>${balances.ftTokens} GEMBULL</code>`,
        `🔑 <b>Signer Account:</b> <code>${DISTRIBUTOR_ACCOUNT_ID}</code>`,
        `⚡ <b>Signer Status:</b> ${distributorAccount ? "🟢 Active & Ready" : "🔴 No Private Key Configured"}`,
        ``,
        `<b>Perintah yang tersedia:</b>`,
        `• /status — Cek saldo distributor & status RPC`,
        `• /queue — Lihat daftar pemohon yang menunggu persetujuan`,
        `• /approve_all — Setujui & kirim ke semua antrian pending`,
        `• <code>/distribute &lt;akun.testnet&gt; [jumlah]</code> — Kirim manual ke wallet tertentu`,
      ].join("\n");
      await sendMessage(msg.chat.id, helpMsg);
      return;
    }

    if (text === "/status") {
      const balances = await getBalances();
      const pendingList = await getPendingRequests();
      const statusMsg = [
        `📊 <b>GemBull System Status</b>`,
        ``,
        `• <b>Signer Account:</b> <code>${DISTRIBUTOR_ACCOUNT_ID}</code>`,
        `• <b>Signer Status:</b> ${distributorAccount ? "🟢 Active" : "🔴 Inactive (Need Key)"}`,
        `• <b>Contract ID:</b> <code>${CONTRACT_ID}</code>`,
        `• <b>GEMBULL Balance:</b> <code>${balances.ftTokens}</code>`,
        `• <b>Pending Requests:</b> <code>${pendingList.length}</code>`,
        `• <b>RPC Endpoint:</b> <code>${PRIMARY_RPC}</code>`,
      ].join("\n");
      await sendMessage(msg.chat.id, statusMsg);
      return;
    }

    if (text === "/queue") {
      const pendingList = await getPendingRequests();
      if (pendingList.length === 0) {
        await sendMessage(msg.chat.id, "✅ <b>Antrian Kosong</b>\nTidak ada permohonan pending saat ini.");
        return;
      }

      await sendMessage(msg.chat.id, `📋 <b>Daftar Antrian Pending (${pendingList.length}):</b>`);
      for (const item of pendingList.slice(0, 5)) {
        const card = [
          `👤 <b>NEAR Account:</b> <code>${escapeHtml(item.accountId)}</code>`,
          `💬 <b>Telegram:</b> ${escapeHtml(item.telegram || "—")}`,
          `🕒 <b>Requested:</b> <code>${new Date(item.joinedAt).toISOString().replace("T", " ").substring(0, 16)} UTC</code>`,
        ].join("\n");

        await sendMessage(msg.chat.id, card, {
          inline_keyboard: [
            [
              { text: "✅ Approve (5,000 GEMBULL)", callback_data: `approve:${item.accountId}` },
              { text: "❌ Reject", callback_data: `reject:${item.accountId}` },
            ],
          ],
        });
      }
      return;
    }

    if (text === "/approve_all") {
      const pendingList = await getPendingRequests();
      if (pendingList.length === 0) {
        await sendMessage(msg.chat.id, "Tidak ada permohonan pending.");
        return;
      }
      if (!distributorAccount) {
        await sendMessage(msg.chat.id, "❌ Gagal: Private key distributor belum disetel.");
        return;
      }

      await sendMessage(msg.chat.id, `⏳ Mulai mendistribusikan ke ${pendingList.length} akun pending...`);
      let success = 0;
      for (const item of pendingList) {
        try {
          const txHash = await executeDistribution(item.accountId, DEFAULT_DISTRIBUTION_AMOUNT);
          await updateRedisStatus(item.accountId, "distributed", txHash);
          success++;
        } catch (err) {
          log("error", `Failed batch distribute to ${item.accountId}: ${err.message}`);
        }
      }
      await sendMessage(msg.chat.id, `🎉 <b>Selesai!</b>\nBerhasil mendistribusikan ke ${success}/${pendingList.length} akun.`);
      return;
    }

    if (text.startsWith("/distribute")) {
      const parts = text.split(/\s+/);
      const recipient = parts[1];
      const amount = parts[2] || DEFAULT_DISTRIBUTION_AMOUNT;

      if (!recipient || !recipient.endsWith(".testnet")) {
        await sendMessage(msg.chat.id, "❌ Format salah. Contoh:\n<code>/distribute alice.testnet 5000</code>");
        return;
      }

      await sendMessage(msg.chat.id, `⏳ Sedang mendistribusikan ${amount} GEMBULL ke <code>${recipient}</code>...`);
      try {
        const txHash = await executeDistribution(recipient, amount);
        await updateRedisStatus(recipient, "distributed", txHash);
        await sendMessage(
          msg.chat.id,
          `✅ <b>Berhasil!</b>\n${amount} GEMBULL terkirim ke <code>${recipient}</code>.\nTx: <a href="https://testnet.nearblocks.io/txns/${txHash}">NearBlocks Explorer</a>`
        );
      } catch (err) {
        await sendMessage(msg.chat.id, `❌ Gagal mendistribusikan: ${err.message}`);
      }
      return;
    }
  }
}

// Built-in HTTP API Server for Webhook & Web API
function startHttpServer() {
  const port = Number(process.env.PORT || 4001);
  const server = http.createServer(async (req, res) => {
    // CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    const parsedUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    const pathname = parsedUrl.pathname;

    // Health / Status check
    if (pathname === "/health" || pathname === "/status") {
      const balances = await getBalances();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({
        ok: true,
        distributor: DISTRIBUTOR_ACCOUNT_ID,
        signerReady: Boolean(distributorAccount),
        balance: balances.ftTokens,
        redisReady: Boolean(redisClient && redisClient.status === "ready"),
      }));
      return;
    }

    // GET /api/waitlist?accountId=...
    if (pathname === "/api/waitlist" && req.method === "GET") {
      const accountId = parsedUrl.searchParams.get("accountId");
      if (!accountId) {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ available: true, joined: false, joinedAt: null }));
        return;
      }

      const raw = await redis(["HGET", WAITLIST_KEY, accountId]);
      if (!raw) {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ available: true, joined: false, joinedAt: null }));
        return;
      }

      try {
        const data = JSON.parse(raw);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({
          available: true,
          joined: true,
          joinedAt: data.joinedAt || new Date().toISOString(),
          status: data.status || "pending",
          telegram: data.telegram || null,
        }));
      } catch {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ available: true, joined: true, joinedAt: raw, status: "pending" }));
      }
      return;
    }

    // POST /api/waitlist
    if (pathname === "/api/waitlist" && req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => { body += chunk; });
      req.on("end", async () => {
        try {
          const input = JSON.parse(body || "{}");
          const { accountId, telegram, website } = input;
          if (website) {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ available: true, joined: false, joinedAt: null }));
            return;
          }
          if (!accountId || typeof accountId !== "string") {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Invalid accountId" }));
            return;
          }

          const joinedAt = new Date().toISOString();
          const record = {
            accountId,
            telegram: telegram || "",
            joinedAt,
            status: "pending",
          };

          // Save to Redis
          await redis(["HSET", WAITLIST_KEY, accountId, JSON.stringify(record)]);

          // Deliver notification to Telegram Admin
          const tgHandle = telegram ? (telegram.startsWith("@") ? telegram : `@${telegram}`) : "—";
          const dateFormatted = joinedAt.replace("T", " ").substring(0, 19) + " UTC";
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

          await sendMessage(ADMIN_CHAT_ID, message, {
            inline_keyboard: [
              [
                { text: "✅ Approve (5,000 GEMBULL)", callback_data: `approve:${accountId}` },
                { text: "❌ Reject", callback_data: `reject:${accountId}` },
              ],
            ],
          });

          res.writeHead(201, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ available: true, joined: true, joinedAt }));
        } catch (err) {
          log("error", `Failed to handle /api/waitlist: ${err.message}`);
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: err.message }));
        }
      });
      return;
    }

    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not Found" }));
  });

  server.listen(port, "0.0.0.0", () => {
    log("info", `GemBull HTTP API Server listening on port ${port}`);
  });
}

// Long Polling Loop
async function runBot() {
  log("info", "Starting GemBull Telegram Distribution Bot daemon...");
  log("info", `Admin Chat ID locked to: ${ADMIN_CHAT_ID}`);

  // Guarantee clean polling state and unbind any leftover webhook
  try {
    await tgRequest("deleteWebhook", { drop_pending_updates: false });
  } catch (err) {
    log("warn", `deleteWebhook notice: ${err.message}`);
  }

  const allowedUpdatesParam = encodeURIComponent(JSON.stringify(["message", "callback_query"]));
  let offset = 0;
  while (true) {
    try {
      const url = `https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=${offset}&timeout=25&allowed_updates=${allowedUpdatesParam}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(35_000) });
      if (!res.ok) {
        log("warn", `Telegram getUpdates returned HTTP ${res.status}`);
        await new Promise((r) => setTimeout(r, 4_000));
        continue;
      }
      const data = await res.json();
      if (data.ok && Array.isArray(data.result)) {
        for (const update of data.result) {
          offset = update.update_id + 1;
          log("info", `Update #${update.update_id} received: ${update.callback_query ? "callback_query" : update.message ? "message" : "other"}`);
          await handleUpdate(update).catch((err) => {
            log("error", `Error handling update ${update.update_id}:`, err.message);
          });
        }
      }
    } catch (err) {
      if (err.name !== "TimeoutError") {
        log("error", "Polling loop error:", err.message);
      }
      await new Promise((r) => setTimeout(r, 2_000));
    }
  }
}

startHttpServer();
runBot().catch((err) => {
  console.error("Fatal Daemon Error:", err);
  process.exit(1);
});
