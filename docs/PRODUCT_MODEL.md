# GemBull product model — v0.2 alignment

This document adapts the supplied `stonkritual-docs-v0.2.zip` (12 November 2026) to the GemBull name and the already deployed Testnet contract. The archive describes a **product direction**, not a replacement genesis or proof of implemented stock infrastructure. [Testnet deployment](deployments/GEMBULL_TESTNET.md) and [tokenomics](TOKENOMICS.md) remain authoritative for live token rules.

## Three pillars and status

| Pillar | Product intent | Current state |
|---|---|---|
| Daily ritual | One eligible check-in per 24-hour epoch; 50-account target; successful claims mint 1,000 GEMBULL; a miss burns 5 bps of the ritual treasury | **LIVE on NEAR Testnet** in `gembull-core.testnet` |
| Stock Acquisition Treasury | Separate accounting for eligible routed trading fees and protected bonding graduation surplus | **PLANNED / SIMULATED**; no router, bonding curve, stock vault, broker execution, or real asset custody is deployed |
| Active-holder stock-linked rewards | Allocate simulated rewards to active holders using activity points, not balances above the eligibility minimum | **PLANNED / SIMULATED**; there is no on-chain Ritual Points ledger or stock reward claim |

## Proposed stock reserve design

The archived model proposes **1.00% of eligible app-routed trade notional** for a separate stock reserve, within a proposed 2.00% total routed fee. Direct GEMBULL transfers and trades outside a future router do not pay this fee. It also proposes **5% of net eligible bonding graduation surplus** as a second reserve source. Neither route exists today; these percentages are **PROPOSED**, not a deployed fee or approved economic commitment.

`net_eligible_surplus = max(0, accepted_proceeds - refunds_and_refund_liabilities - mandatory_lp_seed - settlement_costs - minimum_protocol_reserve - other_disclosed_liabilities)`

Only a positive surplus could contribute. Funds needed for refunds, bonding solvency, mandatory liquidity, and disclosed reserves must remain protected. A future implementation must keep both inflow sources, pending batches, simulated execution, distributable amount, carry-forward, and rounding dust separately auditable. It must never mix these with the on-chain ritual burn treasury.

## Proposed active-holder model

The archive proposes one non-transferable **Ritual Point** per valid check-in, including a day when the community target is missed. Proposed eligibility is **5 valid check-ins in the previous 7 completed epochs** plus at least **1,000 GEMBULL at a fixed distribution snapshot**. Allocation weight would depend on eligible points, not the amount of GEMBULL above the threshold. The snapshot definition, distributable share of a stock batch, and points implementation are still open. The deployed contract has no points method or historical point ledger. Do not show retroactive points as verified.

For the MVP, any stock allocation is a **SIMULATED** record only. No `rNVDA` or other self-created stock receipt token is part of the revised MVP. Points and simulated allocations are not shares, cash, dividends, redeemable claims, or a promise of future equity. An actual stock-linked asset requires issuer authorization, custody evidence, legal and jurisdiction review, and eligibility controls before it can be described as a real distribution.

## What a tester can do now

Connect a NEAR Testnet wallet, read live rules/supply/history, register token storage, receive test GEMBULL, check in once per epoch, and inspect settlement or claims when their preconditions hold. See the [Testnet user guide](TESTNET_USER_GUIDE.md). The stock vault shown on the landing is a **SIMULATED concept**, not a usable trade or equity product.
