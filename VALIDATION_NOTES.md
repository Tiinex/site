# Validation Notes v284

## v284 dialog viewport actions

The v283 performance candidate fixed the observed tab-return lag, but screenshots showed a separate responsive-dialog issue: the GitHub source dialog could hide action buttons or require viewport resizing before controls became reachable.

Changed in v284:

- `.tx-dialog` is now a flex column with a bounded visual-viewport height.
- `.tx-dialog-body` is the single scroll owner and has `min-height: 0`, `overflow: auto`, and no competing inherited `max-height` cap.
- GitHub source action rows remain sticky at the bottom of the modal body across create/edit/source-plan operations.
- Mobile modal button labels are kept visible in dialog actions, even though toolbar buttons elsewhere may collapse to icon-only.
- Short-height viewports receive a tighter header/body layout instead of clipping the form footer.

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

Manual browser test:

1. Open Add → GitHub source on mobile/narrow viewport.
2. Confirm the form scrolls inside the modal body.
3. Confirm Back / Register only / Load selected surfaces remain reachable without resizing the viewport.
4. Confirm record detail, governance, and markdown dialogs still scroll normally.
5. Confirm v283 tab-return performance does not regress.
