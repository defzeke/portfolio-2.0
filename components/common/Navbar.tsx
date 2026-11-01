import Button from "@/components/ui/Button";
import ThemeToggle from "./ThemeToggle";

const links = [
  { href: "#about", label: "About" },
  { href: "#work", label: "Work" },
  { href: "#contact", label: "Contact" },
];

export default function Navbar() {
  return (
    <header
      data-nav
      data-tone="light"
      className="nav-shell fixed inset-x-0 top-0 z-50 border-b border-line/70 bg-background/80 backdrop-blur-md"
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <a href="#top" className="nav-logo font-display text-xl font-extrabold tracking-[-0.03em] text-ink">
          zeke<span className="text-brand-600">.</span>
        </a>
        <ul className="hidden items-center gap-8 text-sm sm:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="nav-link text-muted transition-colors hover:text-brand-700">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button href="#contact" className="h-10 px-4 sm:px-5">
            Lorem ipsum
          </Button>
        </div>
      </nav>
    </header>
  );
}
