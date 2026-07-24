# Validation Notes v226

## Root cause hypothesis

The v225 manual video showed a browser runtime crash when opening a record-action dialog:

```text
Uncaught ReferenceError: schemaRegistry is not defined
at TiinexApp.jsx:787
```

The v222-v225 view split moved dialogs and shell presentation out of `TiinexApp.jsx`, but the controller still passed `schemaRegistry` to `RecordActionDialog` without importing the registry. Source-clean validation did not catch this because the sandbox still cannot run the Vite public build, and the current JS typecheck does not run with `checkJs`.

## Fix

- Restored `import { schemaRegistry } from '../schemas/registry.js';` in `src/app/TiinexApp.jsx`.
- Added an architecture-shape guard for this exact seam.
- Left the v225 companion contract, finding/i18n rendering, scaffold removals, and dock-logo CSS contract unchanged.

## Validation run

Commands attempted from the source-clean checkpoint:

```bash
npm run validate
npm run ui:shape
npm run architecture:shape
npm run portable:smoke
npm run usecase:uc001
npm run storage:scan
npm run metrics
npm run typecheck
npm ci --ignore-scripts --no-audit --no-fund --dry-run --os=win32 --cpu=x64
npm ci --ignore-scripts --no-audit --no-fund --dry-run
```

## Manual status

Manual browser validation is still needed for full UX confidence. The highest-priority check is reopening the same record/action flow shown in the v225 video and verifying that the app no longer crashes.

## Not validated here

```bash
npm run build:public
npm run public:check
```

Reason: the source-clean sandbox still lacks a local Vite runtime in `node_modules/.bin/vite`, so no public build is claimed from this environment.
