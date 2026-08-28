# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-28 11:29:22
  - Authors: Loom
  - Status: completed/local
  - Summary: Quantify repeated SHA-256 work during real recipient-v2 Handoff manufacture and roundtrip before changing verification orchestration.

---

# Recipient Hash Multiplicity Profile

## Parent Epic

- Parent: [Tooling And Workflow Iteration Efficiency](https://github.com/Tiinex/business/blob/47aad3909e18771a4c4a74231c9d88d768919dab/.topics/initiatives/002-6-tooling-workflow-iteration-efficiency-task.trace.md)
- Cross-Repository Boundary: Business owns the epic; Site owns this bounded diagnostic child.

## Objective

Measure exact repeated digest work within one manufacture process and identify which recipient-v2 inspection call paths dominate it, without changing Site source.

## Done Criteria

- CPU-profile one real default-roundtrip manufacture.
- Count exact `(byte length, final SHA-256)` multiplicity in temporary diagnostic runtime copies for no-roundtrip and default-roundtrip manufacture.
- Preserve total hash calls, total hashed bytes, duplicate hashed bytes, and repeated large-payload counts.
- Keep the diagnostic runtime outside the Site workspace and make no semantic/runtime optimization in this task.

## Scope

- temporary host-local instrumented copy of the verified incoming bootstrap runtime
- current Site workspace as read-only manufacture input
- current-only task/preservation artifacts
- no production source change

## Dependencies

- Site task `009 Handoff Lifecycle Timing Baseline`.
- Business epic `002-6 Tooling And Workflow Iteration Efficiency`.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:zCFgIDoKIxXeWx9Jmr5vW6Rgd-_8rDx7hk9SL08bm1s