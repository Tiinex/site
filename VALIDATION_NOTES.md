# Validation Notes v201

Base: latest available user-provided v200 checkpoint zip with portable tooling included.

v201 is a consolidation pass. It changes install/release/checkpoint hygiene and a parser regression, not product surface behavior.

## What changed

- Direct dependencies are exact-version pinned.
- `package-lock.json` is included and `yarn.lock` is removed.
- Public workflow uses `npm ci` and a fuller release gate.
- `portable:smoke` proves the public CLI process entrypoint is wired.
- `typecheck` is a named script using the current full `tsconfig.json` baseline.
- `check-checkpoint-identity` verifies package, runtime, README, Validation Notes, public build source, and parity ledger checkpoint consistency.
- `artifact.parse.test.mjs` protects missing-Parent parsing.

## Validation run in the working tree

```bash
npm run validate
npm run portable:smoke
npm run ui:shape
npm run typecheck
npm run usecase:uc001
npm run storage:scan
npm run metrics
```

`npm run runtime:smoke`, `npm run build:public`, `npm run public:check`, and full `npm run test` require installed Vite/React dependencies from `npm ci`.

## Validation run from source-clean zip

```bash
npm run validate
npm run portable:smoke
npm run ui:shape
npm run typecheck
npm run usecase:uc001
npm run storage:scan
```

## Known limits

- `package-lock.json` was generated from the existing `yarn.lock` dependency resolution because the sandbox could not complete a networked lock regeneration.
- Full public build/runtime smoke should be run in an environment where `npm ci` can install dependencies.
- Metrics remain non-blocking diagnostics.
- Real issue snapshot reader, partial promotion, full mirror/proxy parity, and binary asset fetching remain out of scope.
