# Tiinex Site v180 Validation Notes

v180 is a card/source/material-role parity repair batch after the v178 usage video and follow-up review.

Validated in the working tree:

```bash
npm run validate
npm run ui:shape
npm run usecase:uc001
npm run metrics
npx tsc --allowJs --jsx react-jsx --noEmit --skipLibCheck --moduleResolution bundler --module ESNext --target ES2022 src/app/TiinexApp.jsx src/schemas/workspace/workspace.views.jsx src/schemas/workspace/workspace.add.views.jsx
```

Full `npm run test` was not completed in this sandbox because dependency installation timed out before Vite/React build/runtime smoke could run. Run it locally/CI after `npm install`.

Manual browser focus for Q:

1. Display options should no longer clip left-side labels or require horizontal scrolling on half-width desktop.
2. `Leaves only` should filter, while `Leaves first` should only sort when supporting docs are visible.
3. Supporting docs should show a category count, not total loaded records.
4. GitHub Add discovery surfaces should behave like visible checkbox choices, not static explanation cards.
5. Register-only source should end with a clear “no loading is running” receipt.
6. Source `Discover` should reopen GitHub source work with repo/ref/root context prefilled.
7. Explicit files/repo discovery should show phase progress, including ref/tree discovery and `N/M` file loading before the loaded/skipped/failed summary.
