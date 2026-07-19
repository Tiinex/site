# Validation Notes v96

Goal: focused Tiinex.dev pattern parity refinement plus machine UI-shape guard and public bundling/mirroring workflow expectations.

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
- unzip -tq tiinex-site-v96-source.zip

Manual checkpoint: open index.html locally and compare the default start shape against the old Tiinex.dev centered workspace window. This is still visual parity work, not feature parity.
