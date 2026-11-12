# GemBull integration audit — 13 November 2026

Scope: current Testnet contract, public landing, wallet and RPC wiring, distribution script, ritual actions, brand assets, and simulated stock presentation. All blockchain checks below are read-only at finality. No transfer, check-in, settlement, claim, or deployment transaction was sent during this audit.

| Integration | Evidence | Status / limit |
|---|---|---|
| Testnet contract | `pnpm verify:testnet` passed metadata, fixed rules, supply, code hash and upgrade-key checks | Live at `gembull-core.testnet`; one FullAccess key still permits code upgrades |
| Ritual read path | RPC returned `get_global_state`, `get_epoch(0)`, participant `get_account_epoch_status`, `ft_balance_of`, `storage_balance_of`, and `storage_balance_bounds` | One day-0 check-in observed at finality; count 1/50; successful-epoch claim and missed-day burn not yet observed live |
| Web RPC access | Fastnear Testnet RPC CORS preflight from the hosted site origin returned HTTP 200, `Access-Control-Allow-Origin: *` | Browser read path permitted; contract views use finality and Zod response validation |
| Wallet write path | NearProvider configured for Testnet; check-in, settlement and claim use wallet signatures | A live account check-in exists on chain. This audit did not operate a wallet or reproduce every return flow in a browser |
| Transaction return | URL hash now triggers RPC `tx` lookup with `wait_until: FINAL`; signer, contract, allowed method and all receipt outcomes are checked before a success toast | Source and build verified; a fresh wallet redirect should still be recorded as end-to-end evidence |
| Testnet distribution | `pnpm distribute:testnet <registered-account> 5000 --dry-run` passed receiver existence/storage and source balance checks | Read-only preflight passed; actual signed transfer was not run in this audit |
| Web build and assets | TypeScript, ESLint, production build, local HTTP page and both new PNG URLs passed; both PNGs have RGBA transparency, and both asset manifests resolve all listed files | Hosted gallery appeared after push; all four public sticker URLs and the OG image returned HTTP 200 with bytes matching the repo |
| Supply simulation | `python scripts/simulate_60_days.py --check` verified 180 rows | Scenario model only; not actual adoption or trading |
| Stock and purchase layer | UI labels stock reserve as simulation; no DEX pool, in-app buy route, stock vault, points ledger, or real custody was found in the active app | Planned; do not present it as live integration |

`cargo test --lib` passed **20/20** contract unit tests in this audit. The existing Linux Sandbox integration test passed before this audit; it was not rerun because the contract source was unchanged. Wallet-signed success/failure, a 50-account epoch, claim and burn remain the material live demo gaps. The [Testnet user guide](TESTNET_USER_GUIDE.md) and [distribution plan](DISTRIBUTION_PLAN.md) describe the current path.
