# Ringkasan Proyek — StonkRitual

## Identitas

- **Nama proyek (working name):** StonkRitual
- **Ticker meme token:** `$RITL`
- **Ticker receipt simulasi:** `rNVDA` (hanya untuk testnet/demo)
- **Tagline:** *The meme runs on rituals. The rituals move the treasury.*
- **Track utama:** NEAR Hackathon — `memecoins` / Memecoins With Mechanics

Nama dan ticker masih provisional. Belum dianggap lolos pemeriksaan merek dagang, domain, akun sosial, atau benturan simbol token.

## Konsep dalam satu kalimat

StonkRitual adalah memecoin native NEAR yang supply-nya merespons partisipasi komunitas melalui ritual check-in harian; keberhasilan komunitas menghasilkan mint reward, kegagalan membakar sebagian ritual treasury dan mereset streak, sementara lapisan terpisah mengakumulasi dana untuk simulasi pembelian saham.

## Dua lapisan produk

### 1. RITL — community meme token

RITL adalah token komunitas. Memegang RITL **tidak otomatis memberikan kepemilikan saham**. Nilai utamanya adalah mekanisme ritual, streak, dan treasury.

### 2. Stock acquisition reserve — lapisan RWA terpisah

Sebagian pembelian yang melewati router aplikasi direncanakan masuk ke stock acquisition vault. Untuk hackathon, seluruh pembelian dan receipt NVIDIA hanya simulasi. `rNVDA` bukan saham, bukan sekuritas yang diterbitkan secara sah, dan tidak memiliki hak dividen, redemption, atau beneficial ownership.

## Mekanisme inti yang diusulkan

| Parameter | Nilai awal |
|---|---:|
| Durasi epoch | 24 jam |
| Target harian | 50 akun NEAR |
| Minimum saldo saat check-in | 1.000 RITL |
| Batas peserta/epoch | 200 akun |
| Reward per peserta jika sukses | 1.000 RITL |
| Burn jika target gagal | 5 bps (0,05%) dari sisa ritual treasury |
| Initial supply | 1.000.000.000 RITL |
| Maximum supply | 1.050.000.000 RITL |
| Ritual treasury awal | 150.000.000 RITL |

Semua parameter ini harus dibaca dari smart contract dan tidak memiliki fungsi setter setelah initialization.

## Mengapa sesuai dengan Track 11

Track 11 meminta token yang memiliki mekanisme nyata: supply merespons komunitas, treasury dengan aturan, ritual/challenge on-chain, parameter immutable, sybil resistance yang dijelaskan, halaman progres/streak, log mint/burn, dan simulasi 60 hari. Karena itu, ritual menjadi P0 dan stock-reserve menjadi fitur sekunder.

## Hasil simulasi 60 hari

| Skenario | Hari sukses | Hari gagal | Total mint | Total burn | Perubahan supply |
|---|---:|---:|---:|---:|---:|
| Optimistis | 45 | 15 | 3.150.000 | 1.121.071,018467189839568491 | +2.028.928,981532810160431509 |
| Base | 36 | 24 | 2.160.000 | 1.789.687,850580172445785057 | +370.312,149419827554214943 |
| Pesimistis | 18 | 42 | 990.000 | 3.117.926,704631492985262709 | -2.127.926,704631492985262709 |

Model mengasumsikan 100% reward yang berhak diklaim benar-benar diklaim. Angka bukan forecast adopsi, harga, atau keuntungan.

## Prioritas pengerjaan

1. RITL NEP-141 + ritual smart contract + tests.
2. Script simulasi 60 hari dan CSV.
3. Dashboard ritual: progress, current streak, longest streak, supply, treasury, event history.
4. Stock vault + mockUSDC + mock broker + receipt `rNVDA`.
5. Routed purchase fee, buyback execution, dan LP locking setelah core stabil.

## Dokumen utama

- `BRD.md` — kebutuhan bisnis dan ruang lingkup.
- `PRD.md` — kebutuhan produk dan acceptance criteria.
- `TOKENOMICS.md` — distribusi supply, konstanta ritual, dan simulasi.
- `TECHNICAL_ARCHITECTURE.md` — komponen dan alur sistem.
- `SMART_CONTRACT_SPEC.md` — spesifikasi kontrak dan invariants.
- `API_AND_DATA_SPEC.md` — interface read/write, event, dan API simulasi.
- `SECURITY_AND_RISK.md` — threat model, sybil, immutability, dan batas RWA.
- `TEST_PLAN.md` — test matrix dan release gate.
- `EXECUTION_PLAN.md` — urutan implementasi untuk Codex.
