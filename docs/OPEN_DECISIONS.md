# Open decisions for the GemBull stock layer

The supplied StonkRitual v0.2 archive accepts the **direction** of active-holder-only stock-linked distribution, two stock-reserve funding sources, and a hybrid MVP/production reward model. This does not alter `gembull-core.testnet` or approve any new fee. The deployed daily ritual constants are fixed in the current contract; see [tokenomics](TOKENOMICS.md).

| Proposal from v0.2 | Status |
|---|---|
| 2.00% eligible app-routed trade fee: 1.00% stock reserve, 0.50% buyback reserve, 0.25% community, 0.25% operations | **PROPOSED**; no router or fee is implemented |
| 5.00% of protected net eligible bonding graduation surplus to stock reserve | **PROPOSED**; no bonding curve or graduation exists |
| One non-transferable point per valid check-in; 5 of the previous 7 completed epochs plus a 1,000-GEMBULL snapshot balance for stock eligibility | **PROPOSED**; no points ledger or stock eligibility snapshot exists |
| Active-holder-only, points-weighted simulated allocations | Accepted product direction; implementation pending |
| MVP simulated points/allocation records, with no custom stock receipt token | Accepted v0.2 scope correction; implementation pending |

Decisions still needed before implementation: distributable fraction versus reserve carry-forward; settlement asset and conversion route; bonding curve and solvency proof; exact graduation trigger and protected liabilities; batch minimum and cadence; point storage and historical start date; snapshot block/time and publisher; issuer/custodian, legal rights, KYC, jurisdiction and redemption for any real asset; governance and upgrade authority; liquidity lock venue and duration.

The owner has added **community-selected stock candidates via on-chain voting with no admin winner override** as a product goal. The [governance proposal](COMMUNITY_STOCK_GOVERNANCE.md) records the intended nominate → vote → permissionless finalize → simulated recipient flow. Before implementing a ballot, decide voting weight (one eligible wallet, Ritual Points, or GEMBULL balance), voter/proposer eligibility, nomination storage cost and spam limits, voting window, quorum, tie/no-action handling, eligibility proof across contracts, recipient snapshot and rounding, and contract upgrade authority. None of these settings is deployed or silently fixed by the landing preview.

Numerical proposals require explicit owner review before implementation or marketing. Any change to deployed ritual economics needs a new contract/token deployment and migration plan; there are no admin setters for those parameters. Mainnet and real asset operations require separate approval and review.
