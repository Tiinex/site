# Tiinex Site v187 Validation Notes

v187 follows the v186 usage-video review and Q's feedback that Lineage mode was closer, but still felt too much like a debugger and that Tree artifact clicks should behave like artifact/card clicks by entering Lineage for that artifact.

## Validation run in workspace

```txt
npm run validate
npm run ui:shape
npm run usecase:uc001
npm run metrics
npx tsc --allowJs --jsx react-jsx --noEmit --skipLibCheck --moduleResolution bundler --module ESNext --target ES2022 src/app/TiinexApp.jsx src/schemas/workspace/workspace.views.jsx src/schemas/workspace/workspace.add.views.jsx src/sources/github/github.transport.js src/adapters/github/github.adapter.js
```

All completed successfully in the workspace.

## Added/updated guards

Existing guards that were exercised:

```txt
node src/sources/github/github.transport.test.mjs
node src/adapters/github/github.adapter.test.mjs
node src/workspaces/workspace.lifecycle.test.mjs
node src/workspaces/workspace.pathTree.test.mjs
node src/workspaces/workspace.lineageView.test.mjs
```

The changed behavior is also covered by UI-shape/source-static checks for the same code paths.

## Browser test focus

1. In Tree verse, click a Tiinex artifact row. It should enter Lineage for that artifact, not open Detail.
2. In Lineage, each card should be a comparable artifact card with audit/lifecycle/schema/source evidence and comparable actions.
3. The audit/workspace diagnostics footer should not appear as part of the default selected Lineage viewer.
4. `root reached` should be readable once as the path status, not repeated as a debugging report.
5. Import notice should dismiss or expire instead of covering Lineage for the whole session.
6. Click the source transport chip after a GitHub load; it should clear same-source text cache and reopen source controls for an explicit retry.
7. Transport chip title should distinguish plan from observed delivery tiers.

## Known limits

- Full `npm run test` was not run here because the Vite/React build-smoke path requires installed dependencies.
- Mirror/proxy repository snapshot execution is still limited by available browser/configured readers; unavailable tiers are now explicit rather than silently skipped.
- v187 does not implement partial record promotion during import.
- v187 does not implement a real issue snapshot browser reader.
- v187 does not implement binary asset fetching.
