# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-28 11:48:00
  - Authors: Loom
  - Status: completed/local
  - Summary: Isolate the exact historical Site artifacts still required as test fixtures from the broad `.topics/development` discovery surface without changing their logical historical identities.

---

# Legacy Artifact Fixture Isolation

## Parent Epic

- Parent: [Tooling And Workflow Iteration Efficiency](https://github.com/Tiinex/business/blob/47aad3909e18771a4c4a74231c9d88d768919dab/.topics/initiatives/002-6-tooling-workflow-iteration-efficiency-task.trace.md)
- Cross-Repository Boundary: Business owns the epic; Site owns this bounded legacy-fixture isolation child.

## Objective

Move the exact historical bytes that current portable tests genuinely consume into a dedicated test-fixture surface so historical lineage/path semantics remain testable without requiring `.topics/development` to remain an active repository artifact tree.

## Done Criteria

- Every historical file genuinely read by the identified portable tests is copied byte-for-byte into a dedicated non-`.trace.md` fixture surface.
- A test-support helper maps qualified logical `.topics/development/...trace.md` identities to physical `.trace.fixture.txt` storage and rejects paths outside that legacy namespace or with traversal.
- Tests continue to pass historical logical paths into semantic APIs where path identity is part of the contract.
- The direct fixture consumers remain independent when the entire `.topics/development` tree is temporarily unavailable.
- Existing unrelated baseline failures remain distinguishable from fixture lookup failures.
- The legacy `.topics/development` tree is not deleted in this task.

## Scope

- `src/tooling/portable/fixtures/legacy-artifacts/**`
- `src/tooling/portable/fixtures/legacyArtifactFixtures.mjs`
- seven portable tests that previously read legacy bytes directly from `.topics/development`
- current-only task/preservation artifacts
- no production runtime semantic change
- no legacy-tree deletion

## Dependencies

- Site task `010 Legacy Topics Discovery Amplification` supplies the discovery/context amplification evidence.
- Site task `002 Site Grounding Workset Baseline` supplies the repository-volume baseline.
- Business epic `002-6 Tooling And Workflow Iteration Efficiency`.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:6d3L4SFsW8RIJhaWKpfGUtCvN5WDDfQB5JFQPFCX8tU
