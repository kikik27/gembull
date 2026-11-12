# Product and Architecture Decision Log

| ID | Decision | Rationale | Status |
|---|---|---|---|
| ADR-001 | Project name `GemBull` | Bull mascot and daily ritual identity selected by owner | Accepted for product; legal/domain clearance pending |
| ADR-002 | Token symbol `GEMBULL` | Aligns the token metadata with the selected brand | Deployed and verified on `gembull-core.testnet` |
| ADR-003 | Former mock receipt symbol `rNVDA` | Superseded by v0.2 non-transferable points and simulated allocation records | Retired from revised MVP; never deployed |
| ADR-004 | Track 11 `memecoins` as primary | Track explicitly grades mechanic, NEP-141, supply behavior, treasury rules and rituals | Accepted |
| ADR-005 | Daily 24h check-in ritual as primary mechanic | Directly addresses official track prompt and gives judges testable success/failure states | Deployed on Testnet |
| ADR-006 | One GEMBULL core contract combines NEP-141 and ritual | Prevents the supply-changing mechanic from being switched off by a backend | Accepted for MVP |
| ADR-007 | Claim-per-user instead of bulk mint loop | Avoids unbounded iteration and gas spikes at settlement | Accepted |
| ADR-008 | 1B initial supply, 1.05B max supply | Preserves a finite emission budget while allowing visible, bounded rewards | Deployed on Testnet |
| ADR-009 | 5 bps treasury burn on missed day | Proportional, deterministic and mild enough for repeated misses | Deployed on Testnet |
| ADR-010 | Account-level Sybil friction, not proof-of-humanity | Appropriate for demo; limitations will be disclosed | Accepted |
| ADR-011 | Simulated two-source stock reserve plus active-holder points in future MVP; no custom stock receipt | Adopts v0.2 product direction without implying equity ownership | Accepted direction; implementation pending |
| ADR-012 | Meme.Cooking is optional until custom token compatibility is tested | Public docs describe its fair launch and LP lock, not confirmed arbitrary custom contract deployment | Pending integration check |
| ADR-013 | NEAR Intents excluded from P0 | Not required for Track 11 and adds testnet/integration complexity | Accepted |
| ADR-014 | Four new Testnet accounts for GEMBULL genesis, including the contract treasury | Keeps allocations separate and auditable; all keys reside in the local Windows keychain | Testnet demo; upgrade authority remains FullAccess |
| ADR-015 | Keep the earlier RITL Testnet deployment as legacy evidence; deploy GemBull to a separate account | Changing source cannot rename existing on-chain metadata or migrate balances | GemBull deployed at `gembull-core.testnet`; RITL account remains separate |

## Open questions before production

- Which licensed issuer/broker/custodian can legally support fractional US equity exposure for the target jurisdictions?
- Which issuer-authorized stock asset or receipt, if any, could legally represent rights, and which transfers/redemptions would be permitted?
- What market-data source and license are suitable for stock quote display?
- Which liquidity venue supports the custom NEP-141 contract and what LP lock primitive can be used?
- What contract deployment account/multisig arrangement will constrain code upgrades?
