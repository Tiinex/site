# Tiinex Site v85

Fresh runtime ownership checkpoint for Tiinex/site with file-local artifact parsing, reader-aware artifact cards, and visible root fallback.

This repo keeps the v79 monolith under `.old/` as a local ignored reference, but the application entrypoint no longer loads `app.js`. The active `index.html` loads `src/main.js` as classic browser JavaScript so Q can open it directly through `file://` without a dev server or generated build output.

## v85 focus

- Parse a Tiinex Markdown continuity envelope from pasted text, demo fixtures, or a local `.md` file selected through the browser file picker.
- Resolve known schema modules by `Current -> Current Schema`.
- Use `tiinex.root.v1` fallback when a child schema module is unavailable.
- Run scaffold-depth validation immediately when an artifact is loaded.
- Render parsed artifacts as reader-aware cards for Topic, Evidence, and root fallback states.
- Let Scan/Power/Audit reader density change card disclosure without changing artifact truth.
- Surface finding counts and degraded/root-fallback state without claiming full lineage audit.

## Runtime boundary

- `.old/` is legacy evidence, not app runtime.
- `src/` owns the new app structure.
- `schemas/` mirrors Tiinex/docs schema families as app-readable schema module projections.
- `audit/` owns audit operation/report shape; full load-all lineage audit comes later.
- `surfaces/` owns bounded presentation/interaction surfaces.
- `i18n/` is present from day zero; visible app copy should flow through locale dictionaries as the shell matures.

## Local test

Open `index.html` directly and check that the v85 workspace shell renders. Then run:

```bash
npm run validate
npm run build:public
npm run public:check
npm run metrics
npm run storage:scan
npm test
```

## Delivery model

Final zips are source-clean repo replacement packages. They are not deploy/dist zips. `.site-publish` is generated validation/build output and must not be included in source zips.


## v85 Source Boundary Discipline

Workspace state now records whether material came from a static fixture, a user-selected local file, pasted draft text, or an explicit source-backed descriptor. Local, draft, and static material must not be promoted into GitHub source authority by guesswork.
