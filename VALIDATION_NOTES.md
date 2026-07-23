# Validation Notes v202

Base: latest available user-provided v201 checkpoint zip (`site(18).zip`).

v202 is a dependency-lock portability repair. It changes install/checkpoint hygiene, not product surface behavior.

## What changed

- `package-lock.json` now includes explicit Linux x64 and Windows x64 native optional entries for Rolldown, Lightning CSS, and TypeScript.
- `tools/check-package-lock-platforms.mjs` validates those lock entries and their parent `optionalDependencies` mappings.
- `npm run validate` now runs the package-lock platform guard immediately after checkpoint identity validation.
- Package/checkpoint/build identity moved from `0.2.21-v201` to `0.2.22-v202`.

## Validation run in the working tree

```bash
npm run validate
npm run portable:smoke
npm run ui:shape
npm run usecase:uc001
npm run storage:scan
npm run metrics
npm ci --ignore-scripts --no-audit --no-fund --dry-run
npm ci --ignore-scripts --no-audit --no-fund --dry-run --os=win32 --cpu=x64
npm ci --ignore-scripts --no-audit --no-fund --dry-run --os=linux --cpu=x64
```

## Validation run from source-clean zip

```bash
npm run validate
npm run portable:smoke
npm run ui:shape
npm run usecase:uc001
npm run storage:scan
npm ci --ignore-scripts --no-audit --no-fund --dry-run --os=win32 --cpu=x64
npm ci --ignore-scripts --no-audit --no-fund --dry-run --os=linux --cpu=x64
```

## Known limits

- Full `npm ci`, `npm run dev`, `npm run runtime:smoke`, `npm run build:public`, `npm run public:check`, `npm run typecheck`, and full `npm run test` should be run in a network/cache-enabled environment where dependencies can actually install.
- The sandbox validation used dry-run install checks to verify the lock plan and local Node tests for source-only guards.
- Metrics remain non-blocking diagnostics.
- Real issue snapshot reader, partial promotion, full mirror/proxy parity, and binary asset fetching remain out of scope.
