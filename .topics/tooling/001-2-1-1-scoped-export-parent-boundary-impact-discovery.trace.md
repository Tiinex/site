# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/8f568f14658a48500e2fa4d0d72a58620eaae759/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/8f568f14658a48500e2fa4d0d72a58620eaae759/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-08-30 23:40:00
  - Trace: [Scoped Export Recovery Impact — Loom Handoff](001-2-1-anchor-to-loom-scoped-export-recovery-impact-handoff.trace.md)
  - Origin:
    - [relative](001-2-1-anchor-to-loom-scoped-export-recovery-impact-handoff.trace.md)
- Current
  - Current Schema: [tiinex.discovery.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/discovery/tiinex.discovery.v1.schema.md)
  - Created At: 2026-08-31 00:15:00
  - Authors: Loom
  - Why: Identify the exact current Tooling seam for bounded Handoff export Parent recovery without pre-empting Axiom's parallel canonical recovery review or mutating source artifact bytes.
  - Summary: Read-only implementation-impact Discovery of manufacture, material closure, recipient-v2, export scope, and shared multi-route carrier behavior for scoped Parent-boundary closure.
  - Status: completed/local

---

# Scoped Export Parent Boundary Impact Discovery

## Discovery Intent

- Intent: identify the smallest implementation slice that can make a future bounded Handoff/export scope detect and close Parent edges that cross the carried byte boundary while preserving canonical source bytes and current recipient-v2 route behavior.
- Starting Question: where can Tooling distinguish in-scope bytes from omitted Parent bytes, turn that distinction into transport-only closure requirements, verify exact Parent continuity, and fail closed when recovery is unavailable without inventing `relative`, rewriting Handoff/Workspace artifacts, or turning transport routing into semantic identity?

## Discovery Field

- Field: the carried `Tiinex/site` source snapshot from Handoff carrier SHA-256 `cc53e45691403f7538db5b64b724507cadc45137cfe2faaa210ed99a641f1555`, especially `src/tooling/portable/adapters/node/handoff.manufacture.js`, `src/tooling/portable/handoff/materialClosure.*`, `src/tooling/portable/handoff/carrierProjection.js`, `src/tooling/portable/handoff/routeArtifactConformance.js`, `src/tooling/portable/handoff/recipientV2.*`, `src/tooling/portable/handoff/workspaceTargetConformance.js`, `src/export/export.plan.js`, and the focused manufacture/route tests.
- In Scope: producer-side source enumeration and carrier materialization; Handoff Required/Reference/Role/Pointer dependency projection; detached dependency carriage; Parent-target c14n-v2 qualification; archive-backed Workspace representation; recipient-v2 cache and route requalification; export scope readiness; and the shared multi-route carrier invariant.
- Out Of Scope: changing canonical Root or Workspace Representation semantics; implementing scoped export before Axiom review returns; general Viewer UX; GitHub mutation; remote fetch during manufacture; replacing the carried Workspace with a fresh checkout; or claiming scoped export is implemented.
- Freshness Boundary: the carried Site Workspace archive is exact SHA-256 `cf4401ff1126237bddcd49cc2849dcaefffde75083ba3e86f811617580ef7fa7`; this Discovery describes that local snapshot only.

## Discovery Method

- Method: cold-start through the embedded qualified portable Tooling; consume the qualified runtime-reconciliation Required Context; inspect the exact carried manufacture/material-closure/recipient-v2/export source; trace Parent resolution from producer input through recipient reinspection; and run only the focused regressions needed to verify existing route, archive, and shared-carrier behavior.
- Focused Receipts: `routeArtifactConformance.test.mjs`, `multiRootManufacture.test.mjs`, and `archiveCarrierV2.test.mjs` pass on the carried Site source.
- Source-Mutation Boundary: no implementation source was changed during Discovery. The only durable source mutation in this turn is this Loom-owned Discovery artifact.

## Discovery Boundaries

- Semantic Boundary: Axiom retains canonical recovery semantics. This Discovery may identify implementation pressure and a contract dependency, but it does not define a new Root Origin label, a new Workspace Representation meaning, or a new semantic package identity.
- Byte Boundary: canonical source Markdown remains byte-identical. Any scoped-recovery representation must live in producer/transport closure metadata, exact dependency payloads, or package-local generated transport artifacts.
- Qualification Boundary: a version-stable `browse + git` locator can satisfy source-neutral Root validation without fabricated `relative`, but Parent-target continuity still requires exact Parent bytes whose c14n-v2 self digest verifies the child's Parent-target integrity entry.
- Routing Boundary: package-local Handoff route Pointers and outer invocation text are transport addressing only. Shared carrier bytes remain unchanged across Axiom and Loom route selection.
- Recipient Boundary: current recipient-v2 Workspace provider activation is explicitly `verified-complete-only`; it rejects non-complete Workspace representations before activation.

## Discovery Outcome

- Outcome: completed impact Discovery. The Parent-recovery gap is not primarily in recipient route qualification. Existing closure and recipient machinery already contains most of the fail-closed and detached-byte mechanisms needed for route-scoped Parent closure. The missing producer owner is an explicit Parent-boundary dependency projection tied to a real carrier scope. A second, semantic blocker exists for intra-Workspace scoping because recipient-v2 currently recognizes only complete Workspace representations.
- Manufacture Present State: `prepareNodeHandoffManufacturingInput` deterministically enumerates every regular file under every supplied Workspace root, reads and hashes all files, and materializes each Workspace as `state: complete`. It has no representation for “available source bytes but intentionally outside carrier scope,” so it cannot currently detect a Parent edge as crossing a selected scope.
- Requirement Present State: `materialClosure.requirements.js` projects Handoff Required Context, Reference Context, endpoint Roles, participant Roles, and later Pointer dependencies. It does not project Parent edges from carried artifacts as closure dependencies.
- Closure Present State: `materialClosure.plan.js` already treats unresolved `dependencies` exactly like other blocking required closure. This is reusable fail-closed behavior; a Parent-boundary dependency does not need a separate readiness model merely to block manufacture.
- Detached Material Present State: exact dependency bytes that are not satisfied by a qualified Workspace archive already survive as detached material and are grouped by `recipientV2.topology.js` into a Workspace-scoped Handoff dependency cache. No new recipient payload kind is required for route-owned exact Parent bytes.
- Route Parent Present State: `carrierProjection.js::resolveRouteParent` first tries local Parent references and then scans carried Workspace/archive plus detached material candidates by the exact Parent-target c14n-v2 digest. `routeArtifactConformance.js` independently verifies the resolved Parent representation. Therefore an omitted route Parent can already qualify from exact detached bytes if manufacture projects and binds those bytes as a dependency.
- Version-Stable Recovery Present State: `routeArtifactConformance.test.mjs` proves a Parent with qualified commit/version-stable `browse + git` recovery and no fabricated `relative` can qualify when exact Parent bytes are supplied and the Parent-target digest verifies. The URI alone is not qualification.
- Workspace Representation Blocker: `materialClosure.archiveV2.workspace.js`, `recipientV2.inspect.helpers.js`, and the canonical Workspace Representation facts require a complete Workspace snapshot. `recipientV2.inspect.helpers.js` explicitly requires representation `coverage === complete`, `activationRule === verified-complete-only`, and `coverageRequirement === complete`. A true intra-Workspace scoped archive therefore requires an Axiom-approved semantic representation change or a separate already-authorized bounded representation; Tooling must not silently reinterpret “complete.”
- Export Present State: `src/export/export.plan.js` exposes `local` and `source` scope choices only as `future`; `all` is the only ready scope. The Handoff-package adapter therefore has no current user-facing scoped selection contract to wire. Export UI is not the first implementation seam.
- Multi-route Pressure Test: the current shared carrier contains distinct qualified Docs→Axiom and Site→Loom routes over one exact ZIP. The focused multi-root/archive tests confirm route selection changes only outer transport text/pointer selection, not carrier bytes, and selected delivery can narrow visible sibling routes without manufacturing recipient-specific duplicate carriers. No correctness reason was found to duplicate the carrier solely for recipient naming.
- Maintainability Note: the producer already has two recursive dependency concepts—Pointer-target dependencies and Parent continuity qualification—but only Pointer targets become explicit material requirements. Converging Parent-boundary closure into the same `requirements.dependencies` channel avoids a second detached-material/cache protocol.

## Smallest Implementation Slice

- Slice Name: scoped Parent-boundary dependency projection for Handoff manufacture.
- Preconditions: Axiom must state whether the first bounded scope is allowed to omit only whole Workspace/source boundaries while every carried Workspace remains complete, or whether intra-Workspace subset representations are canonically permitted. The first case can use the current recipient-v2 Workspace provider unchanged; the second case cannot.
- Producer Detection: add a pure projector, preferably `src/tooling/portable/handoff/parentBoundaryClosure.js`, that accepts an explicit carrier inclusion set plus the exact available source candidate set and emits route/workspace-scoped dependency requirements for Parent edges whose exact Parent representation is not included. Detection must use parsed Parent `Trace`/Origin plus the existing Parent-target integrity authority; it must not infer semantics from filenames or adjacency.
- Manufacture Integration: call that projector from `src/tooling/portable/adapters/node/handoff.manufacture.js` after exact source enumeration and explicit scope selection, before `resolveWorkspaceRequirementMaterials`. Merge the emitted requirements into `requirements.dependencies`, preserving route/workspace/source-artifact identity. Keep the full enumerated source candidate pool available for exact local out-of-scope binding while keeping the carrier materialization set separate.
- Material Qualification: reuse `materialClosure.materials.js` and existing exact material bindings. A Parent-boundary dependency is ready only when one exact candidate is unambiguously bound and its bytes verify the child's Parent-target c14n-v2 digest. A version-stable external locator may identify the requested representation, but no hidden network fetch or URI-only success is permitted.
- Carrier Representation: for whole-Workspace omission, exact out-of-scope Parent bytes can use the existing detached material → Workspace dependency cache path. For intra-Workspace omission, stop before representation change until Axiom authorizes how a bounded Workspace representation differs from `complete`; do not weaken `verified-complete-only`.
- Recipient Qualification: route-owned Parent dependencies need no new route Pointer semantics because `carrierProjection.resolveRouteParent` already considers detached material by digest and `routeArtifactConformance` already verifies exact Parent continuity. Add an explicit regression proving the Parent came from the cache rather than the Workspace archive.
- Workspace-Target Boundary: `workspaceTargetConformance.js` currently resolves a Workspace artifact Parent only from entries inside that Workspace archive. If Axiom permits a bounded Workspace whose own Workspace artifact Parent can fall outside the archive, this resolver and recipient reinspection ordering become a required second seam; until then such a scope must fail closed or expand scope.
- Export Wiring: only after Tooling has an explicit qualified scope descriptor should `src/export/export.plan.js` promote a non-`all` scope from `future`. The export read-model must consume the qualified scope/closure outcome rather than invent selection semantics itself.

## Required Tests For The Next Implementation Turn

- `src/tooling/portable/handoff/parentBoundaryClosure.test.mjs` — new pure projector cases: in-scope Parent; out-of-scope local Parent; version-stable external Parent; missing Parent bytes; ambiguous equal/different provider candidates; wrong Parent-target digest; no source mutation.
- `src/tooling/portable/handoff/handoff.manufacture.test.mjs` — producer integration proves a scoped out-of-scope Parent becomes one `dependencies` requirement and unresolved closure blocks manufacture.
- `src/tooling/portable/handoff/archiveCarrierV2.test.mjs` — exact omitted route Parent is carried in the Workspace dependency cache, route Parent requalification succeeds from cache bytes, tamper/wrong digest blocks, and canonical Handoff bytes are unchanged.
- `src/tooling/portable/handoff/routeArtifactConformance.test.mjs` — retain the local-relative and version-stable-without-relative cases as semantic regression anchors.
- `src/tooling/portable/handoff/multiRootManufacture.test.mjs` — one shared multi-route ZIP remains byte-identical across Axiom/Loom outer route selection and no recipient-specific carrier duplication is introduced.
- `src/export/export.plan.test.mjs` — keep non-`all` scopes `future` until the qualified Tooling scope contract lands; later test promotion only through that contract.
- Conditional after Axiom: `workspaceTargetConformance` and recipient-v2 provider tests for any authorized bounded Workspace Representation. Do not add these as passing semantics before the canonical contract exists.

## Semantic Dependencies And Blockers

- Axiom Decision Required: whether bounded export may initially mean “selected complete Workspaces plus detached Parent closure” or must include partial/intra-Workspace snapshots; and, for the latter, the canonical meaning and activation rules of the Workspace Representation.
- No Blocker For Discovery: current source is sufficient to identify the implementation seam and existing reusable qualification owners.
- Blocker For Intra-Workspace Implementation: current recipient-v2 canonical Workspace Representation is verified-complete-only. Changing it by Tooling convention would exceed Loom authority in this handoff.
- No Need For New Route Identity: the multi-route pressure test found no semantic or correctness requirement for recipient-specific carrier names or duplicate carriers.

## Return Recommendation

- Recommendation To Anchor: merge this Discovery with Axiom's recovery-semantics return before opening implementation. If Axiom constrains the first scoped slice to whole-Workspace omission, open one bounded Loom Task implementing producer Parent-boundary dependency projection plus cache-backed route Parent regression. If Axiom authorizes intra-Workspace scope, extend that Task only after the Workspace Representation contract names the bounded coverage semantics and recipient activation proof.
- Natural Durable Repository: `Tiinex/site`.
- Expected First Code Owners: `src/tooling/portable/adapters/node/handoff.manufacture.js`; new `src/tooling/portable/handoff/parentBoundaryClosure.js`; existing `materialClosure.materials.js`; `carrierProjection.js`; focused Handoff tests.
- Explicit Non-Owners For First Slice: `src/export/export.plan.js` UI promotion, Viewer surfaces, Root schema authoring, and recipient-specific carrier naming.

## Interpretation Limits

- Limits: this Discovery does not authorize a new Root Origin label, partial Workspace semantics, hidden network recovery, URI-only Parent qualification, source artifact rewriting, weakened Parent-target integrity, recipient-specific carrier duplication, or a claim that scoped export is implemented. It establishes the smallest producer-side dependency-closure seam, the existing reusable recipient/cache qualification path, and the canonical Workspace Representation blocker that Anchor must reconcile with Axiom before implementation.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [Scoped Export Recovery Impact — Loom Handoff](001-2-1-anchor-to-loom-scoped-export-recovery-impact-handoff.trace.md)
  - Value: mTOacOAyCjsvz0moUAMPLwyuZyI6ddk_-7lIrCCTB0Y

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:WNqznexRQk06m3XpPCPMFOeJ7cScoqG_ieqN9hjDOEY
