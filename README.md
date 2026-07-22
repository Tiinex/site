# Tiinex Site v190

v190 is a schema-companion Lineage viewer closure on top of v189. It keeps the compact peer-card Lineage direction, but removes the largest remaining hardcoded read-view drift: schema-specific read sections and Lineage actions are now resolved through schema companions rather than being owned directly by the generic workspace view.

It also canonicalizes embedded schema snapshot filenames so Tiinex/docs-backed schemas keep the exact upstream artifact names from `.topics/.schemas/README.md`.

## v190 batch

- Adds `src/schemas/companion.js` as the schema-owned projection/transition boundary for runtime viewer surfaces.
- Moves schema read-section selection out of `workspace.views.jsx` and into schema companions.
- Lets schema companions declare Lineage viewer actions for their own artifacts.
- Keeps the generic Lineage viewer responsible only for card stack, anchoring, dialogs, markdown display, and dispatch.
- Adds a schema-companion guard test for Evidence read projection and Lineage actions.
- Canonicalizes embedded schema Markdown snapshot filenames, for example `tiinex.root.v1.schema.md` instead of `root.schema.md`.
- Keeps old short snapshot names as explicit `snapshotAliases` while migration is in flight.
- Tightens validation so schema bindings must point their `snapshot` at the canonical schema filename.
- Splits expanded Lineage read content out of the focusable card button, removing the oversized focus/ellipse overlay over readable text.
- Adds a schema badge link to the canonical schema snapshot when the binding provides a permalink.
- Keeps the logo/home adjustment CSS-only.

## Still intentionally out of scope

- Partial record promotion during GitHub import.
- A real browser issue snapshot reader.
- Automatic binary asset fetching.
- Full PoC mirror/proxy snapshot parity beyond the current transport ladder and diagnostics.
- Changing image assets; the logo adjustment is CSS-only.

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
