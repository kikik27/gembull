# Community stock direction — proposed Testnet governance

**Status: design proposal, not deployed.** The live `gembull-core.testnet` contract governs only GEMBULL and the daily ritual. The stock reserve, stock selection vote, Ritual Points, allocation ledger, and any broker route do not exist on-chain today. This document does not change the deployed token economics or authorize a stock purchase.

## Product goal

Let the community decide which stock **candidate** a future, separate reserve would examine. Make every nomination, ballot, tally, and simulated allocation auditable by NEAR account. The team can explain and maintain the community interface, but must not be able to appoint a winner, change a ballot, or redirect the ritual treasury. A winning vote is a preference signal, not an order, a security entitlement, or a guarantee that the stock can be acquired.

## Proposed user journey

1. **Nominate.** An eligible wallet submits a candidate with a canonical ticker, market/exchange identifier, and public description. The proposer pays the storage cost. Candidate metadata is community-submitted and must be labeled unverified until independently checked. The contract rejects duplicates and bounds candidate count and text size.
2. **Vote.** An eligible wallet signs a NEAR transaction for one candidate during a published voting window. The governance contract records the account, round, choice, and tally. Voting weight and eligibility are an open product decision; no frontend or indexer may decide whether a vote counts.
3. **Finalize.** Any account may close an ended round. The contract computes the result from stored ballots, emits an event, and exposes the complete tally. A tie, no quorum, or no viable candidate must lead to a defined no-action/carry-forward state, never an administrator's tie-break.
4. **Simulate a batch.** A separately funded mock reserve can associate a batch with the winning candidate. Show source-separated hypothetical inflows, mock execution, and unspent carry-forward. No actual trade or share is created by a vote.
5. **Show who would receive an allocation.** A public simulated ledger should list eligible NEAR account IDs, verified activity points, the fixed eligibility snapshot, each account's calculated portion, the batch ID, and rounding carry-forward. An account must be able to inspect its own calculation and the same underlying data as everyone else. Until that ledger exists, the UI must show the rule and `NOT IMPLEMENTED`, never fabricate a recipient list.

## Recipient rule under review

The v0.2 proposal awards one non-transferable Ritual Point per valid check-in, including a missed community day. A wallet would need at least five valid check-ins in the previous seven **completed** epochs and at least 1,000 GEMBULL at a fixed distribution snapshot. Eligible points, rather than holdings above the minimum, would weight a simulated allocation. The exact start date, snapshot mechanism, distributable fraction, and rounding policy remain open in [OPEN_DECISIONS.md](OPEN_DECISIONS.md). No historical points or recipient entitlements are currently verified.

## Technical boundary

- Use a **separate NEAR Testnet governance contract**; do not add voting, fees, or stock claims to the deployed ritual token contract.
- Nomination, ballot validation, one-vote enforcement, tally, and finalization must be on-chain. The backend may index events but cannot create ballots, choose a winner, or publish an authoritative tally.
- Use bounded per-account writes and pagination. Do not enumerate all voters or recipients in one finalization transaction.
- Decide how the governance contract verifies voting and recipient eligibility from `gembull-core` on-chain before implementation. A client-supplied balance or indexer assertion is insufficient. Check-in and balance snapshots have different timing and cannot be treated as equivalent.
- A future allocation contract must calculate claims from frozen, verifiable state or a challengeable proof. It cannot rely on an unreviewable team-published spreadsheet or Merkle root as the only authority.
- No public admin method may edit candidates after voting opens, change vote weights or tallies, select a winner, transfer reserve assets, or mint stock receipts. Removing privileged methods alone is insufficient while a contract account retains a FullAccess upgrade key; the deployment authority and upgrade policy must be settled and published before claiming the vote is admin-free.

## Limits of “no admin”

Community governance can control the **on-chain selection rule**. It cannot itself prove a ticker is authentic, execute a regulated stock purchase, hold securities, or grant shareholder rights. A real broker, issuer, custodian, legal structure, and jurisdictional controls would still be required for real shares. The Testnet MVP is a vote about a **simulated** target and simulated allocation records only. GEMBULL holders are not shareholders by virtue of holding GEMBULL, voting, or receiving points.

## Acceptance gates before calling voting live

1. Human review of voting weight, eligibility, nomination limits, windows, quorum/tie rules, deposits, and upgrade authority.
2. A separate Rust contract with tests for duplicate votes, ineligible accounts, duplicate/spam candidates, window boundaries, ties, zero quorum, permissionless finalization, storage funding, and attempted admin override.
3. Sandbox integration tests including failed cross-contract eligibility checks and a full nominate → vote → finalize round.
4. A wallet-signed UI that reads contract state, links to transactions, distinguishes pending/success/failure, and never substitutes local state for a real vote.
5. A Testnet deployment record and independent verification of code hash, account keys, round state, and UI contract ID.
