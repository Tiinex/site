# Validation Notes v200

Base: latest user-provided source after v199 toolbar/audit action work and portable-tooling overlay.

## Scope

v200 keeps the Lineage card structure stable and changes only the audit affordance and mobile chrome density:

- Lineage Audit is now a scoped inline action for the selected lineage chain.
- The full workspace Audit view remains available but is not launched by the Lineage toolbar Audit button.
- Mobile chrome is compressed so artifact cards appear earlier in the first viewport.
- `npm run validate` now includes the aggregate portable-tooling test.

## Commands run

```bash
npm run validate
npm run ui:shape
npm run usecase:uc001
npm run metrics
npx tsc --allowJs --jsx react-jsx --noEmit --skipLibCheck --moduleResolution bundler --module ESNext --target ES2022 src/app/TiinexApp.jsx src/schemas/workspace/workspace.views.jsx src/schemas/companion.js src/workspaces/workspace.feedSort.js src/workspaces/workspace.materialRole.js
```

Source-clean zip verification:

```bash
npm run validate
npm run ui:shape
npm run usecase:uc001
npx tsc --allowJs --jsx react-jsx --noEmit --skipLibCheck --moduleResolution bundler --module ESNext --target ES2022 src/app/TiinexApp.jsx src/schemas/workspace/workspace.views.jsx src/schemas/companion.js src/workspaces/workspace.feedSort.js src/workspaces/workspace.materialRole.js
```

## Known limits

- Full `npm run test` was not completed in the sandbox because runtime/public build smoke requires installed Vite/React dependencies.
- Dependency pinning and lockfile release reproducibility remain open consolidation items.
- Full workspace Audit remains dense; v200 only removes it from the primary Lineage Audit action.
