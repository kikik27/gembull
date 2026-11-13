# GemBull roadmap and release gates

This is an engineering checklist for the NEAR Hackathon `memecoins` track, not a token price or launch promise. The daily ritual is the critical path. Status is as of 2026-11-12.

| Phase | Outcome | Status | Acceptance gate |
|---|---|---|---|
| Core source | NEP-141/145/148 GemBull contract with sequential epochs, reward reservation, claims, and treasury burns | `cargo fmt --check`, `cargo near check`, 20 unit tests, Wasm build, and one Linux Sandbox integration test pass | Complete for current source; re-run after source changes |
| Simulation | Deterministic optimistic/base/pessimistic 60-day supply model | Complete; 180-row CSV regenerated and checked | `python scripts/simulate_60_days.py --check` passes |
| Web app | Rules, wallet actions, progress, streaks, supply, and history | [Production landing](https://gembull-testnet.vercel.app) connected to `gembull-core.testnet`; build and public page pass | Live wallet flow verified |
| GemBull Testnet | `ft_metadata() = GemBull / GEMBULL` | [Deployed and verified](deployments/GEMBULL_TESTNET.md); one FullAccess upgrade key remains | Account, transaction, code hash, allocations, authority, and live views recorded |
| Demo distribution and evidence | Fund registered tester wallets; duplicate rejection, success claim, missed-epoch burn and video | One live check-in observed at finality on 2026-11-13; remaining evidence pending | [Distribution route](DISTRIBUTION_PLAN.md), replayable instructions and video; Sandbox covers time travel |
| Stock simulator | Separate two-source mock reserve and activity-point allocation records; no receipt token in MVP | Planned | Source-separated accounting, eligibility tests, and persistent `SIMULATED` disclosure |
| Community stock vote | Separate Testnet contract for community nomination, wallet-signed votes and permissionless finalization; public simulated recipient ledger | Proposed, not deployed | Voting rules reviewed; no admin winner override or upgrade backdoor; Sandbox vote tests and on-chain UI evidence |
| Routed purchase fee, LP lock, real custody | Optional future integrations | Not implemented | No claims until real integration, tests, and legal/operational review |

## Critical path before submission

1. Register/fund more eligible test accounts and capture a wallet-to-confirmation demo; one live check-in is already visible in contract views. Use Sandbox for success and missed-epoch time travel where a 24-hour live wait is impractical.
2. Verify the web app displays live rules, treasury, supply, and epoch progress from `gembull-core.testnet`; keep simulated stock values separate.
3. Re-run the README from a clean checkout and document the live wallet demo links.
4. Re-read the [live hackathon instructions](https://nearhackathon.com/HACKATHON.md). The human reviews repository visibility, publishes the X demo post, and approves the one-time submission payload.

## Scope controls

- Preserve all tokenomics constants in [TOKENOMICS.md](TOKENOMICS.md); the rebrand changes name and ticker, not supply rules.
- The backend remains read-only for ritual truth.
- The stock reserve and Ritual Points are planned simulations; no stock receipt token is planned for the revised MVP. See [product model](PRODUCT_MODEL.md) and [open decisions](OPEN_DECISIONS.md).
- The deployed contract's one FullAccess key can upgrade bytecode; do not call it fully immutable. The separate RITL account remains historical evidence.
