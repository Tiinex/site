# Tiinex Site v103

Column-only Tiinex.dev fit/polish pass with viewport-owned shell, pane-owned scroll, normalized icon rhythm, Discovery/Lineage action parity, UI-shape guards, bundled public build, and legacy behavior reference.

## Runtime scope

The current product runtime is intentionally narrow:

- Universe entry renders Column only.
- Workspace panes support Feed and Tree only.
- Map, Atlas, Desktop, Gallery, and renderer-specific work stay planned-only until Column happy path is stable.

The default entry is a focused Tiinex window with legacy-like Documentation/Start continuity cards, compact controls, badge-title-action card rhythm, secondary diagnostics hidden away, softer title typography, and an old-style action row. v103 keeps the old Tiinex.dev vertical workspace feel, keeps page-level scroll off, preserves compact reader-state chips, and restores audit/status disclosure as compact lineage rows rather than dashboard cards.

## Delivery model

This is a source-clean repo replacement package. Q replaces the repo contents with this zip, opens/runs `index.html` locally for manual testing, and then pushes source if accepted. Public bundling is produced by workflow/CI after push; `.site-publish` is not included in this source zip.
