"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  compactUnits,
  formatUnits,
  PROPOSED_TREASURY,
  type ResolvedRules,
} from "@/lib/ritual-params";
import { SCENARIOS, simulate, type ScenarioId } from "@/lib/ritual-simulation";

const UNIT = 10n ** 18n;
const W = 880;
const H = 400;
const PAD = { left: 70, right: 190, top: 20, bottom: 40 };
const COLORS: Record<ScenarioId, string> = {
  optimistic: "var(--lime)",
  base: "var(--ink)",
  pessimistic: "var(--sr-danger)",
};

function signed(amount: bigint): string {
  const sign = amount > 0n ? "+" : amount < 0n ? "−" : "";
  const abs = amount < 0n ? -amount : amount;
  return `${sign}${compactUnits(abs)}`;
}

export function SimulationChart({ resolved }: { resolved: ResolvedRules }) {
  const reduced = useReducedMotion();
  const results = useMemo(
    () =>
      SCENARIOS.map((scenario) =>
        simulate(scenario, resolved.rules, PROPOSED_TREASURY),
      ),
    [resolved.rules],
  );

  const maxAbs = results.reduce(
    (max, result) =>
      result.points.reduce((m, p) => {
        const abs = Number((p.net < 0n ? -p.net : p.net) / UNIT);
        return abs > m ? abs : m;
      }, max),
    1,
  );
  const nice = Math.max(500_000, Math.ceil(maxAbs / 500_000) * 500_000);
  const days = results[0].points.length - 1;
  const x = (day: number) =>
    PAD.left + (day / days) * (W - PAD.left - PAD.right);
  const y = (net: bigint) =>
    PAD.top +
    (1 - (Number(net / UNIT) + nice) / (2 * nice)) * (H - PAD.top - PAD.bottom);
  const zeroY = y(0n);
  const niceBig = BigInt(nice) * UNIT;
  const summary = results
    .map((r) => `${r.scenario.label}: ${signed(r.net)} GEMBULL`)
    .join(". ");

  return (
    <>
      <svg
        className="sim-chart"
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Simulated net supply change over ${days} days. ${summary}.`}
      >
        {[niceBig, 0n, -niceBig].map((tick) => (
          <g key={tick.toString()}>
            <text x={PAD.left - 12} y={y(tick) + 5} textAnchor="end">
              {signed(tick)}
            </text>
            {tick !== 0n && (
              <line
                x1={PAD.left}
                x2={W - PAD.right}
                y1={y(tick)}
                y2={y(tick)}
                stroke="var(--ink)"
                strokeOpacity={0.12}
                strokeWidth={1}
              />
            )}
          </g>
        ))}
        <line
          x1={PAD.left}
          x2={W - PAD.right}
          y1={zeroY}
          y2={zeroY}
          stroke="var(--ink)"
          strokeOpacity={0.5}
          strokeWidth={2}
        />
        {[0, 30, 60].map((day) => (
          <text
            key={day}
            x={x(day)}
            y={H - 10}
            textAnchor={day === 0 ? "start" : day === days ? "end" : "middle"}
          >
            Day {day}
          </text>
        ))}
        {results.map((result, index) => {
          const path = result.points
            .map(
              (p, i) =>
                `${i === 0 ? "M" : "L"}${x(p.day).toFixed(1)},${y(p.net).toFixed(1)}`,
            )
            .join(" ");
          const end = result.points[result.points.length - 1];
          return (
            <g key={result.scenario.id}>
              <motion.path
                data-reveal-path
                d={path}
                fill="none"
                stroke={COLORS[result.scenario.id]}
                strokeWidth={4}
                strokeLinejoin="round"
                strokeLinecap="round"
                initial={reduced ? false : { pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{
                  duration: 1.4,
                  delay: index * 0.18,
                  ease: [0.2, 0.8, 0.2, 1],
                }}
              />
              <text
                className="end-label"
                x={x(end.day) + 12}
                y={y(end.net) + 5}
                style={{ fill: COLORS[result.scenario.id] }}
              >
                {result.scenario.label} {signed(end.net)}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="sim-legend">
        {results.map((result) => (
          <div key={result.scenario.id}>
            <span>
              <i style={{ background: COLORS[result.scenario.id] }} />
              {result.scenario.label}
            </span>
            <strong>{signed(result.net)} GEMBULL</strong>
            <small>
              {result.successDays} hit days · {result.missedDays} missed ·{" "}
              {formatUnits(result.minted, 0)} minted ·{" "}
              {formatUnits(result.burned, 0)} burned
            </small>
          </div>
        ))}
      </div>
    </>
  );
}
