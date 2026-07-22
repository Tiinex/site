# Tiinex Site v183 Validation Notes

v183 follows the v182 usage-video review and co-designer feedback. v182's relative Trace resolver looked correct; this batch targets the next gap: correct traversal needed to become a readable and navigable artifact path.

Validated in the working tree:

```bash
npm run validate
npm run ui:shape
npm run usecase:uc001
npm run metrics
npx tsc --allowJs --jsx react-jsx --noEmit --skipLibCheck --moduleResolution bundler --module ESNext --target ES2022 src/app/TiinexApp.jsx src/schemas/workspace/workspace.views.jsx src/workspaces/workspace.lineageView.js src/artifacts/artifact.record.js
```

Full `npm run test` was not completed in this sandbox because Vite/React build-smoke requires installed dependencies and `node_modules` is not present here. Run it locally/CI after `npm install`.

Focused guards added/covered:

1. Selected traversal still reuses the workspace resolver result.
2. A selected child whose loaded ancestor is a root reports `root reached` for the traversal result.
3. An unresolved Origin hint does not override a successful Parent Trace chain; it remains secondary context.
4. Ancestor rows are intended as navigation targets, not passive traversal-report rows.
5. Detail reading is schema/artifact-first, while provenance and envelope metadata remain available behind a secondary disclosure.
6. Lifecycle state, when present in the Continuity envelope, is preserved on the record and can be rendered separately from Audit status.

Manual browser focus for Q:

1. In local 11-record workspace, click a record with resolved ancestors; selected Lineage should read as an artifact path, not a debug list.
2. Click ancestor/root rows; each should focus that ancestor in Lineage rather than expanding the original selected card.
3. A complete chain such as `Archimas -> Jockes -> Rulles` should say `root reached` / `Lineage root reached`, not be dominated by `lineage.origin.unresolved`.
4. Expand the selected card in split-screen width; it should stay readable and avoid the v182 layout collapse.
5. Open details for a Feedback/Evidence/Topic-style artifact; schema-owned sections should appear before provenance metadata.
6. Use Show markdown for exact source Markdown; it should remain separate from Open details.
