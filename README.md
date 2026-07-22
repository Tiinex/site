# Tiinex Site v183

v183 is a selected-Lineage read-model checkpoint for the React/Vite refactor. It builds on v182's resolver closure: the graph now understands relative Parent Trace resolution, and this batch makes the already-correct selected traversal more readable and navigable instead of presenting it like a diagnostics report.

## v183 batch

- Selected Lineage traversal is rendered as a navigable artifact path:
  - the selected card expands only from its own primary area;
  - ancestor/root rows are explicit buttons that focus that record in Lineage;
  - workspace overview remains secondary/collapsed.
- Selected status now describes the path result, not just the selected node:
  - `root reached` is shown when the selected traversal reaches a loaded root ancestor;
  - missing/ambiguous parent remains dominant when the parent chain actually stops;
  - unresolved Origin hints stay available as secondary Audit context instead of overriding a successful Parent Trace chain.
- Detail reading is artifact-first:
  - `Open details` now shows schema-owned/read sections before provenance metadata;
  - provenance/envelope fields are still available, but behind a secondary details section;
  - `Show markdown` remains the exact-source dialog.
- Lifecycle/publication state is displayed as a separate badge when present, rather than competing with Audit/conformance status.
- The expanded selected card uses the same schema-read projection as details to avoid the v182 layout collapse caused by mixing metadata grids, findings and Markdown excerpts in one compact card.

## Supported local start

Use `npm run dev` after installing dependencies. Opening source `index.html` directly from the filesystem is not a supported runtime because the React/Vite entry needs module bundling.

## Validation

This source zip is intended for source-clean replacement. The supported local loop remains:

```bash
npm install --no-audit --no-fund
npm run validate
npm run ui:shape
npm run usecase:uc001
npm run metrics
```

`npm run test` additionally runs Vite build/runtime checks and therefore requires installed React/Vite dependencies.
