import { formatRitl } from "@/lib/ritual-format";
import {
  bpsToPercent,
  epochHours,
  type ResolvedRules,
} from "@/lib/ritual-params";
import { Reveal } from "./reveal";
import { SectionHead } from "./section-head";

export function RulesSection({ resolved }: { resolved: ResolvedRules }) {
  const { rules, isLive, sourceLabel } = resolved;
  const entries = [
    {
      label: "Epoch length",
      note: "Fixed 24-hour cadence",
      value: `${epochHours(rules)} hours`,
    },
    {
      label: "Daily target",
      note: "Check-ins needed for a successful day",
      value: `${rules.daily_target} accounts`,
    },
    {
      label: "Max participants",
      note: "Cap on accepted check-ins per epoch",
      value: `${rules.max_participants} accounts`,
    },
    {
      label: "Minimum holding",
      note: "Required at the moment of check-in",
      value: `${formatRitl(rules.min_holding)} RITL`,
    },
    {
      label: "Missed-day burn",
      note: `${bpsToPercent(rules.treasury_burn_bps)} of the remaining ritual treasury`,
      value: `${rules.treasury_burn_bps} bps`,
    },
    {
      label: "Reward per claim",
      note: "Minted only after a successful epoch",
      value: `${formatRitl(rules.reward_per_checkin)} RITL`,
    },
  ];

  return (
    <section
      className="section field-paper"
      id="rules"
      aria-labelledby="rules-title"
    >
      <div className="frame">
        <SectionHead
          title={<span id="rules-title">Set once. Seen by everyone.</span>}
          aside="Read from get_rules() when a contract is configured. There are no setters for any of these values."
        />
        <div className="rules-grid">
          <Reveal className="rules-copy">
            <div>
              <span className={`tag ${isLive ? "" : "tag-sim"}`}>
                {isLive
                  ? "Declared at deployment · verification pending"
                  : sourceLabel}
              </span>
            </div>
            <p>
              No admin function changes these parameters, and no one can mint
              outside a successful epoch claim.
            </p>
            <p>
              A deployer with code upgrade access could still replace the
              contract code, so upgrade authority has to be reviewed separately
              before anyone calls this immutable.
            </p>
            <p>
              Minimum holding and one check-in per account add friction. They do
              not prove one human per account.
            </p>
          </Reveal>
          <dl className="terms">
            {entries.map((entry, index) => (
              <Reveal
                className="term"
                key={entry.label}
                delay={index * 0.05}
                y={20}
              >
                <dt>
                  {entry.label}
                  <small>{entry.note}</small>
                </dt>
                <dd>{entry.value}</dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
