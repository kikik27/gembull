/** Proposed stock-reserve arithmetic only. No router, graduation, or shares exist in the MVP. */
export const RESERVE_SCENARIO_DAYS = 60;
export const ROUTED_RESERVE_SHARE = 0.01;
export const GRADUATION_RESERVE_SHARE = 0.05;
export const MAX_DAILY_ROUTED_VOLUME = 20_000;
export const MAX_PROTECTED_SURPLUS = 100_000;

export type ReserveScenario = {
  dailyRoutedVolume: number;
  protectedNetSurplus: number;
};

const cents = (amount: number) => Math.round(amount * 100) / 100;

export function calculateReserveScenario({
  dailyRoutedVolume,
  protectedNetSurplus,
}: ReserveScenario) {
  const routedPerDay = cents(dailyRoutedVolume * ROUTED_RESERVE_SHARE);
  const routedOverPeriod = cents(routedPerDay * RESERVE_SCENARIO_DAYS);
  const graduationOnce = cents(
    protectedNetSurplus * GRADUATION_RESERVE_SHARE,
  );
  return {
    routedPerDay,
    routedOverPeriod,
    graduationOnce,
    illustrativeTotal: cents(routedOverPeriod + graduationOnce),
  };
}
