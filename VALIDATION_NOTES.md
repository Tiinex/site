# Validation Notes v291

## Root hypothesis

The v290 video showed that hosted Tiinex app config was discovered, but React did not match the PoC user expectation. It loaded a broad repo materialization path instead of presenting the app's workspace discovery catalog/chooser semantics. The likely owner was config-source ordering plus missing propagation of `Workspace Discovery` `Match` into GitHub materialization.

## Changed

- Hosted config intake now mirrors the PoC order: explicit link/meta config first, runtime candidates/issue pointers next, embedded default workspace next, and static path conventions last.
- This avoids accidentally selecting a packaged `.topics/.workspaces/viewer.workspace.md` path before the PoC's embedded/runtime bootstrap.
- Workspace Discovery keeps `Match: *.workspace.md` and passes it through source registration/materialization.
- GitHub repo discovery filters matched workspace config files before materializing records.
- Preloaded repo mirror/cache records are also filtered by the same match before being committed.
- Source route shells preserve workspace discovery metadata so reload/back/forward do not erase the chooser boundary.

## Validation run in sandbox

```bash
npm run validate
npm run architecture:shape
npm run ui:shape
npm run metrics
npm run storage:scan
npm run typecheck
npm run portable:smoke
```

## Not verified in sandbox

```bash
npm run build:public
npm run public:check
node --check .site-publish/tiinex.bundle.js
```

`npm run build:public` still exits status 1 without useful output in this sandbox.

## Manual test target

1. Add → Tiinex app config → `https://tiinex.dev/`.
2. The app should resolve the same PoC-style bootstrap path instead of blindly preferring the packaged dot-path fallback.
3. Workspace Discovery should materialize matched `.workspace.md` records, not every Markdown artifact under `.topics`.
4. Workspace records should remain visible with Open / Merge actions.
5. Open should switch context; Merge should merge context without closing the current workspace.
