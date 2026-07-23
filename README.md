# Tiinex Site v201

v201 is a release/checkpoint consolidation pass on top of v200. It does not add viewer or portable-tooling product features. It tightens the checkpoint so the same source can be installed, validated, typechecked, built, and published through one explicit gate.

## v201 batch

- Pins direct runtime/build dependencies to exact versions.
- Switches the repository dependency truth to npm + `package-lock.json` + `npm ci`.
- Removes `yarn.lock` from the source checkpoint.
- Adds `packageManager: npm@10.9.2` to `package.json`.
- Adds `npm run portable:smoke` for the public process entrypoint:
  - `node tools/tiinex-portable.mjs operations --compact`
  - `node tools/tiinex-portable.mjs inspect src/artifacts/fixtures/topic.trace.md --compact`
- Adds `npm run typecheck` as a named TypeScript no-emit gate.
- Expands the public workflow to run validate, portable smoke, UI shape, typecheck, runtime smoke, UC-001, storage scan, public build, and public check.
- Keeps `npm run metrics` as diagnostic output, not a release blocker.
- Adds a single build/checkpoint identity module and a guard to catch package/README/validation/parity/runtime drift.
- Repairs the artifact parser Parent-block bug where missing `- Parent` could cause `Current Created At` to be read as parent metadata.
- Adds parser regression tests for root-without-parent, child-schema-without-artifact-parent, valid Parent blocks, and Current/Parent separation.

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

Open the printed localhost URL and test against source zips/workspaces.

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
