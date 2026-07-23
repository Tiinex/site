# Tiinex Site v203

v203 is a package-lock platform guard calibration on top of v202. It keeps the v202 dependency-lock portability repair, but fixes the validation guard so it accepts npm lockfiles that include Linux/Windows native optional packages without persisted `libc` metadata.

## v203 batch

- Keeps npm + `package-lock.json` + `npm ci` as the repository dependency truth.
- Keeps direct dependencies exact-version pinned.
- Keeps Linux and Windows native optional package entries in `package-lock.json` for Rolldown, Lightning CSS, and TypeScript.
- Updates `tools/check-package-lock-platforms.mjs` so it guards the evidence npm actually preserves reliably:
  - parent `optionalDependencies` mappings
  - optional package entry presence
  - version
  - resolved tarball URL
  - integrity hash
  - `os`
  - `cpu`
- Does not require Linux `libc` metadata unless the package-lock entry explicitly contains a `libc` field.
- Updates checkpoint/build identity from v202 to v203.

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

On Windows this checkpoint should install the Win32 native optional packages through `npm ci`; no manual `--no-save` install should be needed.

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
