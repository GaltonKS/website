"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";

// Illustrative portfolio: 22 holdings that collapse into four groups of holdings that
// move together. Group sizes are uneven, which is why the effective count is 4.3 and
// not simply the number of groups.
const GROUPS = [9, 6, 4, 3];
const DOTS = GROUPS.flatMap((n, g) => Array.from({ length: n }, (_, i) => ({ g, i, n })));

const MEASURES = [
  {
    term: "Independent bets",
    body: "How many genuinely separate risks the portfolio holds once you account for holdings that rise and fall together.",
  },
  {
    term: "Share of risk from the market",
    body: "How much of the portfolio's movement comes from the market as a whole, with its beta to a broad index.",
  },
  {
    term: "Sector concentration",
    body: "Exposure by sector, and which sectors carry more of the risk than their weight in the portfolio suggests.",
  },
  {
    term: "Drawdown and stress",
    body: "The largest historical fall from a peak, plus preset and custom stress scenarios you can run with a client.",
  },
];

export default function Measures() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  const clustered = inView || !!reduce;

  // spread: a 11 x 2 grid. clustered: four tight clumps, sized by group.
  const VW = 560, VH = 200;
  const centers = [
    [105, 100],
    [268, 94],
    [395, 108],
    [497, 96],
  ];
  const spread = (k: number) => [40 + (k % 11) * 48, 60 + Math.floor(k / 11) * 80];
  const clump = (g: number, i: number, n: number) => {
    const ring = i === 0 ? 0 : 1 + Math.floor((i - 1) / 6);
    const slot = i === 0 ? 0 : (i - 1) % 6;
    const a = (slot / Math.min(6, n - 1)) * Math.PI * 2 + g;
    const r = ring * 25;
    return [centers[g][0] + Math.cos(a) * r, centers[g][1] + Math.sin(a) * r];
  };

  return (
    <section className="on-paper bg-paper py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid items-center gap-12 md:grid-cols-[1fr_1.15fr]">
          <div>
            <h2 className="font-serif text-4xl leading-[1.08] tracking-[-0.01em] text-navy sm:text-5xl">
              Twenty-two holdings can still be four bets.
            </h2>
            <p className="mt-6 max-w-[32rem] text-lg leading-relaxed text-muted">
              A client with two dozen positions often looks diversified on a statement. Galton AI measures how the
              holdings actually move together, so you can see the handful of risks the portfolio really depends on.
            </p>
          </div>

          <div ref={ref} className="rounded-2xl border border-rule bg-card p-5 sm:p-7">
            <div className="flex items-baseline justify-between gap-4">
              <p className="text-sm text-muted">Example portfolio</p>
              <p className="tabular text-sm text-muted">
                <span className="text-ink">22</span> holdings
              </p>
            </div>
            <svg viewBox={`0 0 ${VW} ${VH}`} className="mt-2 w-full" aria-hidden="true">
              {DOTS.map((d, k) => {
                const [sx, sy] = spread(k);
                const [tx, ty] = clump(d.g, d.i, d.n);
                return (
                  <motion.circle
                    key={k}
                    r={12}
                    fill={["#6B5113", "#906F22", "#B08B3A", "#C9AB66"][d.g]}
                    stroke="#1f1b16"
                    strokeOpacity={0.25}
                    initial={false}
                    animate={clustered ? { cx: tx, cy: ty } : { cx: sx, cy: sy }}
                    transition={{ duration: 1.1, delay: reduce ? 0 : 0.2 + k * 0.025, ease: [0.65, 0, 0.35, 1] }}
                  />
                );
              })}
            </svg>
            <div className="mt-2 flex flex-col gap-1 border-t border-rule pt-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
              <p className="text-sm text-muted">Moves like</p>
              <motion.p
                className="font-serif text-3xl text-navy"
                initial={false}
                animate={{ opacity: clustered ? 1 : 0.15 }}
                transition={{ duration: 0.6, delay: reduce ? 0 : 1.2 }}
              >
                <span className="tabular">4.3</span> independent bets
              </motion.p>
            </div>
          </div>
        </div>

        <dl className="mt-20 grid gap-x-12 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {MEASURES.map((m) => (
            <div key={m.term} className="border-t border-ink/15 pt-5">
              <dt className="font-medium text-navy">{m.term}</dt>
              <dd className="mt-2 leading-relaxed text-muted">{m.body}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
