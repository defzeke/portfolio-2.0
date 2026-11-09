"use client";

import Image from "next/image";
import { useRef, useState, type KeyboardEvent } from "react";
import {
  blogCategories,
  blogs,
  certifications,
  experience,
  experienceCategories,
  profile,
  projectCategories,
  projects,
  stack,
  testimonials,
  type BlogCategory,
  type ExperienceCategory,
  type InsightKey,
  type ProjectCategory,
  type View,
} from "./data";

type Insight = (key: InsightKey) => void;

const nav: { id: View; label: string; icon: string }[] = [
  { id: "overview", label: "Overview", icon: "M4 5h7v7H4zM13 5h7v4h-7zM13 11h7v8h-7zM4 14h7v5H4z" },
  { id: "projects", label: "Projects", icon: "M3 7h18v12H3zM8 7V5h8v2" },
  { id: "experience", label: "Experience", icon: "M12 3v18M5 8h7M12 14h7" },
  { id: "certifications", label: "Certifications", icon: "M12 15a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM8.5 13.5 7 21l5-3 5 3-1.5-7.5" },
  {
    id: "blogs",
    label: "Blogs",
    icon: "M6 3h9l4 4v14H6zM14 3v5h5M9 12h7M9 16h7",
  },
  {
    id: "testimonials",
    label: "Testimonials",
    icon: "M4 5h16v11H9l-5 4zM8.5 9.5h7M8.5 12.5h4",
  },
];

export default function Dashboard({
  className = "",
  onInsight,
}: {
  className?: string;
  onInsight?: Insight;
}) {
  const [view, setView] = useState<View>("overview");
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const open = (v: View) => {
    setView(v);
    onInsight?.(v);
  };
  const onTabKey = (e: KeyboardEvent<HTMLUListElement>) => {
    const i = nav.findIndex((n) => n.id === view);
    const keys: Record<string, number> = {
      ArrowRight: i + 1,
      ArrowDown: i + 1,
      ArrowLeft: i - 1,
      ArrowUp: i - 1,
      Home: 0,
      End: nav.length - 1,
    };
    if (!(e.key in keys)) return;
    e.preventDefault();
    const next = (keys[e.key] + nav.length) % nav.length;
    open(nav[next].id);
    tabs.current[next]?.focus();
    tabs.current[next]?.scrollIntoView({ block: "nearest", inline: "nearest" });
  };

  return (
    <div
      className={`@container/window flex flex-col overflow-hidden rounded-3xl bg-card shadow-[0_40px_90px_-30px_rgba(0,0,0,0.6)] ring-1 ring-line ${className}`}
    >
      <div className="flex shrink-0 items-center gap-3 border-b border-line px-5 py-3">
        <span className="font-display text-base font-extrabold tracking-[-0.03em] text-ink">
          zeke<span className="text-brand-600">.</span>
        </span>
        <span className="text-sm text-muted">/ {nav.find((n) => n.id === view)?.label}</span>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)] grid-rows-[auto_1fr] @3xl/window:grid-cols-[180px_minmax(0,1fr)] @3xl/window:grid-rows-1">
        <aside className="min-w-0 border-b border-line p-3 @3xl/window:border-b-0 @3xl/window:border-r">
          <ul
            className="-mx-1 flex gap-1 overflow-x-auto px-1 [mask-image:linear-gradient(to_right,#000_82%,transparent)] [scrollbar-width:none] @3xl/window:mx-0 @3xl/window:flex-col @3xl/window:overflow-visible @3xl/window:px-0 @3xl/window:[mask-image:none]"
            role="tablist"
            aria-label="Dashboard views"
            onKeyDown={onTabKey}
          >
            {nav.map((n, i) => {
              const active = view === n.id;
              return (
                <li key={n.id} role="presentation" className="flex-none @xl/window:flex-1 @3xl/window:flex-none">
                  <button
                    ref={(el) => {
                      tabs.current[i] = el;
                    }}
                    id={`tab-${n.id}`}
                    role="tab"
                    aria-selected={active}
                    aria-controls="dashboard-panel"
                    tabIndex={active ? 0 : -1}
                    onClick={() => open(n.id)}
                    className={`flex min-h-11 w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm transition-colors @3xl/window:justify-start @3xl/window:gap-3 ${
                      active
                        ? "bg-brand-50 font-medium text-brand-700"
                        : "text-muted hover:bg-surface hover:text-ink"
                    }`}
                  >
                    <Icon d={n.icon} />
                    {n.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        <div
          id="dashboard-panel"
          role="tabpanel"
          aria-labelledby={`tab-${view}`}
          tabIndex={0}
          className="scroll-quiet @container min-h-0 overflow-y-auto overscroll-contain p-5 @3xl/window:p-7"
        >
          {view === "overview" && <Overview />}
          {view === "projects" && <Projects onInsight={onInsight} />}
          {view === "experience" && <Experience onInsight={onInsight} />}
          {view === "certifications" && <Certifications />}
          {view === "testimonials" && <Testimonials />}
          {view === "blogs" && <Blogs onInsight={onInsight} />}
        </div>
      </div>
    </div>
  );
}

const host = (url: string) => new URL(url).hostname.replace(/^www\./, "");

const external = { target: "_blank", rel: "noopener noreferrer" } as const;

/** The project's screenshot, or its address on the canvas grid when there is none. */
function Preview({ href, image, focus }: { href?: string; image?: string; focus?: string }) {
  return (
    <div aria-hidden className="ph-grid relative flex aspect-[16/10] items-end overflow-hidden rounded-xl p-4 ring-1 ring-line">
      {image ? (
        <Image
          src={image}
          alt=""
          fill
          sizes="(min-width: 1280px) 30vw, (min-width: 640px) 45vw, 100vw"
          style={{ objectPosition: focus ?? "top" }}
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none"
        />
      ) : (
        <span className="rounded-md bg-card/90 px-2 py-1 font-mono text-xs text-muted ring-1 ring-line">
          {href ? host(href) : "Coming soon"}
        </span>
      )}
    </div>
  );
}

// Counted from the data so the numbers never go stale.
const highlights = [
  { label: "Projects shipped", value: projects.filter((p) => p.href).length },
  { label: "Hackathon awards", value: projects.filter((p) => p.award).length },
  { label: "Certifications", value: certifications.length },
  { label: "Org roles", value: experience.filter((e) => e.category === "Leadership" || e.category === "Volunteers").length },
];

// Awards and the newest certifications: the proof points a recruiter scans for first.
const awards = experience.filter((e) => e.category === "Competitive");
const latestCerts = certifications.slice(0, 3);

function Overview() {
  return (
    <div className="space-y-6">
      <article className="rounded-2xl bg-surface p-6 ring-1 ring-line @2xl:p-8">
        <h3 className="font-display text-3xl font-bold tracking-[-0.025em] text-ink @2xl:text-4xl">
          {profile.name}
        </h3>
        <p className="mt-1.5 text-sm font-medium text-ink">
          {profile.role} <span className="text-muted">· {profile.location}</span>
        </p>
        <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-line pt-5 @lg:grid-cols-4">
          {highlights.map((h) => (
            <div key={h.label} className="flex flex-col-reverse">
              <dt className="mt-1 text-xs text-muted">{h.label}</dt>
              <dd className="font-display text-3xl font-bold tracking-[-0.02em] text-ink">{h.value}</dd>
            </div>
          ))}
        </dl>
      </article>

      <div className="space-y-6">
        <section aria-labelledby="proof-heading" className="rounded-2xl p-6 ring-1 ring-line @2xl:p-8">
          <h3 id="proof-heading" className="font-display text-lg font-bold tracking-[-0.01em] text-ink">
            Highlights
          </h3>
          <div className="mt-5 grid gap-6 @2xl:grid-cols-2">
            <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted">Hackathons</p>
          <ul className="mt-2.5 space-y-3">
            {awards.map((a) => (
              <li key={a.org} className="flex gap-3">
                <span aria-hidden className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-700">
                  <Icon d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4ZM7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3" />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-ink">{a.role}</span>
                  <span className="block text-sm text-muted">{a.org}</span>
                </span>
              </li>
            ))}
          </ul>
            </div>
            <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted">Certifications</p>
          <ul className="mt-2.5 space-y-3">
            {latestCerts.map((c) => (
              <li key={c.href}>
                <a href={c.href} {...external} className="group flex gap-3">
                  <span aria-hidden className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-700">
                    <Icon d="M12 15a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM8.5 13.5 7 21l5-3 5 3-1.5-7.5" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-ink transition-colors group-hover:text-brand-700">{c.name}</span>
                    <span className="block text-sm text-muted">{c.org}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
            </div>
          </div>
        </section>

        <section aria-labelledby="stack-heading" className="rounded-2xl p-6 ring-1 ring-line @2xl:p-8">
          <h3 id="stack-heading" className="font-display text-lg font-bold tracking-[-0.01em] text-ink">
            Stack
          </h3>
          <dl className="mt-5 space-y-5">
            {stack.map((g) => (
              <div key={g.group}>
                <dt className="text-xs font-medium uppercase tracking-wider text-muted">{g.group}</dt>
                <dd className="mt-2.5">
                  <ul className="flex flex-wrap gap-2">
                    {g.items.map((t) => (
                      <li
                        key={t.name}
                        className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-3 text-sm text-ink ring-1 ring-line transition-colors hover:ring-brand-300"
                      >
                        {/* White tile in both themes so dark logos (Next.js, Vercel) stay visible. */}
                        <span className="flex size-7 items-center justify-center rounded-md bg-white">
                          <Image src={`/icons/stack/${t.icon}.svg`} alt="" width={18} height={18} unoptimized className="size-[18px]" />
                        </span>
                        {t.name}
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </div>
  );
}

function Projects({ onInsight }: { onInsight?: Insight }) {
  const [filter, setFilter] = useState<ProjectCategory | "All">("All");
  const pick = (f: ProjectCategory | "All") => {
    setFilter(f);
    onInsight?.(f === "All" ? "projects" : `projects:${f}`);
  };
  const shown = filter === "All" ? projects : projects.filter((p) => p.categories.includes(filter));

  return (
    <div>
      <Filters options={["All", ...projectCategories]} value={filter} onChange={pick} />
      {shown.length === 0 ? (
        <Empty>Nothing in {filter} yet. It&apos;s next on the list.</Empty>
      ) : (
        <div className="mt-6 grid gap-x-4 gap-y-7 @sm:grid-cols-2 @3xl:grid-cols-3">
          {shown.map((p) => {
            // Unreleased (NDA) work has no link, so it renders as a plain card.
            const Card = p.href ? "a" : "div";
            return (
            <Card key={p.title} {...(p.href ? { href: p.href, ...external } : {})} className="group flex flex-col">
              {/* Hover: the card lifts, a gradient rises from the bottom so the screenshot still shows,
                  the description slides up over it and a status chip drops in. Touch screens (no hover)
                  get the description below the card instead. */}
              <div className="relative rounded-xl transition-[transform,box-shadow] duration-300 ease-out group-hover:-translate-y-1 group-hover:shadow-[0_22px_40px_-22px_rgba(11,31,20,0.55)] group-focus-visible:-translate-y-1 motion-reduce:transform-none">
                <Preview href={p.href} image={p.image} focus={p.focus} />
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl [@media(hover:none)]:hidden"
                >
                  <div className="absolute inset-0 bg-linear-to-t from-brand-900/95 via-brand-900/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100" />
                  <span className="absolute right-3 top-3 inline-flex -translate-y-1 items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-medium text-brand-900 opacity-0 shadow-sm transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
                    {p.href ? (
                      <>
                        Visit site
                        <Icon d="M7 17 17 7M8 7h9v9" />
                      </>
                    ) : (
                      "Coming soon"
                    )}
                  </span>
                  <p className="absolute inset-x-0 bottom-0 line-clamp-4 translate-y-3 p-4 text-[13px] leading-5 text-white opacity-0 transition duration-300 delay-75 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
                    {p.body}
                  </p>
                </div>
              </div>
              <p className="mt-4 flex flex-wrap gap-x-2 text-xs font-medium uppercase tracking-wider text-brand-700">
                {p.categories.join(" · ")}
                <span className="font-normal normal-case tracking-normal text-muted">
                  {p.href ? p.date : "Coming soon"}
                </span>
              </p>
              <h3 className="mt-1 font-semibold text-ink transition-colors group-hover:text-brand-700">{p.title}</h3>
              <p className="mt-1 text-sm leading-6 text-muted [@media(hover:hover)]:sr-only">{p.body}</p>
              {p.award && <p className="mt-2 text-sm font-medium text-ink">{p.award}</p>}
              <p className="mt-2 text-xs text-muted">{p.tags.join(" · ")}</p>
            </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

const CV_HREF = "/files/Bustamante,%20Ezekiel%20CV.pdf";

/** First four-digit year in a period like "Aug 2026" or "2025 – Present". */
const startYear = (period: string) => period.match(/\d{4}/)?.[0] ?? "";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** Start month 1–12 ("Jul – Sep 2026" → 7), or 0 when the period only gives a year. */
const startMonth = (period: string) => MONTHS.indexOf(period.match(/[A-Z][a-z]{2}/)?.[0] ?? "") + 1;

// Newest year first; within a year, ongoing roles on top, then latest start month.
const timeline = [...experience].sort(
  (a, b) =>
    +startYear(b.period) - +startYear(a.period) ||
    Number(!!b.current) - Number(!!a.current) ||
    startMonth(b.period) - startMonth(a.period),
);

function Experience({ onInsight }: { onInsight?: Insight }) {
  const [filter, setFilter] = useState<ExperienceCategory | "All">("All");
  const pick = (f: ExperienceCategory | "All") => {
    setFilter(f);
    onInsight?.(f === "All" ? "experience" : `experience:${f}`);
  };
  const shown = filter === "All" ? timeline : timeline.filter((e) => e.category === filter);
  const now = shown.filter((e) => e.current);
  const before = shown.filter((e) => !e.current);

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <Filters options={["All", ...experienceCategories]} value={filter} onChange={pick} />
        <a
          href={CV_HREF}
          download="Ezekiel-Bustamante-CV.pdf"
          aria-label="Download CV (PDF)"
          className="group relative inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-action text-white shadow-sm transition-colors hover:bg-action-hover"
        >
          <Icon d="M12 4v11m0 0-4-4m4 4 4-4M5 20h14" />
          <span
            role="tooltip"
            className="pointer-events-none absolute right-0 top-full z-10 mt-2 whitespace-nowrap rounded-md bg-ink px-2.5 py-1 text-xs font-medium text-background opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
          >
            Download CV
          </span>
        </a>
      </div>

      {shown.length === 0 ? (
        <Empty>Nothing in {filter} yet.</Empty>
      ) : (
        <div className="mt-6 space-y-8">
          {/* What I'm doing right now, as cards: the first thing a recruiter wants to know. */}
          {now.length > 0 && (
            <section aria-labelledby="exp-now">
              <h3 id="exp-now" className="text-xs font-medium uppercase tracking-wider text-muted">
                Right now
              </h3>
              <ul className="mt-3 grid gap-3 @xl:grid-cols-2">
                {now.map((e) => (
                  <li key={e.role + e.org + e.period} className="rounded-xl bg-surface p-4 ring-1 ring-line">
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="font-semibold text-ink">{e.role}</h4>
                      {filter === "All" && <Tag>{e.category}</Tag>}
                    </div>
                    <p className="mt-0.5 text-sm text-muted">{e.org}</p>
                    <p className="mt-3 flex items-center gap-2 text-xs font-medium tabular-nums text-brand-700">
                      <span aria-hidden className="relative flex size-2">
                        <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand-500/60 motion-reduce:animate-none" />
                        <span className="relative inline-flex size-2 rounded-full bg-brand-600" />
                      </span>
                      {e.period}
                    </p>
                    {e.detail && <p className="mt-2 text-sm leading-6 text-ink/80">{e.detail}</p>}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Everything before, newest first; the year sits in the gutter on its first row only. */}
          {before.length > 0 && (
            <section aria-labelledby="exp-before">
              <h3 id="exp-before" className="text-xs font-medium uppercase tracking-wider text-muted">
                {now.length > 0 ? "Before that" : "Experience"}
              </h3>
              <ol className="mt-3 border-t border-line">
                {before.map((e, i) => {
                  const year = startYear(e.period);
                  const firstOfYear = year !== startYear(before[i - 1]?.period ?? "");
                  return (
                    <li
                      key={e.role + e.org + e.period}
                      className={`grid grid-cols-[3.5rem_1fr] gap-x-4 py-3.5 @md:grid-cols-[4.5rem_1fr] ${
                        firstOfYear && i > 0 ? "border-t border-line" : ""
                      }`}
                    >
                      <span className="pt-0.5 font-display text-sm font-bold tabular-nums text-ink/40">
                        {firstOfYear ? year : ""}
                      </span>
                      <div>
                        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                          <h4 className="font-semibold text-ink">{e.role}</h4>
                          <span className="text-xs tabular-nums text-muted">{e.period}</span>
                        </div>
                        <p className="mt-0.5 flex flex-wrap items-center gap-2 text-sm text-muted">
                          {e.org}
                          {filter === "All" && <Tag>{e.category}</Tag>}
                        </p>
                        {e.detail && <p className="mt-1.5 max-w-[60ch] text-sm leading-6 text-ink/80">{e.detail}</p>}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function Certifications() {
  return (
    <div className="space-y-6">
      <p className="flex items-baseline gap-2.5 text-sm leading-6 text-muted">
        <span aria-hidden className="size-2 shrink-0 translate-y-[-1px] animate-pulse rounded-full bg-brand-500 motion-reduce:animate-none" />
        <span>
          <span className="font-medium text-ink">Cybersecurity courses and certs in progress.</span> This list is getting
          patched soon, no restart required.
        </span>
      </p>
      <ul className="divide-y divide-line border-y border-line">
        {certifications.map((c) => (
          <li key={c.href}>
            <a
              href={c.href}
              {...external}
              className="group flex min-h-11 items-center justify-between gap-4 py-4"
            >
              <span>
                <span className="block font-semibold text-ink transition-colors group-hover:text-brand-700">
                  {c.name}
                </span>
                <span className="text-sm text-muted">{c.org}</span>
              </span>
              <span className="flex shrink-0 items-center gap-1.5 text-sm text-muted transition-colors group-hover:text-brand-700">
                <span className="hidden @md:inline">View credential</span>
                <Icon d="M7 17 17 7M8 7h9v9" />
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Blogs({ onInsight }: { onInsight?: Insight }) {
  const [filter, setFilter] = useState<BlogCategory | "All">("All");
  const pick = (f: BlogCategory | "All") => {
    setFilter(f);
    onInsight?.(f === "All" ? "blogs" : `blogs:${f}`);
  };
  const shown = filter === "All" ? blogs : blogs.filter((b) => b.category === filter);

  return (
    <div>
      <Filters options={["All", ...blogCategories]} value={filter} onChange={pick} />
      {shown.length === 0 ? (
        <Empty>No {filter.toLowerCase()} write-ups yet.</Empty>
      ) : (
      <ul className="mt-6 divide-y divide-line border-y border-line">
        {shown.map((b) => {
          const body = (
            <>
              <p className="text-sm text-muted">
                {b.href ? (
                  <>
                    <span className="tabular-nums">{b.date}</span>
                    {b.minutes && <span className="block text-xs">{b.minutes} min read</span>}
                  </>
                ) : (
                  <span className="inline-block rounded-full bg-surface px-2.5 py-0.5 text-xs">Coming soon</span>
                )}
              </p>
              <div>
                <span className="text-xs font-medium text-brand-700">{b.category}</span>
                <h3 className="mt-1 text-pretty font-semibold leading-snug text-ink">{b.title}</h3>
                <p className="mt-1 max-w-[60ch] text-sm leading-6 text-muted">{b.excerpt}</p>
              </div>
            </>
          );
          const cls = "grid gap-2 py-5 @lg:grid-cols-[120px_1fr] @lg:items-start @lg:gap-6";
          return (
            <li key={b.title}>
              {b.href ? (
                <a href={b.href} className={`group ${cls}`}>
                  {body}
                </a>
              ) : (
                <div className={cls}>{body}</div>
              )}
            </li>
          );
        })}
      </ul>
      )}
    </div>
  );
}

function Testimonials() {
  if (testimonials.length === 0) {
    return (
      <Empty>
        Testimonials are being collected. Professional references are available upon request.{" "}
        <a
          href="https://mail.google.com/mail/?view=cm&fs=1&to=onlyzekedotcom@gmail.com&su=Reference%20request"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-brand-700 underline decoration-brand-300 underline-offset-4"
        >
          Request a reference
        </a>
      </Empty>
    );
  }
  const [first, ...rest] = testimonials;
  return (
    <div className="grid gap-3 @2xl:grid-cols-2">
      <figure className="flex flex-col justify-between gap-8 rounded-2xl bg-brand-800 p-6 text-white @2xl:col-span-2 @2xl:p-8">
        <QuoteMark className="size-9 text-brand-300" />
        <blockquote className="max-w-[52ch] text-pretty font-display text-xl font-semibold leading-snug tracking-[-0.01em] @2xl:text-2xl">
          {first.quote}
        </blockquote>
        <Person name={first.name} role={first.role} dark />
      </figure>
      {rest.map((t) => (
        <figure key={t.name} className="flex flex-col justify-between gap-6 rounded-2xl bg-surface p-5">
          <blockquote className="text-pretty leading-7 text-ink">
            <QuoteMark className="mb-3 size-6 text-brand-300" />
            {t.quote}
          </blockquote>
          <Person name={t.name} role={t.role} />
        </figure>
      ))}
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-6 flex min-h-40 items-center justify-center rounded-2xl bg-surface p-8 text-center text-sm leading-6 text-muted">
      <p className="max-w-[40ch]">{children}</p>
    </div>
  );
}

function Person({ name, role, dark = false }: { name: string; role: string; dark?: boolean }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);
  return (
    <figcaption className="flex items-center gap-3">
      <span
        aria-hidden
        className={`flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
          dark ? "bg-white/10 text-brand-300" : "bg-brand-50 text-brand-700"
        }`}
      >
        {initials}
      </span>
      <span className="text-sm leading-5">
        <span className={`block font-medium ${dark ? "text-white" : "text-ink"}`}>{name}</span>
        <span className={dark ? "text-white/65" : "text-muted"}>{role}</span>
      </span>
    </figcaption>
  );
}

function QuoteMark({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 32 24" className={className} fill="currentColor">
      <path d="M0 24V14.4C0 6.4 4.3 1.6 12 0l1.4 3.2C9 4.6 7 7.4 6.8 11H12v13H0Zm19 0V14.4C19 6.4 23.3 1.6 31 0l1 3.2c-4.4 1.4-6.4 4.2-6.6 7.8H31v13H19Z" />
    </svg>
  );
}

function Filters<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          aria-pressed={value === o}
          className={`min-h-11 rounded-full px-4 py-2 text-sm transition-colors ${
            value === o
              ? "bg-action text-white"
              : "border border-line text-muted hover:border-brand-300 hover:text-ink"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="shrink-0 rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-700 ring-1 ring-brand-100">
      {children}
    </span>
  );
}

function Icon({ d }: { d: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-4 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={d} />
    </svg>
  );
}
