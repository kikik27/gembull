# GemBull UI/UX Design System

**Version:** 1.0.0<br>
**Project:** GemBull (working name)<br>
**Working ticker:** `$GEMBULL`<br>
**Tagline:** The meme runs on rituals.<br>
**Primary experience:** Daily community ritual, on-chain supply mechanics, transparent rules.<br>
**Secondary experience:** Stock-reserve simulator (clearly labelled simulation in the hackathon MVP).

---

## 1. Product design direction

GemBull should feel like a **meme-native protocol dashboard**, not a generic DeFi trading terminal. The personality comes from the bull mascot, compact irreverent copy, achievement moments and neon-lime highlights. Trust comes from visible contract rules, honest network/status labels, auditable event history and restrained financial language.

### Core design principle

> **Make the ritual the hero. Make the rules impossible to miss.**

The first screen after wallet connection must answer, in this order:
1. What is today's ritual status?
2. Has this wallet checked in?
3. How close is the community to the target?
4. What happens if the target is met or missed?
5. Where can the user inspect the immutable rules and on-chain events?

### Product hierarchy

1. **Ritual mechanic — primary:** check-in, daily progress, current streak, longest streak, reward claim, failed-day burn.
2. **Transparency — primary:** immutable parameters, supply, mint/burn events, contract/network status.
3. **Community — secondary:** participation leaderboard, milestones, shareable achievements.
4. **Stock reserve simulator — tertiary:** educational/demo module, never presented as proof of real equity ownership.
5. **Market/price views — not a primary surface:** do not make a price chart the hero or the main dashboard focus. The hackathon track judges mechanics, not the chart.

## 2. Brand foundations

### Personality

- Playful, confident, community-driven.
- Technically precise about what is on-chain and what is simulated.
- Energetic without gambling-style urgency.
- Transparent about Sybil resistance limitations and financial risks.

### Voice and microcopy

Prefer:
- “Check in. Keep the streak.”
- “Your check-in is recorded on-chain.”
- “The community hit today's target.”
- “The ritual missed. Treasury burn executed.”
- “Rules are fixed at launch.”
- “Stock reserve simulator — no real shares are held in this demo.”

Avoid:
- “Guaranteed rewards”, “risk-free”, “guaranteed gains”.
- “GEMBULL is backed by NVIDIA” or “holding GEMBULL means owning NVIDIA”.
- Fake live metrics, fabricated custody claims or unverified audit claims.
- Price prediction, FOMO countdowns or APR/APY claims without a real mechanism and evidence.

## 3. Color system

Use a dark-first interface. Lime is the primary action and emphasis color; green is reserved for positive/confirmed states. Avoid using lime for every element—its scarcity gives it emphasis.

| Token | Hex | Role |
|---|---|---|
| `--sr-bg` | `#070A08` | App canvas |
| `--sr-surface-1` | `#101611` | Main cards and navigation |
| `--sr-surface-2` | `#151E18` | Elevated panels and input backgrounds |
| `--sr-surface-3` | `#1C2820` | Hover and selected surfaces |
| `--sr-border` | `#2B382E` | Standard borders/dividers |
| `--sr-border-strong` | `#435246` | Emphasized borders |
| `--sr-lime` | `#B7FF16` | Primary CTA, focus accents, active indicators |
| `--sr-lime-hover` | `#C9FF58` | Hover state |
| `--sr-green` | `#00B85A` | Confirmed/success state |
| `--sr-green-soft` | `#123B27` | Success backgrounds |
| `--sr-text` | `#F4F7F2` | Primary text |
| `--sr-text-muted` | `#A4AEA6` | Secondary text |
| `--sr-text-subtle` | `#78847B` | Tertiary text and helper copy |
| `--sr-warning` | `#FFC857` | Warning, upcoming milestone |
| `--sr-warning-soft` | `#3A2D13` | Warning background |
| `--sr-danger` | `#FF6B6B` | Failed transaction/error/burn event |
| `--sr-danger-soft` | `#3B1D1D` | Error background |
| `--sr-info` | `#72B7FF` | Informational state |
| `--sr-info-soft` | `#142B42` | Information background |

### Color rules

- Primary buttons: lime fill + near-black text.
- Secondary buttons: transparent/dark surface + visible border + off-white text.
- Destructive actions: danger color, never lime.
- Burn event: danger/red semantic treatment, but explain the exact rule and amount; do not depict it as a celebratory action.
- Successful ritual: green confirmation with lime achievement accent.
- Gold is optional for achievement artwork only; never use it to imply financial value or guaranteed yield.
- Keep text contrast at WCAG AA where possible. Do not place small text directly on busy mascot artwork.

## 4. Typography

| Style | Font | Size / line height | Weight | Usage |
|---|---|---:|---:|---|
| Display XL | Inter | 48/56 | 800 | Marketing hero, one per page |
| Display L | Inter | 40/48 | 750 | Main landing/app title |
| H1 | Inter | 32/40 | 700 | Page heading |
| H2 | Inter | 24/32 | 700 | Section heading |
| H3 | Inter | 18/26 | 650 | Card title |
| Body L | Inter | 16/25 | 400 | Main prose |
| Body | Inter | 14/22 | 400 | Main UI copy |
| Body Strong | Inter | 14/20 | 600 | Labels and emphasis |
| Caption | Inter | 12/18 | 400 | Metadata, timestamps, helper copy |
| Data XL | Inter | 36/42 | 700 | Important counts and supply figures |
| Data | Inter | 16/24 | 600 | Balances, counts and metrics |

Use tabular numerals for counts, balances, dates, ratios and supply values (`font-variant-numeric: tabular-nums`). Use sentence case for UI labels. Use all caps only for small eyebrow labels or ticker badges.

## 5. Layout, spacing and sizing

### Spacing scale

Base unit: 4 px. Use only values from this scale unless a specific optical correction is needed.

`4, 8, 12, 16, 20, 24, 32, 40, 48, 56, 64, 80, 96 px`

### Radius

- `sm`: 8 px — inputs, compact badges.
- `md`: 12 px — standard cards and buttons.
- `lg`: 16 px — dashboard cards.
- `xl`: 24 px — hero/feature panels.
- `2xl`: 32 px — marketing artwork frame.
- `pill`: 999 px — chips, status badges, compact filters.

### Containers and grid

- Marketing content max-width: 1200 px.
- App content max-width: 1360 px.
- Text measure: 65–75 characters for body copy.
- Desktop app sidebar: 248 px; main content min-width must remain 0.
- Desktop page gutters: 32 px; tablet: 24 px; mobile: 16 px.
- Desktop grid: 12 columns, 24 px gutter.
- Tablet grid: 8 columns, 20 px gutter.
- Mobile grid: 4 columns, 12–16 px gutter.
- Avoid horizontal scrolling at 320 px viewport width.

## 6. Responsive breakpoints

| Name | Width | Behaviour |
|---|---:|---|
| `sm` | 640 px | Small tablet/large phone |
| `md` | 768 px | Tablet navigation/layout transition |
| `lg` | 1024 px | Desktop sidebar and multi-column dashboard |
| `xl` | 1280 px | Wider content and dense data tables |
| `2xl` | 1536 px | Maximum visual breathing room |

Responsive rules:
- Below 768 px, collapse the left sidebar into a compact top bar + bottom navigation.
- Below 640 px, stack all dashboard metric cards into a 2-column grid; long data tables become labelled cards or horizontally scrollable only within a contained region.
- The daily ritual card must appear before secondary analytics on mobile.
- Primary check-in action must be visible without scrolling on common mobile viewport heights when the wallet is connected.
- Do not use hover-only disclosures; all essential actions need tap/focus affordances.

## 7. Elevation, borders and effects

Use subtle surface separation rather than large glows. The visual language should remain readable and credible as a finance dashboard.

- Card: `1px solid var(--sr-border)`, surface-1, radius 16 px.
- Raised card: surface-2, optional `0 12px 32px rgba(0,0,0,.24)`.
- Focus ring: `0 0 0 3px rgba(183,255,22,.30)` plus 2 px visible lime outline.
- Glow is reserved for one primary CTA/hero accent at a time.
- Do not apply glow to every card, chart, navigation item and icon.

## 8. Iconography and illustration

- Use Lucide React for functional interface icons: wallet, chevron, clock, external link, copy, info, check, alert, menu, settings, search, arrow, calendar.
- Use packaged GemBull PNG illustrations for feature identity, not as a replacement for semantic icons or text labels.
- Feature asset map is specified in `COMPONENT_SPEC.md` and `AGENT_ASSET_MAP.md`.
- Do not use the extracted NEAR mark or N-like chest mark as the GemBull product logo.
- Mascot is a decorative/brand layer. It must not replace labels, status icons, buttons or data visualizations.
- Never put a raster UI button image in the application as a clickable control. Rebuild it as a real semantic button.

## 9. Motion and feedback

- Standard transition: 140–180 ms, ease-out.
- Panel expansion: 180–220 ms.
- Progress bar: animate only when a new confirmed value arrives; 250–400 ms.
- Check-in success: concise confirmation, check icon and tx link; optional small mascot reaction.
- Burn event: use restrained transition; no celebratory fireworks.
- Respect `prefers-reduced-motion`; no essential information may depend on animation.
- Never show an optimistic on-chain success before the wallet/provider confirms it.

## 10. Accessibility

- All controls must be keyboard reachable and have visible focus.
- Use semantic headings in order; one H1 per page.
- Icon-only buttons need accessible names.
- Inputs need visible labels, error text and instructions.
- Do not communicate success/failure only through color; pair icon + text.
- Maintain AA contrast for normal text where feasible.
- Minimum touch target: 44 x 44 px.
- Charts need a textual summary/table alternative.
- Announce asynchronous wallet and transaction states to assistive technology.

## 11. App information architecture

### Public/marketing routes

- `/` — landing page, concise mechanic explanation, CTA to enter app.
- `/how-it-works` — daily ritual lifecycle and supply consequences.
- `/rules` — genesis parameters, immutable settings, contract address and source-code links.
- `/transparency` — event log, supply overview, simulation disclosure.

### Connected application routes

- `/app` — ritual-first dashboard.
- `/app/ritual` — check-in, eligibility, epoch status and claim action.
- `/app/activity` — check-in, mint, burn and claim events.
- `/app/supply` — current supply, mint/burn history and 60-day simulator; no price chart hero.
- `/app/community` — participant leaderboard and streak records, with anti-Sybil limitations explained.
- `/app/vault` — stock-reserve simulator only, with persistent `SIMULATION` disclosure.
- `/app/portfolio` — GEMBULL balance, eligible rewards and simulated receipt balances clearly separated.

### Global navigation

Desktop sidebar: Overview, Daily Ritual, Activity, Supply, Community, Stock Vault (Simulation), Rules.<br>
Mobile bottom navigation: Home, Ritual, Activity, Vault, Menu. Place `SIM` badge on the Vault item.

## 12. Page-level UX direction

### Landing page

1. Header: wordmark, How it works, Rules, Transparency, Connect wallet / Open app.
2. Hero: H1 “The meme runs on rituals.”; support copy explaining daily check-in and conditional mint/burn; bull hero artwork; primary CTA “Enter the ritual”; secondary CTA “Read the rules”.
3. Mechanic preview: three concise steps — Check in, Hit the target, Mint or burn according to the rule.
4. Live/demo ritual snapshot: progress and streak, marked `TESTNET` or `DEMO DATA` as applicable.
5. Transparency section: immutable parameters, contract events and supply simulation.
6. Stock-reserve feature: explicitly secondary and marked `SIMULATION`.
7. Footer: contracts, source, docs, socials, risks/disclosures.

### Dashboard `/app`

Desktop:
- Header with app name, network badge, wallet menu.
- Hero ritual panel across 7–8 columns with progress and one primary action.
- Right summary panel with current streak and longest streak.
- Below: four compact metric cards (today's participants, target, current supply, pending reward where applicable).
- Latest activity list with mint/burn/check-in event types.

Mobile:
- Network status and wallet at top.
- Ritual status + progress + CTA first.
- Two-column metric cards.
- Activity list below.

### Ritual `/app/ritual`

- Show epoch label and exact reset time with timezone.
- Show whether the wallet is eligible, already checked in, claimable, or ineligible.
- Primary button changes by state: `Check in`, `Already checked in`, `Claim reward`, `Reward claimed`, or disabled with reason.
- Show participant count and target; progress is community participation, not token price.
- Explain the success and failure consequences before the epoch closes.
- Display tx status: awaiting wallet, submitted, confirming, success, failed.

### Rules `/rules`

- Show genesis-config values as read-only data sourced from contract state.
- Display contract account, network, deployment timestamp, code hash/source link if verified.
- Show an immutable/verified badge only when the implementation and upgrade authority have been confirmed. Otherwise show `Declared at deployment` or `Verification pending`.
- Explicitly display that the demo's Sybil resistance is account-level, not proof of unique humans, if that is how implementation works.

### Activity `/app/activity`

- Filter by All, Check-ins, Mints, Burns, Claims.
- Each item shows event label, amount/count, epoch, account, timestamp, transaction link.
- Distinguish protocol events from off-chain simulator events.
- Empty state explains when activity will appear.

### Supply `/app/supply`

- Separate actual on-chain supply from simulated 60-day scenario.
- Provide chart legend, starting supply, cumulative minted, cumulative burned, current supply.
- Label simulation assumptions and scenario selector.
- Do not label supply chart as price/performance/returns.

### Stock Vault `/app/vault`

- Keep persistent banner: `SIMULATION — no real shares are held by this prototype`.
- Show simulated contributions, simulated execution batches, simulated receipt issuance and timestamps.
- Use no “backed by NVIDIA” copy.
- If no simulated batch exists, show “No simulated acquisition yet.”
- Explain that GEMBULL does not itself represent NVIDIA ownership.

## 13. Data truth and visible states

Every finance-like data surface must have provenance and state labels:
- `TESTNET` — real chain transactions on testnet.
- `DEMO DATA` — seeded illustrative UI values.
- `SIMULATION` — off-chain or mocked stock/broker/issuer workflow.
- `PENDING` — submitted but not finalized.
- `CONFIRMED` — provider/chain confirmation received.
- `FAILED` — operation failed; include a useful reason if available.

Never blend simulated stock values with on-chain token balances in the same unlabeled metric group.

## 14. Implementation constraints

- Use design tokens from `design-tokens.json` and `theme.css`; do not scatter hex codes through components.
- Use real semantic React components; do not render screenshot-based buttons.
- Keep UI components presentational and connect them to typed app state/hooks.
- Keep transaction states explicit and sourced from wallet/chain responses.
- Do not hard-code tokenomics parameters into UI copy. Read values from contract/config and display source/status.
- Use `Intl.NumberFormat` for numeric/currency formatting and show currency denomination.
- Store timestamps canonically; render local time with explicit timezone where reset time matters.
- Keep stock reserve data behind a `simulation` domain model and never merge it into real portfolio holdings.

## 15. Acceptance criteria

- [ ] The connected dashboard makes today's ritual action/status obvious within the first viewport.
- [ ] User can distinguish current streak from longest streak.
- [ ] Community target progress is visible and labelled.
- [ ] User can discover the exact success/failure mechanics before checking in.
- [ ] Rules page shows contract-backed values and does not overstate immutability.
- [ ] Mint/burn/check-in events have readable history and transaction links.
- [ ] Actual supply and simulated 60-day supply are visually separated.
- [ ] Stock vault is clearly marked as simulation and never implies actual stock ownership.
- [ ] All core flows work at 360 px, 768 px and 1440 px widths.
- [ ] Keyboard focus and reduced-motion behaviour are implemented.
- [ ] No action displays success before confirmation.
