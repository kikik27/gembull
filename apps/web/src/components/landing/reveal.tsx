"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

type DataAttributes = { [key: `data-${string}`]: string | undefined };
type Props = {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  id?: string;
} & DataAttributes;

/**
 * One entrance for one part of a section (heading, copy, picture, panel). Stagger parts with `delay`.
 * Content stays visible without script (see the noscript rule in layout.tsx) and with reduced motion.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
  id,
  ...dataAttributes
}: Props) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      {...dataAttributes}
      id={id}
      data-reveal
      className={className}
      initial={reduced ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.7, delay, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}
