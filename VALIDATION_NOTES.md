# Tiinex Site v178 Validation Notes

v178 is a source/display parity repair batch after the v177 usage video and LLM review.

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
4. GitHub Add cards should act as operation choices, not static explanations.
5. Register-only source should end with a clear “no loading is running” receipt.
6. Source `Continue` should reopen GitHub source work with repo/ref/root context prefilled.
7. Explicit files/repo discovery should still show loading receipt and loaded/skipped/failed summary.
