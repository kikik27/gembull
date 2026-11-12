import { RITUAL_DECIMALS } from "@/constants/ritual";
import type { Rules } from "@/schemas/ritual";

const unit = 10n ** BigInt(RITUAL_DECIMALS);
const ritl = (whole: number) => (BigInt(whole) * unit).toString();

/**
 * Proposed genesis constants from docs/TOKENOMICS.md. They are shown only while no
 * contract is configured, always labelled "proposed", and replaced by get_rules() output as soon as it loads.
 */
export const PROPOSED_RULES: Rules = {
  epoch_duration_ns: "86400000000000",
  daily_target: 50,
  min_holding: ritl(1_000),
  max_participants: 200,
  reward_per_checkin: ritl(1_000),
  treasury_burn_bps: 5,
  initial_supply: ritl(1_000_000_000),
  max_supply: ritl(1_050_000_000),
  max_mint_per_epoch: ritl(200_000),
  name: "GemBull",
  symbol: "GEMBULL",
  decimals: RITUAL_DECIMALS,
};

export const PROPOSED_TREASURY = BigInt(ritl(150_000_000));

export type ResolvedRules = {
  rules: Rules;
  /** true when the values came from the contract's get_rules() view */
  isLive: boolean;
  /** short provenance label for the UI */
  sourceLabel: string;
};

export function resolveRules(live?: Rules): ResolvedRules {
  return live
    ? { rules: live, isLive: true, sourceLabel: "Live from get_rules()" }
    : { rules: PROPOSED_RULES, isLive: false, sourceLabel: "Proposed genesis values" };
}

export function epochHours(rules: Rules): number {
  return Number(BigInt(rules.epoch_duration_ns) / 3_600_000_000_000n);
}

/** Basis points as a percentage string, e.g. 5 -> "0.05%". */
export function bpsToPercent(bps: number): string {
  return `${(bps / 100).toFixed(2).replace(/\.?0+$/, "")}%`;
}

export function toBigInt(value: string | undefined | null, fallback = 0n): bigint {
  return value == null ? fallback : BigInt(value);
}

export function formatUnits(amount: bigint, places = 2): string {
  const whole = amount / unit;
  const fraction = (amount % unit).toString().padStart(RITUAL_DECIMALS, "0").slice(0, places).replace(/0+$/, "");
  return `${new Intl.NumberFormat("en-US").format(whole)}${fraction ? `.${fraction}` : ""}`;
}

/** Compact whole-GEMBULL figure for big display type, e.g. 1,050,000,000 -> "1.05B". */
export function compactUnits(amount: bigint): string {
  const whole = Number(amount / unit);
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 2 }).format(whole);
}
