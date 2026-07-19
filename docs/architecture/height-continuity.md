# Height Continuity

## Purpose

The focused Tiinex window should stretch vertically like the old Tiinex.dev workspace instead of rendering as a short dashboard card with unused page space below it.

## Rule

The default Column runtime uses one focused workspace window. That window should claim the available viewport height after the global dock and footer landmarks. Empty workspace space is acceptable; a collapsed window shape is not.

## Guarded behavior

- `tx-shell-height-continuity` marks the default shell.
- The focused window uses dynamic viewport height (`100dvh`) rather than a fixed 900px cap.
- The primary universe/column area participates in the height stretch.
- Map, Atlas, Leaflet, and other sibling verses remain frozen until the Column happy path is stable.

## Legacy lesson

The old UI was not just a collection of cards. It was a tall, centered working window. The refactor should preserve that spatial expectation while improving source boundaries, tests, and maintainability.

## v101 refinement

Height continuity is now paired with scroll ownership. The focused window still stretches vertically, but page-level multiverse scroll is prevented. Loaded feeds scroll inside the active workspace pane instead.


## v102 fit and icon polish

v102 keeps the page-scroll contract but fixes polish regressions seen after v101: reader-state chips must stay compact, Column content must align to the top of the pane, and primary action/dock icons should share one visual rhythm instead of mixing emoji-like and placeholder glyphs.
