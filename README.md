# Tiinex Site v200

v200 is a focused audit-affordance and mobile chrome pass on top of v199 plus the portable-tooling overlay. It keeps the v194 source-plan reconciliation, v195 display/view-state work, v197 Feed ordering, v198 schema-artifact display handling, and v199 simpler Lineage toolbar, but changes Lineage audit from a mode-switch into a scoped inline action.

## v200 batch

- Changes the Lineage toolbar Audit action from a full Audit Details view jump into a scoped inline report for the current selected Lineage chain.
- The inline Lineage Audit reports only the current chain first: node count, OK/mismatch/open/pending counts, and root reached when applicable.
- Keeps the full workspace Audit view available as a secondary workspace surface, but it is no longer the primary Lineage audit affordance.
- Renames the selected-Lineage secondary finding drawer to Diagnostics, so raw audit/finding codes are not presented as the main Audit action.
- Preserves the v192+ unified RecordCard Lineage model and v195 Lineage expand/collapse behavior.
- Reduces mobile first-viewport chrome: hides workspace stat pills, hides the material summary row, compresses dock/workspace/source/toolbars, and lets artifact cards appear earlier.
- Adds the aggregate portable-tooling test to `npm run validate`, addressing the external validator’s warning that portable tests were not part of the main validation spine.
- Leaves portable-tooling source paths untouched.

## Still intentionally out of scope

- Full workspace Audit redesign beyond making it secondary from Lineage.
- Feed product modes beyond PoC-compatible created-time ordering.
- A real browser issue snapshot reader.
- Partial record promotion during GitHub import.
- Full mirror/proxy snapshot parity beyond the current transport ladder and diagnostics.
- Dependency pinning / lockfile release hardening; noted for the consolidation pause.

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
npx tsc --allowJs --jsx react-jsx --noEmit --skipLibCheck --moduleResolution bundler --module ESNext --target ES2022 src/app/TiinexApp.jsx src/schemas/workspace/workspace.views.jsx src/schemas/companion.js src/workspaces/workspace.feedSort.js src/workspaces/workspace.materialRole.js
```

`npm run build:public` still requires installed Vite/React dependencies.
