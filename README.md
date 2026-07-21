# Tiinex Site v138

React/Vite refactor checkpoint focused on **multi-loop PoC parity value**: calmer imported-material UX, visible import diagnostics, and schema-conforming local Continue/Reference draft generation.

`.old/` remains the behavior reference for the public PoC monolith. v138 keeps the v137 local/archive path-tree recovery and adds a larger, still bounded batch: UX projection improvements plus transition correctness.

## Runtime ownership

- React owns rendering and state binding only.
- `src/adapters/**` owns intake/materialization boundaries.
- `src/workspaces/**` owns workspace lifecycle, import routing, persistence-facing state and local/source provenance.
- `src/artifacts/**` owns Markdown parsing and record shaping.
- `src/transitions/**` owns Continue/Reference draft generation.
- `src/schemas/**` owns schema companions and workspace presentation surfaces.
- Local/session workspaces do not infer GitHub/source provenance.
- URL hash remains visible view-state truth; localStorage remains browser-local recovery/cache.

## v138 multi-loop parity batch

This checkpoint intentionally works on more than one user-facing slice, while keeping ownership bounded:

1. **Imported-material UX projection**
   - Adds a compact material summary row in each workspace.
   - Shows artifact, asset, workspace-candidate and source-backed counts without repeating boilerplate.
   - Shows latest import result/warnings/errors as diagnostics, not a large text box.

2. **Tree/readability parity polish for new bits**
   - Path-tree rows are calmer, shorter and less badge-heavy.
   - Record/asset/workspace cards move long paths into a path line instead of stuffing them into badge rows.
   - Folder counts use compact chips while preserving aria labels.

3. **Transition semantic hardening**
   - Continue/Reference now generate drafts with a Root-style continuity envelope:
     - Envelope Schema
     - Parent Schema
     - Trace
     - Origin when available
     - Current Schema
     - Created At
     - draft integrity marker
   - Tests parse the generated markdown and assert root-required envelope fields are present.

## Local manual check

```bash
npm install
npm run test
```

For local Windows/PowerShell environments where `npm.ps1` is blocked, use `yarn.cmd` equivalents if dependencies are installed.

## Manual behavior to test

1. Drop a large source zip/folder and verify the workspace shows a compact summary row instead of duplicate boilerplate.
2. Switch to Tree and verify path groups are readable, compact and still expandable.
3. Open a record, use Continue, create a local continuation, then open it and confirm the markdown preview contains Envelope Schema / Parent / Current / Continuity Integrity.
4. Use Reference and confirm it creates a local evidence-style draft with the same root envelope fields.
5. Confirm local/archive material remains local/session and GitHub material remains source-backed.
