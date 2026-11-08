"use client";

import { motion, useReducedMotion } from "framer-motion";
import GaltonBoard from "./GaltonBoard";

const LINES = ["Every figure computed.", "Every answer checked."];

export default function Hero() {
  const reduce = useReducedMotion();
  const ease = [0.22, 1, 0.36, 1] as const;

  return (
    <section id="top" className="relative overflow-hidden bg-navy text-on-navy">
      {/* faint glow behind the board, the warm corner of the logo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 top-10 h-[640px] w-[640px] rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(227,173,51,0.28), transparent 65%)" }}
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 pb-16 pt-28 sm:px-8 md:min-h-[92vh] md:grid-cols-[1.05fr_1fr] md:gap-6 md:pb-20 md:pt-24">
        <div>
          <h1 className="font-serif text-[2.75rem] leading-[1.02] tracking-[-0.015em] sm:text-6xl lg:text-[4.6rem]">
            {LINES.map((line, i) => (
              <span key={line} className="block overflow-hidden pb-[0.08em]">
                <motion.span
                  className="block"
                  initial={reduce ? false : { y: "105%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.9, delay: 0.15 + i * 0.22, ease }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.div
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.75 }}
          >
            <p className="mt-7 max-w-[34rem] text-lg leading-relaxed text-on-navy-muted">
              Galton AI shows advisors how concentrated a client&apos;s portfolio really is, builds a household
              risk profile, and explains both in plain language. The engine produces every number. The AI only
              explains them, and every figure it quotes is checked before you see it.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <a
                href="#contact"
                className="rounded-full bg-gold-bright px-6 py-3 font-medium text-navy transition-colors hover:bg-[#f0c04f]"
              >
                Book a meeting
              </a>
              <a
                href="#how-it-works"
                className="rounded-full border border-on-navy-muted/40 px-6 py-3 text-on-navy transition-colors hover:border-on-navy"
              >
                See how it works
              </a>
            </div>
          </motion.div>
        </div>

        <div className="relative">
          <GaltonBoard className="block h-[320px] w-full sm:h-[440px] md:h-[580px]" />
          <p className="mt-3 text-center text-sm text-on-navy-muted/80">
            Twelve rows of pegs, one bell curve of outcomes.
          </p>
        </div>
      </div>
    </section>
  );
}
