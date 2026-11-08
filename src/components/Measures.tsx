"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef, useState } from "react";
import Spotlight from "./Spotlight";

// Illustrative portfolio: 22 holdings that collapse into four groups of holdings that
// move together. Group sizes are uneven, which is why the effective count is 4.3 and
// not simply the number of groups.
const GROUPS = [9, 6, 4, 3];
// The slider sets one average correlation across all holdings, a simplification of the
// engine's full covariance model: with N equal positions and average correlation rho,
// the portfolio behaves like N / (1 + (N - 1) * rho) independent bets.
const N = 22;
const RHO_EXAMPLE = 0.195; // gives 4.3, the example portfolio
const RHO_MAX = 0.8;
const effectiveBets = (rho: number) => N / (1 + (N - 1) * rho);
const fmtBets = (b: number) => (b >= 9.95 ? Math.round(b).toString() : b.toFixed(1));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

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
  const [rho, setRho] = useState(RHO_EXAMPLE);
  const [touched, setTouched] = useState(false);
  const bets = effectiveBets(rho);

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
  // Where a dot sits for a given correlation: spread out at 0, four clumps at the
  // example value, and the clumps pulled together into one lump as rho rises further.
  const place = (k: number, g: number, i: number, n: number): [number, number] => {
    const [sx, sy] = spread(k);
    const [cx, cy] = clump(g, i, n);
    if (rho <= RHO_EXAMPLE) {
      const t = rho / RHO_EXAMPLE;
      return [lerp(sx, cx, t), lerp(sy, cy, t)];
    }
    const t = ((rho - RHO_EXAMPLE) / (RHO_MAX - RHO_EXAMPLE)) * 0.78;
    return [lerp(cx, VW / 2, t), lerp(cy, VH / 2, t)];
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

          <Spotlight className="rounded-2xl border border-rule bg-card p-5 sm:p-7">
            <div ref={ref}>
              <div className="flex items-baseline justify-between gap-4">
                <p className="text-sm text-muted">Example portfolio</p>
                <p className="tabular text-sm text-muted">
                  <span className="text-ink">22</span> holdings
                </p>
              </div>
              <svg viewBox={`0 0 ${VW} ${VH}`} className="mt-2 w-full" aria-hidden="true">
                {DOTS.map((d, k) => {
                  const [sx, sy] = spread(k);
                  const [tx, ty] = place(k, d.g, d.i, d.n);
                  return (
                    <motion.circle
                      key={k}
                      r={12}
                      fill={["#6B5113", "#906F22", "#B08B3A", "#C9AB66"][d.g]}
                      stroke="#1f1b16"
                      strokeOpacity={0.25}
                      initial={false}
                      animate={clustered ? { cx: tx, cy: ty } : { cx: sx, cy: sy }}
                      transition={
                        touched
                          ? { type: "spring", stiffness: 180, damping: 22, mass: 0.6 }
                          : { duration: 1.1, delay: reduce ? 0 : 0.2 + k * 0.025, ease: [0.65, 0, 0.35, 1] }
                      }
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
                  transition={{ duration: 0.6, delay: reduce || touched ? 0 : 1.2 }}
                >
                  <span className="tabular">{fmtBets(bets)}</span> independent{" "}
                  {fmtBets(bets) === "1.0" ? "bet" : "bets"}
                </motion.p>
              </div>

              <div className="mt-5 rounded-xl bg-paper/70 px-4 pb-3 pt-3.5">
                <label htmlFor="rho" className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="font-medium text-navy">Try it: how closely do the holdings move together?</span>
                </label>
                <input
                  id="rho"
                  type="range"
                  min={0}
                  max={RHO_MAX}
                  step={0.005}
                  value={rho}
                  onChange={(e) => {
                    setTouched(true);
                    setRho(Number(e.target.value));
                  }}
                  aria-valuetext={`${fmtBets(bets)} independent bets`}
                  className="range mt-1 w-full"
                  style={{ ["--fill" as string]: `${(rho / RHO_MAX) * 100}%` }}
                />
                <div className="flex justify-between text-xs text-muted">
                  <span>Each on its own</span>
                  <span>All as one</span>
                </div>
              </div>
            </div>
          </Spotlight>
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
