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
import ZekeChat from "./ZekeChat";
import type { Reaction, ZekeControls, ZekeRig } from "./ZekeModel";

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollToPlugin);
ScrollTrigger.config({ ignoreMobileResize: true });

const NAME = "zeke";

const lockKeys = new Set([" ", "PageDown", "PageUp", "ArrowDown", "ArrowUp", "Home", "End"]);
let lockedAt: number | null = null;
const blockInput = (e: Event) => {
  if (e instanceof KeyboardEvent) {
    const el = e.target as HTMLElement | null;
    if (!lockKeys.has(e.key) || el?.closest("input, textarea, [contenteditable]")) return;
  } else if ((e.target as HTMLElement | null)?.closest?.(".scroll-quiet")) return;
  e.preventDefault();
};
const holdPosition = () => {
  if (lockedAt !== null && window.scrollY !== lockedAt) window.scrollTo(0, lockedAt);
};
function lockScroll(on: boolean) {
  const root = document.documentElement;
  if (on === (lockedAt !== null)) return;
  lockedAt = on ? window.scrollY : null;
  if (on) root.dataset.scrollLocked = "";
  else delete root.dataset.scrollLocked;
  const method = on ? "addEventListener" : "removeEventListener";
  for (const t of ["wheel", "touchmove"]) window[method](t, blockInput, { passive: false });
  window[method]("keydown", blockInput);
  window[method]("scroll", holdPosition);
}

const EMAIL = "onlyzekedotcom@gmail.com";
const GMAIL = `https://mail.google.com/mail/?view=cm&fs=1&to=${EMAIL}`;
const LINKEDIN = "https://www.linkedin.com/in/ezekiel-bustamante-166493353/";

const aboutFacts = [
  { label: "Based in", value: "Metro Manila, PH" },
  { label: "Studying", value: "BSCpE, PUP Manila" },
  { label: "Focus", value: "Cybersecurity & Full‑stack" },
];

const AT = { intro: 0, about: 1, center: 2, dark: 3.4, dash: 4.4, thanks: 5.6, cta: 6.8 };
const PIN_END = AT.cta + 0.4;
const THANKS_LINE = "Thanks for sticking around! That's the tour.";
const CTA_LINE = "That's me. Got a project, a hackathon team, or a role? Let's talk.";
const NAV_HIDE_AT = 2.05;
const AUTO_ADVANCE_DELAY = 2;
const AUTO_ADVANCE_DURATION = 2.6;
const SCRUB_SMOOTHING = 1.2;
const SETTLE_THRESHOLD = 0.15;
// Wait this long after your last wheel/touch input before settling (ms).
const SETTLE_DELAY = 300;
// Going past a scene you never stopped on needs a bigger push before it skips that scene.
const SKIP_THRESHOLD = 0.5;
const SCROLL_PER_UNIT = 1.2;
// The intro never waits longer than this for the 3D model; he drops in when he arrives.
const MODEL_WAIT = 2.5;
const SEEN_KEY = "zeke:seen";
const MOBILE_ASIDE = { pull: 4.2, lift: 0.96 }; // intro/about: full body in the top ~40%
const MOBILE_BUST = { pull: 6.3, lift: 1.55 }; // dashboard/CTA: waist-up above the window
const FACE_DESKTOP = { faceDist: 1.9, faceLift: 0.09 };
const FACE_PHONE = { faceDist: 3, faceLift: 0.33 };

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
  const textLayer = useRef<HTMLDivElement>(null);
  const chatBtn = useRef<HTMLButtonElement>(null);
  const chatLayer = useRef<HTMLDivElement>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const stageX = useRef(0);
  const chatIsOpen = useRef(false);
  const turnBefore = useRef(0);
  const opener = useRef<HTMLElement | null>(null);
  const dashLayer = useRef<HTMLDivElement>(null);
  const ctaInner = useRef<HTMLDivElement>(null);
  const reserve = useRef<HTMLDivElement>(null);

  const [play, setPlay] = useState(false);
  const model = useRef<ZekeControls | null>(null);
  const rig = useRef<ZekeRig>({
    zoom: 0,
    bust: 0,
    turn: 0,
    outro: 0,
    pull: 0,
    lift: 0,
    face: 0,
    faceDist: 1,
    faceLift: 0,
  });

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
      const nav = document.querySelector<HTMLElement>("[data-nav]");
      const flags = {
        nameShown: false,
        modelReady: false,
        waited: false,
        exited: false,
        aside: false,
        scroll: false,
      };
      let seen = false;
      try {
        seen = sessionStorage.getItem(SEEN_KEY) === "1";
      } catch {}
      let onAnchorClick: ((e: MouseEvent) => void) | null = null;
      let removeLinkRelease: (() => void) | null = null;

      // Always start at the top with scrolling locked until the intro is done.
      history.scrollRestoration = "manual";
      window.scrollTo(0, 0);
      lockScroll(true);

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
          chatBtn.current,
          chatLayer.current,
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

      // A refresh re-renders the story's stage position over the chat's centring. Take the fresh
      // value as where closing the chat returns to, and put him back in the centre.
      const keepChatCentred = () => {
        if (!chatIsOpen.current) return;
        const x = Number(gsap.getProperty(stage.current, "x"));
        if (x !== 0) stageX.current = x; // still 0: nothing rewrote it, the saved spot stands
        gsap.set(stage.current, { x: 0 });
      };
      const onResize = () => {
        if (flags.aside && !flags.scroll) {
          gsap.set(stage.current, asidePose());
          keepChatCentred();
        }
      };
      // Before the story exists a refresh rewrites nothing, so x could be mid-animation.
      const onRefresh = () => {
        if (flags.scroll) keepChatCentred();
      };
      window.addEventListener("resize", onResize);
      ScrollTrigger.addEventListener("refresh", onRefresh);

      const finish = (tl: gsap.core.Timeline) => {
        if (reduced) tl.progress(1);
        return tl;
      };

      // 4. The pinned scroll story.
      const enableScroll = contextSafe!(() => {
        flags.scroll = true;
        lockScroll(false);
        gsap.set(reserve.current, { display: "none" });
        let scene: Scene = "intro";
        let travel: gsap.core.Tween | null = null;
        let travelTo: string | null = null;
        // Direction of your most recent scroll input (1 = down/forward, -1 = up/back).
        let lastDir: 1 | -1 = 1;
        let lastInput = 0;
        let settleCall: gsap.core.Tween | null = null;
        // Progress of the scene this scroll gesture started from.
        let origin = 0;
        const stopsNow = () =>
          Object.entries(tl.labels)
            .map(([name, time]) => [name, time / tl.duration()] as [string | null, number])
            .filter(([name]) => name !== "dark")
            .concat([[null, 1]])
            .sort((a, b) => a[1] - b[1]);
        const nearestStop = (p: number) =>
          stopsNow().reduce((a, b) => (Math.abs(b[1] - p) < Math.abs(a[1] - p) ? b : a))[1];

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
        function goTo(label: string | null, opts: { duration?: number; focus?: () => HTMLElement | null | undefined } = {}) {
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
              origin = label === null ? 1 : tl.labels[label] / tl.duration();
              done();
              opts.focus?.()?.focus({ preventScroll: true });
            },
            onInterrupt: done,
          });
        }

        // When you stop between two scenes, finish the move in the direction you were going,
        // judged from where you are right now: past SETTLE_THRESHOLD of the gap → next scene,
        // otherwise back to the one you were leaving. Never more than one scene away.
        const settle = () => {
          settleCall = null;
          const st = tl.scrollTrigger;
          if (!st || travel || window.scrollY < st.start || window.scrollY >= st.end) return;
          const wait = SETTLE_DELAY - (performance.now() - lastInput);
          if (wait > 0) {
            settleCall = gsap.delayedCall(wait / 1000, settle);
            return;
          }
          const stops = stopsNow();
          const p = st.progress;
          const resting = stops.find(([, v]) => Math.abs(v - p) < 0.002);
          if (resting) {
            origin = resting[1];
            return;
          }
          const prev = [...stops].reverse().find(([, v]) => v < p) ?? stops[0];
          const next = stops.find(([, v]) => v > p) ?? stops[stops.length - 1];
          const f = (p - prev[1]) / (next[1] - prev[1] || 1);
          // leaving the scene you started from: a small push is enough; skipping one: a big one
          const fwd = Math.abs(prev[1] - origin) < 0.002 ? SETTLE_THRESHOLD : SKIP_THRESHOLD;
          const back = Math.abs(next[1] - origin) < 0.002 ? SETTLE_THRESHOLD : SKIP_THRESHOLD;
          const target = lastDir > 0 ? (f > fwd ? next : prev) : f < 1 - back ? prev : next;
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
            onEnterBack: (self) => setNav(self.progress * tl.duration() < NAV_HIDE_AT),
            onLeaveBack: () => setNav(true),
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
          .to(chatBtn.current, { autoAlpha: 0, duration: 0.2 }, 1.1)
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

        // Keyboard users land inside the scene they jumped to.
        const focusFor = (label: string): HTMLElement | null | undefined =>
          ({
            intro: intro.current?.querySelector<HTMLElement>("h1"),
            about: about.current?.querySelector<HTMLElement>("h2"),
            dash: dash.current?.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]'),
            cta: ctaPanel.current?.querySelector<HTMLElement>("a"),
          })[label];

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
          goTo(label, { focus: () => focusFor(label) });
        };
        document.addEventListener("click", onAnchorClick);

        // Scrolling yourself takes over from a scripted glide or a pending auto-advance,
        // and records which way you're going.
        const takeOver = () => {
          // a fresh gesture (not a continuation, not mid-glide) starts from the nearest scene
          if (!travel && performance.now() - lastInput > 600 && tl.scrollTrigger) {
            origin = nearestStop(tl.scrollTrigger.progress);
          }
          cancelAuto();
          travel?.kill();
          settleCall?.kill();
          settleCall = null;
          lastInput = performance.now();
        };
        let touchY = 0;
        const onWheel = (e: WheelEvent) => {
          takeOver();
          if (e.deltaY) lastDir = e.deltaY > 0 ? 1 : -1;
        };
        const onTouchStart = (e: TouchEvent) => {
          takeOver();
          touchY = e.touches[0]?.clientY ?? 0;
        };
        const onTouchMove = (e: TouchEvent) => {
          lastInput = performance.now();
          const y = e.touches[0]?.clientY ?? touchY;
          if (Math.abs(y - touchY) > 2) lastDir = y < touchY ? 1 : -1;
          touchY = y;
        };
        const onKey = (e: KeyboardEvent) => {
          takeOver();
          if (["ArrowDown", "PageDown", "End"].includes(e.key) || (e.key === " " && !e.shiftKey)) lastDir = 1;
          if (["ArrowUp", "PageUp", "Home"].includes(e.key) || (e.key === " " && e.shiftKey)) lastDir = -1;
        };
        // A scrollbar drag has no wheel/touch: take its direction from the scroll itself.
        const onScrollDir = () => {
          if (travel || performance.now() - lastInput < SETTLE_DELAY) return;
          const d = tl.scrollTrigger?.direction;
          if (d) lastDir = d > 0 ? 1 : -1;
        };
        window.addEventListener("wheel", onWheel, { passive: true });
        window.addEventListener("touchstart", onTouchStart, { passive: true });
        window.addEventListener("touchmove", onTouchMove, { passive: true });
        window.addEventListener("keydown", onKey);
        window.addEventListener("scroll", onScrollDir, { passive: true });
        const onScrollEnd = () => {
          settle();
          if (scene === "center") armAuto();
        };
        ScrollTrigger.addEventListener("scrollEnd", onScrollEnd);

        removeLinkRelease = () => {
          window.removeEventListener("wheel", onWheel);
          window.removeEventListener("touchstart", onTouchStart);
          window.removeEventListener("touchmove", onTouchMove);
          window.removeEventListener("keydown", onKey);
          window.removeEventListener("scroll", onScrollDir);
          settleCall?.kill();
          ScrollTrigger.removeEventListener("scrollEnd", onScrollEnd);
          cancelAuto();
          travel?.kill();
        };

        ScrollTrigger.refresh();
      });

      // 3. Drop-in finished: slide aside + reveal intro.
      const entranceDone = contextSafe!(() => {
        if (flags.aside) return;
        flags.aside = true;
        // Three beats: heading (underline draws with "Ezekiel."), then the paragraph, then
        // everything you can act on lands together: buttons, navbar, speech bubble, scroll hint.
        const HEAD = 0.7;
        const LINE2 = HEAD + 0.12;
        const COPY = 1.25;
        const ACT = 1.5;
        const tl = gsap.timeline({ onComplete: enableScroll, defaults: { ease: "power3.out" } });
        tl.to(stage.current, { ...asidePose(), duration: 1.2, ease: "power3.inOut" })
          .set(intro.current, { autoAlpha: 1 }, HEAD)
          .from(".intro-line", { yPercent: 110, duration: 0.9, ease: "power4.out", stagger: LINE2 - HEAD }, HEAD)
          .fromTo(
            ".intro-underline",
            { strokeDashoffset: 1 },
            { strokeDashoffset: 0, duration: 0.9, ease: "power2.inOut" },
            LINE2,
          )
          .call(() => model.current?.react("Talk"), undefined, HEAD + 0.2)
          .from(".intro-copy", { autoAlpha: 0, y: 20, duration: 0.7 }, COPY)
          .from(".intro-actions", { autoAlpha: 0, y: 20, duration: 0.7 }, ACT)
          .fromTo(
            chatBtn.current,
            { autoAlpha: 0, y: 8, scale: 0.9, transformOrigin: "0% 100%" },
            { autoAlpha: 1, y: 0, scale: 1, duration: 0.6, ease: "back.out(1.5)" },
            ACT,
          )
          .to(scrollCue.current, { autoAlpha: 1, duration: 0.6 }, ACT);
        if (nav) tl.to(nav, { yPercent: 0, duration: 0.7 }, ACT);
        finish(tl);
      });

      // 2. Loader leaves once the name has shown AND the model is ready.
      const tryExit = contextSafe!(() => {
        if (!flags.nameShown || !(flags.modelReady || flags.waited) || flags.exited) return;
        flags.exited = true;
        try {
          sessionStorage.setItem(SEEN_KEY, "1");
        } catch {}
        // Model still loading: show the intro now; he drops in beside it when he arrives.
        const withoutModel = !flags.modelReady;
        const tl = gsap.timeline({ onComplete: () => withoutModel && entranceDone() });
        if (seen) tl.timeScale(1.8);
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
          gsap.delayedCall(MODEL_WAIT, () => {
            flags.waited = true;
            tryExit();
          });
        },
      });
      if (seen) tl.timeScale(2.5);
      tl.from(".loader-letter", { yPercent: 115, duration: 0.9, ease: "power4.out", stagger: 0.08 })
        .set(".loader-word", { visibility: "visible" }, 0)
        .fromTo(".loader-bar", { scaleX: 0 }, { scaleX: 0.7, duration: 1.4, ease: "power2.out" }, 0)
        .to({}, { duration: seen ? 0 : 0.3 });
      finish(tl);

      return () => {
        window.removeEventListener("resize", onResize);
        ScrollTrigger.removeEventListener("refresh", onRefresh);
        if (onAnchorClick) document.removeEventListener("click", onAnchorClick);
        removeLinkRelease?.();
        lockScroll(false);
      };
    },
    { scope },
  );

  const chatMotion = (open: boolean, fromHero: boolean) => {
    const phone = !window.matchMedia("(min-width: 1024px)").matches;
    chatIsOpen.current = open;
    if (open) {
      Object.assign(rig.current, phone ? FACE_PHONE : FACE_DESKTOP);
      turnBefore.current = rig.current.turn;
    }
    lockScroll(open);
    if (open) stageX.current = Number(gsap.getProperty(stage.current, "x"));
    const tl = gsap.timeline({ defaults: { overwrite: "auto" } });
    const layers = [textLayer.current, dashLayer.current, ctaInner.current];
    tl.to(
      rig.current,
      { face: open ? 1 : 0, turn: open ? 0 : turnBefore.current, duration: 1.1, ease: "power3.inOut" },
      0,
    )
      .to(stage.current, { x: open ? 0 : stageX.current, duration: 1.1, ease: "power3.inOut" }, 0)
      .to(layers, { autoAlpha: open ? 0 : 1, duration: 0.35 }, open ? 0 : 0.6);
    if (fromHero) {
      tl.to([chatBtn.current, scrollCue.current], { autoAlpha: open ? 0 : 1, duration: 0.3 }, open ? 0 : 0.7);
    }
    if (open) {
      tl.fromTo(
        chatLayer.current,
        { autoAlpha: 0, y: 30 },
        { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out" },
        0.45,
      );
    } else {
      tl.to(chatLayer.current, { autoAlpha: 0, y: 20, duration: 0.3, ease: "power2.in" }, 0);
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) tl.progress(1);
  };
  const fromHero = useRef(true);
  const openChat = (e: React.MouseEvent<HTMLElement>) => {
    opener.current = e.currentTarget;
    fromHero.current = e.currentTarget === chatBtn.current;
    setChatOpen(true);
    chatMotion(true, fromHero.current);
  };
  const closeChat = () => {
    setChatOpen(false);
    chatMotion(false, fromHero.current);
    // wait for the layers to fade back in: a hidden element can't take focus
    gsap.delayedCall(1, () => opener.current?.focus({ preventScroll: true }));
  };

  return (
    <div ref={scope}>
      {/* 1. Name loader */}
      <div
        ref={loader}
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background"
        aria-hidden
      >
        <div className="loader-word invisible flex overflow-hidden pb-[0.08em] pr-[0.08em] font-display text-[clamp(5rem,18vw,12rem)] font-extrabold leading-[0.95] tracking-[-0.03em] text-ink">
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
          <div
            ref={textLayer}
            className="relative mt-[47svh] w-full md:mx-auto md:max-w-xl lg:mx-0 lg:mt-0 lg:max-w-none"
          >
            <div
              ref={intro}
              className="invisible absolute inset-0 flex flex-col justify-start lg:justify-center"
            >
              <h1 tabIndex={-1} className="text-balance font-display outline-none text-[clamp(2.75rem,6vw,5.5rem)] font-bold leading-[0.98] tracking-[-0.022em]">
                <span className="block overflow-hidden pb-[0.06em]">
                  <span className="intro-line block">Hi, my name is</span>
                </span>
                <span className="block overflow-hidden pb-[0.22em]">
                  <span className="intro-line relative inline-block text-brand-600">
                    Ezekiel Bustamante.
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
              <p className="intro-copy mt-5 max-w-[42ch] text-base leading-7 text-muted sm:text-lg sm:leading-8">
                I&apos;m Zeke — a Computer Engineering student at PUP Manila building secure,
                full-stack web apps, with a soft spot for cybersecurity and programming.
              </p>
              <div className="intro-actions mt-8 flex flex-wrap gap-3">
                <Button href="#work">See my work</Button>
                <Button href="#contact" variant="outline">
                  Get in touch
                </Button>
              </div>
            </div>

            <div
              ref={about}
              className="invisible absolute inset-0 flex flex-col justify-start lg:justify-center"
            >
              <h2 tabIndex={-1} className="about-item text-balance font-display outline-none text-[clamp(2.25rem,4.4vw,3.75rem)] font-bold leading-[1.02] tracking-[-0.02em]">
                Secure by habit, <span className="text-brand-600">curious</span> by default.
              </h2>
              <p className="about-item mt-6 max-w-[46ch] text-base leading-7 text-muted sm:text-lg sm:leading-8">
                I wrote my first Hello World in 2024, before college even started. Since then
                I&apos;ve led technology teams across various organizations and shipped full-stack
                projects that placed at two hackathons. Now I&apos;m pointing that builder&apos;s
                mindset at security through pentesting courses and certifications, so what I ship
                holds up when someone tries to break it.
              </p>
              {/* Flex, not a 3-col grid: each fact keeps its natural width on one line and wraps whole. */}
              <dl className="about-item mt-8 flex flex-wrap gap-x-10 gap-y-4 border-t border-line pt-5">
                {aboutFacts.map((f) => (
                  <div key={f.label}>
                    <dt className="text-sm text-muted">{f.label}</dt>
                    <dd className="mt-1 whitespace-nowrap font-medium text-ink">{f.value}</dd>
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

        {/* Speech bubble from his head (sits over the model's column) */}
        <div className="pointer-events-none absolute inset-0 z-20 mx-auto grid max-w-6xl px-6 lg:grid-cols-2">
          <div className="relative">
            <button
              ref={chatBtn}
              type="button"
              onClick={openChat}
              aria-expanded={chatOpen}
              aria-label="Chat with Zeke"
              className="chat-bubble invisible pointer-events-auto absolute left-[calc(50%+3.75rem)] top-[11svh] rounded-[1.25rem] rounded-bl-[0.3rem] bg-ink px-4 py-2.5 font-display text-[15px] font-semibold tracking-[-0.01em] whitespace-nowrap text-background shadow-[0_14px_30px_-14px_rgba(11,31,20,0.6)] transition-colors hover:bg-action hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 lg:left-[calc(50%+7.5rem)] lg:top-[19svh] lg:text-base"
            >
              <span className="lg:hidden">Talk to me</span>
              <span className="hidden lg:inline">Psst — talk to me</span>
            </button>
          </div>
        </div>

        <div ref={chatLayer} className="invisible pointer-events-none absolute inset-0 z-30">
          <ZekeChat open={chatOpen} onClose={closeChat} onReply={() => model.current?.react("Talk")} />
        </div>

        <div ref={dashLayer} className="pointer-events-none absolute inset-0">
          <div className="mx-auto grid h-full max-w-[90rem] grid-rows-[minmax(0,32svh)_minmax(0,1fr)] px-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2.5fr)] lg:grid-rows-1 lg:gap-8 lg:px-8">
            <div ref={dashModelCol} className="relative">
              <div
                ref={caption}
                className="invisible pointer-events-auto absolute inset-x-0 bottom-2 flex items-center justify-center gap-2 lg:bottom-[8svh]"
              >
                <Subtitle
                  text={line.text}
                  cue={line.cue}
                  className="max-w-[40ch] rounded-xl bg-[#020604]/75 px-4 py-2.5"
                />
                <button
                  type="button"
                  onClick={openChat}
                  aria-label="Ask Zeke something"
                  title="Ask Zeke something"
                  className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#020604]/75 text-white transition-colors hover:bg-action"
                >
                  <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 5h16v11H9l-5 4z" />
                  </svg>
                </button>
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
                <div className="relative flex h-full w-full flex-col justify-between overflow-hidden rounded-3xl bg-card p-7 shadow-[0_40px_90px_-30px_rgba(0,0,0,0.6)] ring-1 ring-line sm:p-10 lg:h-[min(820px,calc(100svh-5rem))] lg:p-14">
                  <div className="slide-item flex items-center justify-between text-sm text-muted">
                    <span className="font-display text-lg font-extrabold tracking-[-0.03em] text-ink">
                      zeke<span className="text-brand-600">.</span>
                    </span>
                    <span>Ezekiel Bustamante</span>
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
                    <span>Cybersecurity · Software Developer</span>
                    <a href="#contact" className="pointer-events-auto text-ink underline decoration-brand-300 underline-offset-4 transition-colors hover:text-brand-700">Questions? Let&apos;s talk.</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div ref={ctaPanel} className="invisible pointer-events-none absolute inset-0">
          <div ref={ctaInner} className="mx-auto flex h-full max-w-6xl flex-col justify-center px-4 pb-6 pt-[32svh] lg:flex-row lg:items-center lg:justify-center lg:gap-12 lg:px-8 lg:pb-0 lg:pt-0">
            <div ref={ctaSlot} className="hidden h-full w-[min(26vw,340px)] shrink-0 lg:block" />
            <div className="pointer-events-auto max-w-[36rem]">
              <h2 className="cta-item max-w-[14ch] text-balance font-display text-[clamp(2.6rem,6vw,5.5rem)] font-bold leading-[0.96] tracking-[-0.03em] text-white">
                Let&apos;s build something <span className="text-brand-300">secure.</span>
              </h2>
              <p className="cta-item mt-6 max-w-[44ch] text-base leading-7 text-white/70 sm:text-lg sm:leading-8">
                Have a project, a hackathon team that needs a builder, or an internship in mind?
                My inbox is open.
              </p>
              <div className="cta-item mt-9 flex flex-wrap gap-3">
                <Button href={GMAIL} target="_blank" rel="noopener noreferrer" variant="light">
                  Email me
                </Button>
                <Button
                  href={LINKEDIN}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="outline"
                  className="border-white/20 text-white hover:border-white hover:text-white"
                >
                  LinkedIn
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
      {/* Holds the story's scroll length while it loads, so the scrollbar doesn't resize later */}
      <div ref={reserve} aria-hidden style={{ height: `${PIN_END * SCROLL_PER_UNIT * 100}svh` }} />
    </div>
  );
}
