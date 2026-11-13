# GemBull submission readiness

Checked against the [live NEAR HACKATHON instructions](https://nearhackathon.com/HACKATHON.md) on 2026-11-13. Re-read them immediately before submission; the development deadline is **2026-11-14 23:59 UTC** and only one submission is allowed per repository.

## Verified now

- [x] Primary track `memecoins` matches the deployed contract mechanic.
- [x] Repository <https://github.com/kikik27/gembull> is public and contains an MIT license.
- [x] Hosted app: <https://gembull-testnet.vercel.app>.
- [x] NEAR Testnet contract `gembull-core.testnet`: `pnpm verify:testnet` passed at finality on 2026-11-13, including metadata, supply, rules, code hash, and disclosure of one remaining FullAccess upgrade key.
- [x] README includes reproducible actions and observable results.
- [x] Contract tests and deterministic 60-day simulation are documented; the live and simulated paths are separated.
- [x] The human selected the Lemo Opuscar paper pop-up film for the X demo post. Its local export, `films/gembull-popup/gembull-popup.mp4`, is 1920 × 1080, 24 fps, 54.5 seconds with ElevenLabs narration, AAC audio, and corrected English captions. The film folder is excluded from the judging repository; the MP4 awaits human review and X upload.

## Still required before submission

- [ ] Review the selected local paper pop-up demo film, its captions, and every spoken claim. The story and target counter illustrate the verified rules; they are not a recording of a signed wallet transaction or live 50-account milestone.
- [ ] Human publishes a public X post with the video attached, says it was built at **NEAR HACKATHON**, tags **@NEARProtocol** and **#NEARHackathon**, and provides the post URL.
- [ ] Human provides and confirms the team lead name, contact email, team size, mainnet NEAR payout account, selected track(s), public repo link, public X post link, and the exact project description. Do not infer these from a Testnet wallet.
- [ ] Read the organizer contact notice verbatim and obtain the human's consent.
- [ ] Show the exact submission JSON to the human for explicit approval. Submit **once** only after that approval. Do not add a `website` field to the API payload.

## Demo post draft for the human

> GemBull asks you to show up daily. On NEAR Testnet, check-ins decide reward claims or a ritual-treasury burn. Stock concept: simulated. Built at NEAR HACKATHON. Try: https://gembull-testnet.vercel.app Code: https://github.com/kikik27/gembull @NEARProtocol #NEARHackathon

Attach the video file to the post. The human must publish it and return its public URL. Do not describe the animated reconstruction as footage of a live wallet signature; a separate real wallet capture remains desirable evidence.

## Live evidence limit

One accepted Testnet check-in was observed at finality, but no complete hosted wallet recording or live successful claim/burn transaction has been documented. The 50-account target makes a successful live epoch unavailable from a single tester. The Sandbox integration test demonstrates both settlement branches under time travel. Stock voting, share purchase, custody, and holder allocations are not deployed. The deployed contract code remains upgradeable through its FullAccess key.

## MVP acceptance gaps against the current PRD

- **F-08 event history:** the web app displays finalized-epoch summaries from contract views, but does not list each ritual `ft_mint`, `ft_burn`, and check-in event with transaction hash, block height/time, account, and amount. The generic contract explorer link does not meet the PRD's in-app event-history requirement.
- **F-06 supply dashboard:** the contract exposes `initial_supply` through `get_rules()`, but the supply panel does not display it. The other supply, treasury, mint, burn, and capacity values are shown.
- **End-to-end live evidence:** a wallet check-in has been observed on Testnet, while a hosted-wallet recording and a live successful claim or missed-day burn are not yet documented. Sandbox covers both settlement branches.

The stock reserve, Ritual Points, simulated allocation ledger, and community ballot are explicitly planned in the v0.2 product direction; they are not part of the deployed hackathon core. The present build should be described as a working ritual core with the acceptance gaps above, not as the complete v0.2 product.

## Submission idea draft

GemBull is a NEAR-native memecoin whose daily community ritual changes on-chain supply. Eligible holders check in once per 24-hour epoch. When 50 accounts participate, each can claim a fixed reward after permissionless settlement; when the target is missed, the contract burns a fixed portion of its ritual treasury and resets the streak. The NEP-141 token contract enforces these rules, balance eligibility, participant limits, supply cap, and epoch ordering. A Testnet web app shows live progress, rules, supply, and history. A reproducible 60-day simulation explores the supply mechanic. Stock reserve and community vote concepts are clearly marked simulated and are not part of the deployed contract.

The human must review and approve this text together with every other payload field before sending the one allowed submission.
