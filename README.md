# Tiinex Site v119

React/Vite foundation with workspace-schema companion ownership, compact old-like Column chrome, and an old-like `Add to workspace` flow. The active runtime is `src/main.jsx` and `src/app/TiinexApp.jsx`; workspace-specific React surfaces live beside the site-local workspace schema under `src/schemas/workspace/`.

`.old/` remains a behavior and polish reference for the public PoC monolith. It is source-only and ignored from commits/public builds.

## Runtime shape

- React owns rendering and state binding.
- `src/schemas/**` owns schema companions: bindings, capabilities, presenters, validation, transitions, and schema-owned React surfaces.
- `src/schemas/workspace/` binds `tiinex.workspace.v1` as a viewer-local schema extension.
- Workspace config/lifecycle/route/persistence modules still own behavior that should remain portable outside React.
- `src/ui/primitives/**` owns reusable UI primitives, spacing, focus, and icon/text rhythm.
- Font Awesome is integrated through the shared `Icon` primitive.
- Local/session workspaces do not infer GitHub/source provenance.
- URL hash remains visible view-state truth; localStorage remains cache/mirror only.

## Local manual check

```bash
npm install
npm run dev
```

Then open the Vite local URL.

1. Start with no `#state=` hash: the viewer should show the quiet empty Tiinex stage even if stale localStorage exists.
2. Press Create on the left side of the centered Tiinex logo.
3. Submit without a name: the modal should require a workspace name.
4. Enter a workspace name and create it.
5. Confirm the created workspace is local/session, has source row, drop hint, toolbar and `No nodes match this view.`
6. Open `Add`; the modal should be compact and old-like, with Manual files, Manual folder, GitHub source, Explicit URLs, and Drag and drop.
7. Add one or more local Markdown files and confirm cards/counts appear without GitHub provenance.
8. Add a GitHub source and confirm it registers as a source boundary without pretending records were loaded.
9. Refresh: the workspace should restore from `#state=`.
10. Close the workspace: clean empty route should return non-destructively.

## Validation

```bash
node --check app.js 2>/dev/null || true
npm run validate
npm run ui:shape
npm run runtime:smoke
npm run usecase:uc001
npm run build:public
npm run public:check
node --check .site-publish/assets/*.js
npm run metrics
npm run storage:scan
npm test
```

## Delivery rule

This zip is a source-clean repo replacement package. It intentionally excludes `node_modules` and `.site-publish`. CI/workflow owns public artifact generation after push.

## v119 scope

Done:

- Replaced the new source shortcut with a compact old-like `Add to <workspace>` menu.
- Tightened created-workspace chrome: smaller titlebar, icon stat pills, shorter source row, shorter drop hint, compact empty result.
- Implemented real local Markdown intake for manual files, manual folders, drag/drop, and explicit URL fetch where CORS/source allows.
- GitHub source action now registers a source boundary without fake progress or fake loaded material.
- Workspace-specific React UI remains in `src/schemas/workspace/workspace.views.jsx` instead of a parallel generic React component tree.
- Updated `tiinex.workspace.v1` capabilities/transitions/source-action fields for the Add flow.
- Kept clean empty-stage parity and single-column width discipline from v116.1/v117.

Not done:

- Full repository/mirror source loading is not implemented in React yet.
- Zip intake is disclosed/skipped rather than silently faked.
- Topic/evidence schema React companions still need real implementation passes.
- Root schema companions will be patched as needs appear.

## v119.3 footer and compact-recognition patch

Done:

- Footer is visible before and after workspace creation.
- Footer matches the old PoC origin-marker behavior more closely: fixed bottom bar, translucent dark background, compact 34px desktop height.
- Footer `Tiinex` mark is linkable to `https://github.com/Tiinex`, matching the old app's link behavior.
- Created-workspace copy was compacted again: the source row no longer carries a redundant `local/session` right-side explanation when there are no loaded records, and the drop hint is shorter.
- Local/session provenance remains available through source metadata/title text and lifecycle state rather than as layout-heavy boilerplate.

Not changed:

- No new source-loading behavior was added.
- No new flow was introduced.
- Multi-column/pager assumptions were preserved; the single workspace remains a compact column rather than a full-width dashboard.


## v119.3 recognition patch

- Global dock now behaves as a content-fit row instead of stretching toward the workspace column width.
- Tiinex logo remains intentionally larger than neighboring controls.
- Workspace pager arrows are gated by workspace count plus viewport-size calculation, not count alone.
- No source/loading feature logic was added in this patch.

## v126 local folder and action foundation

Done:

- Local adapter now owns browser drag/drop directory traversal using DataTransferEntry when Chromium exposes it.
- Manual folder, direct workspace drop, and focused drop target can preserve relative paths for nested Markdown files.
- Local record identity is deterministic by workspace + canonical local path, so repeat imports update rather than creating duplicate React keys.
- Same-title files from different paths remain separate artifacts.
- Record actions now expose concrete `Continue` and `Reference` action-result capsules through `tiinex.record.action.result.v1`.
- Record actions remain non-decorative: `Source` only appears for source-backed GitHub records; local records never get guessed source links.

Not done:

- Native git bridge execution is still unavailable in the browser and remains explicit adapter capability/availability metadata.
- Full repo crawling/mirror discovery remains a future adapter pass.
- Visual parity with the PoC card chrome is intentionally secondary to correct source/material/action ownership.


## v127 transition foundation

This checkpoint adds schema-aware record transitions:

- `Continue` can create a browser-local continuation leaf from a record.
- Continuation targets come from the schema registry (`Topic`, `Preservation`, `Evidence`, etc.).
- `Reference` can create a browser-local evidence/reference leaf.
- Generated transition Markdown preserves the parent record boundary and does not infer GitHub provenance for local material.
- Transition records are inserted through workspace lifecycle, keeping identity/provenance ownership outside the UI.
