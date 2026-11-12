# RITL Core Contract

`ritl-core` implements the RITL NEP-141 fungible token with NEP-145 storage management, NEP-148 metadata, and the on-chain daily ritual. It was scaffolded with the official `cargo near new` template and then adapted for StonkRitual.

The protocol rules and acceptance criteria are in the repository root `docs/` directory. The current Testnet deployment is `ritl-stonkritual.testnet`; see [`docs/deployments/RITL_TESTNET.md`](../../docs/deployments/RITL_TESTNET.md) for its transaction, genesis accounts, code hash, and verification.

## Local checks

Use stable Rust, the `wasm32-unknown-unknown` target, and cargo-near. On Windows, native Rust tests also need the Visual Studio C++ toolchain and a full Perl installation for sandbox dependencies.

```sh
cargo fmt --check
cargo near check
cargo test --lib
cargo near build non-reproducible-wasm --no-abi
cargo test --test ritual_sandbox
```

The `--no-abi` build option is the official local development fallback for the current Windows ABI linker issue. Sandbox tests read `target/near/ritl_core.wasm`, so build before running them.

## Initialization

`new(public_account, liquidity_account, ecosystem_account)` assigns 600M, 200M, and 50M RITL to the respective accounts and 150M RITL to the contract's own ritual treasury. The deploying team must supply real, reviewed Testnet account IDs; this repository does not invent them.
All four allocation accounts must be distinct so the ritual treasury remains exactly the designated 15% allocation.

`check_in`, `finalize_day`, and `claim_reward` accept an attached NEAR deposit to cover the on-chain records they create. Excess deposit remains on the contract account as storage funding rather than being refunded. This behavior was reviewed for the Testnet demo and must be revisited before production use.
