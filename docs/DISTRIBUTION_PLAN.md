# GemBull distribution routes

This document separates **balances already minted on NEAR Testnet** from mechanisms that have not been implemented. It does not approve a sale, price, launch venue, emission change, or mainnet distribution. The verified genesis allocation is in [GEMBULL_TESTNET.md](deployments/GEMBULL_TESTNET.md).

## Where the tokens are now

| Genesis bucket | Testnet account | Balance at genesis | Authorized purpose |
|---|---|---:|---|
| Public / fair launch | `gembull-public.testnet` | 600,000,000 GEMBULL | Source for community distribution; exact public launch rules are not yet chosen |
| Liquidity inventory | `gembull-liquidity.testnet` | 200,000,000 GEMBULL | Inventory for a future, separately approved liquidity pool |
| Ritual treasury | `gembull-core.testnet` | 150,000,000 GEMBULL | Locked inside the contract; only missed-epoch finalization can burn it |
| Ecosystem / operations | `gembull-ecosystem.testnet` | 50,000,000 GEMBULL | Separate project operations allocation |

All 1,000,000,000 genesis tokens already exist. Distributing them uses NEP-141 transfers; it does **not** mint new tokens. The only later mint is a valid successful-epoch reward claim, bounded by the 1,050,000,000 cap.

## Route A — current Testnet ritual pilot

```text
gembull-public.testnet (existing public allocation)
  → NEP-141 ft_transfer on gembull-core.testnet
  → registered Testnet participant wallet
  → check_in on gembull-core.testnet
```

The participant first registers GEMBULL storage via `storage_deposit` in the app (or the distribution operator can pay registration for the participant). A team-controlled signer then transfers at least **1,000 GEMBULL** to each eligible test wallet. NEP-141 `ft_transfer` requires exactly **1 yoctoNEAR** attached; the token amount is a decimal string in 18-decimal base units. For example, 1,000 GEMBULL is `1000000000000000000000` base units. The contract's `ft_balance_of` and the `ft_transfer` transaction are the audit trail. Keep the signer off the public website and out of client environment variables.

Standards: [NEP-141 fungible token transfer](https://github.com/near/neps/blob/master/neps/nep-0141.md) and [NEP-145 storage management](https://github.com/near/neps/blob/master/neps/nep-0145.md).

For a small pilot, the team can make reviewed transfers from the public allocation account to named Testnet accounts. To test the **successful** day path live, at least **50 distinct registered accounts** must each receive the minimum balance and check in before the epoch ends. Allocating 1,000 each would move 50,000 GEMBULL from the existing public bucket; this is a **demo example**, not an approved public airdrop policy. One account cannot prove 50 independent humans. For a larger test, build a limited, auditable claim distributor funded with a bounded amount from the public account, with one claim per eligible account and explicit anti-abuse rules. Such a distributor is **not implemented** today.

This route is **distribution of test tokens**, not a purchase. Testnet NEAR used for gas or token storage is not payment for GEMBULL. The current app has no Buy button, DEX integration, or GEMBULL faucet.

## Route B — future trading, not live

```text
gembull-liquidity.testnet inventory + a separately supplied quote asset
  → reviewed NEAR DEX pool / launch venue
  → user swaps quote asset for existing GEMBULL
  → user registers storage and checks in
```

The pool, quote asset, starting price, funding source, launch timing, LP control/lock, and venue compatibility require explicit decisions and tests. The 200,000,000 allocation is only held in a wallet today; **no pool or market is implied**. The 600,000,000 public allocation needs its own approved release policy (for example a claim, auction, or sale); this document does not select one. An external DEX swap would not automatically pay the proposed stock-reserve fee. A future app router would need its own implementation and review before such a fee could exist.

## Current operational gap

The contract supports `storage_deposit`, `ft_transfer`, and `check_in`, and the app supports storage registration and check-in. It does **not** provide a distribution button, claim distributor, purchase route, or LP. The next Testnet demo task is to register/fund real tester wallets from `gembull-public.testnet`, then record a live check-in. Do not publish or execute a mainnet launch/distribution policy until it is approved separately.
