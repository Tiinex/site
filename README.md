# Tiinex Site v196

v196 is a focused Lineage runtime crash repair on top of v195. It preserves the v195 Display options, material-role, Tree, scroll, and unified RecordCard Lineage direction, but fixes the browser regression observed in the v195 review video: entering/backing through Lineage could blank the app with `expandedRecordIds is not defined`.

## v196 batch

- Passes `expandedRecordIds` and `onToggleLineageCard` through `WorkspaceLineageState` instead of only through its caller.
- Keeps Lineage card click as expand/collapse and keeps anchor/reference movement as an explicit action.
- Adds a UI-shape guard that inspects the `WorkspaceLineageState` signature so this missing-prop runtime crash cannot silently return.
- Leaves v194 source-plan reconciliation and portable-tooling paths untouched.
- Leaves v195 `Leaves only` default, material-role inference, Tree/Feed filtering, and scroll restore behavior intact.

## Still intentionally out of scope

- Feed ranking/product sorting decisions.
- Partial record promotion during GitHub import.
- A real browser issue snapshot reader.
- Automatic binary asset fetching.
- Full PoC mirror/proxy snapshot parity beyond current diagnostics and available browser readers.
- General Lineage redesign; the current unified RecordCard chain is preserved.
- Portable-tooling changes.

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
npx tsc --allowJs --jsx react-jsx --noEmit --skipLibCheck --moduleResolution bundler --module ESNext --target ES2022 src/app/TiinexApp.jsx src/schemas/workspace/workspace.views.jsx src/schemas/companion.js
```

`npm run build:public` still requires installed Vite/React dependencies.
