# GemBull NEAR Testnet deployment

GemBull was deployed and initialized on **NEAR Testnet** on 2026-11-12. This is a hackathon test token; it is separate from the historical [StonkRitual / RITL deployment](RITL_TESTNET.md). No mainnet asset, real stock custody, or production liquidity is implied.

| Item | Verified value |
|---|---|
| Contract account | [`gembull-core.testnet`](https://testnet.nearblocks.io/address/gembull-core.testnet) |
| Atomic code deployment and `new(...)` | [Transaction `5rBtj3zDp9A7BrzuKQWYVzTN2wYnSsVcg8TcztXSaG9j`](https://explorer.testnet.near.org/transactions/5rBtj3zDp9A7BrzuKQWYVzTN2wYnSsVcg8TcztXSaG9j) |
| Local Wasm SHA-256 (hex) | `6ff05ce917092ba276255ab18a69eab01224fb0a18d4e0c8f1c1385059925cf5` |
| On-chain code hash (base58) | `8XxqJ2Nipau9nu5bSAcXPuf8MdLqpnLdw8iDdCxSqWtc` |
| Build | `cargo near build non-reproducible-wasm --locked --no-abi` using Rust 1.99.1 and cargo-near 0.23.0 |
| Deployer/signer | `gembull-core.testnet`, signed via Windows keychain; no secret stored in this repository |

## Genesis accounts and balances

The faucet created each account with 10 Testnet NEAR before deployment. The `new(...)` call minted exactly 1,000,000,000 GEMBULL at 18 decimals:

| Allocation | Account | GEMBULL | Account creation |
|---|---|---:|---|
| Public | `gembull-public.testnet` | 600,000,000 | [Transaction `8UAHDz4wbSdK5PQCwePwpEXohw8W7n7TS2rQDiALyALd`](https://explorer.testnet.near.org/transactions/8UAHDz4wbSdK5PQCwePwpEXohw8W7n7TS2rQDiALyALd) |
| Liquidity allocation | `gembull-liquidity.testnet` | 200,000,000 | [Transaction `69BucUjHxZU1iF4BuhbVPGYEgRvDHmLgiH9Gw9N5jK1F`](https://explorer.testnet.near.org/transactions/69BucUjHxZU1iF4BuhbVPGYEgRvDHmLgiH9Gw9N5jK1F) |
| Ritual treasury | `gembull-core.testnet` | 150,000,000 | [Transaction `BWMJz4i6GddLon7FdvaxJ4wfioEK8K6CGJyqsJEi8c98`](https://explorer.testnet.near.org/transactions/BWMJz4i6GddLon7FdvaxJ4wfioEK8K6CGJyqsJEi8c98) |
| Ecosystem | `gembull-ecosystem.testnet` | 50,000,000 | [Transaction `5GApGtr3DMr2VGBeWUfjuAXX8yM4Pmq1SsjAk3ooETNM`](https://explorer.testnet.near.org/transactions/5GApGtr3DMr2VGBeWUfjuAXX8yM4Pmq1SsjAk3ooETNM) |

These allocation names describe designated balances only. The liquidity account does **not** prove that an LP or trading market exists.

## Read-only verification at finality

Testnet RPC `final` views returned:

- `ft_metadata()`: `GemBull`, `GEMBULL`, 18 decimals. The on-chain `icon` field is empty; campaign artwork is not token metadata.
- `get_rules()`: 24-hour epoch, target 50, participant cap 200, minimum balance 1,000 GEMBULL, reward 1,000 GEMBULL, missed-day treasury burn 5 bps, and maximum supply 1,050,000,000 GEMBULL.
- `ft_total_supply()`: exactly 1,000,000,000 GEMBULL; `get_global_state()` reports a 150,000,000 GEMBULL ritual treasury and zero reserved mint capacity at genesis.
- `ft_balance_of()` for all four accounts reconciles exactly to the genesis allocation table.
- `view_account` code hash matches the local Wasm SHA-256 in base58.

The contract account has **one FullAccess key** (`ed25519:2hJvPF78gtfxsQ5bYtdepVPeggfjJBhMPcxKdGZVvnov`). Its holder can redeploy code, so the bytecode is **upgradeable**. The ritual parameters have no public setter, but this deployment must not be described as fully immutable.

Before deployment, `cargo fmt --check`, `cargo near check`, 20 Rust unit tests, one Linux Sandbox integration test, and the 180-row simulation passed. No live-wallet check-in, successful-epoch claim, or missed-epoch burn has yet been recorded on this new Testnet account; those are the remaining demo steps.

## Web integration

The [production landing](https://web-cyan-three-62.vercel.app) uses `gembull-core.testnet` through `NEXT_PUBLIC_GEMBULL_CONTRACT_ID` and the Testnet RPC `https://test.rpc.fastnear.com`. The production page returned HTTP 200 with GemBull live copy, the contract account, and absolute Open Graph image metadata; the OG image returned HTTP 200 as `image/png`. A browser CORS preflight from the production origin to the RPC returned HTTP 200 with an allowed origin. A headless browser confirmed hydrated `get_rules()` data and the live 1,000,000,000 GEMBULL supply, with no "Awaiting contract" state. Run `pnpm verify:testnet` from the repository root to re-check public chain state without a signing key.
