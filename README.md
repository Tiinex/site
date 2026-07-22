# Tiinex Site v193

v193 is a focused continuity pass on top of v192. It keeps the unified Discovery/Lineage `RecordCard` surface and fixes two browser-observed drifts: selected Lineage falling back to a diagnostics report when the search query hides the selected node, and source continuation opening as a register-only form after a loaded/deferred source.

## v193 batch

- Keeps the selected Lineage artifact chain mounted from the selected traversal, even when the Lineage search query does not match the selected node.
- Prevents query filtering from replacing a selected Lineage viewer with workspace-level nodes/edges/missing/finding stats.
- Makes empty source results preserve the latest import/source receipt in the primary empty state, so issue-reader-deferred/unavailable results do not collapse to only `No material yet`.
- Adjusts GitHub source continuation defaults so `Discover` opens with a useful continuation surface: unfinished/deferred issue snapshots stay selected, otherwise repo discovery is selected for an explicit refresh.
- Leaves the unified record-card Lineage design from v192 intact.
- Leaves portable-tooling paths untouched: `src/tooling/portable/**`, `tools/tiinex-portable.mjs`, and `docs/architecture/portable-tooling-entrypoints.md`.

## Still intentionally out of scope

- Partial record promotion during GitHub import.
- A real browser issue snapshot reader.
- Automatic binary asset fetching.
- Full PoC mirror/proxy snapshot parity beyond the current transport ladder and diagnostics.

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
npx tsc --allowJs --jsx react-jsx --noEmit --skipLibCheck --moduleResolution bundler --module ESNext --target ES2022 src/app/TiinexApp.jsx src/schemas/workspace/workspace.views.jsx src/schemas/workspace/workspace.add.views.jsx src/schemas/companion.js
```

`npm run build:public` still requires installed Vite/React dependencies.
