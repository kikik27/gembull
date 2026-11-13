# Test Plan and Acceptance Matrix

## 1. Unit tests — GEMBULL core

| ID | Scenario | Expected result |
|---|---|---|
| T-01 | Initialize once with valid config | Success; initial supply equals 1B |
| T-02 | Initialize twice | Revert |
| T-03 | Read rules | Exact immutable parameters returned |
| T-04 | Check in with balance below 1,000 | Revert |
| T-05 | Check in with sufficient balance | One check-in recorded |
| T-06 | Same account checks in twice in one epoch | Second call reverts |
| T-07 | Account checks in next epoch | Allowed if eligible |
| T-08 | 49 accounts check in, finalize | Failed epoch; burn applied; streak reset |
| T-09 | 50 accounts check in, finalize | Successful epoch; streak increments |
| T-10 | 200 accounts check in | Accepted up to cap |
| T-11 | 201st account checks in | Revert with participant-cap error |
| T-12 | Claim after failed epoch | Revert |
| T-13 | Successful participant claims once | Exactly 1,000 GEMBULL minted |
| T-14 | Same participant claims twice | Second call reverts |
| T-15 | Nonparticipant claims | Revert |
| T-16 | Finalize before epoch end | Revert |
| T-17 | Finalize future/out-of-order epoch | Revert |
| T-18 | Finalize already finalized epoch | Revert |
| T-19 | Missed epoch after a streak | Current streak resets; longest persists |
| T-20 | First check-in reserves full epoch mint budget | 200,000 GEMBULL is reserved exactly once per epoch |
| T-21 | Additional check-in in same epoch | No additional epoch budget is reserved |
| T-22 | Successful finalization with fewer than 200 check-ins | Unused reservation is released; liabilities equal `count × reward` |
| T-23 | Failed finalization | Full daily reservation is released |
| T-24 | Reward reservations approach max supply | No state can make `total_supply + reserved > max_supply` |
| T-25 | Missed epoch with zero treasury | No underflow; burn is zero |
| T-26 | Burn rounding with non-zero tiny treasury | Minimum one base unit is burned if applicable |
| T-27 | Transfer to unregistered account | Follows NEP-141/storage rules |
| T-28 | Storage deposit and unregister | Follows NEP-145 behavior |
| T-29 | Event parsing | NEP-141 and custom NEP-297 envelopes valid |

## 2. Sandbox integration tests

- Deploy GEMBULL and mock accounts in local Sandbox.
- Register holders and distribute test GEMBULL.
- Use Sandbox fast-forward/time-travel to cross epoch boundaries.
- Verify successful and failed epochs end to end.
- Verify permissionless settlement from a non-admin account.
- Verify a claim can be made after success and only once.
- When implemented, verify both simulated stock funding sources, protected-surplus calculation, points eligibility, and allocations remain isolated from GEMBULL ritual treasury; no custom receipt mint is in the revised MVP.
- Test the proposed active-holder window at 4/7, 5/7, and 7/7 valid check-ins; a failed community day still gives its valid check-in point. Test a balance below/exactly at the proposed snapshot minimum, zero eligible holders, carry-forward, and rounding dust. These tests are pending until the points/simulation layer exists.
- Verify mock broker failure does not impact ritual transactions.
- When the separate governance contract exists, test nomination, wallet-signed vote, duplicate prevention, eligibility cross-call failure, voting window boundaries, tie/no-quorum behavior, and permissionless finalization. Verify no admin method can override the tally. These tests are pending; there is no deployed ballot today.

## 3. Property / invariant tests

For generated action sequences, assert:

```text
total_supply <= max_supply
total_supply + reserved_mint_capacity <= max_supply
longest_streak >= current_streak
ritual_treasury_balance >= 0
successful_epoch_claims <= epoch_checkin_count
failed_epoch_claims == 0
checkin_count <= max_participants
one_checkin_per_account_per_epoch
one_reward_claim_per_account_per_successful_epoch
```

## 4. Simulation verification

- Run `python scripts/simulate_60_days.py`.
- Verify optimistic scenario increases supply net over 60 days.
- Verify base scenario produces a smaller net increase than optimistic.
- Verify pessimistic scenario decreases supply net over 60 days.
- Verify all three remain within max supply.
- Compare the output CSV with `docs/simulation/gembull-60-day-simulation.csv`.

## 5. Frontend acceptance

- Connected wallet and network are shown correctly.
- `get_rules()` drives displayed parameters.
- Check-in button follows on-chain eligibility.
- Progress and countdown distinguish active from awaiting-settlement states.
- Claim is shown only for eligible, unclaimed successful epochs.
- Event history displays transaction hashes and event source.
- Simulated stock allocation and Ritual Points screens show a persistent simulated/no-equity disclaimer.

## 6. Release gate

No testnet release until:
- all P0 tests pass;
- `cargo fmt --check` and `cargo test` pass;
- Sandbox integration tests pass;
- frontend typecheck/lint/build pass;
- simulator output is regenerated and matches docs;
- no secrets are present in repo or git history;
- deployment account access-key and upgrade posture are documented.
