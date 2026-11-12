# StonkRitual Component Specification

This document is the implementation contract for frontend components. Component names are suggestions; adapt to the repository's existing conventions without changing behaviour or visual tokens.

## 1. Core primitives

### Button

Variants:
- `primary`: lime fill, dark text; one primary action per visual section.
- `secondary`: dark surface, border, off-white text.
- `tertiary`: transparent, subtle hover surface.
- `danger`: danger background/border, for destructive or failure-sensitive actions.
- `link`: text action with underline on hover.

Sizes: `sm` 36 px high, `md` 44 px, `lg` 52 px. Minimum interactive target is 44 px; only compact dense contexts may use `sm` with additional hit area.

States: default, hover, focus-visible, active, disabled, loading. Loading buttons retain width and show spinner + clear label. Never imply a transaction succeeded from a click event alone.

### Badge / StatusPill

Variants: `network`, `simulation`, `demo`, `success`, `warning`, `danger`, `info`, `neutral`.

- `TESTNET` uses info styling.
- `SIMULATION` uses warning/amber styling and must be persistent in stock vault contexts.
- `DEMO DATA` uses neutral/info styling.
- `CONFIRMED` uses green styling.
- `PENDING` uses warning styling.
- `FAILED` uses danger styling.

Always include text; do not rely on color alone.

### Card

Variants: `default`, `interactive`, `feature`, `stat`, `highlight`, `warning`.
- Default: surface-1, border, radius 16.
- Interactive: keyboard-focusable only if it behaves as a link/button; show hover border.
- Highlight: reserved for primary ritual card.
- Warning: for simulation and risk disclosures.

### StatCard

Props: `label`, `value`, `unit?`, `trend?`, `status?`, `helper?`, `icon?`, `source?`.
- Numeric values use tabular numerals.
- Do not show positive/negative trend arrows unless change is meaningful and sourced.
- Supply, participant count and streak are separate concepts.

### ProgressBar

Props: `value`, `max`, `label`, `helper`, `status`.
- Clamp displayed width to 0–100%.
- Render textual value `42 / 50 participants`.
- Use `aria-valuenow`, `aria-valuemin`, `aria-valuemax`.
- Avoid implying remaining time unless the end timestamp is valid.

## 2. Ritual components

### RitualHeroCard

Purpose: primary action surface on `/app`.

Required data:
- `epochId`
- `epochStatus`
- `participants`
- `target`
- `hasCheckedIn`
- `eligibility`
- `currentStreak`
- `longestStreak`
- `closesAt`
- `networkState`

Layout:
- Title: `Today's ritual`.
- Status line and epoch/reset time.
- Participant progress bar.
- Compact current/longest streak chips.
- One primary CTA selected from state machine.
- Small explanatory copy describing what happens when the target is reached/missed.

Do not show claim button before epoch finalization. Do not display minted reward amount until sourced from contract parameters/state.

### CheckInButton

State mapping:

| State | Label | Behaviour |
|---|---|---|
| wallet disconnected | Connect wallet | Opens wallet selector |
| not eligible | Not eligible | Disabled; show reason |
| eligible + not checked | Check in | Requests wallet transaction |
| transaction pending | Confirming… | Disabled; show pending |
| checked in | Checked in | Disabled; show tx |
| epoch finalized + reward claimable | Claim reward | Requests claim transaction |
| reward claimed | Reward claimed | Disabled; show tx |
| transaction failed | Try again | Allow retry after failure |

The on-chain contract is authoritative. Frontend eligibility checks are hints; revalidate through contract/provider before submitting.

### StreakDisplay

Show `Current streak` and `Longest streak` in separate values. Longest streak is a historical high score, not the current run. Provide a tooltip or helper for definitions.

### RitualOutcomeBanner

Variants:
- `open`: ritual is in progress.
- `target-reached`: target achieved; explain claim/finalization state.
- `missed`: target missed; show exact burn result only after contract event/confirmed state.
- `finalized`: epoch closed and outcome recorded.

Do not show speculative outcome before the epoch finalizes.

### EpochCountdown

Use a canonical close timestamp. Display local time with timezone abbreviation or UTC offset. Avoid a zeroing countdown that contradicts chain state if data is stale; show `Time sync unavailable` if current time cannot be trusted.

## 3. Transparency and data components

### ContractParameterTable

Columns: Parameter, Value, Meaning, Source. Include a copyable contract account. Values must be read-only and loaded from contract state or genesis config. A label `Immutable` may only appear after upgrade authority has been removed/renounced and this has been verified.

### EventTimeline

Event types: `CHECK_IN`, `REWARD_MINT`, `TREASURY_BURN`, `REWARD_CLAIM`, `EPOCH_FINALIZED`, `STOCK_SIMULATION_BATCH`.

Each event row includes type label, account/batch, amount, epoch, timestamp, transaction link (when on-chain), source badge (`ON-CHAIN` or `SIMULATION`).

### SupplyBreakdown

Show starting supply, minted total, burned total and current supply. Define the accounting formula. If simulated, keep it in a separate visual frame and use a `SIMULATION` badge.

### StockSimulationPanel

Mandatory banner: `SIMULATION — this prototype does not hold or issue real shares.`

Separate fields:
- simulated contribution pool;
- mock order/batch status;
- simulated shares acquired;
- mock receipt amount;
- data source/timestamp (simulation seed or API quote).

Do not label the simulated receipt `verified`, `custodied`, `redeemable` or `ownership`.

## 4. Navigation and wallet components

### AppSidebar

Items: Overview, Daily Ritual, Activity, Supply, Community, Stock Vault (Simulation), Rules.
- Active route uses lime indicator and surface-3.
- Use text labels beside icons on desktop.
- On mobile use bottom nav for Home, Ritual, Activity, Vault, and More.

### WalletButton

States: disconnected, connecting, connected, wrong network, unavailable. Connected state shows shortened account ID and menu for copy/disconnect. Display network in a separate badge. Avoid claiming a wallet is connected before provider confirmation.

### NetworkBanner

Show Testnet/Mainnet from actual chain config. The hackathon MVP should default to Testnet. If the wrong network is selected, provide a clear switch/reconnect action where supported.

## 5. Community components

### ParticipantLeaderboard

- Sort by a disclosed metric (e.g., current streak or total confirmed check-ins).
- Show account IDs shortened but copyable.
- Do not imply one account equals one human.
- Mark demo/seeded data clearly.
- Avoid monetary ranking unless there is a legitimate product reason.

### AchievementCard

Use mascot/sticker artwork for milestones. Include achievement name, criteria, and epoch/date. The artwork is decorative; achievement criteria remain text.

## 6. Forms, dialogs and feedback

### Wallet/transaction confirmation dialog

Explain action, network, contract and expected effect. Do not ask the user to reveal seed phrase/private key. Wallet signatures happen in the wallet provider.

### Disclosure dialog

Use for first visit to Stock Vault simulator and receipt simulation. Require acknowledgement before the user interprets simulated receipt balances as real holdings.

### Toasts

- Success: “Check-in confirmed on NEAR Testnet.” with explorer link.
- Pending: “Waiting for network confirmation…”
- Error: human-readable reason, transaction hash if available, retry action if safe.
- Never toast “Success” immediately after initiating a wallet prompt.

## 7. Empty, loading and error states

- Loading: skeletons should preserve final layout dimensions.
- No activity: “No ritual events yet. Your first confirmed check-in will appear here.”
- No wallet: explain what is available without connecting, then show Connect wallet.
- No eligible reward: explain whether epoch is open, target missed or user did not check in.
- Indexer unavailable: show last-updated time and a retry action; do not replace with invented zero values.
- Contract read failure: distinguish unavailable data from genuine zero.

## 8. Feature asset mapping

Use these exact files from the brand pack:

| Asset path | UI placement | Function |
|---|---|---|
| `02-mascots/bull-mascot-hero-with-vault.png` | Landing hero, About, pitch deck | Main brand illustration; large only |
| `02-mascots/bull-mascot-round-avatar.png` | Profile, community cards, compact empty states | Character avatar |
| `03-stickers/sticker-gm.png` | Community greeting, onboarding | Decorative greeting |
| `03-stickers/sticker-ritl-heart.png` | Community appreciation | Decorative appreciation |
| `03-stickers/sticker-to-the-moon.png` | Campaign/social only | Meme expression; not a price promise |
| `03-stickers/sticker-streak.png` | Streak milestone card | Achievement decoration |
| `03-stickers/sticker-ngmi.png` | Social content only | Avoid shaming users in product UI |
| `03-stickers/sticker-hodl.png` | Community/social content | Decorative meme; not investment advice |
| `04-icons/icon-daily-checkin-256.png` | Ritual feature card | Daily ritual concept |
| `04-icons/icon-longest-streak-256.png` | Longest streak panel | Record/achievement |
| `04-icons/icon-burn-256.png` | Burn mechanics explanation and burn event detail | Treasury burn illustration |
| `04-icons/icon-community-256.png` | Community overview | Participant/community concept |
| `04-icons/icon-growth-256.png` | Supply progress / milestone card | Supply/streak progress; not token price |
| `04-icons/icon-stock-vault-256.png` | `/app/vault` | Stock reserve simulator; always paired with Simulation label |
| `04-icons/icon-lp-lock-256.png` | Liquidity information / docs | LP lock illustration |
| `04-icons/ritl-token-icon-512.png` | Token balance and token identity in demo | Only when token deployment/metadata is labelled correctly |
| `04-icons/stonkritual-favicon-64.png` | Browser tab | Favicon |
| `04-icons/stonkritual-pwa-icon-192.png` | PWA manifest | Install icon |
| `04-icons/stonkritual-app-icon-512.png` | App install/app launcher | App icon |
| `05-token-art/ritl-gold-token-badge.png` | Achievement/gallery | Decorative collectible, not token backing |
| `05-token-art/ritl-silver-token-badge.png` | Achievement/gallery | Decorative collectible |
| `05-token-art/ritl-green-bull-token-badge.png` | Achievement/gallery | Decorative collectible |
| `07-ui-elements/*-reference.png` | Design reference only | Never use as a live button or control |

## 9. Component acceptance checklist

- [ ] Components implement all listed loading/error/disabled states.
- [ ] Every transaction action links to confirmed tx state only after provider response.
- [ ] Every stock-related element shows simulation status in MVP.
- [ ] Current streak and longest streak are never merged.
- [ ] Every mint/burn row is traceable to an event or marked as demo data.
- [ ] All buttons and menus have keyboard and touch support.
- [ ] Raster feature illustrations are never the only source of meaning.
