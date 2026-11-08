"use client";

// A live Galton board: balls bounce left or right at each peg and pile up into a
// binomial distribution. The dashed curve is the expected shape for the balls landed
// so far, so the piles visibly settle onto it. Drawn on canvas, paused off-screen,
// and replaced by a still, finished board when the viewer prefers reduced motion.
// Clicking or tapping the board drops a handful of extra balls, so the visitor can
// run the experiment themselves.

import { useEffect, useRef } from "react";

const ROWS = 12;
const ROW_MS = 95; // time for a ball to fall from one peg row to the next
const SPAWN_MS = 70;

type Ball = { path: number[]; t0: number; bin: number; landed: boolean };

function binomial(n: number, k: number) {
  let r = 1;
  for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i;
  return r;
}
const EXPECTED = Array.from({ length: ROWS + 1 }, (_, k) => binomial(ROWS, k) / 2 ** ROWS);

export default function GaltonBoard({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let W = 0, H = 0, s = 0, cx = 0, y0 = 0, rowH = 0, br = 0, floorY = 0, binTop = 0, maxStack = 0;
    let balls: Ball[] = [];
    let counts = new Array(ROWS + 1).fill(0);
    let lastSpawn = 0;
    let phase: "fill" | "hold" | "fade" = "fill";
    let phaseAt = 0;
    let visible = true;
    let raf = 0;

    function layout() {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = rect.width;
      H = rect.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      s = Math.min((W * 0.96) / (ROWS + 1), (H * 0.6) / (ROWS * 0.87));
      rowH = s * 0.87;
      cx = W / 2;
      y0 = H * 0.04;
      br = s * 0.18;
      binTop = y0 + (ROWS - 1) * rowH + s * 0.55;
      floorY = H - 6;
      maxStack = Math.max(4, Math.floor((floorY - binTop - br) / (br * 1.85)));
    }

    const pegX = (r: number, c: number) => cx + (c - r / 2) * s;
    const pegY = (r: number) => y0 + r * rowH;
    const binX = (k: number) => cx + (k - ROWS / 2) * s;
    const stackY = (i: number) => floorY - br - i * br * 1.85;

    function spawn(now: number) {
      const path = [0];
      for (let r = 1; r < ROWS; r++) path.push(path[r - 1] + (Math.random() < 0.5 ? 0 : 1));
      const bin = path[ROWS - 1] + (Math.random() < 0.5 ? 0 : 1);
      balls.push({ path, t0: now, bin, landed: false });
    }

    // Position of a ball in flight: an arc from peg to peg, then a drop into its bin.
    function ballPos(b: Ball, now: number): [number, number] | null {
      const t = Math.max(0, (now - b.t0) / ROW_MS);
      const r = Math.floor(t);
      const f = t - r;
      const lift = s * 0.42;
      if (r < ROWS - 1) {
        const xa = pegX(r, b.path[r]), xb = pegX(r + 1, b.path[r + 1]);
        const ya = pegY(r) - lift, yb = pegY(r + 1) - lift;
        return [xa + (xb - xa) * f, ya + (yb - ya) * f * f - Math.sin(Math.PI * f) * s * 0.28];
      }
      // after the last row: fall to the top of the pile
      const xa = pegX(ROWS - 1, b.path[ROWS - 1]), xb = binX(b.bin);
      const ya = pegY(ROWS - 1) - lift;
      const target = stackY(counts[b.bin]);
      const fallT = (t - (ROWS - 1)) / 2.2;
      if (fallT >= 1) return null;
      const g = Math.min(1, fallT * 2.2);
      return [xa + (xb - xa) * g, ya + (target - ya) * fallT * fallT];
    }

    function drawStatic(landedAlpha: number) {
      ctx.clearRect(0, 0, W, H);
      // pegs: navy-to-gold left to right, like the top plate of the logo
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c <= r; c++) {
          const x = pegX(r, c);
          const u = (x - (cx - (ROWS / 2) * s)) / (ROWS * s);
          ctx.fillStyle = `rgba(227,173,51,${0.28 + 0.6 * u})`;
          ctx.beginPath();
          ctx.arc(x, pegY(r), Math.max(1.4, s * 0.075), 0, Math.PI * 2);
          ctx.fill();
        }
      }
      // bin dividers and floor
      ctx.strokeStyle = "rgba(185,191,202,0.16)";
      ctx.lineWidth = 1;
      for (let k = 0; k <= ROWS + 1; k++) {
        const x = binX(k) - s / 2;
        ctx.beginPath();
        ctx.moveTo(x, binTop + s * 0.4);
        ctx.lineTo(x, floorY);
        ctx.stroke();
      }
      ctx.strokeStyle = "rgba(227,173,51,0.5)";
      ctx.beginPath();
      ctx.moveTo(binX(0) - s / 2, floorY + 1);
      ctx.lineTo(binX(ROWS) + s / 2, floorY + 1);
      ctx.stroke();

      // landed balls
      ctx.fillStyle = `rgba(214,165,52,${0.9 * landedAlpha})`;
      for (let k = 0; k <= ROWS; k++) {
        for (let i = 0; i < counts[k]; i++) {
          ctx.beginPath();
          ctx.arc(binX(k), stackY(i), br, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // expected shape for the balls landed so far
      const total = counts.reduce((a, b) => a + b, 0);
      if (total > 12) {
        ctx.save();
        ctx.setLineDash([4, 5]);
        ctx.strokeStyle = `rgba(253,250,243,${0.55 * landedAlpha})`;
        ctx.lineWidth = 1.25;
        ctx.beginPath();
        const steps = 120;
        for (let i = 0; i <= steps; i++) {
          const k = (i / steps) * ROWS;
          const mu = ROWS / 2, sd = Math.sqrt(ROWS) / 2;
          const dens = Math.exp(-((k - mu) ** 2) / (2 * sd * sd)) / (sd * Math.sqrt(2 * Math.PI));
          const x = binX(k);
          const y = stackY(total * dens) + br;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.restore();
      }
    }

    function frame(now: number) {
      raf = requestAnimationFrame(frame);
      if (!visible) return;

      if (phase === "fill" && now - lastSpawn > SPAWN_MS) {
        spawn(now);
        lastSpawn = now;
      }

      if (phase === "fill" && Math.max(...counts) >= maxStack) {
        phase = "hold";
        phaseAt = now;
      }
      if (phase === "hold" && balls.length === 0 && now - phaseAt > 2200) {
        phase = "fade";
        phaseAt = now;
      }
      let alpha = 1;
      if (phase === "fade") {
        alpha = Math.max(0, 1 - (now - phaseAt) / 900);
        if (alpha === 0) {
          counts = counts.map(() => 0);
          phase = "fill";
        }
      }

      drawStatic(alpha);

      ctx.save();
      ctx.fillStyle = "#f6c95a";
      ctx.shadowColor = "rgba(246,201,90,0.85)";
      ctx.shadowBlur = br * 3;
      const next: Ball[] = [];
      for (const b of balls) {
        if (now < b.t0) {
          next.push(b);
          continue;
        }
        const p = ballPos(b, now);
        if (!p) {
          counts[b.bin] = Math.min(counts[b.bin] + 1, maxStack);
          continue;
        }
        ctx.beginPath();
        ctx.arc(p[0], p[1], br, 0, Math.PI * 2);
        ctx.fill();
        next.push(b);
      }
      ctx.restore();
      balls = next;
    }

    function drawReduced() {
      const total = Math.floor(maxStack / EXPECTED[ROWS / 2]);
      counts = EXPECTED.map((p) => Math.round(p * total));
      drawStatic(1);
    }

    layout();
    const ro = new ResizeObserver(() => {
      layout();
      if (reduce) drawReduced();
    });
    ro.observe(canvas);

    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(canvas);

    // a visitor's handful: a quick burst of balls from the top peg
    function onDrop() {
      if (phase === "fade") return;
      const now = performance.now();
      for (let i = 0; i < 14; i++) spawn(now + i * 28);
    }

    if (reduce) drawReduced();
    else {
      raf = requestAnimationFrame(frame);
      canvas.addEventListener("pointerdown", onDrop);
    }

    return () => {
      canvas.removeEventListener("pointerdown", onDrop);
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`${className} cursor-pointer touch-manipulation motion-reduce:cursor-default`}
      role="img"
      aria-label="A Galton board: gold balls bounce through rows of pegs and pile up into a bell-shaped distribution of outcomes."
    />
  );
}
