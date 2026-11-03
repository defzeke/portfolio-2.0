# Architecture decision records

Short, immutable records of the choices that shaped this site. Each captures the context, the
decision, and — most importantly — **what we accepted as a cost**.

An ADR is not edited after acceptance. If a decision changes, add a new ADR that supersedes the old
one and mark the old one `Superseded by ADR-XXXX`.

## Index

| # | Title | Status |
| --- | --- | --- |
| [0001](./0001-pinned-story-over-routes.md) | One pinned scroll story instead of routed pages | Accepted |
| [0002](./0002-css-variables-over-dark-variant.md) | Theme with CSS custom properties, not `dark:` variants | Accepted |
| [0003](./0003-weight-managed-clip-blending.md) | Weight-managed animation blending over `crossFadeTo` | Accepted |
| [0004](./0004-layered-model-fallbacks.md) | Layered fallbacks for the 3D character | Accepted |
| [0005](./0005-scrollbar-preserving-scroll-lock.md) | Scroll lock that preserves the scrollbar | Accepted |

## Template

```markdown
# NNNN. Title

- **Status:** Proposed | Accepted | Superseded by ADR-XXXX
- **Date:** YYYY-MM-DD
- **Deciders:** who
- **Related:** links to code, docs, other ADRs

## Context
What forced a decision. Constraints, symptoms, prior attempts.

## Decision
What we chose, in one or two sentences, then the specifics.

## Consequences
### Good
### Costs
The costs are mandatory. An ADR with no costs is marketing.

## Alternatives considered
What else was on the table, and why it lost.
```
