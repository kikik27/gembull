# StonkRitual

![StonkRitual logo](apps/web/public/brand/stonkritual-primary-logo.svg)

**Working name:** StonkRitual  
**Meme token:** `RITL`  
**Stock receipt demo token:** `rNVDA` (simulated only; not an equity or legal claim)  
**Tagline:** *The meme runs on rituals. The rituals move the treasury.*  
**NEAR Hackathon track:** `memecoins` — Memecoins With Mechanics

> Status: RITL core deployed on NEAR **Testnet**. The name/ticker remain provisional until the team completes name, domain, trademark, and on-chain symbol checks.

## Local development status

The `ritl-core` Rust contract is deployed at `ritl-stonkritual.testnet`. Deployment and initialization succeeded in [transaction DFKKGqRvQKzuhLRAoj4VYpEWjWZhSUBkDj2KSCnpAg8P](https://explorer.testnet.near.org/transactions/DFKKGqRvQKzuhLRAoj4VYpEWjWZhSUBkDj2KSCnpAg8P). See the [Testnet deployment record](docs/deployments/RITL_TESTNET.md) for accounts, allocation, code hash, verification, and upgrade authority. The stock reserve and `rNVDA` remain **PLANNED / SIMULATED**; there is no hosted UI or mainnet contract.

From `contracts/ritl-core`, use current stable Rust with the Wasm target and cargo-near:

```bash
cargo fmt --check
cargo near check
cargo test --lib
cargo near build non-reproducible-wasm --no-abi
cargo test --test ritual_sandbox
```

The Sandbox runner needs Linux or macOS. On Windows, run the last command in WSL with a Linux Rust toolchain; the contract unit tests and Wasm build also work with the Windows toolchain. The integration test advances 24-hour epochs by patching its local Sandbox state; the helper is excluded from production Wasm.
The Testnet Wasm uses a non-reproducible host build. Its local SHA-256 and on-chain code hash were verified after deployment; a reproducible release build remains pending.

From the repository root, regenerate and verify the deterministic simulation:

```bash
python scripts/simulate_60_days.py
python scripts/simulate_60_days.py --check
```

The simulator uses integer `10^18` base units, floors burns at the base-unit boundary, and assumes every eligible successful-epoch reward is claimed. Its CSV expresses token amounts as exact decimal RITL strings. The 60-day final supplies are 1,002,028,928.981532810160431509 (optimistic), 1,000,370,312.149419827554214943 (base), and 997,872,073.295368507014737291 (pessimistic).

Run the web app directly from the repository root:

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`. Root scripts also provide `pnpm build`, `pnpm lint`, `pnpm typecheck`, and `pnpm check:sim`. The local, git-ignored `apps/web/.env.local` points at `ritl-stonkritual.testnet`, so contract views load from Testnet. Copy `apps/web/.env.example` when configuring another machine. `NEXT_PUBLIC_NEAR_RPC_URL` selects the Testnet JSON-RPC endpoint; `NEXT_PUBLIC_SITE_URL` is optional for public Open Graph imagery. The stock concept remains **SIMULATED — NO REAL EQUITY OWNERSHIP**.

The web app uses the approved [brand guidance](docs/brand/BRAND_GUIDE.md) and [design system](docs/design-system/DESIGN_SYSTEM.md). Components are in `apps/web/src/components`, contract reads and Axios error handling in `services`, remote state in TanStack Query hooks, transient interface state in Zustand, validation in Zod schemas, and shared values in `constants` and `lib`. The epoch history uses TanStack Table and a React Hook Form input. Motion powers transitions and Three.js draws an optional decorative ritual orbit. No brand image or animation is required to understand the contract rules.

Each NEAR account can check in once per epoch if it holds at least 1,000 RITL, but this is account-level friction only. One person can control multiple accounts; the demo does not provide proof of personhood or Sybil resistance beyond these limits.

## What it is

StonkRitual is a NEAR-native memecoin whose supply responds to a daily community ritual. Holders check in once per epoch. If the community reaches the immutable daily target, each eligible participant becomes entitled to a small token mint. If the target is missed, a fixed percentage of the ritual treasury is burned and the streak resets.

A separate stock-accumulation layer routes a portion of eligible in-app purchase volume into a segregated stablecoin reserve. A simulated broker/custodian flow demonstrates batch execution and a separate receipt token. The receipt token in the hackathon build is **simulation-only** and does not represent real NVIDIA shares, legal ownership, dividends, or redemption rights.

## Core mechanic

| Rule | Genesis parameter |
|---|---:|
| Epoch duration | 24 hours |
| Daily check-in target | 50 unique NEAR accounts |
| Minimum RITL balance at check-in | 1,000 RITL |
| Check-in limit | 1 per account per epoch |
| Maximum accepted participants per epoch | 200 accounts |
| Reward after a successful epoch | 1,000 RITL per eligible participant |
| Missed-epoch burn | 5 bps (0.05%) of the remaining ritual treasury balance |
| Initial supply | 1,000,000,000 RITL |
| Maximum supply | 1,050,000,000 RITL |
| Longest streak | Lifetime high-water mark; never decreases |

The contract contains the rules. A backend may index and display data, but it cannot create check-ins, settle epochs, change parameters, mint rewards, or burn treasury tokens on the contract's behalf.

Rewards are claimed individually after an epoch is finalized. This avoids an unbounded loop over all participants in a single transaction and lets each holder pay their own gas. A successful epoch creates claim entitlements; it does not automatically mint to every wallet in one transaction.

## Stock accumulation layer

The planned production mechanic allocates **1.00% of purchases routed through the StonkRitual application** to a segregated stock acquisition vault. Direct transfers and trades on external DEX routes do not automatically pay this fee. The hackathon prototype uses a mock stablecoin, simulated broker execution, and a clearly labeled simulated receipt token.

Receipt issuance is gated by a batch state machine and a trusted mock issuer account. No `rNVDA` receipt may be minted before a batch has a successful simulated execution attestation. The prototype must never present mock data as actual stock ownership.

## Track alignment

The primary track is `memecoins`. The project is built around on-chain supply mechanics, daily rituals, immutable launch parameters, treasury burns, a visible streak, and a reproducible 60-day supply simulation. Do not claim the `defi` track unless a real cross-chain NEAR Intents settlement integration is implemented and demonstrated.

## Repository layout (current P0)

```text
.
├── AGENTS.md
├── CODEX.md
├── README.md
├── LICENSE
├── docs/
│   ├── BRD.md
│   ├── PRODUCT_NAMING.md
│   ├── PROJECT_BRIEF_ID.md
│   ├── PRD.md
│   ├── TOKENOMICS.md
│   ├── TECHNICAL_ARCHITECTURE.md
│   ├── SMART_CONTRACT_SPEC.md
│   ├── API_AND_DATA_SPEC.md
│   ├── UX_SPEC.md
│   ├── SECURITY_AND_RISK.md
│   ├── TEST_PLAN.md
│   ├── EXECUTION_PLAN.md
│   ├── DECISION_LOG.md
│   ├── HACKATHON_ALIGNMENT.md
│   └── simulation/
│       ├── 60_DAY_SIMULATION.md
│       └── ritl-60-day-simulation.csv
├── contracts/
│   └── ritl-core/
├── apps/
│   └── web/
└── scripts/
    └── simulate_60_days.py
```

The stock simulation components remain planned until the core Sandbox gate passes.

## Recommended implementation order

1. Implement and test `ritl-core`: NEP-141 plus the complete ritual state machine.
2. Implement the 60-day simulator and reconcile its output against contract rules.
3. Build the ritual dashboard against contract view methods and emitted events.
4. Add the test-only stock vault, mock stablecoin, simulated broker, and simulated receipt token.
5. Add the routed purchase fee only after the core path is stable; do not make the track-critical ritual depend on the backend.

## Judge walkthrough (target acceptance path)

The RITL contract ID and deployment transaction are recorded above. The following end-to-end walkthrough still needs live Testnet participant activity and a hosted app; Sandbox covers time-travel outcomes locally.

1. Open the hosted app and connect a NEAR Testnet wallet.
2. Register storage for RITL and obtain test tokens from the documented faucet/distribution path.
3. Open the Ritual page and check in once for the current epoch.
4. Verify the on-chain check-in count increases and a second check-in from the same account is rejected.
5. Use the local Sandbox time-travel script to simulate the end of an epoch and call the permissionless `finalize_day` method.
6. For a successful epoch, claim the reward and verify the `nep141:ft_mint` event and total-supply change.
7. For a missed epoch, verify the ritual treasury balance and total supply decrease, and the current streak resets.
8. Open the history page and inspect mint, burn, streak, and stock-reserve events.
9. Run the 60-day simulator and compare its CSV output with the documented scenarios.

## Development status labels

The UI and docs must distinguish these states:

- `ON-CHAIN`: persisted and enforced by the NEAR contract.
- `SIMULATED`: generated by the mock broker/issuer for demonstration only.
- `OFF-CHAIN DATA`: external market quote or indexer data; not a custody proof.
- `PLANNED`: not implemented in the current repository.

## Safety and disclosure

- RITL is a meme/community token, not an equity claim.
- `rNVDA` in the hackathon prototype is simulated and is not a security, share, depositary receipt, dividend right, or redeemable claim.
- A stock price feed is not proof of ownership. Real stock acquisition requires an eligible broker/custodian, issuer documentation, investor eligibility controls, and legal review.
- No real funds or mainnet deployment are required for the hackathon MVP.

## Official references

- Track 11 prompt: <https://github.com/nearai/near-hackathon-prompt-examples/blob/main/tracks/11-memecoins.md>
- Live hackathon agent instructions: <https://nearhackathon.com/HACKATHON.md>
- NEP-141: <https://github.com/near/NEPs/blob/master/neps/nep-0141.md>
- NEP-145: <https://github.com/near/NEPs/blob/master/neps/nep-0145.md>
- NEP-148: <https://github.com/near/NEPs/blob/master/neps/nep-0148.md>
- NEAR smart-contract agent skill: <https://github.com/near/agent-skills/tree/main/skills/near-smart-contracts>
- Meme.Cooking docs: <https://docs.meme.cooking/>

Before submission, re-read the live `HACKATHON.md`. The project must be publicly reproducible, the X demo post must be published by the human, and a single submission must be sent only after the human reviews and approves the complete payload.

