# Tiinex Site v288

Checkpoint: `v288`
Version: `0.2.108-v288`
Runtime: `react-v288-mobile-read-sheet-config-source`

## v288 focus

Mobile interaction follow-up after v287. Desktop and most mobile lockups are resolved, but record opening on mobile can still feel like a small delay because the read projection is built in the same commit as the dialog shell. This checkpoint makes the mobile read sheet respond first, then mounts the heavier schema read view on the next animation frame.

It also adds a first Tiinex-hosted app config intake: paste a Tiinex app URL and the viewer resolves its declared workspace config through Tiinex web conventions, then loads the first configured source entrypoint through the normal source transport path.

## Changed in v288

- Record detail dialogs now show a lightweight read-shell immediately and defer `SchemaReadView` by one animation frame.
- Touch targets use `touch-action: manipulation` and visible pressed feedback on coarse/mobile viewports.
- Mobile record detail actions are sticky and sheet-like without reusing the broader return-settle/dormancy paths.
- Add flow includes `Tiinex app config` as a config-source semantic.
- Config-source intake detects HTML link/meta declarations and conventional config paths such as `/.well-known/tiinex/workspace.md`, `tiinex.workspace.md`, `viewer.workspace.md`, and `.topics/.workspaces/viewer.workspace.md`.
- A resolved config maps to a GitHub source input; actual material still loads through normal source transports and boundaries.

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
