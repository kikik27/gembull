"use client";

import { useEffect, useRef, useState } from "react";

const CALL = [
  '"method": "check_in",',
  '"args": {},',
  '"deposit": "0.05 NEAR",',
  '"predecessor": "you.testnet",',
  '"checks": [',
  '  "balance >= min_holding",',
  '  "one check-in per epoch",',
  '  "epoch is the next unsettled day"',
  "],",
  '"emits": {',
  '  "standard": "gembull",',
  '  "event": "ritual_check_in"',
  "}",
].join("\n");

const CHAR_MS = 22;
const NEWLINE_MS = 120;
const HOLD_MS = 3200;

/**
 * An illustrative `check_in` call that types itself out and loops. It starts once 30% of the block is
 * visible and is shown fully typed (no animation) when the visitor prefers reduced motion.
 */
export function TypedCall() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [typed, setTyped] = useState(CALL);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;

    let timer = 0;
    let visible = false;
    let started = false;
    let index = 0;

    const tick = () => {
      if (!visible) {
        timer = window.setTimeout(tick, 400);
        return;
      }
      index += 1;
      setTyped(CALL.slice(0, index));
      if (index >= CALL.length) {
        timer = window.setTimeout(() => {
          index = 0;
          setTyped("");
          timer = window.setTimeout(tick, CHAR_MS);
        }, HOLD_MS);
        return;
      }
      timer = window.setTimeout(
        tick,
        CALL[index - 1] === "\n" ? NEWLINE_MS : CHAR_MS,
      );
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !started) {
          started = true;
          setTyping(true);
          setTyped("");
          timer = window.setTimeout(tick, CHAR_MS);
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(host);

    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <div className="code" ref={hostRef} aria-hidden="true">
      <div className="code-head">
        <span>check_in.json</span>
        <span>NEAR function call · illustrative</span>
      </div>
      <pre className="code-body">
        {typed}
        {typing ? <span className="caret" /> : null}
      </pre>
      <div className="code-foot">
        <span>event ritual_check_in</span>
        <span className="tag-dot code-live">emitted when executed</span>
      </div>
    </div>
  );
}
