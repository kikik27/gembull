# GemBull

**A NEAR Testnet memecoin whose daily community ritual changes token supply.** Holders check in once per 24-hour epoch. If 50 eligible accounts check in, each can claim a 1,000 GEMBULL reward after settlement. If the community misses, the contract burns 5 basis points of its ritual treasury and resets the streak. The rules and state transitions live in the NEP-141 contract.

Built for **NEAR HACKATHON 2026**, track **`memecoins` — Memecoins With Mechanics**. The [track prompt](https://github.com/nearai/near-hackathon-prompt-examples/blob/main/tracks/11-memecoins.md) asks for a contract-enforced streak coin, public launch parameters, a progress and event page, Sybil limitations, and a reproducible 60-day supply simulation. GemBull is a Testnet demonstration; GEMBULL has no mainnet value or claim on stock.

| Open | Link |
| --- | --- |
| Live dApp | [gembull-testnet.vercel.app](https://gembull-testnet.vercel.app) |
| Testnet contract | [`gembull-core.testnet`](https://testnet.nearblocks.io/address/gembull-core.testnet) |
| Deployment transaction | [View on NEAR Testnet explorer](https://explorer.testnet.near.org/transactions/5rBtj3zDp9A7BrzuKQWYVzTN2wYnSsVcg8TcztXSaG9j) |
| Deployment details | [Contract, genesis allocation, code hash, and upgrade key](docs/deployments/GEMBULL_TESTNET.md) |
| Demo video | Local export prepared; public X post link pending |

## Try it: action → result

| Do this | See this | Source of truth |
| --- | --- | --- |
| Open the [dApp](https://gembull-testnet.vercel.app) and go to **Ritual** | Current epoch, check-in count, target, streak, and fixed rules | `get_global_state()` and `get_rules()` on Testnet |
| Open **Supply** and **Epoch History** | Current supply, ritual treasury, finalized-day outcomes, and indexed ritual events | Contract views and receipt logs; event feed depends on its read-only indexer |
| Run `pnpm verify:testnet` | Token metadata, rules, supply bounds, code hash, and upgrade-key status | Finalized Testnet RPC state |
| Connect a NEAR Testnet wallet with at least **1,000 GEMBULL**, then click **Check in now** | Wallet-signed transaction; the account's epoch status and progress update after finality | `check_in()` in `gembull-core.testnet` |
| After an epoch closes, call **Settle day N** if it is still unsettled | Success or missed result, streak change, and reward eligibility or treasury burn | Permissionless `finalize_day(day_id)` |
| Run `python scripts/simulate_60_days.py --check` | 180 deterministic rows across optimistic, base, and pessimistic scenarios | Local model using published contract parameters; **not** live chain history |

Wallet connection alone does not provide GEMBULL. There is **no in-app faucet or purchase route**. Token storage must be registered and test tokens must be distributed before check-in. Follow the [Testnet wallet guide](docs/TESTNET_USER_GUIDE.md), including the public-allocation transfer procedure. A single tester cannot reach the 50-account success target; the Sandbox test covers that path with time travel.

## The on-chain mechanic

```text
24-hour epoch starts
  → eligible account holds ≥ 1,000 GEMBULL and checks in once
  → first check-in reserves the epoch's full possible reward capacity
  → after the epoch ends, anyone settles the next unsettled day
     ├─ ≥ 50 check-ins: streak increases; each participant may claim once
     └─ < 50 check-ins: 5 bps of ritual treasury burns; streak resets
  → unused reward capacity is released; the next epoch proceeds
```

| Rule | Deployed value |
| --- | ---: |
| Epoch duration | 24 hours |
| Community target | 50 distinct eligible accounts |
| Minimum balance at check-in | 1,000 GEMBULL |
| Participant cap | 200 accounts per epoch |
| Reward after a successful epoch | 1,000 GEMBULL per participant, minted on individual claim |
| Missed-epoch burn | 5 bps (0.05%) of the remaining ritual treasury |
| Genesis / maximum supply | 1,000,000,000 / 1,050,000,000 GEMBULL |

The contract enforces sequential settlement, one check-in and one claim per account per eligible epoch, bounded reward minting, and treasury-only missed-day burns. It implements NEP-141 fungible tokens, NEP-145 storage management, NEP-148 metadata, and NEP-297 events. The frontend and event indexer read chain state; neither decides the ritual outcome. See [contract specification](docs/SMART_CONTRACT_SPEC.md) and [tokenomics](docs/TOKENOMICS.md).

## Evidence and limits

| Evidence | What it establishes |
| --- | --- |
| [Testnet deployment record](docs/deployments/GEMBULL_TESTNET.md) | Contract initialization, genesis allocations, and the on-chain code hash |
| `pnpm verify:testnet` | Rechecks metadata, rules, supply, treasury, and the current upgrade-key posture without a signing key |
| Testnet Day 0 settlement | A missed target burned **75,000 GEMBULL**; finalized RPC verification on 2026-11-13 returned supply **999,925,000** and treasury **149,925,000** GEMBULL |
| `cargo test --lib` and `cargo test --test ritual_sandbox` | Unit and local Sandbox checks of success, failure, claims, ordering, and cap behavior; Sandbox transactions are **not** live Testnet transactions |
| [60-day simulation](docs/simulation/60_DAY_SIMULATION.md) | Reproducible model behavior under three participation scenarios, assuming all eligible rewards are claimed |

**Security boundary:** there is no public setter for the ritual parameters and no unrestricted mint method. The deployed contract account still has a **FullAccess key capable of redeploying code**, so its bytecode is not fully immutable. Minimum balance plus one check-in per account limits simple spam; it does **not** prove one human per account. A successful live 50-account epoch and reward claim are not presented as completed Testnet evidence.

The landing includes a clearly labeled **SIMULATED** stock-reserve concept. No stock purchase, custody, holder allocation, or stock-voting contract is live. The removed stock-batch recorder is not part of this MVP. These ideas do not affect GEMBULL supply or the ritual treasury. See [product direction](docs/PRODUCT_MODEL.md) and [open decisions](docs/OPEN_DECISIONS.md).

## Roadmap

| Stage | Goal | Status |
| --- | --- | --- |
| Ritual core | NEP-141 token, daily check-in, permissionless settlement, reward claims, treasury burn, live dashboard, and 60-day model | **Live on Testnet**; successful-epoch claim is verified in local tests, not yet demonstrated with 50 live accounts |
| Community proof | Record a complete wallet demo, exercise a successful live epoch with eligible participants, and verify event-history coverage against receipts | **Next evidence milestone** |
| Community choice | Define ballot eligibility and tie rules, then build and test a separate on-chain nomination and vote contract with no admin winner override | **Proposed; not deployed** |

The [detailed roadmap](docs/ROADMAP.md) tracks acceptance gates. Its future stages are plans, not committed launch dates or token-holder benefits.

## Run locally

Requirements: Node.js and pnpm for the web app; Python 3 for the supply simulation. Rust and cargo-near are needed only for contract tests and builds.

```bash
pnpm install
cp apps/web/.env.example apps/web/.env.local
pnpm dev
```

Open <http://localhost:3000>. The example environment points to NEAR Testnet and `gembull-core.testnet`. It contains no private keys. From the repository root:

```bash
pnpm typecheck
pnpm lint
pnpm build
pnpm verify:testnet
pnpm check:sim
```

Contract verification:

```bash
cd contracts/gembull-core
cargo fmt --check
cargo test --lib
cargo near build non-reproducible-wasm --no-abi
cargo test --test ritual_sandbox
```

The Sandbox test requires Linux or a suitable Linux environment; build the Wasm before running it. See the [contract README](contracts/gembull-core/README.md) for the full toolchain notes. `services/keeper-bot/` contains an optional Testnet keeper that can call permissionless settlement; the app also exposes the action. Running the keeper with signing credentials can submit transactions, so inspect its [README](services/keeper-bot/README.md) first.

## Repository map

| Path | Purpose |
| --- | --- |
| [`contracts/gembull-core/`](contracts/gembull-core/) | NEP-141 token and ritual state machine |
| [`apps/web/`](apps/web/) | Next.js Testnet dApp and read-only event feed |
| [`services/keeper-bot/`](services/keeper-bot/) | Optional epoch settlement worker |
| [`scripts/`](scripts/) | Testnet verification, distribution helper, and 60-day simulation |
| [`docs/`](docs/) | Requirements, architecture, tests, risk disclosures, and deployment evidence |

The project was developed during the 2026-11-01 to 2026-11-14 hackathon window; the repository history includes an earlier **StonkRitual / RITL** prototype from the same window, followed by the GemBull rebrand and Testnet deployment. Development used AI coding assistance and third-party libraries, including `near-sdk`, `near-contract-standards`, Next.js, React, `near-api-js`, and the wallet packages declared in the lockfiles. No external stock or broker integration is implemented.

Licensed under [MIT](LICENSE).
