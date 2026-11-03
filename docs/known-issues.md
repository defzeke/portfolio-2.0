# Known issues

A maintained list of gaps, inconsistencies, and things to re-check. Nothing here is a secret bug
report — these are the known costs of the current design.

**Status legend:** 🔴 ship-blocking if it regresses · 🟡 worth fixing · 🔵 accepted trade-off

---

## 1. Content

| # | Status | Issue | Where |
| --- | --- | --- | --- |
| 1 | 🟡 | **Hackathon rank disagrees with itself.** The Blockbayan project card says "Top 8 of 32 · ICTO Hackathon"; the blog entry says "Top 8 of 31 at the ICTO Hackathon". | [`data.ts`](../sections/Dashboard/data.ts) `projects` + `blogs` |
| 2 | 🔵 | **All five blog entries are unpublished.** Every one renders a "Coming soon" chip. `blogCategories` and their five `insights` lines exist for content that isn't there yet. | [`data.ts`](../sections/Dashboard/data.ts) `blogs` |
| 3 | 🔵 | **Testimonials are empty by design.** The tab renders an "available on request" state with an email link. The `Testimonials` component's non-empty branch (wide dark card + smaller cards) is currently dead code. | [`Dashboard.tsx`](../sections/Dashboard/Dashboard.tsx) |
| 4 | 🔵 | **No mobile projects.** The `projects:Mobile` filter exists and says so out loud; the empty state is intentional. | [`data.ts`](../sections/Dashboard/data.ts) `insights` |
| 5 | 🔵 | **Copyright year is hard-coded** to 2026 in the footer. | [`Footer.tsx`](../components/common/Footer.tsx) |
| 6 | 🔵 | **The email address is duplicated in four files** (Hero, Footer, Dashboard testimonials, chat replies), each with its own Gmail/`.com` string. Changing it is a four-place edit. | see §4 |

## 2. Product gaps

| # | Status | Issue |
| --- | --- | --- |
| 7 | 🔵 | **The chat is a shell.** Four canned replies, no backend, no API route, no model. It is focus-trapped and animated so it *feels* real, which is why it is called out in [product brief §5](./product-brief.md#5-feature-status). Connecting it is the single biggest available feature. |
| 8 | 🔵 | **No contact form.** "Email me" is a Gmail compose URL; "LinkedIn" is an external link. |
| 9 | 🔵 | **No analytics or error reporting.** Any runtime failure in the canvas is silent apart from the poster fallback. |
| 10 | 🔵 | **No real project imagery.** Every project card shows a generated grid placeholder with a hostname chip. Deliberate, but it means the work itself is not visible. |

## 3. Technical debt

| # | Status | Issue |
| --- | --- | --- |
| 11 | 🟡 | **No test suite.** No `test` script, no unit, integration, or visual tests. The scroll engine's settle/skip logic is the highest-risk untested area. |
| 12 | 🟡 | **An 11.4 MB orphaned asset ships in the repo.** `public/models/zeke_rigged_web.glb` is referenced nowhere. It is not served unless requested, but it bloats the repo and any full-site upload. |
| 13 | 🔵 | **`Hero.tsx` is ~1,000 lines** and holds six responsibilities: loader, timeline, scroll lock, gating, chat orchestration, and scene markup. |
| 14 | 🔵 | **Scene names are declared twice** (`AT` labels and `SCENES` thresholds) with a hand-maintained relationship. Adding a scene means editing both plus `REACTIONS`, `focusFor`, and the anchors map. |
| 15 | 🔵 | **Nine numbers in `ZekeRig` are a loose contract** between `Hero.tsx` and `ZekeModel.tsx`. Nothing type-checks that the page writes all of them or that the model reads the right ones. |
| 16 | 🔵 | **`views` is exported but only used to derive `View`.** No runtime consumer; it survives in the bundle. |
| 17 | 🔵 | **`data-scroll-locked` is set on `<html>` but no CSS uses it.** It is a debugging hook only — either use it to style the locked state or drop it. |
| 18 | 🔵 | **`clipFixes.ts` mutates `AnimationClip` objects in place** and marks them with `userData.fixed`. Correct today, but it assumes a single `ZekeModel` instance per GLB. |

## 4. Robustness and accessibility

| # | Status | Issue |
| --- | --- | --- |
| 19 | 🔴 | **The site requires JavaScript.** The intro, about, and every scene panel start at `autoAlpha: 0` / `invisible`, and the loader overlay sits at `z-[100]`. With JS disabled a visitor sees the loader mark and nothing else. |
| 20 | 🟡 | **`#work` and `#contact` are not real element ids.** They only work because the story intercepts clicks. Deep links from outside the page, "open in new tab → fragment", and no-JS all fail to reach the dashboard or CTA. |
| 21 | 🟡 | **The custom scroll lock swallows most keyboard navigation** (Space, Page Up/Down, arrows, Home, End) while it is engaged — during the intro and whenever chat is open. That is intentional, but it means `Escape` is the only way out of a stuck chat. Verify this stays true if you add other modals. |
| 22 | 🟡 | **`prefers-reduced-motion` is handled in three separate places** (`globals.css`, `Hero.tsx` `finish()`, `HeroScene.tsx` `skipEntrance`). A new animation added without all three will leak motion. |
| 23 | 🔵 | **Canvas is exposed as a single `role="img"`** labelled "3D model of Zeke". The character's state (talking, waving) is conveyed only through the `sr-only` subtitle twin, which is the right call — but the canvas itself is an unlabelled interactive void for assistive tech. |
| 24 | 🔵 | **No `aria-expanded`/dialog manager on the dashboard beyond tabs.** Panels are swapped, not dialogs; focus can land outside the panel after a view change if the user was deep in a filter row. |
| 25 | 🔵 | **`favicon.ico` is the framework default**, not the `zeke.` mark. |

## 5. Upgrade watchlist

| # | Status | Issue |
| --- | --- | --- |
| 26 | 🟡 | **`cacheComponents` / `partialPrefetching` are transitional flags.** Verified against `node_modules/next/dist/docs`: `partialPrefetching` only works with `cacheComponents`, Next warns if it is unset, and **both will be enabled everywhere in the next major, with the options removed**. Expect `next.config.ts` to need an edit on the next major upgrade. See [system overview §1.5](./system-overview.md#15-build-configuration). |
| 27 | 🟡 | **The Turbopack CSS loader rule is version-sensitive.** `@tailwindcss/turbopack` is wired via `turbopack.rules`. Tailwind/Next upgrades can change this integration; there is no PostCSS fallback in the repo. |
| 28 | 🔵 | **React 19 + React Compiler** means memoisation is implicit. A component that relies on referential identity across renders may behave differently than under manual `useMemo`. |
| 29 | 🔵 | **`three` 0.187 + drei 10 + fiber 9** move fast. `Lightformer`, `ContactShadows`, and `useGLTF` APIs are the likely break points. |
| 30 | 🔵 | **README at the repo root is still the `create-next-app` boilerplate** and describes a generic Next project. This `docs/` folder supersedes it. |

---

## Suggested order of work

1. **Fix the 31/32 discrepancy** (#1) — it's a one-word content fix and it's the only *incorrect* claim on the site.
2. **Delete or wire up `zeke_rigged_web.glb`** (#12) — free 11.4 MB.
3. **Add real ids (`#work`, `#contact`) or a no-JS fallback** (#19, #20) — the page currently shows nothing without JS.
4. **Pick up the chat backend or remove the promise of it** (#7) — the avatar invites questions it cannot answer.
5. **Extract the scroll engine into a hook and cover the settle logic with tests** (#11, #13) if the story is going to grow.
