# M2 v371 — Workspace window foundation closure

Status: bounded closure of M2 iteration 1 after v370 architect review.

## Ownership preserved

```text
workspaces[]        = runtime/material truth
activeWorkspaceId  = semantic focus
workspaceViews[id] = per-workspace presentation
workspaceWindow    = visible-window offset/capacity/pager ownership
```

## Pager command contract

Pager navigation is not workspace-focus cycling.

```text
next/previous pager
→ offset ± 1, clamped
→ visible window changes immediately
→ first visible workspace becomes focused
→ no wrap at boundaries
```

Direct interactions with a visible workspace continue to focus/act on that workspace through scoped-interaction ownership.

Regression examples:

```text
A B C D @ 1920
visible A B C
next → B C D + focus B
next at max → no-op
previous → A B C + focus A

A B C @ 1400
visible A B
next → B C immediately
```

## CSS ownership cleanup

M2 now has one authoritative workspace layout/focus section. The obsolete workspace-specific rules removed by v371 included:

- flex/horizontal-scroll multicolumn browsing,
- scroll-snap workspace navigation,
- inactive workspace opacity/saturation dimming,
- later cascade overrides that only worked because they appeared after the stale rules.

The retained contract is responsive grid/window layout, fully readable siblings, compact column sizing and independent vertical primary-stage scrolling.

## Deferred to next M2 iteration

Persistence/restore of the new presentation model across refresh (`workspaceViews` / `workspaceWindow`) is intentionally not part of this closure.
