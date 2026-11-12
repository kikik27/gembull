"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Reveal } from "./reveal";
import { RoadmapScene } from "./roadmap-scene";

const milestones = [
  {
    status: "LIVE ON TESTNET",
    short: "Contract",
    title: "The rules are on-chain.",
    detail:
      "GemBull is deployed on NEAR Testnet. Token metadata and genesis balances were verified. The contract enforces daily check-ins, claims after successful days, and ritual treasury burns after misses.",
    note: "Live contract · gembull-core.testnet",
  },
  {
    status: "NEXT · DEMO",
    short: "Ritual demo",
    title: "Prove the ritual in public.",
    detail:
      "Bring eligible Testnet accounts into a shared day, then document wallet check-ins, sequential settlement, a reward claim, and event history. Sandbox covers success and failure; the full live walkthrough is still pending.",
    note: "Live walkthrough pending",
  },
  {
    status: "PLANNED · SIMULATED",
    short: "Reserve idea",
    title: "Explore a separate reserve.",
    detail:
      "Design a SIMULATED stock-reserve layer with proposed routed-fee and protected-surplus inputs plus non-transferable Ritual Points. No real shares, custody, redemption, or stock receipt token are part of this prototype.",
    note: "Concept only · no real equity",
  },
] as const;

export function RoadmapSection() {
  const [active, setActive] = useState(0);
  const item = milestones[active];

  return (
    <section className="section" id="roadmap" aria-labelledby="roadmap-title">
      <div className="sec-head">
        <Reveal>
          <h2 className="h2" id="roadmap-title">
            What ships next.
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p>
            Follow the path from a live contract to a public ritual demo, then
            to an idea still in simulation. Select a milestone to see what it
            actually means.
          </p>
        </Reveal>
      </div>

      <Reveal className="roadmap-experience" delay={0.08} data-step={String(active)}>
        <div className="roadmap-visual">
          <div className="roadmap-visual-heading" aria-hidden="true">
            <span>THE ROAD AHEAD</span>
            <span>01 — 03</span>
          </div>
          <RoadmapScene active={active} onSelect={setActive} />
          <ol className="roadmap-waypoints" aria-label="Roadmap milestones">
            {milestones.map((milestone, index) => (
              <li key={milestone.status}>
                <button
                  type="button"
                  className="roadmap-waypoint"
                  aria-pressed={active === index}
                  onClick={() => setActive(index)}
                >
                  <span>0{index + 1}</span>
                  <strong>{milestone.short}</strong>
                </button>
              </li>
            ))}
          </ol>
        </div>

        <div className="roadmap-story">
          <div className="roadmap-story-top">
            <span className="roadmap-counter">0{active + 1} / 03</span>
            <span className="roadmap-current-status">{item.status}</span>
          </div>
          <div className="roadmap-story-copy" aria-live="polite">
            <span className="roadmap-kicker">Chapter 0{active + 1}</span>
            <h3>{item.title}</h3>
            <p>{item.detail}</p>
          </div>
          <div className="roadmap-story-bottom">
            <span>{item.note}</span>
            <div className="roadmap-controls" aria-label="Explore roadmap">
              <button
                type="button"
                aria-label="Previous milestone"
                onClick={() => setActive((index) => Math.max(0, index - 1))}
                disabled={active === 0}
              >
                <ArrowLeft aria-hidden="true" size={18} />
              </button>
              <button
                type="button"
                aria-label="Next milestone"
                onClick={() =>
                  setActive((index) => Math.min(milestones.length - 1, index + 1))
                }
                disabled={active === milestones.length - 1}
              >
                <ArrowRight aria-hidden="true" size={18} />
              </button>
            </div>
          </div>
        </div>
      </Reveal>
      <p className="roadmap-disclaimer">
        Milestones describe implementation status, not launch dates or returns.
        The stock reserve remains SIMULATED.
      </p>
    </section>
  );
}
