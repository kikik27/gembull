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
            Where could a future <em>reserve come from?</em>
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p>
            Try two proposed sources: purchases through a future GemBull app
            router and a one-time graduation surplus. Move the sliders to see
            each calculation and its path into the 3D vault. No router,
            graduation flow, purchase, or custody is live.
          </p>
        </Reveal>
      </div>

      <Reveal className="vault-simulator" delay={0.12}>
        <div className="vault-model">
          <div className="vault-model-heading">
            <span>SIMULATED FLOW</span>
            <span>NO LIVE FUNDS</span>
          </div>
          <div className="vault-flow-formulas">
            <div className="vault-flow-formula">
              <span>01 · ELIGIBLE APP PURCHASES</span>
              <strong>{currency.format(dailyRoutedVolume)} / day</strong>
              <p>
                <b>× proposed 1%</b> = {currency.format(outcome.routedPerDay)} / day
              </p>
              <p>
                <b>× {RESERVE_SCENARIO_DAYS} days</b> = {currency.format(outcome.routedOverPeriod)}
              </p>
            </div>
            <div className="vault-flow-formula vault-flow-formula-gold">
              <span>02 · PROTECTED GRADUATION SURPLUS</span>
              <strong>{currency.format(protectedNetSurplus)} / once</strong>
              <p>
                <b>× proposed 5%</b> = {currency.format(outcome.graduationOnce)}
              </p>
              <p>After protected obligations; zero surplus means zero input.</p>
            </div>
          </div>
          <VaultScene
            routedContribution={outcome.routedOverPeriod}
            graduationContribution={outcome.graduationOnce}
          />
          <div className="vault-model-labels" aria-hidden="true">
            <span>GREEN / ROUTED TRADES</span>
            <span>GOLD / GRADUATION</span>
            <span>GLASS / COMBINED</span>
          </div>
        </div>

        <div className="vault-console">
          <div className="vault-console-head">
            <span>Change the inputs</span>
            <strong>SIMULATED</strong>
          </div>
          <div className="vault-control">
            <label htmlFor="vault-routed-volume">
              <span>Eligible app-routed purchases / day</span>
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
              aria-valuetext={`${currency.format(dailyRoutedVolume)} eligible app-routed purchases per day`}
            />
            <p>
              Only hypothetical purchases through a future GemBull app router
              count here. Ordinary transfers and unrelated DEX trades do not.
            </p>
          </div>
          <div className="vault-control vault-control-gold">
            <label htmlFor="vault-protected-surplus">
              <span>Surplus left after graduation obligations</span>
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
              A one-time hypothetical amount left after refunds, LP seed,
              settlement costs, and minimum reserve obligations.
            </p>
          </div>
          <dl className="vault-result" aria-live="polite">
            <div>
              <dt>From app purchases / {RESERVE_SCENARIO_DAYS} days</dt>
              <dd>{currency.format(outcome.routedOverPeriod)}</dd>
            </div>
            <div>
              <dt>From protected surplus / once</dt>
              <dd>{currency.format(outcome.graduationOnce)}</dd>
            </div>
            <div className="vault-result-total">
              <dt>Total hypothetical contribution</dt>
              <dd>{currency.format(outcome.illustrativeTotal)}</dd>
            </div>
          </dl>
        </div>
      </Reveal>

      <Reveal className="vault-governance" delay={0.16}>
        <div className="vault-governance-intro">
          <span className="tag tag-sim">COMMUNITY CHOICE · PLANNED</span>
          <h3>Who chooses the stock? <em>The community.</em></h3>
          <p>
            A separate NEAR ballot is the next goal. Eligible wallets would
            nominate candidates and sign votes; anyone could close the round.
            No team member would choose the winner or edit the tally. Voting is
            not live yet.
          </p>
        </div>
        <ol className="vault-governance-steps">
          <li>
            <span>01 / NOMINATE</span>
            <strong>Put a candidate on the ballot.</strong>
            <p>Community submitted tickers would be visibly unverified.</p>
          </li>
          <li>
            <span>02 / VOTE ON NEAR</span>
            <strong>Let eligible wallets decide.</strong>
            <p>Votes and the final tally would come from a separate contract.</p>
          </li>
          <li>
            <span>03 / SHOW RECIPIENTS</span>
            <strong>Make each portion traceable.</strong>
            <p>Future simulated records would show wallet, points, snapshot, and calculated portion.</p>
          </li>
        </ol>
        <p className="vault-governance-note">
          No ballot or recipient ledger is deployed. A vote selects a simulated
          target; it does not buy stock or give GEMBULL holders shares.
        </p>
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
