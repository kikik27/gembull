# Codex Start Prompt — StonkRitual

You are the implementation agent for **StonkRitual**, a NEAR-native memecoin project for NEAR Hackathon Track 11 (`memecoins`).

Before coding, read `AGENTS.md`, `README.md`, and every document under `docs/`, especially `HACKATHON_ALIGNMENT.md`, `PRD.md`, `TOKENOMICS.md`, `SMART_CONTRACT_SPEC.md`, `SECURITY_AND_RISK.md`, `TEST_PLAN.md`, and `EXECUTION_PLAN.md`.

Then read the live hackathon instructions at `https://nearhackathon.com/HACKATHON.md` and install/read the official NEAR agent skills:

```bash
pnpm dlx skills add near/agent-skills --skill near-smart-contracts
pnpm dlx skills add near/agent-skills --skill near-dapp
pnpm dlx skills add near/agent-skills --skill near-api-js
```

Use the current official guidance and stable versions. The official smart-contract skill covers Rust contracts based on `near-sdk` v5.x. Do not assume old APIs or package versions.

## First response required

Inspect the repository without modifying it. Report:

1. Current repository tree and existing code.
2. Current NEAR/Rust toolchain and SDK recommendations.
3. Proposed workspace/file tree.
4. Exact P0 implementation sequence.
5. Any conflicts, missing assumptions, or technical risks in the product documents.

Do not deploy, publish, push, force-push, post to X, transfer funds, or submit to the hackathon. Do not create or use real broker/custodian credentials. Wait for the human to approve the implementation plan before making broad structural changes.

## Product invariants

- RITL is a NEP-141 token and the daily ritual mechanic must be implemented in the same NEAR contract.
- Contract parameters are initialized once and exposed through `get_rules()`; no admin setters exist.
- The first check-in of an epoch reserves a full `MAX_PARTICIPANTS × REWARD_PER_CHECKIN` emission budget.
- Successful epochs create per-account reward claims; each eligible account claims once. Do not loop over all users at finalization.
- Missed epochs burn only the configured basis-point slice of the RITL ritual treasury and reset current streak.
- Longest streak never decreases.
- Enforce sequential settlement and `total_supply + reserved_mint_capacity <= max_supply`.
- No unrestricted mint or burn endpoints.
- Stock reserve and receipt token are isolated from RITL ritual balances. Stock integration is mock-only and permanently labeled `SIMULATED` in the hackathon version.
- Sybil controls are account-level friction, not proof-of-personhood; README must disclose the limitation.

Implement the P0 critical path from `docs/EXECUTION_PLAN.md`: RITL contract, unit/Sandbox tests, 60-day simulator, and ritual UI. Implement stock simulation only after the core mechanic passes its tests. If any spec conflicts with the current upstream NEAR documentation, stop and report the conflict rather than silently inventing an API.
