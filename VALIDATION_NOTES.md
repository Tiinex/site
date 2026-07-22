# Validation Notes — v194 source-plan reconciliation

## Base

- Checkpoint base: `site(7).zip` supplied by Q.
- Site base reported by package before changes: `0.2.13-v193`.
- Portable tooling paths were present and left untouched.

## Scope

v194 narrows to source-plan reconciliation:

- boundary / repo files / explicit files / issue snapshots plan model;
- per-surface requested/attempted/loaded/deferred/skipped/failed result state;
- record attribution for materialized GitHub Markdown;
- transport plan vs observed outcome separation;
- source continuation support via persisted source plan/surface state.

Out of scope:

- Feed ranking;
- partial promotion;
- real issue reader;
- full mirror/proxy parity;
- Lineage polish;
- portable-tooling edits.

## Validation run

```bash
npm run validate
npm run ui:shape
npm run usecase:uc001
npm run metrics
npx tsc --allowJs --jsx react-jsx --noEmit --skipLibCheck --moduleResolution bundler --module ESNext --target ES2022 src/app/TiinexApp.jsx src/schemas/workspace/workspace.views.jsx src/schemas/workspace/workspace.add.views.jsx src/schemas/companion.js
```

All green in the working tree.

## Additional guarded behavior

`src/adapters/github/github.adapter.test.mjs` now checks that:

- explicit issue/discussion targets with the issue reader deferred do not increment the repo-files surface;
- deferred issue targets produce no materialized record attribution;
- issue URLs entered as explicit file targets remain explicit-file failures and never become repo-file material.

## Known limits

`npm run test` was not run end-to-end because public build/runtime smoke requires installed Vite/React dependencies in this sandbox.
