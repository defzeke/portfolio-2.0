# 0005. Scroll lock that preserves the scrollbar

- **Status:** Accepted
- **Date:** 2026-11-03
- **Deciders:** Ezekiel Bustamante
- **Related:** [`sections/Hero/Hero.tsx`](../../sections/Hero/Hero.tsx) (`lockScroll`, `blockInput`,
  `holdPosition`), [`app/globals.css`](../../app/globals.css) (`html { overflow-y: scroll }`),
  [system overview §3.7](../system-overview.md#37-scroll-lock)

## Context

The intro must not be interrupted by scrolling: the loader, the 2.5 s model wait, and the drop-in are a
single sequence. The chat panel must also lock the page while it is open, or a wheel gesture scrolls the
story behind the dialog.

The standard technique is `document.body.style.overflow = "hidden"`. It removes the scrollbar, which
narrows the viewport by ~15 px. In this project that is not cosmetic:

- The 3D stage is positioned and measured against the layout (`offsetToCentre`, `asidePose`), and a
  width change mid-animation makes the **character visibly jump**.
- `ScrollTrigger` measures the pinned element on creation; a width change forces a re-measure and can
  shift every scene boundary.
- When the lock releases, everything jumps back.

## Decision

Lock by **intercepting input and holding position**, never by removing the scrollbar.

`html { overflow-y: scroll }` keeps the scrollbar present on every page at all times, so width is
constant with or without the lock.

`lockScroll(on)`:

1. Records `window.scrollY` in `lockedAt`.
2. Sets `data-scroll-locked` on `<html>` (a hook, currently unused by CSS).
3. Adds non-passive `wheel`, `touchmove`, and `keydown` listeners that `preventDefault()`.
   Exceptions: key events targeting `input`, `textarea`, or `[contenteditable]`; wheel/touch events
   inside `.scroll-quiet` (the dashboard panel, which must stay scrollable).
4. Adds a `scroll` listener that forces the position back if anything moved it.

## Consequences

### Good

- **Zero layout shift** when the lock engages or releases — the original bug.
- The dashboard remains usable while the page is locked, because `.scroll-quiet` is exempted. This is
  what lets the chat and the dashboard coexist.
- Keyboard users can still type in the chat input; only scrolling keys are blocked.
- The same function serves both use cases (intro and chat), so there is one behaviour to reason about.

### Costs

- **It is a coarse instrument.** Blocking `wheel`/`touchmove` at `window` also blocks pinch-zoom on
  some mobile browsers and any wheel-based custom scroll inside the page that is not `.scroll-quiet`.
- **`data-scroll-locked` is currently dead.** Either style something with it or remove it.
- **The exemptions are string-matched** (`closest("input, textarea, [contenteditable]")`,
  `closest(".scroll-quiet")`). A new scrollable region must remember to opt in by class name.
- `overflow-y: scroll` on `html` reserves scrollbar width even on pages short enough not to need it —
  fine for a one-page site, wrong for a site with intentionally short pages.
- The `scroll` handler forcing position back is a loop-guard, not a lock: scripted scrolls still work
  (which is what the GSAP glide needs) and must be sequenced around the lock deliberately.
- Nothing here handles nested scroll containers beyond one level of `.scroll-quiet`.

## Alternatives considered

- **`overflow: hidden` on body.** The default. Reintroduces the width jump that breaks the stage
  positioning.
- **`scrollbar-gutter: stable` with `overflow: hidden`.** Modern and elegant, but it still changes the
  scrollable height and forces a ScrollTrigger re-measure; support was not universal enough to rely on
  at the time.
- **A full-screen overlay with `touch-action: none`.** Works for touch, not for wheel or keyboard, and
  still requires the position hold.
- **Disabling the pin until the intro ends** (no lock at all). Visitors would scroll past the intro
  before it plays, which defeats the sequence.
