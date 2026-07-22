# Tiinex Site v199

v199 is a narrow Lineage toolbar cleanup on top of v198. It keeps the v194 source-plan reconciliation, v195 view-state work, v197 Feed ordering, and v198 canonical schema artifact/display polish, but removes the last Lineage-mode header badges that made the viewer feel busier than the PoC.

## v199 batch

- Removes the selected-artifact chip from the Lineage mode toolbar.
- Removes the textual `Audit details` pill from the Lineage mode toolbar.
- Replaces audit access with a normal compact icon action in the toolbar.
- Keeps audit reachable as an explicit action without making audit state part of the default Lineage viewer chrome.
- Keeps Discovery/Lineage search sizing from v198.
- Leaves Lineage cards, material-role logic, feed ordering, source transport, and portable-tooling paths unchanged.

## Still intentionally out of scope

- Feed product modes beyond the current recent/activity ordering.
- A real browser issue snapshot reader.
- Partial record promotion during GitHub import.
- Full PoC mirror/proxy snapshot parity beyond the current transport ladder and diagnostics.
- Further Lineage card redesign; current Lineage card parity is being protected.

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
npx tsc --allowJs --jsx react-jsx --noEmit --skipLibCheck --moduleResolution bundler --module ESNext --target ES2022 src/app/TiinexApp.jsx src/schemas/workspace/workspace.views.jsx src/schemas/companion.js src/workspaces/workspace.feedSort.js src/workspaces/workspace.materialRole.js src/ui/primitives/Icon.jsx
```

`npm run build:public` still requires installed Vite/React dependencies.
