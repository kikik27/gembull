# Codex Execution Plan

**Goal:** deliver a reproducible NEAR Hackathon MVP for Track 11.  
**Constraint:** hackathon development deadline is 2026-11-14 23:59 UTC.  
**Execution style:** vertical slices; the ritual mechanic is P0 and must not be delayed by stock integrations.

## Phase 0 — Repository and environment reconnaissance

1. Inspect the current repo and preserve existing work.
2. Read `AGENTS.md` and all relevant docs.
3. Read the live `https://nearhackathon.com/HACKATHON.md`.
4. Install/read NEAR official skills: `near-smart-contracts`, `near-dapp`, `near-api-js`.
5. Verify current Rust, `near-sdk`, cargo-near, near-cli-rs, and Sandbox versions from official guidance.
6. Propose the exact workspace tree and commands before adding dependencies.

**Gate:** report versions, repo tree, any conflict with docs, and a short plan. Do not deploy.

## Phase 1 — RITL core contract (P0 / critical path)

1. Scaffold Rust contract with current NEAR SDK.
2. Implement NEP-141/145/148 using maintained official helpers.
3. Add immutable ritual constants and `get_rules()`.
4. Add `check_in`, sequential permissionless `finalize_day`, `claim_reward`.
5. Enforce reward capacity reservations and `MAX_SUPPLY` invariant.
6. Emit NEP-141 mint/burn and NEP-297 ritual events.
7. Implement tests T-01 through T-25 as applicable.

**Gate:** unit and Sandbox tests prove one success, one miss, one claim, duplicate rejection, supply cap, and longest streak.

## Phase 2 — 60-day simulation and track evidence (P0)

1. Implement/verify `scripts/simulate_60_days.py`.
2. Regenerate the CSV and summary.
3. Assert the directional behavior of optimistic/base/pessimistic scenarios.
4. Put the simulation outputs and assumptions in the README.

**Gate:** simulator is dependency-free and reproducible with one command.

## Phase 3 — Ritual dashboard (P0)

1. Scaffold Next.js + TypeScript + Tailwind app.
2. Add NEAR Testnet wallet connection using current recommended SDK.
3. Read `get_rules`, global state, epoch state, account status, and FT balance.
4. Implement check-in, permissionless finalization, and reward claim writes.
5. Show current streak, longest streak, progress, supply, treasury, and event history.
6. Add explorer links and useful wallet/contract errors.

**Gate:** a user can complete a check-in from a test wallet and verify the contract state in the UI.

## Phase 4 — Stock-reserve demonstration (P1 / only after core works)

1. Implement test-only `mockUSDC` or equivalent faucet asset.
2. Implement stock-vault contribution and batch tracking.
3. Implement deterministic mock broker execution and mock issuer attestation.
4. Implement separate simulated `rNVDA` receipt token, with restricted mint authority.
5. Add a persistent SIMULATED / NO REAL EQUITY OWNERSHIP UI disclaimer.
6. Test that stock operations cannot change RITL supply or ritual treasury.

**Gate:** one batch moves from deposit to simulated execution to receipt mint, entirely on Testnet/local Sandbox.

## Phase 5 — Routed purchase fee / liquidity (P2 if time permits)

1. Design an explicit application trade router.
2. Route 1% of eligible in-app purchase volume to the stock vault.
3. Document that transfers and external DEX trades bypass this fee.
4. Add buyback execution only if a real supported market route is integrated and tested.
5. Evaluate Meme.Cooking custom-token compatibility before making it a launch dependency.
6. Evaluate 180-day LP lock or launchpad LP lock and publish lock evidence.

**Gate:** no fee claim in the UI/README until verified end-to-end on-chain.

## Phase 6 — Submission readiness

1. Make README commands exact and test them from a clean checkout.
2. Add LICENSE and `.env.example`; scan for keys/secrets.
3. Add contract IDs, network, block explorer links, and deployed code hashes only after human-approved Testnet deployment.
4. Record a short demo: check-in → epoch success → reward mint; then missed epoch → treasury burn/streak reset.
5. Publish the repository and X demo post only when the human explicitly approves.
6. Re-read the live HACKATHON.md and submission rules.
7. Print the full submission payload and wait for the human's explicit approval before submitting once.

## Critical-path priority

P0: RITL core + tests + 60-day simulation + ritual UI + README evidence.  
P1: stock vault + mock issuer + simulated receipt.  
P2: automated purchase router, production buyback, LP integrations, real equity custody.

If time becomes constrained, cut P2 first, then simplify the visual UI. Never cut the on-chain ritual, its tests, or the 60-day simulation.
