# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-11 19:59:40
  - Trace: [001-1-1-1-anchor-to-kodax-viewer-major-003-qualification-ownership-repair-current-baseline-handoff.trace.md](handoffs/001-1-1-1-anchor-to-kodax-viewer-major-003-qualification-ownership-repair-current-baseline-handoff.trace.md)
  - Origin:
    - [relative](handoffs/001-1-1-1-anchor-to-kodax-viewer-major-003-qualification-ownership-repair-current-baseline-handoff.trace.md)
- Current
  - Current Schema: tiinex.evidence.v1
  - Created At: 2026-09-11 20:21:03
  - Authors: Kodax
  - Why: Preserve exact repair evidence before returning Viewer Major 003 orchestration to Anchor.
  - Summary: Bounded App qualification ownership repair with current cross-repository machine baseline and preserved parity limits.
  - Status: ready/local

---

# Viewer Major 003 — Qualification Ownership Repair — Kodax Evidence

## Preserved Material

- Material Description: bounded repair and requalification of the extraction-era Viewer qualification ownership drift identified by the prior Site reconciliation, using the exact carried Site/App/Core/provider/Verse source snapshots.
- Material Kind: locally modified App qualification sources, carried multi-workspace source snapshots, locally executed package/case qualification receipts, and bounded current-baseline analysis.

## Preservation Act

- Preservation Method: materialize only qualified carried Workspaces through Tiinex portable Tooling after the selected Site Handoff reached grounded-to-act; compose exact carried dependencies through disposable local symlinks with no network install; repair only stale App-facing qualification ownership/checkpoint assumptions; run owner-correct package and Foundation gates; preserve exact remaining cross-owner diagnostic failures rather than manufacturing replacements.
- Preservation Time Or State: captured on 2026-09-11 after the bounded App qualification repair and current multi-repository machine requalification, before Native Verse implementation, fresh browser/manual acceptance, remote mutation, release, deployment, publication, or PoC retirement.

## Supported Claim Or Question

- Supported Claim Or Question: whether Viewer Major 003 repaired the five previously identified extraction-era App integration qualification failures without changing Viewer product behavior or overclaiming the 25-scenario parity ledger, and what exact blocker remains next.
- Evidence Role: supports the Kodax-to-Anchor completion return for Viewer Major 003; proves the bounded qualification-ownership repair and current machine baseline only.
- Claim Reference: [Viewer Major 003 Task](001-1-1-viewer-major-003-qualification-ownership-repair-current-baseline-task.trace.md)
- Review Context: [Anchor To Kodax Viewer Major 003 Handoff](handoffs/001-1-1-1-anchor-to-kodax-viewer-major-003-qualification-ownership-repair-current-baseline-handoff.trace.md)

## Provenance

- Known Source: exact qualified Workspaces carried by `tiinex-site-003-anchor-to-kodax.handoff-package.zip`; Site, App, Core, provider-github, provider-native, verse-native and verse-playthings were materialized through Tiinex portable Tooling rather than package archaeology.
- Preservation Basis: the prior Site reconciliation Evidence defines the seven retained Viewer product-contract groups, the 25-scenario `partial` boundary, the five extraction-era integration failures, the Native Verse composition gap, the bounded Reference intentional change, and broader Reference UNKNOWN. Current source ownership and current machine results are used only to repair/refine mechanical qualification truth.
- Local Composition Basis: App was linked only to the exact carried Core snapshot for qualification; providers and Site were linked only to exact carried local package snapshots. No registry install or remote source acquisition occurred.
- Provenance Limits: no old PoC runtime comparison, current desktop/mobile browser pass, current Sigma acceptance, live GitHub mutation, deployment, release, or publication occurred.

## Evidence Material

- Material: exact repair file set, before/after failure classification, current owner-correct machine qualification, legacy cross-owner diagnostic boundary, unchanged product-parity limits, and next owner/blocker.
- Material Kind: technical repair and qualification evidence.

### Exact Bounded Repair

No Viewer runtime/product behavior source was changed. The repair is qualification/documentation-only inside the extracted App workspace:

1. `src/schemas/schema.companionContract.case.mjs`
   - Before: required executable `.schema.json` / `.schema.js` companions to exist locally under App for every Core registry module.
   - After: App must retain the readable versioned Markdown snapshots while executable companion module/snapshot naming is asserted from the imported Core registry.
   - Classification: extraction ownership repair; Core remains semantic/executable owner.

2. `src/acceptance/knownScenarios.case.mjs`
   - Before: derived the Viewer checkpoint from an assumed `-v470` suffix on the App package version.
   - After: validates normal App semver independently and binds the carried known-scenario matrix to `TIINEX_SITE_CHECKPOINT` from the retained Viewer build identity.
   - Classification: package/checkpoint decoupling; no ledger status promotion.

3. `src/publication/publication.githubSocialContract.case.mjs`
   - Before: read App-local `publication.contract.js` and `publication.targetContract.js` source files that moved to Core.
   - After: resolves and reads the declared `@tiinex/core/publication/...` package exports through `import.meta.resolve` for the same side-effect/host-neutral source assertions.
   - Classification: publication ownership repair; Core remains authority owner.

4. `tools/foundation-test-suite.contract.mjs`
   - Before: App integration membership still named `src/tooling/portable/bootstrap/bootstrap.case.mjs`, a path that moved to Core.
   - After: removed that Core-owned bootstrap case from App suite membership.
   - Classification: suite ownership repair; the moved Core case is separately qualified in Core.

5. `tools/foundation-test-suite.contract.case.mjs` and `docs/architecture/foundation-test-strategy.md`
   - Before: retained pre-extraction Site assumptions that generic `npm test` was the Foundation entrypoint and that Site-style validation scripts remained App package authority.
   - After: define the extracted App package model truthfully: `npm test` owns `test/*.test.mjs`, `test:build` owns the App browser build gate, `validate` composes those App package gates, and Foundation suites are explicit carried diagnostics rather than package-version authority.
   - Classification: post-extraction qualification ownership repair; no product behavior change.

### Reproduced Five-Failure Baseline

Before repair, a non-short-circuit current App integration run reproduced exactly 42/47 PASS with five failures:

1. Root/schema companion locality assertion.
2. `v470` package-suffix coupling in known-scenarios acceptance.
3. App-local publication contract source read.
4. missing App-local portable bootstrap case path.
5. Foundation suite contract failing on the same moved bootstrap membership.

The moved Core bootstrap case independently PASSed before repair, confirming that failure 4 was ownership/path drift rather than a missing shared primitive.

### Current Owner-Correct Mechanical Qualification

- App `npm test`: 8/8 PASS, 0 skipped.
- App Foundation smoke: 5/5 PASS.
- App Foundation integration, non-short-circuit: 46/46 PASS after removing the one Core-owned bootstrap member from App ownership.
- Core `npm test`: 76/76 PASS, 0 skipped.
- Core moved `src/tooling/portable/bootstrap/bootstrap.case.mjs`: PASS independently.
- Provider GitHub package tests: 12/12 PASS.
- Provider Native package tests: 6/6 PASS.
- Native Verse package boundary: 1/1 PASS; this still proves only the intentionally minimal/empty public runtime boundary.
- Site package tests against the locally composed carried App/Core/Verse packages: 2/2 PASS.

This is the mechanically truthful current Viewer composition baseline for the delegated repair. Machine-green qualification is not product parity.

### Legacy Cross-Owner Diagnostic Boundary

A deliberately broader run of App's retained legacy `focused/tooling` suite produced 10/18 PASS and eight failures. Those eight were not repaired under this Handoff because they exercise Core Tooling semantics or historical Site-only fixtures rather than the delegated App-facing Viewer slice:

- bounded Workspace Representation fixture expects an older recipient-v2 package shape;
- multi-root manufacture expects older implicit parent Workspace reuse rather than current explicit reuse selection;
- operator bridge expects a Site Workspace artifact inside App;
- CLI sibling-allocation case expects the former implicit allocation contract;
- CLI run case copies a historical Site Tooling Handoff artifact absent from App;
- audit shared-capability case retains pre-extraction local capability-count assumptions;
- lineage-integrity shared-capability case retains the same pre-extraction local capability-count assumption;
- reduction preflight references a historical Site Tooling Handoff absent from App.

These are preserved as cross-owner legacy diagnostics, not treated as current App package/Viewer qualification failures and not "fixed" by copying Core or Site material back into App. Any retirement/migration of that legacy diagnostic group belongs to Core/Tooling ownership, not the next Viewer product tranche.

### Preserved Product And Ledger Boundaries

- All seven retained Viewer PoC product-contract groups remain KEEP under the prior reconciliation; none is dropped by this repair.
- All 25 carried v470 scenarios remain `partial`; no scenario is promoted to parity by machine-green qualification.
- The bounded current Reference contract remains the intentional typed non-parent Relation from Topic to a qualified distinct Task, with Preserve Evidence separate; broader historical Reference breadth remains UNKNOWN.
- Historical Sigma navigation PASS remains historical bounded evidence only and is not projected onto the current extracted composition.
- Native Verse remains intentionally empty at its public runtime boundary; the visible native Viewer remains App-owned. This is still the principal Viewer architecture/composition blocker.

### Smallest Next Owner / Blocker

- Next implementation blocker: complete Native Verse extraction through public App/Core contracts while keeping Site thin and preserving the already retained Viewer product value.
- Routing owner: Anchor retains Native Verse implementation routing under the inbound Handoff; Kodax is an implementation participant only when separately delegated.
- After Native Verse composition is mechanically qualified: refresh the 25-scenario qualification references to current package topology, then run fresh desktop/mobile browser/manual evidence across the seven retained product-contract groups.
- Current human acceptance remains Sigma-owned and is not part of this return.

## Preservation And Fidelity

- Preservation State: exact five-failure reproduction, exact repair file set, post-repair owner-correct pass counts, eight un-repaired cross-owner legacy diagnostics, seven-group retention, 25-scenario `partial` boundary, Reference UNKNOWN boundary, and Native Verse next blocker are preserved.
- Fidelity Notes: no green test is treated as human acceptance. Removal of the Core bootstrap case from App suite membership changes test ownership, not product behavior. Package semver is explicitly decoupled from the historical Viewer checkpoint instead of rewriting that checkpoint.
- Known Losses: no fresh browser/mobile run, no current Sigma acceptance, no completed Native Verse extraction, no live remote publication/re-ingest, and no authoritative retirement of the historical App-local Core Tooling diagnostic corpus are included.

## Interpretation Limits

- Does Not Prove: Viewer PoC parity, Native Verse completion, full current browser/manual behavior, release/deploy/publication readiness, production GitHub mutation correctness, or eligibility to retire the PoC.
- Must Not Be Treated As: permission to mark any of the 25 scenarios `parity`, permission to drop any retained Viewer contract group, permission to copy Core semantics back into App, proof that the eight legacy cross-owner Tooling diagnostics are Viewer defects, or current Sigma acceptance.
- Not Yet Used As: Sigma acceptance, PoC retirement evidence, release qualification, deployment/publication authorization, remote mutation authorization, or proof that all manual scenarios pass the current extracted composition.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-1-1-1-anchor-to-kodax-viewer-major-003-qualification-ownership-repair-current-baseline-handoff.trace.md](handoffs/001-1-1-1-anchor-to-kodax-viewer-major-003-qualification-ownership-repair-current-baseline-handoff.trace.md)
  - Value: yQWeJ_pMyt6JFyaWyPLsDQnBq_Orm0H1kzASp_z7PKo

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: xsUjeBbYk37cPwLcozadnUgqdySDXsO1Pt0n14NwC2I