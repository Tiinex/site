# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-08-25 09:22:00
  - Authors: Loom
  - Why: Close only Anchor's Tooling 027-5-8 full-source direct-v2 scale blocker against the exact detached 1,519-file working-source snapshot while preserving accepted archive/Workspace semantics and current/default v1 behavior.
  - Summary: Tooling 027-5-9 full-source v2 scale-correction result — repeated archive-provider reconstruction, large-byte re-finalization, and avoidable ZIP copies were bounded without weakening qualification; the exact supplied full source now completes prepare plus direct-v2 manufacture plus ZIP serialization in about 28.68 seconds with status ready and zero findings; focused mixed-shape/adversarial and downstream acceptance regressions pass; current/default v1 serialization remains byte-equivalent.
  - Status: complete/local

---

# Tooling 027-5-9 full-source v2 scale correction result

## Decision

- State: full-source-performance-correction-complete / independent-acceptance-pending / first-human-v2-package-not-manufactured
- Subject: bounded archive-v2 provider/verification/serialization scale correction against Anchor's exact retained full-source snapshot
- Decision: retain this performance correction as opt-in v2 implementation only. Manufacture-time verification now qualifies one exact archive byte-provider through closure and reuses that already-qualified inspection context for downstream carrier/Pointer/START checks; archive parsing keeps one private archive copy with entry views; v2 assembly avoids redundant re-finalization of already-finalized governed files; deterministic ZIP output avoids unnecessary intermediate buffer copies. Standalone inspectors still reconstruct and re-qualify independently by default.
- Boundary: this is Loom implementation/performance evidence, not independent Anchor acceptance. It does not change current/default v1 routing, manufacture a human-deliverable v2 package, weaken complete-workspace/Workspace-target/archive/route/material/Pointer/START/file-map conformance, invent a Workspace artifact, publish, commit, push, authenticate, or mutate remote state.

## Controlling Context

- Controlling Anchor Review: [Tooling 027-5-8 full-source scale review](027-5-8-full-source-v2-scale-anchor-review-correction-required.trace.md)
- Prior Loom Performance Result: [Tooling 027-5-7 direct-v2 performance result](027-5-7-direct-v2-manufacture-performance-correction-result.trace.md)
- Accepted Workspace/Archive Boundary: [Tooling 027-4 Anchor acceptance](027-4-2-workspace-artifact-archive-binding-anchor-acceptance.trace.md)
- Real Workspace Target: [Tiinex Site workspace](../../../.workspaces/tiinex-site.workspace.md)
- Exact Detached Performance Input: `reference/027-5-8-anchor-full-working-source.zip` from the inbound Anchor carrier; verified SHA-256 `6fa68d9a4f6e40f8e29841fdc6bee4a853eca2b7003e588419ba234542be7119`; extracted snapshot contains exactly `1,519` regular files.

## Exact Correction Source Paths

Relative to Anchor's supplied pristine 1,519-file snapshot, this tranche changes exactly ten implementation/test paths:

1. `src/tooling/portable/handoff/workspaceByteProvider.archive.js`
2. `src/tooling/portable/handoff/workspaceByteProvider.js`
3. `src/tooling/portable/handoff/carrierProjection.js`
4. `src/tooling/portable/handoff/pointerEntrypoint.js`
5. `src/tooling/portable/handoff/coldConsumerEntrypoint.js`
6. `src/tooling/portable/handoff/materialClosure.archiveV2.js`
7. `src/export/package.fileMap.js`
8. `src/tooling/portable/output/node.zip.js`
9. `src/tooling/portable/output/deterministic.zip.js`
10. `src/tooling/portable/handoff/archiveCarrierV2.test.mjs`

No profiling source file remains in the workspace.

## Scale Correction

### One private archive byte representation

- `workspaceByteProvider.archive.js` can consume an explicitly provider-owned `Uint8Array` without copying it again.
- Archive entry names and entry data are represented as `subarray` views into that private archive byte copy rather than per-entry `slice` copies.
- `workspaceByteProvider.js` still takes one private copy of the governed archive file before qualification, then parses that owned copy and indexes declared entries by path instead of repeatedly scanning the declared entry list.
- Archive digest, declared entry map, path safety, completeness, Workspace-target correlation, and exact target conformance are still recomputed/qualified. No external mutable package bytes are trusted as provider state.

### Manufacture-time qualified inspection-context reuse

- Outer package inspection still runs independently first.
- Closure inspection still reconstructs and exactly qualifies the archive-backed Workspace byte-provider.
- When closure is valid, manufacture-time carrier projection reuses that exact qualified provider; Pointer and START/cold-consumer checks reuse the exact qualified carrier inspection.
- Standalone `inspectHandoffCarrierProjection`, Pointer, and cold-consumer entrypoints keep their prior behavior when no explicit qualified context is supplied: they reconstruct/reinspect independently. The optimization therefore changes repeated work inside the v2 manufacture verification graph, not the public authority boundary.

### Redundant large-byte finalization removal

- Archive-v2 assembly no longer re-finalizes files already finalized by their owning construction seams before immediately building the governed file map.
- `buildExportPackageFileMap` has an opt-in `assumeFinalized` path guarded by finalized-file shape checks; its default path remains unchanged and still finalizes input files.
- Final package inspection immediately recomputes exact bytes and SHA-256 over the serialized representation, preserving stale/tampered metadata rejection.

### Deterministic ZIP copy reduction

- Node ZIP serialization now uses byte views for existing `Buffer`/`Uint8Array` file data instead of mandatory extra intermediate copies.
- The deterministic stored-ZIP builder likewise avoids copying already-byte-addressable entry input before its final output concatenation.
- A fixed pristine-versus-corrected equivalence probe produced exactly the same deterministic ZIP SHA-256 `913ef6f82589dcc5a48b9c8e731f5438f137704d04868d1c2c79a7e632bcc824` (`329` bytes) and exactly the same default file-map representation SHA-256 `762860cc241a9e1ca9c272c3bfcea10e530fad35606887fe971bfd59ffa96247` / serialized probe SHA-256 `285e5499556ad92b16ddf55c2379b00c13c5b8043f5cb2a5146aead26a5d629f`.

## Focused Mixed-Shape And Adversarial Evidence

`node src/tooling/portable/handoff/archiveCarrierV2.test.mjs` passes after the correction:

`✓ Tooling 027-5 archive-backed Handoff carrier v2 qualification, isolation, dedup, tamper, and fail-closed regressions passed`

The scale pressure is no longer only many trivial text files. It deterministically mixes Tiinex-like Markdown trace material, runtime-schema JSON, JavaScript, CSS, and binary payloads with non-trivial total byte volume, then requires ordinary archive-provider requalification of the resulting v2 package.

The pre-existing focused suite remains green for direct-versus-retained-legacy representation equivalence, deterministic archive identity, exact Workspace target Root/schema/self/Parent conformance, archive/provider digest and entry-map staleness, traversal/duplicate rejection, provider/decoder unavailability, completeness/correlation staleness, missing/ambiguous/unverified/mismatched Workspace target, detached Required Context fallback/dedup, two-workspace same-path isolation, selected-Handoff conformance, outer file-map tamper, Pointer/START, and roundtrip pressure.

## Exact Anchor Full-Source Performance Qualification

The final benchmark used the exact supplied detached full-source snapshot, the real `.topics/.workspaces/tiinex-site.workspace.md` target, explicit route `.topics/development/handoff/anchor/027-5-7-direct-v2-manufacture-performance-correction-result-handoff.trace.md`, embedded tooling bootstrap, and `verifyRoundtrip: false` / `--no-roundtrip` semantics. No partial workspace was relabeled complete.

Observed final phases:

- Node preparation/enumeration: `2,076.28 ms`
- enumerated complete workspace entries: `1,519`
- embedded runtime files: `325` plus one bootstrap manifest (`326` bootstrap transport files total)
- direct v2 manufacture: `21,194.51 ms`
- ZIP serialization: `5,408.45 ms`
- measured prepare + manufacture + serialization: `28,679.24 ms`
- observed process wall time: approximately `28.84 s`
- peak RSS: approximately `294,668 KB`
- serialized v2 verification ZIP size: `17,603,958` bytes
- manufacture status: `ready`
- findings: `0`
- manufacture path: `direct-qualified-workspace-to-archive`
- complete workspace archives: `1`
- exploded complete-workspace files avoided: `1,519`
- detached Required Context files deduplicated after archive-entry proof: `5`

Manufacture-time gates reported package inspection valid, closure valid, carrier valid, selected Handoff conformance qualified, Pointer valid, cold consumer valid, transport companion valid, tooling bootstrap valid, and roundtrip not requested. The v2 ZIP existed only as benchmark serialization bytes in memory and is not retained or returned to Anchor.

The result clears Anchor's `120 s` full-source direct-v2 manufacture + serialization criterion with substantial margin.

## Downstream Validation Evidence

The following corrected-source checks pass:

- `src/tooling/portable/handoff/materialClosure.test.mjs`
- `src/tooling/portable/handoff/handoff.manufacture.test.mjs`
- `src/tooling/portable/handoff/routeArtifactConformance.test.mjs`
- `src/tooling/portable/handoff/carrierProjection.test.mjs`
- `src/tooling/portable/handoff/pointerEntrypoint.test.mjs`
- `src/tooling/portable/handoff/coldConsumerEntrypoint.test.mjs`
- `src/tooling/portable/handoff/coldStartQualification.test.mjs`
- `src/tooling/portable/handoff/contextAudit.test.mjs`
- `src/tooling/portable/handoff/multiRootManufacture.test.mjs`
- `src/tooling/portable/handoff/handoff.manufacture.scale.test.mjs` — `1,286` workspace carriers / `1,306` package files in about `3.13 s`
- `src/tooling/portable/handoff/humanOutputNormalEmission.test.mjs`
- `src/tooling/portable/handoff/humanOutputCopyablePresentation.test.mjs`
- `src/tooling/portable/handoff/transportCompanion.test.mjs`
- `tools/check-architecture-shape.mjs`
- `tools/check-browser-import-boundary.mjs` — PASS with `429` reachable production modules and no Node import edges/unresolved local imports
- `tools/validate-schema-bindings.mjs` — `16` modules pinned and manifest-consistent
- `tools/check-schema-runtime-projections.mjs` — `16/16` exact generated projections
- `npx --no-install tsc -p tsconfig.json --noEmit`

## Static Discipline

`node tools/validate-static.mjs` reaches the repository static predicate and exits nonzero only for the same five historical v119 source-size findings present in Anchor's pristine snapshot:

1. `src/tooling/portable/adapters/cli/cli.run.js` — `24,770` bytes
2. `src/tooling/portable/handoff/carrierProjection.js` — pristine `30,868` bytes; corrected `30,975` bytes
3. `src/tooling/portable/handoff/coldStartQualification.js` — `46,104` bytes
4. `src/tooling/portable/host/tool.bindings.js` — `25,808` bytes
5. `src/tooling/portable/operation.catalog.js` — `26,538` bytes

The pristine 1,519-file snapshot and corrected source have exactly the same five-path over-24-KB set. Tooling 027-5-9 introduces zero new source-size failures and performs no broad static cleanup.

## Retained Gates And Non-Actions

- Anchor retains independent replay/acceptance against full source.
- Anchor with Sigma retains personal inspection of the first human-deliverable v2 package before any fresh worker consumes it.
- Anchor/Sigma retain any decision to activate v2 as normal/default routing.
- Current/default v1 remains active; the performance correction does not change its route topology or default file-map/ZIP representation.
- Complete-workspace evidence, exact Workspace target qualification, archive digest/entry-map/completeness, Required Context closure, route-artifact conformance, Pointer/START, context audit, provider/tamper rejection, and outer file-map authority remain required.
- No Workspace artifact was invented or transport-minted.
- No publication, commit, push, authentication, credential use, fetch-for-green-tests, or other remote mutation occurred.

## Return Contract

Return exactly one recipient-relative current/v1 route-scoped partial Handoff carrier containing this result, the bounded ten-path correction, the sealed return Handoff, and exact Required Context. The return must not claim workspace completeness and must not manufacture, retain, or attach a v2 return package.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:7YU1ZhXP3Le3tBevI1JhKpMZbYjBKqlcp0g1OHZYSe4
