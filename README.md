# Tiinex Site v195

v195 is a display/tree/view-state parity pass on top of v194. It keeps the v194 source-plan reconciliation and the portable-tooling slice intact, but moves the next user-observed issues to their actual owners: leaf/material-role truth, Display options defaults, Lineage card interaction semantics, and view scroll continuity.

## v195 batch

- Changes the default Discovery presentation to `Leaves only` on, matching the PoC-style leaf workspace default.
- Removes the visible `Leaves first` option from Display options; it remains only as an internal/migration field.
- Narrows material-role inference so schema/source/adapter/support surfaces are not promoted to work leaves merely because they carry a schema id or continuity envelope.
- Adds a focused material-role guard for trace leaves, schema snapshots, adapter/source support material, and plain supporting Markdown.
- Keeps Discovery and Lineage on the same RecordCard surface, but changes Lineage card click to expand/collapse the card read preview.
- Keeps anchor/reference-point movement as an explicit Lineage action instead of overloading the whole card click.
- Stores and restores view scroll positions across Discovery → Lineage → Back / browser Back-Forward.
- Keeps portable-tooling paths untouched.

## Still intentionally out of scope

- Feed ranking/product sorting decisions beyond removing the confusing default role-first toggle.
- Partial record promotion during GitHub import.
- A real browser issue snapshot reader.
- Automatic binary asset fetching.
- Full PoC mirror/proxy snapshot parity beyond current diagnostics and available browser readers.
- General Lineage redesign; the current unified RecordCard chain is preserved.
- Portable-tooling changes.

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
