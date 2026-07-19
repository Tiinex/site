# Validation Notes v103

## Scope

- Column-only runtime.
- Map/Atlas/Leaflet remain frozen and absent from runtime/source directories.
- v103 fixes audit/status parity: page-level scroll remains prevented, overflow belongs to the active workspace pane, and audit disclosure is compact like old Tiinex.dev rather than dashboard-like.

## Commands run

```bash
node --check src/main.js
node --check tools/validate-static.mjs
node --check tools/validate-schema-bindings.mjs
node --check tools/check-ui-shape.mjs
node --check tools/check-public-build.mjs
node --check tools/build-public.mjs
node --check tools/collect-metrics.mjs
node --check tools/inspect-storage.mjs
npm run validate
npm run ui:shape
npm run build:public
npm run public:check
node --check .site-publish/tiinex.bundle.js
npm run metrics
npm run storage:scan
npm test
unzip -tq tiinex-site-v103-source.zip
```

## Manual check requested

Open `index.html` locally and check only:

1. No browser/page-scroll appears in the default Column view.
2. Documentation and Start remain visible.
3. Reader-state badges stay compact; no tall feed/count pillars.
4. Dock/action icons look less mixed or placeholder-like.
