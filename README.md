# Tiinex Site v137

React/Vite refactor checkpoint focused on **PoC path-tree parity** for imported local/archive workspaces.

`.old/` remains the behavior reference for the public PoC monolith. This checkpoint does not introduce new product families or Verse expansion; it tightens the local/archive parity loop under modular owners.

## Runtime ownership

- React owns rendering and state binding only.
- `src/adapters/**` owns intake/materialization boundaries.
- `src/workspaces/**` owns workspace lifecycle, import routing, persistence-facing state and local/source provenance.
- `src/artifacts/**` owns Markdown parsing and record shaping.
- `src/schemas/**` owns schema companions and workspace presentation surfaces.
- Local/session workspaces do not infer GitHub/source provenance.
- URL hash remains visible view-state truth; localStorage remains browser-local recovery/cache.

## v137 PoC path-tree parity

Recovered as one complete vertical slice:

```text
local file/folder/zip/source-zip
→ archive/local adapter classification
→ workspace entry / record / asset split
→ empty-stage workspace auto-create or workspace open/merge
→ deterministic local record/asset identity
→ asset projection/detail without fake leaf creation
→ import result summary with warnings/errors/diagnostics
→ persistence/reload-safe workspace state
```

### Added / changed

- `src/workspaces/workspace.import.js`
  - Now owns local adapter-result application instead of leaving workspace/material routing in React.
  - Adds structured `tiinex.workspace.import.result.v1` summaries with counts, warnings, errors and diagnostics.
  - Handles workspace-file open/merge, auto-created local workspaces, records and assets as one import operation.

- `src/workspaces/workspace.lifecycle.js`
  - Keeps lifecycle as owner of record/asset identity, local/session provenance, workspace files and merge candidates.
  - Stays under the static size guard after import-routing logic moved out.

- `src/schemas/workspace/workspace.views.jsx`
  - Local assets are now visible in Feed/Tree as assets, not fake artifact leaves.
  - Asset detail modal shows path, type, size, preview state and local/session boundary.
  - Search includes assets as well as records.

- `src/app/TiinexApp.jsx`
  - UI delegates local/archive result application to workspace import owner.
  - Notice text comes from import result summary, not hand-built UI boilerplate.

- `src/parity/poc.localArchiveParity.test.mjs`
  - New parity fixture for a representative PoC loop: zip with workspace file, Markdown leaves, asset, unsafe path, repeat import and local/session boundary checks.


## v137 path-tree recovery

The v136 video showed that imported source zips became a flat Feed/Tree list in the refactor while the PoC grouped the same material by folder path with artifact/asset counts. v137 recovers that behavior without changing intake/provenance semantics.

Added:

- `src/workspaces/workspace.pathTree.js`
  - Builds a normalized folder tree from records, assets and workspace candidates.
  - Preserves canonical local/archive paths.
  - Counts artifacts, assets and workspace candidates per folder.

- `src/workspaces/workspace.pathTree.test.mjs`
  - Guards path normalization, folder grouping, counts and mixed record/asset/workspace-candidate rows.

- `src/schemas/workspace/workspace.views.jsx`
  - Tree verse now renders a path tree instead of a flat list.
  - Folders can be expanded; query mode opens folders to surface matches.
  - Records, assets and workspace candidates keep distinct row actions/badges.

This is still not full lineage-tree parity. It is intentionally the PoC local/archive **path tree** loop only: material path → grouped projection → open record/asset/candidate.

## Local manual check

```bash
npm install
npm run dev
```

Then test:

1. Drop a zip with `viewer.workspace.md`, nested Markdown files and an asset onto the empty stage.
2. Expected: workspace opens; Markdown becomes records; asset appears as an asset card; unsafe paths are skipped with diagnostics.
3. Open a record and verify path + local/session boundary.
4. Open an asset and verify path/type/size/preview state + local/session boundary.
5. Drop the same zip again. Expected: same canonical paths upsert, not duplicate.
6. Refresh. Expected: workspace, records, assets and import summaries remain recoverable.
7. Drop a zip/folder with no `.workspace.md` but with Markdown/assets. Expected: local workspace auto-created.
8. Confirm no local/archive/folder/zip material receives GitHub source links.
9. Add GitHub source without discovery. Expected: source registers, no repo-tree call.
10. Add GitHub explicit file refs. Expected: source-backed records remain distinct from local/session material.

## Validation

```bash
npm run test
```

Expanded:

```bash
npm run validate
npm run ui:shape
npm run runtime:smoke
npm run usecase:uc001
npm run build:public
npm run public:check
npm run metrics
npm run storage:scan
```

## Delivery rule

This zip is a source-clean repo replacement package. It intentionally excludes `node_modules`, `.site-publish`, browser screenshots, traces and temporary evidence files. CI/workflow owns public artifact generation after push.
