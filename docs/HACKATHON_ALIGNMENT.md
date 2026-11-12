# NEAR Hackathon Track Alignment

## Primary track: `memecoins`

Official track tagline: **The joke needs rules.**

The official prompt asks for a streak coin with a contract-enforced daily check-in, a target, reward mint on success, treasury burn and streak reset on failure, immutable launch parameters, demo-suitable Sybil resistance, a current streak/progress/event page, and a 60-day supply simulation.

| Official expectation | StonkRitual implementation |
|---|---|
| NEP-141 token | RITL contract implements NEP-141 |
| Mechanic in contract | Ritual methods and supply changes are inside `ritl-core` |
| Daily check-in | One check-in per account per 24h epoch |
| Community target | 50 unique NEAR accounts |
| Success reward mint | 1,000 RITL per successful-epoch participant, claimed individually |
| Miss burn | 5 bps of remaining ritual treasury balance |
| Streak reset | Current streak resets on missed epoch |
| Longest streak | High-water mark persists |
| Immutable params | No config setter; `get_rules()` exposes values |
| No admin mint | Only valid successful-epoch reward claims can mint |
| Sybil resistance | Minimum balance, one check-in/account/epoch, participant cap; limitations disclosed |
| Dashboard | Current streak, progress, supply and event history |
| 60-day simulation | Optimistic/base/pessimistic deterministic scenarios and CSV |

## Meme.Cooking

Meme.Cooking is listed as a launchpad partner and its public docs describe an auction-based fair launch, a Ref Finance liquidity pool, and LP locking. The docs do not establish that a custom RITL contract containing our own state machine can be deployed through its standard launch flow. Therefore:

- Treat Meme.Cooking as a reference/possible integration, not a guaranteed dependency.
- Verify custom-contract compatibility before making it part of the MVP.
- Do not replace the custom RITL contract with a generic token implementation if doing so removes the ritual mechanic from the token contract.

## NEAR implementation references

- NEP-141: fungible token standard.
- NEP-145: storage management.
- NEP-148: fungible-token metadata.
- Official `near-smart-contracts` agent skill: Rust + current near-sdk v5.x guidance, security, state management, XCC, testing and Sandbox.

## Submission requirements from live HACKATHON.md

- Project repository must be public before development ends.
- README must give reproducible "do X, see Y" instructions for AI and human judges.
- X demo post must say it was built at NEAR HACKATHON, tag `@NEARProtocol` and `#NEARHackathon`, and include a demo video or screenshots.
- Submission is one attempt per repository. Human must review the complete payload and explicitly approve before submission.
- Do not deploy to mainnet, publish/push the repository, post on X, or submit without explicit human approval.
- Re-read the live instructions immediately before submission because they may change.

## Track selection

Submit `memecoins` as primary. Add `defi` only if a genuine NEAR Intents cross-chain settlement feature is implemented, tested, and visible in the demo. A stock reserve by itself does not qualify as cross-chain DeFi.
