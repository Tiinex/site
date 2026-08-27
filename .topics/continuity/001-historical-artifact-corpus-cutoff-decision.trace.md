# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-08-26 21:31:12
  - Authors: Anchor, Sigma
  - Why: Freeze the accumulated Tiinex/site artifact corpus as preserved history so future product and Tooling work can restart from a concise professional frontier without deleting the evidence that produced it.
  - Summary: All Tiinex artifacts already present in Site before this decision are historical/read-only for normal continuation; new active work must explicitly continue from this decision or a later descendant.
  - Status: accepted/local

---

# Historical Site Artifact Corpus Cutoff Decision

This decision preserves the existing Site artifact corpus as historical evidence while establishing a new explicit active frontier for future work.

## Decision

- State: accepted
- Subject: Tiinex/site artifact history cutoff and future continuation behavior
- Decision: treat every Tiinex artifact already present in the Site workspace before this decision as historical/read-only for normal continuation. Preserve those artifacts unchanged for provenance, recovery, Tooling dogfood, and later analysis. New active Site work must start from this decision or an explicitly declared later descendant rather than silently continuing an older technical graph leaf.

## Basis

- Site currently carries many overlapping development, role, handoff, continuity, Tooling, and review lineages whose graph leaves do not reliably represent the current product frontier.
- Deleting or rewriting those artifacts would remove valuable evidence and weaken Tiinex as its own pressure test.
- A single explicit cutoff creates a professional current surface while preserving the full history for inspection and learning.

## Consequences

- Pre-decision Site artifacts remain discoverable as historical/reference material but are not default continuation targets.
- A bounded historical lineage may be reactivated only by an explicit new artifact that names the intended historical material and explains why it is being resumed.
- A Handoff that carries the Site reset forward must declare this decision as its direct Parent and continue the same lineage as a child artifact, allowing Discovery to expose the decision or a later descendant as the active frontier.
- Site implementation source code is not made read-only by this artifact-history decision; source mutation remains governed by the relevant Task, Handoff, role authority, and evidence.
- This decision declares governance state only and does not claim a filesystem, Git, or Tooling write-lock that has not been independently implemented and verified.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:HvNl1avnO9RqTPQASS4owrGQbbtlLb1s9F1sqRSAOK8
