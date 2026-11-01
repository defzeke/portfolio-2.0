const navigate = [
  { label: "About", href: "#about" },
  { label: "Work", href: "#work" },
  { label: "Contact", href: "#contact" },
];

const elsewhere = [
  { label: "GitHub", href: "#" },
  { label: "LinkedIn", href: "#" },
  { label: "Dribbble", href: "#" },
];

const EMAIL = "hello@example.com";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#03100a] text-white">
      <div className="relative mx-auto max-w-7xl px-6 pt-20 lg:px-8 lg:pt-28">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <div>
            <a
              href={`mailto:${EMAIL}`}
              className="group inline-flex items-center gap-3 font-display text-[clamp(1.9rem,4vw,3.25rem)] font-bold leading-none tracking-[-0.025em] transition-colors hover:text-brand-300"
            >
              {EMAIL}
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                className="size-[0.7em] shrink-0 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M7 17 17 7M8 7h9v9" />
              </svg>
            </a>
            <p className="mt-5 max-w-[40ch] text-base leading-7 text-white/65">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
              incididunt ut labore.
            </p>
          </div>

          <FooterList title="Navigate" items={navigate} />
          <FooterList title="Elsewhere" items={elsewhere} external />
        </div>

        <div className="mt-20 flex flex-col-reverse items-start justify-between gap-6 border-t border-white/10 py-7 text-sm text-white/55 sm:flex-row sm:items-center">
          <p>© 2026 Ezekiel. Lorem ipsum dolor sit amet.</p>
          <a
            href="#top"
            className="group inline-flex items-center gap-2 text-white/75 transition-colors hover:text-brand-300"
          >
            Back to top
            <span className="flex size-8 items-center justify-center rounded-full border border-white/15 transition-colors group-hover:border-brand-300">
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 19V5M6 11l6-6 6 6" />
              </svg>
            </span>
          </a>
        </div>
      </div>

      {/* Sign-off: the wordmark from the loader and hero, sunk into the floor */}
      <div aria-hidden className="pointer-events-none select-none overflow-hidden">
        <p className="-mb-[0.18em] text-center font-display text-[clamp(7rem,27vw,26rem)] font-extrabold leading-[0.8] tracking-[-0.04em] text-white/[0.05]">
          zeke<span className="text-brand-500/25">.</span>
        </p>
      </div>
    </footer>
  );
}

function FooterList({
  title,
  items,
  external = false,
}: {
  title: string;
  items: { label: string; href: string }[];
  external?: boolean;
}) {
  return (
    <nav aria-label={title}>
      <h2 className="text-sm text-white/50">{title}</h2>
      <ul className="mt-4 space-y-3">
        {items.map((i) => (
          <li key={i.label}>
            <a
              href={i.href}
              {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="text-lg text-white/85 transition-colors hover:text-brand-300"
            >
              {i.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
