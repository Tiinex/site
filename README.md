# Tiinex Site v88

Fresh runtime ownership checkpoint for Tiinex/site with file-local artifact parsing, reader-aware artifact cards, visible root fallback, workspace/source boundaries, Feed/Tree Verse parity, workspace UX reconstruction, and a first audit load-all skeleton.

This repo keeps the v79 monolith under `.old/` as a local ignored reference, but the application entrypoint no longer loads `app.js`. The active `index.html` loads `src/main.js` as classic browser JavaScript so Q can open it directly through `file://` without a dev server or generated build output.

## v88 focus

- Add an explicit Audit loaded workspace command.
- Re-run available scaffold validation over loaded workspace records.
- Mark declared but unloaded parent lineage as open boundaries, not absent.
- Summarize finding counts, lineage boundaries, and integrity footer state.
- Preserve source/draft/static/local boundaries during audit; no hidden network traversal yet.
- Carry lessons from `.old` lineage audit: user-invoked audit, loaded-boundary progress, and visible OK/mismatch/open/pending style counts.

## Runtime boundary

- `.old/` is legacy evidence, not app runtime.
- `src/` owns the new app structure.
- `schemas/` mirrors Tiinex/docs schema families as app-readable schema module projections.
- `audit/` owns audit operation/report shape.
- `surfaces/` owns bounded presentation/interaction surfaces.
- `verses/` owns reader-facing arrangement/projection modes.
- `i18n/` is present from day zero; visible app copy should flow through locale dictionaries as the shell matures.

## Legacy behavior reference discipline

Every rebuilt feature slice should inspect the corresponding `.old/` behavior before mutation. The monolith must not be imported, but its product lessons should not be wasted. See `docs/architecture/legacy-behavior-reference.md`.

## Local test

Open `index.html` directly and check that the v88 workspace shell renders. Then run:

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

## Source boundary discipline

Workspace state records whether material came from a static fixture, a user-selected local file, pasted draft text, or an explicit source-backed descriptor. Local, draft, and static material must not be promoted into GitHub source authority by guesswork.
