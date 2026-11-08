"use client";

import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";
import GaltonBoard from "./GaltonBoard";

const LINES = ["Every figure computed.", "Every answer checked."];

export default function Hero() {
  const reduce = useReducedMotion();
  const ease = [0.22, 1, 0.36, 1] as const;

  // The warm glow drifts toward the cursor, and the hero eases back as you scroll on.
  const ref = useRef<HTMLElement>(null);
  const gx = useMotionValue(0);
  const gy = useMotionValue(0);
  const glowX = useSpring(gx, { stiffness: 40, damping: 18 });
  const glowY = useSpring(gy, { stiffness: 40, damping: 18 });
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const copyY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -60]);
  const boardY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 50]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, reduce ? 1 : 0.2]);

  function onMove(e: React.PointerEvent) {
    if (reduce || e.pointerType !== "mouse") return;
    const r = ref.current!.getBoundingClientRect();
    gx.set((e.clientX - r.left - r.width * 0.72) * 0.35);
    gy.set((e.clientY - r.top - r.height * 0.4) * 0.35);
  }

  return (
    <section
      id="top"
      ref={ref}
      onPointerMove={onMove}
      className="relative overflow-hidden bg-navy text-on-navy"
    >
      {/* faint glow behind the board, the warm corner of the logo */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 top-10 h-[640px] w-[640px] rounded-full opacity-40 blur-3xl"
        style={{
          x: glowX,
          y: glowY,
          background: "radial-gradient(circle, rgba(227,173,51,0.28), transparent 65%)",
        }}
      />
      {/* a fine grid, like graph paper under the experiment */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(185,191,202,1) 1px, transparent 1px), linear-gradient(90deg, rgba(185,191,202,1) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse 70% 60% at 65% 45%, #000 20%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 65% 45%, #000 20%, transparent 75%)",
        }}
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 pb-16 pt-28 sm:px-8 md:min-h-[92vh] md:grid-cols-[1.05fr_1fr] md:gap-6 md:pb-20 md:pt-24">
        <motion.div style={{ y: copyY, opacity: fade }}>
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
        </motion.div>

        <motion.div className="relative" style={{ y: boardY }}>
          <GaltonBoard className="block h-[320px] w-full sm:h-[440px] md:h-[580px]" />
          <p className="mt-3 text-center text-sm text-on-navy-muted/80">
            Twelve rows of pegs, one bell curve of outcomes.
            <span className="motion-reduce:hidden"> Tap the board to drop your own.</span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
