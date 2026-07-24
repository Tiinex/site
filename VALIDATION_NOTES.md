# Validation Notes v231

## v231 PoC lineage comparison

Q compared v230 against the PoC and showed that GitHub issue discovery still did not rebuild the visible parent hierarchy. The v230 issue reader had fixed the earlier Evidence-wrapper mismatch, but it still materialized Tiinex issue payloads as generic read-only Evidence snapshots. In the PoC, issues/comments that contain Tiinex Source Markdown recover the typed artifact inside the GitHub issue/comment, and that recovered artifact participates in loaded Parent Trace lineage.

## Root-cause hypothesis

The v230 browser issue reader collapsed two different source-material cases into one representation:

1. Plain GitHub issue material, which should remain a read-only Evidence snapshot.
2. GitHub issue/comment bodies that contain embedded Tiinex Source Markdown, which should recover the embedded artifact as the artifact, not as an adapter wrapper.

Because the embedded artifact was wrapped as Evidence, the viewer saw an issue shell with no meaningful Parent Trace chain. This caused Lineage to stop at the issue record even when the source material contained a real Tiinex artifact with a declared parent.

## Fix

- Added `src/adapters/github/github.issueEmbedded.js` as the owner for embedded Source Markdown extraction/recovery.
- Updated `src/adapters/github/github.issueSnapshot.js` so:
  - issue bodies/comments with embedded Tiinex artifacts materialize typed records via `createRecordFromMarkdown`;
  - plain issue bodies still materialize as schema-valid Evidence snapshots;
  - recovered records keep `sourceTarget.surface = issueSnapshots` and `targetKind = github-issue-embedded-artifact` / `github-comment-embedded-artifact`;
  - publication boundary source paths are preserved when present, giving relative Parent Trace resolution the same path context as source-backed repo files.
- Extended `src/adapters/github/github.issueSnapshot.test.mjs` to prove embedded issue recovery preserves schema/title/path/trace and traverses to a loaded parent.

## Validation run

Commands run from this checkpoint:

```bash
npm run validate
```

Then after package/source-clean packaging:

```bash
npm run ui:shape
npm run architecture:shape
npm run typecheck
npm run portable:smoke
npm run usecase:uc001
npm run storage:scan
npm run metrics
npm ci --ignore-scripts --no-audit --no-fund --dry-run --os=win32 --cpu=x64
npm ci --ignore-scripts --no-audit --no-fund --dry-run
```

## Manual status

Manual browser validation is still needed before declaring Milestone A closed. The highest-value v231 checks are:

```text
1. Add GitHub source → repo files + issue snapshot discovery for Tiinex/docs.
2. Select an issue-backed record that contains Tiinex Source Markdown.
3. Open Lineage and verify the typed artifact appears, not just an Evidence issue wrapper.
4. Verify the parent/root hierarchy is rebuilt when the parent artifacts are loaded.
5. Verify plain issues without embedded Tiinex payloads still render as read-only Evidence snapshots.
6. Export workspace ZIP.
7. Regression: Discovery / Tree / Lineage / Audit / Display options / header.
```

## Not validated here

```bash
npm run build:public
npm run public:check
```

These remain environment-sensitive in this source-clean sandbox when local Vite runtime is unavailable. Q should run the public build checks locally on v231 before deploy.
