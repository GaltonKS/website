"use client";

// A "live" product shot, after Meuze: a real screen of the app set into a navy frame, with one
// card from that same screen pulled forward at a larger size. Images are screenshots of the
// running product (see public/live/). The card drifts a little faster than the screen as the
// page scrolls; with reduced motion both stay still.

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

type Props = {
  app: string; // file name stem in public/live, e.g. "overview"
  alt: string;
  cardAlt: string;
  /** card width as a share of the frame, and its offsets */
  cardWidth?: string;
  cardTop?: string;
  cardRight?: string;
  className?: string;
};

export default function LiveShot({
  app,
  alt,
  cardAlt,
  cardWidth = "58%",
  cardTop = "22%",
  cardRight = "5%",
  className = "",
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const appY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [18, -18]);
  const cardY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [56, -40]);

  return (
    <div ref={ref} className={`relative aspect-[5/4] overflow-hidden rounded-2xl bg-navy ${className}`}>
      <motion.img
        src={`./live/${app}-app.webp`}
        alt={alt}
        loading="lazy"
        style={{ y: appY }}
        className="absolute left-[9%] top-[11%] w-[128%] max-w-none rounded-tl-xl ring-1 ring-on-navy/25"
      />
      <motion.img
        src={`./live/${app}-card.webp`}
        alt={cardAlt}
        loading="lazy"
        style={{ y: cardY, width: cardWidth, top: cardTop, right: cardRight }}
        initial={reduce ? false : { scale: 0.96 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="absolute h-auto rounded-xl shadow-[0_28px_70px_-18px_rgba(0,0,0,0.6)]"
      />
    </div>
  );
}
