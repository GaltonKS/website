"use client";

// The same three findings in two voices: the measures an advisor reads, and the
// plain-language draft Galton AI writes for the client. Flips to the client's
// version once on scroll; the toggle lets the visitor flip back and forth.
// Every figure in the client text is one the engine returned (see NumberCheck).

import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Spotlight from "./Spotlight";

type View = "advisor" | "client";

const CARDS = [
  {
    label: "Independent bets",
    value: "4.3",
    detail: "22 holdings, four correlated clusters",
    client: (
      <>
        You own <Fig>22</Fig> investments, but they mostly move in about <Fig>4.3</Fig> groups. When one group has a bad
        year, a large part of your savings feels it at the same time.
      </>
    ),
  },
  {
    label: "Share of risk from the market",
    value: "68.4%",
    detail: "Beta-driven; idiosyncratic risk is the minority",
    client: (
      <>
        About <Fig>68.4%</Fig> of your portfolio&apos;s ups and downs come from the stock market as a whole, not
        from the particular companies you picked.
      </>
    ),
  },
  {
    label: "2008-style stress loss",
    value: "−34.1%",
    detail: "Preset scenario, dividend-adjusted returns",
    client: (
      <>
        If markets fell the way they did in 2008, this portfolio could lose about <Fig>34.1%</Fig> at the worst
        point. Let&apos;s decide together whether that&apos;s a fall you could live with.
      </>
    ),
  },
];

function Fig({ children }: { children: React.ReactNode }) {
  return (
    <span className="tabular whitespace-nowrap rounded bg-good/10 px-1 font-medium text-good">{children}</span>
  );
}

export default function ClientView() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const reduce = useReducedMotion();
  const [view, setView] = useState<View>("advisor");
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!inView || touched) return;
    const t = setTimeout(() => setView("client"), reduce ? 0 : 1800);
    return () => clearTimeout(t);
  }, [inView, touched, reduce]);

  const pick = (v: View) => {
    setTouched(true);
    setView(v);
  };

  return (
    <section id="client-view" className="on-paper bg-card py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid items-end gap-8 md:grid-cols-[1.3fr_1fr]">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-gold-dark">In the meeting</p>
            <h2 className="mt-4 max-w-[36rem] font-serif text-4xl leading-[1.08] tracking-[-0.01em] text-navy sm:text-5xl">
              Your client won&apos;t ask for a correlation matrix. They&apos;ll ask, &ldquo;Are we okay?&rdquo;
            </h2>
          </div>
          <p className="max-w-[28rem] text-lg leading-relaxed text-muted">
            Galton AI turns the measures you rely on into words a client can follow, with the same checked figures,
            so the conversation is about their life rather than the math.
          </p>
        </div>

        <div ref={ref} className="mt-14">
          <div
            role="group"
            aria-label="Show the findings for"
            className="relative inline-flex rounded-full border border-rule bg-paper p-1 text-sm"
          >
            {(["advisor", "client"] as const).map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={view === v}
                onClick={() => pick(v)}
                className={`relative z-10 rounded-full px-4 py-2 font-medium transition-colors duration-300 ${
                  view === v ? "text-on-navy" : "text-muted hover:text-ink"
                }`}
              >
                {view === v && (
                  <motion.span
                    layoutId="client-view-pill"
                    className="absolute inset-0 -z-10 rounded-full bg-navy"
                    transition={{ type: "spring", stiffness: 400, damping: 34 }}
                  />
                )}
                {v === "advisor" ? "What you see" : "What the Whitfields read"}
              </button>
            ))}
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {CARDS.map((c, i) => (
              <Spotlight
                key={c.label}
                className="min-h-[15.5rem] overflow-hidden rounded-2xl border border-rule bg-paper p-6"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {view === "advisor" ? (
                    <motion.div
                      key="advisor"
                      initial={reduce ? false : { opacity: 0, y: 12, filter: "blur(4px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={reduce ? undefined : { opacity: 0, y: -12, filter: "blur(4px)" }}
                      transition={{ duration: 0.4, delay: reduce ? 0 : i * 0.08 }}
                    >
                      <p className="text-sm text-muted">{c.label}</p>
                      <p className="tabular mt-3 font-serif text-6xl text-navy">{c.value}</p>
                      <p className="mt-4 border-t border-rule pt-3 text-sm text-muted">{c.detail}</p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="client"
                      initial={reduce ? false : { opacity: 0, y: 12, filter: "blur(4px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={reduce ? undefined : { opacity: 0, y: -12, filter: "blur(4px)" }}
                      transition={{ duration: 0.45, delay: reduce ? 0 : i * 0.12 }}
                    >
                      <p className="flex items-center gap-2 text-sm text-muted">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold-soft font-serif text-xs text-gold-dark">
                          W
                        </span>
                        For the Whitfields
                      </p>
                      <p className="mt-4 font-serif text-[1.3rem] leading-snug text-ink">{c.client}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Spotlight>
            ))}
          </div>

          <div className="mt-6 min-h-[3rem]">
            <AnimatePresence>
              {view === "client" && (
                <motion.div
                  initial={reduce ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, delay: reduce ? 0 : 0.5 }}
                  className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <p className="flex items-center gap-2 text-[15px] text-muted">
                    <Check />
                    Every figure matches the engine output. This draft waits for your approval.
                  </p>
                  <p className="text-sm text-muted">Edit a word, and the figures are checked again.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

function Check() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" className="shrink-0 text-good">
      <circle cx="9" cy="9" r="8" fill="currentColor" opacity="0.12" />
      <path d="M5.5 9.2l2.3 2.3 4.7-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
