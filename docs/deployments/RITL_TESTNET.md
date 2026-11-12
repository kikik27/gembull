# RITL NEAR Testnet deployment

Deployed and initialized on **NEAR Testnet** on 2026-11-12. This is a hackathon test token, not a mainnet asset or an equity claim.

| Item | Value |
|---|---|
| Contract account | `ritl-stonkritual.testnet` |
| Deployment and atomic `new` call | [DFKKGqRvQKzuhLRAoj4VYpEWjWZhSUBkDj2KSCnpAg8P](https://explorer.testnet.near.org/transactions/DFKKGqRvQKzuhLRAoj4VYpEWjWZhSUBkDj2KSCnpAg8P) |
| Local Wasm SHA-256 (hex) | `be4feb99d0b17ae5af39bf914109a32a9b00bbce2ecbec19b778fc3907297bcc` |
| On-chain code hash (base58) | `Dou9P84bhbnZY1kdF2CJSCSVjcH2dZbswK74dqYFvWAf` |
| Build | `cargo near build non-reproducible-wasm --locked --no-abi` on Rust 1.99.1, cargo-near 0.23.0 |
| Signer | `ritl-stonkritual.testnet` via Windows keychain; no secret stored in the repository |

## Genesis allocations

| Allocation | Account | RITL | Account creation |
|---|---|---:|---|
| Public | `ritl-public-stonkritual.testnet` | 600,000,000 | [DSpF37x71m5ue1axrnbfntaq85X9n75ZbTAouPLGCMQT](https://explorer.testnet.near.org/transactions/DSpF37x71m5ue1axrnbfntaq85X9n75ZbTAouPLGCMQT) |
| Liquidity | `ritl-liquidity-stonkritual.testnet` | 200,000,000 | [7FGCykDhaDK3PUqdkV7nCedB2ZSCSDWx3C8qR8ig9K5t](https://explorer.testnet.near.org/transactions/7FGCykDhaDK3PUqdkV7nCedB2ZSCSDWx3C8qR8ig9K5t) |
| Ritual treasury | `ritl-stonkritual.testnet` | 150,000,000 | [C9ED9hWkQG5vcYXgEhm6b72kFJYm4Aw9QvwVT97b4C9r](https://explorer.testnet.near.org/transactions/C9ED9hWkQG5vcYXgEhm6b72kFJYm4Aw9QvwVT97b4C9r) |
| Ecosystem | `ritl-ecosystem-stonkritual.testnet` | 50,000,000 | [8pD2KDdJfAtVvdmFAGcE8PGGLjFrfvmQyRQAEg5RxZRq](https://explorer.testnet.near.org/transactions/8pD2KDdJfAtVvdmFAGcE8PGGLjFrfvmQyRQAEg5RxZRq) |

All four accounts were created through the official Testnet faucet with keys saved to the local Windows keychain. `arisandhi.testnet` was confirmed to exist but was **not** used as signer or genesis recipient.

## Verification

Testnet RPC `final` views confirmed `get_rules()`, `get_global_state()`, `ft_metadata()`, `ft_total_supply()`, each of the four `ft_balance_of()` values, and the account's code hash. Genesis supply is exactly **1,000,000,000 RITL**, the treasury holds **150,000,000 RITL**, and the contract reports a 24-hour epoch, target 50, participant cap 200, minimum holding 1,000 RITL, reward 1,000 RITL, and missed-epoch burn of 5 bps. Before deployment, 20 Rust unit tests and one Sandbox integration test passed; the 60-day simulator verified 180 rows.

The web app uses the public Testnet RPC `https://test.rpc.fastnear.com`, which is listed in the [official NEAR provider directory](https://docs.near.org/api/rpc/providers). A `view_account` request returned the deployed code hash, and a browser CORS preflight from `http://localhost:3000` returned HTTP 200 with wildcard origin, method, and header allowances. The former `rpc.testnet.near.org` endpoint returned a deprecation warning for preflight requests.

The contract account currently has **one FullAccess key** (`ed25519:EvizWaiYeMHRtwawKGWCBAT7qSAiiS92cnnbpkmVLuEg`). Its holder can redeploy Wasm, so the bytecode is **upgradeable** even though `get_rules()` parameters have no admin setters. Do not label this deployment fully immutable. The key remains in the local Windows keychain; safeguard that machine and plan controlled access or key rotation before any broader launch. Ritual write methods require payment for storage growth; excess attached Testnet NEAR remains on the contract as storage funding and is not refunded.

No mainnet contract, real stock custody, verified receipt token, or production liquidity is implied by this deployment.
