# Design system

Everything visual resolves to tokens declared in [`app/globals.css`](../app/globals.css). Tailwind v4
reads them through `@theme`, so `bg-background`, `text-muted`, `border-line`, and `text-brand-700` are
generated utilities — not hard-coded values. **If a colour is not a token, it is a bug** (the few
deliberate exceptions are listed in §1.2).

---

## 1. Palette

### 1.1 Semantic tokens

The palette is "white + green" in light mode and "forest night" in dark. Six semantic tokens carry the
UI; the brand ramp and two action colours do the rest.

| Token | Light | Dark | Role |
| --- | --- | --- | --- |
| `background` | `#FFFFFF` | `#07120C` | Page |
| `surface` | `#F3FAF5` | `#0D1D14` | Soft panels, empty states, hover fills |
| `card` | `#FFFFFF` | `#0F2117` | Windows, slides, bubbles, inputs |
| `ink` | `#0B1F14` | `#E6F2EA` | Primary text |
| `muted` | `#5C6F63` | `#93A99B` | Secondary text, metadata |
| `line` | `#E1ECE4` | `#1D3326` | Borders, dividers, rings |

### 1.2 Brand ramp and actions

| Token | Value | Notes |
| --- | --- | --- |
| `brand-50` → `brand-900` | `#EFFDF3` … `#0B2E1A` | Standard green ramp |
| `action` | `#15803D` | Filled buttons. Same in both themes |
| `action-hover` | `#166534` | Hover state |
| `brand-600` | `#16A34A` | Accent: the `.` in `zeke.`, links, focus rings |
| `brand-800` | `#14532D` | Deep panels (dark testimonial card) |

**Rule:** `action` is the only green used behind white text, because it clears 4.5:1 in both themes.
`brand-600` is for accents and icons, never for white text on green.

**Tint inversion:** in dark mode `brand-50/100/200` become dark greens and `brand-700` becomes
`#4ADE80`. This is why components always say `bg-brand-50 text-brand-700` rather than picking a
literal shade — the pair flips together and keeps contrast.

### 1.3 Deliberate hard-coded colours

Four places intentionally bypass the tokens, all because they sit *outside* the themeable page:

| Where | Value | Why |
| --- | --- | --- |
| Story's dark world (`dark`, `floor`, `blackout`) | `#03100A`, `#020604`, gradient stops from `#14532D`/`#0B2E1A` | Fixed art direction; dark in both themes |
| CTA text | `text-white`, `text-white/70` | On the fixed dark world |
| Subtitle chip | `bg-[#020604]/75` | Legible over the character |
| Footer | `bg-[#03100A]`, `text-white/*` | Continues the dark world past the story |

If you add UI to the dark ending, use white alphas (`text-white/65`, `border-white/10`) rather than
`muted`/`line` — those would flip to dark-mode values and disappear.

---

## 2. Typography

| Face | CSS variable | Used for |
| --- | --- | --- |
| **Bricolage Grotesque** (`wght`, `opsz`, `wdth`) | `--font-display-face` → `font-display` | Headlines, wordmark, slide titles, large numerals |
| **Geist** | `--font-geist-sans` → `font-sans` | Body, UI, buttons |
| **Geist Mono** | `--font-geist-mono` → `font-mono` | URL chips in project previews |

Bricolage is chosen because it gets chunky at large optical sizes, matching the clay-toy character. It
is never used below ~15px except in the wordmark.

### 2.1 Display scale

All display sizes use `clamp()` so they scale without media queries.

| Element | Size | Leading | Tracking |
| --- | --- | --- | --- |
| Loader wordmark | `clamp(5rem, 18vw, 12rem)` | `0.95` | `-0.03em` |
| Intro `h1` | `clamp(2.75rem, 6vw, 5.5rem)` | `0.98` | `-0.022em` |
| About `h2` | `clamp(2.25rem, 4.4vw, 3.75rem)` | `1.02` | `-0.02em` |
| Closing slide `h2` | `clamp(2.4rem, 6.5vw, 6.25rem)` | `0.92` | `-0.03em` |
| CTA `h2` | `clamp(2.6rem, 6vw, 5.5rem)` | `0.96` | `-0.03em` |
| Footer email | `clamp(1.6rem, 6.2vw, 4.5rem)` | `1` | `-0.025em` |
| Hero watermark | `clamp(12rem, 30vw, 30rem)` | `0.8` | `-0.04em` |
| Footer watermark | `clamp(7rem, 27vw, 26rem)` | `0.8` | `-0.04em` |

Display weights are `font-bold` for headlines and `font-extrabold` for the wordmark. Tracking is
always negative; large type without negative tracking looks loose in this design.

### 2.2 Body scale

| Use | Classes |
| --- | --- |
| Lead paragraph | `text-base leading-7 sm:text-lg sm:leading-8`, `text-muted` |
| Card body | `text-sm leading-6`, `text-muted` |
| Metadata | `text-xs font-medium uppercase tracking-wider`, `text-brand-700` |
| Label | `text-sm`, `text-muted` |
| Dialogue | `text-[15px] leading-6` |

Two `text-pretty` / `text-balance` conventions: `text-balance` on headlines, `text-pretty` on
paragraphs and quotes. Both are used deliberately — do not remove them.

### 2.3 The `zeke.` wordmark

The logotype is `<span>zeke</span><span class="text-brand-600">.</span>`, always `font-display
font-extrabold tracking-[-0.03em]`. The period is always `brand-600` on light surfaces and `brand-300`
on dark ones. It appears four times: loader, navbar, dashboard title bar, closing slide — plus twice
huge as decoration (hero ground, footer floor).

---

## 3. Space and layout

### 3.1 Container widths

| Area | Width |
| --- | --- |
| Story text | `max-w-6xl` (72rem, `px-6`) |
| Dashboard | `max-w-[90rem]` (`px-4`, `lg:px-8`) |
| Footer | `max-w-7xl` (`px-6`, `lg:px-8`) |

The story text grid is two columns on desktop (`lg:grid-cols-2`): an empty left column that the
character occupies, and a right column holding the panels. `leftCol` is measured at runtime so the
model can be centred on it — the layout and the 3D are coupled through that empty div, not through
magic numbers.

On phones the text layer starts at `mt-[47svh]`, leaving the top ~40% for the character.

### 3.2 Rhythm

- Panel gaps: `gap-8` / `gap-10` in dashboard grids, `space-y-3` inside definition lists.
- Section separation: `border-t border-line pt-5` for fact rows, `divide-y divide-line` for lists.
- Buttons: `gap-3`, `mt-8` / `mt-9` from the preceding paragraph.
- Navbar: `h-12` pills, `pt-3` from the top (clears `pt-16` content); dashboard title bar `px-5 py-3`.

### 3.3 Radii

| Token | Used on |
| --- | --- |
| `rounded-full` | Buttons, filter chips, avatars, icon buttons |
| `rounded-3xl` (24px) | Dashboard window, closing slide |
| `rounded-2xl` (16px) | Testimonial cards, empty states, chat bubbles |
| `rounded-xl` (12px) | Project previews, active tab |
| `rounded-[1.25rem]` | Speech bubble (with one `rounded-bl-[0.3rem]` for the tail side) |

### 3.4 Elevation

Elevation is tinted, not neutral — shadows carry the page's green-black rather than pure black.

| Element | Shadow |
| --- | --- |
| Dashboard window, closing slide | `0 40px 90px -30px rgba(0,0,0,0.6)` + `ring-1 ring-line` |
| Speech bubble | `0 14px 30px -14px rgba(11,31,20,0.6)` |
| Chat input pill | `0 18px 40px -20px rgba(11,31,20,0.45)` |

Everything else is flat. Only three surfaces float.

---

## 4. Motion

Motion is the product here, so the numbers are part of the design system.

### 4.1 Tokens

| Token | Value | Meaning |
| --- | --- | --- |
| `SCRUB_SMOOTHING` | `1.2` s | Scroll → timeline damping |
| `SCROLL_PER_UNIT` | `1.2` | Viewports of scroll per timeline unit |
| `PIN_END` | `7.2` | Timeline length → 8.64 viewports |
| `SETTLE_THRESHOLD` | `0.15` | Fraction of a gap that commits to the next scene |
| `SKIP_THRESHOLD` | `0.5` | Fraction needed to skip over a scene |
| `SETTLE_DELAY` | `300` ms | Quiet time before settling |
| `AUTO_ADVANCE_DELAY` | `2` s | Pause on `center` before moving on |
| `AUTO_ADVANCE_DURATION` | `2.6` s | Glide into the dive |
| `BLEND_RATE` | `7` /s | Animation clip blend (≈95% in 0.43 s) |
| Typewriter | `0.026` s/char, max 2.2 s | Subtitle reveal |

### 4.2 Easings and durations

| Moment | Easing | Duration |
| --- | --- | --- |
| Stage slides aside after entrance | `power3.inOut` | 1.2 s |
| Headline lines rise | `power4.out` | 0.9 s, stagger 0.12 s |
| Underline stroke draws | `power2.inOut` | 0.9 s |
| Buttons / actions land | `power3.out` | 0.7 s |
| Scene glides (nav clicks) | `sine.inOut` | clamped 0.6–1.8 s |
| Dive into the mouth | `power1.in` | 1.2 s |
| Dashboard window rises | `expo.out` | 0.6 s |
| Panel content staggers | `power3.out` | 0.5 s, stagger 0.07–0.08 s |
| Navbar show / hide | `power3.out` / `power2.in` | 0.4 / 0.3 s |
| Chat dolly + layers | `power3.inOut` | 1.1 s |

**Arrival ease** for buttons, bubbles, and slide items: `power3.out`. **Exit ease** for anything
leaving: `power2.in`. Nothing bounces except the speech bubble (`back.out(1.5)` on first
appearance).

### 4.3 CSS animations

| Name | Use | Guard |
| --- | --- | --- |
| `cue` | Scroll hint bead down a hairline | `motion-reduce:animate-none` |
| `bubble-float` | Speech bubble idle float (3.2 s) | Disabled under `prefers-reduced-motion` |

### 4.4 Reduced motion

Reduced motion is handled **three** ways, and all three must be respected:

1. CSS `@media (prefers-reduced-motion: reduce)` for decorative loops.
2. `finish(tl)` in `Hero.tsx` — jumps GSAP timelines to `progress(1)`.
3. `skipEntrance` in `HeroScene.tsx` — no drop-in, no gestures.

Subtitles skip the typewriter entirely and set text directly.

---

## 5. Motifs

### 5.1 Design-canvas grids

Two grids signal "this is a canvas, not a website":

- `.hero-grid` — 56 px cells, brand-tinted hairlines, masked by a radial ellipse so it fades at the
  edges. Sits behind the character.
- `.ph-grid` — 24 px cells on `surface`, used as **project image placeholders**. Each placeholder
  shows the project's hostname in a mono chip. There are no screenshots in the repo.

Both are drawn with layered `linear-gradient`s, not images.

### 5.2 Oversized wordmarks

The `zeke.` wordmark appears at 12–30 rem as scenery: sinking below the hero ground (`brand-100/80`)
and below the footer floor (`white/[0.05]`). They are `aria-hidden`, `select-none`,
`pointer-events-none`, and `overflow-hidden` — never content.

---

## 6. Components

### 6.1 `Button` — [`components/ui/Button.tsx`](../components/ui/Button.tsx)

An `<a>`, always. There is no button variant; anything that isn't a link uses a `<button>` locally.

| Variant | Classes | Use |
| --- | --- | --- |
| `primary` (default) | `bg-action text-white hover:bg-action-hover` | Main action on light surfaces |
| `outline` | `border border-line text-ink hover:border-brand-600 hover:text-brand-700` | Secondary |
| `light` | `bg-white text-brand-800 hover:bg-brand-50` | On the dark ending |

Base: `inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-medium
transition-colors` + focus ring. Overrides come through `className` (navbar passes `h-10 px-4`).

### 6.2 Dashboard tabs

- Horizontal scroller on narrow containers, vertical rail at `@3xl/window` with a 180 px rail.
- Active: `bg-brand-50 font-medium text-brand-700`. Inactive: `text-muted hover:bg-surface
  hover:text-ink`.
- Roving `tabIndex` — only the selected tab is in the tab order.
- The horizontal rail uses a right-edge mask to hint at overflow.

### 6.3 `Filters`

Pill row, `min-h-11`, `aria-pressed`. Active is a filled green pill (`bg-action text-white`);
inactive is an outline that greens on hover. Filtering is the dashboard's only stateful content
control.

### 6.4 `Preview`

A placeholder "screenshot": `ph-grid`, `aspect-[16/10]` (or `2/1` when `large`), with a frosted
mono chip showing `new URL(href).hostname` minus `www.`. It links to the live project, so the
placeholder still does real work.

### 6.5 `Subtitle`

`Zeke` in `brand-300`, then the line in white/90, centred, on a `bg-[#020604]/75` chip. Types at
26 ms/char. The visible text is `aria-hidden`; a parallel `sr-only aria-live="polite"` carries the
real string so screen readers hear it instantly instead of per character.

### 6.6 Speech bubble

Ink-on-background inverted pill (`bg-ink text-background`, hover `bg-action text-white`), tail drawn
with a `::after` triangle inheriting `background`, plus the idle float. Rotates its copy from "Talk to
me" to "Psst — talk to me" at `lg`.

---

## 7. Accessibility rules

Non-negotiable in this codebase:

- **Focus**: `:focus-visible` gets `2px solid brand-600` at `2px` offset, globally, in `@layer base`.
  Never remove it — the chat input is the one sanctioned `outline: none`, and the surrounding pill
  shows `focus-within:border-brand-600` instead.
- **Touch targets**: interactive elements use `min-h-11` (44 px) or `size-11`.
- **Contrast**: `action` + white ≥ 4.5:1 both themes; `muted` on `surface`/`card` is deliberately
  lighter but never used for essential body copy on `background` at small sizes.
- **Selection**: `::selection` uses `brand-200` on `ink`.
- **Screen readers**: decorative SVG/grids/wordmarks are `aria-hidden`; the typed subtitle has an
  `sr-only` twin; the dashboard is a real `tablist`; the chat is `role="dialog" aria-modal="true"`
  with a manual focus trap.
- **Scrollbar**: `overflow-y: scroll` on `html` so page width never changes when the story locks.

---

## 8. Extension checklist

Before adding a component:

1. Can it be built from `surface` / `card` / `line` / `ink` / `muted` + one `brand-*` step? If yes, do
   that.
2. Does it need to sit on the dark ending? Then use white alphas, not theme tokens.
3. Does it move? Use an existing duration/easing pair from §4.2, and guard it with reduced motion.
4. Does it take an interaction? `min-h-11` and a visible focus ring.
5. Does it appear inside the pinned scene? Remember it must work while scroll is locked and while the
   stage is being transformed — avoid `position: fixed` inside `#top`.
