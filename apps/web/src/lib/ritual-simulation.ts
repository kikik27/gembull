import { PROPOSED_TREASURY, toBigInt } from "@/lib/ritual-params";
import type { Rules } from "@/schemas/ritual";

/**
 * SIMULATION — deterministic 60-day participation patterns from docs/simulation/60_DAY_SIMULATION.md.
 * Pure integer (base-unit) arithmetic that follows the contract rules; not a forecast.
 */
export type ScenarioId = "optimistic" | "base" | "pessimistic";

export type Scenario = {
  id: ScenarioId;
  label: string;
  pattern: string;
  /** check-ins on a day the pattern calls "strong" */
  strong: number;
  /** check-ins on a day the pattern calls "weak" */
  weak: number;
  isStrongDay: (day: number) => boolean;
};

export const SCENARIOS: Scenario[] = [
  { id: "optimistic", label: "Optimistic", pattern: "Misses every fourth day", strong: 70, weak: 35, isStrongDay: (d) => d % 4 !== 3 },
  { id: "base", label: "Base", pattern: "Three hits, two misses", strong: 60, weak: 40, isStrongDay: (d) => d % 5 < 3 },
  { id: "pessimistic", label: "Pessimistic", pattern: "Three hits, seven misses", strong: 55, weak: 25, isStrongDay: (d) => d % 10 < 3 },
];

export type SimulationPoint = { day: number; net: bigint };
export type SimulationResult = {
  scenario: Scenario;
  points: SimulationPoint[];
  minted: bigint;
  burned: bigint;
  net: bigint;
  successDays: number;
  missedDays: number;
};

export function simulate(scenario: Scenario, rules: Rules, treasuryStart: bigint = PROPOSED_TREASURY, days = 60): SimulationResult {
  const target = rules.daily_target;
  const reward = toBigInt(rules.reward_per_checkin);
  const bps = BigInt(rules.treasury_burn_bps);
  let treasury = treasuryStart;
  let minted = 0n;
  let burned = 0n;
  let successDays = 0;
  const points: SimulationPoint[] = [{ day: 0, net: 0n }];

  for (let day = 0; day < days; day += 1) {
    const checkins = scenario.isStrongDay(day) ? scenario.strong : scenario.weak;
    if (checkins >= target) {
      minted += BigInt(Math.min(checkins, rules.max_participants)) * reward;
      successDays += 1;
    } else if (treasury > 0n) {
      let burn = (treasury * bps) / 10_000n;
      if (burn === 0n) burn = 1n;
      treasury -= burn;
      burned += burn;
    }
    points.push({ day: day + 1, net: minted - burned });
  }
  return { scenario, points, minted, burned, net: minted - burned, successDays, missedDays: days - successDays };
}

export type DayOutcome =
  | { kind: "success"; claimable: bigint; released: bigint }
  | { kind: "missed"; burn: bigint; shortBy: number };

/** What the contract would do for one epoch that closes with `checkins` accepted accounts. */
export function outcomeFor(checkins: number, rules: Rules, treasury: bigint): DayOutcome {
  const reward = toBigInt(rules.reward_per_checkin);
  if (checkins >= rules.daily_target) {
    const claimable = BigInt(checkins) * reward;
    return { kind: "success", claimable, released: toBigInt(rules.max_mint_per_epoch) - claimable };
  }
  const burn = treasury === 0n ? 0n : (treasury * BigInt(rules.treasury_burn_bps)) / 10_000n || 1n;
  return { kind: "missed", burn, shortBy: rules.daily_target - checkins };
}
