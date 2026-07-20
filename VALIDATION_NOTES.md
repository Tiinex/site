# Tiinex Site v130 Validation Notes

## Scope

v130 is a PoC capability hardening pass over v129. It keeps the adapter/source/material architecture from v128/v129, then fixes the actual user-test gap: dropping a zip or folder with material but no explicit workspace file should still create a usable local workspace instead of failing. It also bounds asset previews so large source zips do not try to persist every non-leaf payload into browser state.

## Added / changed

- `src/workspaces/workspace.import.js`
  - `ensureWorkspaceForLocalMaterial(...)` helper for empty-stage material drops.
  - Creates a browser-local workspace via lifecycle when no target workspace exists.
  - Keeps the local/session boundary explicit and testable.
- `TiinexApp.jsx`
  - Empty-stage local/archive drops now auto-create a local workspace when the adapter result contains records/assets but no workspace is active.
  - If a zip contains multiple `.workspace.md` files, the first opens the workspace and the remaining workspace entries are staged as merge candidates.
- `src/adapters/archive/archive.adapter.js`
  - Adds `diagnostics.suggestedWorkspaceName` for archive/folder drops.
  - Bounds text and binary asset previews. Large assets become metadata-only (`previewState: omitted-large`) instead of dataUrl/content payloads.
  - Preserves paths, types, sizes, local/session provenance, and warnings/errors.
- Tests
  - `src/workspaces/workspace.import.test.mjs` covers auto-created local workspace behavior.
  - `archive.adapter.test.mjs` covers suggested workspace name and large asset preview omission.

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
- archive adapter tests
- adapter registry tests
- local adapter tests
- source model tests
- record action tests
- record transition tests
- UI shape guard
- runtime startup smoke
- public build and public build check

## Manual checks to run locally

1. Drop a zip with only Markdown/assets and no `.workspace.md` on the empty stage. Expected: a local workspace is auto-created and material imports.
2. Drop a zip with `.workspace.md` plus material on the empty stage. Expected: workspace opens; material imports into it; additional workspace files become merge candidates.
3. Drop a large source zip. Expected: records/assets appear without browser quota pressure; large assets are metadata-only.
4. Drop the same zip/folder twice. Expected: canonical paths upsert, not duplicate.
5. Confirm all local/archive material stays local/session and never gains GitHub source links.
6. Confirm GitHub explicit file refs still materialize source-backed records.
