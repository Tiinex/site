# Tiinex Site v198

v198 is a focused Discovery/Lineage material-role and toolbar polish pass on top of v197 plus the portable-tooling overlay. It keeps the v194 source-plan reconciliation, v195 view-state work, v196 crash guard, and v197 Feed ordering, but corrects the remaining parity drift around canonical Tiinex/docs schema artifacts, schema-owned read bullets, and Discovery/Lineage search row layout.

## v198 batch

- Treats canonical Tiinex/docs schema notes under `.topics/.schemas/**/*.schema.md` as readable Tiinex artifacts/leaves when they carry continuity context.
- Keeps local implementation snapshots under `src/schemas/**` as schema-definition/support material.
- Preserves support classification for adapter/source/tool/interface implementation surfaces that are not canonical schema artifacts.
- Keeps `Leaves only` from hiding canonical schema artifacts that are real source-backed Tiinex leaves.
- Renders schema-owned read sections with real list bullets instead of displaying Markdown hyphens as plain text.
- Keeps Discovery and Lineage search controls on one physical row with matching search width.
- Leaves the v197 Feed comparator intact: artifact created timestamp descending, then path/id tie-breakers.
- Leaves portable-tooling paths intact.

## Still intentionally out of scope

- Feed product modes beyond PoC-compatible recent/activity ordering.
- A real browser issue snapshot reader.
- Partial record promotion during GitHub import.
- Full mirror/proxy snapshot parity beyond the current transport ladder and diagnostics.
- Further Lineage card redesign; the unified RecordCard model is preserved.

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
