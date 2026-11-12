# StonkRitual v0.2 archive → GemBull documentation

Source: user-supplied `stonkritual-docs-v0.2.zip`, changelog dated **12 November 2026**. The archive was extracted into a temporary review directory, read, and compared with the current GemBull deployment and docs. Its original RITL naming and proposed genesis status were not copied over the verified GemBull Testnet record.

| Archive change | GemBull handling |
|---|---|
| Daily ritual economics | Existing deployed GemBull rules remain authoritative; no contract constants or deployment changed |
| Two-source stock treasury | Added as a **planned** model: eligible routed fees and protected graduation surplus; numeric rates remain **PROPOSED** |
| Active-holder-only, points-weighted allocation | Added as a **planned** model; five-of-seven eligibility and snapshot are proposals, not live contract features |
| Retire mock `rNVDA` receipt in MVP | Updated primary, technical, UI, brand and landing docs/copy; no custom stock receipt is presented as an MVP feature |
| Open operational decisions | Recorded in [OPEN_DECISIONS.md](OPEN_DECISIONS.md) |
| User test flow | Recorded in [TESTNET_USER_GUIDE.md](TESTNET_USER_GUIDE.md), with generic funding and storage prerequisites |
| Go-to-market plan | Adapted as experiment hypotheses in [GO_TO_MARKET_STRATEGY.md](GO_TO_MARKET_STRATEGY.md) |
| Competitor comparison | Archive snapshot retained in the ZIP but not reproduced as current fact; product-page claims need fresh source verification before publication |
| Archive brand assets | Kept out of the active asset manifest so the approved GemBull logo, mascot and existing asset pack remain canonical |
| Archive stock-reserve scripts/CSVs | Not merged into the live supply simulator; they describe a proposed funding flow and must be reviewed against approved parameters before becoming reproducible project evidence |

The deployed `gembull-core.testnet` contract has no points, stock treasury, bonding, router, or receipt interface. The website's stock section is arithmetic illustration only. The legacy `ritl-stonkritual.testnet` account remains separate.
