"use client";

import { useEffect, useState } from "react";
import { Logo } from "./Logo";

const LINKS = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#number-check", label: "Number check" },
  { href: "#household", label: "Household profile" },
  { href: "#security", label: "Security" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color] duration-300 ${
        scrolled || open ? "border-b border-gold/60 bg-navy/95 backdrop-blur" : "border-b border-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8" aria-label="Main">
        <a href="#top" aria-label="GaltonKS home">
          <Logo onDark markWidth={34} />
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="text-sm text-on-navy-muted transition-colors hover:text-on-navy">
              {l.label}
            </a>
          ))}
          <a
            href="#contact"
            className="rounded-full bg-gold-bright px-4 py-2 text-sm font-medium text-navy transition-colors hover:bg-[#f0c04f]"
          >
            Book a meeting
          </a>
        </div>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full text-on-navy md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((o) => !o)}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
            {open ? (
              <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            ) : (
              <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </nav>

      {open && (
        <div id="mobile-menu" className="border-t border-navy-line px-5 pb-6 pt-2 md:hidden">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block py-3 text-base text-on-navy-muted hover:text-on-navy"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#contact"
            onClick={() => setOpen(false)}
            className="mt-3 block rounded-full bg-gold-bright px-4 py-3 text-center font-medium text-navy"
          >
            Book a meeting
          </a>
        </div>
      )}
    </header>
  );
}
