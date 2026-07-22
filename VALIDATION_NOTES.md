# Validation Notes v198

Base: latest provided site zip containing v197 plus portable-tooling additions.

## Scope

v198 focuses on:

- canonical Tiinex/docs schema notes as readable source-backed artifacts/leaves;
- preserving local runtime schema snapshots as schema-definition/support material;
- schema-owned list rendering using real bullet symbols;
- one-line, equal-width Discovery/Lineage search controls.

Portable-tooling paths were not changed.

## Commands run in workspace

```bash
npm run validate
npm run ui:shape
npm run usecase:uc001
npm run metrics
npx tsc --allowJs --jsx react-jsx --noEmit --skipLibCheck --moduleResolution bundler --module ESNext --target ES2022 src/app/TiinexApp.jsx src/schemas/workspace/workspace.views.jsx src/schemas/companion.js src/workspaces/workspace.feedSort.js src/workspaces/workspace.materialRole.js
```

## Commands run from source-clean zip

```bash
npm run validate
npm run ui:shape
npm run usecase:uc001
npx tsc --allowJs --jsx react-jsx --noEmit --skipLibCheck --moduleResolution bundler --module ESNext --target ES2022 src/app/TiinexApp.jsx src/schemas/workspace/workspace.views.jsx src/schemas/companion.js src/workspaces/workspace.feedSort.js src/workspaces/workspace.materialRole.js
```

## Not run

Full `npm run test` was not run because runtime smoke and public build require installed Vite/React dependencies in the sandbox.

## Browser focus

- Tiinex/docs Discovery with `Leaves only` default-on should still show canonical `.topics/.schemas/**/*.schema.md` artifacts when they are source-backed Tiinex artifacts.
- Local `src/schemas/**` snapshots should remain schema-definition/support material.
- Discovery and Lineage toolbar rows should not wrap into a double-line search row at the tested split-screen widths.
- Expanded Lineage read sections should show real bullets, not raw `-` markers.
