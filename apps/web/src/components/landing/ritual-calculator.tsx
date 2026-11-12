"use client";

import { useId, useMemo, useState } from "react";
import {
  bpsToPercent,
  formatUnits,
  type ResolvedRules,
} from "@/lib/ritual-params";
import { outcomeFor } from "@/lib/ritual-simulation";
import { Reveal } from "./reveal";
import { SectionHead } from "./section-head";

const MAX_SLOTS = 200;

type Props = {
  resolved: ResolvedRules;
  treasury: bigint;
  treasuryIsLive: boolean;
};

export function RitualCalculator({
  resolved,
  treasury,
  treasuryIsLive,
}: Props) {
  const { rules } = resolved;
  const rangeId = useId();
  const [picked, setPicked] = useState<number | null>(null);
  const value = Math.min(
    picked ?? Math.max(0, rules.daily_target - 8),
    rules.max_participants,
  );
  const outcome = useMemo(
    () => outcomeFor(value, rules, treasury),
    [value, rules, treasury],
  );

  const slotCount = Math.min(rules.max_participants, MAX_SLOTS);
  const filled = Math.round((value / rules.max_participants) * slotCount);
  const goalIndex = Math.max(
    0,
    Math.round((rules.daily_target / rules.max_participants) * slotCount) - 1,
  );
  const success = outcome.kind === "success";

  return (
    <section
      className="section field-ground"
      id="calculator"
      aria-labelledby="calc-title"
    >
      <div className="frame">
        <SectionHead
          title={<span id="calc-title">Slide it. Watch the contract.</span>}
          aside="Pick how many accounts check in today. The result below uses the same rules the contract runs, so you can see the stakes before you show up."
        />
        <div className="calc-grid">
          <Reveal className="calc-left">
            <div className="calc-readout">
              <label htmlFor={rangeId}>Accounts that check in</label>
              <div className="calc-number" aria-hidden="true">
                {value}
                <span>/ {rules.max_participants}</span>
              </div>
            </div>
            <div className="slots" aria-hidden="true">
              {Array.from({ length: slotCount }, (_, index) => (
                <span
                  key={index}
                  className="slot"
                  data-on={index < filled}
                  data-goal={index === goalIndex}
                />
              ))}
            </div>
            <input
              id={rangeId}
              className="range"
              type="range"
              min={0}
              max={rules.max_participants}
              step={1}
              value={value}
              onChange={(event) => setPicked(Number(event.target.value))}
              aria-valuetext={`${value} of ${rules.max_participants} accounts checked in. Target is ${rules.daily_target}.`}
            />
            <div className="slots-key">
              <span>
                <i /> Checked in
              </span>
              <span>
                <i className="goal" /> Target at {rules.daily_target}
              </span>
            </div>
          </Reveal>

          <Reveal className="calc-right" delay={0.1} data-kind={outcome.kind}>
            <div aria-live="polite" style={{ display: "grid", gap: 24 }}>
              <div className="calc-verdict">
                {success ? "Target hit." : "Target missed."}
              </div>
              <p className="explain">
                {success
                  ? "The community hit the target. Eligible check-ins can claim their reward after the epoch is finalized."
                  : "The target was missed. After finalization the contract records the configured treasury burn and resets the streak."}
              </p>
            </div>
            <div className="figures">
              {outcome.kind === "success" ? (
                <>
                  <div className="figure">
                    <span>Claimable by participants</span>
                    <strong>{formatUnits(outcome.claimable, 0)} RITL</strong>
                  </div>
                  <div className="figure">
                    <span>Unused mint capacity released</span>
                    <strong>{formatUnits(outcome.released, 0)} RITL</strong>
                  </div>
                  <div className="figure">
                    <span>Streak</span>
                    <strong>+1 day</strong>
                  </div>
                </>
              ) : (
                <>
                  <div className="figure">
                    <span>Short of target</span>
                    <strong>
                      {outcome.shortBy}{" "}
                      {outcome.shortBy === 1 ? "check-in" : "check-ins"}
                    </strong>
                  </div>
                  <div className="figure">
                    <span>
                      Treasury burn ({bpsToPercent(rules.treasury_burn_bps)})
                    </span>
                    <strong>{formatUnits(outcome.burn, 0)} RITL</strong>
                  </div>
                  <div className="figure">
                    <span>Streak</span>
                    <strong>Resets to 0</strong>
                  </div>
                </>
              )}
            </div>
          </Reveal>
        </div>
        <p className="calc-source">
          Illustration of the contract rules, not a prediction.{" "}
          {resolved.sourceLabel}. Burn is computed on{" "}
          {treasuryIsLive
            ? "the live ritual treasury"
            : `a ${formatUnits(treasury, 0)} RITL proposed genesis treasury`}
          .
        </p>
      </div>
    </section>
  );
}
