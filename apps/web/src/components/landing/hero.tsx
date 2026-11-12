"use client";

import { useRef } from "react";
import Image from "next/image";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import {
  bpsToPercent,
  epochHours,
  type ResolvedRules,
} from "@/lib/ritual-params";
import { formatRitl } from "@/lib/ritual-format";

const ease = [0.2, 0.8, 0.2, 1] as const;

export function Hero({ resolved }: { resolved: ResolvedRules }) {
  const { rules, isLive, sourceLabel } = resolved;
  const reduced = useReducedMotion();
  const tileRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: tileRef,
    offset: ["start end", "end start"],
  });
  const imageY = useTransform(
    scrollYProgress,
    [0, 1],
    reduced ? ["0%", "0%"] : ["-6%", "6%"],
  );
  const rise = (delay: number) =>
    ({
      initial: reduced ? false : { opacity: 0, y: 36 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.8, delay, ease },
    }) as const;

  const quotes = [
    {
      label: "Daily target",
      value: String(rules.daily_target),
      unit: "check-ins",
      note: "Unique accounts per epoch",
    },
    {
      label: "Epoch",
      value: String(epochHours(rules)),
      unit: "hours",
      note: "Fixed by the contract",
    },
    {
      label: "Check-in reward",
      value: formatRitl(rules.reward_per_checkin, 0),
      unit: "RITL",
      note: "Minted per participant on success",
    },
    {
      label: "Missed-day burn",
      value: bpsToPercent(rules.treasury_burn_bps),
      unit: "",
      note: "Of the ritual treasury",
    },
  ];

  return (
    <section
      className="hero field-ground"
      id="top"
      aria-labelledby="hero-title"
    >
      <div className="frame">
        <div className="hero-grid">
          <div className="hero-copy">
            <h1 className="display" id="hero-title" data-hero-title>
              <motion.span style={{ display: "block" }} {...rise(0)}>
                The meme runs
              </motion.span>
              <motion.span style={{ display: "block" }} {...rise(0.12)}>
                on rituals.
              </motion.span>
            </h1>
            <div>
              <motion.p className="lead" {...rise(0.28)}>
                $RITL is a NEAR memecoin with one daily check-in the contract
                enforces. Reach {rules.daily_target} check-ins and every
                participant claims {formatRitl(rules.reward_per_checkin, 0)}{" "}
                RITL. Miss it and the ritual treasury burns{" "}
                {bpsToPercent(rules.treasury_burn_bps)}.
              </motion.p>
              <motion.div className="hero-actions" {...rise(0.4)}>
                <a className="btn btn-lime" href="#ritual">
                  Enter the ritual{" "}
                  <span className="arrow" aria-hidden="true">
                    ↗
                  </span>
                </a>
                <a className="link" href="#rules">
                  Read the rules →
                </a>
              </motion.div>
            </div>
          </div>

          <motion.div
            ref={tileRef}
            className="hero-tile"
            initial={reduced ? false : { opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.1, ease }}
          >
            <motion.div
              style={{ position: "absolute", inset: "-8% 0", y: imageY }}
            >
              <Image
                src="/brand/mascots/bull-mascot-hero-with-vault.png"
                fill
                sizes="(max-width: 900px) 100vw, 40vw"
                alt="The StonkRitual bull in a hoodie and green shades, holding a RITL coin in front of a vault"
                priority
              />
            </motion.div>
            <span className="tag tag-sim">Vault art · Simulation</span>
          </motion.div>
        </div>

        <div className="quotes" role="list" aria-label="Ritual rules">
          {quotes.map((quote, index) => (
            <motion.div
              className="quote"
              role="listitem"
              key={quote.label}
              initial={reduced ? false : { opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: index * 0.08, ease }}
              data-reveal
            >
              <span className="quote-label">{quote.label}</span>
              <span className="quote-value">
                {quote.value}
                {quote.unit ? <small>{quote.unit}</small> : null}
              </span>
              <span className="quote-note">{quote.note}</span>
            </motion.div>
          ))}
        </div>
        <p className="source-line">
          <span className={`tag ${isLive ? "tag-live" : ""}`}>
            {sourceLabel}
          </span>
          RITL is a community meme token, not an equity claim.
        </p>
      </div>
    </section>
  );
}
