# Tiinex Site v189 Validation Notes

v189 responds to the v188 browser review where Lineage was closer to the PoC but still felt too busy: the viewer header, path/debug text, expanded schema dumps, long action labels and optical logo drift kept the surface from feeling like a compact artifact viewer.

## Commands run in the working tree

```bash
npm run validate
npm run ui:shape
npm run usecase:uc001
npm run metrics
npx tsc --allowJs --jsx react-jsx --noEmit --skipLibCheck --moduleResolution bundler --module ESNext --target ES2022 src/app/TiinexApp.jsx src/schemas/workspace/workspace.views.jsx
```

All passed.

## Commands run from the source-clean verification zip

```bash
npm run validate
npm run ui:shape
npm run usecase:uc001
npx tsc --allowJs --jsx react-jsx --noEmit --skipLibCheck --moduleResolution bundler --module ESNext --target ES2022 src/app/TiinexApp.jsx src/schemas/workspace/workspace.views.jsx
```

All passed.

## Browser test focus

- Lineage cards should be compact peer cards by default.
- Collapsed cards should not show full schema/provenance blocks.
- Expanded read view should show a short curated excerpt only.
- Open details and Show markdown should carry the deep views.
- The selected Lineage visual header should not add a report/debug card above the chain.
- Secondary actions should be compact and not dominate card reading.
- No app overlay, icon or decorative element should cover Lineage text.
- The top-dock logo should look optically centered without changing the image file.

## Known limits

- Partial record promotion during import is not implemented.
- Issue snapshot discovery remains deferred in browser runtime without a dedicated reader slice.
- Binary asset fetching remains intentionally out of scope.
- Full `npm run test` was not completed here because the public build/runtime smoke requires installed Vite/React dependencies.
