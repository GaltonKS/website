"use client";

// The human moment behind the numbers: a full-bleed photo of an advisor with a
// household, with Galton's findings floating over it the way they'd sit beside the
// conversation. The photo eases in scale as it scrolls through; the cards rise in
// one after another and then drift slightly, so the scene feels live.

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef, type ReactNode } from "react";
import couple from "@/assets/photos/meeting-couple.jpg";

export default function Story() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [1.12, 1]);
  const photoY = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["-4%", "4%"]);

  return (
    <section
      ref={ref}
      aria-labelledby="story-title"
      className="relative isolate flex min-h-[44rem] items-end overflow-hidden bg-navy text-on-navy md:min-h-[52rem]"
    >
      <motion.div className="absolute inset-0 -z-20" style={{ scale, y: photoY }}>
        <Image
          src={couple}
          alt="An advisor walks a retired couple through a printed portfolio review on an office sofa."
          fill
          placeholder="blur"
          sizes="100vw"
          quality={80}
          className="object-cover object-[60%_30%]"
        />
      </motion.div>
      {/* navy wash: heavy at the bottom and left for the text, light over the faces */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(to top, rgba(0,8,21,0.96) 0%, rgba(0,8,21,0.7) 32%, rgba(0,8,21,0.15) 62%, rgba(0,8,21,0.35) 100%), linear-gradient(to right, rgba(0,8,21,0.55), transparent 55%)",
        }}
      />

      {/* phones: the text sits over the brightest part of the photo, so dim it all a bit more */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-navy/50 md:hidden" />

      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 pb-16 pt-40 sm:px-8 md:grid-cols-[1.1fr_1fr] md:items-end md:pb-24">
        <div>
          <Reveal>
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-gold-bright">Why it matters</p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2
              id="story-title"
              className="mt-4 max-w-[34rem] font-serif text-4xl leading-[1.05] tracking-[-0.01em] sm:text-6xl"
            >
              Behind every portfolio is a household.
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-6 max-w-[30rem] text-lg leading-relaxed text-on-navy-muted">
              Thirty years of saving. A retirement that has to last. Galton AI gives you numbers you can trust and
              the words to explain them, so you can spend the meeting on the people in front of you.
            </p>
          </Reveal>
        </div>

        <div className="relative flex flex-col items-start gap-3 md:items-end">
          <Float delay={0.3} drift={6}>
            <Glass className="w-[19rem]">
              <p className="flex items-center justify-between text-xs text-on-navy-muted">
                <span className="flex items-center gap-1.5">
                  <Dot /> Galton AI
                </span>
                <span>Whitfield household</span>
              </p>
              <p className="mt-3 text-sm text-on-navy-muted">22 holdings, moving like</p>
              <p className="mt-1 font-serif text-5xl leading-none">
                <span className="tabular">4.3</span>
                <span className="ml-2 font-sans text-base text-on-navy-muted">independent bets</span>
              </p>
              <p className="mt-4 border-t border-white/10 pt-3 text-sm">
                <span className="text-on-navy-muted">Share of risk from the market</span>{" "}
                <span className="tabular float-right">68.4%</span>
              </p>
            </Glass>
          </Float>
          <Float delay={0.55} drift={-5}>
            <Glass className="w-[19rem] md:mr-14">
              <p className="text-xs text-on-navy-muted">Household profile</p>
              <p className="mt-1.5 text-[15px] font-medium text-bad-on-navy">
                The plan needs more risk than the household can take
              </p>
              <p className="mt-1 text-sm text-on-navy-muted">Ceiling set by ability.</p>
            </Glass>
          </Float>
          <Float delay={0.8} drift={4}>
            <Glass className="flex items-center gap-2.5 !py-2.5 text-sm">
              <Check />
              All 5 figures match the engine output
            </Glass>
          </Float>
        </div>
      </div>
    </section>
  );
}

function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

// Rises into place once, then bobs very gently, like a notification resting on the scene.
function Float({ children, delay, drift }: { children: ReactNode; delay: number; drift: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 30, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        animate={reduce ? undefined : { y: [0, drift, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: delay + 1 }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

function Glass({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-white/12 bg-navy/55 px-5 py-4 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.7)] backdrop-blur-xl ${className}`}
    >
      {children}
    </div>
  );
}

function Dot() {
  return (
    <span className="relative flex h-2 w-2">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold-bright opacity-60 motion-reduce:hidden" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-gold-bright" />
    </span>
  );
}

function Check() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" className="shrink-0 text-good-on-navy">
      <circle cx="9" cy="9" r="8" fill="currentColor" opacity="0.18" />
      <path d="M5.5 9.2l2.3 2.3 4.7-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
