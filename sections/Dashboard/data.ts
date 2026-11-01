export const projectCategories = ["Web", "Mobile", "3D", "Design"] as const;
export type ProjectCategory = (typeof projectCategories)[number];

export const projects: { title: string; category: ProjectCategory; body: string; tags: string[] }[] = [
  { title: "Lorem ipsum", category: "Web", body: "Dolor sit amet, consectetur adipiscing elit.", tags: ["Lorem", "Ipsum"] },
  { title: "Dolor sit", category: "Web", body: "Sed do eiusmod tempor incididunt ut labore.", tags: ["Dolor", "Sit"] },
  { title: "Amet consectetur", category: "Mobile", body: "Ut enim ad minim veniam, quis nostrud.", tags: ["Amet"] },
  { title: "Adipiscing elit", category: "3D", body: "Duis aute irure dolor in reprehenderit.", tags: ["Elit", "Sed"] },
  { title: "Sed eiusmod", category: "Design", body: "Excepteur sint occaecat cupidatat non.", tags: ["Tempor"] },
  { title: "Tempor incididunt", category: "Mobile", body: "Sunt in culpa qui officia deserunt.", tags: ["Labore", "Magna"] },
];

export const experienceCategories = ["Work", "Freelance", "Education", "Leadership"] as const;
export type ExperienceCategory = (typeof experienceCategories)[number];

export const experience: {
  role: string;
  org: string;
  period: string;
  category: ExperienceCategory;
  body: string;
}[] = [
  { role: "Lorem ipsum", org: "Dolor Inc.", period: "2025 — Now", category: "Work", body: "Consectetur adipiscing elit, sed do eiusmod tempor." },
  { role: "Sit amet", org: "Consectetur Co.", period: "2023 — 2025", category: "Work", body: "Ut enim ad minim veniam, quis nostrud exercitation." },
  { role: "Adipiscing elit", org: "Self-employed", period: "2022 — Now", category: "Freelance", body: "Duis aute irure dolor in reprehenderit in voluptate." },
  { role: "Sed do eiusmod", org: "Tempor University", period: "2020 — 2024", category: "Education", body: "Excepteur sint occaecat cupidatat non proident." },
  { role: "Incididunt ut", org: "Labore Society", period: "2021 — 2023", category: "Leadership", body: "Sunt in culpa qui officia deserunt mollit anim." },
];

export const stats = [
  { label: "Lorem ipsum", value: "12+" },
  { label: "Dolor sit", value: "04" },
  { label: "Amet elit", value: "30k" },
  { label: "Tempor", value: "99%" },
];

export const testimonials: { quote: string; name: string; role: string }[] = [
  {
    quote:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua — ut enim ad minim veniam.",
    name: "Lorem Ipsum",
    role: "Product Lead, Dolor Inc.",
  },
  {
    quote: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    name: "Amet Consectetur",
    role: "Founder, Adipiscing Co.",
  },
  {
    quote: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim.",
    name: "Sed Eiusmod",
    role: "Design Director, Tempor Studio",
  },
  {
    quote: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo.",
    name: "Magna Aliqua",
    role: "Engineering Manager, Labore",
  },
];

export const blogCategories = ["Design", "Engineering", "Career"] as const;
export type BlogCategory = (typeof blogCategories)[number];

export const blogs: {
  title: string;
  excerpt: string;
  category: BlogCategory;
  date: string;
  minutes: number;
  href: string;
}[] = [
  {
    title: "Lorem ipsum dolor sit amet, consectetur adipiscing",
    excerpt: "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.",
    category: "Engineering",
    date: "Oct 2026",
    minutes: 6,
    href: "#",
  },
  {
    title: "Quis nostrud exercitation ullamco laboris",
    excerpt: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.",
    category: "Design",
    date: "Sep 2026",
    minutes: 4,
    href: "#",
  },
  {
    title: "Excepteur sint occaecat cupidatat non proident",
    excerpt: "Sunt in culpa qui officia deserunt mollit anim id est laborum.",
    category: "Career",
    date: "Aug 2026",
    minutes: 8,
    href: "#",
  },
  {
    title: "Nemo enim ipsam voluptatem quia voluptas",
    excerpt: "Sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.",
    category: "Engineering",
    date: "Jul 2026",
    minutes: 5,
    href: "#",
  },
];

export const views = ["overview", "projects", "experience", "testimonials", "blogs"] as const;
export type View = (typeof views)[number];

export type InsightKey =
  | View
  | `projects:${ProjectCategory}`
  | `experience:${ExperienceCategory}`
  | `blogs:${BlogCategory}`;

export const insights: Record<InsightKey, string> = {
  overview: "Lorem ipsum dolor sit amet — pick a card and I'll walk you through it.",
  projects: "Consectetur adipiscing elit. These are the things I've built, sed do eiusmod tempor.",
  experience: "Ut enim ad minim veniam — here's where I've worked and what I learned.",
  testimonials: "Don't just take my word for it — lorem ipsum, here's what people say.",
  blogs: "I write things down too — lorem ipsum dolor, grab a coffee.",
  "blogs:Design": "Design notes: sed ut perspiciatis unde omnis iste natus.",
  "blogs:Engineering": "Engineering: at vero eos et accusamus et iusto odio dignissimos.",
  "blogs:Career": "Career: temporibus autem quibusdam et aut officiis debitis.",
  "projects:Web": "Web: lorem ipsum dolor sit amet, quis nostrud exercitation ullamco.",
  "projects:Mobile": "Mobile: duis aute irure dolor in reprehenderit in voluptate velit.",
  "projects:3D": "3D: excepteur sint occaecat cupidatat — like me, actually.",
  "projects:Design": "Design: sunt in culpa qui officia deserunt mollit anim id est laborum.",
  "experience:Work": "Work: sed ut perspiciatis unde omnis iste natus error sit voluptatem.",
  "experience:Freelance": "Freelance: nemo enim ipsam voluptatem quia voluptas sit aspernatur.",
  "experience:Education": "Education: neque porro quisquam est, qui dolorem ipsum quia dolor.",
  "experience:Leadership": "Leadership: quis autem vel eum iure reprehenderit qui in ea voluptate.",
};
