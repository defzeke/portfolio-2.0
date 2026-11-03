# 0002. Theme with CSS custom properties, not `dark:` variants

- **Status:** Accepted
- **Date:** 2026-11-03
- **Deciders:** Ezekiel Bustamante
- **Related:** [`app/globals.css`](../../app/globals.css), [`app/layout.tsx`](../../app/layout.tsx),
  [`components/common/ThemeToggle.tsx`](../../components/common/ThemeToggle.tsx)

## Context

The site needs light and dark themes, and it must render the correct one **before first paint** — a
flash of white on a dark-mode visitor is worse than no dark mode at all.

The conventional Tailwind approach is `dark:` variants driven by `prefers-color-scheme` or a `.dark`
class. That produces `dark:bg-…` on every element, and the theme is decided by the presence of a class
rather than by the value of a colour.

Two extra requirements pushed against it:

1. Half the page (the dive → dashboard → CTA → footer) is **dark in both themes**. A `dark:` variant
   system would need guards to *not* apply there.
2. The navbar has to change tone independently of the theme, based on where the story is.

## Decision

Define semantic tokens once in `@theme`, and override **the same custom properties** under
`:root[data-theme="dark"]`. Components reference tokens only (`bg-card`, `text-muted`, `border-line`).
No component contains a `dark:` variant.

`<html data-theme>` is set by a synchronous inline script in `<head>`, reading `localStorage` then
`prefers-color-scheme`. `<html>` ships with `data-theme="light"` plus `suppressHydrationWarning`.

Tone is a separate axis: `[data-nav][data-tone="dark"]` styles the navbar, written by the story — not
by the theme.

## Consequences

### Good

- **No flash.** The attribute is set before the first paint, and no React state is involved.
- **One declaration site per colour role.** Changing "what muted means" is one line.
- **Component classes are theme-agnostic**, so the dark ending can be written with white alphas
  without fighting the theme.
- Dark mode does not require the `dark` class to propagate through portals/absolutely positioned
  layers.
- `color-scheme: dark` makes native scrollbars and controls follow for free.

### Costs

- **You cannot see the dark value of a colour at the call site.** `text-brand-700` is green in light
  and a light green in dark; that inversion must be understood, not read.
- **Tokens must be complete.** A component that reaches for a literal hex escapes theming and will be
  wrong in one of the two themes.
- **`suppressHydrationWarning` on `<html>`** is a small correctness tax: React will not warn if the
  attribute genuinely mismatches.
- The badge/tint pairs (`bg-brand-50 text-brand-700`) are conventions, not enforced.

## Alternatives considered

- **Tailwind `dark:` variants with a class strategy.** Verbose, and the "always dark" region would need
  careful exclusion. Rejected for both reasons.
- **Two separate stylesheets / builds.** Doubles the surface area and cannot handle the mixed region.
- **`next-themes`.** Solves the flash, but still leads to `dark:` variants and adds a dependency for
  roughly fifteen lines of script.
