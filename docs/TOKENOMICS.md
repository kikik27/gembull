# Tokenomics & Ritual Rules

**Token name:** GemBull<br>
**Symbol:** GEMBULL<br>
**Decimals:** 18 (NEP-148 metadata; all calculations use integer base units)<br>
**Initial supply:** 1,000,000,000 GEMBULL<br>
**Maximum supply:** 1,050,000,000 GEMBULL<br>
**Emission headroom:** 50,000,000 GEMBULL<br>
**Rule status:** proposed genesis constants; immutable after contract initialization

## 1. Allocation at genesis

| Allocation | Share | Amount | Treatment |
|---|---:|---:|---|
| Public / fair launch distribution | 60% | 600,000,000 | Community distribution |
| Initial liquidity inventory | 20% | 200,000,000 | Liquidity provisioning / lock subject to venue compatibility |
| Ritual treasury | 15% | 150,000,000 | Held by the GEMBULL contract; only ritual failure burn may reduce it |
| Ecosystem / operations | 5% | 50,000,000 | Transparent operating and ecosystem allocation |
| Team | 0% | 0 | No team allocation in hackathon tokenomics |
| **Total initial supply** | **100%** | **1,000,000,000** | |

The token has a **fixed maximum supply**, not a fixed supply. The initial billion is minted at genesis; up to another 50 million may be minted only by successful ritual reward claims. No admin mint endpoint exists.

## 2. Daily ritual constants

| Constant | Value | Explanation |
|---|---:|---|
| `EPOCH_DURATION_NS` | 86,400,000,000,000 ns | 24 hours |
| `DAILY_TARGET` | 50 | Minimum successful unique account check-ins |
| `MIN_HOLDING` | 1,000 GEMBULL | Required at the moment of check-in |
| `MAX_PARTICIPANTS` | 200 | Demo cap per epoch |
| `REWARD_PER_CHECKIN` | 1,000 GEMBULL | Reward for each participant in a successful epoch |
| `TREASURY_BURN_BPS` | 5 | 5 basis points = 0.05% of remaining ritual treasury per missed epoch |
| `MAX_SUPPLY` | 1,050,000,000 GEMBULL | Hard emission ceiling |
| `MAX_MINT_PER_EPOCH` | 200,000 GEMBULL | `MAX_PARTICIPANTS × REWARD_PER_CHECKIN` |

All parameters are returned by `get_rules()` and have no setter method. A user must hold the minimum GEMBULL balance when checking in. The account is not required to maintain that balance after check-in.

## 3. Epoch mechanics

1. Epoch 0 begins at the contract's initialization timestamp. Epoch length is fixed at 24 hours.
2. An eligible NEAR account calls `check_in()` once during an epoch.
3. A check-in succeeds only if the account is registered for NEP-141 storage, has at least 1,000 GEMBULL, has not checked in during the epoch, the epoch is active, and fewer than 200 accounts have checked in.
4. The first accepted check-in in an epoch reserves the full maximum daily mint budget of 200,000 GEMBULL. Later check-ins in that epoch do not add more reservation. This guarantees the contract can honor every accepted participant if the epoch succeeds.
5. After the epoch ends, any account may call `finalize_day(day_id)` in sequential order.
6. If the check-in count is at least 50, the epoch succeeds. The current streak increments; the longest streak is updated if needed. Every participant receives a claim entitlement for 1,000 GEMBULL.
7. On success, the contract reduces the epoch reservation from 200,000 GEMBULL to `checkin_count × 1,000 GEMBULL`, releasing unused capacity. Each eligible participant calls `claim_reward(day_id)` individually; the call mints 1,000 GEMBULL and reduces the outstanding reservation by the same amount. It can succeed only once per account per successful epoch.
8. If the count is below 50, the epoch fails. The contract burns `floor(remaining_ritual_treasury × 5 / 10,000)` GEMBULL from its own ritual treasury balance (minimum 1 base unit if the treasury balance is non-zero), releases the epoch's full 200,000-GEMBULL reward reservation, resets current streak to zero, and preserves longest streak.

## 4. Why claim-per-user

A settlement transaction must not loop over every participant to mint rewards. NEAR gas and state growth make an unbounded batch operation undesirable. The contract stores each account's participation and entitlement, then the participant claims their own reward. A successful epoch is therefore a reward entitlement until claimed; the 60-day simulator assumes all eligible users claim.

## 5. Why 5 bps treasury burn

The failure burn is proportional to the **remaining** ritual treasury, not total supply. It is deliberately small and predictable. The goal is to make missed community participation visible in supply, without destroying most of the treasury after a small number of misses.

Formula:

```text
burn_amount = floor(ritual_treasury_balance * 5 / 10_000)
```

The burn can never exceed the contract's ritual treasury balance. The corresponding NEP-141 `ft_burn` event must be emitted.

## 6. Buy-to-stock reserve design (separate from ritual supply)

The intended production route allocates **1.00% of purchases made through the GemBull application router** to a separate stock-acquisition vault. This does not apply to arbitrary NEP-141 transfers or trades routed through unrelated DEX contracts.

Planned 2.00% application purchase fee:

| Allocation | Share of routed purchase value |
|---|---:|
| Stock acquisition reserve | 1.00% |
| Buyback execution reserve | 0.50% |
| Community treasury | 0.25% |
| Operations | 0.25% |
| **Total** | **2.00%** |

The buyback reserve is a future execution feature and must not be represented as a completed buyback until a real supported market route is integrated. The core missed-ritual treasury burn is implemented independently of this purchase fee.

The hackathon stock-reserve demo uses mock stablecoins and a mock broker. `rNVDA` is an illustrative test receipt; it carries no real stock ownership, dividends, redemption, or other security rights.

## 7. LP policy

LP locking is secondary to the Track 11 mechanic. Target policy for a later liquidity launch is a 180-day lock, with publicly readable lock owner, amount, asset IDs, lock time, and unlock time. Do not burn LP receipts permanently for the MVP. Meme.Cooking's public buyer guide describes its own launch auction and LP locking design, but custom-contract compatibility must be verified before relying on it.

## 8. 60-day scenario simulation

The simulator uses the constants above and assumes 100% reward claiming. It deliberately models three distinct participation patterns:

- **Optimistic:** 70 check-ins on 45 days and 35 on 15 days (failure every fourth day).
- **Base:** 60 check-ins on 36 days and 40 on 24 days (three successful days followed by two missed days).
- **Pessimistic:** 55 check-ins on 18 days and 25 on 42 days (three successful days followed by seven missed days per 10-day cycle).

See `simulation/60_DAY_SIMULATION.md` and `simulation/gembull-60-day-simulation.csv`. These are deterministic assumptions, not market forecasts or claims about actual users.

## 9. Sybil resistance and limitations

MVP anti-spam controls:

- one check-in per NEAR account per epoch;
- minimum 1,000 GEMBULL holding at check-in;
- maximum 200 accepted accounts per epoch;
- on-chain caller/account validation.

This is **account-level friction, not proof of one-human-one-account**. A person can create multiple NEAR accounts and fund each one with the minimum balance. The hackathon README must say this plainly. Do not describe the system as Sybil-proof or proof-of-personhood.

## 10. Rule immutability and upgrade risk

There is no contract method to change ritual constants after initialization. However, NEAR account deployment permissions are a separate trust surface: an account with permission to redeploy Wasm may still replace the code. The deployment checklist must record the contract account's access-key / multisig posture. Do not call the deployed contract fully immutable unless upgrade authority has actually been removed or constrained and the result has been verified.
