# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-28 13:40:00
  - Authors: Loom
  - Status: completed/local
  - Summary: Implement one opt-in Phase 1 artifact-first recipient-v2 dual-projection specimen where semantic receiver artifacts and exact payload bytes precede the retained derived transport JSON.

---

# Artifact-First Handoff Carrier Phase 1 Dual Projection

## Parent Work

- Business Parent Task: `002-4-1-1-1 Artifact-First Handoff Carrier Implementation`.
- Semantic Authority: accepted Axiom `003 Handoff Package Control Semantic Promotion Decision` reconciled by Anchor `004`.
- Anchor Route: `.topics/handoff/029-anchor-to-loom-artifact-first-dual-projection-first-slice.trace.md`.

## Objective

Implement the smallest coherent artifact-first manufacture/inspection/orientation seam without entering the clean-carrier JSON-omission phase or widening legacy-reader behavior.

## Done Criteria

- One opt-in newly manufactured specimen has one receiver Start Pointer and one Handoff route Pointer.
- Route Pointer identifies one Workspace External Payload plus one exact workspace-relative Handoff path without copying Handoff From/To/Transfers/Completion authority.
- Workspace archive location and exact payload SHA-256 are owned by one `tiinex.external.payload.v1` artifact.
- Complete Workspace representation meaning is expressed by one typed non-Parent `tiinex.relation.v1` artifact using `material representation`, `payload artifact -> represented artifact`, and `complete recipient-relative workspace materialization`.
- No package-local `tiinex.workspace.v1` wrapper is generated and no package-topology Parent continuity is emitted in the focused specimen.
- `tiinex-recipient-v2.transport.json` remains present in Phase 1 but is generated only after parsing the semantic artifacts and exact payload bytes into a derived compatibility inventory.
- Inspection and cold-consumer orientation reconstruct route/workspace meaning from artifacts and exact archive/Handoff bytes, not from JSON semantic override.
- A deliberately diverged JSON route fact is fail-visible while the semantic route remains the exact Pointer/Handoff route.
- Existing default recipient-v2 manufacture behavior remains unchanged because the Phase 1 seam is opt-in pending Anchor review.

## Scope

- `src/tooling/portable/handoff/recipientV2.artifacts.js`
- `src/tooling/portable/handoff/recipientV2.artifactFirstPhase1.js`
- `src/tooling/portable/handoff/recipientV2.artifactFirstPhase1.test.mjs`
- `src/tooling/portable/handoff/recipientV2.topology.js`
- `src/tooling/portable/handoff/recipientV2.inspect.js`
- `src/tooling/portable/handoff/materialClosure.archiveV2.js`
- current-only Site Task/Preservation/Handoff artifacts
- no Phase 2 JSON omission, broad legacy-reader modification, Viewer work, canonical Docs schema mutation, or broad validation suite

## Dependencies

- Exact carried Site Workspace archive SHA-256 `d577a737d02bf617b444712031aaff8a541e8f3fa7e439d11341fd5f56d814b6`.
- Business artifact-first implementation task and accepted Axiom/Anchor semantic decisions carried as qualified Required Context.
- Existing recipient-v2 manufacture, artifact renderers, transport-manifest compatibility projection, and cold-consumer orientation seams.

## Focused Validation

- `node src/tooling/portable/handoff/recipientV2.artifactFirstPhase1.test.mjs`: PASS, wall `0.32 s`.
- `node src/tooling/portable/handoff/recipientV2.transportPurity.test.mjs`: PASS, wall `0.34 s`.
- `node src/tooling/portable/handoff/transportCompanion.test.mjs`: PASS, wall `0.31 s`.
- New specimen test includes manufacture, default recipient roundtrip, cold-consumer orientation, artifact shape assertions, and JSON-divergence non-override proof.

## Precise Next Acceptance Subset

- Expand Phase 1 artifact-first dual projection from this one-Workspace/one-route specimen to carried bootstrap ownership, exact Required Context closure, and explicit multi-route selection while JSON is still retained as derived compatibility output.
- After that subset qualifies, Anchor may authorize Phase 2: newly manufactured clean-carrier default without stored `tiinex-recipient-v2.transport.json`.
- Broad legacy-reader changes and Viewer work remain later subsets.

## Closure State

- Implementation: completed/local.
- Return Policy: immediate workspace-bearing Loom-to-Anchor return after focused evidence only.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: Mr3s6nAU2yYvE04vKF4ckbFKbBB0EpnckMEgIlVenu8
