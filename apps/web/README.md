# GemBull web app

Next.js landing and ritual interface for the GemBull NEAR Testnet prototype. Run it from the repository root with `pnpm dev`; root scripts also provide `pnpm typecheck`, `pnpm lint`, and `pnpm build`.

Copy `.env.example` to `.env.local`. Leave `NEXT_PUBLIC_GEMBULL_CONTRACT_ID` empty for a local preview with proposed rules and no fabricated chain metrics. Set it only after a new GemBull Testnet deployment has been verified. The old `ritl-stonkritual.testnet` contract is **StonkRitual / RITL** and is not a GemBull deployment. `NEXT_PUBLIC_SITE_URL` should be the public origin when hosted, so Open Graph and X image URLs resolve correctly.

The UI reads rules, balances, epochs, streaks, supply, and treasury state from the configured contract. Wallet writes call `check_in`, `finalize_day`, or `claim_reward`. The 60-day simulation is labelled separately from chain data. The stock reserve is a **SIMULATED** concept; no shares or receipt rights are represented.

See the [root README](../../README.md) for the hackathon goal, verification commands, status, and roadmap.
