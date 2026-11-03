# Project documentation

Ezekiel "Zeke" Bustamante's portfolio: a single-page, scroll-directed story where a clay-style 3D
character is both the guide and the author's avatar.

This is **not** a multi-route marketing site. There is exactly one route (`/`), and the page is
roughly 8.6 viewports tall while displaying only one section at a time. Most of the complexity lives
in three places:

| Area | Files | Why it's hard |
| --- | --- | --- |
| The scroll story | [`sections/Hero/Hero.tsx`](../sections/Hero/Hero.tsx) | A pinned GSAP timeline doubles as the page's navigation, with custom settle/skip gating |
| The 3D character | [`sections/Hero/ZekeModel.tsx`](../sections/Hero/ZekeModel.tsx), [`HeroScene.tsx`](../sections/Hero/HeroScene.tsx), [`clipFixes.ts`](../sections/Hero/clipFixes.ts) | Camera rig driven by scroll, hand-repaired animation clips, three fallback tiers |
| The dashboard | [`sections/Dashboard/`](../sections/Dashboard) | A fake desktop app inside a pinned scene, coupled back to the character's speech |

## Reading order

**New to the repo** — [product brief](./product-brief.md) → [system overview](./system-overview.md)
→ [runbook](./runbook.md).

**Changing visuals** — [design system](./design-system.md) → [decision 0002](./decisions/0002-css-variables-over-dark-variant.md).

**Changing motion, scroll, or the model** — [system overview](./system-overview.md) (§2–§4) →
[decisions](./decisions/README.md).

**Changing content** — [system overview §5](./system-overview.md#5-content-model) → edit
[`sections/Dashboard/data.ts`](../sections/Dashboard/data.ts).

**Before you ship** — [runbook §6](./runbook.md#6-pre-ship-checklist) →
[known issues](./known-issues.md).

## Documents

| Doc | Contents |
| --- | --- |
| [product-brief.md](./product-brief.md) | Audience, positioning, the seven-scene narrative, copy inventory |
| [design-system.md](./design-system.md) | Palette, typography, spacing, motion, component specs |
| [system-overview.md](./system-overview.md) | Stack, data flow, scroll engine, 3D pipeline, dashboard, theming, chat |
| [runbook.md](./runbook.md) | Dev/build/lint, asset inventory, browser support, deploy |
| [known-issues.md](./known-issues.md) | Current gaps and content discrepancies |
| [decisions/](./decisions/README.md) | Architecture decision records |

## Glossary

Terms used throughout these docs, and where they come from in code.

- **Scene** — one labelled stop in the story. Defined twice on purpose: `AT` (timeline seconds where
  content changes) and `SCENES` (progress thresholds used to *derive* the active scene). A scene name
  is one of `intro`, `about`, `moving`, `center`, `dive`, `dash`, `thanks`, `cta`.
- **Label** — a named position on the GSAP timeline (`intro`, `about`, `center`, `dark`, `dash`,
  `thanks`, `cta`). Glides target labels, not raw scroll offsets.
- **Pin** — `ScrollTrigger` holds the hero fixed while the timeline scrubs, so scrolling *animates*
  rather than moves the page.
- **Scrub** — the timeline's progress is tied to scroll position with 1.2s of smoothing, so it feels
  damped rather than 1:1.
- **Settle** — when you stop between two scenes, the page glides to whichever scene you were heading
  toward. Controlled by `SETTLE_THRESHOLD`, `SKIP_THRESHOLD`, and `SETTLE_DELAY`.
- **Rig** (`ZekeRig`) — a plain object of numbers that the page writes and the 3D scene reads each
  frame. It is the only channel between scroll and the character's camera.
- **Insight** — a key such as `projects` or `projects:AI`. Pressing something in the dashboard maps to
  one, and the character speaks the matching line.
- **Tone** — the navbar's `data-tone` (`light` / `dark`), flipped by the story so the bar stays legible
  over the dark ending.
- **Seen** — `sessionStorage["zeke:seen"]`. Return visitors get the loader and intro at 1.8×–2.5×
  speed.

## If you change X, update Y

| Change | Must also update |
| --- | --- |
| Scene timings (`AT`, `PIN_END`) | `SCENES` thresholds, [product brief §2](./product-brief.md#2-the-story), [system overview §3](./system-overview.md#3-scroll-story-engine) |
| A scene's copy | [product brief §3](./product-brief.md#3-copy-inventory) |
| Camera framings (`CAMERA_*`, `MOBILE_*`, `FACE_*`) | [system overview §4.3](./system-overview.md#43-camera-rig) |
| A colour token | [design system §1](./design-system.md#1-palette) |
| Add a project / blog / certificate | [`data.ts`](../sections/Dashboard/data.ts) **and** the matching `insights` entry |
| Replace the 3D model | [runbook §4](./runbook.md#4-replacing-the-3d-model) — bone names and clip names are hard-coded |
| `next.config.ts` flags | [system overview §1.5](./system-overview.md#15-build-configuration) and [known issues](./known-issues.md) |
