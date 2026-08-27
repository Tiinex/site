# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-08-23 16:46:00
  - Trace: [Handoff carrier dimensional lineage and human projection decision](001-17-handoff-carrier-dimensional-lineage-and-human-projection-decision.trace.md)
  - Origin:
    - [relative](001-17-handoff-carrier-dimensional-lineage-and-human-projection-decision.trace.md)
    - [browse + git](https://github.com/Tiinex/site/blob/refactor/.topics/development/architect/continuity/001-17-handoff-carrier-dimensional-lineage-and-human-projection-decision.trace.md)
- Current
  - Current Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-08-26 17:55:00
  - Authors: Anchor, Sigma
  - Why: Preserve the accepted carrier-lineage semantics that drove the package-lineage Tooling implementation so the code change is recoverable from durable rationale rather than chat memory.
  - Summary: Handoff carrier child dimensions express in-major progression; explicit major advancement denotes a self-contained quiescent checkpoint, bounds filename growth, and enables retention-safe replacement of older carrier dimensions.
  - Status: accepted/local

---

# Handoff carrier major checkpoint and retention decision

## Decision

- State: accepted
- Subject: human-facing Handoff-package carrier lineage, major advancement, retention, and repo Workspace completeness
- Decision: keep carrier-history dimension separate from transported Handoff artifact dimension. Continue ordinary work as child carrier dimensions under the current major. Advance to a new major only at an explicit meaningful checkpoint where current state can stand on its own. A repo-scoped Workspace carried by a major is full-source and replacement-capable by default unless explicitly qualified otherwise.

## Carrier Progression Contract

- A fresh carrier lineage begins at a local major root such as `001`.
- Normal continuation from a known carrier appends a child segment such as `001-1`, `001-1-1`, or another Tooling-qualified child path.
- The transported Handoff artifact's own numeric path does not allocate carrier-history dimension. Artifact Parent/Trace/Origin and carrier-history projection are independent dimensions.
- Tooling owns filename projection and child/major allocation; an LLM should not manually infer the next filename from a transported Handoff artifact path.
- Renaming an outer ZIP never changes embedded carrier lineage or semantic authority.

## Major Checkpoint Contract

- Major advancement is explicit rather than automatic counting.
- A major is a quiescent checkpoint: it must not intentionally represent an in-flight code mutation, unresolved audit whose result may alter the checkpoint, or half-completed correction tranche.
- A major must be understandable as current state without diffing against the preceding major. Open work may remain only when it is explicitly represented as open state rather than hidden delta.
- Major is a human progress/retention projection, not semantic truth and not evidence that every historical branch is closed.

## Repo Workspace And Retention Contract

- For repo-scoped Workspaces, major carriage uses complete full-source snapshots by default. The human operator may delete and replace the local repository directory from that Workspace snapshot without needing previous carrier packages to reconstruct current state.
- Once a later major is qualified, older major dimensions may be retained for history or removed under a strict Downloads/transport retention policy without making the later major unusable.
- Child packages may express progression; major packages must express state.
- Partial/bounded repo Workspaces remain allowed only when explicitly qualified as non-replacement-capable so they cannot be mistaken for full-source checkpoints.

## Human Workflow Consequence

- Sigma may use a major boundary as a natural Git durability point and request full source for delete-and-replace commit/push workflows.
- This convention makes progress estimable in majors while leaving Roles free to handle corrections, branches, and deviations inside the current major without artificial checkpoint advancement.

## Implementation Correspondence

- Site Tooling now carries explicit carrier lineage metadata, package-parent continuation, explicit package-major advancement with a milestone reason, major full-workspace readiness gating, and return-continuation guidance.
- The implementation must remain subordinate to this decision and the earlier carrier authority boundary; carrier filenames never override artifact continuity.

## Interpretation Limits

- Does Not Mean: every child is disposable before a later major is successfully qualified, major numbering proves semantic truth, or Git commit state is inferred from a carrier filename.
- Must Not Be Used To Claim: publication, repository mutation, acceptance, or closure not independently established by the relevant authority/evidence.
- Authority Limits: this decision governs human-facing carrier progression and retention behavior only; artifact Parent/Trace/Origin, schema contracts, source repositories, and explicit Handoffs retain their own authority.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [Handoff carrier dimensional lineage and human projection decision](001-17-handoff-carrier-dimensional-lineage-and-human-projection-decision.trace.md)
  - Value: IKAjPHFSv3D5d_3zyi17qTEqsBbGUx1rwyJwKdynM6U

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:63dZCNokR6oO9qK-Lb1XHhxhfIFghAnfBSHRgYWvRU4
