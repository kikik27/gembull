"use client";

import { motion, useReducedMotion } from "motion/react";
import type { GlobalState, HistoryRow } from "@/schemas/ritual";

const W = 600;
const H = 190;
const PAD = { left: 8, right: 8, top: 16, bottom: 26 };
const MAX_BARS = 14;
const ease = [0.2, 0.8, 0.2, 1] as const;

/** Check-ins per finalized epoch. Reads only contract history; shows an empty state otherwise. */
export function EpochBars({
  rows,
  target,
}: {
  rows: HistoryRow[];
  target: number;
}) {
  const reduced = useReducedMotion();
  const data = [...rows].sort((a, b) => a.day_id - b.day_id).slice(-MAX_BARS);

  if (data.length === 0) {
    return (
      <p className="chart-empty">
        No finalized epochs yet. Bars appear once the contract finalizes its
        first day.
      </p>
    );
  }

  const max = Math.max(target, ...data.map((row) => row.checkin_count), 1) * 1.15;
  const slot = (W - PAD.left - PAD.right) / data.length;
  const barWidth = Math.min(slot * 0.62, 34);
  const y = (value: number) =>
    H - PAD.bottom - (value / max) * (H - PAD.top - PAD.bottom);
  const summary = data
    .map(
      (row) =>
        `Day ${row.day_id}: ${row.checkin_count} of ${row.target}, ${row.status.toLowerCase()}`,
    )
    .join(". ");

  return (
    <svg
      className="chart-svg"
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`Check-ins per finalized epoch, target ${target}. ${summary}.`}
    >
      <defs>
        <linearGradient id="bar-hit" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#b7ff16" />
          <stop offset="1" stopColor="#00b85a" stopOpacity="0.55" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((fraction) => (
        <line
          key={fraction}
          x1={PAD.left}
          x2={W - PAD.right}
          y1={H - PAD.bottom - fraction * (H - PAD.top - PAD.bottom)}
          y2={H - PAD.bottom - fraction * (H - PAD.top - PAD.bottom)}
          stroke="rgba(244,247,242,0.07)"
        />
      ))}
      {data.map((row, index) => {
        const x = PAD.left + slot * index + (slot - barWidth) / 2;
        const top = y(row.checkin_count);
        const hit = row.status === "SUCCESS";
        return (
          <g key={row.day_id}>
            <motion.rect
              x={x}
              y={top}
              width={barWidth}
              height={Math.max(2, H - PAD.bottom - top)}
              rx={4}
              fill={hit ? "url(#bar-hit)" : "var(--sr-danger)"}
              fillOpacity={hit ? 1 : 0.7}
              style={{ transformBox: "fill-box", transformOrigin: "bottom" }}
              initial={reduced ? false : { scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.9, delay: index * 0.04, ease }}
            />
            <text
              x={x + barWidth / 2}
              y={H - 8}
              textAnchor="middle"
              className="chart-axis"
            >
              {row.day_id}
            </text>
          </g>
        );
      })}
      <line
        x1={PAD.left}
        x2={W - PAD.right}
        y1={y(target)}
        y2={y(target)}
        stroke="rgba(255,200,87,0.7)"
        strokeDasharray="5 5"
      />
      <text x={W - PAD.right} y={y(target) - 6} textAnchor="end" className="chart-target">
        Target {target}
      </text>
    </svg>
  );
}

/** Finalized epochs split into hit and missed, straight from the contract counters. */
export function OutcomeMix({ global }: { global?: GlobalState }) {
  const hit = global?.successful_epochs ?? 0;
  const missed = global?.missed_epochs ?? 0;
  const total = hit + missed;

  if (!global || total === 0) {
    return (
      <p className="chart-empty">
        Waiting for the first finalized epoch.
      </p>
    );
  }

  const rows = [
    { label: "Target hit", value: hit, color: "var(--sr-lime)" },
    { label: "Target missed", value: missed, color: "var(--sr-danger)" },
  ];
  return (
    <ul className="mix" aria-label="Finalized epoch outcomes">
      {rows.map((row) => (
        <li key={row.label}>
          <div className="mix-label">
            <span>{row.label}</span>
            <span className="tabular">
              {row.value} · {Math.round((row.value / total) * 100)}%
            </span>
          </div>
          <div className="mix-track">
            <span
              className="mix-fill"
              style={{
                width: `${(row.value / total) * 100}%`,
                background: row.color,
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
