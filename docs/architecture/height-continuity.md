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
