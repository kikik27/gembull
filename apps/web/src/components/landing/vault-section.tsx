"use client";

import { useState } from "react";
import {
  calculateReserveScenario,
  MAX_DAILY_ROUTED_VOLUME,
  MAX_PROTECTED_SURPLUS,
  RESERVE_SCENARIO_DAYS,
} from "@/lib/reserve-simulation";
import { Reveal } from "./reveal";
import { VaultScene } from "./vault-scene";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

/** An educational model of proposed funding paths, kept separate from chain balances and ritual supply. */
export function VaultSection() {
  const [dailyRoutedVolume, setDailyRoutedVolume] = useState(5_000);
  const [protectedNetSurplus, setProtectedNetSurplus] = useState(0);
  const outcome = calculateReserveScenario({
    dailyRoutedVolume,
    protectedNetSurplus,
  });

  return (
    <section className="section" id="vault" aria-labelledby="vault-title">
      <div className="vault-intro">
        <Reveal>
          <span className="tag tag-sim">Secondary concept · SIMULATED</span>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="h2" id="vault-title">
            Two possible paths. <em>One imagined reserve.</em>
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p>
            Explore how a future stock reserve might be funded. Adjust the two
            proposed sources below and watch the 3D model respond. No trade
            router, graduation flow, stock purchase, or reserve custody is live.
          </p>
        </Reveal>
      </div>

      <Reveal className="vault-simulator" delay={0.12}>
        <div className="vault-model">
          <div className="vault-model-heading">
            <span>SIMULATED FLOW</span>
            <span>NO LIVE FUNDS</span>
          </div>
          <VaultScene
            routedContribution={outcome.routedOverPeriod}
            graduationContribution={outcome.graduationOnce}
          />
          <div className="vault-model-labels" aria-hidden="true">
            <span>01 / APP ROUTER</span>
            <span>02 / GRADUATION</span>
            <span>03 / RESERVE</span>
          </div>
        </div>

        <div className="vault-console">
          <div className="vault-console-head">
            <span>Build a hypothetical scenario</span>
            <strong>SIMULATED</strong>
          </div>
          <div className="vault-control">
            <label htmlFor="vault-routed-volume">
              <span>Eligible routed volume / day</span>
              <output htmlFor="vault-routed-volume">
                {currency.format(dailyRoutedVolume)}
              </output>
            </label>
            <input
              id="vault-routed-volume"
              type="range"
              min="0"
              max={MAX_DAILY_ROUTED_VOLUME}
              step="500"
              value={dailyRoutedVolume}
              onChange={(event) =>
                setDailyRoutedVolume(Number(event.target.value))
              }
              aria-valuetext={`${currency.format(dailyRoutedVolume)} eligible routed volume per day`}
            />
            <p>
              Proposed 1% stock-reserve share from a future app router, shown
              over {RESERVE_SCENARIO_DAYS} illustrative days.
            </p>
          </div>
          <div className="vault-control vault-control-gold">
            <label htmlFor="vault-protected-surplus">
              <span>Protected net graduation surplus</span>
              <output htmlFor="vault-protected-surplus">
                {currency.format(protectedNetSurplus)}
              </output>
            </label>
            <input
              id="vault-protected-surplus"
              type="range"
              min="0"
              max={MAX_PROTECTED_SURPLUS}
              step="5000"
              value={protectedNetSurplus}
              onChange={(event) =>
                setProtectedNetSurplus(Number(event.target.value))
              }
              aria-valuetext={`${currency.format(protectedNetSurplus)} protected net surplus`}
            />
            <p>
              Proposed 5% one-time share, only after refund, LP, settlement,
              and reserve obligations are protected.
            </p>
          </div>
          <dl className="vault-result" aria-live="polite">
            <div>
              <dt>Router share / day</dt>
              <dd>{currency.format(outcome.routedPerDay)}</dd>
            </div>
            <div>
              <dt>Router share / {RESERVE_SCENARIO_DAYS} days</dt>
              <dd>{currency.format(outcome.routedOverPeriod)}</dd>
            </div>
            <div>
              <dt>Graduation share / once</dt>
              <dd>{currency.format(outcome.graduationOnce)}</dd>
            </div>
            <div className="vault-result-total">
              <dt>Illustrative reserve input</dt>
              <dd>{currency.format(outcome.illustrativeTotal)}</dd>
            </div>
          </dl>
        </div>
      </Reveal>

      <div className="vault-disclosures">
        <p>
          Arithmetic only, not actual reserve performance. No real shares,
          broker execution, custody, dividends, redemption, or equity ownership.
          Costs and market movements are excluded.
        </p>
        <p>
          Proposed Ritual Points and active-holder allocations are a separate,
          unimplemented simulation. This example never changes on-chain GEMBULL
          supply or the ritual treasury.
        </p>
      </div>
    </section>
  );
}
