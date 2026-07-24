# Tiinex Site v226

Checkpoint: `v226`
Version: `0.2.46-v226`
Runtime: `react-v226-record-action-registry-import`

## Focus

Hotfix a runtime regression found in the v225 browser video: opening a record-action dialog crashed because `TiinexApp.jsx` still passed `schemaRegistry` into the extracted dialog without importing it.

The v225 companion hygiene, finding/i18n work, and dock-logo closure remain intact.

## Changes

- Restored the shared `schemaRegistry` import in `src/app/TiinexApp.jsx`.
- Added an architecture guard requiring that import while `RecordActionDialog` receives `schemaRegistry={schemaRegistry}`.
- Kept the v224/v225 validation and companion direction:
  - Root validation is orchestrated through `src/validation/validateArtifact.js`.
  - Child validators do not import/call Root validation manually.
  - Generic integrity validation remains in `src/integrity/integrity.validate.js`.
  - finding text renders through i18n.
  - inert presenter/form scaffolds stay removed.

## Non-goals

- No transition/artifact creation changes.
- No form activation.
- No Discovery/Lineage membership changes.
- No recursive adapter traversal changes.
- No source transport or issue discovery changes.
- No broad CSS cleanup.

## Supported local start

```bash
npm install
npm run dev
```

The dev server is Vite on `127.0.0.1:5173`.

## Validation

See `VALIDATION_NOTES.md`.
