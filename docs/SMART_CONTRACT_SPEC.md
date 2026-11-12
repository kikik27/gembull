# Smart Contract Specification

## 1. Scope

This specification defines the on-chain interfaces and invariants for the GemBull hackathon MVP. The `gembull-core` contract must implement NEP-141, NEP-145, NEP-148, and the daily ritual mechanic in the same deployed contract.

## 2. Contract account and initialization

The GemBull contract was deployed and initialized at [`gembull-core.testnet`](deployments/GEMBULL_TESTNET.md) on Testnet. The deployment record contains the actual account, transaction, code hash, allocations, and upgrade authority. This specification does not authorize any further deployment.

Initialization is one-time and must set:

- token metadata (`name`, `symbol=GEMBULL`, `decimals=18`);
- initial supply and initial allocation recipients;
- `max_supply=1_050_000_000 × 10^18` base units;
- launch timestamp from chain block timestamp;
- `daily_target=50`;
- `min_holding=1_000 × 10^18`;
- `max_participants=200`;
- `reward_per_checkin=1_000 × 10^18`;
- `treasury_burn_bps=5`;
- epoch duration of 24 hours;
- unique storage prefixes and state version.

There must be no public `set_*` methods for these values.

## 3. NEP interfaces

Required standard behavior:

- NEP-141: `ft_transfer`, `ft_transfer_call`, `ft_total_supply`, `ft_balance_of` and metadata/storage behavior.
- NEP-145: `storage_deposit`, `storage_withdraw`, `storage_unregister`, `storage_balance_bounds`, `storage_balance_of`.
- NEP-148: `ft_metadata` with token name, symbol, decimals, reference/hash if available.
- NEP-297 structured events for custom ritual operations.

Use `near-contract-standards` or the currently recommended official helpers for NEP implementations. Verify the exact current crate/API version from the official skill before coding.

## 4. State model

Suggested state structures (exact Rust types may be adjusted to match SDK patterns):

```rust
struct RitualConfig {
    epoch_duration_ns: u64,
    daily_target: u32,
    min_holding: u128,
    max_participants: u32,
    reward_per_checkin: u128,
    treasury_burn_bps: u16,
    max_supply: u128,
}

struct EpochState {
    day_id: u64,
    checkin_count: u32,
    status: EpochStatus,
    reward_reserved: u128,
    reward_claimed: u128,
    treasury_burned: u128,
    finalized_at_ns: Option<u64>,
}

enum EpochStatus {
    Active,
    Successful,
    Failed,
}
```

Required indexed state:

- `checkin_by_day_and_account[(day_id, account_id)] -> bool`;
- `claim_by_day_and_account[(day_id, account_id)] -> bool`;
- `epoch_state[day_id] -> EpochState`;
- `current_streak: u64`;
- `longest_streak: u64`;
- `last_finalized_day: Option<u64>`;
- `ritual_treasury_balance` is the GEMBULL balance held by the contract account and must reconcile with the NEP-141 ledger;
- the contract account cannot use `ft_transfer` or `ft_transfer_call` to spend the ritual treasury; missed-epoch settlement is its only outgoing GEMBULL path;
- `reserved_mint_capacity: u128`;
- `ritual_ended: bool`;
- cumulative mint/burn metrics.

Use SDK storage collections (for example `LookupMap`, `UnorderedMap`, or current recommended store collection) with unique prefixes. Do not load an unbounded history vector into contract memory.

## 5. Public methods

### `get_rules() -> RitualConfigView`

Read-only. Returns every immutable rule parameter and token metadata fields relevant to the UI.

### `get_global_state() -> GlobalRitualView`

Read-only. Returns launch timestamp, current epoch, last finalized day, current streak, longest streak, total supply, max supply, reserved mint capacity, ritual treasury balance, cumulative mint, and cumulative burn.

### `get_epoch(day_id: u64) -> EpochView`

Read-only. Returns count, target, status, reward reservation, total claimed, burn amount, and finalization timestamp.

### `get_account_epoch_status(account_id: AccountId, day_id: u64) -> AccountEpochView`

Read-only. Returns checked-in, reward-claimable, and claimed flags.

### `check_in()`

Preconditions:

- caller has NEP-141 storage registration;
- current time maps to an active epoch;
- caller has at least `min_holding` GEMBULL;
- caller has not checked in in that epoch;
- participant count is below `max_participants`;
- if this is the first check-in in the epoch, enough free mint headroom remains to reserve the full `max_participants × reward_per_checkin` daily budget.

Effects:

- mark caller as checked in for current day;
- increment epoch participant count;
- if this is the first check-in in the epoch, reserve the full `max_participants × reward_per_checkin` budget (200,000 GEMBULL) against max-supply headroom; subsequent check-ins use the same epoch reservation;
- emit `RitualCheckIn` with day ID, account ID, and count.

### `finalize_day(day_id: u64)`

Permissionless. Preconditions:

- epoch has ended;
- day ID is exactly the next sequential day to finalize;
- epoch is not already finalized;
- contract is not in terminal `ritual_ended` state.

Success effects (`checkin_count >= daily_target`):

- set status `Successful`;
- increment current streak;
- update longest streak;
- reduce the epoch reservation from the full 200,000 GEMBULL budget to `checkin_count × reward_per_checkin`, releasing unused capacity; keep the remaining reservation for claimants;
- emit `RitualDayFinalized` with outcome, count, target, streak values, and reserved reward.

Failure effects (`checkin_count < daily_target`):

- set status `Failed`;
- calculate `burn = floor(ritual_treasury_balance × treasury_burn_bps / 10_000)`;
- if treasury balance is non-zero but calculated burn is zero, burn 1 base unit;
- burn only from the contract's own ritual treasury balance;
- release the full epoch reservation for the failed epoch;
- reset current streak to zero;
- preserve longest streak;
- emit NEP-141 `ft_burn` and `RitualDayFinalized` events.

After settling an epoch, if free mint capacity is below one full `MAX_MINT_PER_EPOCH` budget, set `ritual_ended=true` and emit `RitualEnded`. The contract must not continue accepting check-ins or burning the ritual treasury in future epochs when a full reward cycle can no longer be funded. Existing successful-epoch reward claims remain valid.

### `claim_reward(day_id: u64)`

Preconditions:

- day is finalized and `Successful`;
- caller checked in on that day;
- caller has not claimed for that day;
- the epoch's reserved reward is available;
- actual supply plus outstanding reservations does not exceed max supply.

Effects:

- mark reward as claimed before any external interaction (there should be no external interaction required);
- reduce `reserved_mint_capacity` by reward amount;
- mint exactly `reward_per_checkin` GEMBULL to caller;
- increase total supply;
- emit NEP-141 `ft_mint` and custom `RitualRewardClaimed` events.

## 6. Emission reservation lifecycle

- On the first check-in of an epoch, require free capacity of at least `MAX_PARTICIPANTS × REWARD_PER_CHECKIN` and reserve the full daily budget (200,000 GEMBULL).
- Later check-ins in the same epoch do not reserve additional capacity.
- On successful finalization, reduce the reservation to `checkin_count × reward_per_checkin`; release the unused portion.
- On failed finalization, release the full 200,000-GEMBULL reservation.
- Each claim converts 1,000 reserved units into 1,000 minted units, keeping `total_supply + reserved_mint_capacity` unchanged.
- If another full daily budget cannot be reserved after the current day is settled, set `ritual_ended=true`, emit `RitualEnded`, and reject future check-ins/settlements without further treasury burns. Existing successful-epoch claims remain available.

## 7. Internal invariants

1. `total_supply <= max_supply` always.
2. `total_supply + reserved_mint_capacity <= max_supply` always.
3. `reserved_mint_capacity` equals the sum of unclaimed reward liabilities from successful epochs plus reservations for active epochs.
4. An account has no more than one check-in per epoch.
5. An account can claim at most one reward per successful epoch.
6. Failed epochs have zero outstanding reward reservation after finalization.
7. Treasury burn never exceeds the contract's ritual treasury token balance.
8. Current streak increments only on successful finalized epochs and resets only on failed finalized epochs.
9. Longest streak is monotonic non-decreasing.
10. Epoch finalization is sequential and idempotency is enforced by state checks.
11. No owner/admin can modify config or call arbitrary mint/burn.
12. Once `ritual_ended=true`, no future ritual settlement can burn treasury or create new reward liabilities; prior successful claims remain claimable.

## 8. Event schema

Standard NEP-141 events:

- `ft_mint` for reward claims;
- `ft_burn` for missed-epoch treasury burns;
- `ft_transfer` for token transfers.

Custom NEP-297 events (standard=`gembull`, version=`1.0.0`):

- `ritual_check_in`: `{day_id, account_id, checkin_count}`;
- `ritual_day_finalized`: `{day_id, outcome, checkin_count, target, reward_reserved, burn_amount, current_streak, longest_streak}`;
- `ritual_reward_claimed`: `{day_id, account_id, amount}`;
- `ritual_ended`: `{reason, final_total_supply, final_longest_streak}`.

Use the exact NEP-297 event envelope and JSON fields. Do not emit non-standard event shapes under the NEP-141 standard name.

## 9. Error cases

Define stable, descriptive errors for: not initialized, wrong epoch, epoch not ended, epoch already finalized, out-of-order finalization, already checked in, minimum balance not met, participant cap reached, storage not registered, reward not available, already claimed, missing reservation, max supply/reservation cap reached, and invalid caller.

## 10. Planned stock simulation interfaces (not deployed)

The v0.2 archive supersedes the earlier `rNVDA` receipt-token plan. A future stock simulation must keep eligible routed-fee and protected graduation-surplus inflows separate; reject spending from the GEMBULL ritual treasury; expose batches and carry-forward balances; and label all mock execution and allocation data `SIMULATED`. Proposed non-transferable Ritual Points count valid check-ins, including failed community days. A proposed five-of-seven completed-epoch window and fixed 1,000-GEMBULL snapshot would determine active-holder eligibility. No point or stock claim is part of the deployed `gembull-core` interface. Exact snapshot, point storage, distributable fraction, and governance remain open in [OPEN_DECISIONS.md](OPEN_DECISIONS.md).

## 11. Deployment posture

- Testnet only.
- Human/team creates accounts and controls deployment keys.
- Contract account access keys and upgrade rights must be documented.
- The absence of a config setter does not by itself prove bytecode immutability; account upgrade permissions must be reviewed separately.
