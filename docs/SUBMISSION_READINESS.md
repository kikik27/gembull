# GemBull submission record

Checked against the [live NEAR HACKATHON instructions](https://nearhackathon.com/HACKATHON.md) immediately before submission. The user approved the exact payload after confirming the team details, mainnet payout account, track, description, and organizer contact notice. The application API returned **HTTP 201 on 2026-11-13 at approximately 20:03 UTC**, which the organizers define as saved. **Do not submit the repository again.** If a field needs correction, use the [request-changes page](https://nearhackathon.com/request-changes). Contact details and the full payload are intentionally not committed.

## Verified now

- [x] Primary track `memecoins` matches the deployed contract mechanic.
- [x] Repository <https://github.com/kikik27/gembull> is public and contains an MIT license.
- [x] Hosted app: <https://gembull-testnet.vercel.app>.
- [x] NEAR Testnet contract `gembull-core.testnet`: `pnpm verify:testnet` passed at finality on 2026-11-13, including metadata, supply, rules, code hash, and disclosure of one remaining FullAccess upgrade key.
- [x] README leads with reproducible action → result steps, Testnet evidence, local commands, and explicit limitations.
- [x] Contract tests and deterministic 60-day simulation are documented; the live and simulated paths are separated.
- [x] The human published a [public X demo post](https://x.com/Zhend3y/status/2121330322747068585). Public X embed metadata confirms the NEAR HACKATHON wording, `@NEARProtocol`, `#NEARHackathon`, app and repo links, and an attached media URL. The local Lemo Opuscar export remains excluded from the repository; the embed metadata alone does not prove which file was attached.

## Useful follow-up during judging

- [ ] Confirm that the attached X media is the intended demo and that its spoken claims and captions are accurate. The animated story and target counter illustrate verified rules; they are not a recording of a signed wallet transaction or live 50-account milestone.
- [ ] Keep the public repository and hosted app available through judging.
- [ ] If a real wallet-to-confirmation capture becomes available, add it as supplementary evidence without describing animation as a live transaction.

## Public demo post

<https://x.com/Zhend3y/status/2121330322747068585> — public embed metadata confirms the required event wording, account tag, hashtag, app link, repo link, and a media attachment. Do not describe the animated reconstruction as footage of a live wallet signature; a separate real wallet capture remains desirable evidence.

## Live evidence limit

One accepted Testnet check-in was observed at finality. Day 0 was finalized after missing the target; the resulting 75,000 GEMBULL burn is reflected in finalized supply and treasury views. No complete hosted wallet recording or live successful claim has been documented. The 50-account target makes a successful live epoch unavailable from a single tester. The Sandbox integration test demonstrates both settlement branches under time travel. Stock voting, share purchase, custody, and holder allocations are not deployed. The deployed contract code remains upgradeable through its FullAccess key.

## Remaining evidence and scope gaps

- **F-08 event history:** an indexed event feed has been added to the web app. Its completeness and hosted availability still need verification against contract receipts; it must not be described as an exhaustive chain archive.
- **F-06 supply dashboard:** the supply panel now displays genesis supply alongside current supply and treasury values.
- **End-to-end live evidence:** a check-in and missed-day burn are observable on Testnet. A hosted-wallet recording and a live successful claim remain outstanding; Sandbox covers the success branch.

The stock reserve, Ritual Points, simulated allocation ledger, and community ballot are explicitly planned in the v0.2 product direction; they are not part of the deployed hackathon core. The stock-batch simulator was removed from the app. The present build should be described as a working ritual core with the evidence limits above, not as the complete v0.2 product.

## Submitted project description

Memecoins often offer little to do beyond trading. GemBull makes participation the mechanic: eligible holders check in once per 24-hour epoch on NEAR Testnet. If 50 unique accounts participate, each can claim a 1,000 GEMBULL reward after settlement. If they miss, the NEP-141 contract burns 5 bps of its ritual treasury and resets the streak. The Rust contract enforces balance eligibility, one check-in per account, ordered permissionless settlement, bounded reward minting and a fixed supply cap. The dApp shows live progress, streaks, supply, treasury and history. A reproducible 60-day model explores supply under different participation scenarios. A missed first Testnet epoch produced an on-chain treasury burn; the successful-claim path is covered by Sandbox tests. The landing previews a future community-selected stock reserve as a clearly labeled simulation; stock voting, brokerage, custody and equity rights are not live.
