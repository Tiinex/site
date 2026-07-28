# Validation Notes v288

## Root hypothesis

After v287, remaining latency is small enough that the main technical lockup is mostly resolved. The remaining mobile issue is perceived tap latency when opening a record: the dialog shell and schema-owned read projection are created in the same render path, so the first visual response can wait for Markdown/read parsing.

A separate source-workflow need emerged: hosted Tiinex apps should be usable as configuration sources so a tester can point the viewer at another Tiinex app, discover its configured workspace source plan, and then load that source through normal source semantics.

## Changed

- `RecordDetailDialog` now uses a `DeferredSchemaReadView` shell. The modal appears first; the heavier `SchemaReadView` mounts on the next animation frame.
- Mobile/coarse styles add immediate tap feedback and keep record detail actions sticky/reachable inside the sheet.
- `src/app/tiinexAppConfigSource.js` owns Tiinex-hosted app config discovery and mapping to GitHub source input.
- `AddToWorkspaceDialog` exposes a `Tiinex app config` choice without changing GitHub source semantics.
- Config fetch supports HTML link/meta declarations and conventional Tiinex config paths. Hosts still need browser-readable CORS.
- The Drop-mode duplicate hidden input was removed while touching the add flow.

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

1. Load Tiinex/docs with repo files and issues.
2. Use mobile/device viewport.
3. Tap record Open/read actions and confirm the sheet appears faster, even if the full read projection fills in a moment later.
4. Confirm Feed/Tree/Lineage switches and search stay at least as good as v287.
5. Use Add → Tiinex app config with a hosted app URL that exposes config. It should fetch config, resolve the first GitHub entrypoint, and load through the usual source materialization path.
