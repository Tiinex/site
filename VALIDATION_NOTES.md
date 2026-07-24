# Validation Notes v225

## Root cause hypothesis

v224 improved the validation and companion architecture, but two debts remained before Root closure:

1. The schema folders still contained many inert scaffold files. They looked like active companion roles but were not imported by schema modules or consumed by the registry. That made the companion contract look more complex than it is and invited future copy/paste scale debt.
2. The extracted app shell restored the logo class names, but CSS still had accumulated historical logo overrides. The dock grid used asymmetric side widths, so the center logo could drift when the left and right action groups differed in width.

## Fix

- Removed unused surface presenter wrappers and inactive form scaffolds from schema companion folders.
- Kept the flat versioned companion contract:

```text
<schema-id>.schema.md
<schema-id>.schema.json
<schema-id>.schema.js
<schema-id>.validate.js
<schema-id>.presenter.js
<schema-id>.capabilities.js
<schema-id>.findings.js
<schema-id>.<locale>.i18n.json
```

- Kept transitions as passive imported companions because action capability checks depend on explicit transition declarations, but did not activate transition/product behavior.
- Added `src/schemas/schema.companionContract.test.mjs` to prove:
  - registered modules use versioned schema-id filenames;
  - finding codes render through i18n;
  - inert surface/form scaffold files are not shipped before they have a real owner.
- Updated the audit badge dialog to render finding messages through the i18n resolver.
- Added a final canonical dock/logo CSS owner so the Tiinex mark is centered by layout, not by accumulated optical transform patches.

## Companion contract status

A schema builder should be able to generate a minimal companion with only:

```text
<schema-id>.schema.md
<schema-id>.schema.json
<schema-id>.schema.js
```

Then add optional files only when the schema diverges from Root or needs extra behavior:

```text
<schema-id>.validate.js
<schema-id>.presenter.js
<schema-id>.capabilities.js
<schema-id>.findings.js
<schema-id>.<locale>.i18n.json
<schema-id>.transitions.js
```

Forms remain transition-milestone material and are intentionally not shipped as passive scaffold in this checkpoint.

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

Manual browser validation is still needed for full UX confidence. Test the dock logo, local workspace filters, Tiinex/docs Discovery leaves, and Lineage independence together.

## Not validated here

```bash
npm run build:public
npm run public:check
```

The sandbox has not reliably provided an installed local Vite runtime for public build verification. Dependency dry-runs passed, but this checkpoint should still be public-build checked in the normal local environment after `npm install`.
