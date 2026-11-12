# GemBull roadmap and release gates

This is an engineering checklist for the NEAR Hackathon `memecoins` track, not a token price or launch promise. The daily ritual is the critical path. Status is as of 2026-11-12.

| Phase | Outcome | Status | Acceptance gate |
|---|---|---|---|
| Core source | NEP-141/145/148 GemBull contract with sequential epochs, reward reservation, claims, and treasury burns | `cargo fmt --check`, `cargo near check`, 20 unit tests, Wasm build, and one Linux Sandbox integration test pass | Complete for current source; re-run after source changes |
| Simulation | Deterministic optimistic/base/pessimistic 60-day supply model | Complete; 180-row CSV regenerated and checked | `python scripts/simulate_60_days.py --check` passes |
| Web app | Rules, wallet actions, progress, streaks, supply, and history | Connected to `gembull-core.testnet`; read-only views verified at finality | Typecheck/lint/build pass and live wallet flow verified |
| GemBull Testnet | `ft_metadata() = GemBull / GEMBULL` | [Deployed and verified](deployments/GEMBULL_TESTNET.md); one FullAccess upgrade key remains | Account, transaction, code hash, allocations, authority, and live views recorded |
| Demo evidence | Real wallet check-in, duplicate rejection, success claim, missed-epoch burn | Pending | Replayable instructions and video; Sandbox covers time travel |
| Stock simulator | Separate mock vault, broker, issuer, and `rNVDA` receipt | Planned | Sandbox cross-contract/failure tests; every display says `SIMULATED` |
| Routed purchase fee, LP lock, real custody | Optional future integrations | Not implemented | No claims until real integration, tests, and legal/operational review |

## Critical path before submission

1. Register/fund eligible test accounts, record a real check-in, and capture a wallet-to-confirmation demo. Use Sandbox for success and missed-epoch time travel where a 24-hour live wait is impractical.
2. Verify the web app displays live rules, treasury, supply, and epoch progress from `gembull-core.testnet`; keep simulated stock values separate.
3. Host the UI, re-run the README from a clean checkout, and document the exact demo links.
4. Re-read the [live hackathon instructions](https://nearhackathon.com/HACKATHON.md). The human reviews repository visibility, publishes the X demo post, and approves the one-time submission payload.

## Scope controls

- Preserve all tokenomics constants in [TOKENOMICS.md](TOKENOMICS.md); the rebrand changes name and ticker, not supply rules.
- The backend remains read-only for ritual truth.
- The stock reserve is separate and simulated. `rNVDA` confers no stock rights.
- The deployed contract's one FullAccess key can upgrade bytecode; do not call it fully immutable. The separate RITL account remains historical evidence.
