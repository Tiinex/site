# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.evidence.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/evidence/tiinex.evidence.v1.schema.md)
  - Created At: 2026-09-03 13:13:35
  - Trace: [007-4-1-1-2-1-1-2-anchor-loom-return-carrier-cold-sufficiency-regression-evidence.trace.md](007-4-1-1-2-1-1-2-anchor-loom-return-carrier-cold-sufficiency-regression-evidence.trace.md)
  - Origin:
    - [relative](007-4-1-1-2-1-1-2-anchor-loom-return-carrier-cold-sufficiency-regression-evidence.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-03 13:14:12
  - Authors: Anchor
  - Why: The Loom return is technically qualified but fails the normal cold-start ground path with recipient-role-unresolved; preserve implementation and correct only return-carrier Role binding.
  - Summary: Anchor requests one carrier-only Loom correction for missing recipient Anchor Role binding before Sigma acceptance.
  - Status: ready/local

---

# Author-Repair Return Carrier Cold-Sufficiency Correction — Anchor To Loom

## Handoff Parties

- Purpose: request one carrier-only correction so the technically qualified author-repair return can be cold-started by a fresh Anchor through the normal shared `ground` path before Sigma acceptance.
- From: Anchor
- From Kind: role
- From Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
- To: Loom
- To Kind: role
- To Reference: [Loom Role](business::.topics/roles/001-3-loom-role.trace.md)

## Transfers

- return-carrier-role-binding-correction
  - Transfer Kind: work
  - Description: re-author only the Loom-to-Anchor return Handoff/carrier so the recipient endpoint carries the exact Anchor Role reference and the untouched child carrier reaches `grounded-to-act` on the normal public `ground` path.
  - Controlling Artifact: [Schema-Invalid Author Repair Common-Path Ergonomics](007-4-1-1-2-anchor-schema-invalid-author-repair-common-path-ergonomics-task.trace.md)
  - Boundary: preserve the already-qualified author-repair source and Loom technical Evidence unless correcting the carrier reveals a separate technical failure; do not broaden into schema semantics, Viewer/Extension, release, or remote mutation.

## Required Context

- anchor-carrier-regression-evidence
  - Material: Loom Return Carrier Cold-Sufficiency Regression — Anchor Evidence
  - Material Reference: [Anchor Evidence](007-4-1-1-2-1-1-2-anchor-loom-return-carrier-cold-sufficiency-regression-evidence.trace.md)
  - Purpose: exact blocked `recipient-role-unresolved` observation, parent-carrier control, qualified Anchor Role identity, and bounded correction requirement.
  - Availability: available

- loom-technical-evidence
  - Material: Schema-Invalid Author Repair Common-Path Ergonomics — Loom Evidence
  - Material Reference: [Loom Evidence](007-4-1-1-2-1-1-loom-schema-invalid-author-repair-common-path-ergonomics-evidence.trace.md)
  - Purpose: preserve the technically qualified implementation result unchanged while correcting only return transport/cold-sufficiency.
  - Availability: available

- controlling-task
  - Material: Schema-Invalid Author Repair Common-Path Ergonomics
  - Material Reference: [Controlling Task](007-4-1-1-2-anchor-schema-invalid-author-repair-common-path-ergonomics-task.trace.md)
  - Purpose: retain the original done criteria, exclusions, and fresh-Sigma gate.
  - Availability: available

## Reference Context

- accepted-parent-cold-sufficiency
  - Material: Human-First Common CLI Stable Checkpoint — Anchor To Fresh Anchor
  - Material Reference: [Carrier Major 007 Handoff](007-4-1-1-1-anchor-to-anchor-human-first-common-cli-major-checkpoint-handoff.trace.md)
  - Purpose: control example whose Handoff Parties include exact Anchor Role endpoint references and whose normal ground path remains `grounded-to-act`.
  - Availability: available

## Retained Responsibilities

- fresh-human-workflow-acceptance
  - Retained By: Sigma
  - Responsibility: perform the originally planned fresh invalid Evidence/Handoff repair workflow only after Anchor receives a corrected cold-sufficient return carrier.

- progression-disposition
  - Retained By: Anchor
  - Responsibility: verify the corrected carrier on the normal public ground path, then route Sigma or reject if the correction still fails.

## Exclusions And Dependencies

- no-author-repair-reimplementation
  - Kind: excluded-scope
  - Description: do not change the qualified author-repair implementation merely to satisfy this transport correction unless exact requalification exposes a distinct defect.
  - Responsible Party Or Role: Loom

- exact-recipient-role-binding
  - Kind: unresolved-dependency
  - Description: the corrected Loom-to-Anchor return Handoff must include `To Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)` so recipient Role material is resolvable without prior conversation state.
  - Responsible Party Or Role: Loom

- no-broader-work
  - Kind: excluded-scope
  - Description: no Viewer/Extension, role-semantic redesign, Handoff-package topology redesign, release/deployment, public-trust closure, Foundation exit, or remote write is part of this correction.
  - Responsible Party Or Role: Loom; Anchor

## Completion Expectation

- Signal Kind: result
- Signal Meaning: Anchor receives one corrected canonical child return carrier whose untouched normal `ground` invocation resolves Anchor Role material and reaches `grounded-to-act`, with the existing Loom author-repair technical Evidence retained.
- Return To: Anchor

## Interpretation Limits

- Does Not Mean: Loom's author-repair implementation has been rejected, Sigma acceptance has occurred, the major is closed, or new schema semantics are required.
- Must Not Be Used To Claim: permission to bypass Role qualification, rely on parent-chat memory for fresh recipients, mutate unrelated source, resume Viewer work, or perform release/remote mutation.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [007-4-1-1-2-1-1-2-anchor-loom-return-carrier-cold-sufficiency-regression-evidence.trace.md](007-4-1-1-2-1-1-2-anchor-loom-return-carrier-cold-sufficiency-regression-evidence.trace.md)
  - Value: XoIwmPIiNI0k-y2sS8qqncguiLGQLmUdoqxXioYAx0o

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: ENM6yFecR4T_QiX3SGe9lPq69DmuCVM8q6sPPwiW5LU