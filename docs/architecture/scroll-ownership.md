# Scroll Ownership

Column Verse is the default runtime. The Universe/Multiverse level is a layout owner, not a scroll owner.

## Rule

- The page/body must not scroll in the default Column runtime.
- The focused Tiinex window stretches to the available viewport height.
- Overflow from loaded artifacts belongs inside the active workspace column/pane.
- Future multiverse layouts must preserve this ownership: panes may scroll; the multiverse canvas should not create accidental page-level scroll.

## Why

The old Tiinex.dev interaction treated the workspace window as the stable object. Browser/page scroll at the multiverse level makes the column feel longer than the page and breaks the focused-window pattern. Pane-local scroll preserves continuity while still allowing long feeds.

## Guard

`tools/check-ui-shape.mjs` checks for the `tx-shell-scroll-owned` contract and for hidden body overflow in the local runtime shell.


## v102 fit and icon polish

v102 keeps the page-scroll contract but fixes polish regressions seen after v101: reader-state chips must stay compact, Column content must align to the top of the pane, and primary action/dock icons should share one visual rhythm instead of mixing emoji-like and placeholder glyphs.
