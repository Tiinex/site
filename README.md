# Tiinex Site v202

v202 is a dependency-lock portability repair on top of v201. It does not add viewer, source-transport, or portable-tooling product features. It repairs the v201 npm lock so native optional dependencies needed by Vite/Rolldown, Lightning CSS, and TypeScript are represented for both Linux x64 and Windows x64.

## v202 batch

- Keeps npm + `package-lock.json` + `npm ci` as the repository dependency truth.
- Keeps direct dependencies exact-version pinned.
- Adds Linux and Windows native optional package entries to `package-lock.json` for:
  - `@rolldown/binding-linux-x64-gnu`
  - `@rolldown/binding-win32-x64-msvc`
  - `lightningcss-linux-x64-gnu`
  - `lightningcss-win32-x64-msvc`
  - `@typescript/typescript-linux-x64`
  - `@typescript/typescript-win32-x64`
- Adds `tools/check-package-lock-platforms.mjs` to fail validation if the lock regresses to a single-platform native-binding lock.
- Wires that guard into `npm run validate` after checkpoint identity validation.
- Updates checkpoint/build identity from v201 to v202.

## Still intentionally out of scope

- New viewer UX, Lineage polish, or Display Options behavior.
- New portable-tooling operations.
- Real browser issue snapshot reading.
- Partial record promotion during GitHub import.
- Full mirror/proxy parity.
- Automatic binary asset fetching.
- Splitting `workspace.views.jsx` into surface files.
- Making `metrics` a blocking release policy without explicit thresholds.

## Supported local start

Use the dev server for local browser validation:

```bash
npm ci
npm run dev
```

On Windows this checkpoint is intended to install the Win32 native optional packages through `npm ci` rather than requiring a manual `--no-save` install.

## Release/checkpoint gate

Run:

```bash
npm ci
npm run validate
npm run portable:smoke
npm run ui:shape
npm run typecheck
npm run runtime:smoke
npm run usecase:uc001
npm run storage:scan
npm run metrics
npm run build:public
npm run public:check
```

`npm run test` runs the blocking gate except `metrics`, which remains diagnostic until thresholds are defined.
