# 0001. One pinned scroll story instead of routed pages

- **Status:** Accepted
- **Date:** 2026-11-03
- **Deciders:** Ezekiel Bustamante
- **Related:** [`sections/Hero/Hero.tsx`](../../sections/Hero/Hero.tsx),
  [`app/page.tsx`](../../app/page.tsx), [product brief §2](../product-brief.md#2-the-story)

## Context

A portfolio has four conventional shapes: a long scrolling page with sections, a set of routes
(`/about`, `/work`, `/contact`), a slide deck, or a "desktop" metaphor with windows.

The brief was different: the site should be *about* a character, and the character should feel present
rather than embedded in a header image. That requires the camera, the copy, and the navigation to move
together. Sections that merely scroll past cannot do that — the character would have to be re-framed
per section, and the visitor controls timing.

Existing constraints: no CMS, no backend, no content that needs its own URL, and a single author whose
work is already hosted elsewhere (Vercel, GitHub).

## Decision

Build the entire site as **one route whose scroll position is a timeline**. `ScrollTrigger` pins the
hero for 8.64 viewports and scrubs a GSAP timeline; the timeline's seven labels *are* the site's
navigation. Anchor links (`#about`, `#work`, `#contact`) are intercepted and turned into glides to
timeline labels.

There are no additional routes. `#work` and `#contact` are semantics for the story handler, not DOM
anchors.

## Consequences

### Good

- The character can be continuously re-framed by one authority (the timeline) without React re-render
  churn. Camera state is plain numbers written into a ref.
- Transitions between "pages" are cinematic: the dive-into-the-mouth cut is only possible because the
  page never navigates.
- Content changes are single-file (`data.ts`) with no route wiring.
- Nothing to prefetch, no route-level loading states, no 404s.

### Costs

- **The page cannot be linked into the middle of the story.** A URL cannot point at the dashboard;
  `#work` is inert outside the handler.
- **JavaScript is mandatory.** Every scene starts hidden and is revealed by GSAP.
- **Navigation is custom**, so browser affordances (back/forward between sections, Ctrl+F landing,
  "open link in new tab") do not behave normally.
- **Scroll is no longer scroll.** Custom gating, auto-advance, and a scroll lock are all necessary
  consequences, and each is a source of edge cases on trackpads, touch, and keyboard.
- The story's length is fixed at build time; adding content means editing a timeline.

## Alternatives considered

- **Multi-route with a persistent canvas.** Keeps deep links, but every navigation tears down and
  re-frames the scene, and the dive/cut choreography becomes a route transition — much harder to make
  seamless with the App Router.
- **Sectioned one-pager with sticky character.** Simpler and linkable, but the character becomes
  decoration that happens to be sticky; the narrative framing is lost.
- **Slide deck (horizontal).** Strong for a pitch, poor for a portfolio a recruiter skims, and worse on
  mobile.

The current approach was chosen because the *experience* is the differentiator for a student portfolio
whose project list is short. Its costs are documented in [known issues](../known-issues.md#4-robustness-and-accessibility).
