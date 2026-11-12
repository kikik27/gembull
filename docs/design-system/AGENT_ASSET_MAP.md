# GemBull web asset map

Use only files listed in [`apps/web/public/brand/manifest.json`](../../apps/web/public/brand/manifest.json). Confirm each URL exists before referencing it. The current pack is small by design; old StonkRitual paths and external ZIP inventory are not app assets.

| Public URL | Placement | Rule |
|---|---|---|
| `/brand/gembull-logo.png` | Landing hero | Owner-approved raster logo |
| `/brand/icons/gembull-app-icon.png` | Header, dashboard mark, favicon, app icon, decorative 3D coin face | Keep legible at small sizes |
| `/brand/gembull-open-graph.png` | Social metadata | Set `NEXT_PUBLIC_SITE_URL` before hosting |
| `/brand/coins/gembull-campaign-coin.png` | Marketing artwork | Never label as deployed token metadata |
| `/brand/stickers/gembull-gm.png` | Community/social greeting | Decorative, transparent |
| `/brand/stickers/gembull-streak.png` | Streak milestone/social | Decorative, transparent |
| `/brand/scene/ritual-day.svg` and `/brand/scene/ritual-night.svg` | Landing scene | Decorative; essential copy stays in HTML |

Use text for all controls, financial disclosures, loading states, and contract values. Stock-related imagery always needs a visible `SIMULATED` label. The 3D coin and scenes must respect reduced-motion preferences. Source token metadata is **GemBull / GEMBULL**, but a new Testnet deployment is still pending; the legacy RITL account must not be presented as GemBull.
