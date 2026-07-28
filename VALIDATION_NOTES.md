# Validation Notes v280

## v280 foreground settle + mobile preview ownership

Root hypothesis from v279 video:

- Desktop preview was a UX mismatch when the browser window was visually narrow but still fine-pointer desktop.
- Remaining ~1 second lag is likely compositor/CSS paint cost on tab return rather than React auto-restore or route/hash serialization.

Changed in v280:

- Mobile parked preview is reserved for coarse-pointer viewports.
- Desktop/laptop tab return keeps the normal UI and no longer shows the parked workspace preview solely because the viewport is narrow.
- Added `tx-return-settle` lifecycle class before backgrounding and held it briefly after foregrounding, so the first foreground paints skip expensive shadows, filters, backdrop blur, and root radial gradients.
- Tightened parked preview CSS with `align-content:start` and explicit chip sizing, preventing stretched badge blobs.
- Updated `visualDormancy` regression expectations for fine-pointer narrow desktop vs coarse mobile.

Validated locally in the sandbox:

```bash
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
