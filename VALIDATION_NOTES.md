# Tiinex Site v190 Validation Notes

v190 responds to the v189 browser review and schema-origin feedback. The Lineage visual direction was closer to PoC, but the read projections and transition surface risked becoming a hardcoded copy inside the generic workspace view. The schema snapshot filenames also drifted from Tiinex/docs conventions.

## Commands run in the working tree

```bash
node --check src/schemas/companion.js
node --check tools/validate-schema-bindings.mjs
node src/schemas/schema.companion.test.mjs
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

- Lineage collapsed cards should remain compact peer cards.
- Expanded read view should not produce the blue ellipse/focus overlay across content.
- Expanded read view should show schema-companion-owned sections, not workspace-view hardcoding.
- Continue / Preserve / Source actions should still be present through companion action resolution.
- Schema badges should expose the canonical schema source link where available.
- Canonical schema snapshots should use exact Tiinex/docs filenames.
- The top-dock logo should still look optically centered without changing the image file.

## Known limits

- Partial record promotion during import is not implemented.
- Issue snapshot discovery remains deferred in browser runtime without a dedicated reader slice.
- Binary asset fetching remains intentionally out of scope.
- Full `npm run test` was not completed here because the public build/runtime smoke requires installed Vite/React dependencies.
