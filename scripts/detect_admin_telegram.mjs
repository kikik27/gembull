import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

// Load token from environment or apps/web/.env.local
const envPath = join(process.cwd(), "apps", "web", ".env.local");
let botToken = process.env.TELEGRAM_BOT_TOKEN;
if (!botToken && existsSync(envPath)) {
  const content = readFileSync(envPath, "utf-8");
  const match = content.match(/TELEGRAM_BOT_TOKEN=(.*)/);
  if (match) botToken = match[1].trim().replace(/^["']|["']$/g, "");
}

async function check() {
  console.log("Checking Telegram updates for @GembullComunity_bot...");
  const res = await fetch(`https://api.telegram.org/bot${botToken}/getUpdates`);
  const data = await res.json();
  if (!data.ok) {
    console.error("Telegram API Error:", data);
    return null;
  }

  if (data.result && data.result.length > 0) {
    const firstUpdate = data.result[0];
    const msg = firstUpdate.message || firstUpdate.channel_post || firstUpdate.my_chat_member;
    const chat = msg?.chat || firstUpdate.my_chat_member?.chat;
    const from = msg?.from || firstUpdate.my_chat_member?.from;

    const chatId = chat?.id || from?.id;
    const name = from?.first_name || from?.username || chat?.title || "Admin";

    if (chatId) {
      console.log(`\n🎉 Found Admin!`);
      console.log(`• Name: ${name}`);
      console.log(`• Username: @${from?.username || "—"}`);
      console.log(`• Chat ID: ${chatId}`);

      // Update .env.local
      let envContent = readFileSync(envPath, "utf-8");
      if (envContent.includes("TELEGRAM_ADMIN_CHAT_ID=")) {
        envContent = envContent.replace(/TELEGRAM_ADMIN_CHAT_ID=.*/, `TELEGRAM_ADMIN_CHAT_ID=${chatId}`);
      } else {
        envContent += `\nTELEGRAM_ADMIN_CHAT_ID=${chatId}\n`;
      }
      writeFileSync(envPath, envContent, "utf-8");
      console.log(`✓ Updated apps/web/.env.local with TELEGRAM_ADMIN_CHAT_ID=${chatId}`);

      // Send a confirmation greeting
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: `🎉 <b>Koneksi Berhasil!</b>\n\nHalo ${name}! Bot <b>GemBull-Comunity</b> sudah terhubung ke akun Anda.\n\nSetiap ada tester yang submit wallet & username Telegram di web, Anda akan menerima alert langsung di sini lengkap dengan command distribusinya!`,
          parse_mode: "HTML",
        }),
      });
      console.log(`✓ Sent confirmation test message to Admin on Telegram!`);
      return chatId;
    }
  }

  console.log("Belum ada chat masuk. Pastikan Anda sudah membuka https://t.me/GembullComunity_bot dan menekan tombol 'Start' atau kirim chat /start.");
  return null;
}

check().catch(console.error);
