# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-03 19:24:44
  - Trace: [010-safe-reduction-and-shared-capability-parity-coordination-task.trace.md](010-safe-reduction-and-shared-capability-parity-coordination-task.trace.md)
  - Origin:
    - [relative](010-safe-reduction-and-shared-capability-parity-coordination-task.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-03 19:24:51
  - Authors: Anchor
  - Why: The current reduction contract is directionally correct but does not yet fail closed on the stronger invariant required before repo-scale physical reduction.
  - Summary: Axiom semantic reconciliation for Reduction-before-delete, immutable leaf-to-cut closure, and truthful cross-repository collapse boundaries.
  - Status: ready/local

---

# Safe Reduction Contract — Anchor To Axiom

## Handoff Parties

- Purpose: reconcile and, where necessary, strengthen canonical Reduction semantics before any repo-scale destructive reduction is allowed.
- From: Anchor
- From Kind: role
- From Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
- To: Axiom
- To Kind: role
- To Reference: [Axiom Role](business::.topics/roles/001-2-axiom-role.trace.md)

## Transfers

- reduction-before-delete-semantics
  - Transfer Kind: work
  - Description: determine the canonical semantic contract for requiring a qualified Reduction before destructive removal, including immutable per-leaf expansion references, complete leaf-to-collapse-boundary Parent closure, and explicit dispositions.
  - Controlling Artifact: [Safe Reduction And Shared Capability Parity](010-safe-reduction-and-shared-capability-parity-coordination-task.trace.md)
  - Boundary: recover before inventing; existing `tiinex.reduction.v1` and the landed placement decision are inputs, not authority to silently add stronger schema meaning.

- cross-repository-collapse-boundary
  - Transfer Kind: work
  - Description: determine how Reduction placement and expansion behave when the nearest truthful surviving semantic ancestor is carried in another workspace/repository such as Business or Docs.
  - Controlling Artifact: [Safe Reduction And Shared Capability Parity](010-safe-reduction-and-shared-capability-parity-coordination-task.trace.md)
  - Boundary: repository layout must not be promoted into semantic ancestry, and cross-repository references must remain exact and immutable where historical expansion depends on them.

## Required Context

- coordination-frontier
  - Material: controlling reduction-safety coordination Task
  - Material Reference: [Safe Reduction And Shared Capability Parity](010-safe-reduction-and-shared-capability-parity-coordination-task.trace.md)
  - Purpose: exact new stop condition, done criteria, and role boundaries.
  - Availability: available

- existing-reduction-contract
  - Material: current Reduction Placement And Expansion Contract
  - Material Reference: [Reduction Placement And Expansion Contract](008-reduction-placement-and-expansion-contract-decision.trace.md)
  - Purpose: current architectural starting point to reconcile, preserve, supersede, or qualify more precisely.
  - Availability: available

- concrete-tooling-reduction
  - Material: existing Tooling historical-lineage Reduction
  - Material Reference: [Tooling Historical Lineage Reduction](009-1-tooling-historical-lineage-reduction.trace.md)
  - Purpose: concrete evidence of commit-pinned leaf references and dispositions that should be evaluated against the stronger invariant.
  - Availability: available

- current-reduction-task
  - Material: prior repo-scale reduction execution Task
  - Material Reference: [Repo-Scale Site Reduction Finalization](008-1-1-1-site-repo-scale-reduction-finalization-task.trace.md)
  - Purpose: identify which earlier execution assumptions must now be gated or corrected.
  - Availability: available

## Reference Context

- reduction-schema
  - Material: current canonical Reduction schema carried in Site/Docs schema material
  - Material Reference: [Reduction Schema](../../src/schemas/reduction/tiinex.reduction.v1.schema.md)
  - Purpose: inspect current machine/readable contract and decide whether semantic strengthening belongs here or in adjacent authority.
  - Availability: available

## Retained Responsibilities

- cross-role-architecture
  - Retained By: Anchor
  - Responsibility: reconcile Axiom's semantic return with Loom implementation and decide the later reduction execution gate.

- human-acceptance
  - Retained By: Sigma
  - Responsibility: provide human priority/acceptance where the later destructive repository action requires it.

## Exclusions And Dependencies

- no-tooling-implementation
  - Kind: excluded-scope
  - Description: do not implement portable Tooling or Viewer code; return semantic requirements and canonical artifacts/changes only within Axiom authority.
  - Responsible Party Or Role: Loom

- no-reduction-execution
  - Kind: excluded-scope
  - Description: no historical files are removed as part of this semantic reconciliation.
  - Responsible Party Or Role: Anchor

## Session Role Binding

- Sender Role: Anchor.
- Recipient Role: Axiom.
- Holder Binding: the consuming session must explicitly operate in the Axiom capacity before acting; consuming or opening this package does not itself assign Axiom to the assistant, user, or transport process.
- Re-grounding Rule: on cold start, preserve From/To as semantic role endpoints and report holder/session binding as unresolved unless explicitly supplied by the host/session.

## Completion Expectation

- Signal Kind: result
- Signal Meaning: Axiom returns a qualified semantic Decision/schema delta/validation expectation that makes the Reduction-before-delete and cross-repository expansion boundary unambiguous enough for Loom to implement without inventing meaning.
- Return To: Anchor
- Return To Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
- Expected Result Reference: [Safe Reduction And Shared Capability Parity](010-safe-reduction-and-shared-capability-parity-coordination-task.trace.md)

## Interpretation Limits

- Does Not Mean: the current broad Site reduction is approved, the existing Reduction schema already satisfies the stronger invariant, or repository co-location defines semantic ancestry.
- Must Not Be Used To Claim: package consumption assigns the Axiom holder; Axiom's technical semantic PASS equals Sigma acceptance or Loom implementation qualification.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [010-safe-reduction-and-shared-capability-parity-coordination-task.trace.md](010-safe-reduction-and-shared-capability-parity-coordination-task.trace.md)
  - Value: WgqDH72Zm7r0dxEcl62r4WCBunYRq_93JUC2t-TFNlM

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: EZSehwlOi7ueOQdY9JaEvDKOGQtP8DLSvhaOL0NTM_8