# Agent Asset Map — StonkRitual

This file tells Codex/design agents exactly which asset to use, where to put it, and what it means. All paths below are relative to the root of `stonkritual-brand-pack/` unless noted.

## Application asset destinations

When integrating into a Next.js app, copy selected assets to `/public/brand/` using these destination paths:

| Source file | App destination | Use |
|---|---|---|
| `01-logos/stonkritual-primary-logo.svg` | `/public/brand/logo.svg` | Header, footer, docs header |
| `01-logos/stonkritual-brand-symbol.svg` | `/public/brand/brand-symbol.svg` | Small brand mark, metadata, watermark |
| `01-logos/stonkritual-primary-logo-lockup.png` | `/public/brand/logo-lockup.png` | Social export and environments without SVG support |
| `02-mascots/bull-mascot-hero-with-vault.png` | `/public/brand/mascot-hero.png` | Marketing hero and About page |
| `02-mascots/bull-mascot-round-avatar.png` | `/public/brand/mascot-avatar.png` | Community avatar and small profile visual |
| `04-icons/stonkritual-app-icon-512.png` | `/public/brand/app-icon-512.png` | PWA/app install icon |
| `04-icons/stonkritual-pwa-icon-192.png` | `/public/brand/pwa-icon-192.png` | PWA manifest |
| `04-icons/stonkritual-favicon-64.png` | `/public/brand/favicon-64.png` | Browser favicon base |
| `04-icons/ritl-token-icon-512.png` | `/public/brand/tokens/ritl.png` | RITL token display, labelled testnet/demo as needed |
| `04-icons/icon-daily-checkin-256.png` | `/public/brand/features/daily-checkin.png` | Ritual entry/card illustration |
| `04-icons/icon-longest-streak-256.png` | `/public/brand/features/longest-streak.png` | Longest streak card |
| `04-icons/icon-burn-256.png` | `/public/brand/features/burn.png` | Burn mechanics and burn event explainer |
| `04-icons/icon-community-256.png` | `/public/brand/features/community.png` | Community/participants card |
| `04-icons/icon-growth-256.png` | `/public/brand/features/supply-growth.png` | Supply/streak progression; not a price-chart symbol |
| `04-icons/icon-stock-vault-256.png` | `/public/brand/features/stock-vault.png` | Stock Vault simulator, paired with `SIMULATION` |
| `04-icons/icon-lp-lock-256.png` | `/public/brand/features/lp-lock.png` | Liquidity lock explanatory card |
| `03-stickers/sticker-gm.png` | `/public/brand/stickers/gm.png` | Community onboarding/social, decorative |
| `03-stickers/sticker-ritl-heart.png` | `/public/brand/stickers/ritl-heart.png` | Community appreciation/social |
| `03-stickers/sticker-to-the-moon.png` | `/public/brand/stickers/to-the-moon.png` | Social campaign only; not price promise |
| `03-stickers/sticker-streak.png` | `/public/brand/stickers/streak.png` | Achievement/share card |
| `03-stickers/sticker-ngmi.png` | `/public/brand/stickers/ngmi.png` | Social content only, not in product error states |
| `03-stickers/sticker-hodl.png` | `/public/brand/stickers/hodl.png` | Community/social only |

## Social-media destinations

| Source | Purpose |
|---|---|
| `06-social/instagram/profile-avatar-1080.png` | Instagram profile image |
| `06-social/instagram/posts/01-meet-stonkritual-1080x1350.jpg` | Feed introduction; pin first |
| `06-social/instagram/posts/02-daily-checkin-1080x1350.jpg` | Explain daily ritual |
| `06-social/instagram/posts/03-when-community-misses-1080x1350.jpg` | Explain miss/burn rule |
| `06-social/instagram/posts/04-rules-onchain-1080x1350.jpg` | Explain contract rules |
| `06-social/instagram/posts/05-stock-reserve-layer-1080x1350.jpg` | Explain simulation layer/disclaimer |
| `06-social/instagram/posts/06-sybil-limits-1080x1350.jpg` | Explain Sybil assumptions/limits |
| `06-social/instagram/stories/story-01-intro-1080x1920.jpg` | Intro story |
| `06-social/instagram/stories/story-02-daily-ritual-1080x1920.jpg` | Check-in story |
| `06-social/banners/x-banner-1500x500.jpg` | X profile header |
| `06-social/banners/discord-banner-960x540.jpg` | Discord community banner |

## Rules for using assets

1. Always confirm source file exists before importing; never guess path spelling.
2. Keep original supplied files unchanged. Create optimized derivatives in the app's own public folder if required.
3. Use SVG logos for responsive branding and PNG for illustration/photographic artwork.
4. Do not use `07-ui-elements/*-reference.png` as actual HTML buttons. Rebuild the control with Button components.
5. Do not use the N-like mark on the mascot chest, any NEAR mark or the green rounded-square N graphic as StonkRitual's brand mark.
6. Use the bull mascot identity as approved; do not replace it with a Shiba or another character.
7. Do not remove the mascot's dark background/contours with automated background removal. Keep it on dark surfaces or in a framed tile.
8. Every stock-related artwork or metric in the hackathon MVP must have a visible `SIMULATION` label.
9. Add alt text. Decorative artwork uses empty alt (`alt=""`) when the nearby text already conveys the information.
10. Preserve aspect ratio; never stretch, skew or crop away the horns/face.
