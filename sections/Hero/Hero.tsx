"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { useGSAP } from "@gsap/react";
import Button from "@/components/ui/Button";
import Dashboard from "@/sections/Dashboard/Dashboard";
import { insights, type InsightKey } from "@/sections/Dashboard/data";
import HeroCanvas from "./HeroCanvas";
import Subtitle from "./Subtitle";
import type { Reaction, ZekeControls, ZekeRig } from "./ZekeModel";

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollToPlugin);
// Mobile browsers resize the viewport as the address bar shows/hides; don't re-measure the
// whole pinned story (and jump) for that.
ScrollTrigger.config({ ignoreMobileResize: true });

const NAME = "zeke";

// Short personal facts for the about panel (placeholder copy).
const aboutFacts = [
  { label: "Based in", value: "Lorem, Ipsum" },
  { label: "Focus", value: "Dolor sit amet" },
  { label: "Currently", value: "Consectetur elit" },
];

const AT = { intro: 0, about: 1, center: 2, dark: 3.4, dash: 4.4, thanks: 5.6, cta: 6.8 };
const PIN_END = AT.cta + 0.4;
const THANKS_LINE = "Thank you for listening! Lorem ipsum dolor sit amet.";
const CTA_LINE = "Lorem ipsum — that's me. Let's build something together.";
const NAV_HIDE_AT = 2.05;
const AUTO_ADVANCE_DELAY = 2;
const AUTO_ADVANCE_DURATION = 2.6;
const SCRUB_SMOOTHING = 1.2;
const SETTLE_THRESHOLD = 0.04;
const SCROLL_PER_UNIT = 1.2;
const MOBILE_ASIDE = { pull: 4.2, lift: 0.96 }; // intro/about: full body in the top ~40%
const MOBILE_BUST = { pull: 6.3, lift: 1.55 }; // dashboard/CTA: waist-up above the window

type Scene = "intro" | "about" | "moving" | "center" | "dive" | "dash" | "thanks" | "cta";
const SCENES: [number, Scene][] = [
  [0.5, "intro"],
  [1.3, "about"],
  [1.9, "moving"],
  [2.6, "center"],
  [3.45, "dive"],
  [5, "dash"],
  [6.2, "thanks"],
];
const sceneAt = (t: number): Scene => SCENES.find(([until]) => t < until)?.[1] ?? "cta";
const REACTIONS: Partial<Record<Scene, Reaction>> = { intro: "Talk", about: "Talk", center: "Laugh" };

type Pose = { x: number; top: number; height: number };

export default function Hero() {
  const scope = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLElement>(null);
  const loader = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const leftCol = useRef<HTMLDivElement>(null);
  const intro = useRef<HTMLDivElement>(null);
  const about = useRef<HTMLDivElement>(null);
  const scrollCue = useRef<HTMLDivElement>(null);
  const dark = useRef<HTMLDivElement>(null);
  const blackout = useRef<HTMLDivElement>(null);
  const dashModelCol = useRef<HTMLDivElement>(null);
  const dash = useRef<HTMLDivElement>(null);
  const caption = useRef<HTMLDivElement>(null);
  const ctaPanel = useRef<HTMLDivElement>(null);
  const slide = useRef<HTMLDivElement>(null);
  const ctaSlot = useRef<HTMLDivElement>(null);
  const floor = useRef<HTMLDivElement>(null);

  const [play, setPlay] = useState(false);
  const model = useRef<ZekeControls | null>(null);
  const rig = useRef<ZekeRig>({ zoom: 0, bust: 0, turn: 0, outro: 0, pull: 0, lift: 0 });

  // Subtitle: what he says about whatever was pressed in the dashboard.
  const [line, setLine] = useState({ text: insights.overview, cue: 0 });
  const lastInsight = useRef<InsightKey>("overview");
  const speak = (text: string, reaction: Reaction) => {
    setLine((prev) => ({ text, cue: prev.cue + 1 }));
    model.current?.react(reaction);
  };
  const say = (key: InsightKey) => {
    lastInsight.current = key;
    speak(insights[key], "Talk");
  };
  // Filled in by the GSAP context below; called from the 3D scene.
  const actions = useRef<{ ready?: () => void; entranceDone?: () => void }>({});

  useGSAP(
    (_, contextSafe) => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const html = document.documentElement;
      const nav = document.querySelector<HTMLElement>("[data-nav]");
      const flags = { nameShown: false, modelReady: false, exited: false, aside: false, scroll: false };
      let onAnchorClick: ((e: MouseEvent) => void) | null = null;
      let removeLinkRelease: (() => void) | null = null;

      // Always start at the top with scrolling locked until the intro is done.
      history.scrollRestoration = "manual";
      window.scrollTo(0, 0);
      html.style.overflow = "hidden";

      gsap.set(
        [
          intro.current,
          about.current,
          scrollCue.current,
          dark.current,
          blackout.current,
          dash.current,
          caption.current,
          ctaPanel.current,
          slide.current,
          floor.current,
        ],
        { autoAlpha: 0 },
      );
      if (nav) gsap.set(nav, { yPercent: -100 });

      const isDesktop = () => window.matchMedia("(min-width: 1024px)").matches;
      const offsetToCentre = (el: HTMLElement) => {
        const r = el.getBoundingClientRect();
        return r.left + r.width / 2 - window.innerWidth / 2;
      };
      const centrePose = (): Pose => ({ x: 0, top: 0, height: window.innerHeight });
      const asidePose = (): Pose =>
        isDesktop() && leftCol.current
          ? { x: offsetToCentre(leftCol.current), top: 0, height: window.innerHeight }
          : centrePose();
      const bustPose = (): Pose => {
        const col = dashModelCol.current;
        if (!col || !isDesktop()) return centrePose();
        return { x: offsetToCentre(col), top: 0, height: window.innerHeight };
      };
      const phone = (frame: { pull: number; lift: number }) => ({
        pull: () => (isDesktop() ? 0 : frame.pull),
        lift: () => (isDesktop() ? 0 : frame.lift),
      });
      // Phones: he drops straight into his small spot, so he never jumps from big to small.
      if (!isDesktop()) Object.assign(rig.current, MOBILE_ASIDE);
      // Function-based values so ScrollTrigger re-measures them on resize.
      const live = (pose: () => Pose) => ({
        x: () => pose().x,
        top: () => pose().top,
        height: () => pose().height,
      });

      const onResize = () => {
        if (flags.aside && !flags.scroll) gsap.set(stage.current, asidePose());
      };
      window.addEventListener("resize", onResize);

      const finish = (tl: gsap.core.Timeline) => {
        if (reduced) tl.progress(1);
        return tl;
      };

      // 4. The pinned scroll story.
      const enableScroll = contextSafe!(() => {
        flags.scroll = true;
        html.style.overflow = "";
        let scene: Scene = "intro";
        let travel: gsap.core.Tween | null = null;
        let travelTo: string | null = null;
        let restP = 0;

        // Navbar visibility has exactly one owner (this), driven by where the story is.
        let navShown = true;
        const setNav = (show: boolean, tone: "light" | "dark" = "light") => {
          if (!nav) return;
          if (show) nav.dataset.tone = tone;
          if (show === navShown) return;
          navShown = show;
          gsap.to(nav, {
            yPercent: show ? 0 : -100,
            duration: show ? 0.4 : 0.3,
            ease: show ? "power3.out" : "power2.in",
            overwrite: "auto",
          });
        };

        // Auto-advance from the laugh into the dive.
        let autoTimer: gsap.core.Tween | null = null;
        const cancelAuto = () => {
          autoTimer?.kill();
          autoTimer = null;
        };
        const armAuto = () => {
          if (autoTimer || travel || scene !== "center") return;
          autoTimer = gsap.delayedCall(AUTO_ADVANCE_DELAY, () => {
            autoTimer = null;
            if (scene === "center" && !travel) goTo("dash", { duration: AUTO_ADVANCE_DURATION });
          });
        };

        // Glide to a scene label (or null: out of the story, into the footer).
        function goTo(label: string | null, opts: { duration?: number } = {}) {
          const st = tl.scrollTrigger;
          if (!st) return;
          cancelAuto();
          travel?.kill();
          const to = label === null ? PIN_END : tl.labels[label];
          const distance = Math.abs(to - st.progress * tl.duration());
          const duration =
            opts.duration ?? (reduced ? 0.45 : gsap.utils.clamp(0.6, 1.8, 0.45 + distance * 0.6));
          travelTo = label;
          const done = () => {
            travel = null;
            travelTo = null;
            if (scene === "center") armAuto();
          };
          travel = gsap.to(window, {
            scrollTo: { y: label === null ? st.end + 2 : st.labelToScroll(label), autoKill: false },
            duration,
            ease: "sine.inOut",
            onComplete: () => {
              restP = label === null ? 1 : tl.labels[label] / tl.duration();
              done();
            },
            onInterrupt: done,
          });
        }

        const settle = () => {
          const st = tl.scrollTrigger;
          if (!st || travel || window.scrollY < st.start || window.scrollY >= st.end) return;
          const stops = Object.entries(tl.labels)
            .map(([name, time]) => [name, time / tl.duration()] as [string | null, number])
            .concat([[null, 1]])
            .sort((a, b) => a[1] - b[1]);
          const p = st.progress;
          const resting = stops.find(([, v]) => Math.abs(v - p) < 0.002);
          if (resting) {
            restP = resting[1];
            return;
          }
          const eps = SETTLE_THRESHOLD / (stops.length - 1);
          const moved = p - restP;
          let target: [string | null, number];
          if (Math.abs(moved) < eps) {
            // just a nudge: ease back onto the scene you were on
            target = stops.reduce((a, b) => (Math.abs(b[1] - p) < Math.abs(a[1] - p) ? b : a));
          } else if (moved > 0) {
            target = stops.find(([, v]) => v > p) ?? stops[stops.length - 1];
          } else {
            target = [...stops].reverse().find(([, v]) => v < p) ?? stops[0];
          }
          goTo(target[0]);
        };

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: () => `+=${window.innerHeight * PIN_END * SCROLL_PER_UNIT}`,
            pin: true,
            scrub: SCRUB_SMOOTHING,
            invalidateOnRefresh: true,
            // Past the story the page is light again, so the navbar returns.
            onLeave: () => setNav(true, "dark"),
            onEnterBack: () => setNav(false),
            onUpdate: (self) => {
              const t = self.progress * tl.duration();
              if (self.progress < 1) setNav(t < NAV_HIDE_AT);
              const next = sceneAt(t);
              if (next === scene) return;
              scene = next;
              // Gliding past scenes on the way somewhere (e.g. "Back to top"): stay quiet.
              const dest = travelTo === null ? null : sceneAt(tl.labels[travelTo]);
              if (dest && next !== dest) {
                cancelAuto();
                return;
              }
              if (next === "center") armAuto();
              else cancelAuto();
              const reaction = REACTIONS[next];
              if (reaction) model.current?.react(reaction);
              // Arriving at the dashboard: he picks up where you left off.
              if (next === "dash") say(lastInsight.current);
              // Closing slide: he thanks you.
              if (next === "thanks") speak(THANKS_LINE, "Talk");
              // Last scene: he turns to you and waves goodbye.
              if (next === "cta") speak(CTA_LINE, "Wave");
            },
          },
        });

        // intro → about
        tl.addLabel("intro", AT.intro)
          .to(scrollCue.current, { autoAlpha: 0, duration: 0.2 }, 0)
          .to(intro.current, { autoAlpha: 0, y: -60, ease: "power2.in", duration: 0.5 }, 0)
          .set(about.current, { autoAlpha: 1 }, 0.45)
          .from(
            ".about-item",
            { autoAlpha: 0, y: 50, ease: "power2.out", duration: 0.5, stagger: 0.08 },
            0.45,
          )
          .addLabel("about", AT.about)

          // about leaves, he walks back to the middle
          .to(about.current, { autoAlpha: 0, y: -50, ease: "power2.in", duration: 0.4 }, 1.1)
          .fromTo(
            stage.current,
            live(asidePose),
            { ...live(centrePose), ease: "power2.inOut", duration: 0.8 },
            1.2,
          )
          .fromTo(
            rig.current,
            phone(MOBILE_ASIDE),
            { pull: 0, lift: 0, ease: "power2.inOut", duration: 0.8 },
            1.2,
          )
          .addLabel("center", AT.center);

        // dive into the mouth → black (the black only lands once the camera is at the lips)
        if (!reduced) tl.to(rig.current, { zoom: 1, ease: "power1.in", duration: 1.2 }, 2.05);
        tl.to(blackout.current, { autoAlpha: 1, ease: "power1.in", duration: reduced ? 0.6 : 0.2 }, reduced ? 2.7 : 3.12)
          .set([dark.current, floor.current], { autoAlpha: 1 }, 3.35)
          .addLabel("dark", AT.dark)

          // cut (hidden by the black): him standing beside the dashboard, turned toward it
          .set(stage.current, live(bustPose), 3.45)
          .to(
            rig.current,
            { bust: 1, turn: () => (isDesktop() ? 0.5 : 0), ease: "power2.out", duration: 0.95 },
            3.45,
          )
          .fromTo(
            rig.current,
            { pull: 0, lift: 0 },
            { ...phone(MOBILE_BUST), ease: "power2.out", duration: 0.95, immediateRender: false },
            3.45,
          )
          .to(blackout.current, { autoAlpha: 0, ease: "power2.out", duration: 0.6 }, 3.6)
          .fromTo(
            dash.current,
            { autoAlpha: 0, scale: 0.94, y: 40 },
            { autoAlpha: 1, scale: 1, y: 0, ease: "expo.out", duration: 0.6 },
            3.8,
          )
          .fromTo(
            caption.current,
            { autoAlpha: 0, y: 12 },
            { autoAlpha: 1, y: 0, ease: "power2.out", duration: 0.4 },
            3.95,
          )
          .addLabel("dash", AT.dash)
          .to(rig.current, { turn: 0, ease: "power2.inOut", duration: 0.7 }, 4.75)
          .fromTo(slide.current, { autoAlpha: 0 }, { autoAlpha: 1, ease: "power1.inOut", duration: 0.4 }, 4.8)
          .set(dash.current, { autoAlpha: 0 }, 5.2)
          .from(
            ".slide-item",
            { autoAlpha: 0, y: 24, ease: "power3.out", duration: 0.5, stagger: 0.07 },
            5.05,
          )
          .addLabel("thanks", AT.thanks)

          // goodbye: the slide clears, he turns to face you, the CTA rises in its place
          .to(slide.current, { autoAlpha: 0, scale: 0.96, y: -24, ease: "power2.in", duration: 0.4 }, 5.95)
          // ...and the camera eases back to the full-body shot the story opened on
          // (desktop only: on phones he is already small above the CTA)
          .to(rig.current, { turn: 0, outro: () => (isDesktop() ? 1 : 0), ease: "power2.inOut", duration: 0.7 }, 6.0)
          // he steps into his slot in the centred CTA row; his subtitle follows him
          .to(
            stage.current,
            {
              x: () => (isDesktop() && ctaSlot.current ? offsetToCentre(ctaSlot.current) : bustPose().x),
              ease: "power2.inOut",
              duration: 0.7,
            },
            6.0,
          )
          .to(
            caption.current,
            {
              x: () =>
                isDesktop() && ctaSlot.current && dashModelCol.current
                  ? offsetToCentre(ctaSlot.current) - offsetToCentre(dashModelCol.current)
                  : 0,
              // phones: drop the subtitle off his chest to just above the CTA heading
              y: () => {
                const h2 = ctaPanel.current?.querySelector("h2");
                const cap = caption.current;
                if (isDesktop() || !h2 || !cap) return 0;
                const headingTop = h2.getBoundingClientRect().top - Number(gsap.getProperty(h2, "y"));
                const capBottom = cap.getBoundingClientRect().bottom - Number(gsap.getProperty(cap, "y"));
                return Math.max(0, headingTop - capBottom - 16);
              },
              ease: "power2.inOut",
              duration: 0.7,
            },
            6.0,
          )
          .set(ctaPanel.current, { autoAlpha: 1 }, 6.2)
          .from(
            ".cta-item",
            { autoAlpha: 0, y: 44, ease: "power3.out", duration: 0.5, stagger: 0.08 },
            6.2,
          )
          .addLabel("cta", AT.cta)
          .to({}, { duration: PIN_END - AT.cta }, AT.cta); // hold before releasing to the footer

        // In-page links land on the matching scene of the pinned story.
        const anchors: Record<string, string> = {
          "#top": "intro",
          "#about": "about",
          "#work": "dash",
          "#contact": "cta",
        };
        onAnchorClick = (e: MouseEvent) => {
          const link = (e.target as Element | null)?.closest?.("a[href^='#']");
          const label = link && anchors[link.getAttribute("href") ?? ""];
          if (!label || !tl.scrollTrigger) return;
          e.preventDefault();
          goTo(label);
        };
        document.addEventListener("click", onAnchorClick);

        // Scrolling yourself takes over from a scripted glide or a pending auto-advance.
        const takeOver = () => {
          cancelAuto();
          travel?.kill();
        };
        const inputs = ["wheel", "touchstart", "keydown"] as const;
        inputs.forEach((t) => window.addEventListener(t, takeOver, { passive: true }));
        // Settled on the laugh without scrolling on: start the auto-advance countdown.
        const onScrollEnd = () => {
          settle();
          if (scene === "center") armAuto();
        };
        ScrollTrigger.addEventListener("scrollEnd", onScrollEnd);

        removeLinkRelease = () => {
          inputs.forEach((t) => window.removeEventListener(t, takeOver));
          ScrollTrigger.removeEventListener("scrollEnd", onScrollEnd);
          cancelAuto();
          travel?.kill();
        };

        ScrollTrigger.refresh();
      });

      // 3. Drop-in finished: slide aside + reveal intro.
      const entranceDone = contextSafe!(() => {
        flags.aside = true;
        const tl = gsap.timeline({ onComplete: enableScroll });
        tl.to(stage.current, { ...asidePose(), duration: 1.3, ease: "power3.inOut" })
          .set(intro.current, { autoAlpha: 1 }, "-=0.5")
          .call(() => model.current?.react("Talk"), undefined, "<")
          .from(".intro-line", { yPercent: 110, duration: 0.9, ease: "power4.out", stagger: 0.1 }, "<")
          .fromTo(
            ".intro-underline",
            { strokeDashoffset: 1 },
            { strokeDashoffset: 0, duration: 0.7, ease: "power2.inOut" },
            "-=0.35",
          )
          .from(
            ".intro-fade",
            { autoAlpha: 0, y: 24, duration: 0.7, ease: "power3.out", stagger: 0.08 },
            "-=0.6",
          )
          .to(scrollCue.current, { autoAlpha: 1, duration: 0.5 }, "-=0.2");
        if (nav) tl.to(nav, { yPercent: 0, duration: 0.6, ease: "power3.out" }, "<");
        finish(tl);
      });

      // 2. Loader leaves once the name has shown AND the model is ready.
      const tryExit = contextSafe!(() => {
        if (!flags.nameShown || !flags.modelReady || flags.exited) return;
        flags.exited = true;
        const tl = gsap.timeline();
        tl.to(".loader-bar", { scaleX: 1, duration: 0.4, ease: "power2.inOut" })
          .to(".loader-letter", { yPercent: -115, duration: 0.6, ease: "power3.in", stagger: 0.05 }, "+=0.2")
          .to(".loader-bar-track", { autoAlpha: 0, duration: 0.3 }, "<")
          .to(loader.current, { yPercent: -100, duration: 0.8, ease: "power4.inOut" }, "-=0.1")
          .add(() => setPlay(true), "-=0.35")
          .set(loader.current, { display: "none" });
        finish(tl);
      });

      actions.current = {
        ready: () => {
          flags.modelReady = true;
          tryExit();
        },
        entranceDone,
      };

      // 1. Name loader.
      const tl = gsap.timeline({
        onComplete: () => {
          flags.nameShown = true;
          tryExit();
        },
      });
      tl.from(".loader-letter", { yPercent: 115, duration: 0.9, ease: "power4.out", stagger: 0.08 })
        .set(".loader-word", { visibility: "visible" }, 0)
        .fromTo(".loader-bar", { scaleX: 0 }, { scaleX: 0.7, duration: 1.4, ease: "power2.out" }, 0)
        .to({}, { duration: 0.3 }); // short hold on the name
      finish(tl);

      return () => {
        window.removeEventListener("resize", onResize);
        if (onAnchorClick) document.removeEventListener("click", onAnchorClick);
        removeLinkRelease?.();
        html.style.overflow = "";
      };
    },
    { scope },
  );

  return (
    <div ref={scope}>
      {/* 1. Name loader */}
      <div
        ref={loader}
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background"
        aria-hidden
      >
        <div className="loader-word invisible flex overflow-hidden pb-[0.08em] font-display text-[clamp(5rem,18vw,12rem)] font-extrabold leading-[0.95] tracking-[-0.03em] text-ink">
          {NAME.split("").map((c, i) => (
            <span key={i} className="loader-letter inline-block">
              {c}
            </span>
          ))}
          <span className="loader-letter inline-block text-brand-600">.</span>
        </div>
        <div className="loader-bar-track mt-6 h-0.5 w-40 overflow-hidden rounded-full bg-line">
          <div className="loader-bar h-full origin-left scale-x-0 bg-brand-600" />
        </div>
      </div>

      <section
        id="top"
        ref={root}
        className="relative h-svh w-full overflow-hidden bg-background"
      >
        {/* A design canvas he stands on: hairline grid, fading out toward the edges */}
        <div aria-hidden className="hero-grid pointer-events-none absolute inset-0" />

        {/* The loader's wordmark stays on as the ground he stands on */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 hidden select-none justify-center overflow-hidden lg:flex"
        >
          <span className="translate-y-[14%] font-display text-[clamp(12rem,30vw,30rem)] font-extrabold leading-[0.8] tracking-[-0.04em] text-brand-100/80">
            zeke<span className="text-brand-200/70">.</span>
          </span>
        </div>

        {/* The world after the dive: deep forest, lit from where he stands */}
        <div
          ref={dark}
          aria-hidden
          className="invisible absolute inset-0 bg-[#03100a] bg-[radial-gradient(70%_45%_at_50%_22%,#14532d_0%,#0b2e1a_50%,#03100a_100%)] lg:bg-[radial-gradient(52%_52%_at_26%_44%,#166534_0%,#0b2e1a_52%,#03100a_100%)]"
        />

        {/* 3D stage — full-bleed so the model can drop in centred, then move between poses */}
        <div ref={stage} className="pointer-events-none absolute inset-x-0 top-0 h-full">
          <HeroCanvas
            play={play}
            controlsRef={model}
            rigRef={rig}
            onReady={() => actions.current.ready?.()}
            onEntranceComplete={() => actions.current.entranceDone?.()}
          />
        </div>

        <div
          ref={floor}
          aria-hidden
          className="invisible pointer-events-none absolute inset-x-0 bottom-0 h-[24%] bg-[linear-gradient(to_top,#03100a_8%,transparent)]"
        />

        <div className="relative mx-auto grid h-full max-w-6xl px-6 pt-16 lg:grid-cols-2">
          <div ref={leftCol} className="hidden lg:block" />

          {/* text panels sit on the right (desktop) or bottom (mobile) */}
          <div className="relative mt-[47svh] w-full md:mx-auto md:max-w-xl lg:mx-0 lg:mt-0 lg:max-w-none">
            <div
              ref={intro}
              className="invisible absolute inset-0 flex flex-col justify-start lg:justify-center"
            >
              <h1 className="text-balance font-display text-[clamp(2.75rem,6vw,5.5rem)] font-bold leading-[0.98] tracking-[-0.022em]">
                <span className="block overflow-hidden pb-[0.06em]">
                  <span className="intro-line block">Hi, my name is</span>
                </span>
                <span className="block overflow-hidden pb-[0.22em]">
                  <span className="intro-line relative inline-block text-brand-600">
                    Ezekiel.
                    <svg
                      aria-hidden
                      viewBox="0 0 300 24"
                      preserveAspectRatio="none"
                      className="absolute -bottom-[0.16em] left-0 h-[0.2em] w-[96%] text-brand-300"
                    >
                      <path
                        className="intro-underline"
                        d="M3 16C58 6 118 4 168 10s96 12 129-2"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="6"
                        strokeLinecap="round"
                        pathLength={1}
                        strokeDasharray={1}
                        strokeDashoffset={1}
                      />
                    </svg>
                  </span>
                </span>
              </h1>
              <p className="intro-fade mt-5 max-w-[42ch] text-base leading-7 text-muted sm:text-lg sm:leading-8">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                incididunt ut labore et dolore magna aliqua.
              </p>
              <div className="intro-fade mt-8 flex flex-wrap gap-3">
                <Button href="#work">Lorem ipsum</Button>
                <Button href="#contact" variant="outline">
                  Dolor sit amet
                </Button>
              </div>
            </div>

            <div
              ref={about}
              className="invisible absolute inset-0 flex flex-col justify-start lg:justify-center"
            >
              <h2 className="about-item text-balance font-display text-[clamp(2.25rem,4.4vw,3.75rem)] font-bold leading-[1.02] tracking-[-0.02em]">
                Lorem ipsum dolor sit amet, <span className="text-brand-600">consectetur</span>.
              </h2>
              <p className="about-item mt-6 max-w-[46ch] text-base leading-7 text-muted sm:text-lg sm:leading-8">
                Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
                veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo.
              </p>
              <dl className="about-item mt-8 grid max-w-lg grid-cols-3 gap-5 border-t border-line pt-5">
                {aboutFacts.map((f) => (
                  <div key={f.label}>
                    <dt className="text-sm text-muted">{f.label}</dt>
                    <dd className="mt-1 font-medium text-ink">{f.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>

        {/* Pinned story: tells people the page continues by scrolling */}
        <div
          ref={scrollCue}
          aria-hidden
          className="invisible pointer-events-none absolute bottom-6 right-6 flex items-center gap-3 [@media(max-height:720px)_and_(max-width:1023px)]:hidden text-xs font-medium tracking-wide text-muted lg:bottom-8 lg:right-10"
        >
          Scroll
          <span className="relative h-10 w-px overflow-hidden bg-line">
            <span className="absolute inset-x-0 top-0 h-1/2 animate-[cue_1.8s_cubic-bezier(0.65,0,0.35,1)_infinite] bg-brand-600 motion-reduce:animate-none" />
          </span>
        </div>

        <div className="pointer-events-none absolute inset-0">
          <div className="mx-auto grid h-full max-w-[90rem] grid-rows-[minmax(0,32svh)_minmax(0,1fr)] px-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2.5fr)] lg:grid-rows-1 lg:gap-8 lg:px-8">
            <div ref={dashModelCol} className="relative">
              <div
                ref={caption}
                className="invisible pointer-events-auto absolute inset-x-0 bottom-2 flex justify-center lg:bottom-[8svh]"
              >
                <Subtitle
                  text={line.text}
                  cue={line.cue}
                  className="max-w-[40ch] rounded-xl bg-[#020604]/75 px-4 py-2.5"
                />
              </div>
            </div>
            <div className="relative flex min-h-0 items-center pb-4 lg:py-10 lg:pb-10">
              <div
                ref={dash}
                className="invisible pointer-events-auto h-full w-full lg:h-[min(820px,calc(100svh-5rem))]"
              >
                <Dashboard className="h-full" onInsight={say} />
              </div>
              {/* Closing slide: exactly the dashboard window's box, layered over it */}
              <div
                ref={slide}
                className="invisible pointer-events-none absolute inset-0 z-10 flex items-center pb-4 lg:py-10"
              >
                <div className="relative flex h-full w-full flex-col justify-between overflow-hidden rounded-3xl bg-card p-7 shadow-[0_40px_90px_-30px_rgba(0,0,0,0.6)] sm:p-10 lg:h-[min(820px,calc(100svh-5rem))] lg:p-14">
                  <div className="slide-item flex items-center justify-between text-sm text-muted">
                    <span className="font-display text-lg font-extrabold tracking-[-0.03em] text-ink">
                      zeke<span className="text-brand-600">.</span>
                    </span>
                    <span>Portfolio 2026</span>
                  </div>
                  <div>
                    <h2 className="slide-item font-display text-[clamp(2.4rem,6.5vw,6.25rem)] font-bold leading-[0.92] tracking-[-0.03em] text-ink">
                      Thank you
                      <br />
                      for <span className="text-brand-600">listening.</span>
                    </h2>
                    <svg
                      aria-hidden
                      viewBox="0 0 300 24"
                      preserveAspectRatio="none"
                      className="slide-item mt-3 h-3 w-40 text-brand-300 sm:w-56"
                    >
                      <path
                        d="M3 16C58 6 118 4 168 10s96 12 129-2"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="6"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                  <div className="slide-item flex flex-col gap-1 border-t border-line pt-5 text-sm text-muted sm:flex-row sm:items-end sm:justify-between sm:gap-6">
                    <span>Lorem ipsum dolor sit amet</span>
                    <span className="text-ink">Questions? Let&apos;s talk.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div ref={ctaPanel} className="invisible pointer-events-none absolute inset-0">
          <div className="mx-auto flex h-full max-w-6xl flex-col justify-center px-4 pb-6 pt-[32svh] lg:flex-row lg:items-center lg:justify-center lg:gap-12 lg:px-8 lg:pb-0 lg:pt-0">
            <div ref={ctaSlot} className="hidden h-full w-[min(26vw,340px)] shrink-0 lg:block" />
            <div className="pointer-events-auto max-w-[36rem]">
              <h2 className="cta-item max-w-[14ch] text-balance font-display text-[clamp(2.6rem,6vw,5.5rem)] font-bold leading-[0.96] tracking-[-0.03em] text-white">
                Lorem ipsum dolor sit <span className="text-brand-300">amet?</span>
              </h2>
              <p className="cta-item mt-6 max-w-[44ch] text-base leading-7 text-white/70 sm:text-lg sm:leading-8">
                Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
                magna aliqua.
              </p>
              <div className="cta-item mt-9 flex flex-wrap gap-3">
                <Button href="mailto:hello@example.com" variant="light">
                  Lorem ipsum
                </Button>
                <Button
                  href="#"
                  variant="outline"
                  className="border-white/20 text-white hover:border-white hover:text-white"
                >
                  Dolor sit amet
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* The dive ends in black */}
        <div
          ref={blackout}
          aria-hidden
          className="pointer-events-none invisible absolute inset-0 bg-[#020604]"
        />
      </section>
    </div>
  );
}
