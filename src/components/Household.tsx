"use client";

import { motion, useReducedMotion } from "framer-motion";
import Spotlight from "./Spotlight";

// Illustrative household on the engine's 1 to 10 scale. Each reading is an estimate
// with a band; the ceiling is the lower of willingness and ability.
const ROWS = [
  {
    name: "Willingness",
    mean: 6.2,
    low: 5.4,
    high: 7.0,
  },
  { name: "Ability", mean: 5.1, low: 4.3, high: 5.9 },
  { name: "Need", mean: 6.8, low: 6.0, high: 7.6 },
];
const CEILING = 5.1;
const pct = (v: number) => `${((v - 1) / 9) * 100}%`;

export default function Household() {
  const reduce = useReducedMotion();
  const vp = { once: true, amount: 0.5 };
  const ease = [0.22, 1, 0.36, 1] as const;

  return (
    <section id="household" className="on-paper bg-paper py-24 sm:py-32">
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 sm:px-8 md:grid-cols-[1fr_1.1fr]">
        <div>
          <h2 className="font-serif text-4xl leading-[1.08] tracking-[-0.01em] text-navy sm:text-5xl">
            A risk profile that admits what it doesn&apos;t know.
          </h2>
          <p className="mt-6 max-w-[32rem] text-lg leading-relaxed text-muted">
            Galton separates how much risk a household wants, how much it can afford and how much its plan needs.
            Each is an estimate with a range, not a single score, and the recommended ceiling never goes above what
            the household can actually bear.
          </p>
          <p className="mt-4 max-w-[32rem] text-lg leading-relaxed text-muted">
            When the pieces disagree, Galton flags it, so the conversation with your client starts in the right
            place.
          </p>
        </div>

        <Spotlight className="rounded-2xl border border-rule bg-card p-5 sm:p-7">
          <p className="text-sm text-muted">Example household, 1 to 10 scale</p>

          <div className="relative mt-12 space-y-7">
            {/* the ceiling line, across all three scales */}
            <div className="pointer-events-none absolute inset-y-0 left-0 right-0 sm:left-[9.5rem]">
              <motion.div
                className="absolute -bottom-3 -top-3 w-0 border-l-2 border-dashed border-navy"
                style={{ left: pct(CEILING) }}
                initial={reduce ? false : { opacity: 0, scaleY: 0 }}
                whileInView={{ opacity: 1, scaleY: 1 }}
                viewport={vp}
                transition={{ duration: 0.7, delay: 1.1, ease }}
              />
              <motion.span
                className="absolute -top-9 -translate-x-1/2 whitespace-nowrap text-xs font-medium text-navy"
                style={{ left: pct(CEILING) }}
                initial={reduce ? false : { opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={vp}
                transition={{ duration: 0.4, delay: 1.5 }}
              >
                Ceiling
              </motion.span>
            </div>

            {ROWS.map((r, i) => (
              <div key={r.name} className="sm:flex sm:items-center sm:gap-4">
                <div className="mb-2 sm:mb-0 sm:w-[8.5rem] sm:shrink-0">
                  <p className="font-medium text-navy">{r.name}</p>
                </div>
                <div className="relative h-7 flex-1">
                  <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-rule" />
                  <motion.div
                    className="absolute top-1/2 h-3 -translate-y-1/2 rounded-full bg-[#C9AB66]/60"
                    style={{ left: pct(r.low), width: `calc(${pct(r.high)} - ${pct(r.low)})`, originX: 0.5 }}
                    initial={reduce ? false : { scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={vp}
                    transition={{ duration: 0.8, delay: 0.2 + i * 0.15, ease }}
                  />
                  <motion.div
                    className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-card bg-[#906F22]"
                    style={{ left: pct(r.mean) }}
                    initial={reduce ? false : { scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={vp}
                    transition={{ duration: 0.4, delay: 0.1 + i * 0.15 }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex items-center justify-between text-xs text-muted sm:ml-[9.5rem]">
            <span>1, lower risk</span>
            <span>10, higher risk</span>
          </div>

          <motion.div
            className="mt-6 rounded-xl border border-bad/25 bg-bad/[0.06] p-4"
            initial={reduce ? false : { opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={vp}
            transition={{ duration: 0.5, delay: 1.6 }}
          >
            <p className="font-medium text-bad">The plan needs more risk than the household can take</p>
            <p className="mt-1 text-[15px] leading-relaxed text-muted">
              Ceiling set by ability. Revisit goals, timeline or savings rate before raising risk.
            </p>
          </motion.div>
        </Spotlight>
      </div>
    </section>
  );
}
