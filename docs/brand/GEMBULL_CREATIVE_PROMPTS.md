# GemBull creative prompts

These prompts adapt the earlier “Nectarline SaaS Meme Coin Redesign” direction to GemBull. The owner approved the generated geometric bull logo for the landing page; the approved bull mascot keeps its existing identity. The generated logo remains a raster asset, so a vector master should be prepared before print or other production uses.

## 1. Website redesign prompt

```text
Redesign the existing NEAR Testnet memecoin landing page as GemBull. Preserve the current React/Next.js behavior, wallet-signed contract writes, real contract views, and working navigation. Make the daily ritual the first clear action: one check-in per account per 24-hour epoch, 50-account target, individual reward claim after successful finalization, and treasury burn after a missed epoch. Keep the exact numbers sourced from get_rules() where available.

Art direction: meme-native premium fintech, dark #070A08, surface #101611, neon lime #B7FF16, off-white #F4F7F2, sparing gold #FFC857. Use the approved dark bull mascot without changing its identity. Strong editorial type, generous spacing, restrained chart/ring motion, accessible contrast, reduced-motion support, and clear mobile action placement. Avoid generic SaaS pricing cards, fake market charts, invented metrics, or investment-return language.

Brand the product GemBull. The deployed Testnet contract currently identifies its token as StonkRitual / RITL, so label the on-chain ticker accurately; do not silently call that deployed token GEMBULL. Keep actual on-chain values separate from 60-day projections. Show stock reserve as SIMULATED — no real shares, custody, or redemption. Do not invent verified ownership, broker integration, contract upgrade immutability, or mainnet availability.
```

## 2. New logo concept prompt

```text
Use case: logo-brand.
Asset type: new GemBull logo concept, transparent background.
Design an original, vector-friendly emblem for GemBull, a NEAR-native memecoin built around a daily community ritual. Combine a confident bull head reduced to bold geometric horns, a small central ritual ring/check-in pulse, and subtle gem facet geometry. Make it flat, balanced, memorable, and legible at 24 px.
Palette: neon lime #B7FF16, off-white #F4F7F2, dark #070A08.
Output: one isolated centered symbol with generous transparent margins. No wordmark, letters, ticker, coin mockup, 3D, gradients, glow, NEAR logo, third-party mark, or watermark. This is a concept for review; a designer must redraw and validate the final vector master.
```

Generated draft: [gembull-logo-concept-v1.png](concepts/gembull-logo-concept-v1.png). The owner approved it for landing use. It has transparent pixels, but also soft glow and lighting; simplify those effects during vector refinement.

## 3. Commercial pack prompt

```text
Use case: ads-marketing.
Asset type: GemBull commercial brand pack concept board.
Use the approved bull mascot image as the exact character identity reference: preserve dark bull face, horns, green sunglasses, black hoodie, and confident expression. Produce a polished dark 3×3 presentation board with consistent gutters showing: hero campaign poster, mobile ritual card, social feed ad, square avatar, X banner concept, sticker placement, dark merch hoodie, token badge concept, and typography/palette panel.
Art direction: premium editorial composition, black #070A08, neon lime #B7FF16, off-white #F4F7F2, tiny gold #FFC857 accents, generous negative space. Product story: daily ritual on NEAR, check in, transparent contract rules, community streak.
Use only short exact copy if text is rendered: “GemBull”, “The meme runs on rituals.”, “Check in. Keep the streak.”, and “SIMULATED” on any stock-vault depiction. Avoid price/return claims, stock ownership, APY, fake metrics, third-party logos, extra mascots, and watermarks. Treat the board as campaign direction; rebuild individual deliverables at their required export sizes and proofread all text.
```

Generated draft: [gembull-commercial-board-v1.png](concepts/gembull-commercial-board-v1.png). Its nine panels are a single square concept board, not nine production exports.

## 4. Generated production-facing assets

- Landing logo: `apps/web/public/brand/gembull-logo.png` — approved for landing use by the owner.
- Square app icon: `apps/web/public/brand/icons/gembull-app-icon.png` — derived from the logo for compact UI and favicon use.
- Coin art: `apps/web/public/brand/coins/gembull-campaign-coin.png` — promotional illustration, not the deployed Testnet token metadata.
- Stickers: `apps/web/public/brand/stickers/gembull-gm.png` and `gembull-streak.png` — transparent community artwork.
- Social preview: `apps/web/public/brand/gembull-open-graph.png` — 1734×907, used for Open Graph and X metadata.

The app still reads the deployed token's actual name and ticker from the contract. These assets do not change the on-chain metadata.
