# Validation Notes v100

Goal: Column-only Tiinex.dev parity with old vertical window stretch restored, old card action rhythm, title legibility correction, adapter/renderer terminology cleanup, UI-shape guard hardening, and continued public bundling/mirroring workflow expectations.

Validated commands:

- node --check src/main.js
- node --check tools/validate-static.mjs
- node --check tools/validate-schema-bindings.mjs
- node --check tools/check-ui-shape.mjs
- node --check tools/check-public-build.mjs
- node --check tools/build-public.mjs
- node --check tools/collect-metrics.mjs
- node --check tools/inspect-storage.mjs
- npm run validate
- npm run ui:shape
- npm run build:public
- npm run public:check
- node --check .site-publish/tiinex.bundle.js
- npm run metrics
- npm run storage:scan
- npm test
- unzip -tq tiinex-site-v100-source.zip

Manual checkpoint: open index.html locally and compare the default start shape against the old Tiinex.dev centered workspace window, especially at zoomed-out desktop scale. This is still visual/action parity work, not full feature parity. Map/Atlas/Leaflet remain intentionally not runtime-visible.
