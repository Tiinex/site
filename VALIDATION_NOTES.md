# Validation Notes v203

Base: latest user-provided v202 checkpoint zip (`site(19).zip`) with Q's local dependency repair.

v203 is a package-lock platform guard calibration. It changes install/checkpoint hygiene, not product surface behavior.

## What changed

- `package-lock.json` still includes explicit Linux x64 and Windows x64 native optional entries for Rolldown, Lightning CSS, and TypeScript.
- `tools/check-package-lock-platforms.mjs` no longer requires Linux `libc` metadata when npm's package-lock entry does not persist it.
- The guard still validates parent optionalDependencies, package presence, version, resolved URL, integrity, optional flag, os, and cpu.
- Package/checkpoint/build identity moved from `0.2.22-v202` to `0.2.23-v203`.

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

- Actual Windows `npm ci` and `npm run dev` still need Q's Windows environment to confirm native package install/runtime.
- Full `npm run runtime:smoke`, `npm run build:public`, `npm run public:check`, `npm run typecheck`, and full `npm run test` should be run in a dependency-installed environment.
- Metrics remain non-blocking diagnostics.
- Real issue snapshot reader, partial promotion, full mirror/proxy parity, and binary asset fetching remain out of scope.
