# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-08-25 01:39:00
  - Authors: Loom
  - Why: Close only the Tooling 027-5 first-live v2 manufacture performance blocker while preserving accepted Workspace/archive semantics, current/default v1 behavior, and the retained human/acceptance gates.
  - Summary: Tooling 027-5-7 performance-correction result — explicit v2 manufacture now consumes already-enumerated qualified complete workspace bytes directly into the archive representation instead of first emitting a full exploded v1 workspace carrier; fixture equivalence/adversarial/scale regressions pass; the real carried tiinex-site path completes manufacture plus serialization in about 31.7 seconds; current/default v1 remains unchanged.
  - Status: complete/local

---

# Tooling 027-5-7 Direct v2 manufacture performance correction result

## Decision

- State: performance-correction-complete / independent-acceptance-pending / first-human-v2-package-not-manufactured
- Subject: bounded direct archive-backed v2 manufacture orchestration correction
- Decision: retain the direct v2 orchestration correction as opt-in only. The explicit v2 path now reuses existing v1 planning, material-closure, selected-route, Workspace-target, provider, Pointer, START, context-audit, and package-conformance owners while consuming the already-enumerated qualified complete workspace materialization directly for archive construction. Do not restore the mandatory exploded-v1 complete-workspace intermediate.
- Boundary: this result is Loom implementation/performance evidence, not independent Anchor acceptance. It does not switch default carrier behavior, manufacture or return the first human-deliverable v2 audit package, weaken completeness or Workspace target conformance, publish, commit, push, authenticate, or mutate remote state.

## Controlling Context

- Controlling Task: [Tooling 027-5-6 performance correction](027-5-6-direct-v2-manufacture-performance-correction.trace.md)
- Controlling Anchor Review: [Tooling 027-5-5 first-live performance review](027-5-5-first-live-v2-manufacture-performance-anchor-review-correction-required.trace.md)
- Accepted Semantic/Static Baseline: [Tooling 027-5-4 correction result](027-5-4-workspace-target-conformance-and-static-discipline-correction-result.trace.md)
- Accepted Workspace/Archive Boundary: [Tooling 027-4 Anchor acceptance](027-4-2-workspace-artifact-archive-binding-anchor-acceptance.trace.md)
- Inbound Handoff: [Anchor→Loom Tooling 027-5-6 Handoff](../../handoff/loom/027-5-6-direct-v2-manufacture-performance-correction-handoff.trace.md)
- Real Workspace Target: [Tiinex Site workspace](../../../.workspaces/tiinex-site.workspace.md)

## Exact Performance Correction Source Paths

Relative to the accepted Tooling 027-5-4 source baseline, this tranche changes exactly five implementation/test paths:

1. `src/tooling/portable/handoff/materialClosure.archiveV2.direct.js` — new direct semantic/control baseline builder
2. `src/tooling/portable/handoff/materialClosure.archiveV2.workspace.js`
3. `src/tooling/portable/handoff/materialClosure.archiveV2.js`
4. `src/tooling/portable/handoff/manufacture.js`
5. `src/tooling/portable/handoff/archiveCarrierV2.test.mjs`

The previously accepted Tooling 027-5-4 Workspace-target correction paths remain byte-for-byte preserved relative to the inbound carrier, including the Node manufacture/bootstrap adapters, Workspace byte-provider seams, and `workspaceTargetConformance.js`.

## Direct V2 Orchestration

- Added `materialClosure.archiveV2.direct.js` as an internal direct-v2 semantic/control baseline. It calls the existing recipient-relative material-closure planner and the existing plan-readiness, input-binding, and materialized-output qualification owners.
- The direct baseline constructs only the small semantic/control package, exact detached materials, bootstrap/additional transport, and current/v1 closure descriptor needed by the retained semantic authorities. It does not emit the complete workspace as exploded outer `handoff.workspaces/...` carrier files.
- `qualifyDirectWorkspaceForArchive` consumes the raw already-enumerated workspace entries, normalizes/rejects unsafe or duplicate paths, proves the raw entry set exactly matches planner-qualified `includedEntries`, and checks bytes/digests before reusing the accepted `qualifyWorkspaceForArchive` authority.
- Workspace target qualification therefore remains the Tooling 027-5-4 exact-byte contract: registered `tiinex.workspace.v1`/Root conformance, verified primary c14n-v2 self integrity, and qualified Parent-target continuity when declared.
- Complete-workspace evidence remains exact. The optimization does not relabel a partial workspace as complete and cannot infer omitted archive entries.
- The retained v1→v2 upgrade path remains available as a compatibility comparison seam. The explicit v2 manufacture facade now chooses the direct path; current/default v1 manufacture remains untouched.
- V2 migration evidence distinguishes physical removal from avoidance: direct manufacture reports `removedExplodedWorkspaceFiles: 0` because those files were never emitted and reports the number of `avoidedExplodedWorkspaceFiles` instead.

## Focused Equivalence, Adversarial, And Scale Evidence

`node src/tooling/portable/handoff/archiveCarrierV2.test.mjs` passes after the correction:

`✓ Tooling 027-5 archive-backed Handoff carrier v2 qualification, isolation, dedup, tamper, and fail-closed regressions passed`

The focused suite now additionally proves:

- direct-v2 and retained legacy v1→v2 fixture manufacture produce the same archive-v2 closure descriptor for stable input;
- selected-route semantic projections are equivalent;
- deterministic workspace archive digest identity is equal for stable input;
- direct manufacture emits no exploded complete-workspace outer carrier and records avoided files instead;
- a 1,300-extra-file scale fixture reaches `ready`, archives at least 1,300 workspace entries, and retains only the expected archive-backed outer workspace carrier artifacts rather than first emitting 1,300 exploded workspace files.

The pre-existing adversarial set remains passing, including archive/provider digest and entry-map staleness, traversal/duplicate rejection, provider/decoder unavailability, completeness/correlation staleness, missing/ambiguous Workspace target, unverified/mismatched/Root-invalid/Parent-invalid target, matching stored/recomputed non-verified target state, detached fallback, two-workspace same-path isolation, invalid selected Handoff, and outer archive/file-map tamper rejection.

## Real Carried Tiinex Site Performance Qualification

The surviving working source contains the exact carried durable target `.topics/.workspaces/tiinex-site.workspace.md`. Node preparation/enumeration produced a qualified complete workspace materialization with `1,168` current workspace entries and an embedded tooling bootstrap with `326` files. No partial-as-complete substitution was used.

Using explicit route selection for the exact carried inbound Tooling 027-5-6 Handoff and embedded bootstrap, direct v2 manufacture completed with:

- prepare/enumeration: `1,627.76 ms`
- direct v2 manufacture: `25,968.36 ms`
- ZIP serialization: `4,113.20 ms`
- total measured prepare + manufacture + serialization: `31,709.32 ms`
- observed benchmark wall time: approximately `31.86 s`
- actual CLI smoke wall time: approximately `31.34 s`

The resulting temporary v2 package reported `ready` with package inspection valid, closure inspection valid, carrier inspection valid, selected-Handoff conformance qualified, Pointer valid, cold consumer valid, transport companion valid, tooling bootstrap valid, and no findings. It contained one complete workspace archive, avoided `1,168` exploded workspace files, and deduplicated all four Required Context items only after exact archive-entry proof. The temporary v2 outputs were deleted and are not returned to Anchor.

### Explicit Sigma-route fixture limitation

The controlling task asks for an explicit Sigma-audit Handoff fixture/route supplied by Anchor. The inbound current/v1 package contains textual references to that requirement but no distinct `To: Sigma` / Sigma-audit Handoff artifact or route. The only actual carried Loom-target Handoff route is `027-5-6-direct-v2-manufacture-performance-correction-handoff.trace.md`. Loom therefore used that exact explicit supplied route for the real performance run and did not invent a Sigma route. The timing result proves the direct real-workspace manufacture path is inside the 120-second host budget; it does not claim execution of a fixture that was not carried.

## Downstream Validation Evidence

The following checks pass in the corrected surviving working source:

- `src/tooling/portable/handoff/materialClosure.test.mjs`
- `src/tooling/portable/handoff/handoff.manufacture.test.mjs`
- `src/tooling/portable/handoff/routeArtifactConformance.test.mjs`
- `src/tooling/portable/handoff/carrierProjection.test.mjs`
- `src/tooling/portable/handoff/pointerEntrypoint.test.mjs`
- `src/tooling/portable/handoff/coldConsumerEntrypoint.test.mjs`
- `src/tooling/portable/handoff/coldStartQualification.test.mjs`
- `src/tooling/portable/handoff/contextAudit.test.mjs`
- `src/tooling/portable/handoff/multiRootManufacture.test.mjs`
- `src/tooling/portable/handoff/handoff.manufacture.scale.test.mjs` — passed at `1,286` workspace carriers / `1,306` package files in approximately `2.8 s`
- `src/tooling/portable/handoff/humanOutputNormalEmission.test.mjs`
- `src/tooling/portable/handoff/humanOutputCopyablePresentation.test.mjs`
- `src/tooling/portable/handoff/transportCompanion.test.mjs`
- `tools/check-architecture-shape.mjs`
- `tools/check-browser-import-boundary.mjs` — `429` production modules, zero Node import edges, zero unresolved imports
- `tools/validate-schema-bindings.mjs`
- `tools/check-schema-runtime-projections.mjs`
- `npx --no-install tsc -p tsconfig.json --noEmit`

The current/default v1 manufacture and its downstream routing/package behavior remain green; no default-v1 orchestration was changed to obtain the v2 speedup.

## Static Discipline And Carried-Checkout Boundary

Exact current production `.js` files above the repository's `24,000`-byte predicate remain only the same five historical pre-027-5 offenders:

1. `src/tooling/portable/handoff/coldStartQualification.js` — `46,104`
2. `src/tooling/portable/handoff/carrierProjection.js` — `30,868`
3. `src/tooling/portable/operation.catalog.js` — `26,538`
4. `src/tooling/portable/host/tool.bindings.js` — `25,808`
5. `src/tooling/portable/adapters/cli/cli.run.js` — `24,770`

The new/changed production files are below the limit: `manufacture.js` `8,420`, `materialClosure.archiveV2.js` `22,094`, `materialClosure.archiveV2.workspace.js` `14,215`, and new `materialClosure.archiveV2.direct.js` `12,119`. Tooling 027-5-6 therefore introduces zero new source-size failures.

The inbound carrier supplied exact `.gitignore`, repository-root `index.html`, and `.topics/.schemas/tiinex.workspace.v1.schema.md` bytes, which were restored into the surviving checkout without fetching or fabrication so `tools/validate-static.mjs` could advance through those prerequisites. The full static script still cannot be claimed PASS in this carried/surviving checkout because two repository files it requires are genuinely absent everywhere supplied:

- `.topics/.workspaces/viewer.workspace.md` — reported as root workspace config missing;
- `docs/architecture/uc001-workspace-lifecycle.md` — reported missing.

The full run also reports the same five historical source-size findings above. No missing file was invented, fetched, or reconstructed merely to turn the full static run green.

## Retained Gates And Non-Actions

- Anchor retains independent acceptance/replay of this correction against its full working source.
- Sigma with Anchor retains personal inspection of the first human-deliverable v2 package before any fresh worker consumes it.
- Anchor/Sigma retain any decision to activate v2 as normal/default routing after acceptance and first-package audit.
- This tranche does not mint another Workspace identity, weaken complete-workspace evidence, relax route/material/Pointer/provider conformance, refactor unrelated static debt, or alter current/default v1 public semantics/topology.
- No publication, commit, push, authentication, credential flow, or remote mutation occurred.

## Return Contract

Return exactly one recipient-relative current/v1 route-scoped partial Handoff carrier containing this result, the bounded five-path performance correction, and exact Required Context. The return must not claim workspace completeness and must not use or attach v2.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:waKxoolWxLGwoVBr_gNWVEDJXk4MBaZbU7I7fJMcaWs