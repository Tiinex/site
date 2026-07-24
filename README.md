# Tiinex Site v231

Checkpoint: `v231`
Version: `0.2.51-v231`
Runtime: `react-v231-issue-embedded-lineage-recovery`

## Focus

Milestone A issue-embedded lineage recovery after Q compared v230 against the PoC. The v230 issue reader made issue snapshots valid Evidence, but it still treated GitHub issues that contain Tiinex Source Markdown as adapter snapshots instead of recovering the typed artifact inside the issue/comment. That made lineage stop at the issue wrapper instead of rebuilding the parent hierarchy visible in the PoC.

## Changes

- Recovered embedded Tiinex Source Markdown from GitHub issue bodies and issue comments:
  - issue/comment bodies with `## Source Markdown` or fenced standalone `# Continuity Context` payloads now materialize the embedded artifact itself;
  - plain GitHub issue bodies still fall back to the read-only Evidence snapshot wrapper from v230;
  - embedded recovery keeps explicit source-target metadata and remains read-only/source-backed.
- Preserved publication-provided source artifact paths when a GitHub issue body declares `Tiinex Source Artifact Path`, so relative Parent Trace resolution can rebuild loaded parent hierarchy instead of anchoring the artifact to the issue URL shell.
- Split embedded issue recovery helpers into `src/adapters/github/github.issueEmbedded.js` to keep the issue snapshot reader below the source-size guard.
- Added regression coverage proving embedded issue Source Markdown preserves Current Schema, title, Parent Trace target, source target class, and loaded lineage traversal to an available parent.

## Non-goals

- No transition/artifact creation activation.
- No schema-builder UI.
- No remote writes or GitHub mutation.
- No hidden background retries.
- No fake GitHub Discussion reader.
- No full PoC issue/comment recovery rewrite; this is the minimal embedded-artifact lineage fix needed before Milestone A testing.

## Supported local start

```bash
npm install
npm run dev
```

The dev server is Vite on `127.0.0.1:5173`.

## Validation

See `VALIDATION_NOTES.md`.
