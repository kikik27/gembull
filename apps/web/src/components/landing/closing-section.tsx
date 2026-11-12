"use client";

import dynamic from "next/dynamic";
import { Reveal } from "./reveal";

const RitualCoin = dynamic(() => import("./ritual-coin"), { ssr: false, loading: () => <div className="coin-stage" aria-hidden="true" /> });

export function ClosingSection() {
  return (
    <section className="section field-lime closing" id="join" aria-labelledby="closing-title">
      <div className="frame closing-grid">
        <div>
          <Reveal>
            <h2 id="closing-title">Check in. Keep the streak.</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p>One transaction a day. The contract keeps score, so nobody has to take our word for it.</p>
            <a className="btn btn-ink" href="#ritual">
              Enter the ritual <span className="arrow" aria-hidden="true">↗</span>
            </a>
          </Reveal>
        </div>
        <Reveal delay={0.15} y={40}>
          <RitualCoin />
        </Reveal>
      </div>
    </section>
  );
}
