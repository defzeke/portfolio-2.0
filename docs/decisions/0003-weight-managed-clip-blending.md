# 0003. Weight-managed animation blending over `crossFadeTo`

- **Status:** Accepted
- **Date:** 2026-11-03
- **Deciders:** Ezekiel Bustamante
- **Related:** [`sections/Hero/ZekeModel.tsx`](../../sections/Hero/ZekeModel.tsx) (`blend`, `playOnce`,
  `freshAction`), [system overview §4.5](../system-overview.md#45-weight-managed-blending)

## Context

The character has nine clips: `Idle` loops forever; `DropInHi`, `Talk`, `Laugh`, `Wave`, `LookAround`,
`Shrug`, `Thinking`, and `Smirk` are one-shots.

Three.js's idiomatic way to play a one-shot over an ambient loop is
`idle.crossFadeTo(action, duration)`. That assumes a strict A→B→A sequence.

This page breaks that assumption constantly. Scrolling fast can produce `Talk` (entering `about`),
then `Laugh` (entering `center`) **inside the same fade window**, while the visitor may also have just
pressed something in the dashboard that queued another `Talk`. The result of naive crossfades was
visible: for a frame or two the mixer blended in the **bind pose** — the character briefly snapped to
a T-pose-like rest position. That was reported as "the model glitches".

## Decision

Manage weights ourselves. Idle plays continuously and always owns `1 − Σ(other weights)`.

```
for each one-shot layer:
  weight += (target − weight) * (1 − e^(−dt · BLEND_RATE))    // BLEND_RATE = 7
  if target === 0 && weight < 0.002 → stop and drop the layer

idle.setEffectiveWeight(max(0, 1 − Σ layer weights))
```

Supporting rules:

- Every one-shot keeps a **pool of actions** (cloned `AnimationClip`s). Replaying a clip that is still
  fading out takes a fresh action instead of resetting the dying one to frame 0.
- Starting a one-shot sets every existing layer's target to 0 and pushes the new layer at target 1, so
  the newest clip always wins.
- Idle's weight is also exposed as `idleWeight`, which gates cursor-follow so the head never fights a
  clip that is animating the head.

## Consequences

### Good

- **Total weight can never fall below 1**, so the bind pose can never leak in — the original bug is
  structurally impossible rather than masked.
- Overlapping reactions degrade gracefully into a blend instead of a snap.
- Restarting the same clip mid-fade is correct, because of the action pool.
- One number (`BLEND_RATE`) tunes the whole feel of the animation.

### Costs

- **You lose three's fade/crossfade bookkeeping** — no `fadeIn`/`fadeOut`, no `crossFadeFrom`; all
  transitions go through this one code path, so a mistake affects every clip.
- **Cloned actions cost memory**, and each clip's pool grows with overlapping replays (bounded in
  practice by how many can be in flight at once).
- **The loop must run before `mixer.update`**, which is why the per-frame order is
  `blend → restore clip base pose → mixer.update → tick → camera`. Reordering this silently breaks
  cursor-follow.
- Idle is doing work even at weight 0 (it is always playing). Acceptable at one character.

## Alternatives considered

- **`crossFadeTo` / `fadeIn`/`fadeOut` with a queue.** Tried; still produces flicker when a third clip
  arrives inside the window because the invariant "weights sum to ~1" is not maintained.
- **A single animation graph (e.g. three's `AnimationObjectGroup` + additive layers).** Additive
  layers would work for gestures but not for full-body clips like `Laugh`.
- **Avoiding overlap by refusing new reactions while one is playing.** Simplest, but makes the
  character feel unresponsive during exactly the moments (fast scrolling) when he should react.
