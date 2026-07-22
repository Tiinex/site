# Tiinex Site v181

v181 is a card/lineage navigation parity repair checkpoint for the React/Vite refactor. It builds on v180 by tightening the old-like card contract: the card itself focuses Lineage, while Open details and Show markdown remain separate dialogs. It also removes passive source-summary boilerplate and makes Tree counts closer to the old artifacts/leaves model.

## v181 batch

- Workspace boundary label is now material-aware:
  - hidden when empty;
  - `local` only when local material exists;
  - `source-backed` when imported GitHub/source material is the visible material;
  - `mixed` when both are present.
- Clean successful import boilerplate is no longer shown as a full row after every import. Source counts/state remain visible on the source rail.
- Feed cards remain clickable as Lineage-focus targets, but the primary action row is less text-heavy.
- `Open details` remains a detail dialog.
- `Show markdown` remains a Markdown dialog.
- Evidence preservation is no longer a dominant primary card action while the old Reference relation is not restored.
- Lineage selected-card view is expandable: clicking the selected card in Lineage reveals key details from the artifact without opening the full detail dialog.
- Tree counts now expose both total artifacts and leaf counts, rather than only raw record counts.

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
