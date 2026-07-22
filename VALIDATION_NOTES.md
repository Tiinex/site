# Tiinex Site v182 Validation Notes

v182 is a focused Lineage closure batch after the v181 usage-video review and co-designer feedback.

Validated in the working tree:

```bash
npm run validate
npm run ui:shape
npm run usecase:uc001
npm run metrics
tsc --allowJs --jsx react-jsx --noEmit --skipLibCheck --moduleResolution bundler --module ESNext --target ES2022 src/app/TiinexApp.jsx src/schemas/workspace/workspace.views.jsx src/workspaces/workspace.lineageView.js src/lineage/lineage.resolve.js src/sources/source.assetReferences.js
```

Full `npm run test` was not completed in this sandbox because Vite/React build-smoke requires installed dependencies and `node_modules` is not present here. Run it locally/CI after `npm install`.

Focused guards added/covered:

1. Filename-relative Parent Trace: `001.trace.md` resolves against the declaring record directory.
2. No global basename fallback: another folder's `001.trace.md` must not become a guessed edge.
3. `../parent.trace.md` resolves inside the configured source root.
4. Relative targets outside source root are boundary-blocked with no edge.
5. Same path across configured sources resolves only inside the declaring source identity.
6. Selected Lineage traversal reuses the workspace resolver result and presents selected ancestors first.
7. Same-session hash restore keeps 325 source-backed records' Markdown, materialRole and selected record state.
8. Source asset references are discovered as loaded/referenced-unloaded/blocked diagnostics without binary crawling.
9. Issue snapshot reader remains explicitly deferred without fixtures.

Manual browser focus for Q:

1. Load Tiinex/docs source-backed records and open `World Wide Wave 3 Meme` or equivalent sibling-trace leaf.
2. Confirm a relative `001.trace.md` parent in the same folder resolves as a parent edge instead of disconnected/missing.
3. In Lineage, selected traversal should show the selected leaf and its ancestors first; workspace-wide findings should remain secondary.
4. Back/forward after loading ~325 source records should not collapse `schema ok`/materialRole/Markdown into metadata-only `open`.
5. Evidence Markdown with a relative image should show an explicit referenced/unloaded or blocked asset diagnostic if the asset itself was not loaded.
