# GemBull web app

Next.js landing and ritual interface for the GemBull NEAR Testnet prototype. The [production landing](https://web-cyan-three-62.vercel.app) is connected to `gembull-core.testnet`. Run locally from the repository root with `pnpm dev`; root scripts also provide `pnpm typecheck`, `pnpm lint`, and `pnpm build`.

Copy `.env.example` to `.env.local`. `NEXT_PUBLIC_GEMBULL_CONTRACT_ID` points to the verified [`gembull-core.testnet`](../../docs/deployments/GEMBULL_TESTNET.md) deployment; the app uses that account by default when the variable is absent. The old `ritl-stonkritual.testnet` contract is **StonkRitual / RITL** and is not GemBull. `NEXT_PUBLIC_SITE_URL` should be the public origin when hosted, so Open Graph and X image URLs resolve correctly.

The UI reads rules, balances, epochs, streaks, supply, and treasury state from the configured contract. Wallet writes call `check_in`, `finalize_day`, or `claim_reward`. The 60-day simulation is labelled separately from chain data. The stock reserve is a **SIMULATED** concept; no shares or receipt rights are represented.

See the [root README](../../README.md) for the hackathon goal, verification commands, status, and roadmap.
