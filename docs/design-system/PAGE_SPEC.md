# GemBull Page & UX Specification

## User roles

1. **Visitor:** learns the ritual, reads rules and transparency disclosures.
2. **Wallet user:** checks eligibility, joins the daily ritual and claims eligible rewards.
3. **Community member:** reviews participation, streaks, supply history and public activity.
4. **Hackathon judge:** reproduces the mechanic, inspects immutable parameters, sees mint/burn history and runs the 60-day simulation.

## Primary journey

Visitor → Landing → How it works / Rules → Connect wallet → Dashboard → Daily Ritual → Sign check-in → Wait for confirmation → See participation progress → Epoch finalizes → Claim if eligible → Inspect event log.

## State model

### Epoch state

- `UPCOMING`: next epoch has not opened.
- `OPEN`: check-ins accepted.
- `TARGET_REACHED`: participation target met, but epoch may still be open until finalization.
- `FINALIZED_SUCCESS`: epoch closed and success result confirmed.
- `FINALIZED_MISSED`: epoch closed and miss/burn result confirmed.

### User state

- `DISCONNECTED`
- `INELIGIBLE`
- `ELIGIBLE_NOT_CHECKED_IN`
- `CHECK_IN_PENDING`
- `CHECKED_IN`
- `REWARD_CLAIMABLE`
- `CLAIM_PENDING`
- `REWARD_CLAIMED`
- `TRANSACTION_FAILED`

Frontend must not infer finalized success/miss from a client-side countdown alone. Read the contract result/event.

## Interaction flows

### A. Connect wallet

1. User selects Connect wallet.
2. Wallet selector opens with supported NEAR wallet options.
3. User approves connection in their wallet.
4. UI shows shortened account ID and verified network.
5. Read contract state and account eligibility.
6. If provider/chain is unavailable, show a retry state and preserve public browsing.

### B. Daily check-in

1. Dashboard loads current epoch from contract/indexer.
2. Show participant count, target, close time and user's status.
3. If eligible and not checked in, enable Check in.
4. Explain the on-chain action and likely gas/network context.
5. Call wallet transaction; button changes to Confirming.
6. Wait for confirmed response/event.
7. On confirmation, show “Check-in confirmed” plus explorer link.
8. Refresh epoch progress and activity log.

### C. Epoch success and reward claim

1. Epoch must be finalized successfully by the contract.
2. UI shows reward claim only if the account checked in and is eligible.
3. Show reward size from contract state/config, not hardcoded UI.
4. User submits claim transaction.
5. After confirmation, balance and event log refresh.
6. If reward is not yet claimable, explain the exact reason.

### D. Missed target / burn

1. Do not predict a burn before epoch finalization.
2. Once finalized, show missed target and exact burn event/amount.
3. Link to transaction and show resulting supply update.
4. Reset streak only if the contract's finalized state confirms it.
5. Use a neutral explanatory tone; avoid celebratory animation.

### E. Inspect rules

1. User opens Rules.
2. UI shows parameter name, value, meaning and source.
3. Read values from contract state/genesis config.
4. Show contract account, network, deployment metadata and source/explorer links.
5. Use `Immutable` only after upgrade authority has been independently verified as absent/renounced.

### F. Stock reserve simulator

1. User opens Stock Vault (Simulation).
2. Persistent simulation disclosure is visible before metrics.
3. Display source-separated simulated batch/contribution/execution/active-holder allocation state when implemented.
4. User can inspect the mocked broker flow and assumptions.
5. Never include simulated allocations in the real on-chain token balance; use a distinct section and explicit simulation label.

## Route requirements

| Route | Page title | Main objective | Required content |
|---|---|---|---|
| `/` | GemBull | Explain product and invite participation | Hero, ritual explainer, demo progress, rules CTA, disclosure |
| `/how-it-works` | How the ritual works | Explain state transitions | Check-in → target → mint/burn → streak |
| `/rules` | The rules | Establish trust | Contract parameters, immutability evidence, Sybil limitations |
| `/transparency` | Transparency | Audit token mechanics | Events, supply, contract and simulation disclosure |
| `/app` | Overview | Show today's state | RitualHeroCard, streaks, metrics, latest activity |
| `/app/ritual` | Daily Ritual | Check in or claim | Eligibility, progress, CTA, epoch status |
| `/app/activity` | Activity | Inspect on-chain activity | Filtered event timeline |
| `/app/supply` | Supply | Understand mint/burn effects | Actual supply + separate 60-day simulator |
| `/app/community` | Community | Show community participation | Leaderboard, milestones, Sybil disclaimer |
| `/app/vault` | Stock Vault | Explain mock RWA layer | Persistent Simulation banner and simulated batches |
| `/app/portfolio` | Portfolio | Show account state | Real GEMBULL balance, claims and separate simulation panel |

## UX copy examples

- Check-in action: `Check in`
- Pending state: `Waiting for wallet confirmation…`
- Success: `Check-in confirmed on NEAR Testnet.`
- Failure: `The transaction was not confirmed. Check your wallet or retry.`
- Already done: `You're checked in for this ritual.`
- Ineligible: `This wallet does not meet the current eligibility rule.`
- Target status: `42 of 50 participants checked in.`
- Finalized success: `The community hit the target. Eligible check-ins can claim their reward.`
- Finalized miss: `The target was missed. The contract recorded the configured treasury burn.`
- Simulator banner: `SIMULATION — this prototype does not hold or issue real shares.`

## UX review checklist

- [ ] A first-time visitor understands the mechanic within 10 seconds.
- [ ] A connected user can identify their next action without opening a menu.
- [ ] Check-in result is never shown as successful before transaction confirmation.
- [ ] Rules and Sybil limitations are discoverable before participating.
- [ ] The exact reset/close time includes timezone context.
- [ ] Current and longest streak are distinct.
- [ ] Actual supply and simulated supply are visually and semantically distinct.
- [ ] Stock simulator cannot be mistaken for share custody or redemption.
- [ ] Empty, loading, stale and failed states are designed, not omitted.
- [ ] All essential flows work with keyboard and mobile touch.
