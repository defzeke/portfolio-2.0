"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

type Message = { from: "you" | "zeke"; text: string };

const GREETING = "Hey, I'm Zeke! Ask me about my projects, hackathons, or what I'm learning.";

const REPLIES = [
  "Good question! My brain isn't plugged in yet — for now, email me at onlyzekedotcom@gmail.com.",
  "I can't answer that one just yet. Try the Work section, or reach me on LinkedIn.",
  "Real answers are coming soon. Meanwhile, VerdePM is my favorite thing I've built.",
  "Still learning to talk! The quickest way to reach the real me: onlyzekedotcom@gmail.com.",
];

type Props = {
  open: boolean;
  onClose: () => void;
  /** Fired every time Zeke replies, so the model can talk. */
  onReply: () => void;
};

export default function ZekeChat({ open, onClose, onReply }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const greeted = useRef(false);
  const replyIndex = useRef(0);
  const timers = useRef<number[]>([]);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  const zekeSays = (text: string) => {
    setTyping(false);
    setMessages((m) => [...m, { from: "zeke", text }]);
    onReply();
  };

  useEffect(() => {
    if (!open) return;
    later(() => input.current?.focus({ preventScroll: true }), 650);
    if (!greeted.current) {
      greeted.current = true;
      later(() => setTyping(true), 500);
      later(() => zekeSays(GREETING), 1300);
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key !== "Tab" || !root.current) return;
      const focusable = root.current.querySelectorAll<HTMLElement>("button:not([disabled]), input");
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    const t = timers.current;
    return () => t.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    list.current?.scrollTo({ top: list.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const send = (e: FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text || typing) return;
    setMessages((m) => [...m, { from: "you", text }]);
    setDraft("");
    setTyping(true);
    const reply = REPLIES[replyIndex.current++ % REPLIES.length];
    later(() => zekeSays(reply), 900 + Math.random() * 600);
  };

  return (
    <div ref={root} role="dialog" aria-modal="true" aria-label="Chat with Zeke" className="relative flex h-full flex-col">
      <button
        type="button"
        onClick={onClose}
        aria-label="Close chat"
        className="pointer-events-auto absolute right-4 top-20 flex size-11 items-center justify-center rounded-full border border-line bg-card/90 text-ink backdrop-blur transition-colors hover:border-brand-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 lg:right-10 lg:top-24"
      >
        <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      </button>

      <div className="pointer-events-auto mx-auto mt-auto w-full max-w-2xl px-4 pb-5 lg:pb-8">
        <div
          ref={list}
          aria-live="polite"
          className="chat-fade scroll-quiet max-h-[34svh] space-y-2.5 overflow-y-auto overscroll-contain pb-1 pt-8"
        >
          {messages.map((m, i) => (
            <p
              key={i}
              className={`w-fit max-w-[85%] rounded-2xl px-4 py-2.5 text-[15px] leading-6 ${
                m.from === "you"
                  ? "ml-auto rounded-br-md bg-action text-white"
                  : "rounded-bl-md border border-line bg-card/90 text-ink backdrop-blur"
              }`}
            >
              {m.text}
            </p>
          ))}
          {typing && (
            <p
              role="status"
              className="flex w-fit gap-1 rounded-2xl rounded-bl-md border border-line bg-card/90 px-4 py-3.5 backdrop-blur"
            >
              <span className="sr-only">Zeke is typing…</span>
              {[0, 150, 300].map((d) => (
                <span
                  key={d}
                  className="size-1.5 animate-pulse rounded-full bg-muted motion-reduce:animate-none"
                  style={{ animationDelay: `${d}ms` }}
                />
              ))}
            </p>
          )}
        </div>

        <form
          onSubmit={send}
          className="mt-3 flex items-center gap-2 rounded-full border border-line bg-card/95 p-1.5 pl-5 shadow-[0_18px_40px_-20px_rgba(11,31,20,0.45)] backdrop-blur focus-within:border-brand-600"
        >
          <input
            ref={input}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Ask Zeke something…"
            aria-label="Message"
            className="chat-input h-11 min-w-0 flex-1 bg-transparent text-[15px] text-ink placeholder:text-muted"
          />
          <button
            type="submit"
            aria-label="Send"
            disabled={!draft.trim() || typing}
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-action text-white transition-colors hover:bg-action-hover disabled:opacity-40"
          >
            <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
