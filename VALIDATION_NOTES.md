# Tiinex Site v136 Validation Notes

## Scope

v136 is a PoC loop recovery pass for local/archive intake. It does not expand Verse families or introduce new product capabilities. It proves a single user loop under modular owners:

```text
Drop/select local material
→ adapter result
→ workspace import routing
→ lifecycle record/asset state
→ Feed/Tree/detail projection
→ persisted workspace recovery
```

## Changed files of interest

- `src/workspaces/workspace.import.js`
  - Adds `applyLocalAdapterResultToWorkspace(...)` as the import owner for local/archive adapter results.
  - Adds `summarizeAdapterImportResult(...)` for structured import result summaries.
  - Handles workspace open/merge candidates, auto-created local workspaces, records and assets outside React UI logic.

- `src/workspaces/workspace.lifecycle.js`
  - Continues to own canonical local record IDs, asset IDs, local/session source provenance, workspace imports and merge candidates.
  - Import summary persistence stays in the workspace import owner so lifecycle remains under static size discipline.

- `src/schemas/workspace/workspace.views.jsx`
  - Adds visible asset projection in Feed/Tree.
  - Adds `AssetDetailDialog` for path/type/size/preview-state/local-boundary inspection.
  - Includes assets in query filtering.

- `src/app/TiinexApp.jsx`
  - Delegates local/archive adapter result application to `workspace.import.js`.
  - Displays the structured import summary message.

- `src/workspaces/workspace.import.test.mjs`
  - Covers material-only empty-stage auto-workspace creation.
  - Covers workspace-file + material import into opened workspace.
  - Covers repeat local record/asset upsert and structured import summaries.

- `src/parity/poc.localArchiveParity.test.mjs`
  - New representative PoC parity fixture for workspace zip + leaves + asset + unsafe path + repeated import.

## Validation run in sandbox

Passed:

```bash
npm run test
```

Expanded checks passed:

```bash
npm run validate
npm run ui:shape
npm run runtime:smoke
npm run usecase:uc001
npm run build:public
npm run public:check
```

Included checks:

- static React UC-001 source guards
- schema binding guard
- workspace schema/config/parser guard
- workspace lifecycle tests
- workspace import tests
- GitHub loader tests
- GitHub adapter tests
- archive adapter tests
- adapter registry tests
- local adapter tests
- source model tests
- record action tests
- record transition tests
- PoC local/archive parity fixture test
- UI shape guard
- runtime startup smoke
- public build and public build check

## Manual checks to run locally

1. Drop a zip with `.workspace.md`, nested Markdown and assets on the empty stage.
2. Confirm workspace opens and material imports into it.
3. Confirm asset cards are visible and asset detail does not present them as leaves.
4. Drop the same zip/folder twice. Expected: canonical paths upsert, not duplicate.
5. Refresh and verify workspace, records, assets and import summary survive.
6. Confirm all local/archive material remains local/session and never gains GitHub source actions.
7. Confirm GitHub source registration and explicit file refs still work as source-backed material.

## Known remaining gaps

- Password-based encrypted zip import remains bridge-required/unavailable; encrypted entries are reported, not faked.
- Continue/Reference still need a dedicated schema-conformance pass before they can be called PoC-parity transitions.
- Tree/Lineage/Audit still need real declared-edge lineage recovery; v136 does not claim lineage parity.
- Full PoC issue snapshot/mirror/git-native behavior still needs separate loop recovery passes.
