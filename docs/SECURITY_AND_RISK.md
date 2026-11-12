# Security, Trust Model, and Risk Register

## 1. Core security requirements

- NEP-141, NEP-145, and NEP-148 behavior must use maintained standard implementations/helpers.
- Validate `predecessor_account_id` for all privileged/receiver paths.
- No privileged mutation methods for ritual constants.
- No arbitrary mint/burn entry points.
- Use checked arithmetic and explicit integer rounding.
- Validate storage deposits and storage growth.
- Use unique storage prefixes.
- Avoid unbounded participant loops; reward claims are per-account.
- Settle epochs sequentially and make duplicate finalization impossible.
- Keep state updates and token supply changes atomic within the same contract execution.
- If cross-contract calls are introduced, follow promise/callback validation and failure handling in the official NEAR skill.

## 2. Threat model

| Threat | Impact | Mitigation / residual risk |
|---|---|---|
| Duplicate check-in | Inflated progress / rewards | `(day_id, account_id)` unique state; reject duplicates |
| Sybil accounts | One person farms multiple rewards | Min balance + account-level one-per-day + participant cap; still not proof of personhood |
| Reward over-mint | Supply exceeds cap | Reserve mint capacity at check-in; assert `supply + reserved <= max_supply` |
| Duplicate reward claim | Double mint | Claim state written and checked atomically |
| Early / repeated settlement | Incorrect streak or burns | Chain timestamp check, sequential day ID, finalized status |
| Treasury underflow | Invalid burn | Burn min(calculated amount, treasury balance); checked arithmetic |
| Unauthorized burn | Supply manipulation | Burn only from ritual treasury during failed `finalize_day` |
| Contract admin reconfiguration | Rules changed after launch | No setters; inspect deployment account upgrade permissions separately |
| Indexer outage | UI history incomplete | Direct contract reads remain authoritative; indexer is read-only |
| Stale stock quote | Misleading estimated value | Timestamp/source label; quote never proves custody |
| Mock broker forgery | False impression of stock ownership | Prominent SIMULATED label, testnet-only tokens, no redemption |
| Contract upgrade | Rules/code can be replaced | Restrict/remove deploy authority after review; do not claim immutability without proof |
| DEX buy bypass | Stock fee not applied | State clearly that 1% fee only applies to routed app purchases; external routes bypass it |

## 3. Sybil-resistance statement

The hackathon MVP uses one check-in per NEAR account per epoch and requires a minimum GEMBULL balance of 1,000 at check-in. This is a low-friction anti-spam mechanism. It does not establish one-human-one-account: a user can create multiple NEAR accounts and fund each. The system must not claim proof-of-personhood or Sybil-proof behavior.

## 4. Contract immutability statement

The contract has no method for changing the configured ritual parameters after initialization. That is application-level immutability. A NEAR account with permission to redeploy the contract Wasm can still change code. Deployment must document access keys, multisig controls, and whether the code-upgrade authority has been removed or constrained. Do not equate absence of setters with fully immutable bytecode.

## 5. RWA / stock-receipt risk statement

- Price data is not proof that stock is held.
- A broker order result is not necessarily final settlement or beneficial ownership.
- A token wrapper does not automatically confer rights in the underlying security.
- Real deployment requires an issuer, qualified broker/custodian, enforceable holder rights, transfer restrictions where needed, KYC/AML and jurisdictional assessment.
- Hackathon `rNVDA` is a simulation-only artifact; it does not confer rights, dividends, voting, redemption, or beneficial ownership.

## 6. Operational controls

- No mainnet deployment or real-money movement in the hackathon MVP.
- Never commit seed phrases, private keys, API tokens, or production credentials.
- Provide `.env.example` only with placeholder keys.
- Test both success and failure paths with Sandbox time-travel.
- Review all generated contract code before deployment.
