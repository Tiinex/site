# Tiinex Site v225

Checkpoint: `v225`
Version: `0.2.45-v225`
Runtime: `react-v225-companion-hygiene-logo-closure`

## Focus

Close the Root milestone architecture debt before further scaling: keep the versioned companion contract simple, remove inert schema scaffold files, render finding text through i18n, and repair the dock logo centering regression introduced during shell extraction.

## Changes

- Kept the v224 validation pipeline direction:
  - Root validation runs through `src/validation/validateArtifact.js` before exact schema validation.
  - Child validators do not import/call Root validation manually.
  - Generic integrity validation remains in `src/integrity/integrity.validate.js`, not inside `root.validate.js`.
- Tightened finding/i18n usage:
  - finding definitions now use stable codes as message keys;
  - normalized findings retain params for i18n interpolation;
  - audit badge findings render via `resolveFindingMessage()` instead of raw validator text.
- Removed inert companion scaffold files that were not wired into the registry or module exports:
  - surface wrapper presenters such as `*.feed.presenter.js`, `*.tree.presenter.js`, `*.detail.presenter.js`;
  - passive form scaffolds such as `*.create.form.js`, `*.edit.form.js`, `*.quick.form.js`, `*.full.form.js`.
- Preserved schema-specific ownership:
  - schema-specific validate/present/capabilities/findings/i18n stay inside the schema companion folder;
  - generic engines remain outside `src/schemas` and do not absorb Topic/Evidence/etc. meaning.
- Updated the schema companion README to describe the contract rather than list schemas.
- Added companion-contract tests and guards against reintroducing inert scaffold files.
- Repaired the dock logo centering contract so unequal left/right dock actions no longer pull the logo off-center.

## Non-goals

- No transition/artifact creation feature changes.
- No form activation.
- No recursive adapter traversal changes.
- No source transport or issue discovery changes.
- No Discovery/Lineage membership changes beyond preserving v224/v223 behavior.
- No CSS-wide cleanup beyond the dock/logo regression guard.

## Validation

See `VALIDATION_NOTES.md`.

## Supported local start

```bash
npm install
npm run dev
```

The supported local development server is Vite on `127.0.0.1:5173`. Source zips are delivered without `node_modules`.
