# Runbook

How to run, change, and ship this site.

---

## 1. Requirements

| Tool | Version | Source |
| --- | --- | --- |
| Node.js | `>= 20.9.0` | `next` package `engines` |
| npm | any modern version | `package-lock.json` is committed |
| A WebGL-capable browser | Chrome/Edge/Firefox/Safari current | Needed for the 3D hero |

The project was last verified on Node 26.12.0 with Next 16.4.3.

---

## 2. Commands

```powershell
npm install          # first time only
npm run dev          # Next dev server (Turbopack) on http://localhost:3000
npm run build        # production build
npm run start        # serve the production build
npm run lint         # eslint (flat config, next/core-web-vitals + typescript)
```

There is **no test suite** and no `test` script. See [known issues](./known-issues.md).

### Notes

- `next dev` rewrites the `AGENTS.md` block at the repo root. That uncommitted diff is expected — do
  not treat it as your change.
- Turbopack compiles Tailwind through the loader rule in `next.config.ts`. There is no
  `postcss.config.mjs`; do not add one.
- The first load is intentionally heavy (4 MB model). On a cold dev server the intro will fall back
  to "intro without model" after 2.5 s and the character drops in when the GLB arrives. That is
  expected behaviour, not a bug.
- The theme flash script runs before paint. If you edit it, keep it synchronous and inside `<head>`.

---

## 3. Assets

| File | Size | Status | Notes |
| --- | --- | --- | --- |
| `public/models/zeke.glb` | 3.96 MB | **In use** | Loaded + preloaded by `ZekeModel` |
| `public/models/zeke_rigged_web.glb` | 11.46 MB | **Unused** | No reference in code |
| `public/images/zeke-poster.png` | 361 KB | **In use** | WebGL / error fallback |
| `app/favicon.ico` | 21 KB | In use | Default app-router icon |

Budgets worth defending: model ≤ 4 MB, poster ≤ 400 KB. The poster is shown at up to 80% viewport
height, so it should stay a PNG with transparency (the background is the page's own canvas grid).

---

## 4. Replacing the 3D model

The code is coupled to the GLB by **names**, not by configuration. A drop-in replacement will break
unless it matches all of the following.

**Geometry / transform**

- ~1.5 units tall, feet at `y = 0`, origin between the feet.
- Facing **+Z**.
- Skeleton bones named `Head` and `Neck` (used for cursor follow and the mouth anchor).
- A `Zeke_Body` mesh with morph targets including `jawOpen` and `tongueOut`, plus `Tongue` and
  `Teeth_Lower` meshes, and a `Teeth_Upper` skinned mesh (the mouth anchor is derived from its
  bounding-box centre).
- Hand bones named `<Side>Hand`, `<Side>HandMiddle1`, `<Side>HandIndex1`, `<Side>HandPinky1`,
  `<Side>HandThumb1`, and arms `<Side>Arm` / `<Side>ForeArm` — required by `clipFixes.ts`.

**Animation clips** (exact names)

| Clip | Loop | Required |
| --- | --- | --- |
| `Idle` | repeat | **Yes** — the state machine returns to it |
| `DropInHi` | once | Yes, unless you accept an instant start |
| `Talk` | once | Yes |
| `Laugh` | once | Yes |
| `Wave` | once | Yes |
| `LookAround`, `Shrug`, `Thinking`, `Smirk` | once | No — but drop them from `GESTURES` too |

**If your clips are already correct:** delete the corresponding branch in `clipFixes.ts`, or the
repairs will fight your animation.

**Steps**

1. Export GLB with the names above, quantised/compressed, and check it stays under ~4 MB.
2. Replace `public/models/zeke.glb`.
3. Re-render `public/images/zeke-poster.png` against the same framing (character bottom-aligned, no
   background).
4. `npm run dev`, watch for: culling popping (bounds), feet floating (origin), the mouth dive landing
   on the chin (teeth geometry), and hands clipping during `Shrug`.
5. Adjust `CAMERA_*`, `MOBILE_*`, `FACE_*` in `ZekeModel.tsx` if the framing is off. All are in world
   units and documented in [system overview §4.3](./system-overview.md#43-camera-rig).

---

## 5. Editing content

Everything a visitor reads in the dashboard — and everything the character says *about* the dashboard
— is in [`sections/Dashboard/data.ts`](../sections/Dashboard/data.ts).

**Add a project**

1. Append to `projects`. `categories` must use values from `projectCategories` (first one is the card
   label).
2. No insight line needed unless you add a new **category**. A new project in an existing category
   needs nothing else.
3. The Overview highlight counts (projects, awards) update automatically from `projects`.

**Add a category** (e.g. `"Data"`)

1. Add to `projectCategories`.
2. Add `"projects:Data"` to `insights` — TypeScript will fail the build until you do.
3. Projects tab picks it up automatically.

**Add a blog with a real link** — set `href` (and optionally `date`, `minutes`). Entries without
`href` render a "Coming soon" chip; that is the current state of all five.

**Add a testimonial** — push to `testimonials`. One entry renders as the wide dark card; the rest as
smaller surface cards. An empty array renders the "available on request" empty state.

**Scene copy** (headline, about paragraph, CTA, footer) is **not** in `data.ts`. It lives inline in
`Hero.tsx`, `Footer.tsx`, and `layout.tsx`. See the [copy inventory](./product-brief.md#3-copy-inventory).

---

## 6. Pre-ship checklist

- [ ] `npm run lint` passes
- [ ] `npm run build` passes
- [ ] Hard-refresh on a phone-sized viewport: intro completes, dashboard usable, CTA reachable
- [ ] Disable WebGL (or block the GLB) — poster fallback still tells the whole story
- [ ] Enable `prefers-reduced-motion` — no loader lock, no scrub, subtitles appear instantly
- [ ] Toggle theme on each scene; navbar stays legible over the dark ending
- [ ] Keyboard only: skip link → navbar → dashboard tabs (arrows/Home/End) → chat (Tab trap, Escape)
- [ ] "Back to top" from the footer glides back through the story without skipping scenes
- [ ] No layout shift when the scroll lock engages (scrollbar must not disappear)
- [ ] Fresh content check against [known issues](./known-issues.md) — the 31/32 rank discrepancy is
      still open

---

## 7. Deploy

Standard Next deployment (Vercel recommended; the app is fully static in practice). No environment
variables, no API routes, no database, no server actions.

Because the whole experience lives in one client component with a pinned timeline, do not enable
anything that strips scripts or rewrites anchors at the edge (e.g. HTML minifiers that drop
`dangerouslySetInnerHTML` content). The inline theme script is load-bearing.

`history.scrollRestoration = "manual"` is set deliberately so a reload starts at the story's
beginning rather than restoring a mid-pin scroll position.

---

## 8. Troubleshooting

| Symptom | Likely cause | Where to look |
| --- | --- | --- |
| Character jumps when the mobile URL bar hides | ScrollTrigger re-measuring | `ScrollTrigger.config({ ignoreMobileResize: true })` in `Hero.tsx` |
| Page width shifts when the intro locks scroll | Scrollbar removed | `html { overflow-y: scroll }` in `globals.css`; `lockScroll` in `Hero.tsx` |
| Model in bind pose for one frame during fast scrolling | Clip weights summing below 1 | Weight blending in `ZekeModel.tsx` (`blend`) |
| Tongue pokes through the chin | GLB ships `tongueOut` at 100% | `syncMouth` in `ZekeModel.tsx` |
| Hands stay in pockets during shrug / chin hand points wrong | Clip exported wrong | `clipFixes.ts` |
| Camera dives into the chin instead of the mouth | Teeth geometry / rig changed | `mouthAnchor` effect in `ZekeModel.tsx` |
| Intro waits forever | `onReady` never fired (GLB 404) | Network tab; `MODEL_WAIT` 2.5 s should still release it |
| Scroll feels like it fights you | Scrub, thresholds, or an un-killed travel tween | Constants block at the top of `Hero.tsx` |
| Navbar stays hidden after the story | `setNav` not called | `onLeave` / `onEnterBack` in the ScrollTrigger config |
| Dashboard can't scroll while page is locked | `scroll-quiet` class missing | Panel wrapper in `Dashboard.tsx` |
