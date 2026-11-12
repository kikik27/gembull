# Test GemBull with a NEAR Testnet wallet

**App:** <https://web-cyan-three-62.vercel.app>

**Live token contract:** `gembull-core.testnet`
**Network:** NEAR Testnet. GEMBULL Testnet tokens are not stock or mainnet assets.

## After connecting

1. Open **Ritual**. Confirm the page shows your account, `Testnet`, live rules, supply, current day and target progress. These are read-only contract views.
2. If **Register token storage** appears, click it and approve the NEAR wallet transaction. NEP-145 registration uses a small Testnet NEAR deposit. A wallet connection alone does not register the account as a GEMBULL token holder.
3. Obtain at least **1,000 GEMBULL** from the project's Testnet public allocation account `gembull-public.testnet`. There is **no in-app GEMBULL faucet or purchase route** today. A team member can first run the read-only preflight `pnpm distribute:testnet <account.testnet> 5000 --dry-run`, then approve and run the same command without `--dry-run` to transfer test tokens. Registration alone leaves the GEMBULL balance at zero. This is test-token distribution, not a purchase. See the [distribution routes](DISTRIBUTION_PLAN.md). Never share a seed phrase or private key to receive tokens.
4. Wait for the app's contract refresh after the transfer finalizes, or reload if necessary. Confirm **Your balance** is at least 1,000 GEMBULL. Click **Check in now** and approve the wallet transaction. The app attaches 0.05 Testnet NEAR for contract storage; excess remains with the contract. A successful check-in changes the status to **Checked in for this epoch** and increments the day count. The same account cannot check in twice in one epoch.
5. After a 24-hour epoch closes, **Settle day N** becomes available if earlier epochs are settled. Anyone may settle the next unsettled epoch; future or skipped epochs are rejected. If at least **50 distinct eligible accounts** checked in, open **Epoch history** and use the claim button on the successful day to claim **1,000 GEMBULL** once. If fewer than 50 checked in, there is **no reward claim**; finalization burns 0.05% of the remaining ritual treasury and resets the current streak.

The 50-account target means one tester cannot demonstrate a successful live claim alone. Use the contract Sandbox integration test for time-travel success and failure cases; do not describe its transactions as live Testnet evidence. There is no stock trade, real stock balance, Ritual Points claim, or `rNVDA` receipt action in the deployed app.

## Reproduce the contract checks locally

From the repository root, run `pnpm verify:testnet` for current contract metadata, rules, supply, code hash and upgrade authority. Run `python scripts/simulate_60_days.py --check` for the published supply simulation. For contract tests, follow the [contract README](../contracts/gembull-core/README.md), including the Linux/macOS Sandbox requirement. The [Testnet deployment record](deployments/GEMBULL_TESTNET.md) contains the verified genesis transaction and allocations.
