# Tiinex Site v233

Checkpoint: `v233`
Version: `0.2.53-v233`
Runtime: `react-v233-issue-discovery-hardening`

## v233 focus

Milestone A issue-discovery hardening after browser video feedback: preserve issue-snapshot surface selection across F5/hash restore even when the same-session cache is stale, and keep issue-surface failures degraded inside the GitHub adapter instead of turning the entire source materialization into a fatal UI failure.

## Focus

Milestone A issue-discovery hardening after v232 browser feedback. v231 recovered embedded Tiinex artifacts from GitHub issues/comments, and v232 reduced freeze-lag, but the latest test still exposed two closure risks: F5/hash restore could prefer a stale same-session source cache over the newer route source shell, and an issue-surface exception could still make the whole GitHub source materialization look fatal.

## Changes

- Merged route source shells over same-session cached sources by source id so `issueDiscovery` and `requestedSurfaces.issueSnapshots.requested` survive F5/hash restore.
- Converted issue-surface exceptions into non-fatal `github.issue.surface.exception` warnings owned by the `issueSnapshots` surface.
- Preserved the registered GitHub source boundary even when issue snapshots degrade.
- Kept repo-file, explicit-file, and issue-snapshot receipt ownership separate.
- Kept v232 progress throttling/yielding and bounded issue defaults.
- Added regression tests for route-source overlay and non-fatal issue-surface exceptions.

## Milestone A non-goals

- Artifact creation, transitions, forms, schema-builder UI, remote writes, and full discussion-reader parity remain outside this checkpoint.
- Discussion URLs still degrade honestly rather than pretending to load.
- Full PoC issue/comment recovery remains broader than this stabilization slice.

## Supported local start

```bash
npm install
npm run dev
```

The dev server is Vite on `127.0.0.1:5173`.

## Validation

Use the standard source validation chain plus local public build checks:

```bash
npm run validate
npm run ui:shape
npm run architecture:shape
npm run typecheck
npm run portable:smoke
npm run usecase:uc001
npm run storage:scan
npm run metrics
npm run build:public
npm run public:check
```
