# Tiinex Site v275

Checkpoint: `v275`
Version: `0.2.95-v275`
Runtime: `react-v275-visual-dormancy`

## v275 focus

PoC-informed visual dormancy for tab/app switches. Heavy workspace rendering is parked into a lightweight workspace preview when the page is hidden/blurred on constrained viewports or large workspaces.

## Changed in v275

- Added a visual dormancy owner in `src/app/visualDormancy.js`.
- On `visibilitychange`, `pagehide`, and window blur, large/constrained workspaces park the heavy workspace tree with `content-visibility:hidden`, containment, hidden visibility, and a lightweight preview card.
- On focus/visible/user interaction, the heavy workspace tree restores after a short delay so tab/app switch snapshots can paint the preview first.
- Dormancy is direct-DOM lifecycle work and does not serialize full workspace state on app switch.
- Added a small `window.TiinexVisualDormancyReport()` diagnostic.
- Added regression coverage for large-workspace eligibility and preview summary rendering.

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
