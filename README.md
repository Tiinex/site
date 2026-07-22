# Tiinex Site v184

v184 is a selected-Lineage layout/read-card and source-receipt checkpoint for the React/Vite refactor. It builds on v183's correct selected traversal claim, but moves the browser-visible Lineage surface away from the older two-column diagnostic summary layout that collapsed in split-screen testing.

## v184 batch

- Selected Lineage now owns a vertical read-card stack:
  - selected card;
  - ancestor/root cards;
  - terminal traversal result;
  - secondary workspace overview still collapsed.
- Ancestor/root cards expose compact schema-owned read snippets instead of only generic graph node metadata.
- Legacy `.tx-lineage-selected-summary` two-column/button rules are overridden for selected Lineage cards so badges, actions, and read content do not collapse into a side rail at normal split-screen widths.
- Tree/workspace count labels distinguish loaded records from visible/filter-scoped artifacts/leaves.
- GitHub source receipts now carry per-surface diagnostics:
  - repo files discovered/loaded;
  - explicit files requested/loaded;
  - issue snapshots deferred/unavailable in browser runtime.
- GitHub raw Markdown loading now uses bounded concurrency instead of one serial fetch at a time. It still stays within the request budget and still reports measured N/M progress.

## Source/material boundaries

Local/draft material remains local. GitHub material remains explicit source-backed material. v184 does not introduce hidden binary asset crawling and does not implement a real browser issue snapshot reader; those surfaces are reported honestly as referenced/deferred/unavailable when applicable.

## Supported local start

Use the React dev server:

```txt
npm run dev
```

The old static runtime is archived under `.old/` for behavioral reference only.
