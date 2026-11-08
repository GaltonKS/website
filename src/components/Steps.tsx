"use client";

import { motion, useReducedMotion } from "framer-motion";

const STEPS = [
  {
    title: "Upload holdings",
    body: "Drop in a CSV from your custodian. Galton reads common export layouts and flags anything ambiguous instead of guessing.",
  },
  {
    title: "The engine computes",
    body: "Risk math runs on up to ten years of monthly, dividend-adjusted returns. Every figure on screen comes from here.",
  },
  {
    title: "Galton AI explains",
    body: "Ask in plain English. The AI calls the engine and explains the result in words you can share with a client.",
  },
  {
    title: "Every number is checked",
    body: "Each figure in the reply is matched against engine output. A reply that doesn't match is withheld.",
  },
  {
    title: "Logged for review",
    body: "Each question, engine run and reply goes into an audit trail your compliance team can read.",
  },
];

export default function Steps() {
  const reduce = useReducedMotion();
  return (
    <section id="how-it-works" className="on-paper border-y border-rule bg-card py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <h2 className="max-w-[40rem] font-serif text-4xl leading-[1.08] tracking-[-0.01em] text-navy sm:text-5xl">
          From a holdings file to an answer you can stand behind.
        </h2>

        <ol className="relative mt-16 grid gap-10 md:grid-cols-5 md:gap-6">
          {/* the line that joins the steps, drawn once as the list comes into view */}
          <motion.span
            aria-hidden="true"
            className="absolute left-[15px] top-4 hidden h-px origin-left bg-gold md:block"
            style={{ right: "calc(20% - 15px)" }}
            initial={reduce ? false : { scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 1.4, ease: [0.65, 0, 0.35, 1] }}
          />
          <span aria-hidden="true" className="absolute bottom-2 left-[15px] top-8 w-px bg-rule md:hidden" />
          {STEPS.map((s, i) => (
            <li key={s.title} className="relative pl-12 md:pl-0">
              <span className="tabular absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full border border-gold bg-card text-sm font-medium text-gold-dark md:relative">
                {i + 1}
              </span>
              <h3 className="mt-0.5 font-medium text-navy md:mt-5">{s.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
