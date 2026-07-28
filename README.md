# Tiinex Site v286

Checkpoint: `v286`
Version: `0.2.106-v286`
Runtime: `react-v286-disable-return-settle-jank`

## v286 focus

Mobile/foreground interaction latency follow-up after v285. The browser video showed `body.tx-return-settle` active while interacting with a large Tiinex/docs workspace. That class used broad descendant selectors over cards, dialogs, rows, dock, and runtime shell, which can invalidate styles for the whole mounted app during foreground or DevTools/mobile-emulation focus changes.

## Changed in v286

- The global return-settle class is disabled by default.
- Visual dormancy still supports the coarse-pointer/mobile parked preview.
- Tab/app lifecycle diagnostics remain available through `window.TiinexVisualDormancyReport()`.
- Diagnostics now report `returnSettleEnabled: false` and record `return-settle-skip` instead of toggling `body.tx-return-settle`.
- No route/hash persistence semantics were changed in this batch.

## Validation

See `VALIDATION_NOTES.md`.

## Supported local start

```bash
npm install
npm run dev
```

Common validation commands:

```bash
npm run validate
npm run architecture:shape
npm run ui:shape
npm run metrics
npm run storage:scan
npm run typecheck
```
