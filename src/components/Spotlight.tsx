"use client";

// A card that answers the pointer: a soft gold light follows the cursor across it and
// the border warms where the light is. Pure CSS variables, so it costs nothing at rest,
// and touch or keyboard users simply see the plain card.

import { useRef, type ReactNode } from "react";

export default function Spotlight({
  children,
  className = "",
  tone = "paper",
}: {
  children: ReactNode;
  className?: string;
  tone?: "paper" | "navy";
}) {
  const ref = useRef<HTMLDivElement>(null);

  function onMove(e: React.PointerEvent) {
    if (e.pointerType !== "mouse") return;
    const el = ref.current!;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--sx", `${e.clientX - r.left}px`);
    el.style.setProperty("--sy", `${e.clientY - r.top}px`);
    el.style.setProperty("--so", "1");
  }

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={() => ref.current?.style.setProperty("--so", "0")}
      className={`spotlight spotlight-${tone} relative ${className}`}
    >
      {children}
    </div>
  );
}
