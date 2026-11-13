# GemBull web asset map

Use only files listed in [`apps/web/public/brand/manifest.json`](../../apps/web/public/brand/manifest.json). Confirm each URL exists before referencing it. The current pack is small by design; old StonkRitual paths and external ZIP inventory are not app assets.

| Public URL | Placement | Rule |
|---|---|---|
| `/brand/gembull-logo.svg` | Header / primary vector lockup | High-DPI scalable vector logo |
| `/brand/gembull-symbol.svg` | Standalone emblem mark | Vector master with horns, pulse ring & gem facets |
| `/brand/gembull-logo.png` | Landing hero | Owner-approved raster logo fallback |
| `/brand/icons/favicon.svg` | Browser favicon | Crisp vector icon for modern browsers |
| `/brand/icons/gembull-app-icon.svg` | Dashboard, header mark, app icon | Square vector recreation of the approved PNG icon |
| `/brand/icons/gembull-app-icon.png` | Header, dashboard mark, favicon, decorative 3D coin face | High-resolution raster derivative |
| `/brand/coins/gembull-token-badge.svg` | Token badge / coin face | Official vector circular badge |
| `/brand/gembull-open-graph.png` | Social metadata | Set `NEXT_PUBLIC_SITE_URL` before hosting |
| `/brand/coins/gembull-campaign-coin.png` | Marketing artwork | Never label as deployed token metadata |
| `/brand/stickers/gembull-gm.png` | Community/social greeting | Decorative, transparent mascot greeting |
| `/brand/stickers/gembull-checked-in.png` | Confirmed check-in banner / sticker pack | Decorative transparent mascot and calendar; transaction confirmation remains HTML text |
| `/brand/stickers/gembull-streak.png` | Streak milestone/social | Decorative, transparent mascot celebration |
| `/brand/stickers/gembull-target-hit.png` | Community target milestone / sticker pack | Decorative transparent mascot with trophy; actual target progress remains contract data |
| `/brand/social/x-banner-1500x500.png` | X social header | 1500×500 high-res banner |
| `/brand/social/discord-banner-1200x500.png` | Community banner | 1200×500 high-res banner |
| `/brand/scene/ritual-day.svg` and `/brand/scene/ritual-night.svg` | Landing scene | Decorative; essential copy stays in HTML |
| `/brand/scene/gembull-roadster-mascot.png` | Interactive roadmap | Transparent GemBull mascot in lime roadster; roadmap milestones remain HTML controls |

Use text for all controls, financial disclosures, loading states, and contract values. Stock-related imagery always needs a visible `SIMULATED` label. The 3D coin and scenes must respect reduced-motion preferences. The verified `gembull-core.testnet` metadata is **GemBull / GEMBULL**; the legacy RITL account is separate.
