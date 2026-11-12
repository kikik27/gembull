# Product Requirements Document (PRD)

**Product:** GemBull<br>
**Version:** 0.2 — Hackathon core plus planned stock direction<br>
**Primary user journey:** Connect → Check in → Epoch settles → Claim reward / inspect burn

## 1. Product vision

Make a memecoin where community participation has deterministic on-chain consequences. The ritual, not the price chart, is the product's core loop.

## 2. Target users

- **Meme community holder:** owns GEMBULL and wants to participate in a simple daily ritual.
- **Mechanics-focused DeFi user:** wants to inspect contract rules, token supply, and treasury behavior.
- **Hackathon judge/developer:** needs a quick, reproducible way to trigger and verify both success and failure paths.
- **RWA-curious user:** wants to understand the future simulated stock-reserve concept without an equity ownership claim.

## 3. MVP product surfaces

1. **Landing / Token page:** brand, ticker, supply, max supply, rules, testnet status, risk disclosure.
2. **Ritual page:** epoch countdown, today's check-in count, target, progress bar, user's check-in status, check-in button, current streak, longest streak.
3. **Reward page/panel:** successful epochs, unclaimed rewards, claim action, claimed status.
4. **History page:** epoch outcomes, each mint/burn event, transaction hash, block height/time, account, amount.
5. **Treasury page:** ritual treasury balance, cumulative burned amount, total minted, current total supply, remaining mint headroom.
6. **Stock Reserve page (planned, secondary):** source-separated mock inflows, batch status, simulated execution, active-holder points/allocation records, explicit SIMULATED banner. The current landing shows a concept preview only.
7. **Docs / How it works:** immutable rules, sybil limitations, contract IDs, links to explorer, reproduction steps.

## 4. Functional requirements

### F-01 — Wallet connection

- Support NEAR Testnet wallet connection.
- Display active account ID and network.
- Reject write actions when wallet is disconnected or network is wrong.
- Show token storage registration state and guide the user through NEP-145 storage registration when needed.

### F-02 — Rule discovery

- Read all rule parameters from the contract at runtime.
- Display them with units and clear labels.
- Do not hardcode displayed values as the source of truth.
- Expose the contract account and explorer link.

### F-03 — Check-in

- Connected account calls `check_in()` once during the current epoch.
- Contract checks minimum token balance, duplicate status, daily participant cap, and epoch state.
- UI shows pending wallet signature, submitted transaction, confirmed check-in, or a specific error.
- A duplicate check-in is rejected by the contract, not just disabled in the UI.

### F-04 — Epoch settlement

- Anyone may call `finalize_day(day_id)` after the epoch ends.
- Settlement must be sequential. It must not skip a day or finalize a future day.
- UI identifies when the previous epoch is awaiting permissionless settlement.
- On success, display successful status, streak update, and reward eligibility.
- On failure, display missed status, burn amount, current-streak reset, and unchanged longest streak.

### F-05 — Reward claim

- A participant of a successful epoch may call `claim_reward(day_id)` once.
- Contract verifies the account checked in and the epoch succeeded.
- Contract mints exactly the configured reward amount to the caller.
- UI shows available reward, claim status, transaction hash, and updated total supply.
- Claims are permitted only while the epoch's reward reservation exists; capacity is accounted for at check-in and released on failed epochs.

### F-06 — Supply and treasury dashboard

Display:
- initial supply;
- current total supply;
- maximum supply;
- cumulative ritual rewards minted;
- cumulative treasury tokens burned;
- remaining ritual treasury balance;
- remaining mint capacity;
- successful and missed epoch counts.

### F-07 — Streaks and progress

- Current streak increases on every successful finalized epoch.
- Current streak resets to zero on a missed finalized epoch.
- Longest streak is a lifetime high-water mark.
- Show daily progress as `check-ins / target`, while also showing the hard participant cap.

### F-08 — Event history

- Show every `ft_mint` and `ft_burn` event related to the ritual.
- Show custom events for check-in and epoch settlement.
- Provide explorer links where available.
- History must distinguish contract events from backend-generated stock simulation records.

### F-09 — Stock reserve and active-holder simulation (planned secondary MVP)

- Track proposed routed-fee and protected graduation-surplus inflows in separate mock ledgers; no such funding path exists in the deployed app.
- Create simulated batches and execution records without claiming real broker fills or custody.
- Give one non-transferable point per valid check-in only once a points implementation exists; no historical backfill is verified today.
- Proposed stock eligibility: five valid check-ins in the previous seven completed epochs and 1,000 GEMBULL at a fixed snapshot. Weight simulated allocations by eligible points.
- Do not mint a custom stock receipt token in the revised MVP.
- Display `SIMULATED — NO REAL EQUITY OWNERSHIP` on every stock allocation screen.
- Do not let stock-service downtime affect ritual functionality.

### F-10 — 60-day simulation

- Ship a no-dependency script that simulates the published immutable parameters.
- Support optimistic, base, and pessimistic participation scenarios.
- Export per-day values: check-ins, success/failure, reward minted, treasury burned, total supply, treasury balance, current streak, longest streak.
- Document the claim-rate assumption (100% claims in the simulation).

## 5. Non-functional requirements

- **Correctness:** contract logic is deterministic and independent of backend state.
- **Security:** checked arithmetic, predecessor checks, storage checks, safe state transitions, no arbitrary mint/burn.
- **Transparency:** every parameter and key state is queryable through view methods.
- **Reproducibility:** a fresh developer can run tests and the simulator from documented commands.
- **Accessibility:** visible state labels, descriptive errors, no color-only status.
- **Performance:** do not iterate all users in a single settlement transaction; claims are per-user.
- **Resilience:** stock data/API outage must not stop the core ritual.

## 6. UX states and errors

| State/error | UX response |
|---|---|
| Wallet disconnected | Connect wallet prompt |
| Wrong network | Switch to NEAR Testnet |
| Storage not registered | Explain and request storage deposit |
| Already checked in | Show successful prior check-in; no second transaction |
| Balance below 1,000 GEMBULL | Show exact minimum balance and current balance |
| Epoch full (200 accounts) | Show participant cap reached |
| Epoch still active | Disable settlement and show countdown |
| Prior epoch not finalized | Ask user to call permissionless settlement |
| Reward not yet finalized | Show pending status |
| Reward already claimed | Show claim transaction |
| Epoch missed | Show burn amount and streak reset |
| Mint headroom exhausted | Explain fixed emission cap; no hidden admin override |
| Mock broker unavailable | Disable stock simulation only; ritual remains available |

## 7. Analytics / success metrics

Hackathon product metrics should be demonstrable, not fabricated:

- number of unique NEAR accounts that checked in;
- successful and missed epochs;
- longest streak;
- total ritual tokens minted;
- total ritual treasury tokens burned;
- number of reward claims;
- 60-day supply trajectories under three scenarios;
- stock-reserve contributions and simulated batches, labeled as test data.

## 8. Out of scope for current MVP

- Real stock acquisition or legal receipt issuance.
- Verified personhood / proof-of-humanity.
- Permissionless multi-stock governance.
- Unbounded on-chain participant list rendering.
- Token price targets, yield/APY promises, or guaranteed stock-price correlation.
- Mainnet launch.
