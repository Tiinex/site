# Tiinex Site v197

v197 is a focused Discovery ordering and material-role parity repair on top of v196. It keeps the v194 source-plan reconciliation, v195 Display/Tree/view-state work, and v196 Lineage crash guard, but fixes the next browser-observed drift: Discovery Feed ordering no longer matched the PoC and annotation-family artifacts were hidden by an overly broad support-schema classifier.

## v197 batch

- Adds a PoC-compatible Discovery Feed comparator in `src/workspaces/workspace.feedSort.js`.
- Sorts Feed cards by artifact creation timestamp descending, then path, rather than preserving loader/source order or role buckets.
- Preserves the PoC midnight-created plus same-day git commit fallback when commit metadata is available.
- Keeps Tree sorting path/folder based; only Feed order changes.
- Narrows adapter support-schema classification so `tiinex.adapter.v1` remains supporting, while `tiinex.adapter.annotation.v1` can be a work leaf.
- Adds annotation-family work-schema classification for spatial, projection, temporal, semantic, style, validation, and adapter annotations.
- Keeps schema snapshots as schema definitions even when their schema family is a work artifact family.
- Adds guards for Feed ordering and annotation leaf classification.
- Leaves portable-tooling paths untouched.

## Still intentionally out of scope

- Feed-ranking product modes beyond PoC-compatible recent/activity ordering.
- A real browser issue snapshot reader.
- Partial record promotion during GitHub import.
- Full mirror/proxy snapshot parity beyond the current transport ladder and diagnostics.
- Additional Lineage layout polish beyond the v192-v196 model.

## Supported local start

Use the dev server for local browser validation:

```bash
npm run dev
```

Open the printed localhost URL and test against source zips/workspaces.

## Validation

Run:

```bash
npm run validate
npm run ui:shape
npm run usecase:uc001
npm run metrics
npx tsc --allowJs --jsx react-jsx --noEmit --skipLibCheck --moduleResolution bundler --module ESNext --target ES2022 src/app/TiinexApp.jsx src/schemas/workspace/workspace.views.jsx src/schemas/companion.js src/workspaces/workspace.feedSort.js src/workspaces/workspace.materialRole.js
```

`npm run build:public` still requires installed Vite/React dependencies.
