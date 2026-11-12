# Business Requirements Document (BRD)

**Product:** StonkRitual  
**Token:** RITL  
**Version:** 0.1 — Hackathon baseline  
**Primary track:** NEAR Hackathon — `memecoins`

## 1. Executive summary

StonkRitual is a community memecoin whose token supply reacts to a daily on-chain ritual. Holders check in once per 24-hour epoch. If at least 50 eligible accounts participate, the epoch succeeds, the community streak increases, and participants become eligible to claim a fixed RITL mint. If the community misses the target, 5 basis points of the remaining ritual treasury balance is burned and the current streak resets.

A secondary stock accumulation layer is designed to allocate 1% of eligible application-routed purchases into a segregated stock acquisition reserve. The hackathon prototype demonstrates this with test assets, a mock broker, and a simulated receipt token. Real equity custody is explicitly outside hackathon scope.

## 2. Business context and problem

Conventional memecoins often concentrate attention on price, trading volume, and short-lived social momentum. StonkRitual makes community participation economically legible: a daily ritual deterministically changes supply and streak state on NEAR. The separate stock reserve creates a longer-term product direction without making the meme token itself a claim on equity.

## 3. Business objectives

1. Demonstrate an original, understandable memecoin mechanic enforced by a NEAR smart contract.
2. Make the token's supply respond deterministically to community participation.
3. Make all launch parameters publicly readable and immutable through contract interfaces.
4. Provide an auditable history of check-ins, successful/missed epochs, reward mints, treasury burns, and streak records.
5. Demonstrate a separate, transparent stock-acquisition reserve and simulated receipt lifecycle without misrepresenting legal ownership.
6. Deliver a reproducible project that a human judge and AI coding judge can inspect.

## 4. Stakeholders

| Stakeholder | Interest | Responsibility |
|---|---|---|
| Holder / participant | Check in, claim reward, inspect supply and streak | User |
| Community | Coordinate participation and milestones | Collective participant |
| Protocol contract | Enforce rules, mint, burn, track streaks | On-chain source of truth |
| Frontend | Present state and wallet actions | User interface |
| Indexer/backend | Read chain events and external quote data | Non-authoritative support layer |
| Mock issuer / broker | Simulate execution and attestation | Test-only integration |
| Hackathon judge | Reproduce core mechanic and inspect evidence | Evaluator |

## 5. Scope

### In scope — hackathon MVP

- NEAR Testnet deployment of a NEP-141 RITL token with embedded ritual state machine.
- Immutable genesis parameters and hard maximum-supply cap.
- One check-in per account per epoch, minimum holding check, daily target, participant cap, and permissionless epoch settlement.
- Claim-per-account rewards after a successful epoch.
- Treasury burn and streak reset after a missed epoch.
- Current progress, current streak, longest streak, supply, treasury balance, and event history UI.
- Reproducible 60-day supply simulation for optimistic, base, and pessimistic behavior.
- Test-only stock reserve, mock stablecoin, simulated broker execution, and clearly labeled simulated receipt lifecycle, subject to time.

### Planned / post-hackathon

- Production issuer and regulated custody integration.
- Legal structure and investor eligibility controls for real tokenized equity.
- Automatic 1% stock-reserve fee on every application-routed purchase through an audited trade router.
- Production buyback execution on a supported AMM, beyond the ritual treasury burn.
- LP lock integration or a dedicated LP locker after compatibility testing with the selected launch/liquidity venue.
- Multi-ticker stock reserve and community governance.
- Verified third-party proof of custody and independent audit.

### Out of scope

- Claiming that RITL is backed by, redeemable for, or represents NVIDIA shares.
- Actual broker account opening, securities execution, or custody during the hackathon.
- Public sale, investment solicitation, APY promises, or revenue guarantees.
- Mainnet launch and real-money trading.
- NEAR Intents integration unless it becomes necessary and can be demonstrated without distracting from Track 11.

## 6. Business requirements

| ID | Requirement | Priority | Success measure |
|---|---|---:|---|
| BR-01 | Ritual rules must be enforced by the NEAR contract | Must | Backend outage does not stop check-in/settlement/claim |
| BR-02 | Launch parameters must be publicly readable and immutable | Must | View method returns every parameter; no setter exists |
| BR-03 | Every account can check in no more than once per epoch | Must | Duplicate call reverts |
| BR-04 | Successful epoch rewards every eligible participant | Must | Each participant can claim exactly once |
| BR-05 | Missed epoch burns the prescribed treasury slice and resets current streak | Must | Supply and treasury decrease; streak resets |
| BR-06 | Longest streak persists as a high score | Must | It never decreases after a failed epoch |
| BR-07 | UI exposes progress, streak, supply, and mint/burn history | Must | Judge can verify each state and event |
| BR-08 | Sybil resistance and limitations are disclosed | Must | README documents account-level limitations |
| BR-09 | 60-day simulations cover multiple participation scenarios | Must | Script produces reproducible CSV and summary |
| BR-10 | Stock reserve remains separate from RITL and LP balances | Should | Separate contract/account and ledger |
| BR-11 | Mock stock receipts are visibly identified as simulated | Must | No UI or doc claims real equity ownership |

## 7. Business rules

1. One epoch is exactly 24 hours, anchored to the contract's initialization timestamp.
2. A user must hold at least 1,000 RITL at the moment of check-in.
3. An account can check in only once per epoch.
4. A maximum of 200 accounts may be recorded per epoch in the demo.
5. An epoch succeeds at 50 or more check-ins.
6. Every participant in a successful epoch is entitled to 1,000 RITL.
7. Reward minting is executed by each participant through a one-time claim after settlement.
8. A missed epoch burns 5 bps of the remaining ritual treasury balance.
9. A missed epoch resets current streak to zero; longest streak remains unchanged.
10. No admin may modify these rules after initialization.
11. Stock reserve balances, buyback balances, RITL treasury balances, and liquidity reserves must never be mixed.

## 8. Business assumptions and constraints

- The project uses NEAR Testnet for the hackathon demonstration.
- A wallet/account is the unit of participation, not a verified human identity.
- Testnet token balances and mock USDC have no monetary value.
- Stock quote data, mock broker execution, and mock issuer attestations do not prove real custody.
- The 60-day simulation assumes every eligible participant claims every successful-epoch reward; actual on-chain supply increases as claims are executed.

## 9. Risks and dependencies

- Smart contract implementation must comply with NEP-141/145/148 and NEAR SDK security guidance.
- Current compatibility between a bespoke RITL contract and Meme.Cooking's launch flow is not established. Meme.Cooking is a reference/possible partner, not a required dependency for MVP.
- External price APIs may rate-limit or change schemas; stock display must not block on-chain ritual operations.
- Actual equity receipt issuance requires issuer/custodian, legal, jurisdictional, and investor-eligibility design.

## 10. Acceptance criteria

The MVP is business-acceptable when the judge can reproduce one successful epoch and one missed epoch, inspect the associated mint/burn events and total-supply change, see the current/longest streak, and rerun the 60-day simulation from the public repository.
