export const projectCategories = ["Web", "Mobile", "Game", "AI"] as const;
export type ProjectCategory = (typeof projectCategories)[number];

export type Project = {
  title: string;
  /** Filter groups this project shows under (first one is the label on the card). */
  categories: ProjectCategory[];
  date?: string;
  body: string;
  tags: string[];
  /** Omitted for unreleased work; the card then shows "Coming soon". */
  href?: string;
  /** Screenshot in public/images/projects. */
  image?: string;
  /** CSS object-position for the screenshot crop (default: top). */
  focus?: string;
  award?: string;
};

export const projects: Project[] = [
  {
    title: "VerdePM",
    categories: ["Web", "AI"],
    date: "Dec 2025",
    body: "An ESG-focused tool that tracks construction-site carbon emissions, with AI (RAG) that drafts compliance-ready ESG documentation.",
    tags: ["Full-stack", "RAG", "ESG"],
    href: "https://verdepm.vercel.app/",
    image: "/images/projects/verdepm.png",
    award: "1st Runner-Up · PUP Hackathon",
  },
  {
    title: "Blockbayan",
    categories: ["Web"],
    date: "Oct 2025",
    body: "A transparent natural-disaster fundraising platform on the blockchain, so donors can track where every peso goes.",
    tags: ["Blockchain", "Fundraising"],
    href: "https://github.com/Carlthegreatt/blockbayan",
    image: "/images/projects/blockbayan.png",
    focus: "50% 55%",
    award: "Top 8 of 32 · ICTO Hackathon",
  },
  {
    title: "AlgoHub",
    categories: ["Web", "Game"],
    date: "Dec 2025",
    body: "A gamified platform for studying data structures and algorithms through interactive challenges and progress tracking.",
    tags: ["Gamified", "DSA"],
    href: "https://algohub-dsa.vercel.app/",
    image: "/images/projects/algohub.png",
  },
  {
    title: "Arduino Day Philippines Registration",
    categories: ["Web"],
    date: "Jan 2026",
    body: "Registration and ticketing for Arduino Day Philippines 2026, with QR-code tickets and real-time check-in.",
    tags: ["Ticketing", "QR check-in"],
    href: "https://join.arduinodayphilippines.cc/",
    image: "/images/projects/adphreg.png",
  },
  {
    title: "Inkflow",
    categories: ["Web"],
    date: "Feb 2026",
    body: "Turns Markdown and HTML files into polished, shareable web pages in one step.",
    tags: ["Markdown", "Publishing"],
    href: "https://inkflowstudio.vercel.app/",
    image: "/images/projects/inkflow.png",
  },
  {
    title: "FrameIt",
    categories: ["Web"],
    date: "Nov 2025",
    body: "A watermark-free frame overlay tool for profile pictures, built with privacy and simplicity first.",
    tags: ["Image tool", "Privacy"],
    href: "https://frame.arduinodayphilippines.cc/",
    image: "/images/projects/frameit.png",
  },
  {
    title: "PyTracker",
    categories: ["Web"],
    date: "Sept 2025",
    body: "A Flask roll-call system that tracks attendance, absences and tardiness, with PDF report export.",
    tags: ["Flask", "Python"],
    href: "https://github.com/defzeke/PyTracker",
    image: "/images/projects/pytracker.png",
  },
  {
    title: "ICPEP SE PUP",
    categories: ["Web"],
    date: "Sept 2025",
    body: "The official website of ICPEP Student Edition PUP Manila, a central hub for member resources.",
    tags: ["Organization site"],
    href: "https://icpepsepupmanila.vercel.app/",
    image: "/images/projects/icpep.png",
  },
  {
    title: "AWS Community Day PH 2026",
    categories: ["Web"],
    body: "The official site for AWS Community Day Philippines 2026: speakers, program, venue, and tickets for a two-day cloud event in BGC.",
    tags: ["Event site", "AWS CloudFront"],
    href: "https://d1wkpvmblfnixb.cloudfront.net/",
    image: "/images/projects/awscd.png",
  },
  {
    title: "AqWaNet",
    categories: ["Web", "Mobile"],
    body: "An early-warning system for shrimp ponds that maps ammonia levels and flags water before it turns toxic.",
    tags: ["IoT", "Aquaculture", "Monitoring"],
    href: "https://aqwanetio-1.onrender.com/map",
    image: "/images/projects/aqwanet.png",
  },
  {
    title: "SnapGrid",
    categories: ["Web"],
    body: "The ICPEP photobooth: pick a layout, snap your photos, and share a transit-themed strip in seconds.",
    tags: ["Photobooth", "Camera"],
    href: "https://icpep-photobooth.vercel.app/grid-layout-selection",
    image: "/images/projects/snapgrid.png",
  },
  {
    title: "Kuizmon",
    categories: ["Game", "Mobile", "AI"],
    body: "A virtual pet game: raise your companion, then take it on a review quest with Kuiz, built from the study materials you upload.",
    tags: ["Godot", "GDScript", "Gamified learning"],
    href: "https://github.com/defzeke/Studymon",
    image: "/images/projects/kuizmon.png",
    focus: "50% 62%",
  },
  {
    title: "APCTT",
    categories: ["AI"],
    body: "An AI that assesses a technology's Technology Readiness Level (TRL).",
    tags: ["AI", "TRL assessment"],
    href: "https://github.com/defzeke/apctt",
    image: "/images/projects/apctt.jpg",
  },
  {
    title: "Anino, Ang Daan Pauwi",
    categories: ["Game"],
    body: "A visual novel about the Bataan Death March.",
    tags: ["Visual novel", "Under NDA"],
    image: "/images/projects/anino.png",
  },
  {
    title: "Anino, Ang Daan Pauwi (RPG)",
    categories: ["Game"],
    body: "The RPG companion to the Anino visual novel, set on the Bataan Death March.",
    tags: ["RPG", "Under NDA"],
    image: "/images/projects/aninorpg.png",
  },
];

export const experienceCategories = ["Career", "Leadership", "Competitive", "Volunteers", "Education"] as const;
export type ExperienceCategory = (typeof experienceCategories)[number];

export const experience: {
  role: string;
  org: string;
  period: string;
  category: ExperienceCategory;
  current?: boolean;
  /** One line on what came of it, shown under the org. */
  detail?: string;
}[] = [
  // Any order: the timeline sorts by start date and puts ongoing roles first within each year.
  { role: "Application / Game Developer", org: "Tutorials Dojo · Collab", period: "Aug 2026 – Present", category: "Career", current: true },
  { role: "AVP for Technology", org: "ICPEP SE · PUP Manila", period: "Aug 2026 – Present", category: "Leadership", current: true },
  { role: "DevNet Co-Lead", org: "Cisco NetConnect PUP", period: "Aug 2026 – Present", category: "Leadership", current: true },
  { role: "Frontend Developer · CloudFrame", org: "AWS Community Day 2026", period: "Aug 2026", category: "Volunteers" },
  { role: "Software Engineer", org: "DOST – Advanced Science and Technology Institute", period: "Jul – Sep 2026", category: "Career" },
  { role: "Web Infrastructure Specialist", org: "Arduino Day Philippines 2026", period: "Mar 2026", category: "Volunteers" },
  { role: "Full-stack Developer", org: "Agama", period: "Jan 2026 – Present", category: "Career", current: true },
  { role: "AVP for Technology", org: "CyberPH", period: "Jan – Jun 2026", category: "Leadership", detail: "Promoted from the Research and Development team." },
  { role: "Partnership Lead", org: "CyberPH Packet Capture 2026", period: "Sep 2026", category: "Volunteers" },
  { role: "1st Runner-Up", org: "PUP Hackathon: UtHack ang Puhunan", period: "Dec 2025", category: "Competitive", detail: "Built VerdePM: construction carbon tracking with RAG-drafted ESG documentation." },
  { role: "Top 8 of 32 teams", org: "ICTO Hackathon · PUP Technology Festival 2025", period: "Oct 2025", category: "Competitive", detail: "Built Blockbayan with Team CICADA: transparent disaster-relief fundraising on the blockchain." },
  { role: "Head of Infrastructure and Governance", org: "ICPEP SE · PUP Manila", period: "2025", category: "Leadership" },
  { role: "Vice Chief Administrative Officer", org: "Cisco NetConnect PUP", period: "2025", category: "Leadership" },
  { role: "Cybersecurity Cadet", org: "Google Developer Groups PUP", period: "2025", category: "Leadership" },
  { role: "Research and Development Team", org: "CyberPH", period: "2025", category: "Leadership" },
  { role: "Technical Team Member", org: "PUP Hygears", period: "2025", category: "Leadership" },
  { role: "BS Computer Engineering", org: "Polytechnic University of the Philippines · expected 2028", period: "2024 – Present", category: "Education", current: true },
  { role: "STEM", org: "Far Eastern University Roosevelt", period: "2022 – 2024", category: "Education" },
];

export const certifications: { name: string; org: string; href: string }[] = [
  { name: "GitHub Foundations", org: "Microsoft · Feb 2026", href: "https://learn.microsoft.com/en-us/users/ezekielgbustamante-2585/credentials/fdf60902c2b547db" },
  { name: "Understanding Artificial Intelligence", org: "DataCamp", href: "https://www.datacamp.com/completed/statement-of-accomplishment/course/374559bf52986c8fec6750fe738e9ce3d39097bd" },
  { name: "Intermediate GitHub Concepts", org: "DataCamp", href: "https://www.datacamp.com/completed/statement-of-accomplishment/course/8189e822c36269be3db21ced9217445b8a175b7d" },
  { name: "Introduction to GitHub Concepts", org: "DataCamp", href: "https://www.datacamp.com/completed/statement-of-accomplishment/course/36832c8fb72cef46fe6b4e72aaf76e1cf5863591" },
  { name: "Intermediate Git", org: "DataCamp", href: "https://www.datacamp.com/completed/statement-of-accomplishment/course/d3ad7b2cd2fabc2c9233bf972caeb75a20245524" },
  { name: "Introduction to Git", org: "DataCamp", href: "https://www.datacamp.com/completed/statement-of-accomplishment/course/3519da1b60883deae329bb5f3afdd7caa85d5647" },
];

/** The Overview's main card: Zeke himself, not a single project. */
export const profile = {
  name: "Ezekiel Bustamante",
  role: "Cybersecurity & Full-stack Developer",
  location: "Metro Manila, PH",
};

/** `icon` is a file in public/icons/stack (without .svg). */
export const stack: { group: string; items: { name: string; icon: string }[] }[] = [
  {
    group: "Frontend, Mobile & Languages",
    items: [
      { name: "Next.js", icon: "nextjs" },
      { name: "React", icon: "react" },
      { name: "TypeScript", icon: "typescript" },
      { name: "JavaScript", icon: "javascript" },
      { name: "Flutter", icon: "flutter" },
      { name: "Dart", icon: "dart" },
      { name: "Tailwind CSS", icon: "tailwindcss" },
      { name: "Vite", icon: "vitejs" },
    ],
  },
  {
    group: "Backend & Architecture",
    items: [
      { name: "Python", icon: "python" },
      { name: "FastAPI", icon: "fastapi" },
      { name: "Flask", icon: "flask" },
      { name: "Node.js", icon: "nodejs" },
    ],
  },
  {
    group: "Databases, Cloud & DevOps",
    items: [
      { name: "PostgreSQL", icon: "postgresql" },
      { name: "Neon", icon: "neon" },
      { name: "Supabase", icon: "supabase" },
      { name: "MySQL", icon: "mysql" },
      { name: "Firebase", icon: "firebase" },
      { name: "Docker", icon: "docker" },
      { name: "Grafana", icon: "grafana" },
      { name: "AWS", icon: "aws" },
      { name: "Google Cloud", icon: "googlecloud" },
      { name: "Vercel", icon: "vercel" },
    ],
  },
  {
    group: "Security",
    items: [
      { name: "Burp Suite", icon: "burpsuite" },
      { name: "Nmap", icon: "nmap" },
      { name: "Kali Linux", icon: "kalilinux" },
    ],
  },
];

// No written recommendations yet: the tab says they're available on request.
export const testimonials: { quote: string; name: string; role: string }[] = [];

export const blogCategories = ["Career", "Projects", "Hackathons"] as const;
export type BlogCategory = (typeof blogCategories)[number];

/** Write-ups. Entries without an href are shown as "coming soon". */
export const blogs: {
  title: string;
  excerpt: string;
  category: BlogCategory;
  date?: string;
  minutes?: number;
  href?: string;
}[] = [
  {
    title: "1st Runner-Up at PUP Hackathon: UtHack ang Puhunan",
    excerpt: "How VerdePM came together: carbon tracking, RAG-generated ESG papers, and a very long weekend.",
    category: "Hackathons",
  },
  {
    title: "From my first line of code in 2024 to leading infrastructure",
    excerpt: "A year of student orgs, cybersecurity, and learning in public.",
    category: "Career",
  },
];

export const views = ["overview", "projects", "experience", "certifications", "blogs", "testimonials"] as const;
export type View = (typeof views)[number];

export type InsightKey =
  | View
  | `projects:${ProjectCategory}`
  | `experience:${ExperienceCategory}`
  | `blogs:${BlogCategory}`;

/** What Zeke says (subtitle under the model) for each thing you press in the dashboard. */
export const insights: Record<InsightKey, string> = {
  overview: "This is my corner. Pick a tab and I'll walk you through it.",
  projects: "Things I've shipped, mostly for the web. Click any project to open it live.",
  experience: "Student orgs are where I learned to lead, and to keep systems from breaking.",
  certifications: "I like proving it on paper too: Git, GitHub, and AI so far.",
  blogs: "Write-ups are on the way. Hackathons first, I promise.",
  testimonials: "Testimonials are on the way. References are available upon request.",
  "projects:Web": "The web is home: Next.js, Supabase, and a lot of Tailwind.",
  "projects:Mobile": "AqWaNet watches shrimp ponds from your phone, and Kuizmon goes wherever you study.",
  "projects:Game": "AlgoHub, Kuizmon, and Anino, a visual novel and RPG about the Bataan Death March.",
  "projects:AI": "VerdePM took 1st Runner-Up with RAG. Kuizmon and APCTT put AI to work too.",
  "experience:Career": "Full-stack at Agama, game dev with Tutorials Dojo, and a software engineering stint at DOST-ASTI.",
  "experience:Leadership": "AVP for Technology at ICPEP SE, DevNet co-lead at Cisco NetConnect, and AVP at CyberPH before that.",
  "experience:Competitive": "Hackathons and CTFs. 1st Runner-Up at the PUP Hackathon, Top 8 at ICTO, and more on the way.",
  "experience:Volunteers": "Arduino Day PH, AWS Community Day, and partnerships for CyberPH Packet Capture.",
  "experience:Education": "Computer Engineering at PUP Manila, graduating 2028. STEM at FEU Roosevelt before that.",
  "blogs:Career": "How a first line of code turned into all of this.",
  "blogs:Projects": "Project write-ups are on the way.",
  "blogs:Hackathons": "The PUP Hackathon story comes first. More soon.",
};
