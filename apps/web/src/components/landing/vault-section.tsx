import { Vault } from "lucide-react";
import { Reveal } from "./reveal";

/**
 * SIMULATION — the stock reserve layer. Figures are the arithmetic example from docs/simulation/60_DAY_SIMULATION.md
 * ($5,000 routed per day, 1% proposed reserve share, 60 days). They are not reserve performance and never merge with on-chain GEMBULL balances.
 */
export function VaultSection() {
  const rows = [
    { label: "Proposed routed-fee share", value: "1.00% of eligible trades" },
    { label: "Proposed graduation share", value: "5.00% of protected net surplus" },
    { label: "Example routed volume", value: "$5,000 / day" },
    { label: "Reserve per day", value: "$50" },
    { label: "Reserve after 60 days", value: "$3,000" },
    { label: "Real shares held", value: "None" },
  ];
  return (
    <section className="section" id="vault" aria-labelledby="vault-title">
      <div className="frame vault-grid">
        <Reveal className="vault-copy">
          <div>
            <span className="tag tag-sim">Secondary concept · Simulation</span>
          </div>
          <h2 className="h2" id="vault-title">
            A future idea, clearly simulated.
          </h2>
          <p>
            Two funding sources are proposed: eligible routed trading fees and
            protected bonding graduation surplus. Neither route is live. A future
            MVP would use non-transferable Ritual Points and simulated active-holder
            allocations, with no stock receipt token.
          </p>
          <p>
            GEMBULL itself does not represent ownership of any company. The reserve
            never touches the ritual mechanic or the on-chain balances above.
          </p>
        </Reveal>
        <Reveal className="slip" delay={0.12}>
          <div className="slip-head">
            <span>Proposed reserve · Simulation</span>
            <Vault aria-hidden="true" size={28} strokeWidth={1.4} />
          </div>
          {rows.map((row) => (
            <div className="slip-row" key={row.label}>
              <span>{row.label}</span>
              <strong>{row.value}</strong>
            </div>
          ))}
          <p className="slip-foot">
            Simulation — no real shares are held by this prototype. Arithmetic
            example for routed fees only, not reserve performance. It excludes
            graduation surplus, broker, custody, FX and transfer costs. No real
            shares, dividends, redemption or ownership are provided.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
