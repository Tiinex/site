# Tiinex Site v132 Validation Notes

## Scope

v132 is a workspace guidance pass over v131. It keeps the adapter/source/material contracts intact, but removes duplicated empty-workspace boilerplate and makes empty states filter-aware so the UX is thinner and more respectful.

## Added / changed


- `src/schemas/workspace/workspace.views.jsx`
  - Replaces duplicated empty-workspace copy with one compact drop hint plus a separate filter-aware empty state.
  - Keeps `No nodes match this view.` for query/filter empties only.
- `src/styles/app.css`
  - Adds late v132 overrides for thinner drop/empty-state boxes and slightly smaller Add textareas.
- `package.json`
  - Updates package metadata to v132.


- `src/schemas/workspace/workspace.add.views.jsx`
  - Removes the unowned `Start from` dropdown and Tiinex/docs prefill.
  - GitHub Add starts with an empty repo field and explicit user input.
- `src/adapters/github/github.adapter.js`
  - Adds public default-branch resolution when ref is blank.
  - Adds bounded repo-tree Markdown discovery using the GitHub tree API.
  - Keeps issue/discussion snapshots as explicit deferred warnings.
- `src/sources/github/github.loader.js`
  - Removes implicit `master` fallback for repo-relative file refs.
  - Supports multiple root paths without double-prefixing.
- `src/workspaces/workspace.lifecycle.js`
  - Handles multi-root canonical source paths.
- Tests
  - Adds `src/adapters/github/github.adapter.test.mjs`.
  - Extends GitHub loader and UI-shape guards for no implicit preset/prefill regression.

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

7. Open Add → GitHub source. Expected: no “Start from” dropdown, repo field blank, ref field blank.
8. Enter `Tiinex/docs`, leave ref blank, keep repo files discovery on. Expected: adapter resolves default branch and imports bounded Markdown records.
9. Enter explicit file refs with a blank ref. Expected: raw/blob URLs may work; repo-relative refs require resolved/default ref from repo discovery or explicit ref.
10. Issue/discussion URLs should not fake snapshots yet; they should be reported/deferred by adapter contract.
