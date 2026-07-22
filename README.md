# Tiinex Site v192

v192 is a focused unified record-card Lineage pass on top of v191. It removes the separate Lineage-specific card chrome for selected traversal and renders the selected artifact and parent/root chain through the same `RecordCard` surface that Discovery uses.

## v192 batch

- Treats Lineage as a filtered/ordered record list: selected artifact followed by its parents to root.
- Reuses the same record-card component in Discovery and Lineage.
- Moves current/parent/root context out of card chrome into small relation separators between cards.
- Keeps card actions, companion projections, compact/expanded expectations, and click-to-Lineage behavior aligned with Discovery.
- Keeps workspace lineage diagnostics secondary and hidden unless explicitly needed.
- Leaves portable-tooling paths untouched.

## Still intentionally out of scope

- Partial record promotion during GitHub import.
- A real browser issue snapshot reader.
- Automatic binary asset fetching.
- Full PoC mirror/proxy snapshot parity beyond the current transport ladder and diagnostics.
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
