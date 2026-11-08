"use client";

// A replay of Galton AI's number check: the reply is drafted, every figure is matched
// against the engine's output, a figure that doesn't match gets the reply withheld,
// and the corrected reply passes. Plays once when scrolled into view; Replay reruns it.

import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Spotlight from "./Spotlight";

type Fig = { fig: string; src: string; fix?: string };
type Seg = string | Fig;

const ENGINE: { key: string; label: string; value: string }[] = [
  { key: "holdings", label: "Holdings", value: "22" },
  { key: "effective_bets", label: "Independent bets", value: "4.27" },
  { key: "market_share", label: "Share of risk from the market", value: "0.6841" },
  { key: "tech_weight", label: "Technology weight", value: "0.3127" },
  { key: "stress_2008", label: "2008-style stress loss", value: "0.3412" },
];

const REPLY: Seg[] = [
  "The portfolio holds ",
  { fig: "22", src: "holdings" },
  " positions but behaves like about ",
  { fig: "4.3", src: "effective_bets" },
  " independent bets. The market drives ",
  { fig: "68.4%", src: "market_share" },
  " of its risk, and technology makes up ",
  { fig: "35%", src: "tech_weight", fix: "31.3%" },
  " of assets. In a 2008-style crash it would lose about ",
  { fig: "34.1%", src: "stress_2008" },
  ".",
];

const FIGS = REPLY.filter((s): s is Fig => typeof s !== "string");
// Where each segment starts in the typed-out reply, and which figure it is.
const LAYOUT = REPLY.reduce<{ seg: Seg; start: number; fig: number }[]>((acc, seg) => {
  const prev = acc[acc.length - 1];
  const start = prev ? prev.start + (typeof prev.seg === "string" ? prev.seg.length : prev.seg.fig.length) : 0;
  const fig = (prev?.fig ?? -1) + (typeof seg === "string" ? 0 : 1);
  return [...acc, { seg, start, fig }];
}, []);
const TOTAL_CHARS = REPLY.reduce((n, s) => n + (typeof s === "string" ? s.length : s.fig.length), 0);

type Status = "pending" | "checking" | "ok" | "bad";
type Stage = "idle" | "typing" | "checking" | "withheld" | "fixing" | "passed";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function NumberCheck() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.45 });
  const reduce = useReducedMotion();

  const [run, setRun] = useState(0);
  const [stage, setStage] = useState<Stage>("idle");
  const [chars, setChars] = useState(0);
  const [status, setStatus] = useState<Status[]>(FIGS.map(() => "pending"));
  const [fixed, setFixed] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (!inView) return;
    let cancelled = false;
    const go = async () => {
      if (reduce) {
        setChars(TOTAL_CHARS);
        setFixed(true);
        setStatus(FIGS.map(() => "ok"));
        setStage("passed");
        return;
      }
      setStage("typing");
      setFixed(false);
      setActive(null);
      setStatus(FIGS.map(() => "pending"));
      for (let c = 0; c <= TOTAL_CHARS; c += 2) {
        if (cancelled) return;
        setChars(c);
        await sleep(22);
      }
      setChars(TOTAL_CHARS);
      await sleep(500);
      setStage("checking");
      for (let i = 0; i < FIGS.length; i++) {
        if (cancelled) return;
        setActive(FIGS[i].src);
        setStatus((s) => s.map((v, j) => (j === i ? "checking" : v)));
        await sleep(650);
        setStatus((s) => s.map((v, j) => (j === i ? (FIGS[i].fix ? "bad" : "ok") : v)));
        await sleep(250);
      }
      setActive(null);
      if (cancelled) return;
      setStage("withheld");
      await sleep(2200);
      if (cancelled) return;
      setStage("fixing");
      const bad = FIGS.findIndex((f) => f.fix);
      setFixed(true);
      setActive(FIGS[bad].src);
      setStatus((s) => s.map((v, j) => (j === bad ? "checking" : v)));
      await sleep(900);
      setStatus((s) => s.map((v, j) => (j === bad ? "ok" : v)));
      await sleep(300);
      setActive(null);
      setStage("passed");
    };
    go();
    return () => {
      cancelled = true;
    };
  }, [inView, run, reduce]);

  return (
    <section id="number-check" className="bg-navy py-24 text-on-navy sm:py-32">
      <div className="mx-auto grid max-w-6xl gap-14 px-5 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <div className="lg:pt-6">
          <h2 className="font-serif text-4xl leading-[1.08] tracking-[-0.01em] sm:text-5xl">
            The AI never makes up a number.
          </h2>
          <p className="mt-6 max-w-[30rem] text-lg leading-relaxed text-on-navy-muted">
            Language models are good at explaining and bad at arithmetic. So Galton AI isn&apos;t allowed to do
            arithmetic. It asks the engine, and code checks its reply before you see it.
          </p>
          <ul className="mt-8 max-w-[30rem] space-y-4 text-on-navy-muted">
            <li className="border-l-2 border-gold-bright/70 pl-4">
              Every figure in a reply must match a value the engine returned, at the precision the reply uses.
            </li>
            <li className="border-l-2 border-gold-bright/70 pl-4">
              If one doesn&apos;t, the AI gets one chance to correct it. If it still fails, the reply is withheld and
              the unmatched figures are listed.
            </li>
            <li className="border-l-2 border-gold-bright/70 pl-4">
              Nothing reaches you, or your client, on trust.
            </li>
          </ul>
        </div>

        <Spotlight tone="navy" className="rounded-2xl border border-navy-line bg-navy-raised p-4 sm:p-6">
          <div ref={ref}>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-on-navy-muted">Galton AI, Whitfield household</p>
            <button
              type="button"
              onClick={() => setRun((r) => r + 1)}
              disabled={stage !== "passed" || !!reduce}
              className="rounded-full border border-navy-line px-3 py-1 text-sm text-on-navy-muted transition-colors enabled:hover:border-on-navy-muted enabled:hover:text-on-navy disabled:opacity-40"
            >
              Replay
            </button>
          </div>

          <div className="mt-5 flex justify-end">
            <p className="max-w-[85%] rounded-2xl rounded-br-md bg-[#17233a] px-4 py-2.5 text-[15px]">
              How concentrated is this portfolio?
            </p>
          </div>

          <div className="mt-4 min-h-[9.5rem] rounded-2xl rounded-bl-md border border-navy-line px-4 py-3.5 text-[15px] leading-[1.9] sm:text-base">
            {LAYOUT.map(({ seg, start, fig }, i) => {
              const left = chars - start;
              if (left <= 0) return null;
              if (typeof seg === "string") return <span key={i}>{seg.slice(0, left)}</span>;
              const st = status[fig];
              const text = seg.fix && fixed ? seg.fix : seg.fig;
              const shown = text.slice(0, left);
              return (
                <span key={i} className="relative inline-block">
                  <motion.span
                    className={`tabular rounded px-1 py-0.5 font-medium transition-colors duration-300 ${
                      st === "ok"
                        ? "bg-good-on-navy/15 text-good-on-navy"
                        : st === "bad"
                          ? "bg-bad-on-navy/15 text-bad-on-navy line-through decoration-2"
                          : st === "checking"
                            ? "bg-gold-bright/20 text-gold-bright ring-1 ring-gold-bright"
                            : "text-on-navy underline decoration-on-navy-muted/50 decoration-dotted underline-offset-4"
                    }`}
                    key={text}
                    initial={seg.fix && fixed ? { opacity: 0, y: 6 } : false}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {shown}
                  </motion.span>
                </span>
              );
            })}
            {stage === "typing" && (
              <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 animate-pulse bg-gold-bright" />
            )}
          </div>

          <div className="mt-3 min-h-[3.25rem]" aria-live="polite">
            <AnimatePresence mode="wait">
              {stage === "withheld" && (
                <motion.p
                  key="withheld"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="rounded-xl border border-bad-on-navy/40 bg-bad-on-navy/10 px-4 py-2.5 text-sm text-bad-on-navy"
                >
                  Reply withheld. 35% isn&apos;t in the engine output. Asking Galton AI to correct it.
                </motion.p>
              )}
              {stage === "passed" && (
                <motion.p
                  key="passed"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="rounded-xl border border-good-on-navy/40 bg-good-on-navy/10 px-4 py-2.5 text-sm text-good-on-navy"
                >
                  All 5 figures match the engine output. Reply shown and logged.
                </motion.p>
              )}
              {(stage === "checking" || stage === "fixing") && (
                <motion.p
                  key="checking"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-1 py-2.5 text-sm text-on-navy-muted"
                >
                  Checking each figure against the engine output…
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-4 rounded-xl bg-navy p-4">
            <p className="text-sm text-on-navy-muted">Engine output</p>
            <dl className="mt-3 divide-y divide-navy-line">
              {ENGINE.map((row) => (
                <div
                  key={row.key}
                  className={`flex items-center justify-between gap-4 py-2 text-sm transition-colors duration-300 ${
                    active === row.key ? "text-gold-bright" : "text-on-navy-muted"
                  }`}
                >
                  <dt>{row.label}</dt>
                  <dd className="tabular">{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          </div>
        </Spotlight>
      </div>
    </section>
  );
}
