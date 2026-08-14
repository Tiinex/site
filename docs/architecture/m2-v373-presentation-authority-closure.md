# M2 v373 — Presentation authority closure

## Purpose

Close the two authority leaks found in v372 without changing the M2 presentation model.

## Canonical boundaries

```text
route/hash
  semantic navigation only

session cache
  browser-local workspace presentation

localDeltas
  durable local artifact/material truth
```

### Exact-set compatibility

Browser presentation may hydrate only when routed and cached workspace IDs are identical **and in the same order**.

This gate now applies to:

- `workspaceViews`
- `workspaceWindow`
- legacy `sessionCache.view`

`sessionCache.view` is projected to the semantic route-view shape before any fallback merge. It cannot restore `layoutMode` or `scrollPositions`, and it contributes nothing when the workspace set/order is incompatible.

### Symmetric route projection

The route owner exposes one semantic projection used at both boundaries:

```text
outbound runtime → route
inbound encoded/legacy route → runtime route shell
```

Incoming top-level `workspaceViews` / `workspaceWindow` and incoming `view.layoutMode` / `view.scrollPositions` are stripped before route state is allowed to own startup/navigation.

Supported legacy route shapes remain readable; this batch does not redesign M3 deep-link/share semantics.

## Regression examples

```text
cache A B C
route A C
→ no cached presentation survives

cache A B C
route B A C
→ no cached presentation survives

compatible A B C
route workspaceVerse/query
cache workspaceViews with compact/scroll
→ route semantic lens/query win
→ compatible browser layout/scroll recover

incoming route containing workspaceViews/workspaceWindow/layoutMode/scroll
→ semantic route fields remain
→ presentation fields are ignored
```

## Nonclaims

No M1 behavior changes, no pager/window changes, no M3 share/deep-link redesign, no authoring/lineage/export/tooling scope.
