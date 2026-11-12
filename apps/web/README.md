# StonkRitual Ritual UI

Next.js 16 App Router dashboard for the RITL daily ritual on NEAR Testnet. It reads `get_rules`, `get_global_state`, `get_epoch`, account status, token balance, and storage status directly from the RITL contract. Check-in, settlement, registration, and claims are wallet-signed contract calls.

Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_RITL_CONTRACT_ID` to a real, reviewed Testnet deployment account. An empty value renders a local preview with no fabricated on-chain figures. Do not put keys or secrets in this variable or any public Next.js environment variable.

```sh
pnpm install
pnpm exec tsc --noEmit
pnpm lint
pnpm build
pnpm dev
```

The UI labels epoch history as contract view data. Mint/burn event receipts and transaction hashes require a read-only event indexer or the linked explorer; the UI does not invent them. The stock concept is labeled **SIMULATED — NO REAL EQUITY OWNERSHIP** and has no live broker integration.

Ritual actions currently attach 0.05 Testnet NEAR to cover contract storage; excess remains on the contract account. Review this cost model before Testnet deployment.
