# 0004. Layered fallbacks for the 3D character

- **Status:** Accepted
- **Date:** 2026-11-03
- **Deciders:** Ezekiel Bustamante
- **Related:** [`sections/Hero/HeroScene.tsx`](../../sections/Hero/HeroScene.tsx),
  [`sections/Hero/HeroCanvas.tsx`](../../sections/Hero/HeroCanvas.tsx),
  [`app/page.tsx`](../../app/page.tsx), [system overview §4.9](../system-overview.md#49-fallbacks)

## Context

The character is load-bearing. He is the guide: the camera dives into his mouth to enter the dashboard,
and he stands beside every scene. If he fails to appear, the story has no protagonist — but the
**dashboard, the CTA, and the contact details must still be reachable**.

Failure modes are genuinely different, which rules out one global fallback:

1. No WebGL at all (old hardware, locked-down browser, headless screenshotting, some VMs).
2. WebGL exists but the context is lost or the renderer throws.
3. The 4 MB GLB is slow (mobile data) or 404s.
4. The visitor asks for reduced motion.

## Decision

Four independent layers, each handling one failure:

| Layer | Trigger | Behaviour |
| --- | --- | --- |
| **Poster** | `hasWebGL()` returns false | `<img src="/images/zeke-poster.png">` bottom-aligned at 80% height, and it calls `onReady()` + `onEntranceComplete()` so the story proceeds normally |
| **Error boundary** | Anything inside `<Canvas>` throws | `SceneBoundary` renders the same poster |
| **Model timeout** | Loader has shown and 2.5 s passed without `onReady` | Intro proceeds without the model; the character drops in when `onReady` finally fires |
| **Reduced motion** | `prefers-reduced-motion: reduce` | `skipEntrance` — no drop-in, no idle gestures; timelines jump to their end |

`HeroCanvas` is `dynamic(..., { ssr: false })` so no WebGL code is evaluated during SSR, and the
poster is the only thing that can render without a browser context.

## Consequences

### Good

- **The story is always complete.** Every path ends with the visitor able to reach the dashboard, the
  CTA, and the footer.
- The poster is a real visual (transparent PNG on the design-canvas grid), not a grey box — the page
  still looks intentional on a machine that cannot run it.
- The timeout means a slow connection degrades to "he arrives late" rather than "the page is stuck".
- Fallbacks are cheap: one 361 KB image, one class component, one `setTimeout`.

### Costs

- **The poster is a second asset to keep in sync** with the model's framing, lighting, and pose. Change
  the model or the camera and the fallback silently becomes wrong.
- **The timeout path briefly shows a scene without its character**, and the entrance animation has to
  be idempotent (`flags.aside` guard) because it can be triggered by either the model or the timeout.
- **`onReady`/`onEntranceComplete` are called from a fallback**, which means the poster must understand
  the story's lifecycle. That is a coupling between an "image" and the timeline.
- WebGL detection is optimistic: it checks for a context but not whether the GPU can sustain it. A
  device that technically supports WebGL but renders at 5 fps will still get the canvas.
- No runtime downshift: once the canvas is mounted there is no automatic fallback to the poster if the
  frame rate collapses.

## Alternatives considered

- **Require WebGL.** Simplest, and acceptable for a personal site — but the story's payoff (the
  dashboard) would be unreachable for a meaningful slice of visitors, including link previews and
  screenshot bots.
- **A static image hero for everyone.** Would remove the product's differentiator.
- **Progressive enhancement: server-rendered static hero that upgrades to 3D.** The correct long-term
  answer, and it would also fix the no-JS problem in [known issues](../known-issues.md#4-robustness-and-accessibility),
  but it is a much larger refactor than a portfolio justifies today.
- **`<model-viewer>` / a prebuilt loader.** Less control over the camera rig, the dive, and the clip
  repairs, all of which are custom.
