# Tiinex Site v184 Validation Notes

v184 follows the v183 usage-video review. v183's traversal result looked semantically correct (`root reached`, `2 visited`, `0 missing`), but the selected Lineage surface collapsed visually and source receipts did not reconcile selected discovery surfaces clearly enough.

## Validation run in workspace

```txt
npm run validate
npm run ui:shape
npm run usecase:uc001
npm run metrics
npx tsc --allowJs --jsx react-jsx --noEmit --skipLibCheck --moduleResolution bundler --module ESNext --target ES2022 src/app/TiinexApp.jsx src/schemas/workspace/workspace.views.jsx src/sources/github/github.loader.js src/adapters/github/github.adapter.js
```

All completed successfully in the workspace.

## Browser test focus

1. In split-screen, open a source-backed leaf in Lineage. The selected path should render as a vertical card stack without badge/action overlap.
2. Ancestor/root cards should remain separately clickable and should not expand the selected card.
3. Expanded selected card should show schema-owned read content first and provenance/audit notes second.
4. `root reached` should remain scoped to the selected traversal, while workspace stats stay visually secondary.
5. During GitHub import, N/M progress should advance with bounded concurrent fetches rather than one visibly serial raw request at a time.
6. After import, receipts should reconcile selected surfaces: repo files, explicit files, and issue snapshots/deferred browser reader state.
7. Tree root counts should read as visible/filter-scoped counts, not loaded-total counts.

## Known limits

Full `npm run test` was not run here because the Vite/React build-smoke path requires installed dependencies. The static, UI-shape, UC-001, metrics, focused GitHub/Lineage tests, and TypeScript check were run.
