# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-08-25 01:03:00
  - Authors: Loom
  - Why: Close the two bounded Tooling 027-5 Anchor findings without reopening accepted archive-v2 semantics, changing current/v1 routing, or minting a Workspace artifact.
  - Summary: Tooling 027-5-4 correction result — v2 Workspace targets now require the existing full Tiinex artifact-conformance authority at manufacture and provider reinspection, the three newly introduced source-size violations are structurally removed, focused/downstream regressions are green, and the real tiinex-site v2 candidate remains correctly blocked by the absence of a truthful `.workspace.md` instance.
  - Status: complete/local

---

# Tooling 027-5-4 Workspace-target conformance and static-discipline correction result

## Decision

- State: correction-complete / independent-acceptance-pending / real-v2-candidate-still-blocked
- Subject: bounded Tooling 027-5 Workspace-target artifact-conformance and source-size correction
- Decision: retain the corrected Tooling 027-5 implementation as opt-in v2 only. Require the exact explicitly bound Workspace target bytes to qualify through the existing Tiinex Root/registered-schema/self-integrity/Parent-target authority at both manufacture and provider reinspection. Preserve current/default v1 behavior and return only through the current/v1 route-scoped carrier.
- Boundary: this result is Loom implementation/validation evidence, not independent Anchor acceptance. It does not author a real `tiinex-site` Workspace artifact, manufacture a human-deliverable v2 candidate, activate v2 by default, clean unrelated historical static debt, publish, commit, push, authenticate, or mutate remote state.

## Controlling Context

- Controlling Task: [Tooling 027-5-3 correction](027-5-3-workspace-target-conformance-and-static-discipline-correction.trace.md)
- Controlling Anchor Review: [Tooling 027-5 Anchor review](027-5-2-archive-backed-carrier-v2-anchor-review-correction-required.trace.md)
- Implementation Baseline: [Tooling 027-5 implementation result](027-5-1-archive-backed-handoff-carrier-v2-implementation-and-preflight-result.trace.md)
- Accepted Semantic Boundary: [Tooling 027-4 Anchor acceptance](027-4-2-workspace-artifact-archive-binding-anchor-acceptance.trace.md)
- Inbound Handoff: [Anchor→Loom Tooling 027-5-3 Handoff](../../handoff/loom/027-5-3-workspace-target-conformance-and-static-discipline-correction-handoff.trace.md)

## Workspace Target Conformance Correction

- Added one shared `qualifyHandoffWorkspaceTarget` authority that delegates exact Workspace Markdown bytes to the existing `qualifyTiinexRouteArtifact` conformance seam with `expectedSchemaId: tiinex.workspace.v1` and exact registered-contract qualification required.
- Qualification therefore requires the existing Root/schema authority, observed `tiinex.workspace.v1`, independently verified primary `sha256-base64url-c14n-v2` self integrity, and qualified Parent continuity whenever Parent is declared.
- Parent resolution preserves ordinary artifact semantics. Declared local `Parent Trace` / `Origin relative` references are resolved exactly from carried workspace entries. If those are unavailable, a Parent target digest may resolve only an exact uniquely carried artifact whose own primary c14n-v2 self integrity is verified and equals the declared target. Filename, directory adjacency, archive position, or content scanning cannot create Parent identity.
- Manufacture-time v2 Workspace/archive qualification now calls the shared Workspace target conformance authority before binding semantic Workspace identity.
- Archive-provider reinspection calls the same authority against the extracted archive entry bytes and independently requires the stored descriptor target-self state to be `verified`. Matching stored/recomputed non-verified states therefore cannot create qualification.
- Missing/unverified target self, mismatching target self, Root/schema invalidity, or declared Parent-target continuity failure all block before Workspace semantic binding.
- The real `tiinex-site` source snapshot still contains zero `.workspace.md` instances. The pre-existing truthful first-candidate result therefore remains `portable.handoff-v2.workspace-target.missing`; this correction does not manufacture a v2 candidate or invent a target.

## Exact Correction Source Paths

Relative to the retained Tooling 027-5 implementation baseline, this correction changes exactly eight source paths:

1. `src/tooling/portable/adapters/node/handoff.manufacture.js`
2. `src/tooling/portable/adapters/node/handoff.manufacture.bootstrap.js` — new cohesive extraction
3. `src/tooling/portable/handoff/archiveCarrierV2.test.mjs`
4. `src/tooling/portable/handoff/materialClosure.archiveV2.js`
5. `src/tooling/portable/handoff/materialClosure.archiveV2.workspace.js` — new cohesive extraction
6. `src/tooling/portable/handoff/workspaceByteProvider.js`
7. `src/tooling/portable/handoff/workspaceByteProvider.archive.js` — new cohesive extraction
8. `src/tooling/portable/handoff/workspaceTargetConformance.js` — new shared conformance seam

No other path from the retained 14-path Tooling 027-5 implementation baseline changed during this correction.

## Static Source-Size Discipline

The three Tooling 027-5 files identified by Anchor are now below the existing `24,000` byte `.js` predicate without semantic relaxation:

- `src/tooling/portable/adapters/node/handoff.manufacture.js`: `16,832` bytes
- `src/tooling/portable/handoff/materialClosure.archiveV2.js`: `20,835` bytes
- `src/tooling/portable/handoff/workspaceByteProvider.js`: `21,137` bytes

The cohesive extracted `.js` helpers are also below the predicate:

- `src/tooling/portable/adapters/node/handoff.manufacture.bootstrap.js`: `10,631` bytes
- `src/tooling/portable/handoff/materialClosure.archiveV2.workspace.js`: `10,161` bytes
- `src/tooling/portable/handoff/workspaceByteProvider.archive.js`: `9,488` bytes
- `src/tooling/portable/handoff/workspaceTargetConformance.js`: `7,432` bytes

Exact current `.js` files above `24,000` bytes are only the five pre-027-5 baseline offenders Anchor identified:

1. `src/tooling/portable/handoff/coldStartQualification.js` — `46,104`
2. `src/tooling/portable/handoff/carrierProjection.js` — `30,868`
3. `src/tooling/portable/operation.catalog.js` — `26,538`
4. `src/tooling/portable/host/tool.bindings.js` — `25,808`
5. `src/tooling/portable/adapters/cli/cli.run.js` — `24,770`

Tooling 027-5 therefore adds zero new source-size failures relative to the supplied baseline. Those five historical offenders were intentionally not refactored.

## Focused V2 Regression Evidence

`node src/tooling/portable/handoff/archiveCarrierV2.test.mjs` passed after the correction with:

`✓ Tooling 027-5 archive-backed Handoff carrier v2 qualification, isolation, dedup, tamper, and fail-closed regressions passed`

The positive Workspace target fixture is now a genuinely c14n-v2-sealed `tiinex.workspace.v1` artifact under the exact Root/current-schema contract. Explicit correction regressions now cover:

- target self state prepared/unverified → blocked;
- target self mismatch → blocked;
- Root/current-schema conformance invalidity → blocked;
- declared Parent target continuity invalidity → blocked; and
- provider-only mutation where stored and recomputed target self states both say `prepared` → still blocked, including descriptor-unverified evidence.

The pre-existing archive-v2 behavior set remains covered in the same focused regression: deterministic archive bytes, exact Workspace target/archive binding, Pointer/selected-route resolution, Required Context dedup plus detached fallback, two-workspace same-path isolation, unsafe/duplicate path rejection, archive/entry/completeness staleness rejection, provider/decoder unavailability rejection, invalid selected-Handoff rejection, outer file-map tamper rejection, and current package roundtrip.

## Downstream Validation Evidence

The following checks passed in the corrected surviving working source:

- `src/tooling/portable/handoff/materialClosure.test.mjs`
- `src/tooling/portable/handoff/handoff.manufacture.test.mjs`
- `src/tooling/portable/handoff/routeArtifactConformance.test.mjs`
- `src/tooling/portable/handoff/carrierProjection.test.mjs`
- `src/tooling/portable/handoff/pointerEntrypoint.test.mjs`
- `src/tooling/portable/handoff/coldConsumerEntrypoint.test.mjs`
- `src/tooling/portable/handoff/coldStartQualification.test.mjs`
- `src/tooling/portable/handoff/contextAudit.test.mjs`
- `src/tooling/portable/handoff/multiRootManufacture.test.mjs`
- `src/tooling/portable/handoff/humanOutputNormalEmission.test.mjs`
- `src/tooling/portable/handoff/humanOutputCopyablePresentation.test.mjs`
- `src/tooling/portable/handoff/transportCompanion.test.mjs`
- `tools/check-architecture-shape.mjs`
- `tools/check-browser-import-boundary.mjs`
- `tools/validate-schema-bindings.mjs`
- `tools/check-schema-runtime-projections.mjs`
- `npx --no-install tsc -p tsconfig.json --noEmit`

The inbound current/v1 correction carrier supplied the exact Tooling 002 Handoff fixture that was absent in the prior Loom snapshot, so `materialClosure.test.mjs` now runs and passes without fetching or fabricating material.

## Full Static Validator Environment Boundary

The inbound correction carrier also supplied `.gitignore`, resolving the previous static-validator prerequisite. However, both the surviving Tooling 027-5 working checkpoint and the route-scoped inbound correction carrier omit repository-root `index.html`. No `index.html` exists anywhere in the supplied/surviving source material.

A direct `node tools/validate-static.mjs` attempt therefore stops before its validation predicates with:

`ENOENT: no such file or directory, open '/mnt/data/tiinex-site-027-5-work/index.html'`

This check is recorded as unavailable in this resumed environment, not as PASS. No `index.html` was invented, fetched, reconstructed, or copied from another source merely to make the script green. The acceptance-sensitive source-size predicate was independently evaluated exactly against the retained baseline and yields the five historical offenders above with zero new Tooling 027-5 failures. Anchor retains independent replay against the full working source.

## Preserved Boundaries And Retained Gates

- Current/default v1 manufacture, route topology, selected-Handoff conformance, Pointer/START orientation, Required Context closure, and outer file-map authority are unchanged.
- Archive v2 remains explicitly opt-in; no v2 candidate is manufactured in this correction return.
- No real `.workspace.md` artifact exists in the carried/surviving `tiinex-site` source, and none was minted or inferred.
- The truthful real-workspace first-candidate blocker remains `portable.handoff-v2.workspace-target.missing`.
- Anchor retains independent acceptance and deliberate real Workspace authoring after acceptance.
- Sigma with Anchor retains personal inspection of the first human-deliverable v2 package before fresh-worker use or default routing changes.
- No publication, commit, push, authentication, credential flow, or remote mutation occurred.

## Return Contract

Return exactly one recipient-relative current/v1 route-scoped partial Handoff carrier containing this result, the bounded eight-path correction, and exact Required Context. The return must not claim workspace completeness and must not use v2.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:vdyszEkRSRkbdzNwm90fU9zJ7wD-T3god1BA8V2uKj0
