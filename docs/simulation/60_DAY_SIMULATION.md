# 60-Day Ritual Supply Simulation

## Parameters

- Initial supply: 1,000,000,000 GEMBULL
- Maximum supply: 1,050,000,000 GEMBULL
- Ritual treasury at genesis: 150,000,000 GEMBULL
- Arithmetic: integer base units (`10^18` per GEMBULL); burn floors only at the base-unit boundary
- Daily target: 50 accounts
- Reward per eligible check-in on successful day: 1,000 GEMBULL
- Maximum participants per day: 200
- Missed-day burn: 5 bps (0.05%) of the remaining ritual treasury
- Epoch count: 60 days
- Claim assumption: 100% of eligible participants claim their rewards

## Scenario assumptions

- **Optimistic:** 70 check-ins on 45 days; 35 check-ins on 15 days (miss every fourth day).
- **Base:** 60 check-ins on 36 days; 40 check-ins on 24 days (three success days, then two missed days, repeated).
- **Pessimistic:** 55 check-ins on 18 days; 25 check-ins on 42 days (three success days, then seven missed days, repeated).

These are illustrative behavior profiles to test the mechanic, not a forecast of actual adoption, trading volume, token price, or investment return.

## 60-day result

| Metric | Optimistic | Base | Pessimistic |
|---|---:|---:|---:|
| Successful days | 45 | 36 | 18 |
| Missed days | 15 | 24 | 42 |
| Reward minted | 3,150,000 | 2,160,000 | 990,000 |
| Treasury burned | 1,121,071.018467189839568491 | 1,789,687.850580172445785057 | 3,117,926.704631492985262709 |
| Net supply change | +2,028,928.981532810160431509 | +370,312.149419827554214943 | -2,127,926.704631492985262709 |
| Final total supply | 1,002,028,928.981532810160431509 | 1,000,370,312.149419827554214943 | 997,872,073.295368507014737291 |
| Final ritual treasury | 148,878,928.981532810160431509 | 148,210,312.149419827554214943 | 146,882,073.295368507014737291 |
| Longest streak | 3 | 3 | 3 |
| Current streak after day 60 | 0 | 0 | 0 |

## Supply checkpoints

| Day | Optimistic supply | Base supply | Pessimistic supply |
|---:|---:|---:|---:|
| 0 | 1,000,000,000 | 1,000,000,000 | 1,000,000,000 |
| 10 | 1,000,410,037.5 | 1,000,060,224.925009375 | 999,640,786.844078026578905079 |
| 20 | 1,000,675,374.8125468703125 | 1,000,121,048.950655987565615627 | 999,283,405.684374997659261139 |
| 30 | 1,001,085,786.844078026578905079 | 1,000,182,470.879636914664697169 | 998,927,850.11851411610760353 |
| 40 | 1,001,351,685.251967569242046904 | 1,000,244,489.517042043755351294 | 998,574,113.766493319098647272 |
| 50 | 1,001,762,470.879636914664697169 | 1,000,307,103.67034929075298002 | 998,222,190.270607083914723003 |
| 60 | 1,002,028,928.981532810160431509 | 1,000,370,312.149419827554214943 | 997,872,073.295368507014737291 |

## Interpretation

- The optimistic scenario yields net inflation because a high success rate creates more reward mints than the missed-day treasury burns.
- The base scenario is nearly neutral: its 60-day net supply increase is approximately 0.037% of genesis supply.
- The pessimistic scenario is deflationary because repeated missed days burn more ritual treasury than successful days mint to participants.
- All scenarios remain far below the 1.05B maximum supply.
- The longest streak in these particular deterministic patterns is three days; the current streak ends at zero because each pattern finishes on a missed day. A different participation sequence can produce longer streaks.

## Separate stock-reserve illustration

This reserve model is not part of the GEMBULL supply simulation. Assuming the application router allocates 1% of eligible purchase volume to the stock vault:

| Illustrative routed purchase volume/day | Reserve/day | Reserve after 60 days |
|---:|---:|---:|
| $1,000 | $10 | $600 |
| $5,000 | $50 | $3,000 |
| $20,000 | $200 | $12,000 |

These are arithmetic examples only. They exclude broker, custody, FX, transfer and market-data costs and must not be shown as actual reserve performance.

## Reproduction

Run from repository root:

```bash
python scripts/simulate_60_days.py
python scripts/simulate_60_days.py --check
```

The script writes `docs/simulation/gembull-60-day-simulation.csv` and prints scenario summaries. The checked-in CSV is generated from the parameters above.
