#!/usr/bin/env python3
"""Deterministic 60-day StonkRitual token supply simulator (stdlib only)."""
from __future__ import annotations

import argparse
import csv
from pathlib import Path

BASE_UNITS = 10**18
INITIAL_SUPPLY = 1_000_000_000 * BASE_UNITS
MAX_SUPPLY = 1_050_000_000 * BASE_UNITS
INITIAL_RITUAL_TREASURY = 150_000_000 * BASE_UNITS
DAILY_TARGET = 50
MAX_PARTICIPANTS = 200
REWARD_PER_CHECKIN = 1_000 * BASE_UNITS
TREASURY_BURN_BPS = 5
DAYS = 60


def as_ritl(amount: int) -> str:
    """Format exact base units without rounding through a float."""
    whole, fraction = divmod(amount, BASE_UNITS)
    if fraction == 0:
        return str(whole)
    return f"{whole}.{fraction:018d}".rstrip("0")


def checkins_for(scenario: str, day: int) -> int:
    if scenario == "optimistic":
        return 35 if day % 4 == 0 else 70
    if scenario == "base":
        return 60 if day % 5 in (1, 2, 3) else 40
    if scenario == "pessimistic":
        return 55 if day % 10 in (1, 2, 3) else 25
    raise ValueError(f"Unknown scenario: {scenario}")


def simulate(scenario: str) -> list[dict[str, int | str]]:
    supply = INITIAL_SUPPLY
    treasury = INITIAL_RITUAL_TREASURY
    current_streak = 0
    longest_streak = 0
    rows: list[dict[str, int | str]] = []

    for day in range(1, DAYS + 1):
        checkins = checkins_for(scenario, day)
        minted = 0
        burned = 0
        outcome = "SUCCESS" if checkins >= DAILY_TARGET else "MISSED"

        if outcome == "SUCCESS":
            current_streak += 1
            longest_streak = max(longest_streak, current_streak)
            eligible = min(checkins, MAX_PARTICIPANTS)
            minted = eligible * REWARD_PER_CHECKIN
            if supply + minted > MAX_SUPPLY:
                raise RuntimeError(
                    f"{scenario} day {day}: simulated mint exceeds max supply"
                )
            supply += minted
        else:
            current_streak = 0
            burned = (treasury * TREASURY_BURN_BPS) // 10_000
            if treasury > 0 and burned == 0:
                burned = 1
            burned = min(burned, treasury)
            treasury -= burned
            supply -= burned

        rows.append(
            {
                "scenario": scenario,
                "day": day,
                "checkins": checkins,
                "target": DAILY_TARGET,
                "outcome": outcome,
                "minted_ritl": minted,
                "burned_ritl": burned,
                "total_supply": supply,
                "ritual_treasury_balance": treasury,
                "current_streak": current_streak,
                "longest_streak": longest_streak,
            }
        )

    return rows


def summarize(rows: list[dict[str, int | str]]) -> dict[str, int | str]:
    success_days = sum(1 for row in rows if row["outcome"] == "SUCCESS")
    missed_days = DAYS - success_days
    minted = sum(int(row["minted_ritl"]) for row in rows)
    burned = sum(int(row["burned_ritl"]) for row in rows)
    final = rows[-1]
    return {
        "success_days": success_days,
        "missed_days": missed_days,
        "total_minted_ritl": as_ritl(minted),
        "total_burned_ritl": as_ritl(burned),
        "net_supply_change_ritl": ("-" if minted < burned else "") + as_ritl(abs(minted - burned)),
        "final_supply_ritl": as_ritl(int(final["total_supply"])),
        "final_treasury_ritl": as_ritl(int(final["ritual_treasury_balance"])),
        "longest_streak": int(final["longest_streak"]),
        "current_streak": int(final["current_streak"]),
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--output",
        default="docs/simulation/ritl-60-day-simulation.csv",
        help="CSV output path (default: docs/simulation/ritl-60-day-simulation.csv)",
    )
    parser.add_argument(
        "--check",
        action="store_true",
        help="Check that the existing CSV matches the simulation without writing it",
    )
    args = parser.parse_args()

    scenarios = ["optimistic", "base", "pessimistic"]
    all_rows: list[dict[str, int | str]] = []
    summaries: dict[str, dict[str, int | str]] = {}
    for scenario in scenarios:
        rows = simulate(scenario)
        all_rows.extend(rows)
        summaries[scenario] = summarize(rows)

    output = Path(args.output)
    fieldnames = [
        "scenario",
        "day",
        "checkins",
        "target",
        "outcome",
        "minted_ritl",
        "burned_ritl",
        "total_supply",
        "ritual_treasury_balance",
        "current_streak",
        "longest_streak",
    ]
    csv_rows = []
    for row in all_rows:
        csv_row = row.copy()
        for key in ("minted_ritl", "burned_ritl", "total_supply", "ritual_treasury_balance"):
            csv_row[key] = as_ritl(int(row[key]))
        csv_rows.append(csv_row)

    if args.check:
        with output.open(newline="", encoding="utf-8") as file:
            current = list(csv.DictReader(file))
        expected = [{key: str(row[key]) for key in fieldnames} for row in csv_rows]
        if current != expected:
            raise SystemExit(f"CSV mismatch: {output}")
        print(f"Verified {len(expected)} rows in {output}")
    else:
        output.parent.mkdir(parents=True, exist_ok=True)
        with output.open("w", newline="", encoding="utf-8") as file:
            writer = csv.DictWriter(file, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(csv_rows)
        print(f"Wrote {len(csv_rows)} rows to {output}")
    for scenario, summary in summaries.items():
        print(f"\n[{scenario.upper()}]")
        for key, value in summary.items():
            print(f"{key}: {value}")


if __name__ == "__main__":
    main()
