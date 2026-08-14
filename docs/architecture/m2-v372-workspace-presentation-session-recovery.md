# M2 v372 — Workspace presentation session recovery

## Goal

Preserve the canonical M2 Workspace Spine presentation across browser refresh without broadening route/share semantics into M3.

## Authority model

```text
workspaces[]
  runtime/material truth

activeWorkspaceId
  semantic focus

workspaceViews[id]
  canonical per-workspace presentation
  Feed / Tree / Lineage
  query / selection / display options
  layoutMode
  scrollPositions

workspaceWindow.offset
  global browser presentation window

route/hash
  semantic navigation projection

session cache
  bounded browser-local presentation recovery

localDeltas
  durable local material truth
```

Session cache is not semantic authority. It may restore a lens only when the explicit route and cache describe the exact same ordered workspace identity set.

## Restore contract

```text
route workspace IDs === cache workspace IDs, same order
→ hydrate session presentation

otherwise
→ ignore cached workspaceViews/workspaceWindow
```

The explicit route keeps ownership of active workspace and active semantic view fields. Cached presentation may restore sibling workspace views and browser-only layout/scroll state.

A restored `workspaceWindow.offset` is a preferred window only. Normal `workspaceWindowFor()` clamping keeps the explicit route-active workspace visible. Restore never invokes pager commands, because pager navigation intentionally changes focus while restore must not.

## Serialization boundaries

`workspace.route.makeRouteState()` excludes:

```text
workspaceViews
workspaceWindow
active view layoutMode
active view scrollPositions
```

The session cache includes filtered `workspaceViews` plus `workspaceWindow`.

The durable local-delta domain includes neither.

## Regression matrix

- A/B/C presentation roundtrip across `writeState()` → `readInitialState()`.
- route focus and active semantic view override stale active cache view.
- closed workspace view is not persisted.
- mismatched or reordered route/cache workspace sets do not hydrate stale presentation.
- clean URL does not bootstrap cached presentation.
- route hash and local delta payloads remain free of M2 presentation state.

## Out of scope

M3 owns public/share/deep-link presentation fidelity. v372 does not redefine encoded route semantics or add a second persistence authority.
