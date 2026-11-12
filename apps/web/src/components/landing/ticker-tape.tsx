import { bpsToPercent, epochHours, type ResolvedRules } from "@/lib/ritual-params";

/** Plain-language guarantees and rules, read like a market ticker. No prices, no fabricated live figures. */
export function TickerTape({ resolved }: { resolved: ResolvedRules }) {
  const { rules } = resolved;
  const items = [
    "Daily ritual enforced by the contract",
    `${epochHours(rules)}-hour epochs`,
    `Target ${rules.daily_target} check-ins`,
    "One check-in per account",
    `${bpsToPercent(rules.treasury_burn_bps)} treasury burn on a miss`,
    "No admin mint",
    "NEAR Testnet build",
    "Stock vault is a simulation",
    "Not an equity claim",
  ];
  return (
    <div className="ticker" role="region" aria-label="Ritual rules at a glance">
      <div className="ticker-track">
        <ul className="ticker-list">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <ul className="ticker-list" aria-hidden="true">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
