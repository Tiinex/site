# Validation Notes v286

## Root hypothesis

The v285 video still showed mobile/foreground latency after route persistence was deferred. The browser inspector showed `body.tx-return-settle` on the page while interacting with a large Tiinex/docs workspace. The `tx-return-settle` CSS used broad body-level descendant selectors for runtime, workspace, dock, cards, rows, audit, lineage, dialogs, filters and blur effects. Toggling or keeping that class during foreground interaction can cause whole-app style invalidation.

## Changed

- Disabled the global return-settle class by default.
- Kept coarse/mobile visual dormancy preview behavior.
- Kept diagnostics and added explicit `returnSettleEnabled: false` in `window.TiinexVisualDormancyReport()`.
- Added a regression assertion that return-settle remains disabled.

## Validation run in sandbox

```bash
npm run validate
npm run architecture:shape
npm run ui:shape
npm run metrics
npm run storage:scan
npm run typecheck
```

## Not verified in sandbox

```bash
npm run build:public
npm run public:check
node --check .site-publish/tiinex.bundle.js
```

`npm run build:public` still exits status 1 without useful output in this sandbox.

## Manual test target

1. Load Tiinex/docs with repo files and issues.
2. Use mobile/device viewport.
3. Interact with feed/search/tree/dialog controls.
4. Run `window.TiinexVisualDormancyReport()`.
5. Confirm `returnSettleEnabled: false` and no persistent `body.tx-return-settle` class.
6. Confirm interaction latency improves relative to v285.
