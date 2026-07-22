# Validation Notes — v196 Lineage runtime crash guard

## Base

- Checkpoint base: `tiinex-site-v195-display-tree-viewstate-source.zip`.
- Site base reported by package before changes: `0.2.15-v195`.
- Portable tooling paths were present and left untouched.

## Scope

v196 is deliberately narrow. The v195 review video showed a runtime blank-screen failure after Lineage/view navigation. DevTools showed:

```text
Uncaught ReferenceError: expandedRecordIds is not defined
    at WorkspaceLineageState
```

The root cause was that `WorkspaceColumnSurface` passed `expandedRecordIds` and `onToggleLineageCard` into `WorkspaceLineageState`, but `WorkspaceLineageState` did not accept those props in its own signature before forwarding them to `LineageSelectedSummary`.

## Changes

- `WorkspaceLineageState` now owns `expandedRecordIds = []` and `onToggleLineageCard` in its argument destructuring.
- `tools/check-ui-shape.mjs` now extracts the `WorkspaceLineageState` signature and fails if those props are missing.
- No source-plan, material-role, transport, portable tooling, or schema companion semantics were changed.

## Validation run

```bash
node --check tools/check-ui-shape.mjs
npm run validate
npm run ui:shape
npm run usecase:uc001
npm run metrics
npx tsc --allowJs --jsx react-jsx --noEmit --skipLibCheck --moduleResolution bundler --module ESNext --target ES2022 src/app/TiinexApp.jsx src/schemas/workspace/workspace.views.jsx src/schemas/companion.js
```

All green in the working tree.

## Browser test focus

- Enter Lineage from a record.
- Click a Lineage card to expand/collapse preview.
- Use UI Back and browser Back/Forward.
- Confirm the app does not blank and the console does not report `expandedRecordIds is not defined`.
- Confirm v195 behavior still holds: `Leaves only` default, unified RecordCard Lineage, and scroll restoration.

## Known limits

`npm run test` was not run end-to-end because public build/runtime smoke requires installed Vite/React dependencies in this sandbox.
