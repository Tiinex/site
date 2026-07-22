# Validation Notes v199

Base: v198 source checkpoint with portable-tooling paths present.

## Scope

v199 focuses only on Lineage toolbar cleanup:

- remove the selected-artifact chip from Lineage mode;
- remove the textual `Audit details` pill from Lineage mode;
- keep audit reachable through a normal compact icon action;
- preserve v198 one-line Discovery/Lineage search behavior.

Portable-tooling paths were not changed.

## Commands run in workspace

```bash
npm run validate
npm run ui:shape
npm run usecase:uc001
npm run metrics
npx tsc --allowJs --jsx react-jsx --noEmit --skipLibCheck --moduleResolution bundler --module ESNext --target ES2022 src/app/TiinexApp.jsx src/schemas/workspace/workspace.views.jsx src/schemas/companion.js src/workspaces/workspace.feedSort.js src/workspaces/workspace.materialRole.js src/ui/primitives/Icon.jsx
```

## Commands run from source-clean zip

```bash
npm run validate
npm run ui:shape
npm run usecase:uc001
npx tsc --allowJs --jsx react-jsx --noEmit --skipLibCheck --moduleResolution bundler --module ESNext --target ES2022 src/app/TiinexApp.jsx src/schemas/workspace/workspace.views.jsx src/schemas/companion.js src/workspaces/workspace.feedSort.js src/workspaces/workspace.materialRole.js src/ui/primitives/Icon.jsx
```

## Not run

Full `npm run test` was not run because runtime smoke and public build require installed Vite/React dependencies in the sandbox.

## Browser focus

- Lineage toolbar should show Back, a compact audit icon action, and search.
- It should not show a selected-artifact chip.
- It should not show a textual `Audit details` pill.
- Audit should still be reachable explicitly.
- Discovery/Lineage search rows should remain one line at the tested split-screen widths.
