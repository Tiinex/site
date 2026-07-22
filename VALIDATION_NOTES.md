# Validation Notes — v197

## Base

- Source base: v196 Lineage runtime crash guard checkpoint supplied by Q.
- Scope: Discovery Feed ordering and annotation-family material-role classification.
- Portable-tooling paths were not touched.

## Root cause

The v195/v196 Discovery Feed preserved loaded/source order because `Leaves first` had been removed from default behavior and the remaining comparator was tied to that option. This made the new viewer look arbitrarily ordered compared with the PoC. The PoC Feed uses a date-descending artifact comparator with path as tie-breaker.

A second visible drift came from material-role classification: `tiinex.adapter.annotation.v1` and related annotation-family schemas are artifact families in Tiinex/docs, but the support classifier treated any `tiinex.adapter.*` schema as adapter-support material. With `Leaves only` default-on, those artifacts could disappear or appear in a different surface from the PoC.

## Validation run

In the working tree:

```bash
node src/workspaces/workspace.feedSort.test.mjs
node src/workspaces/workspace.materialRole.test.mjs
npm run validate
npm run ui:shape
npm run usecase:uc001
npm run metrics
npx tsc --allowJs --jsx react-jsx --noEmit --skipLibCheck --moduleResolution bundler --module ESNext --target ES2022 src/app/TiinexApp.jsx src/schemas/workspace/workspace.views.jsx src/schemas/companion.js src/workspaces/workspace.feedSort.js src/workspaces/workspace.materialRole.js
```

From a source-clean verification unzip:

```bash
npm run validate
npm run ui:shape
npm run usecase:uc001
npx tsc --allowJs --jsx react-jsx --noEmit --skipLibCheck --moduleResolution bundler --module ESNext --target ES2022 src/app/TiinexApp.jsx src/schemas/workspace/workspace.views.jsx src/schemas/companion.js src/workspaces/workspace.feedSort.js src/workspaces/workspace.materialRole.js
```

## Known limits

- Full `npm run test` was not run because runtime smoke/public build require installed Vite/React dependencies in this sandbox.
- This batch does not implement a real browser issue reader, partial promotion, or new Feed mode selector.
- Tree remains path/folder sorted like the PoC tree; Feed is sorted by artifact timestamp descending.
