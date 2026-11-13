# GemBull submission readiness

Checked against the [live NEAR HACKATHON instructions](https://nearhackathon.com/HACKATHON.md) on 2026-11-13. Re-read them immediately before submission; the development deadline is **2026-11-14 23:59 UTC** and only one submission is allowed per repository.

## Verified now

- [x] Primary track `memecoins` matches the deployed contract mechanic.
- [x] Repository <https://github.com/kikik27/gembull> is public and contains an MIT license.
- [x] Hosted app: <https://gembull-testnet.vercel.app>.
- [x] NEAR Testnet contract `gembull-core.testnet`: `pnpm verify:testnet` passed at finality on 2026-11-13, including metadata, supply, rules, code hash, and disclosure of one remaining FullAccess upgrade key.
- [x] README includes reproducible actions and observable results.
- [x] Contract tests and deterministic 60-day simulation are documented; the live and simulated paths are separated.
- [x] Lemo Opuscar [paper pop-up film](../films/gembull-popup/README.md) exported locally at 1920 × 1080, 24 fps, 54.5 seconds with ElevenLabs narration, AAC audio, and corrected English captions. The MP4 is ignored by Git and awaits human review and X upload.
- [x] Alternative Lemo Opuscar [pixel RPG film](../films/gembull-story/README.md) exported locally with a recognizable GemBull bull mascot and a clearly simulated stock concept. The two films are options for the human's X demo post; neither is a wallet recording.

## Still required before submission

- [ ] Review the rendered [paper pop-up demo film](../films/gembull-popup/README.md), its captions, and every spoken claim. The story and target counter illustrate the verified rules; they are not a recording of a signed wallet transaction or live 50-account milestone.
- [ ] Human publishes a public X post with the video attached, says it was built at **NEAR HACKATHON**, tags **@NEARProtocol** and **#NEARHackathon**, and provides the post URL.
- [ ] Human provides and confirms the team lead name, contact email, team size, mainnet NEAR payout account, selected track(s), public repo link, public X post link, and the exact project description. Do not infer these from a Testnet wallet.
- [ ] Read the organizer contact notice verbatim and obtain the human's consent.
- [ ] Show the exact submission JSON to the human for explicit approval. Submit **once** only after that approval. Do not add a `website` field to the API payload.

## Demo post draft for the human

> One day. One check-in. Show up together. GemBull is a NEAR Testnet memecoin with contract-enforced daily rituals: reach the community target for reward claims, or miss it and burn from the ritual treasury. Built at NEAR HACKATHON. Stock concept: SIMULATED. Try: https://gembull-testnet.vercel.app Code: https://github.com/kikik27/gembull @NEARProtocol #NEARHackathon

Attach the video file to the post. The human must publish it and return its public URL. Do not describe the animated reconstruction as footage of a live wallet signature; a separate real wallet capture remains desirable evidence.

## Live evidence limit

One accepted Testnet check-in was observed at finality, but no complete hosted wallet recording or live successful claim/burn transaction has been documented. The 50-account target makes a successful live epoch unavailable from a single tester. The Sandbox integration test demonstrates both settlement branches under time travel. Stock voting, share purchase, custody, and holder allocations are not deployed. The deployed contract code remains upgradeable through its FullAccess key.

## Submission idea draft

GemBull is a NEAR-native memecoin whose daily community ritual changes on-chain supply. Eligible holders check in once per 24-hour epoch. When 50 accounts participate, each can claim a fixed reward after permissionless settlement; when the target is missed, the contract burns a fixed portion of its ritual treasury and resets the streak. The NEP-141 token contract enforces these rules, balance eligibility, participant limits, supply cap, and epoch ordering. A Testnet web app shows live progress, rules, supply, and history. A reproducible 60-day simulation explores the supply mechanic. Stock reserve and community vote concepts are clearly marked simulated and are not part of the deployed contract.

The human must review and approve this text together with every other payload field before sending the one allowed submission.
