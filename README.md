# Tiinex Site v280

Checkpoint: `v280`
Version: `0.2.100-v280`
Runtime: `react-v280-foreground-settle-mobile-preview`

## v280 focus

Follow-up after v279 tab-return performance testing: keep the desktop UI normal on tab return, reserve parked preview for coarse/mobile surfaces, and use a short foreground-settle class to defer expensive compositor effects during the first foreground paint.

## Changed in v280

- Parked workspace preview is coarse-pointer/mobile only; narrow desktop windows no longer get the mobile screensaver.
- Desktop/laptop keeps the normal Tiinex UI during tab switching.
- Foreground settle mode disables heavy shadows, filters, backdrop blur, and decorative root gradients for a short paint window after tab/app return.
- The dormant preview layout now uses max-content rows so status chips do not stretch into large blobs.
- `window.TiinexVisualDormancyReport()` records `return-settle-start` / `return-settle-end` events.

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
