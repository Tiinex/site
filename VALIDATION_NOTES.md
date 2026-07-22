# Tiinex Site v188 Validation Notes

v188 follows Q's review that Lineage mode was closer but still too noisy: the blue/decorative visual treatment, always-expanded read content, repeated root/debug claims, and audit/diagnostics footer made the viewer feel less like the PoC.

## Validation run in workspace

```txt
npm run validate
npm run ui:shape
npm run usecase:uc001
npm run metrics
npx tsc --allowJs --jsx react-jsx --noEmit --skipLibCheck --moduleResolution bundler --module ESNext --target ES2022 src/app/TiinexApp.jsx src/schemas/workspace/workspace.views.jsx
```

All completed successfully in the workspace.

`npm run build:public` was attempted, but this sandbox does not have installed Vite/node_modules, so the build script exits before a Vite binary is available.

## Browser test focus

1. Open Lineage from Feed and Tree. The default view should be compact peer artifact cards, not an expanded read/debug report.
2. Confirm the large blue/decorative ellipse no longer appears inside or over the Lineage card content from the app CSS.
3. Click Expand read view on a Lineage card. It should reveal a limited schema-owned excerpt, not all details/provenance/markdown.
4. Open details should remain the full artifact/details dialog. Show markdown should remain the exact Markdown dialog.
5. The selected Lineage diagnostics footer should not appear under the viewer path by default.
6. The home/logo command should look optically centered in the toolbar.
7. The toolbar should remain content-fit and tight around visible controls.

## Known limits

- Full `npm run test` was not run here because the Vite/React build-smoke path requires installed dependencies.
- Transport/source behavior is intentionally unchanged from v187 in this pass.
- v188 does not implement partial record promotion during import.
- v188 does not implement a real issue snapshot browser reader.
- v188 does not implement binary asset fetching.
