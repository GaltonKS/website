"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import reportPhoto from "@/assets/photos/report-detail.jpg";

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
        <div className="grid items-end gap-10 md:grid-cols-[1.2fr_1fr]">
          <h2 className="max-w-[40rem] font-serif text-4xl leading-[1.08] tracking-[-0.01em] text-navy sm:text-5xl">
            From a holdings file to an answer you can stand behind.
          </h2>
          <motion.div
            className="relative"
            initial={reduce ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative aspect-[16/10] overflow-hidden rounded-3xl">
              <Image
                src={reportPhoto}
                alt="An advisor points to a figure on a printed portfolio report, pen in hand."
                fill
                placeholder="blur"
                sizes="(min-width: 768px) 470px, 100vw"
                className="object-cover object-[50%_62%]"
              />
            </div>
            <motion.p
              className="absolute -bottom-4 right-4 flex items-center gap-2 rounded-full border border-rule bg-card px-4 py-2 text-sm text-ink shadow-[0_16px_40px_-18px_rgba(31,27,22,0.5)]"
              initial={reduce ? false : { opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.8 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <span className="h-2 w-2 rounded-full bg-good" />
              Every figure traced to the engine
            </motion.p>
          </motion.div>
        </div>

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
