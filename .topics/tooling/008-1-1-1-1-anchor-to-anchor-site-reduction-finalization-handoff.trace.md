# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-03 18:07:43
  - Trace: [008-1-1-1-site-repo-scale-reduction-finalization-task.trace.md](008-1-1-1-site-repo-scale-reduction-finalization-task.trace.md)
  - Origin:
    - [relative](008-1-1-1-site-repo-scale-reduction-finalization-task.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-03 18:08:13
  - Authors: Anchor
  - Why: Give a fresh Anchor a correct current Task target and preserve the distinction between Anchor continuity and Sigma operational repository action.
  - Summary: Anchor continuity Handoff for finishing the repo-scale Site reduction from durable Business and Site checkpoints, then routing actual repository mutation to Sigma.
  - Status: ready/local

---

# Repo-Scale Site Reduction Finalization — Anchor To Anchor

## Handoff Parties

- Purpose: hand a fresh Anchor the current repo-scale Site reduction task after Sigma durably landed both the reduction-process checkpoint in Site and the canonical Kodax Role in Business.
- From: Anchor
- From Kind: role
- From Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
- To: Anchor
- To Kind: role
- To Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)

## Transfers

- repo-scale-site-reduction
  - Transfer Kind: work
  - Description: complete the current repo-scale Site Reduction task, including semantic leaf classification, per-surviving-ancestor Reduction artifacts, pinned immutable leaf expansion references, historical Viewer-local Kodax supersession, regression proof, and cold-ground proof.
  - Controlling Artifact: [Repo-Scale Site Reduction Finalization](008-1-1-1-site-repo-scale-reduction-finalization-task.trace.md)
  - Boundary: broad deletion is not itself the objective; the objective is a small truthful current graph with explicit observable Reduction nodes and durable explodable history.

- next-sigma-operational-gate
  - Transfer Kind: responsibility
  - Description: after the reduced Site candidate qualifies and cold-proves, manufacture one canonical Anchor-to-Sigma operational Handoff package for the actual human replace/delete/commit/push step.
  - Controlling Artifact: [Repo-Scale Site Reduction Finalization](008-1-1-1-site-repo-scale-reduction-finalization-task.trace.md)
  - Boundary: Anchor-to-Anchor is continuity; when human repository mutation is required the recipient must be Sigma, and the Handoff package itself must carry the action material rather than loose downloads.

## Required Context

- current-reduction-task
  - Material: repo-scale Site reduction finalization Task
  - Material Reference: [Current Task](008-1-1-1-site-repo-scale-reduction-finalization-task.trace.md)
  - Purpose: exact objective, done criteria, scope, immutable checkpoints, and next-human-gate contract.
  - Availability: available

- reduction-placement-contract
  - Material: Reduction Placement And Expansion Contract
  - Material Reference: [Reduction Contract](008-reduction-placement-and-expansion-contract-decision.trace.md)
  - Purpose: governs where Reduction nodes live and how removed history remains observable/explodable.
  - Availability: available

- tooling-current-carry-forward
  - Material: current Tooling carry-forward anchor
  - Material Reference: [Tooling Carry-Forward](009-tooling-first-foundation-ergonomics-current-carry-forward-task.trace.md)
  - Purpose: current qualified anchor for the historical Tooling epic where historical bytes should not be rewritten simply to become a current Parent.
  - Availability: available

- tooling-historical-reduction
  - Material: first Tooling historical-lineage Reduction under the new process contract
  - Material Reference: [Tooling Historical Lineage Reduction](009-1-tooling-historical-lineage-reduction.trace.md)
  - Purpose: retained concrete per-leaf expansion/disposition pattern to reconcile into the broader Site reduction.
  - Availability: available

- author-repair-unresolved-gate
  - Material: explicit unresolved human gate
  - Material Reference: [Author Repair Human Gate](009-2-schema-invalid-author-repair-human-acceptance-carry-forward-task.trace.md)
  - Purpose: prevent broad reduction from silently reclassifying unfinished human acceptance as completed history.
  - Availability: available

- viewer-current-frontier
  - Material: Viewer Artifact + Action Parity active-major Task
  - Material Reference: [Viewer Artifact + Action Parity](../viewer/004-anchor-viewer-artifact-action-parity-recovery-active-major-task.trace.md)
  - Purpose: next product frontier to preserve/reissue after reduction; implementation stays gated until the reduced Site state is durable.
  - Availability: available

## Reference Context

- business-kodax-durability
  - Material: canonical Kodax Role and immutable Business checkpoint
  - Material Reference: [Kodax Role at Business commit 7df3a33e5e9c418dbe14a4cee53c45caba66aad6](https://github.com/Tiinex/business/blob/7df3a33e5e9c418dbe14a4cee53c45caba66aad6/.topics/roles/001-6-kodax-role.trace.md)
  - Purpose: durable canonical successor for the historical Viewer-local Kodax Role; Anchor verified Business `master` at this commit and the Role blob as `48fee5a2cf405a88c9ca63105d04d4d1d38c7532`.
  - Availability: available

- site-process-durability
  - Material: immutable Site checkpoint after Sigma committed the reduction-process/carry-forward artifacts
  - Material Reference: [Site commit ba6e587f35d9a915dae1cac3a96b28df3d654c08](https://github.com/Tiinex/site/commit/ba6e587f35d9a915dae1cac3a96b28df3d654c08)
  - Purpose: current remote starting checkpoint; it lands the process contract and initial carry-forward/reduction artifacts but does not yet perform the intended broad Site reduction.
  - Availability: available

## Retained Responsibilities

- reduction-semantics
  - Retained By: Anchor
  - Responsibility: preserve current-versus-historical truth, ensure each removed leaf has a pinned expansion handle and explicit disposition/reason, and avoid fabricating completion or authority merely to reduce file count.

- viewer-progression
  - Retained By: Anchor
  - Responsibility: only after the reduced Site state is committed and cold-grounded should Anchor route Viewer Artifact + Action implementation to Kodax using the canonical Business Role.

## Exclusions And Dependencies

- no-immediate-viewer-implementation
  - Kind: unresolved-dependency
  - Description: Viewer implementation remains gated on a durably landed reduced Site frontier and a later explicit Anchor-to-Kodax Handoff.
  - Responsible Party Or Role: Anchor

- no-hidden-history
  - Kind: excluded-scope
  - Description: do not reduce branches by simply deleting them. Reduction artifacts must remain followable from current semantic ancestors/carry-forward anchors and must expose immutable leaf permalinks sufficient for later graph expansion.
  - Responsible Party Or Role: Anchor

- no-loose-operational-transport
  - Kind: excluded-scope
  - Description: when Sigma is asked to mutate repositories, use one canonical Handoff package containing the relevant material; do not emit a bundle of loose files as the action protocol.
  - Responsible Party Or Role: Anchor

## Completion Expectation

- Signal Kind: result
- Signal Meaning: fresh Anchor finishes and qualifies the repo-scale Site reduction, proves current and historical-expansion behavior from a cold consumer, and manufactures the role-correct Anchor-to-Sigma operational Handoff for the human Site landing.
- Return To: Anchor
- Return To Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
- Expected Result Reference: [Repo-Scale Site Reduction Finalization](008-1-1-1-site-repo-scale-reduction-finalization-task.trace.md)

## Interpretation Limits

- Does Not Mean: broad Site reduction is already done, old lineage can now be removed without Reduction artifacts, or Kodax should start the Viewer major immediately.
- Must Not Be Used To Claim: Anchor-to-Anchor continuity is the correct recipient for a future human commit/push action; that step remains a separate Anchor-to-Sigma operational Handoff.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [008-1-1-1-site-repo-scale-reduction-finalization-task.trace.md](008-1-1-1-site-repo-scale-reduction-finalization-task.trace.md)
  - Value: RqRMdAjRph1OjmAiTf6Vz8m4x0_fdS5uJDgoI9-AYTg

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: ascjr0Gxf6pPLzjMwhzj88NWL5W7wtwf2Jn87J9aKKc