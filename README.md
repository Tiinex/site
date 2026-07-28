# Tiinex Site v284

Checkpoint: `v284`
Version: `0.2.104-v284`
Runtime: `react-v284-dialog-viewport-actions`

## v284 focus

Responsive dialog viewport repair after the v283 performance pass. The v283 render-window and idle scroll persistence fixed the Tiinex/docs tab-return lag, but mobile/short viewport dialogs could still hide their action rows or expose nested clipping.

## Changed in v284

- Dialog primitive CSS now has a single viewport contract: dialog shell is a flex column, header is fixed, body owns scroll.
- Dialog bodies no longer rely on competing `max-height` overrides from older batches.
- GitHub source actions stay sticky inside the scroll body and remain visible on short/mobile viewports.
- Mobile dialog action labels stay readable instead of collapsing to icon-only modal controls.
- Add/Edit GitHub source layout keeps its two-column desktop plan, but collapses to a stable single-column mobile action footer.

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
