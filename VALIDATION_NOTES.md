# Validation Notes v240

## Root cause / scope

v239 made issue transport/materialization diagnostics clearer, but Q's browser test still showed PoC parity was not met: the app reported `Issue snapshots: 13 loaded` while only three source-backed records were visible in the workspace.

PoC research points to a source identity seam, not a lineage-UX seam. PoC issue import assigns distinct material paths to issue shells, comment shells, and recovered embedded artifacts. The refactor lifecycle canonicalized all `issueSnapshots` material by `sourceTarget.inputTarget`; because URL hashes were stripped, comment-derived records from the same issue collapsed to the issue URL and overwrote each other.

v240 repairs that seam without importing Copilot's broader lineage/UI changes.

## Changes

- `src/workspaces/workspace.lifecycle.js`
  - embedded issue/comment artifacts now canonicalize by `sourceArtifactPath` / `record.path` instead of issue URL;
  - plain issue snapshot evidence still canonicalizes by issue URL;
  - comment-scoped source targets preserve `#issuecomment-*` anchors when they are the material identity;
  - repo-file canonicalization and rootPath behavior are unchanged.

- `src/adapters/github/github.issueEmbedded.js`
  - recovered embedded artifacts expose `sourceTarget.sourceArtifactPath` so lifecycle can use the PoC-like material path;
  - Source Markdown wrapper blocks are not imported a second time as synthetic artifacts;
  - conservative `<details><summary>Tiinex source payload</summary>` behavior is preserved.

- Tests updated:
  - `src/adapters/github/github.issueSnapshot.test.mjs` proves one issue with two embedded comment payloads materializes distinct recovered artifact records with distinct paths and anchored provenance;
  - `src/workspaces/workspace.lifecycle.test.mjs` proves `addWorkspaceSourceRecords` preserves multiple comment-embedded records from one issue instead of collapsing them to the issue URL;
  - existing plain issue URL/rootPath guard now runs inside the main test body instead of after `process.exit`.

## Validation run here

```bash
node src/adapters/github/github.issueSnapshot.test.mjs
node src/workspaces/workspace.lifecycle.test.mjs
npm run validate
npm run architecture:shape
npm run ui:shape
npm run metrics
npm run storage:scan
npm run typecheck
```

All passed.

## Not verified here

```bash
npm run build:public
npm run public:check
node --check .site-publish/tiinex.bundle.js
```

This sandbox source tree does not include `node_modules/.bin/vite`, so `npm run build:public` cannot run here. Verify after `npm install`/`npm ci` in the local Windows dev environment.

## Known limits

- This checkpoint targets issue/comment record identity, not full lineage traversal parity.
- GitHub API 403/rate limits remain an expected anonymous-browser limitation, not automatically a regression.
- Mirror only succeeds when hosted issue snapshots exist at a configured/default location; otherwise it should degrade honestly.
- Proxy/mirror must not silently fall through to direct during explicit tier tests.
- Discussions remain deferred.

## Next batch

Targeted lineage recovery/parity after browser confirms issue/comment records are no longer collapsed:

```txt
selected artifact → declared Parent Trace / Origin → targeted source-boundary parent-file recovery
```

It must not become issue discovery, proxy crawling, broad repo scan, or basename guessing.
