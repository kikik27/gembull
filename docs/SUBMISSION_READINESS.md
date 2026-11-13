# GemBull submission readiness

Checked against the [live NEAR HACKATHON instructions](https://nearhackathon.com/HACKATHON.md) on 2026-11-14 (Asia/Jakarta). Re-read them immediately before submission; the development deadline is **2026-11-14 23:59 UTC** and only one submission is allowed per repository.

## Verified now

- [x] Primary track `memecoins` matches the deployed contract mechanic.
- [x] Repository <https://github.com/kikik27/gembull> is public and contains an MIT license.
- [x] Hosted app: <https://gembull-testnet.vercel.app>.
- [x] NEAR Testnet contract `gembull-core.testnet`: `pnpm verify:testnet` passed at finality on 2026-11-13, including metadata, supply, rules, code hash, and disclosure of one remaining FullAccess upgrade key.
- [x] README leads with reproducible action → result steps, Testnet evidence, local commands, and explicit limitations.
- [x] Contract tests and deterministic 60-day simulation are documented; the live and simulated paths are separated.
- [x] The human published a [public X demo post](https://x.com/Zhend3y/status/2121330322747068585). Public X embed metadata confirms the NEAR HACKATHON wording, `@NEARProtocol`, `#NEARHackathon`, app and repo links, and an attached media URL. The local Lemo Opuscar export remains excluded from the repository; the embed metadata alone does not prove which file was attached.

## Still required before submission

- [ ] Confirm that the attached X media is the intended demo and that its spoken claims and captions are accurate. The animated story and target counter illustrate verified rules; they are not a recording of a signed wallet transaction or live 50-account milestone.
- [ ] Human provides and confirms the team lead name, contact email, team size, exact mainnet NEAR payout account, selected track(s), public repo link, public X post link, and the exact project description. The X display name and a similarly named Testnet wallet are not authorization to fill submission fields.
- [ ] Read the organizer contact notice verbatim and obtain the human's consent.
- [ ] Show the exact submission JSON to the human for explicit approval. Submit **once** only after that approval. Do not add a `website` field to the API payload.

## Public demo post

<https://x.com/Zhend3y/status/2121330322747068585> — public embed metadata confirms the required event wording, account tag, hashtag, app link, repo link, and a media attachment. Do not describe the animated reconstruction as footage of a live wallet signature; a separate real wallet capture remains desirable evidence.

## Live evidence limit

One accepted Testnet check-in was observed at finality. Day 0 was finalized after missing the target; the resulting 75,000 GEMBULL burn is reflected in finalized supply and treasury views. No complete hosted wallet recording or live successful claim has been documented. The 50-account target makes a successful live epoch unavailable from a single tester. The Sandbox integration test demonstrates both settlement branches under time travel. Stock voting, share purchase, custody, and holder allocations are not deployed. The deployed contract code remains upgradeable through its FullAccess key.

## Remaining evidence and scope gaps

- **F-08 event history:** an indexed event feed has been added to the web app. Its completeness and hosted availability still need verification against contract receipts; it must not be described as an exhaustive chain archive.
- **F-06 supply dashboard:** the supply panel now displays genesis supply alongside current supply and treasury values.
- **End-to-end live evidence:** a check-in and missed-day burn are observable on Testnet. A hosted-wallet recording and a live successful claim remain outstanding; Sandbox covers the success branch.

The stock reserve, Ritual Points, simulated allocation ledger, and community ballot are explicitly planned in the v0.2 product direction; they are not part of the deployed hackathon core. The stock-batch simulator was removed from the app. The present build should be described as a working ritual core with the evidence limits above, not as the complete v0.2 product.

## Submission idea draft

GemBull is a NEAR-native memecoin whose daily community ritual changes on-chain supply. Eligible holders check in once per 24-hour epoch. When 50 accounts participate, each can claim a fixed reward after permissionless settlement; when the target is missed, the contract burns a fixed portion of its ritual treasury and resets the streak. The NEP-141 token contract enforces these rules, balance eligibility, participant limits, supply cap, and epoch ordering. A Testnet web app shows live progress, rules, supply, and history. A reproducible 60-day simulation explores the supply mechanic. Stock reserve and community vote concepts are clearly marked simulated and are not part of the deployed contract.

The human must review and approve this text together with every other payload field before sending the one allowed submission.
