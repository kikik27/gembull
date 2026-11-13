# GemBull Ritual Keeper Bot

Automated keeper worker that monitors and finalizes GemBull daily ritual epochs on NEAR Testnet.

## Overview
Smart contracts on NEAR cannot execute transactions on their own when time elapses. The GemBull smart contract exposes a permissionless `finalize_day({ day_id })` method. This keeper bot automates that process:
1. Queries contract global state and rules via NEAR RPC (with failover endpoints).
2. Calculates whether the active epoch has ended and unfinalized past epochs exist (`current_day_id > last_finalized_day + 1`).
3. If unfinalized epochs exist, submits `finalize_day({ day_id })` sequentially with the configured keeper wallet.
4. If the active epoch is still in progress, logs the time remaining until settlement.

## Configuration (.env)

```ini
NEAR_NETWORK=testnet
NEAR_RPC_URL=https://test.rpc.fastnear.com
GEMBULL_CONTRACT_ID=gembull-core.testnet

# Keeper Wallet (Required for automatic settlement transactions)
KEEPER_ACCOUNT_ID=your-account.testnet
KEEPER_PRIVATE_KEY=ed25519:your_private_key_here

# Bot Operation Settings
POLL_INTERVAL_SECONDS=60
ATTACHED_DEPOSIT_NEAR=0.05
GAS_TGAS=100
```

## Running Locally

```bash
# Single check (monitor mode if no keys)
node keeper.mjs --once

# Continuous monitor / keeper
npm start
```

## Running with Docker Compose (VPS)

```bash
# Build and start in background
docker compose up -d --build

# View real-time logs
docker compose logs -f

# Stop keeper
docker compose down
```
