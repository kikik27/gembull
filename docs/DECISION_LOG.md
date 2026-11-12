# Product and Architecture Decision Log

| ID | Decision | Rationale | Status |
|---|---|---|---|
| ADR-001 | Working project name `StonkRitual` | Communicates stonk meme culture + on-chain community ritual | Proposed; naming clearance pending |
| ADR-002 | Meme ticker `RITL` | Short ticker derived from Ritual; avoids the crowded `MEME`/`MEMESTOCK` naming direction | Proposed; on-chain collision check pending |
| ADR-003 | Separate stock receipt symbol `rNVDA` | Keeps stock receipt rights distinct from RITL | Test-only name; must be changed if it could mislead |
| ADR-004 | Track 11 `memecoins` as primary | Track explicitly grades mechanic, NEP-141, supply behavior, treasury rules and rituals | Accepted |
| ADR-005 | Daily 24h check-in ritual as primary mechanic | Directly addresses official track prompt and gives judges testable success/failure states | Deployed on Testnet |
| ADR-006 | One RITL core contract combines NEP-141 and ritual | Prevents the supply-changing mechanic from being switched off by a backend | Accepted for MVP |
| ADR-007 | Claim-per-user instead of bulk mint loop | Avoids unbounded iteration and gas spikes at settlement | Accepted |
| ADR-008 | 1B initial supply, 1.05B max supply | Preserves a finite emission budget while allowing visible, bounded rewards | Deployed on Testnet |
| ADR-009 | 5 bps treasury burn on missed day | Proportional, deterministic and mild enough for repeated misses | Deployed on Testnet |
| ADR-010 | Account-level Sybil friction, not proof-of-humanity | Appropriate for demo; limitations will be disclosed | Accepted |
| ADR-011 | Mock stock reserve + receipt in MVP; real equity excluded | Shows the product direction without pretending to hold securities | Accepted |
| ADR-012 | Meme.Cooking is optional until custom token compatibility is tested | Public docs describe its fair launch and LP lock, not confirmed arbitrary custom contract deployment | Pending integration check |
| ADR-013 | NEAR Intents excluded from P0 | Not required for Track 11 and adds testnet/integration complexity | Accepted |
| ADR-014 | Four new Testnet accounts for RITL genesis, including the contract treasury | Keeps allocations separate and auditable; all keys reside in the local Windows keychain | Testnet demo; upgrade authority remains FullAccess |

## Open questions before production

- Which licensed issuer/broker/custodian can legally support fractional US equity exposure for the target jurisdictions?
- What exact legal right does each receipt token represent, and which transfers/redemptions are permitted?
- What market-data source and license are suitable for stock quote display?
- Which liquidity venue supports the custom NEP-141 contract and what LP lock primitive can be used?
- What contract deployment account/multisig arrangement will constrain code upgrades?
