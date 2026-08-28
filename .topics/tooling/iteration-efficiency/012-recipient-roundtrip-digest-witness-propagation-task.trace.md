# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-28 11:40:00
  - Authors: Loom
  - Status: completed/local
  - Summary: Propagate exact same-operation recipient byte-identity witnesses through construction, route inspection, and roundtrip rehydration so only distinct integrity boundaries hash large payloads.

---

# Recipient Roundtrip Digest Witness Propagation

## Parent Epic

- Parent: [Tooling And Workflow Iteration Efficiency](https://github.com/Tiinex/business/blob/47aad3909e18771a4c4a74231c9d88d768919dab/.topics/initiatives/002-6-tooling-workflow-iteration-efficiency-task.trace.md)
- Cross-Repository Boundary: Business owns the epic; Site owns this bounded recipient-v2 optimization child.

## Objective

Remove redundant SHA-256 recomputation for already-finalized construction bytes and already-qualified same-operation inspection witnesses while retaining independent physical verification before and after roundtrip serialization.

## Done Criteria

- Transport-manifest construction reuses a finalized file digest only for the same frozen finalized file and falls back to hashing otherwise.
- Route Pointer qualification compares archive identity against the archive digest already established by the current recipient inspection rather than hashing the archive again.
- Roundtrip reinspection may reuse only the exact outer-ZIP parser witness tied to the same rehydrated `Uint8Array` object and byte length.
- Source physical transport-manifest inspection remains an independent hash boundary.
- Outer roundtrip ZIP parsing remains an independent received-byte hash boundary.
- Existing recipient-v2 tamper/fail-closed, material-closure, cold-start, and bounded iteration tests remain green.
- Real full-Site default-roundtrip manufacture remains `ready` and demonstrates reduced digest multiplicity and wall-clock.

## Scope

- `src/tooling/portable/handoff/recipientV2.transportManifest.js`
- `src/tooling/portable/handoff/recipientV2.lineage.js`
- `src/tooling/portable/handoff/recipientV2.inspect.js`
- current-only task/preservation artifacts
- no global or cross-operation digest cache
- no removal of source or received physical verification

## Dependencies

- Site task `010 Recipient Hash Multiplicity Profile` supplies the repeated-digest baseline.
- Site task `011 Recipient Inspection Digest Witness Reuse` supplies the same-inspection witness boundary and bootstrap/cache caller wiring.
- Business epic `002-6 Tooling And Workflow Iteration Efficiency`.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:4v66NQhNzT6QfVYuLcYHg8-tMbtXKxC43U3BJSVTjOM
