# Tiinex Site v92

Fresh runtime ownership checkpoint for Tiinex/site with Universe/Column Verse default workspace continuity, scoped implemented verses only, context-aware Verse availability, interaction spine, source/discovery controls, artifact parsing, root fallback, source boundaries, audit skeleton, and legacy behavior reference.

This repo keeps the v79 monolith under `.old/` as a local ignored behavior reference, but the application entrypoint does not load `app.js`. The active `index.html` loads `src/main.js` as classic browser JavaScript so Q can open it directly through `file://` without a dev server or generated build output.

## v92 focus

- Remove unimplemented Verse directories and UI references.
- Keep runtime-visible verses limited to Universe, Column, Feed, and Tree.
- Add context availability so future verses scale by context instead of appearing everywhere.
- Clarify Map versus Atlas: Map is workspace-level; Atlas is universe-level over one or more Maps.
- Keep renderers open: DOM, CSS columns, SVG, Canvas, Leaflet, D3, WebGL, gallery layouts, or game-engine renderers may implement future verses without becoming Tiinex semantics.

## Runtime boundary

- `.old/` is legacy behavior evidence, not app runtime.
- `src/` owns the new app structure.
- `schemas/` mirrors Tiinex/docs schema families as app-readable schema module projections.
- `audit/` owns audit operation/report shape.
- `surfaces/` owns bounded presentation/interaction surfaces.
- `verses/` owns reader-facing arrangement/projection modes.
- `discovery/` owns discovery control contracts.
- `source-settings/` owns source setting/control model.
- `multiverse/` owns the in-memory multi-pane arrangement model.

## Verse scope

Implemented and visible:

- Universe
- Column
- Feed
- Tree

Planned but not visible as ready actions:

- Map
- Atlas
- Gallery
- game-engine renderers
- other future verses after concrete use-cases exist

## Local test

Open `index.html` directly and check that the v92 Universe/Column workspace shell renders. Then run:

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
