"use client";

// A replay of Galton's number check: the reply is drafted, every figure is matched
// against the engine's output, a figure that doesn't match gets the reply withheld,
// and the corrected reply passes. Plays once when scrolled into view; Replay reruns it.

import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

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
            Galton never makes up a number.
          </h2>
          <p className="mt-6 max-w-[30rem] text-lg leading-relaxed text-on-navy-muted">
            Galton writes its explanations with an AI language model, but the model isn&apos;t allowed to do the
            math. It asks the engine, and code checks every figure in the reply before you see it.
          </p>
          <ul className="mt-8 max-w-[30rem] space-y-4 text-on-navy-muted">
            <li className="border-l-2 border-on-navy/60 pl-4">
              Every figure in a reply must match a value the engine returned, at the precision the reply uses.
            </li>
            <li className="border-l-2 border-on-navy/60 pl-4">
              If one doesn&apos;t, Galton gets one chance to correct it. If it still fails, the reply is withheld and
              the unmatched figures are listed.
            </li>
            <li className="border-l-2 border-on-navy/60 pl-4">Nothing reaches you, or your client, on trust.</li>
          </ul>
        </div>

        <div ref={ref} className="on-paper rounded-2xl bg-paper p-4 text-ink sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted">Galton, Whitfield household</p>
            <button
              type="button"
              onClick={() => setRun((r) => r + 1)}
              disabled={stage !== "passed" || !!reduce}
              className="rounded-full border border-ink/20 px-3 py-1 text-sm text-muted transition-colors enabled:hover:border-ink enabled:hover:text-ink disabled:opacity-40"
            >
              Replay
            </button>
          </div>

          <div className="mt-5 flex justify-end">
            <p className="max-w-[85%] rounded-2xl rounded-br-md bg-navy px-4 py-2.5 text-[15px] text-on-navy">
              How concentrated is this portfolio?
            </p>
          </div>

          <div className="mt-4 min-h-[9.5rem] rounded-2xl rounded-bl-md border border-rule bg-card px-4 py-3.5 text-[15px] leading-[1.9] sm:text-base">
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
                        ? "bg-good/10 text-good"
                        : st === "bad"
                          ? "bg-bad/10 text-bad line-through decoration-2"
                          : st === "checking"
                            ? "bg-navy text-on-navy"
                            : "text-ink underline decoration-ink/40 decoration-dotted underline-offset-4"
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
              <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 animate-pulse bg-navy" />
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
                  className="rounded-xl border border-bad/30 bg-bad/[0.06] px-4 py-2.5 text-sm text-bad"
                >
                  Reply withheld. 35% isn&apos;t in the engine output. Asking Galton to correct it.
                </motion.p>
              )}
              {stage === "passed" && (
                <motion.p
                  key="passed"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="rounded-xl border border-good/30 bg-good/[0.06] px-4 py-2.5 text-sm text-good"
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
                  className="px-1 py-2.5 text-sm text-muted"
                >
                  Checking each figure against the engine output…
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-4 rounded-xl bg-navy p-4 text-on-navy">
            <p className="text-sm text-on-navy-muted">Engine output</p>
            <dl className="mt-3 divide-y divide-navy-line">
              {ENGINE.map((row) => (
                <div
                  key={row.key}
                  className={`-mx-2 flex items-center justify-between gap-4 rounded px-2 py-2 text-sm transition-colors duration-300 ${
                    active === row.key ? "bg-on-navy text-navy" : "text-on-navy-muted"
                  }`}
                >
                  <dt>{row.label}</dt>
                  <dd className="tabular">{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
