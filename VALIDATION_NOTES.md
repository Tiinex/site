# Tiinex Site v191 Validation Notes

v191 starts from Q's current `refactor` zip after canonical schema files were repaired directly on the branch. Baseline discovery found that `npm run validate` failed because schema binding checksums still described the older embedded snapshots and `snapshotAliases` still pointed at removed short-name schema files.

## Root cause

The schema snapshots were correctly canonicalized and repaired, but the adjacent schema binding JSON and manifest still carried stale checksums and migration aliases. That made the canonical schema state fail the binding guard before any viewer work could be trusted.

The Lineage viewer also still used a full-width focusable read-toggle button around title and summary. Even after v190 split expanded content out of the button, that button remained the likely owner for the visible blue focus/ellipse over card copy.

## Commands run in the working tree

```bash
npm run validate
npm run ui:shape
npm run usecase:uc001
npm run metrics
npx tsc --allowJs --jsx react-jsx --noEmit --skipLibCheck --moduleResolution bundler --module ESNext --target ES2022 src/app/TiinexApp.jsx src/schemas/workspace/workspace.views.jsx src/schemas/companion.js
```

All passed.

## Commands to run from the source-clean verification zip

```bash
npm run validate
npm run ui:shape
npm run usecase:uc001
npx tsc --allowJs --jsx react-jsx --noEmit --skipLibCheck --moduleResolution bundler --module ESNext --target ES2022 src/app/TiinexApp.jsx src/schemas/workspace/workspace.views.jsx src/schemas/companion.js
```

## Browser test focus

- Lineage title/summary should no longer receive a large blue focus/ellipse overlay.
- Preview expansion should be an explicit card action, not a focusable title/summary wrapper.
- Collapsed Lineage cards should keep compact peer-card reading and improved title/summary indentation.
- Expanded read preview should remain bounded and companion-owned.
- Open details and Show markdown should still carry the full depth.
- Logo/home should look optically centered without changing the image file.

## Known limits

- Full `npm run test` was not completed here because public build/runtime smoke requires installed Vite/React dependencies.
- This batch does not implement portable tooling; those paths remain reserved for the other LLM's additative batch.
