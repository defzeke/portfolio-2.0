"use client";

import { useState } from "react";
import {
  blogCategories,
  blogs,
  experience,
  experienceCategories,
  projectCategories,
  projects,
  stats,
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
  const open = (v: View) => {
    setView(v);
    onInsight?.(v);
  };

  return (
    <div
      className={`@container/window flex flex-col overflow-hidden rounded-3xl bg-card shadow-[0_40px_90px_-30px_rgba(0,0,0,0.6)] ${className}`}
    >
      <div className="flex shrink-0 items-center gap-2 border-b border-line px-5 py-3">
        <span className="size-3 rounded-full bg-brand-200" />
        <span className="size-3 rounded-full bg-brand-300" />
        <span className="size-3 rounded-full bg-brand-500" />
        <span className="ml-3 font-mono text-xs text-muted">zeke / {view}</span>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)] grid-rows-[auto_1fr] @3xl/window:grid-cols-[180px_minmax(0,1fr)] @3xl/window:grid-rows-1">
        <aside className="min-w-0 border-b border-line p-3 @3xl/window:border-b-0 @3xl/window:border-r">
          <ul
            className="-mx-1 flex gap-1 overflow-x-auto px-1 [scrollbar-width:none] @3xl/window:mx-0 @3xl/window:flex-col @3xl/window:overflow-visible @3xl/window:px-0"
            role="tablist"
            aria-label="Dashboard views"
          >
            {nav.map((n) => {
              const active = view === n.id;
              return (
                <li key={n.id} className="flex-none @xl/window:flex-1 @3xl/window:flex-none">
                  <button
                    role="tab"
                    aria-selected={active}
                    onClick={() => open(n.id)}
                    className={`flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm transition-colors @3xl/window:justify-start @3xl/window:gap-3 @3xl/window:px-3 ${
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

        <div className="scroll-quiet @container min-h-0 overflow-y-auto overscroll-contain p-5 @3xl/window:p-7" role="tabpanel">
          {view === "overview" && <Overview onOpen={open} />}
          {view === "projects" && <Projects onInsight={onInsight} />}
          {view === "experience" && <Experience onInsight={onInsight} />}
          {view === "testimonials" && <Testimonials />}
          {view === "blogs" && <Blogs onInsight={onInsight} />}
        </div>
      </div>
    </div>
  );
}

function Overview({ onOpen }: { onOpen: (v: View) => void }) {
  return (
    <div>
      <div className="grid grid-cols-2 gap-3 @lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-line p-4">
            <p className="text-xs text-muted">{s.label}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-3 @lg:grid-cols-2">
        <CategoryCard
          title="Projects"
          body="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
          items={projectCategories}
          onClick={() => onOpen("projects")}
          dark
        />
        <CategoryCard
          title="Experience"
          body="Sed do eiusmod tempor incididunt ut labore et dolore."
          items={experienceCategories}
          onClick={() => onOpen("experience")}
        />
      </div>
    </div>
  );
}

function CategoryCard({
  title,
  body,
  items,
  onClick,
  dark = false,
}: {
  title: string;
  body: string;
  items: readonly string[];
  onClick: () => void;
  dark?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`group flex flex-col rounded-2xl p-6 text-left transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 ${
        dark ? "bg-brand-800 text-white" : "border border-brand-200 bg-brand-50 text-ink"
      }`}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">{title}</h3>
        <span
          className={`flex size-9 items-center justify-center rounded-full transition-transform group-hover:translate-x-1 ${
            dark ? "bg-white/10" : "bg-card"
          }`}
        >
          <Icon d="M5 12h14M13 6l6 6-6 6" />
        </span>
      </div>
      <p className={`mt-2 text-sm leading-6 ${dark ? "text-white/75" : "text-muted"}`}>{body}</p>
      <div className="mt-6 flex flex-wrap gap-2">
        {items.map((i) => (
          <span
            key={i}
            className={`rounded-full px-3 py-1 text-xs ${
              dark ? "bg-white/10 text-brand-300" : "bg-card text-brand-700"
            }`}
          >
            {i}
          </span>
        ))}
      </div>
    </button>
  );
}

function Projects({ onInsight }: { onInsight?: Insight }) {
  const [filter, setFilter] = useState<ProjectCategory | "All">("All");
  const pick = (f: ProjectCategory | "All") => {
    setFilter(f);
    onInsight?.(f === "All" ? "projects" : `projects:${f}`);
  };
  const shown = filter === "All" ? projects : projects.filter((p) => p.category === filter);

  return (
    <div>
      <Filters options={["All", ...projectCategories]} value={filter} onChange={pick} />
      <div className="mt-6 grid gap-3 @sm:grid-cols-2 @3xl:grid-cols-3">
        {shown.map((p) => (
          <article key={p.title} className="flex flex-col rounded-2xl border border-line p-4">
            <div className="aspect-[16/10] rounded-xl bg-gradient-to-br from-brand-100 to-brand-300" />
            <p className="mt-4 font-mono text-[11px] uppercase tracking-wider text-brand-600">
              {p.category}
            </p>
            <h3 className="mt-1 font-semibold">{p.title}</h3>
            <p className="mt-1 text-sm leading-6 text-muted">{p.body}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {p.tags.map((t) => (
                <span key={t} className="rounded-md bg-surface px-2 py-0.5 text-xs text-muted">
                  {t}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function Experience({ onInsight }: { onInsight?: Insight }) {
  const [filter, setFilter] = useState<ExperienceCategory | "All">("All");
  const pick = (f: ExperienceCategory | "All") => {
    setFilter(f);
    onInsight?.(f === "All" ? "experience" : `experience:${f}`);
  };
  const shown = filter === "All" ? experience : experience.filter((e) => e.category === filter);

  return (
    <div>
      <Filters options={["All", ...experienceCategories]} value={filter} onChange={pick} />
      <ol className="mt-6 space-y-3">
        {shown.map((e) => (
          <li
            key={e.role + e.org}
            className="grid gap-2 rounded-2xl border border-line p-5 @lg:grid-cols-[140px_1fr]"
          >
            <div>
              <p className="font-mono text-xs text-muted">{e.period}</p>
              <span className="mt-2 inline-block rounded-full bg-brand-50 px-2.5 py-0.5 text-xs text-brand-700">
                {e.category}
              </span>
            </div>
            <div>
              <h3 className="font-semibold">
                {e.role} <span className="font-normal text-muted">· {e.org}</span>
              </h3>
              <p className="mt-1 text-sm leading-6 text-muted">{e.body}</p>
            </div>
          </li>
        ))}
      </ol>
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
      <ul className="mt-6 divide-y divide-line border-y border-line">
        {shown.map((b) => (
          <li key={b.title}>
            <a
              href={b.href}
              className="group grid gap-2 py-5 @lg:grid-cols-[120px_1fr_auto] @lg:items-start @lg:gap-6"
            >
              <p className="text-sm text-muted">
                <span className="tabular-nums">{b.date}</span>
                <span className="block text-xs">{b.minutes} min read</span>
              </p>
              <div>
                <span className="text-xs font-medium text-brand-700">{b.category}</span>
                <h3 className="mt-1 text-pretty font-semibold leading-snug text-ink transition-colors group-hover:text-brand-700">
                  {b.title}
                </h3>
                <p className="mt-1 max-w-[60ch] text-sm leading-6 text-muted">{b.excerpt}</p>
              </div>
              <span className="hidden size-9 items-center justify-center rounded-full border border-line text-muted transition-colors group-hover:border-brand-600 group-hover:text-brand-700 @lg:flex">
                <Icon d="M7 17 17 7M8 7h9v9" />
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Testimonials() {
  const [featured, ...rest] = testimonials;
  return (
    <div className="grid gap-3 @2xl:grid-cols-2">
      <figure className="flex flex-col justify-between gap-8 rounded-2xl bg-brand-800 p-6 text-white @2xl:col-span-2 @2xl:p-8">
        <QuoteMark className="size-9 text-brand-300" />
        <blockquote className="max-w-[52ch] text-pretty font-display text-xl font-semibold leading-snug tracking-[-0.01em] @2xl:text-2xl">
          {featured.quote}
        </blockquote>
        <Person name={featured.name} role={featured.role} dark />
      </figure>
      {rest.map((t) => (
        <figure key={t.name} className="flex flex-col justify-between gap-6 rounded-2xl border border-line p-5">
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
          className={`min-h-10 rounded-full px-4 py-2 text-sm transition-colors ${
            value === o
              ? "bg-brand-600 text-white"
              : "border border-line text-muted hover:border-brand-300 hover:text-ink"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
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
