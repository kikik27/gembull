# GemBull core contract

`gembull-core` is the Rust NEP-141 fungible token and daily ritual contract. It also implements NEP-145 storage management, NEP-148 metadata, and NEP-297 custom ritual events. New initialization sets `ft_metadata()` and `get_rules()` to `GemBull` / `GEMBULL`; the custom event standard is `gembull`.

The ritual constants and supply rules are unchanged from the previous RITL prototype. See [tokenomics](../../docs/TOKENOMICS.md), [contract specification](../../docs/SMART_CONTRACT_SPEC.md), and [test plan](../../docs/TEST_PLAN.md). This source was deployed as **GemBull / GEMBULL** at [`gembull-core.testnet`](../../docs/deployments/GEMBULL_TESTNET.md). The older `ritl-stonkritual.testnet` deployment remains a separate **StonkRitual / RITL** token in the [legacy record](../../docs/deployments/RITL_TESTNET.md).

## Build and verify

Use stable Rust, the `wasm32-unknown-unknown` target, and cargo-near:

```sh
cd contracts/gembull-core
cargo fmt --check
cargo near check
cargo test --lib
cargo near build non-reproducible-wasm --no-abi
cargo test --test ritual_sandbox
```

Sandbox reads `target/near/gembull_core.wasm`; build the Wasm first. On Windows, run Sandbox in a Linux environment with a Rust toolchain. The `--no-abi` option is the documented local fallback for the Windows ABI linker issue in this repository.

## Initialization

`new(public_account, liquidity_account, ecosystem_account)` assigns 600M, 200M, and 50M GEMBULL to the respective accounts and 150M GEMBULL to the contract's own ritual treasury. All four allocation accounts must be distinct. A deploying team supplies real reviewed Testnet account IDs; this repository does not invent or create them.

`check_in`, `finalize_day`, and `claim_reward` accept attached NEAR to fund storage growth. Excess attached deposit remains with the contract rather than being refunded. That behavior must be reviewed before production use.
