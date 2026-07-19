# Icon polish and Column fit

The focused Column runtime should preserve the old Tiinex.dev reading shape while cleaning up the new scaffold's rough edges.

## Rules

- Universe/Multiverse owns layout, not page scrolling.
- The active Column pane owns internal scroll when content exceeds the visible workspace.
- Status chips and reader-state badges must not stretch into tall layout blocks.
- Icons should use one visual rhythm: same size, same optical center, no mixed emoji-style glyphs in primary actions.
- Renderer/library concepts such as Leaflet stay out of runtime until Column happy path is stable.

## v103 correction

v103 adds `tx-shell-column-fit` and `tx-shell-icon-polish`.

`tx-shell-column-fit` keeps the focused Tiinex window inside the viewport and lets the active feed own overflow.

`tx-shell-icon-polish` normalizes the primary dock and card action glyphs so the UI reads less like mixed placeholder controls.
