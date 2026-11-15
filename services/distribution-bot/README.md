# GemBull Telegram Distribution Bot

Layanan bot otomatis yang berjalan di server / VPS secara non-stop (24/7). Bot ini memungkinkan Admin mengelola dan menyetujui distribusi token GEMBULL testnet langsung dari aplikasi Telegram di HP tanpa perlu membuka terminal atau menjalankan command CLI sama sekali!

---

## Fitur Utama

1. **One-Tap Approval via Telegram**:
   Setiap ada tester yang mendaftar di web, bot mengirim alert ke Telegram Admin lengkap dengan tombol:
   `[ ✅ Approve (5,000 GEMBULL) ]` dan `[ ❌ Reject ]`.
2. **Otomatisasi Blockchain Penuh**:
   Saat tombol *Approve* ditekan di Telegram:
   - Bot otomatis memeriksa apakah wallet penerima sudah mendaftar storage (NEP-145).
   - Jika belum, bot otomatis membayarkan storage deposit (0.002 NEAR).
   - Bot mentransfer 5,000 GEMBULL ke wallet tester.
   - Pesan Telegram otomatis diperbarui dengan tautan transaksi NearBlocks Explorer!
3. **Sinkronisasi Redis**:
   Status permohonan di web otomatis berubah menjadi `DISTRIBUTED`.
4. **Perintah Telegram Langsung**:
   - `/status` — Cek saldo distributor & status RPC
   - `/queue` — Lihat antrian pemohon yang pending dengan tombol approve
   - `/approve_all` — Setujui & kirim ke semua antrian pending sekaligus
   - `/distribute <akun.testnet> [jumlah]` — Kirim token manual ke wallet tertentu

---

## Panduan Instalasi di VPS

### Opsi A: Menggunakan Docker Compose (Paling Praktis)

1. **Upload folder `services/distribution-bot` ke VPS Anda**:
   ```bash
   scp -r services/distribution-bot user@ip-vps-anda:/root/
   ```

2. **Masuk ke folder di VPS**:
   ```bash
   cd /root/distribution-bot
   ```

3. **Buat file `.env`**:
   ```bash
   cp .env.example .env
   nano .env
   ```
   Isi konfigurasi berikut:
   ```env
   TELEGRAM_BOT_TOKEN=9103656684:AAEDqspkF76bFwe4IrqQs4lQxJEu2ClMeR4
   TELEGRAM_ADMIN_CHAT_ID=1727200167

   DISTRIBUTOR_ACCOUNT_ID=gembull-public.testnet
   DISTRIBUTOR_PRIVATE_KEY=ed25519:masukkan_private_key_disini

   UPSTASH_REDIS_REST_URL=url_upstash_anda
   UPSTASH_REDIS_REST_TOKEN=token_upstash_anda
   ```

4. **Jalankan container**:
   ```bash
   docker compose up -d --build
   ```

5. **Cek log bot**:
   ```bash
   docker compose logs -f
   ```

---

### Opsi B: Menggunakan PM2 (Node.js)

1. **Pastikan Node.js 18+ & PM2 terpasang di VPS**:
   ```bash
   npm install -g pm2
   ```

2. **Masuk ke folder & install dependencies**:
   ```bash
   cd /root/distribution-bot
   npm install
   ```

3. **Buat file `.env`** (sesuai contoh di atas).

4. **Jalankan dengan PM2**:
   ```bash
   pm2 start bot.mjs --name gembull-distribution-bot
   pm2 save
   pm2 startup
   ```

5. **Cek status & log**:
   ```bash
   pm2 status
   pm2 logs gembull-distribution-bot
   ```

---

## Cara Menggunakan di Telegram

Setelah bot menyala di VPS:
1. Buka bot Anda di Telegram: [@GembullComunity_bot](https://t.me/GembullComunity_bot).
2. Ketik `/start` atau `/status` untuk mengecek saldo distributor.
3. Saat ada user yang mengisi form di website, pesan notifikasi masuk dengan tombol **`[ ✅ Approve ]`**.
4. Cukup klik **Approve**, bot di VPS akan mengeksekusi transaksi NEAR dan membalas dengan link bukti transfer!
