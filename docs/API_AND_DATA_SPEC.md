# API and Data Specification

## 1. Authority model

| Data | Authoritative source |
|---|---|
| GEMBULL balance and total supply | GEMBULL NEP-141 contract |
| Check-in eligibility and count | GEMBULL core contract |
| Epoch outcome and streaks | GEMBULL core contract |
| Reward entitlement/claim status | GEMBULL core contract |
| Ritual treasury balance/burn | GEMBULL core contract |
| Stock reserve balance and contribution | Stock-vault contract |
| Mock execution result | Mock broker service, explicitly simulated |
| Mock receipt supply | Receipt-token contract |
| Stock price quote | Named market-data provider + timestamp; informational only |

Backend/database records are cache/index data and must be reconstructible from chain events where applicable.

## 2. Contract view interfaces

The frontend should call the following GEMBULL read methods:

```text
get_rules() -> RitualConfigView
get_global_state() -> GlobalRitualView
get_epoch({ day_id }) -> EpochView
get_account_epoch_status({ account_id, day_id }) -> AccountEpochView
ft_balance_of({ account_id }) -> string
ft_total_supply() -> string
ft_metadata() -> FungibleTokenMetadata
storage_balance_of({ account_id }) -> Option<StorageBalance>
```

Write methods:

```text
storage_deposit({ account_id? }, attached_deposit)
check_in()                         # attach NEAR for persisted ritual storage
finalize_day({ day_id })           # attach NEAR if settlement creates storage
claim_reward({ day_id })          # attach NEAR for claim record storage
ft_transfer({ receiver_id, amount, memo? }, attached_deposit = 1 yoctoNEAR)
```

The exact JSON serialization and method signatures must match the selected NEAR SDK/standard helper APIs.

## 3. Event indexing

Consume:

- NEP-141 `ft_mint`, `ft_burn`, `ft_transfer`;
- custom `gembull` `ritual_check_in`, `ritual_day_finalized`, `ritual_reward_claimed`.

Recommended indexed table:

```sql
CREATE TABLE ritual_events (
  id BIGSERIAL PRIMARY KEY,
  tx_hash TEXT NOT NULL,
  block_height BIGINT NOT NULL,
  block_timestamp TIMESTAMPTZ NOT NULL,
  standard TEXT NOT NULL,
  event TEXT NOT NULL,
  day_id BIGINT,
  account_id TEXT,
  amount NUMERIC(78, 0),
  payload JSONB NOT NULL,
  UNIQUE (tx_hash, event, payload)
);

CREATE INDEX idx_ritual_events_day ON ritual_events(day_id);
CREATE INDEX idx_ritual_events_type ON ritual_events(event);
CREATE INDEX idx_ritual_events_account ON ritual_events(account_id);
```

If an indexer is not ready, the UI may use contract view methods and explorer links for the MVP. Do not fake event history with hardcoded arrays.

## 4. Stock simulator API (test-only)

Proposed internal endpoints; these are implementation contracts, not externally available APIs:

```text
GET  /api/stock/quote?ticker=NVDA
POST /api/stock/batches/:batchId/simulate-execution
GET  /api/stock/batches/:batchId
```

Example quote response:

```json
{
  "ticker": "NVDA",
  "price": "SIMULATED_OR_SOURCE_PRICE",
  "currency": "USD",
  "asOf": "ISO-8601 timestamp",
  "source": "provider-name-or-mock",
  "mode": "SIMULATED"
}
```

Example execution response:

```json
{
  "batchId": 1,
  "ticker": "NVDA",
  "contributionUsd": "100.00",
  "simulatedShares": "0.25000000",
  "simulatedExecutionPrice": "400.00",
  "status": "SIMULATED_EXECUTED",
  "mode": "SIMULATED",
  "evidenceHash": "sha256-of-deterministic-demo-payload"
}
```

The service must not call a real broker in the hackathon build. No secrets or production credentials are required.

## 5. Suggested frontend data types

```typescript
export type EpochOutcome = "ACTIVE" | "SUCCESS" | "MISSED";

export interface RitualRules {
  epochDurationNs: string;
  dailyTarget: number;
  minHolding: string;
  maxParticipants: number;
  rewardPerCheckin: string;
  treasuryBurnBps: number;
  initialSupply: string;
  maxSupply: string;
}

export interface RitualDashboard {
  currentDayId: number;
  currentCheckins: number;
  currentStreak: number;
  longestStreak: number;
  totalSupply: string;
  maxSupply: string;
  ritualTreasuryBalance: string;
  totalMinted: string;
  totalBurned: string;
  reservedMintCapacity: string;
  lastFinalizedDay: number | null;
}

export interface StockBatchView {
  batchId: number;
  ticker: "NVDA";
  contributionAmount: string;
  status: "COLLECTING" | "READY" | "SIMULATED_EXECUTED" | "ATTESTED" | "RECEIPT_MINTED" | "FAILED";
  simulatedShares?: string;
  evidenceHash?: string;
  disclaimer: "SIMULATED_NO_EQUITY_CLAIM";
}
```

Do not convert token base-unit integers to JavaScript `number`. Use decimal strings and a big-number library or exact integer formatting.
