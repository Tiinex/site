# Validation Notes v230

## v230 no-audio browser review

Q's v229 no-audio video showed two product frictions before the final Milestone A browser pass:

1. GitHub issue snapshots loaded, but they appeared as red `mismatch` Evidence cards because the issue wrapper did not satisfy the Evidence validator's required sections.
2. Issue snapshot cards used a generic boundary summary instead of the issue body's useful human text, so the new reader felt less like the PoC's discovery surface.
3. The Display options dialog still exposed a visible "Deferred PoC controls" explanation. It was truthful, but it added boilerplate instead of helping the test pass.

## Fix

- Reworked GitHub issue snapshot Markdown generation so records remain read-only source-backed Evidence, but include the required Evidence sections:
  - Supported Claim Or Question
  - Provenance
  - Evidence Material
  - Preservation And Fidelity
  - Interpretation Limits
- Projected issue body excerpts into the record summary for better Feed/Search usefulness.
- Kept GitHub discussion URLs explicitly degraded/deferred; no fake discussion reader was added.
- Removed the visible deferred-controls block from Display options.

## v230 test-readiness audit

Q's public-build screenshot confirmed the Windows/Vite build path works in the local environment, but the visible package identity was still `0.2.46-v226`. I treat that as environment evidence, not as direct v230 build proof.

The screenshot pass also showed the empty-stage header still felt unfinished after the source/issue/export closure work.

The review found two presentation debts that would make Milestone A testing noisier than needed:

1. The global dock still depended on broad historical toolbar/button CSS, making the top header look like accumulated patches rather than a single product contract.
2. The source rail rendered internal `source.discoveryState` / idle labels directly, despite those states being lifecycle truth rather than user-facing material. That violated the earlier Add/Source boundary direction to avoid visible boilerplate for a missing/loading system.

## Fix

- Added dock-specific classes in `GlobalDock` and a single final v230 header contract in `src/styles/app.css`.
- Kept the center logo anchored with symmetric side tracks instead of optical transform patches.
- Kept `source.discoveryState` internal on the source pill as a data attribute, removed raw visible `deferred`/`idle` labels, and only shows transport pills after actual transport evidence exists.
- Updated UI and architecture guards for the header/source-rail cleanup.

## Root-cause hypothesis


Milestone A could not close while three PoC parity loops remained only partial:

1. Source transport receipts were present but issue API material still did not use the same concrete materialization path as repo files.
2. Issue snapshot discovery was mostly deferred, which made the Add/source surface look selectable while not producing the material class the user selected.
3. Export package contracts existed in audit/portable code, but the browser viewer lacked a concrete workspace export action that produced a bounded package.

## Fix

- Debt-review follow-up after v227 found three blind spots before manual testing:
  - the export button was rendered but not wired to `exportWorkspacePackage`;
  - resolved GitHub refs could be pinned and then overwritten by an unresolved source update;
  - issue snapshot records could inherit repo-root path rewriting, e.g. `.topics/<repo>/issues/<n>`, instead of preserving the GitHub issue/discussion target.
- Added guards for those seams plus request-budget enforcement for explicit issue snapshot loads.
- Added `src/adapters/github/github.issueSurface.js` to keep issue/discovery ownership outside the already-bounded GitHub adapter.
- Extended `src/adapters/github/github.issueSnapshot.js` with:
  - bounded repo issue discovery;
  - explicit issue target fetching;
  - comment capture within a bounded limit;
  - source-backed Evidence snapshot record creation through the existing artifact record path.
- Updated `src/adapters/github/github.adapter.js` so issue surfaces are reconciled alongside repo and explicit-file surfaces without attributing issue material to repo files.
- Added `src/export/package.zip.js` and `src/export/package.zip.test.mjs` for browser-safe stored ZIP export from the existing export package bundle contract.
- Added a workspace export action that downloads the package ZIP without mutating sources or fetching remote material.

## Validation run

Commands run from this checkpoint:

```bash
npm run validate
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

Manual browser validation is still needed before declaring Milestone A fully closed. The focused checks are:

```text
1. Add → GitHub source → repo files discovery still loads repo Markdown.
2. Add → GitHub source → Issue snapshot discovery with no explicit URLs loads bounded public issue snapshots or gives an explicit unavailable/degraded receipt.
3. Add → GitHub source → explicit issue URL materializes an Evidence snapshot record.
4. Source receipt details show repo/explicit/issues surfaces separately.
5. Export workspace package downloads a ZIP and does not convert source-backed material into local leaves.
6. Discovery, Tree, Lineage, and Audit still behave as in v226.
```

## Not validated here

```bash
npm run build:public
npm run public:check
```

These remain environment-sensitive in this source-clean sandbox when local Vite runtime is unavailable. Q's screenshot proves local Windows Vite can build a prior checkpoint; v230 still needs a local public-build receipt before deploy.
