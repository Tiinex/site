# Tiinex Site v236

Checkpoint: `v236`
Version: `0.2.56-v236`
Runtime: `react-v236-issue-lineage-source-recovery`

## v236 focus

Milestone A issue-backed lineage recovery. v235 restored the PoC-like transport badge, but the latest video showed that an issue-backed artifact could still remain isolated: the issue body recovered the typed artifact, but its declared Parent Trace did not materialize the same source-backed parent hierarchy the PoC made reachable.

## What changed

- GitHub issue publication parsing now accepts legacy/PoC boundary labels such as `Source Path` and `Source Artifact`, not only `Tiinex Source Artifact Path`.
- Issue/comment bodies that contain embedded Tiinex Source Markdown keep the recovered artifact's source path when the publication boundary provides it.
- `Load full lineage` can now perform source-assisted recovery for missing declared Parent Trace targets inside the same explicit GitHub source boundary.
- Exact parent recovery fetches declared repo-relative parent files; it does not guess by basename and does not cross source boundaries.
- Explicit file loading can resolve the repository default branch when a source was registered without a pinned ref.
- Source-assisted lineage recovery is owned by `src/app/lineageSourceRecovery.js`, keeping `TiinexApp.jsx` below the app-controller line budget.

## Milestone A non-goals

- No artifact creation, transitions, or forms.
- No remote writes.
- No fake discussion reader.
- No background retry loop.
- No broad recursive clone or arbitrary parent guessing.

## Supported local start

```bash
npm install
npm run dev
```

The dev server is Vite on `127.0.0.1:5173`.

## Validation

```bash
npm run validate
npm run ui:shape
npm run architecture:shape
npm run typecheck
npm run portable:smoke
npm run usecase:uc001
npm run storage:scan
npm run metrics
```

Public build still needs an environment with local Vite installed:

```bash
npm run build:public
npm run public:check
```
