# Tiinex Site v181 Validation Notes

v181 is a card/lineage navigation parity repair batch after the v180 usage video and follow-up feedback.

Validated in the working tree:

```bash
npm run validate
npm run ui:shape
npm run usecase:uc001
npm run metrics
npx tsc --allowJs --jsx react-jsx --noEmit --skipLibCheck --moduleResolution bundler --module ESNext --target ES2022 src/app/TiinexApp.jsx src/schemas/workspace/workspace.views.jsx src/workspaces/workspace.pathTree.js
```

Full `npm run test` was not completed in this sandbox because dependency installation/build-smoke availability remains unreliable here. Run it locally/CI after `npm install`.

Manual browser focus for Q:

1. Clean successful import should not leave a long boilerplate row under the source rail.
2. Empty/local-empty workspace should not show a Local source pill or misleading local boundary badge.
3. After GitHub import, the workspace header should say `source-backed` rather than always `local`.
4. Clicking a Feed card should enter/focus Lineage for that artifact.
5. `Open details` should open a detail dialog.
6. `Show markdown` should open a Markdown dialog.
7. In Lineage mode, clicking the selected artifact card should expand key details without opening the full detail dialog.
8. Tree folder rows should show old-like artifacts/leaves counts rather than only raw record counts.
