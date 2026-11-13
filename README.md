# GemBull

GemBull is a NEAR-native community memecoin whose supply reacts to a daily on-chain ritual. An eligible account checks in once per 24-hour epoch. A successful community day creates individual reward claims; a missed day burns a fixed slice of the ritual treasury and resets the current streak. The rules live in the token contract, not a backend.

## Judge start here

**Track:** `memecoins` · **Network:** NEAR Testnet · **Live contract:** [`gembull-core.testnet`](https://testnet.nearblocks.io/address/gembull-core.testnet) · **Hosted app:** [GemBull](https://gembull-testnet.vercel.app) · **License:** [MIT](LICENSE).

| Do this | See this | Evidence |
|---|---|---|
| Open the hosted app and scroll to **Ritual** | Current epoch, target progress, rules, and Testnet source labels | Live contract views, not seeded metrics |
| Open **Supply** and **Epoch history** | On-chain supply and event history alongside a clearly separate 60-day simulation | `get_global_state()` and [deterministic CSV](docs/simulation/gembull-60-day-simulation.csv) |
| Run `pnpm verify:testnet` from the repo root | Metadata, rules, supply bounds, code hash, and upgrade-key report | Read-only finality checks against Testnet RPC |
| Run `python scripts/simulate_60_days.py --check` | `180` checked scenario rows | No price or adoption prediction |
| Connect a Testnet wallet, register storage, receive at least 1,000 test GEMBULL, then **Check in now** | The wallet signs `check_in`; the app refreshes account status and epoch progress after finality | [Wallet guide](docs/TESTNET_USER_GUIDE.md); token transfer is team-operated, with no buy route |
| Run the Linux/macOS Sandbox test | Success → claim/mint, and miss → treasury burn/streak reset | [Contract test instructions](contracts/gembull-core/README.md); these are Sandbox outcomes, not live Testnet transactions |

**What is live:** NEP-141/145/148 token, contract-enforced check-ins and settlement rules, Testnet deployment, hosted read path, and one accepted Testnet check-in observed at finality. **What is pending as live demo evidence:** a recorded wallet walkthrough and a 50-account success/claim or missed-day burn on Testnet. The stock reserve, community stock ballot, and allocation ledger are **PLANNED / SIMULATED**; the app holds no shares. The deployed account still has a FullAccess key, so its code remains upgradeable even though there are no public parameter setters.

For a full reproduction path, follow [Run locally](#run-locally), [Verify the contract and simulation](#verify-the-contract-and-simulation), and the [judge walkthrough](#judge-walkthrough). The [submission readiness sheet](docs/SUBMISSION_READINESS.md) tracks the demo post and final submission gates.

The [54-second paper pop-up demo film](films/gembull-popup/README.md) is a narrated, animated story made with Lemo Opuscar. It illustrates the ritual rules and labels the stock concept **SIMULATED**. It is not footage of a live wallet signature; the [Testnet user guide](docs/TESTNET_USER_GUIDE.md) covers that action.

The [16-bit pixel RPG film](films/gembull-story/README.md) remains a separate creative exploration. The paper pop-up film is the selected submission demo; its local export awaits human review before the X post.

The earlier [`ritl-stonkritual.testnet` deployment](docs/deployments/RITL_TESTNET.md) is a separate legacy **StonkRitual / RITL** token. The v0.2 product direction retires its mock stock-receipt plan; judges should inspect the GemBull contract and the [GemBull Testnet deployment record](docs/deployments/GEMBULL_TESTNET.md).

## Hackathon goal and evidence

The goal is to demonstrate a memecoin mechanic that a judge can reproduce and inspect on NEAR:

| Track expectation | Evidence in this repository | Current status |
|---|---|---|
| NEP-141 token with NEP-145 storage and NEP-148 metadata | [`gembull-core`](contracts/gembull-core/) and [Testnet record](docs/deployments/GEMBULL_TESTNET.md) | Deployed; metadata verified |
| Daily check-in, target, streak, mint and burn enforced on-chain | Contract methods `check_in`, `finalize_day`, `claim_reward`; [spec](docs/SMART_CONTRACT_SPEC.md) | 20 Rust unit tests and one Linux Sandbox integration test pass; one live Testnet check-in observed; later settlement and claim/burn evidence pending |
| Fixed public launch parameters and supply cap | `get_rules()`, no public setters, reward-capacity reservation | Verified on Testnet; deployment key can still upgrade code |
| Progress, rules, supply, and event history | [hosted web app](https://gembull-testnet.vercel.app) | Production page and hydrated live rules/supply verified; wallet walkthrough pending |
| 60-day supply simulation | [script](scripts/simulate_60_days.py) and [CSV](docs/simulation/gembull-60-day-simulation.csv) | 180 rows regenerated and checked |
| Judge walkthrough with live wallet actions | Testnet account, distribution, hosted demo, recorded transactions | First live check-in observed; full walkthrough/video pending |

The [live hackathon instructions](https://nearhackathon.com/HACKATHON.md) require a public reproducible repository, a human-published X demo post, and one reviewed submission. Testnet-only projects are eligible. The repository is public; the X post and submission are pending. The development deadline is **2026-11-14 23:59 UTC**. Re-read the live rules before submission. No post or submission is sent by this repository.

## Ritual rules

These are the parameters returned by the deployed Testnet contract's `get_rules()` view. The app reads the contract rather than trusting this table.

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

The first check-in reserves the full 200,000-GEMBULL daily mint budget. Finalization releases unused capacity. Each successful participant claims separately, so finalization does not loop over every account. Check-ins are limited per account, not per human; one person can operate multiple NEAR accounts. The contract has no parameter setters, but its Testnet account still has one FullAccess key and can redeploy code.

## Run locally

From the repository root:

```sh
pnpm install
cp apps/web/.env.example apps/web/.env.local
pnpm dev
```

Open `http://localhost:3000`. The example environment points to the verified `gembull-core.testnet` contract; the web app also uses that Testnet account by default. `NEXT_PUBLIC_NEAR_RPC_URL` selects the Testnet RPC endpoint. Open Graph and X image URLs use the branded `https://gembull-testnet.vercel.app` origin configured in the app layout. No private keys belong in public environment variables.

To explore the separate **SIMULATED** stock-reserve concept, scroll to `#vault` and adjust the eligible routed-volume and protected net-surplus sliders. The 3D router, graduation gate, and vessel illustrate proposed inputs: 1% of eligible app-routed volume per day over 60 illustrative days, plus a one-time 5% of protected net graduation surplus. The initial $5,000/day and $0 surplus example yields $3,000. These controls make no transaction and do not change GEMBULL balances, supply, or the ritual treasury; no real shares or reserve are held.

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

Verify the currently deployed contract's metadata, fixed rules, code hash, supply bounds, and public upgrade authority from Testnet RPC:

```sh
pnpm verify:testnet
```

The simulation uses `10^18` integer base units, floors burns at the base-unit boundary, and assumes all eligible successful-epoch rewards are claimed. Its final supplies are 1,002,028,928.981532810160431509 (optimistic), 1,000,370,312.149419827554214943 (base), and 997,872,073.295368507014737291 (pessimistic) GEMBULL. These are behavior scenarios, not adoption or price forecasts.

## Judge walkthrough

1. Read `get_rules()`, `ft_metadata()`, and the recorded deployment transaction; confirm the account really reports **GemBull / GEMBULL**.
2. Connect a NEAR Testnet wallet, register token storage, and receive at least 1,000 test GEMBULL from the `gembull-public.testnet` allocation via a team-operated transfer. There is no in-app token faucet or buy route. See the [distribution routes](docs/DISTRIBUTION_PLAN.md).
3. Check in once. Confirm the epoch count rises; a second check-in from the same account fails.
4. Finalize a completed epoch in Sandbox with time travel. On success, claim once and inspect `ft_mint`; on a miss, inspect the treasury `ft_burn` and streak reset.
5. Inspect the web history, actual supply, and separate 60-day simulation. Run the script above and compare its 180 CSV rows.

The contract deployment, read-only checks, and hosted UI are complete. Steps requiring a live participant wallet and recorded transaction flow are **not yet end-to-end demo evidence**; the Sandbox test covers the time-travel flows in step 4.

## Roadmap

The roadmap is an implementation checklist. The landing page shows a short status summary so visitors can see what is built without losing the primary ritual action.

| Priority | Next outcome | Gate |
|---|---|---|
| P0 | Fund more demo participants and capture a reproducible hosted-UI video of the live check-in and later settlement | End-to-end judge walkthrough works |
| P1 | Design a simulated two-source stock reserve and non-transferable Ritual Points/active-holder allocations | Open parameters reviewed; UI says `SIMULATED`; no stock receipt token in MVP |
| P1 extension | Build a separate on-chain community ballot for simulated stock candidates and a public simulated recipient ledger | Voting/eligibility rules reviewed; no admin winner override; Sandbox tests and verified Testnet UI |
| Later | Evaluate routed purchase fee, launch venue, LP lock, and legal custody path | No production claim before implementation and review |

The stock layer's proposed 1% reserve applies only to eligible purchases routed through a future app router. Transfers and external DEX trades do not automatically contribute. No actual equity is acquired in this hackathon build. The [community stock governance proposal](docs/COMMUNITY_STOCK_GOVERNANCE.md) describes a separate, **not-yet-deployed** NEAR Testnet ballot: community nominations, wallet-signed votes, permissionless tally, and a public simulated recipient ledger. Voting weight and eligibility remain open decisions. A vote cannot by itself buy shares or grant shareholder rights. NEAR Intents are outside the current implementation.

## Test with a connected wallet

Read the [Testnet user guide](docs/TESTNET_USER_GUIDE.md) for the register → receive test GEMBULL → check-in → settle/claim flow. Connecting a wallet does not grant tokens. The [distribution plan](docs/DISTRIBUTION_PLAN.md) explains the public allocation, the separate liquidity inventory, and which routes are still unbuilt. The revised v0.2 stock direction and unresolved parameters are in the [product model](docs/PRODUCT_MODEL.md) and [open decisions](docs/OPEN_DECISIONS.md). The [archive migration notes](docs/V0_2_ARCHIVE_MIGRATION.md) explain what was adopted or deferred.

## Repository map

```text
contracts/gembull-core/     NEP-141 token and daily ritual
apps/web/                  Next.js landing and ritual UI
scripts/                   Deterministic 60-day simulator
docs/                      Product, contract, security, test, and design specifications
docs/deployments/           GemBull Testnet evidence and historical RITL record
docs/brand/                GemBull assets and creative prompts
films/gembull-popup/        Lemo Opuscar paper pop-up film source, narration script and credits
```

Start with [hackathon alignment](docs/HACKATHON_ALIGNMENT.md), [product requirements](docs/PRD.md), [tokenomics](docs/TOKENOMICS.md), [contract specification](docs/SMART_CONTRACT_SPEC.md), [security](docs/SECURITY_AND_RISK.md), [test plan](docs/TEST_PLAN.md), [roadmap details](docs/ROADMAP.md), and the [latest integration audit](docs/INTEGRATION_AUDIT.md). The approved landing logo, downloadable stickers, and commercial assets are documented in the [brand guide](docs/brand/BRAND_GUIDE.md).

## Implementation and provenance

The NEAR integration was developed during the 2026-11-01 to 2026-11-14 hackathon window; the repository's first commit is dated 2026-11-12. The older RITL deployment and StonkRitual naming are documented as historical work within this repository, not presented as the current token. The contract uses Rust, `near-sdk`, and NEAR fungible-token standards. The web app uses Next.js/React, NEAR wallet tooling, typed contract reads, TanStack Query, Zod, Zustand, and Axios. The supply simulation is a deterministic Python script. The submission film uses [Lemo Opuscar](films/gembull-popup/README.md) with ElevenLabs narration; no API credentials are committed. Third-party project packages are listed in the relevant `Cargo.toml`, `package.json`, and lockfiles.
