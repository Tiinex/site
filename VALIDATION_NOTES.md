# Tiinex Site v186 Validation Notes

v186 follows the v185 usage-video review and Q's lineage-mode feedback: selected Lineage should feel like a viewer made of equal artifact cards, not a debugger report where only the originally selected card is fully interactive. It also closes the observed continuity symptom where a loaded/source-backed Tree leaf could open a Detail dialog without Markdown body when the same source text was already available in the source cache.

## Validation run in workspace

```txt
npm run validate
npm run ui:shape
npm run usecase:uc001
npm run metrics
npx tsc --allowJs --jsx react-jsx --noEmit --skipLibCheck --moduleResolution bundler --module ESNext --target ES2022 src/app/TiinexApp.jsx src/schemas/workspace/workspace.views.jsx src/schemas/workspace/workspace.add.views.jsx src/workspaces/workspace.lifecycle.js src/sources/github/github.transport.js
```

All completed successfully in the workspace.

## Added/updated guards

```txt
node src/sources/github/github.transport.test.mjs
node src/workspaces/workspace.lifecycle.test.mjs
```

These now cover:

- source-backed route/tree/detail shells can hydrate readable Markdown from the source text cache;
- cache-hydrated source material discloses `materialAvailability: available` for read/detail views;
- configured sources preserve requested/deferred discovery surfaces for continuation;
- existing transport ladder checks from v185 still cover cache → mirror → proxy → direct order.

## Browser test focus

1. Open a multi-node Lineage path. Each node should be a separate artifact card with comparable rendering and actions.
2. Use `Anchor here` on an ancestor/root card. It should move the Lineage reference point to that card.
3. `Open details` and `Show markdown` should work from ancestor/root cards, not only from the original selected card.
4. Workspace diagnostics should stay behind the diagnostics/details surface, not dominate the viewer.
5. Open a source-backed Tree leaf after GitHub import. If the source text was cached during import, Detail/Markdown should be readable instead of saying the embedded body is missing.
6. Reopen Discover on a source where issue snapshots were requested but deferred. The continuation dialog should remember the deferred issue surface rather than defaulting only to repo files.

## Known limits

- Full `npm run test` was not run here because the Vite/React build-smoke path requires installed dependencies.
- v186 does not implement partial record promotion during import.
- v186 does not implement a real issue snapshot browser reader.
- v186 does not implement binary asset fetching.
