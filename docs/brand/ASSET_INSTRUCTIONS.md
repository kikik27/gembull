# StonkRitual Brand Asset Instructions (for Codex / design agents)

## Purpose
This file defines how to use the supplied StonkRitual brand assets consistently in the web app, documentation, and social content. Treat the assets in this package as the approved visual baseline unless the project owner changes them.

## Brand identity
- Project name: **StonkRitual** (working name; trademark/domain/handle availability has not been verified).
- Working ticker: **$RITL** (not a confirmed on-chain deployment ticker yet).
- Tagline: **The meme runs on rituals.**
- Supporting line: **The rituals move the treasury.**
- Personality: irreverent meme-stock energy, but transparent and precise about mechanics and risk.
- Core palette: Neon Lime `#B7FF16`, Dark `#070A08`, Dark Green `#101611`, Green `#00B85A`, Stone Gray `#777D7A`, Off White `#F4F7F2`, optional Gold `#FFC857` for achievement/reward accents.
- Typography: Inter Display Bold for headlines and wordmarks; Inter Regular/Medium for body/UI. If unavailable, use a visually similar sans-serif. Do not bundle proprietary font files.

## Asset selection map
- `01-logos/stonkritual-primary-logo.svg`: preferred scalable logo on dark/light neutral backgrounds. Use for website header, README top, docs cover and partner decks.
- `01-logos/stonkritual-primary-logo-lockup.png`: raster logo lockup for social exports and tools that do not support SVG.
- `01-logos/stonkritual-brand-symbol.svg` / `stonkritual-brand-symbol-512.png`: project-owned symbol (ritual ring + rising chart). Use as the favicon base, tiny UI brand mark, watermark and app icon fallback.
- `01-logos/wordmark-and-tagline-extracted.png`: original artwork crop from the supplied concept board. Treat as a reference/legacy composition, not the most scalable logo.
- `01-logos/round-bull-emblem-extracted.png`: original mascot emblem. Use for community/social placements, not as the only brand mark in dense UI.
- `02-mascots/bull-mascot-hero-with-vault.png`: hero illustration. Use on landing page hero, About page, pitch deck and large campaign artwork. Avoid placing it in small controls.
- `02-mascots/bull-mascot-round-avatar.png`: avatar crop. Use as social/profile visual, community identity and portfolio placeholder.
- `03-stickers/sticker-*.png`: individual mascot sticker crops separated from the source brand board. These source crops retain their dark/green background; place them on dark brand surfaces or use them as framed sticker tiles. Original opaque source crops are preserved in `03-stickers/source-crops/` as provenance copies. Do not run automatic background removal on these: the bull has black clothing and dark contours that can be erased. Do not use them as critical buttons or convey financial guarantees.
- `04-icons/icon-daily-checkin-256.png`: daily check-in feature card / ritual entry point.
- `04-icons/icon-stock-vault-256.png`: stock reserve or vault dashboard section. Label clearly as simulated in the hackathon MVP.
- `04-icons/icon-community-256.png`: community/participants view.
- `04-icons/icon-burn-256.png`: burn event, missed ritual consequence or tokenomics explanation.
- `04-icons/icon-growth-256.png`: streak progress, supply or reserve chart. Never imply price appreciation.
- `04-icons/icon-longest-streak-256.png`: longest streak / leaderboard / achievement.
- `04-icons/icon-lp-lock-256.png`: liquidity lock information.
- `04-icons/stonkritual-app-icon-*.png`: PWA/app icon; use 512 or 192 depending target.
- `04-icons/stonkritual-favicon-64.png`: browser favicon; use 64 or generate 32/16 downscales from the same base.
- `04-icons/ritl-token-icon-512.png`: illustrative MEME token icon for mock/testnet UI only. Do not imply official deployment until deployed.
- `05-token-art/ritl-*-token-badge.png`: achievement/collectible/illustration only. Not an official token image unless adopted by project owner.
- `06-social/instagram/profile-avatar-1080.png`: Instagram profile avatar source; platform will circular-crop it.
- `06-social/instagram/posts/`: prebuilt 4:5 feed posts, recommended 1080x1350.
- `06-social/instagram/stories/`: 9:16 story artwork, recommended 1080x1920.
- `06-social/banners/x-banner-1500x500.jpg`: X profile header.
- `06-social/banners/discord-banner-960x540.jpg`: Discord/community banner.
- `07-ui-elements/`: extracted UI button examples from the original board. These are visual references only; implement real controls in HTML/CSS and do not place raster button images as clickable controls.
- `08-guidelines/palette-reference.png`: palette reference crop from original supplied board.

## Mascot usage
The accepted character is a stylized dark bull with large horns, neon-green eyewear/accent, black hoodie and confident meme-finance expression. Keep its silhouette, facial identity and palette consistent. Use supplied crops/stickers; do not substitute a Shiba or a different animal. Do not redraw, recolor, distort or add new clothing/props unless the owner approves.

The source board contains N-like marks on the mascot clothing and a separate NEAR mark. The mascot crops are retained as supplied because the owner approved this mascot direction. **Do not extract the N-like chest mark as a StonkRitual logo. Do not use the NEAR logo/wordmark as the StonkRitual logo.** The official project mark in this package is the separate ritual-ring/rising-chart symbol. Any explicit “Powered by NEAR” badge should only be used where the project has a genuine, appropriate NEAR ecosystem context; do not fabricate affiliation or endorsement.

## Product truth & financial wording
- MEME / RITL is the community token concept; it is not itself a share and does not represent NVIDIA ownership.
- Stock reserve, broker and stock receipt shown in MVP content are **simulation/mock** unless a real, legally valid issuer/custodian integration exists and has been verified.
- Never write “backed by real stocks”, “guaranteed by NVIDIA”, “risk-free”, guaranteed APY/returns, or “own NVIDIA by holding RITL” for the hackathon prototype.
- Use phrases such as “stock-reserve simulator”, “planned stock acquisition layer”, “simulated broker execution” and “receipt demo — not a real security”.
- Do not publish fabricated balances, real-world acquisitions, custody attestations, audit claims or live contract addresses.

## UI placement guidelines
- Header: horizontal SVG wordmark, height 32–40 px desktop and 28–32 px mobile.
- Landing hero: hero bull illustration on one side, headline/tagline on the other; avoid adding another mascot sticker nearby.
- Navigation: use custom symbol as a small brand mark; use functional Lucide-style interface icons for generic navigation.
- Dashboard feature cards: use the seven feature icon PNGs only as decorative illustrations; semantic labels must remain text.
- Ritual progress: use `icon-longest-streak` for longest streak; `icon-daily-checkin` for check-in; `icon-burn` for burn events.
- Vault: use `icon-stock-vault`, with an explicit “Simulation” badge in MVP.
- Token balances: use token icon only alongside ticker and contract address/testnet badge.
- Social media: use mascot and stickers freely within the approved palette; every financial statement must match implementation status.

## Do not
- Do not use the green rounded-square N graphic from the source concept board as the StonkRitual app icon.
- Do not present an illustrated stock coin as an actual security, receipt, or proof of custody.
- Do not use extracted raster UI buttons as live controls.
- Do not alter the approved mascot character identity.
- Do not invent Instagram handle availability, partnerships, investor endorsements, stock holdings, or audit status.

## Suggested web paths
- `/public/brand/logo.svg` <- `01-logos/stonkritual-primary-logo.svg`
- `/public/brand/brand-symbol.svg` <- `01-logos/stonkritual-brand-symbol.svg`
- `/public/brand/mascot-hero.png` <- `02-mascots/bull-mascot-hero-with-vault.png`
- `/public/brand/mascot-avatar.png` <- `02-mascots/bull-mascot-round-avatar.png`
- `/public/brand/app-icon.png` <- `04-icons/stonkritual-app-icon-512.png`
- `/public/brand/icons/` <- selected feature icons from `04-icons/`
- `/public/brand/stickers/` <- `03-stickers/`

When copying assets into an application, preserve original filenames and update the asset manifest. Prefer SVG for logos and PNG for transparent/illustrative assets. Never reference a file by a guessed path; confirm it exists.


## UI/UX design system (mandatory for frontend agents)

Before building or editing frontend pages/components, read the full `10-design-system/` package, especially:
- `10-design-system/DESIGN_SYSTEM.md`
- `10-design-system/COMPONENT_SPEC.md`
- `10-design-system/PAGE_SPEC.md`
- `10-design-system/AGENT_ASSET_MAP.md`
- `10-design-system/CODEX_UI_INSTRUCTIONS.md`
- `10-design-system/design-tokens.json` and `10-design-system/theme.css`

The ritual is the primary UX. Stock Vault is a secondary simulator and must carry a persistent simulation disclosure. Actual on-chain data, demo data and off-chain simulation data must never be mixed without clear source labels. Implement real accessible controls, not raster screenshots of buttons. All wallet actions require explicit pending/confirmed/failed states.
