# Validation Notes v275

## v275 visual dormancy

Root cause hypothesis:

- Large Tiinex/docs workspaces can make browser tab/app switches expensive because the visible workspace tree remains fully paintable during hide/show and app-switch snapshots.
- The PoC avoided this on mobile by parking the heavy visual tree and showing a lightweight workspace preview while hidden.

Changed in v275:

- Ported the PoC behavior as a React-era owner: `src/app/visualDormancy.js`.
- The owner does not call React state setters during hide/pagehide/blur.
- It hides the heavy `.tx-workspace-window` with `content-visibility:hidden`, containment, hidden visibility, and disabled pointer events.
- It shows a lightweight preview card with workspace title, source, view, and counts.
- It restores on visible/focus/user interaction after a short delay.
- Desktop large workspaces are eligible too, not only coarse/mobile viewports.

Validated locally in the sandbox:

```bash
node src/app/visualDormancy.test.mjs
npm run validate
npm run architecture:shape
npm run ui:shape
npm run metrics
npm run storage:scan
npm run typecheck
```

Follow-up validation still needed outside the sandbox:

```bash
npm run build:public
npm run public:check
node --check .site-publish/tiinex.bundle.js
```
