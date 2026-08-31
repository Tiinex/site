# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/8f568f14658a48500e2fa4d0d72a58620eaae759/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/8f568f14658a48500e2fa4d0d72a58620eaae759/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-30 23:20:00
  - Trace: [Parent Recovery Runtime Reconciliation](001-2-parent-recovery-runtime-reconciliation-task.trace.md)
  - Origin:
    - [relative](001-2-parent-recovery-runtime-reconciliation-task.trace.md)
    - [browse + git](https://github.com/Tiinex/site/blob/92cc42a8ea92aad894b28ba825dccc83ed9a0778/.topics/tooling/001-2-parent-recovery-runtime-reconciliation-task.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/8f568f14658a48500e2fa4d0d72a58620eaae759/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-08-30 23:40:00
  - Authors: Anchor
  - Why: Let Loom inspect the exact scoped-export recovery gap in parallel with Axiom semantic review without prematurely locking implementation to an unreviewed contract.
  - Summary: Anchor-to-Loom impact Discovery for scoped Handoff/export recovery closure using the current full-source carrier model.
  - Status: ready/local

---

# Scoped Export Recovery Impact — Loom Handoff

## Handoff Parties

- Purpose: identify the smallest Tooling/export seam needed so bounded package scope can omit ancestor bytes without breaking Parent recovery, while preserving exact source artifact bytes and current multi-route carrier behavior
- From: Anchor
- From Kind: role
- To: Loom
- To Kind: role

## Transfers

- implementation-impact-discovery
  - Transfer Kind: work-and-responsibility
  - Description: inspect current manufacture/material-closure/recipient-v2/export paths and identify exactly where out-of-scope Parent edges can be detected, represented, qualified, and failed closed without rewriting canonical source bytes
  - Controlling Artifact: [Parent Recovery Runtime Reconciliation](001-2-parent-recovery-runtime-reconciliation-task.trace.md)
  - Boundary: this parallel turn is Discovery/plan-first; do not hard-code new Root semantics while Axiom review is still open

- multi-route-pressure-test
  - Transfer Kind: work
  - Description: use the shared carrier itself as evidence that one full-source ZIP can expose distinct Axiom and Loom routes through route-specific outer transport text; note any correctness or maintainability issue but do not duplicate carriers solely for recipient naming
  - Boundary: package-local routing is transport addressing only and must not become semantic Handoff identity

- durable-return
  - Transfer Kind: work
  - Description: leave a bounded Loom-owned Discovery or ready Task in Site and return to Anchor with exact modules/tests/contract dependencies needed for the next implementation turn
  - Boundary: return must preserve the complete inherited Business/Docs/Site source chain; do not replace a lost Workspace with a fresh GitHub checkout

## Required Context

- current-runtime-reconciliation
  - Material: completed Site Parent recovery runtime reconciliation task
  - Material Reference: [Runtime reconciliation](001-2-parent-recovery-runtime-reconciliation-task.trace.md)
  - Purpose: exact implementation baseline and explicit statement that scoped-export augmentation is not implemented yet
  - Availability: available

## Reference Context

- full-source-carrier-policy
  - Material: this shared carrier deliberately transports complete Business, Docs, and Site Workspace snapshots even though Loom's semantic transfer is narrower
  - Purpose: preserve Foundation cold-start continuity and prevent long-dialog Workspace loss; carriage itself does not transfer ownership of all carried work
  - Availability: available

- published-site-baseline
  - Material: Site refactor commit 92cc42a8ea92aad894b28ba825dccc83ed9a0778
  - Material Reference: [Site published baseline](https://github.com/Tiinex/site/tree/92cc42a8ea92aad894b28ba825dccc83ed9a0778)
  - Purpose: distinguish published runtime baseline from local work in this turn
  - Availability: available

- axiom-parallel-review
  - Material: sibling Axiom Handoff in the same carrier reviews canonical recovery semantics
  - Purpose: Loom may identify semantic questions for Anchor/Axiom but must not resolve them by implementation convention
  - Availability: available

## Retained Responsibilities

- canonical-schema-semantics
  - Retained By: Axiom
  - Responsibility: decide any Root/schema change required for recovery adapters or package-boundary semantics
  - Boundary: Loom discovery can report implementation pressure but cannot authorize schema meaning

- architecture-and-cross-role-closure
  - Retained By: Anchor
  - Responsibility: merge Axiom and Loom returns into one coherent next turn and prevent parallel work from diverging into competing contracts
  - Boundary: Anchor does not substitute for Loom implementation qualification

- viewer-product-observation
  - Retained By: Sigma
  - Responsibility: later compare PoC/refactor behavior and workflow feel after correctness foundations are stable enough to test
  - Boundary: no UX acceptance is requested in this Loom turn

## Exclusions And Dependencies

- broad-viewer-ux
  - Kind: excluded-scope
  - Description: do not expand into general Viewer ergonomics, create/update/publish UX, or Atlas
  - Responsible Party Or Role: Loom

- canonical-root-change
  - Kind: unresolved-dependency
  - Description: implementation work that depends on semantic wording waits for Axiom return; Discovery may proceed immediately
  - Responsible Party Or Role: Axiom

- remote-source-mutation
  - Kind: excluded-scope
  - Description: work only in the carried local source and return transport; do not mutate GitHub as part of this Handoff
  - Responsible Party Or Role: Loom

## Completion Expectation

- Signal Kind: result
- Signal Meaning: return a durable Site Discovery/ready Task naming the exact smallest implementation slice, its tests, semantic dependencies, and any blocker; do not claim scoped export is implemented unless this Handoff is explicitly superseded by a later implementation transfer
- Return To: Anchor

## Interpretation Limits

- Does Not Mean: that full-source carriage is the permanent product export model, that scoped packages may break ancestry, that package overlays may silently alter canonical artifact bytes, or that a shared multi-route ZIP merges recipient responsibilities
- Must Not Be Used To Claim: canonical schema acceptance, Viewer acceptance, Foundation acceptance, or permission for broad Tooling expansion

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [Parent Recovery Runtime Reconciliation](001-2-parent-recovery-runtime-reconciliation-task.trace.md)
  - Value: lk4fzC9ecLE-0pC8No4GEpqtmJx63DhsJyLpd29L60c

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: mTOacOAyCjsvz0moUAMPLwyuZyI6ddk_-7lIrCCTB0Y
