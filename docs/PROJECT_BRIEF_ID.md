# Ringkasan Proyek — GemBull

## Identitas

- **Nama proyek (working name):** GemBull
- **Ticker meme token:** `$GEMBULL`
- **Reward saham MVP:** Ritual Points dan catatan alokasi **SIMULATED** yang direncanakan; tanpa token receipt saham
- **Tagline:** *The meme runs on rituals. The rituals move the treasury.*
- **Track utama:** NEAR Hackathon — `memecoins` / Memecoins With Mechanics

GemBull / GEMBULL sudah terdeploy di NEAR Testnet; pemeriksaan merek dagang, domain, akun sosial, dan benturan simbol token tetap belum selesai.

## Konsep dalam satu kalimat

GemBull adalah memecoin native NEAR yang supply-nya merespons partisipasi komunitas melalui ritual check-in harian; keberhasilan komunitas menghasilkan mint reward, kegagalan membakar sebagian ritual treasury dan mereset streak, sementara lapisan terpisah mengakumulasi dana untuk simulasi pembelian saham.

## Dua lapisan produk

### 1. GEMBULL — community meme token

GEMBULL adalah token komunitas. Memegang GEMBULL **tidak otomatis memberikan kepemilikan saham**. Nilai utamanya adalah mekanisme ritual, streak, dan treasury.

### 2. Stock acquisition reserve — lapisan RWA terpisah

Dua sumber pendanaan yang diusulkan untuk treasury saham terpisah adalah fee perdagangan yang melewati router aplikasi dan sebagian **surplus bersih** saat bonding graduation, setelah kewajiban refund, likuiditas, biaya, dan cadangan terlindungi. Keduanya belum diimplementasikan. Reward holder aktif di MVP nantinya berupa Ritual Points non-transferable dan catatan alokasi **SIMULATED**, bukan token saham atau receipt. Tidak ada hak dividen, redemption, atau beneficial ownership.

## Mekanisme inti yang sudah terdeploy di Testnet

| Parameter | Nilai awal |
|---|---:|
| Durasi epoch | 24 jam |
| Target harian | 50 akun NEAR |
| Minimum saldo saat check-in | 1.000 GEMBULL |
| Batas peserta/epoch | 200 akun |
| Reward per peserta jika sukses | 1.000 GEMBULL |
| Burn jika target gagal | 5 bps (0,05%) dari sisa ritual treasury |
| Initial supply | 1.000.000.000 GEMBULL |
| Maximum supply | 1.050.000.000 GEMBULL |
| Ritual treasury awal | 150.000.000 GEMBULL |

Semua parameter ini dibaca dari smart contract dan tidak memiliki fungsi setter setelah initialization. Akun kontrak masih memiliki FullAccess key sehingga kode tetap dapat di-upgrade.

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

1. GEMBULL NEP-141 + ritual smart contract + tests.
2. Script simulasi 60 hari dan CSV.
3. Dashboard ritual: progress, current streak, longest streak, supply, treasury, event history.
4. Simulasi treasury saham dua sumber + Ritual Points dan alokasi holder aktif; belum dibangun.
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
- `ROADMAP.md` — status, urutan implementasi, dan gerbang rilis.
