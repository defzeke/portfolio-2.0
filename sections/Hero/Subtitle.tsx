"use client";

import { useRef } from "react";
import gsap from "gsap";
import { TextPlugin } from "gsap/TextPlugin";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(TextPlugin);

type Props = {
  text: string;
  /** Bump to replay the line even when the text is unchanged. */
  cue: number;
  className?: string;
};

export default function Subtitle({ text, cue, className = "" }: Props) {
  const line = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      if (!line.current) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) {
        line.current.textContent = text;
        return;
      }
      gsap.fromTo(
        line.current,
        { text: "" },
        { text, duration: Math.min(2.2, text.length * 0.026), ease: "none", overwrite: true },
      );
    },
    { dependencies: [text, cue] },
  );

  return (
    <p className={`text-pretty text-center text-[15px] leading-6 text-white/90 ${className}`}>
      <span className="mr-1.5 font-semibold text-brand-300">Zeke</span>
      <span ref={line} aria-hidden />
      <span className="sr-only" aria-live="polite">
        {text}
      </span>
    </p>
  );
}
