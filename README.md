# Tiinex Site v191

v191 is a focused repair on top of v190 after Q's canonical schema snapshot updates. It keeps the schema-companion Lineage viewer model, restores schema-binding validation after the snapshot content changed, and removes the remaining focus/read-target owner that could draw a large blue focus/ellipse over Lineage card text.

## v191 batch

- Recomputes schema snapshot checksums after the repaired canonical `.schema.md` files landed on `refactor`.
- Removes stale short-name `snapshotAliases` that pointed at deleted pre-canonical schema files.
- Keeps canonical snapshot filenames as the binding authority, matching the current Tiinex/docs naming convention.
- Moves the Lineage card title/summary out of a focusable read-toggle button and makes compact preview an explicit card action.
- Adds a tighter Lineage copy indent so title and summary read more like peer artifact cards.
- Keeps expanded read preview companion-owned and bounded; full depth remains in Open details / Show markdown.
- Applies a final CSS-only larger centered logo treatment without changing image assets.

## Still intentionally out of scope

- Partial record promotion during GitHub import.
- A real browser issue snapshot reader.
- Automatic binary asset fetching.
- Full PoC mirror/proxy snapshot parity beyond the current transport ladder and diagnostics.
- Changing image assets; logo adjustments remain CSS-only.
- Portable tooling paths reserved by the other LLM: `src/tooling/portable/**`, `tools/tiinex-portable.mjs`, and `docs/architecture/portable-tooling-entrypoints.md`.

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
npx tsc --allowJs --jsx react-jsx --noEmit --skipLibCheck --moduleResolution bundler --module ESNext --target ES2022 src/app/TiinexApp.jsx src/schemas/workspace/workspace.views.jsx src/schemas/companion.js
```

`npm run build:public` still requires installed Vite/React dependencies.
