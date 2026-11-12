# Instructions for Codex and other coding agents

You are implementing **StonkRitual**, a NEAR-native memecoin with a contract-enforced daily ritual mechanic. Treat the documents in `/docs` as the product and technical source of truth. Do not silently change tokenomics, timing rules, mint/burn parameters, custody semantics, or scope.

## Mandatory reading order

1. `README.md`
2. `docs/HACKATHON_ALIGNMENT.md`
3. `docs/BRD.md`
4. `docs/PRD.md`
5. `docs/TOKENOMICS.md`
6. `docs/TECHNICAL_ARCHITECTURE.md`
7. `docs/SMART_CONTRACT_SPEC.md`
8. `docs/SECURITY_AND_RISK.md`
9. `docs/TEST_PLAN.md`
10. The live `https://nearhackathon.com/HACKATHON.md`
11. The official `near-smart-contracts` agent skill at `https://github.com/near/agent-skills/tree/main/skills/near-smart-contracts`

Install the relevant official skills when the environment supports it:

```bash
pnpm dlx skills add near/agent-skills --skill near-smart-contracts
pnpm dlx skills add near/agent-skills --skill near-dapp
pnpm dlx skills add near/agent-skills --skill near-api-js
```

Use the exact skill instructions, current stable toolchain, and upstream docs. The current smart-contract skill describes Rust contracts using `near-sdk` v5.x. Do not pin stale crate versions without checking the current skill and crate releases.

## Non-negotiable rules

- The daily ritual state machine and its parameters must live in the NEAR contract, not in the backend.
- Implement the token using NEP-141 and the related storage/metadata standards NEP-145 and NEP-148.
- No public owner/admin method may mutate `daily_target`, `reward_per_checkin`, `burn_bps`, `epoch_duration`, `minimum_balance`, `max_participants`, `initial_supply`, or `max_supply` after initialization.
- No unrestricted mint method. Reward minting is allowed only through a valid successful epoch claim and subject to the fixed maximum supply.
- Treasury burn is allowed only through missed-epoch finalization and only from the designated ritual treasury balance.
- A single account may check in at most once per epoch. A check-in must satisfy the configured minimum RITL balance.
- Do not enumerate every participant in one finalization transaction. Use one full daily mint-capacity reservation on the first check-in of each epoch; then release unused capacity at finalization and use per-account reward claims after finalization.
- Enforce a deterministic epoch order. Do not allow callers to skip an unsettled epoch or settle a future epoch.
- Emit NEP-141 standard mint/burn events plus documented NEP-297 custom events.
- The backend is an indexer/integration layer only. It is not authoritative for check-ins, streaks, minting, burning, or treasury balances.
- Treat all broker and issuer data in the hackathon MVP as simulated. Never label it verified stock ownership.
- Do not add NEAR Intents unless an actual integration is requested and implemented; it is not required for this track.
- No mainnet deployment, real asset trade, public repo visibility change, git push/force-push, X post, or hackathon submission without explicit human approval.
- Never ask for, print, or commit private keys, seed phrases, or API secrets. Use environment variables and `.env.example` with placeholder names only.

## Engineering standards

- Rust + current `near-sdk` v5.x for contracts; follow official NEAR smart-contract skill rules.
- Prefer standard NEP implementations/helpers rather than hand-rolling fungible-token behavior.
- Use checked arithmetic for token amounts and percentages. Keep token quantities as `u128` on-chain and decimal strings at JSON/API boundaries.
- Validate caller identity with `predecessor_account_id`; validate attached deposits on payable methods.
- Check storage deposits and storage growth. Use unique collection prefixes and avoid unbounded in-memory collections.
- Handle cross-contract promise success and failure explicitly. Mark private callbacks correctly. Do not unwrap promise results.
- Follow checks-effects-interactions and NEAR-specific reentrancy guidance.
- Unit test pure logic, then run Sandbox integration tests including time-travel, failure, and cross-contract scenarios.
- Test integer rounding, zero values, cap boundaries, repeated calls, out-of-order epochs, and maximum participant counts.
- Do not invent contract addresses, broker APIs, stock quotes, or verified custody facts.

## Work protocol

1. Inspect the existing repository before modifying files.
2. Produce a concise implementation plan and file tree for the current phase.
3. Implement one vertical slice at a time, beginning with `ritl-core` and its tests.
4. Run formatting, unit tests, Sandbox integration tests, and the simulation script after relevant changes.
5. Report exact commands run, pass/fail counts, unresolved risks, and files changed.
6. Do not mark a feature complete unless its acceptance criteria and tests pass.
7. Ask the human before any irreversible or externally visible action.

## Definition of done

A feature is complete only when its documented behavior is implemented, tested, visible in the UI where required, and reproducible using README instructions. A mock integration must be visibly labeled `SIMULATED` in code, UI, demo, and README.

## Frontend conventions (project owner direction)

- Read `docs/design-system/` and `docs/brand/` before changing the web app. Use the approved StonkRitual logo, bull mascot, palette, asset map, and financial wording.
- Keep the landing page meme-native while making the contract-enforced ritual and transparent rules obvious. Motion and Three.js should support the story, respect reduced-motion preferences, and never obscure the primary check-in action.
- Run the web app from the repository root using the root package scripts. Keep public assets under `apps/web/public/brand/` and maintain its manifest.
- Structure frontend code by domain. Separate presentational components from hooks, services, schemas, constants, and state. Extract reusable UI into components and use existing shadcn/ui primitives; add missing primitives with the shadcn CLI.
- Use Axios with request/response interceptors and normalized errors for HTTP reads, TanStack Query for remote state, Zustand for transient client UI state, Zod for input and response validation, React Hook Form for forms, and TanStack Table for data tables. Keep wallet-signed writes through the NEAR wallet provider.
- Prefer typed data boundaries and explicit loading, empty, pending, success, and failure states. Do not duplicate contract state in Zustand or fabricate chain data.
- Treat the stock layer as `SIMULATED`; do not merge its values with on-chain RITL balances.
