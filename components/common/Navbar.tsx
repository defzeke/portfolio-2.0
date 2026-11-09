"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import ThemeToggle from "./ThemeToggle";

// tilt: degrees on desktop, where the bubbles sit in a loose row; phones stack them straight.
const links = [
  { href: "#about", label: "About", tilt: -6 },
  { href: "#work", label: "Work", tilt: 5 },
  { href: "#contact", label: "Contact", tilt: -4 },
  { href: "#contact", label: "Let's talk", tilt: 6, cta: true },
];

const pill = "rounded-full bg-card shadow-[0_10px_30px_-12px_rgba(11,31,20,0.35)] ring-1 ring-line";
const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const overlay = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const opened = useRef(false);

  // Bubbles pop in one after another, labels slide up inside them; closing shrinks them away.
  useEffect(() => {
    const el = overlay.current;
    if (!el || (!open && !opened.current)) return;
    opened.current = true;
    const bubbles = el.querySelectorAll<HTMLElement>("[data-tilt]");
    const labels = el.querySelectorAll(".bubble-label");
    const desktop = window.matchMedia("(min-width: 1024px)").matches;
    const tl = gsap.timeline({ defaults: { overwrite: "auto" } });
    // The backdrop fades and blurs in gradually instead of popping on.
    const blur = (px: number) => `blur(${px}px) saturate(${1 + px / 40})`;
    if (open) {
      tl.fromTo(
        el,
        { autoAlpha: 0, backdropFilter: blur(0) },
        { autoAlpha: 1, backdropFilter: blur(16), duration: 0.45, ease: "power2.out" },
        0,
      ).fromTo(
        bubbles,
        { scale: 0, rotation: 0 },
        {
          scale: 1,
          rotation: (_, b: HTMLElement) => (desktop ? Number(b.dataset.tilt) : 0),
          duration: 0.5,
          ease: "back.out(1.6)",
          stagger: 0.08,
        },
        0.08,
      ).fromTo(
        labels,
        { yPercent: 100, autoAlpha: 0 },
        { yPercent: 0, autoAlpha: 1, duration: 0.4, ease: "power3.out", stagger: 0.08 },
        0.23,
      );
      el.querySelector("a")?.focus({ preventScroll: true });
    } else {
      tl.to(bubbles, { scale: 0, duration: 0.22, ease: "power2.in", stagger: 0.03 }).to(
        el,
        { autoAlpha: 0, backdropFilter: blur(0), duration: 0.3, ease: "power2.in" },
        0.1,
      );
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) tl.progress(1);
  }, [open]);

  // Escape closes; so does scrolling, since the story hides the bar mid-scroll.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      toggle.current?.focus();
    };
    const onScroll = () => setOpen(false);
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll);
    };
  }, [open]);

  return (
    <>
      <header data-nav data-tone="light" className="pointer-events-none fixed inset-x-0 top-0 z-50">
        {/* pb-8: the story hides the bar by its own height, and the pill shadows need to clear the top edge too */}
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 pt-3 pb-8 sm:px-6">
          <a
            href="#top"
            className={`${pill} ${focusRing} pointer-events-auto inline-flex h-12 items-center px-5 font-display text-xl font-extrabold tracking-[-0.03em] text-ink`}
          >
            zeke<span className="text-brand-600">.</span>
          </a>
          <div className="pointer-events-auto flex items-center gap-2">
            <div className={`${pill} flex size-12 items-center justify-center`}>
              <ThemeToggle />
            </div>
            <button
              ref={toggle}
              type="button"
              aria-label="Menu"
              aria-expanded={open}
              aria-controls="bubble-menu"
              onClick={() => setOpen((o) => !o)}
              className={`${pill} ${focusRing} group flex size-12 flex-col items-center justify-center gap-1.5`}
            >
              {/* Same hover as the theme toggle next to it: the icon turns brand green. */}
              <span
                className={`h-0.5 w-5 rounded-full bg-ink transition duration-300 group-hover:bg-brand-700 ${open ? "translate-y-1 rotate-45" : ""}`}
              />
              <span
                className={`h-0.5 w-5 rounded-full bg-ink transition duration-300 group-hover:bg-brand-700 ${open ? "-translate-y-1 -rotate-45" : ""}`}
              />
            </button>
          </div>
        </nav>
      </header>

      {/* Outside the header: the story slides the header with a transform, which would trap a fixed overlay. */}
      <div
        ref={overlay}
        id="bubble-menu"
        className="invisible fixed inset-0 z-40 flex items-center justify-center bg-background/55 px-6"
        onClick={(e) => e.target === e.currentTarget && setOpen(false)}
      >
        <ul className="flex w-full max-w-sm flex-col gap-3 lg:max-w-5xl lg:flex-row lg:flex-wrap lg:justify-center lg:gap-6">
          {links.map((l) => (
            <li key={l.label} data-tilt={l.tilt}>
              <a
                href={l.href}
                onClick={() => setOpen(false)}
                className={`${focusRing} group relative isolate flex items-center justify-center overflow-hidden rounded-full px-10 py-5 font-display text-4xl font-bold tracking-[-0.03em] shadow-[0_18px_40px_-20px_rgba(11,31,20,0.45)] transition-colors duration-500 ease-out lg:px-14 lg:py-8 lg:text-6xl ${
                  l.cta ? "bg-action text-white" : "bg-card text-ink ring-1 ring-line hover:text-white"
                }`}
              >
                {/* Hover fill rises from the bottom instead of the colour snapping over. */}
                <span
                  aria-hidden
                  className={`absolute inset-0 -z-10 origin-bottom rounded-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] [transform:scaleY(0)] group-hover:[transform:scaleY(1)] group-focus-visible:[transform:scaleY(1)] motion-reduce:transition-none ${
                    l.cta ? "bg-action-hover" : "bg-brand-600"
                  }`}
                />
                <span className="bubble-label inline-block">{l.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
