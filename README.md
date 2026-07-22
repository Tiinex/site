# Tiinex Site v189

v189 is a focused Lineage viewer readability repair on top of v188. It keeps the v182-v187 resolver, transport and source-boundary work, but tightens the Lineage surface toward the PoC: compact peer cards by default, no path/debug/header bulk in the selected viewer, icon-first secondary actions, and a smaller curated expanded read view.

## v189 batch

- Hides the selected Lineage header chrome from the visual viewer while keeping the region accessible.
- Keeps Lineage cards collapsed by default: badges, title, summary, and compact actions first.
- Removes the default pathline and expand hint from collapsed Lineage cards.
- Limits expanded read view to two short schema-owned sections; full depth remains in Open details / Show markdown.
- Converts secondary Lineage card actions to compact icon buttons, while Continue and Preserve remain visible action text.
- Keeps each node as a peer artifact card with Anchor, details, markdown, and source/continuation actions when available.
- Adds defensive icon sizing and overlay suppression inside Lineage cards so decorative or icon rendering cannot cover text.
- Applies another CSS-only optical adjustment to the top-dock logo/home command.

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
npx tsc --allowJs --jsx react-jsx --noEmit --skipLibCheck --moduleResolution bundler --module ESNext --target ES2022 src/app/TiinexApp.jsx src/schemas/workspace/workspace.views.jsx
```

`npm run build:public` still requires installed Vite/React dependencies.
