# Tiinex Site v229

Checkpoint: `v229`
Version: `0.2.49-v229`
Runtime: `react-v229-milestone-a-test-readiness`

## Focus

Milestone A test-readiness pass after the v228 source/issue/export closure slice. This checkpoint keeps the Milestone A functionality intact while tightening the global header polish, removing visible source-state boilerplate from the source rail, and adding guards for the cleaned presentation seams.

## Changes

- Polished the global dock/header as a compact Tiinex dock:
  - header-specific button classes avoid relying on broad button cascade;
  - logo centering remains owned by symmetric side tracks;
  - icon buttons, action pills, and logo have one final header contract.
- Removed visible raw source state boilerplate from the source rail:
  - `source.discoveryState` remains internal and inspectable through `data-discovery-state`;
  - registered-but-not-loaded sources no longer render extra `deferred` / `idle` labels;
  - transport pills render only after actual observed transport outcome exists.
- Added UI/architecture guards so the header contract and source rail cleanup cannot silently regress.
- Promoted GitHub issue snapshots from deferred-only to a bounded browser reader for public GitHub issue material:
  - explicit issue URLs are fetched through the shared GitHub transport ladder;
  - repo-wide issue discovery reads a bounded first page of public issues;
  - issue snapshots materialize as source-backed Evidence records;
  - Discussions remain explicitly degraded/deferred when the browser REST reader cannot materialize them.
- Kept source transport truth in the shared transport runtime:
  - configured plan, attempted tiers, winning tiers, skipped tiers, and failed tiers are still recorded in source diagnostics;
  - issue API requests also flow through cache → mirror → proxy → direct events.
- Added an export package zip writer for the browser runtime:
  - workspace export now builds the existing in-memory Tiinex export package bundle;
  - the browser download is a stored ZIP containing manifest, receipt, contract, and bounded material files;
  - source-backed material remains source-reference files, not fake local leaves.
- Added a compact workspace export action using the existing legacy download affordance shape.
- Added tests for the browser zip export writer and updated GitHub adapter tests for real issue snapshot materialization.
- Debt-review closure after comparing the slice against the PoC/source-boundary model:
  - wired the workspace export action from `TiinexApp.jsx` into the workspace surface;
  - preserved resolved GitHub refs after materialization so a pinned source id cannot be overwritten by an unresolved ref;
  - kept issue/discussion snapshot record paths as external source targets rather than rewriting them under the repo root;
  - added a transport-policy guard so explicit issue snapshot loads cannot bypass request budgets.

## Non-goals

- No transition/artifact creation activation.
- No schema-builder UI.
- No remote writes or GitHub mutation.
- No hidden background retries.
- No automatic Discussion reader claim where the current browser API path cannot honestly materialize discussions.

## Supported local start

```bash
npm install
npm run dev
```

The dev server is Vite on `127.0.0.1:5173`.

## Validation

See `VALIDATION_NOTES.md`.
