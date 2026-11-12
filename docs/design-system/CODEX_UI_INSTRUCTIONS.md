# Codex UI Implementation Instructions — StonkRitual

Before implementing or refactoring any UI, read:
1. `AGENTS.md` at the asset pack/repository root.
2. `08-guidelines/BRAND_GUIDE.md`.
3. `10-design-system/DESIGN_SYSTEM.md`.
4. `10-design-system/COMPONENT_SPEC.md`.
5. `10-design-system/PAGE_SPEC.md`.
6. `10-design-system/AGENT_ASSET_MAP.md`.
7. `10-design-system/design-tokens.json` and `10-design-system/theme.css`.

## Implementation goals

Build a polished, responsive, dark-first web application. The daily ritual is the primary product experience. The stock-reserve simulator is secondary and must remain clearly labelled as simulation.

## Technical rules

- Inspect the existing repository and package manager before making changes. Preserve existing conventions unless they conflict with this specification.
- Use TypeScript and semantic React components.
- Use CSS variables from `theme.css` as the source of truth. Do not scatter raw color hex values across components.
- Use a shared component library for Button, Card, Badge, StatCard, ProgressBar, EventTimeline, WalletButton, RitualHeroCard and disclosure banners.
- Use Lucide React for generic UI icons. Use supplied PNG feature illustrations only where the asset map specifies.
- Use real buttons/links/forms, not static image buttons.
- Implement responsive behaviour at 360, 768, 1024 and 1440 px.
- Implement empty, loading, stale, unavailable, pending, success and error states.
- Respect `prefers-reduced-motion` and keyboard navigation.
- Never fake a wallet connection or transaction success.
- Never hard-code a dynamic tokenomics value if it can be read from contract/config. Show source/network.
- Actual on-chain supply and simulated 60-day projections must remain separate.
- Every stock vault and stock receipt mock must display a persistent simulation disclosure.
- Never call RITL an NVIDIA-backed token or imply RITL holders own NVIDIA shares.
- Do not invent live account count, reserve amount, contract address, custody, audit, broker integration or partnership.

## Build order

1. Global theme and typography.
2. App shell, navigation, responsive layout and wallet/network status.
3. Landing page.
4. Ritual dashboard and RitualHeroCard state machine.
5. Rules/transparency and event timeline.
6. Supply view and 60-day simulation separation.
7. Stock Vault simulator.
8. Community and portfolio.
9. Accessibility, responsive and visual regression checks.

## Definition of done

- UI follows all design tokens and component specifications.
- All supplied assets are mapped and used according to AGENT_ASSET_MAP.
- No mascot, NEAR or token mark is misused.
- No stock simulation is mistaken for a real asset holding.
- The app works on mobile and desktop.
- Screens have meaningful loading/empty/error states.
- Every contract action has a pending/confirmed/failed state.
- Screenshots are captured for landing, dashboard, ritual, rules, activity, supply and vault.
- Add or update tests for all interactive state transitions.
