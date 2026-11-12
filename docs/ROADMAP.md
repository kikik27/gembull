# GemBull roadmap and release gates

This is an engineering checklist for the NEAR Hackathon `memecoins` track, not a token price or launch promise. The daily ritual is the critical path. Status is as of 2026-11-12.

| Phase | Outcome | Status | Acceptance gate |
|---|---|---|---|
| Core source | NEP-141/145/148 GemBull contract with sequential epochs, reward reservation, claims, and treasury burns | Implemented in source; renamed Rust tests not rerun in this environment | `cargo fmt --check`, `cargo near check`, unit tests, Wasm build, and Sandbox pass |
| Simulation | Deterministic optimistic/base/pessimistic 60-day supply model | Complete; 180-row CSV regenerated and checked | `python scripts/simulate_60_days.py --check` passes |
| Web preview | Rules, wallet actions, progress, streaks, supply, and history | Local typecheck, lint, and production build pass; no new GemBull contract connected | Connect reviewed Testnet contract and verify live wallet flows |
| GemBull Testnet | New deployment with `ft_metadata() = GemBull / GEMBULL` | Pending | Record account, transaction, code hash, allocation, upgrade authority, and live views |
| Demo evidence | Real wallet check-in, duplicate rejection, success claim, missed-epoch burn | Pending | Replayable instructions and video; Sandbox covers time travel |
| Stock simulator | Separate mock vault, broker, issuer, and `rNVDA` receipt | Planned | Sandbox cross-contract/failure tests; every display says `SIMULATED` |
| Routed purchase fee, LP lock, real custody | Optional future integrations | Not implemented | No claims until real integration, tests, and legal/operational review |

## Critical path before submission

1. Run the renamed `gembull-core` test suite and inspect the Wasm artifact. Resolve any differences between source and deployed behavior.
2. Create a reviewed new Testnet account and deploy the GemBull Wasm. The old `ritl-stonkritual.testnet` contract stays a historical RITL deployment; source changes do not rename it.
3. Set `NEXT_PUBLIC_GEMBULL_CONTRACT_ID` to the new account. Verify `ft_metadata()`, `get_rules()`, supply, treasury, and event namespace before using the UI for the demo.
4. Register/fund test accounts, record a real check-in, and capture a wallet-to-confirmation demo. Use Sandbox for success and missed-epoch time travel where a 24-hour live wait is impractical.
5. Host the UI, re-run the README from a clean checkout, and document the exact deployment and demo links.
6. Re-read the [live hackathon instructions](https://nearhackathon.com/HACKATHON.md). The human reviews repository visibility, publishes the X demo post, and approves the one-time submission payload.

## Scope controls

- Preserve all tokenomics constants in [TOKENOMICS.md](TOKENOMICS.md); the rebrand changes name and ticker, not supply rules.
- The backend remains read-only for ritual truth.
- The stock reserve is separate and simulated. `rNVDA` confers no stock rights.
- Do not claim immutable bytecode until upgrade authority is verified, or live GemBull status before a new deployment is recorded.
