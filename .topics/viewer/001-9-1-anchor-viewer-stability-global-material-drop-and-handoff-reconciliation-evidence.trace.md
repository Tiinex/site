# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: tiinex.task.v1
  - Created At: 2026-09-03 00:18:00
  - Trace: [Viewer Stability Global Material Drop And Handoff Reconciliation Task](001-9-viewer-stability-global-material-drop-and-handoff-reconciliation-task.trace.md)
  - Origin:
    - [relative](001-9-viewer-stability-global-material-drop-and-handoff-reconciliation-task.trace.md)
- Current
  - Current Schema: tiinex.evidence.v1
  - Created At: 2026-09-03 00:19:00
  - Authors: Anchor
  - Why: Preserve the local implementation and validation boundary for the Viewer stability, explicit drag/drop scope, recipient-v2 Handoff reconciliation, transient package-session, and Playthings interaction-cost fixes before Tiinusen manual retesting.
  - Summary: Viewer material intake now avoids several repeated whole-state costs, recipient-v2 Handoff packages reuse current Tooling qualification and reconcile workspaces globally, ordinary drops route by explicit target scope, and Playthings transition/camera interaction avoids identified population/stale-callback costs without introducing static monolith debt.
  - Status: ready/local

---

# Viewer Stability And Handoff Reconciliation — Implementation Evidence

## Preserved Material

- Material Description: Site-local Viewer lifecycle/persistence/import changes, recipient-v2 Handoff package intake and reconciliation, archive filtering, explicit global/workspace drag/drop routing, and bounded Playthings interaction/camera fixes.
- Material Kind: implementation checkpoint and local validation evidence.

## Preservation Act

- Preservation Method: complete carried Site workspace snapshot plus this readable Evidence artifact and explicit validation receipts.
- Preservation Time Or State: local checkpoint after focused lifecycle/import/persistence/DnD/Playthings tests and direct TypeScript/browser/UI/smoke/integration qualification.

## Supported Claim Or Question

- Supported Claim Or Question: whether the observed multi-workspace interaction lag and confusing active-workspace drop behavior had concrete local Viewer causes that could be reduced while aligning package intake with current Tooling multi-workspace semantics.
- Evidence Role: supports manual retesting and later Anchor integration review; it does not prove device-independent performance, production readiness, absence of all source/network activity, or final camera feel.

## Provenance

- Known Source: carried Tiinex/site Viewer and Playthings implementation plus Tiinusen manual observations of Docs-triggered lag, interaction stalls, Fit/Follow non-response, and package/workspace drag/drop friction.
- Preservation Basis: source inspection, bounded synthetic comparison, current recipient-v2 package intake exercise using the actual prior Handoff package, and local validation commands.
- Provenance Limits: no browser profiler trace, network capture, production performance benchmark, remote GitHub mutation, or human acceptance receipt for this checkpoint is preserved.

## Evidence Material

- Material: Site-local Viewer stability and Playthings interaction source plus focused validation cases for workspace lifecycle/import/persistence, recipient-v2 intake, drag/drop routing, camera, and Playthings behavior.
- Material Kind: implementation source and local validation evidence.

- Source Surface: src/workspaces/workspace.lifecycle.js and workspace.import.js for batch import and explicit global recipient creation.
- Persistence Surface: src/workspaces/workspace.route.js, workspace.persistence.js, and src/app/statePersistenceScheduler.js for lightweight deferred view-state persistence.
- Package Surface: src/app/handoffPackageRecipientV2.js and handoffPackageImportCommand.js for Tooling-backed recipient-v2 qualification and modular reconciliation.
- Archive Surface: src/adapters/archive/archive.adapter.js for pre-decompression entry filtering used to materialize Viewer-relevant Markdown only.
- Intake Surface: src/app/useLocalMaterialIntake.js, localMaterialCommand.js, and TiinexApp.jsx for transient-session/global-vs-workspace drag/drop routing.
- Playthings Surface: src/experiments/playthings/PlaythingsWorldStage.jsx for lazy hovered-leaf transition qualification and latest-callback Follow sampling.
- Test Surface: focused workspace lifecycle/import/persistence/product-routing cases and Playthings camera/clock/model/motion/profile/refresh/seed/Tech Tree/timeline/world/presentation cases.

## Validation Receipts

- Focused workspace lifecycle case: PASS.
- Focused workspace import lifecycle case: PASS, including ordinary global drop creating a new workspace rather than inheriting active workspace.
- Focused workspace persistence case: PASS, including deferred view-state write omitting record/asset route material while preserving existing local/session material stores.
- Workspace DnD/product routing case: PASS, including global Playthings drop and scoped concrete-workspace drop boundaries.
- Recipient-v2 actual-package intake exercise: PASS for detection/qualification of three qualified Workspace projections (Business, Docs, Site); a repeated intake reconciled/replaced the same three rather than duplicating them.
- Bounded synthetic batch-import comparison: prior per-record whole-state cloning measured approximately 355.5 ms versus approximately 31 ms after one-clone batch insertion for the same synthetic 3-workspace / 240-existing-record / 150-added-record shape. This is directional local evidence only, not a production benchmark.
- Playthings focused cases: PASS, including camera, clock, model, motion, profile, refresh, seed, Tech Tree, timeline, world, and presentation behavior.
- TypeScript noEmit: PASS.
- Browser import boundary: PASS — 519 reachable production modules, zero Node import edges, zero broad portable barrel edges, zero package-pressure fixture edges, and zero unresolved local imports.
- React UI shape: PASS.
- smoke validation profile: PASS — 2/2 at checkpoint 20260902T221707891Z-14446-f4cf8555.
- integration validation profile: diagnostic-qualified — 12/12; static regression classification retained only two inherited Tooling debt surfaces and introduced zero new static debt.
- static regression-aware diagnostic: inherited-debt-only; inherited=2; introduced=0; resolved=11.
- public build: NOT CLAIMED. A build attempt did not return a result before the local container transport timeout, so no build PASS is inferred.

## Semantic And Operational Boundary

- Remote Fetch Boundary: source inspection did not identify normal Feed/Playthings render, hover, pause, or selection as an automatic GitHub material-fetch loop. This evidence does not prove zero network calls in every host path; it supports fixing the concrete local repeated-state costs rather than speculating about remote spam.
- Persistence Boundary: transient recipient-v2 package material remains browser-local session projection and is not treated as new semantic provenance or durable Tiinex history.
- Package Boundary: Tooling topology qualification decides recipient-v2 workspace representation. Viewer reconciliation consumes that qualified structure but does not redefine package semantics.
- Workspace Identity Boundary: existing workspace id/import context/repository affinity may identify a unique reconciliation target; ambiguous matches are not guessed.
- Drop Boundary: target surface determines ordinary local-material scope. Handoff package semantics remain global independently of pointer location.
- Playthings Boundary: global package/material state changes remain Viewer workspace state changes; Playthings observes them through its existing projection/timeline model and does not become the package authority.
- Transition Boundary: lazy resolution changes when qualified transition products are computed, not what constitutes a valid transition.
- Camera Boundary: Follow/Fit are View behavior only and do not affect lineage, world semantics, or artifact state.

## Known Limits

- Tiinusen must manually verify the subjective interaction-latency improvement with representative Business/Docs/Site material in the browser.
- No browser Performance trace or network waterfall is preserved, so residual rendering, Markdown, source-cache, or host-level costs may remain.
- Fit World and Follow have corrected code paths and passing pure camera tests, but manual behavior acceptance remains required because no browser E2E receipt is preserved.
- Recipient-v2 package intake currently projects Markdown/workspace material needed by Viewer rather than serving as a general arbitrary repository filesystem mount.
- Transient package-session material is intentionally not guaranteed across page reload unless separately imported/preserved through a future designed mechanism.
- Playthings delta continuation relies on compatible observation history; an incompatible historical prefix still requires deterministic rebuild rather than false suffix continuation.

## Preservation And Fidelity

- Preservation State: implementation source, focused tests, validation receipts, and current artifacts are preserved in the carried Site workspace.
- Fidelity Notes: exact local code for persistence policies, batch lifecycle, recipient-v2 reconciliation, drag/drop scope, archive filtering, lazy transition resolution, and Follow callback handling is preserved. Manual latency and camera feel remain observational properties.
- Known Losses: no browser profiler/network trace, build receipt, device matrix, production benchmark, or human acceptance result is preserved.

## Preservation And Custody

- Storage Or Custody State: implementation remains in the carried local Site workspace because remote GitHub mutation is unavailable in this chat.
- Business/Docs Boundary: Business and Docs are carried unchanged as Handoff context; no source mutation is performed there.
- Refactor Boundary: this checkpoint intentionally continues the already-known Playthings/Viewer line without fresh site/refactor reconciliation, per Tiinusen direction.
- Promotion Boundary: transient package/session and DnD behavior remain Site implementation choices subject to later integration/rebase qualification.

## Fidelity And Loss

- Fidelity Notes: the carried Site workspace preserves the exact modular implementation and direct validation receipts described above, including the Tooling-backed recipient-v2 intake boundary and zero-introduced-static-debt result. The approximate synthetic batch timing is preserved only as a bounded directional observation, not as a reproducible production performance guarantee.
- Known Losses: the user-observed ten-second interaction delay was not captured in a profiler before repair; no browser network recording proves the absence of every possible host fetch; no successful public-build receipt is preserved; manual Fit/Follow and end-to-end package-drop acceptance remain outstanding.

## Custody Or Storage Boundary

- Storage Or Custody State: source, local test fixtures/receipts, and this Evidence are carried in the Site workspace; Business/Docs remain unchanged package context.
- Reuse Boundary: the checkpoint may be used for manual Viewer/Playthings retesting and later Anchor integration, but it does not authorize production performance claims, remote-source behavior claims beyond the inspected paths, or canonical transport semantics outside qualified Tooling contracts.

## Interpretation Limits

- Does Not Prove: zero network traffic, universal performance improvement, production readiness, semantic identity from repository affinity alone, or that transient Viewer package projection is durable preservation.
- Must Not Be Treated As: authority to infer ambiguous workspace matches, bypass Tiinex package qualification, persist package transport as semantic truth, or replace lineage-compatible delta checks with cosmetic continuation.
- Not Yet Used As: merge acceptance, release qualification, production UX acceptance, or source-adapter redesign authority.

# Continuity Integrity

- sha256-base64url-c14n-v2
  - Towards: [Viewer Stability Global Material Drop And Handoff Reconciliation Task](001-9-viewer-stability-global-material-drop-and-handoff-reconciliation-task.trace.md)
  - Value: iEyg-MExkP8j2kKYc-zpqHlKaoVpoBZw16hclm2Mc0w

- sha256-base64url-c14n-v2
  - Towards: self
  - Value:PvuuG56xVJE7VKoKcfEvsDqxxQwKLAS1vh8o4ZZciV8
