# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-28 11:33:11
  - Authors: Loom
  - Status: completed/local
  - Summary: Reuse exact byte-identity witnesses only within one recipient-v2 inspection/roundtrip boundary to remove redundant large-payload hashing without weakening rehydration verification.

---

# Recipient Inspection Digest Witness Reuse

## Parent Epic

- Parent: [Tooling And Workflow Iteration Efficiency](https://github.com/Tiinex/business/blob/47aad3909e18771a4c4a74231c9d88d768919dab/.topics/initiatives/002-6-tooling-workflow-iteration-efficiency-task.trace.md)
- Cross-Repository Boundary: Business owns the epic; Site owns this bounded recipient-v2 optimization child.

## Objective

Remove repeated SHA-256 work after the same synchronous inspection boundary has already produced an exact physical-byte witness, while retaining a fresh inspection after serialization/rehydration and preserving legacy fallback behavior.

## Done Criteria

- Transport-manifest inspection exposes its observed exact byte identity per physical path.
- ZIP payload verification may reuse only that same-call observed identity when byte length and digest shape qualify; otherwise it hashes normally.
- Roundtrip source/received comparison may use equal verified transport-manifest identity when both sides independently inspect valid; manifest-absent paths retain the prior full byte comparison.
- Existing recipient-v2 tamper/fail-closed and roundtrip tests remain green.
- Real manufacture A/B shows reduced repeated hash volume and no changed ready/roundtrip result.

## Scope

- `src/tooling/portable/handoff/recipientV2.transportManifest.js`
- `src/tooling/portable/handoff/recipientV2.inspect.helpers.js`
- `src/tooling/portable/handoff/recipientV2.inspect.js`
- current-only task/preservation artifacts
- no cross-operation/global digest cache
- no skipping of received/rehydrated inspection

## Dependencies

- Site task `010 Recipient Hash Multiplicity Profile` supplies the exact before-baseline.
- Business epic `002-6 Tooling And Workflow Iteration Efficiency`.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:ggmmKGNP3oaNpQrGFfagP0n_0-PVhqYe4mGPgApudHA