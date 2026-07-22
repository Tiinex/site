# Tiinex Site v194

v194 is a focused source-plan reconciliation pass on top of v193 plus the additive portable-tooling slice. It does not change portable-tooling ownership paths and does not reopen Feed ranking, partial promotion, issue-reader implementation, mirror/proxy parity, or Lineage polish.

## v194 batch

- Normalizes GitHub source plans into explicit surfaces: boundary, repo files, explicit files, and issue snapshots.
- Keeps per-surface result state: requested, attempted, discovered/targets, loaded, failed, deferred, skipped, and unavailable.
- Preserves per-record material attribution for GitHub-loaded Markdown: source target, surface, target kind, and transport tier.
- Prevents issue/discussion targets from being counted as repo-file results when the issue reader is deferred.
- Makes invalid explicit issue URLs stay owned by the explicit-files surface instead of becoming repo-file material.
- Adds transport outcome diagnostics separate from the configured transport plan: attempted tiers and winning tiers are separate claims.
- Persists source plan, record attribution, and transport outcome on the configured source after materialization.
- Surfaces compact per-surface receipt details in the workspace material summary when a source result is degraded or warning-bearing.

## Still intentionally out of scope

- Feed ranking/product sorting decisions.
- Partial record promotion during GitHub import.
- A real browser issue snapshot reader.
- Automatic binary asset fetching.
- Full PoC mirror/proxy snapshot parity beyond current diagnostics and available browser readers.
- Lineage-card UX polish.
- Portable-tooling changes.

## Supported local start

Use the dev server for local browser validation:

```bash
npm run dev
```

Open the printed localhost URL and test against source zips/workspaces.

## Validation

Run:

```bash
npm run validate
npm run ui:shape
npm run usecase:uc001
npm run metrics
npx tsc --allowJs --jsx react-jsx --noEmit --skipLibCheck --moduleResolution bundler --module ESNext --target ES2022 src/app/TiinexApp.jsx src/schemas/workspace/workspace.views.jsx src/schemas/workspace/workspace.add.views.jsx src/schemas/companion.js
```

`npm run build:public` still requires installed Vite/React dependencies.
