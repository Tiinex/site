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
  - Created At: 2026-09-03 19:24:56
  - Authors: Anchor
  - Why: Existing portable repair mechanics are substantial but need repository-scale coverage, shared Viewer projection, and stronger reduction/grounding orchestration before destructive reduction resumes.
  - Summary: Loom hardening for shared audit/repair parity, reduction preflight/planning, and explicit multi-route actor grounding.
  - Status: ready/local

---

# Reduction Audit Repair Parity — Anchor To Loom

## Handoff Parties

- Purpose: harden shared audit/repair and reduction-planning mechanics, and make the same capabilities consumable by Viewer humans and LLMs without policy forks.
- From: Anchor
- From Kind: role
- From Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
- To: Loom
- To Kind: role
- To Reference: [Loom Role](business::.topics/roles/001-3-loom-role.trace.md)

## Transfers

- audit-repair-capability-parity
  - Transfer Kind: work
  - Description: inventory and harden the existing portable audit/repair mechanics so broken artifacts and lineages are machine-flagged, repair actions are projected safely, local changes are explicitly approved and receipted, and post-repair re-audit is first-class.
  - Controlling Artifact: [Safe Reduction And Shared Capability Parity](010-safe-reduction-and-shared-capability-parity-coordination-task.trace.md)
  - Boundary: reuse shared mechanics; Viewer presentation must call the same capability/action owners rather than implement private repair policy.

- reduction-preflight-and-planner
  - Transfer Kind: work
  - Description: build or prepare the Tooling seam that inventories semantic leaves, classifies reduction eligibility, computes each disappearing leaf-to-collapse-boundary Parent closure, verifies immutable permalinks, and refuses destructive apply unless the qualified pre-delete Reduction contract is satisfied.
  - Controlling Artifact: [Safe Reduction And Shared Capability Parity](010-safe-reduction-and-shared-capability-parity-coordination-task.trace.md)
  - Boundary: Axiom owns unresolved canonical Reduction meaning; implement only semantics already qualified and return semantic gaps rather than guessing.

- shared-carrier-and-actor-grounding
  - Transfer Kind: work
  - Description: qualify same-bytes multi-route Handoff carrier use with recipient-specific routing text and make cold grounding expose role endpoints separately from holder/session binding so a recipient route cannot silently relabel assistant/user identity.
  - Controlling Artifact: [Safe Reduction And Shared Capability Parity](010-safe-reduction-and-shared-capability-parity-coordination-task.trace.md)
  - Boundary: transport selection and session holder binding are not semantic role assignment, acceptance, or authority.

## Required Context

- coordination-frontier
  - Material: controlling reduction-safety coordination Task
  - Material Reference: [Safe Reduction And Shared Capability Parity](010-safe-reduction-and-shared-capability-parity-coordination-task.trace.md)
  - Purpose: exact scope and stop conditions for shared Tooling work.
  - Availability: available

- current-reduction-contract
  - Material: current Reduction Placement And Expansion Contract
  - Material Reference: [Reduction Placement And Expansion Contract](008-reduction-placement-and-expansion-contract-decision.trace.md)
  - Purpose: current qualified architecture while Axiom reconciles the stronger semantic invariant.
  - Availability: available

- concrete-reduction-example
  - Material: Tooling historical-lineage Reduction
  - Material Reference: [Tooling Historical Lineage Reduction](009-1-tooling-historical-lineage-reduction.trace.md)
  - Purpose: concrete current leaf-permalink pattern for planner/audit fixtures.
  - Availability: available

- unresolved-repair-case
  - Material: schema-invalid author-repair human gate
  - Material Reference: [Schema-Invalid Author Repair Human Gate](009-2-schema-invalid-author-repair-human-acceptance-carry-forward-task.trace.md)
  - Purpose: real unresolved case that must remain fail-visible and not be auto-completed by repair tooling.
  - Availability: available

- viewer-human-parity-target
  - Material: Viewer Artifact + Action active-major Task
  - Material Reference: [Viewer Artifact And Action Parity](../viewer/004-anchor-viewer-artifact-action-parity-recovery-active-major-task.trace.md)
  - Purpose: existing Viewer target whose human actions must reuse shared Tooling capabilities.
  - Availability: available

## Reference Context

- existing-portable-operations
  - Material: current shared portable operation catalog and lineage integrity implementation in the carried Site workspace
  - Material Reference: [Portable Operation Catalog](../../src/tooling/portable/operation.catalog.js)
  - Purpose: begin with existing `audit`, `repair-plan`, `lineage-integrity-plan`, `lineage-integrity-project`, and `lineage-integrity-apply` rather than duplicating them.
  - Availability: available

- current-viewer-audit-surface
  - Material: current Viewer workspace audit presentation
  - Material Reference: [Workspace Audit View](../../src/schemas/workspace/workspace.audit.views.jsx)
  - Purpose: identify presentation that should consume shared capability/action results rather than fork semantics.
  - Availability: available

## Retained Responsibilities

- canonical-semantics
  - Retained By: Axiom
  - Responsibility: resolve any missing or contradictory Reduction/schema meaning before Loom implements that semantic behavior.

- architecture-and-progression
  - Retained By: Anchor
  - Responsibility: reconcile Loom/Axiom returns, decide whether reduction execution can resume, and route bounded Viewer implementation.

## Exclusions And Dependencies

- no-schema-invention
  - Kind: unresolved-dependency
  - Description: where the stronger Reduction-before-delete invariant requires canonical semantic change, stop that portion and return the exact gap to Anchor/Axiom instead of encoding a Loom-private rule.
  - Responsible Party Or Role: Axiom

- no-remote-write
  - Kind: excluded-scope
  - Description: repair application and reduction planning remain local/result-producing; no GitHub mutation, publication, or destructive repository delete is authorized.
  - Responsible Party Or Role: Sigma

- no-viewer-policy-fork
  - Kind: excluded-scope
  - Description: Viewer may render shared findings/actions but must not own a second repair/reduction truth model.
  - Responsible Party Or Role: Loom

## Session Role Binding

- Sender Role: Anchor.
- Recipient Role: Loom.
- Holder Binding: the consuming session must explicitly operate in the Loom capacity before acting; package consumption alone does not assign Loom to assistant/user/process identity.
- Re-grounding Rule: cold grounding must distinguish route recipient, semantic Role reference, and actual session holder binding; unresolved holder binding remains visible.

## Completion Expectation

- Signal Kind: result
- Signal Meaning: Loom returns qualified Evidence and a return Handoff covering existing capability inventory, implemented or precisely blocked audit/repair/reduction-planning improvements, Viewer-shared capability seams, multi-route carrier/actor-grounding qualification, tests, and exact remaining Axiom/Anchor decisions.
- Return To: Anchor
- Return To Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
- Expected Result Reference: [Safe Reduction And Shared Capability Parity](010-safe-reduction-and-shared-capability-parity-coordination-task.trace.md)

## Interpretation Limits

- Does Not Mean: Loom may redefine Reduction semantics, auto-repair unresolved human decisions, delete historical files, or infer session identity from route selection.
- Must Not Be Used To Claim: a Viewer UI rendering is semantic qualification, local repair application is remote publication, or a clean audit alone authorizes reduction.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [010-safe-reduction-and-shared-capability-parity-coordination-task.trace.md](010-safe-reduction-and-shared-capability-parity-coordination-task.trace.md)
  - Value: WgqDH72Zm7r0dxEcl62r4WCBunYRq_93JUC2t-TFNlM

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: fGQPu6qwdKwJTT-RliUJI4dz12w9UXRseVE98UIRjOg