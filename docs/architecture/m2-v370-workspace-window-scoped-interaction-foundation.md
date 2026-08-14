# M2 v370 — Workspace window / scoped interaction foundation

Status: M2 iteration 1 after M1 closure. Architect review required before any Q test.

## Ownership model

```text
workspaces[]
  = canonical runtime/material truth

activeWorkspaceId
  = semantic focus only

workspaceViews[workspaceId]
  = per-workspace presentation
    Feed / Tree / Lineage / Audit
    query / selection
    display state
    scroll positions
    layoutMode expanded / compact

workspaceWindow
  = global presentation
    visible offset / capacity / reachability
```

Presentation state must not mutate artifact/source truth.

## 1. Workspace reachability

`workspaceColumnCapacity(viewportWidth)` remains:

```text
< 980px   → 1
< 1500px  → 2
>=1500px  → 3
```

Pager eligibility is no longer a mobile-only rule:

```text
canPage = workspaceCount > workspaceColumnCapacity(viewportWidth)
```

`workspaceWindowFor()` keeps the active workspace inside the visible window after focus changes and viewport resize.

Required regressions:

```text
3 workspaces @ 1400 → capacity 2 + pager
4 workspaces @ 1920 → capacity 3 + pager
1920 → 1400 → <980 keeps active workspace reachable
```

## 2. Focus is not capability

Every visible workspace is a real interactive workspace. TiinexApp passes explicit `workspace.id` to workspace-scoped callbacks rather than withholding callbacks from inactive siblings.

A direct interaction with visible workspace B:

```text
executes against B
→ does not mutate A
→ focuses B in the same interaction where focus is relevant
```

The frame-level focus capture is supplemental; action handlers still receive the explicit workspace identity.

## 3. Independent workspace view state

`workspaceViews[id]` remains the owner of per-workspace lens state. Focus changes synchronize `state.view` with the focused workspace without overwriting sibling views.

v370 extends that contract to per-workspace vertical reading positions. Each workspace surface reports/restores scroll through its own view-scoped key.

## 4. Compact / expanded presentation

`layoutMode` lives in `workspaceViews[id]`:

```text
expanded
→ Collapse
→ compact narrow column
→ Expand
→ same workspace/material/view/query/scroll state
```

Compact mode is presentation only. It does not change workspace records, assets, sources or provenance.

## 5. Close hygiene

Closing a workspace runs one presentation cleanup boundary:

```text
workspace removed
→ workspaceViews[closedId] removed
→ activeWorkspaceId repaired if needed
→ workspaceWindow offset clamped/re-focused
```

M1 durable-local preservation behavior remains lifecycle-owned and is not changed by this presentation cleanup. `canonicalProductState()` applies the same presentation-prune invariant after normal product-state normalization, so Open replacement and close do not maintain separate stale-view cleanup implementations.

## 6. Vertical reachability

Each visible workspace owns its primary vertical scroll stage:

```text
workspace A scroll
≠ workspace B scroll
```

Long content remains vertically reachable without turning the multicolumn shell into a horizontal workspace browser.

## Corrected oracle

The prior static guard effectively treated "render only capacity columns" as sufficient. v370 re-grounds this:

```text
render capacity columns
AND
all overflow workspaces remain reachable
```

The pager is therefore driven by explicit overflow state, not a `count <= 1` or mobile-only heuristic.

## Explicit non-scope

v370 does not include:

- M3 deep-link/share restore,
- M4 artifact Create/Edit/Continue,
- M5 lineage/status redesign,
- M6 evidence/mobile value polish,
- M7 export/publication redesign,
- M9 tooling bridge,
- FS25/readmodel source reinterpretation,
- broad visual redesign.
