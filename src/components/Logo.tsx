// GaltonKS logo, ported from advisor-engine/web/src/components/Logo.tsx so the site
// and the product share one mark. Three plates: navy grid, pale grid, and the dotted
// plate that runs from navy on the left to gold on the right.

import { useId } from "react";

const NAVY = "#000815";
const PLATE = "M2 14 L28 2 L54 14 L28 26 Z";

export function LogoMark({ width = 44, onDark = false }: { width?: number; onDark?: boolean }) {
  const id = useId().replace(/:/g, "");
  const dots: [number, number][] = [];
  for (let i = 1; i <= 4; i++) for (let j = 1; j <= 4; j++) dots.push([i / 5, j / 5]);
  const at = (u: number, v: number): [number, number] => [2 + 26 * u + 26 * v, 14 - 12 * u + 12 * v];
  return (
    <svg viewBox="0 0 56 44" width={width} height={(width * 44) / 56} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}top`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={NAVY} />
          <stop offset="0.55" stopColor="#3a3424" />
          <stop offset="1" stopColor="#d9a62e" />
        </linearGradient>
        <linearGradient id={`${id}mid`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#8f8a80" />
          <stop offset="1" stopColor="#efe2c4" />
        </linearGradient>
      </defs>
      <g transform="translate(0 16)">
        <path d={PLATE} fill={onDark ? "#1b2638" : NAVY} stroke={onDark ? "#6d7686" : "none"} strokeWidth="0.5" />
        <path d="M15 8 L41 20 M15 20 L41 8" stroke={onDark ? "#4a5466" : "#3b4658"} strokeWidth="0.6" />
      </g>
      <g transform="translate(0 8)">
        <path d={PLATE} fill={`url(#${id}mid)`} stroke="#fdfaf3" strokeWidth="0.5" />
        <path d="M15 8 L41 20 M15 20 L41 8" stroke="#fdfaf3" strokeWidth="0.5" opacity="0.8" />
      </g>
      <path d={PLATE} fill={`url(#${id}top)`} stroke="#e8b83a" strokeWidth="0.6" />
      {dots.map(([u, v]) => {
        const [x, y] = at(u, v);
        return <circle key={`${u}-${v}`} cx={x} cy={y} r="1.05" fill="#f2c14e" opacity={0.45 + 0.55 * u} />;
      })}
    </svg>
  );
}

export function Logo({ markWidth = 38, onDark = false }: { markWidth?: number; onDark?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark width={markWidth} onDark={onDark} />
      <span className="leading-none">
        <span className={`wordmark block text-[16px] ${onDark ? "text-on-navy" : "text-navy"}`}>
          GALTON<span className={onDark ? "text-[#e3ad33]" : "text-[#8a6d1f]"}>KS</span>
        </span>
        <span
          className={`mt-1 block text-[8.5px] tracking-[0.32em] ${onDark ? "text-on-navy-muted" : "text-muted"}`}
        >
          KNOWLEDGE SYSTEM
        </span>
      </span>
    </span>
  );
}
