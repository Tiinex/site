# Tiinex Site v186

v186 is a lineage-viewer continuity checkpoint for the React/Vite refactor. It builds on v185's source transport ladder and focuses on the PoC interaction model for Lineage mode: the lineage path is a stack of separate artifact cards, and any card can become the reference point.

## v186 batch

- Selected Lineage now renders as a viewer path, not a diagnostic report.
- Selected, ancestor, and root nodes use equal artifact-card treatment.
- Each Lineage card has `Anchor here`, `Open details`, and `Show markdown` actions.
- The active card is marked as the current anchor; ancestor/root cards are no longer passive report rows.
- Workspace-level lineage diagnostics are secondary/collapsed behind an explicit diagnostics/details surface.
- Source-backed records that open from Tree/Detail can hydrate Markdown from the source text cache when the material was loaded in the same browser/session.
- Source continuation preserves requested/deferred surfaces, so issue snapshot deferral is not forgotten when reopening Discover.

## Source/material boundaries

The source cache is only used as same-browser material continuity for already source-backed records. It does not invent provenance, change repository/ref/path identity, or make local material GitHub-backed.

v186 still does not implement a real browser issue snapshot reader, partial import promotion, or automatic binary asset fetching. Those remain explicit deferred/referenced-unloaded states.

## Supported local start

Use the React dev server:

```txt
npm run dev
```

The old static runtime is archived under `.old/` for behavioral reference only.
