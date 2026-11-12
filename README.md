# GemBull

GemBull is a NEAR-native community memecoin whose supply reacts to a daily on-chain ritual. An eligible account checks in once per 24-hour epoch. A successful community day creates individual reward claims; a missed day burns a fixed slice of the ritual treasury and resets the current streak. The rules live in the token contract, not a backend.

**Hackathon track:** `memecoins` — Memecoins With Mechanics. **Status:** GemBull contract source and local web preview are in this repository. A new **GemBull / GEMBULL Testnet deployment has not been recorded**. The earlier [`ritl-stonkritual.testnet` deployment](docs/deployments/RITL_TESTNET.md) is a legacy **StonkRitual / RITL** token; editing this repository does not rename it. The stock reserve is **PLANNED / SIMULATED** and represents no real shares, custody, redemption, or broker execution.

## Hackathon goal and evidence

The goal is to demonstrate a memecoin mechanic that a judge can reproduce and inspect on NEAR:

| Track expectation | Evidence in this repository | Current status |
|---|---|---|
| NEP-141 token with NEP-145 storage and NEP-148 metadata | [`gembull-core`](contracts/gembull-core/) | Source updated; new deployment pending |
| Daily check-in, target, streak, mint and burn enforced on-chain | Contract methods `check_in`, `finalize_day`, `claim_reward`; [spec](docs/SMART_CONTRACT_SPEC.md) | 20 Rust unit tests and one Linux Sandbox integration test pass; new Testnet deployment pending |
| Fixed public launch parameters and supply cap | `get_rules()`, no public setters, reward-capacity reservation | Implemented in source |
| Progress, rules, supply, and event history | [web app](apps/web/) | Local preview; live GemBull data pending deployment |
| 60-day supply simulation | [script](scripts/simulate_60_days.py) and [CSV](docs/simulation/gembull-60-day-simulation.csv) | 180 rows regenerated and checked |
| Judge walkthrough with live wallet actions | Testnet account, faucet/distribution, hosted demo, recorded transactions | Pending |

The [live hackathon instructions](https://nearhackathon.com/HACKATHON.md) require a public reproducible repository, a human-published X demo post, and one reviewed submission. Testnet-only projects are eligible. Publishing, posting, or submitting needs explicit human approval. The repo must be public by **2026-11-14 23:59 UTC** to enter judging.

## Ritual rules

These are source-code genesis parameters for a new deployment. The app reads actual values from `get_rules()` when a contract is configured.

| Rule | Value |
|---|---:|
| Epoch | 24 hours |
| Community target | 50 eligible NEAR accounts |
| Minimum balance at check-in | 1,000 GEMBULL |
| Accepted participants per epoch | 200 maximum |
| Reward after a successful finalized epoch | 1,000 GEMBULL per eligible claim |
| Burn after a missed epoch | 5 bps (0.05%) of the remaining ritual treasury |
| Genesis supply | 1,000,000,000 GEMBULL |
| Supply cap | 1,050,000,000 GEMBULL |
| Genesis ritual treasury | 150,000,000 GEMBULL |

The first check-in reserves the full 200,000-GEMBULL daily mint budget. Finalization releases unused capacity. Each successful participant claims separately, so finalization does not loop over every account. Check-ins are limited per account, not per human; one person can operate multiple NEAR accounts. The contract has no parameter setters, but deployment-account upgrade authority must be inspected before claiming immutable bytecode.

## Run locally

From the repository root:

```sh
pnpm install
cp apps/web/.env.example apps/web/.env.local
pnpm dev
```

Open `http://localhost:3000`. Leave `NEXT_PUBLIC_GEMBULL_CONTRACT_ID` empty for an honest local preview. Set it only to a reviewed GemBull Testnet deployment when one exists. `NEXT_PUBLIC_NEAR_RPC_URL` selects the Testnet RPC endpoint. Set `NEXT_PUBLIC_SITE_URL` to the public origin before hosting so OG and X image URLs resolve correctly. No private keys belong in public environment variables.

Run frontend checks from the root:

```sh
pnpm typecheck
pnpm lint
pnpm build
```

## Verify the contract and simulation

Use stable Rust, the Wasm target, and cargo-near. From `contracts/gembull-core`:

```sh
cargo fmt --check
cargo near check
cargo test --lib
cargo near build non-reproducible-wasm --no-abi
cargo test --test ritual_sandbox
```

The Sandbox test reads `target/near/gembull_core.wasm`; build first. Run Sandbox on Linux x86_64/aarch64 or macOS arm64, or via a supported Linux environment on Windows. The [contract README](contracts/gembull-core/README.md) explains initialization and storage funding. On 2026-11-12, `cargo fmt --check`, `cargo near check`, all **20 Rust unit tests**, the Wasm build, and **one Sandbox integration test** passed. The Sandbox test ran in a Rust 1.99.1 Debian Trixie Linux container because `near-sandbox` does not support native Windows and its Linux binary requires a newer GLIBC than Debian Bookworm provides.

From the repository root, reproduce the deterministic 60-day simulation:

```sh
python scripts/simulate_60_days.py
python scripts/simulate_60_days.py --check
```

The simulation uses `10^18` integer base units, floors burns at the base-unit boundary, and assumes all eligible successful-epoch rewards are claimed. Its final supplies are 1,002,028,928.981532810160431509 (optimistic), 1,000,370,312.149419827554214943 (base), and 997,872,073.295368507014737291 (pessimistic) GEMBULL. These are behavior scenarios, not adoption or price forecasts.

## Judge walkthrough once GemBull is deployed

1. Read `get_rules()`, `ft_metadata()`, and the recorded deployment transaction; confirm the account really reports **GemBull / GEMBULL**.
2. Connect a NEAR Testnet wallet, register token storage, and obtain documented test tokens from the team's distribution path.
3. Check in once. Confirm the epoch count rises; a second check-in from the same account fails.
4. Finalize a completed epoch in Sandbox with time travel. On success, claim once and inspect `ft_mint`; on a miss, inspect the treasury `ft_burn` and streak reset.
5. Inspect the web history, actual supply, and separate 60-day simulation. Run the script above and compare its 180 CSV rows.

These steps are **not yet an end-to-end live GemBull demo**. A new Testnet deployment, participant activity, and a hosted UI are required before presenting them as completed evidence.

## Roadmap

The roadmap is an implementation checklist. The landing page shows a short status summary so visitors can see what is built without losing the primary ritual action.

| Priority | Next outcome | Gate |
|---|---|---|
| P0 | Deploy a new GemBull Testnet contract and record ID, transaction, code hash, and upgrade authority | Human-reviewed account and verified metadata |
| P0 | Fund demo participants, record one real check-in, host UI, and capture a reproducible video | End-to-end judge walkthrough works |
| P1 | Build separate mockUSDC, stock vault, mock broker, and simulated receipt | Sandbox integration passes; UI always says `SIMULATED` |
| Later | Evaluate routed purchase fee, launch venue, LP lock, and legal custody path | No production claim before implementation and review |

The stock layer's proposed 1% reserve applies only to eligible purchases routed through a future app router. Transfers and external DEX trades do not automatically contribute. No actual equity is acquired in this hackathon build. NEAR Intents are outside the current implementation.

## Repository map

```text
contracts/gembull-core/     NEP-141 token and daily ritual
apps/web/                  Next.js landing and ritual UI
scripts/                   Deterministic 60-day simulator
docs/                      Product, contract, security, test, and design specifications
docs/deployments/           Historical RITL Testnet deployment evidence
docs/brand/                GemBull assets and creative prompts
```

Start with [hackathon alignment](docs/HACKATHON_ALIGNMENT.md), [product requirements](docs/PRD.md), [tokenomics](docs/TOKENOMICS.md), [contract specification](docs/SMART_CONTRACT_SPEC.md), [security](docs/SECURITY_AND_RISK.md), [test plan](docs/TEST_PLAN.md), and [roadmap details](docs/ROADMAP.md). The approved landing logo and commercial assets are documented in the [brand guide](docs/brand/BRAND_GUIDE.md).
