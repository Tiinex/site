# Tiinex Site v129 Validation Notes

## Scope

v128 is a PoC capability recovery pass over v127. It moves archive/workspace intake and local asset separation out of UI assumptions and into adapter/lifecycle contracts.

Primary goal: recover the `.old` logic that UX depends on before continuing visual polish.

## Added

- `src/adapters/archive/archive.adapter.js`
  - `archive.zip`, `archive.local`, `archive.workspace-bundle` adapter definition
  - safe relative archive path normalization
  - central-directory based `.zip` parsing
  - stored and deflated zip entries via `DecompressionStream('deflate-raw')`
  - encrypted entry detection and explicit error reporting
  - `.workspace.md` entries routed as workspace import candidates
  - Markdown entries routed as records
  - non-Markdown entries routed as local assets, not fake leaves
- `src/adapters/archive/archive.adapter.test.mjs`
  - safe path tests
  - zip parsing tests
  - deflated entry test
  - workspace/record/asset split tests
  - encrypted entry reporting test
- `workspace.lifecycle.js`
  - `addWorkspaceAssets`
  - `openWorkspaceFromMarkdown`
  - `mergeWorkspaceImport`
  - workspace `assets`, `importLog`, and workspace import metadata
- `TiinexApp.jsx`
  - local/drop intake now applies adapter result records/assets/workspace entries
  - empty-stage drop can open an imported `.workspace.md` workspace
  - existing workspace drops stage `.workspace.md` files as merge candidates
- `workspace.views.jsx`
  - workspace surface shows asset count and less misleading empty-state copy
- `local.adapter.js`
  - `.zip` routes through the archive adapter
  - folder traversal now also supports `getAsFileSystemHandle` when available

## Validation run in sandbox

Passed:

```bash
npm run validate
npm run ui:shape
npm run usecase:uc001
```

Included checks:

- static React UC-001 source guards
- schema binding guard
- workspace schema/config/parser guard
- workspace lifecycle tests
- GitHub loader tests
- archive adapter tests
- adapter registry tests
- local adapter tests
- source model tests
- record action tests
- record transition tests
- UI shape guard
- UC-001 create/restore/close guard

## Not completed in sandbox

These require local dependency/runtime availability:

```bash
npm run runtime:smoke
npm run build:public
npm run public:check
```

In this sandbox the source-clean tree does not have a usable Vite binary in `node_modules/.bin`, so public build checks cannot be treated as source-code evidence here.

## Manual checks to run locally

1. Drop a `.zip` on the empty stage containing `viewer.workspace.md`.
   - It should open a local/session workspace, not create a leaf.
2. Drop a `.zip` into an existing workspace containing nested `.md` files.
   - Nested paths should be preserved.
   - Markdown entries should appear as records.
3. Drop/import a zip containing images or other non-Markdown assets.
   - Assets should be counted/stored separately, not converted into fake leaves.
4. Drop/import a zip containing both `.workspace.md` and material into an existing workspace.
   - Workspace files should become explicit merge candidates.
   - Material should still import as local/session records/assets.
5. Drop/import the same zip twice.
   - Same canonical record paths should upsert, not duplicate.
   - Same canonical asset paths should upsert, not duplicate.
6. Try a zip with unsupported/encrypted entries.
   - The app should report warnings/errors and not fake successful import.
7. Confirm local zip/folder material never gains GitHub source provenance.
8. Confirm GitHub explicit file refs still materialize as source-backed records.

## v128.1 crash fix

- Fixed runtime crash in `src/ui/primitives/Icon.jsx` where `upload` referenced `faArchive`, which was not imported/available from the current FontAwesome set.
- `upload` now uses the already imported `faArrowUpFromBracket`.
- No adapter/source/material behavior changed.

Validation run in sandbox:

```txt
node tools/validate-static.mjs
node tools/validate-schema-bindings.mjs
node tools/validate-workspace-schema.mjs
node src/workspaces/workspace.lifecycle.test.mjs
node src/sources/github/github.loader.test.mjs
node src/adapters/archive/archive.adapter.test.mjs
node src/adapters/adapter.registry.test.mjs
node src/adapters/local/local.adapter.test.mjs
node src/sources/source.model.test.mjs
node src/actions/record.actions.test.mjs
node src/transitions/record.transitions.test.mjs
node tools/check-ui-shape.mjs
node tools/check-uc001.mjs
```


## v129 local directory parity

This pass addresses the gap discovered while comparing folder/drop behavior against the PoC: folder import should not fail or silently discard non-Markdown material just because the PoC path was imperfect.

Changed:

- `local.adapter.js` now routes all selected/dropped local files through the archive/material result contract.
- Folder-contained non-Markdown files are preserved as local assets.
- Wrapped `DataTransferEntry` files retain `arrayBuffer()`, so dropped/nested zip files can be parsed by the archive adapter.
- `TiinexApp.jsx` pager path no longer contains a duplicate `const workspaces` declaration.
- `local.adapter.test.mjs` and `adapter.registry.test.mjs` assert mixed Markdown/assets folder behavior instead of treating assets as unsupported.

Validation run in sandbox after `npm install`:

```bash
npm run validate
npm run ui:shape
npm run usecase:uc001
npm run runtime:smoke
npm run build:public
npm run public:check
```

All passed.
