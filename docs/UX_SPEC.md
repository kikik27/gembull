# UX / UI Specification

## 1. Visual direction

- Product personality: internet meme culture layered over a serious, transparent on-chain rule system.
- Visual system: dark charcoal/navy base, electric lime accent, restrained blue for data, neutral surfaces for dense tables.
- Tone: confident, playful, transparent; avoid investment-return language.
- Use a distinctive circular ritual/streak glyph rather than generic stock-market arrows as the primary symbol.

## 2. Navigation

- Home
- Ritual
- Token
- Treasury
- Stock Reserve (SIMULATED)
- Activity
- Docs

## 3. Home page

Hero:
- `GemBull`
- `The meme runs on rituals. The rituals move the treasury.`
- Primary CTA: `Join today's ritual`
- Secondary CTA: `Read the rules`
- Network badge: `NEAR TESTNET`
- Short disclosure: `GEMBULL is a community meme token. Stock allocations shown here are SIMULATED; no shares are held.`

Key metrics:
- Current streak
- Longest streak
- Today's check-ins / target
- Current total supply / max supply
- Ritual treasury balance

## 4. Ritual page

Required elements:
- Current epoch ID and countdown from chain timestamp.
- Progress `N / 50` with separate `max 200` note.
- Check-in button and user's eligibility state.
- Minimum holding requirement.
- Current streak and longest streak.
- Latest finalized epoch outcome.
- Pending permissionless settlement notice, when applicable.
- Reward claim panel for successful epochs.

The countdown is a presentation estimate; contract block timestamp is authoritative. After epoch end, display `Awaiting settlement` until someone calls `finalize_day`.

## 5. Treasury page

Cards:
- Initial supply
- Current supply
- Maximum supply
- Reward minted
- Treasury burned
- Ritual treasury remaining
- Mint capacity reserved / remaining

History table columns:
- Event
- Epoch
- Account / source
- Amount
- Block time
- Transaction hash / explorer link

## 6. Stock reserve page

- Permanent banner: `SIMULATED — NO REAL EQUITY OWNERSHIP`.
- Ticker shown as `NVDA (simulation)`.
- MockUSDC reserve balance.
- Batch contribution progress.
- Simulated broker fill details.
- Simulated active-holder allocation and Ritual Points, only if that feature is implemented.
- Explain that a quote or allocation is not proof of custody and is not redeemable.

## 7. Activity / event history

Filters: all, check-ins, successful epochs, missed epochs, mints, burns, stock simulation. Every on-chain row links to an explorer transaction. Simulated stock rows are visually and textually distinguished from on-chain events.

## 8. Responsive and accessibility

- Mobile-first layout for ritual check-in.
- Do not encode success/failure by color alone; include labels/icons/text.
- All wallet actions show transaction progress and final status.
- Use clear error messages from the contract mapping.
- Large number formatting should not round token base units incorrectly.
