# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-09-03 15:06:54
  - Trace: [002-4-anchor-viewer-navigation-technical-progression-decision.trace.md](002-4-anchor-viewer-navigation-technical-progression-decision.trace.md)
  - Origin:
    - [relative](002-4-anchor-viewer-navigation-technical-progression-decision.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-03 15:07:16
  - Authors: Anchor
  - Why: Anchor independently reproduced the bounded machine qualification and the active major now requires fresh Sigma judgment of recognizability and return-context behavior.
  - Summary: Transfer the technically qualified Viewer Navigation Parity candidate to Sigma for the fresh human/browser gate.
  - Status: ready/local

---

# Viewer Navigation Parity — Anchor To Sigma Acceptance

## Handoff Parties

- Purpose: transfer the technically qualified Viewer Navigation Parity candidate to Sigma for fresh human/browser acceptance of the normal navigation path without asking Sigma to repeat machine qualification
- From: Anchor
- From Kind: role
- To: Sigma
- To Kind: role
- To Reference: [Sigma Role](business::.topics/roles/001-4-sigma-role.trace.md)

## Transfers

- fresh-browser-acceptance
  - Transfer Kind: work-and-responsibility
  - Description: exercise the carried Viewer candidate as a human using the normal browser path and judge whether Feed, Tree, artifact opening, explicit Lineage continuation, Lineage Back/return, search/filtering, and discovery-context preservation are recognizable and usable.
  - Controlling Artifact: [Viewer Navigation Parity Recovery — Active Major](002-anchor-viewer-navigation-parity-recovery-active-major-task.trace.md)
  - Boundary: human/product observation and acceptance only; do not redesign the implementation, repeat the full machine suite by default, or self-expand into deferred Viewer slices.

- acceptance-feedback
  - Transfer Kind: work
  - Description: return a concise PASS or a concrete bounded defect with the exact observed browser path and acceptance-relevant impact.
  - Controlling Artifact: [Anchor Technical Progression Decision](002-4-anchor-viewer-navigation-technical-progression-decision.trace.md)
  - Boundary: Sigma feedback is decisive for the requested human/browser gate but does not itself rewrite shared semantic authority or authorize remote mutation.

## Required Context

- technical-progression-decision
  - Material: Anchor's technical reconciliation and progression boundary for the unchanged candidate
  - Material Reference: [Anchor Technical Progression Decision](002-4-anchor-viewer-navigation-technical-progression-decision.trace.md)
  - Purpose: establishes that machine qualification is already accepted and defines the remaining Sigma gate
  - Availability: available

- technical-evidence
  - Material: Kodax implementation and deterministic qualification evidence
  - Material Reference: [Kodax Technical Evidence](002-3-kodax-viewer-navigation-parity-technical-evidence.trace.md)
  - Purpose: available for focused expansion if a browser observation needs technical context; not a request to repeat the whole suite
  - Availability: available

- active-major
  - Material: current Viewer Navigation Parity Recovery objective, done criteria, and exclusions
  - Material Reference: [Viewer Navigation Parity Recovery — Active Major](002-anchor-viewer-navigation-parity-recovery-active-major-task.trace.md)
  - Purpose: controls what Sigma is accepting and what remains deferred
  - Availability: available

- canonical-sigma-role
  - Material: canonical organizational Sigma Role
  - Material Reference: [Sigma Role](business::.topics/roles/001-4-sigma-role.trace.md)
  - Purpose: exact recipient Role boundary for ordinary cold grounding and the human-observation/acceptance lane
  - Availability: available

## Reference Context

- product-contract-inventory
  - Material: recovered PoC product/interaction contract inventory
  - Material Reference: [PoC Product Contract Inventory](001-1-poc-product-contract-inventory-discovery.trace.md)
  - Purpose: optional recognizability reference if the current behavior feels ambiguous; PoC monolith architecture is not authoritative
  - Availability: available

- tooling-prerequisite-matrix
  - Material: Viewer shared Tooling prerequisite matrix
  - Material Reference: [Viewer PoC Tooling Prerequisite Matrix](001-2-tooling-prerequisite-matrix-discovery.trace.md)
  - Purpose: optional boundary reference if an observed UI issue appears to be semantic rather than presentation behavior
  - Availability: available

## Retained Responsibilities

- final-major-disposition
  - Retained By: Anchor
  - Responsibility: reconcile Sigma human evidence with the accepted technical evidence and close, correct, or reroute the major.
  - Boundary: Sigma supplies the requested human gate; Anchor owns final progression and next-major sequencing.

- implementation-correction
  - Retained By: Kodax
  - Responsibility: remain on standby and correct only a concrete bounded Viewer implementation defect returned by Anchor after Sigma observation.
  - Boundary: Kodax is frozen during acceptance and does not proactively expand scope.

- shared-tooling-semantics
  - Retained By: Loom
  - Responsibility: own any genuine missing/incorrect shared Tiinex semantic primitive exposed by Sigma/Anchor.
  - Boundary: presentation/product defects stay with Kodax; shared semantic Tooling defects should not be privately patched in Viewer.

## Exclusions And Dependencies

- no-machine-repetition-by-default
  - Kind: excluded-scope
  - Description: focused navigation parity, typecheck, UI-shape, and the complete Foundation spine are already independently green; Sigma should not spend the human gate rerunning them unless an observation requires targeted reproduction.
  - Responsible Party Or Role: Anchor

- no-deferred-viewer-slices
  - Kind: excluded-scope
  - Description: Create/Continue/Reference/Use-as authoring UI, Workspace/source takeover, Time Portal, export/Handoff manufacture UX, Extension/Host Bridge, Playthings world/placement experiments, and broad visual redesign remain outside this acceptance.
  - Responsible Party Or Role: Anchor

- no-remote-mutation
  - Kind: excluded-scope
  - Description: no commit, push, branch mutation, publication, release, deployment, or Pages operation is authorized by this Handoff.
  - Responsible Party Or Role: Anchor

- kodax-role-migration-followup
  - Kind: unresolved-dependency
  - Description: the Viewer-local Kodax role remains a temporary historical/local role artifact; Anchor will migrate Kodax into the canonical Business role registry before the next user commit/push. This does not block the current Sigma navigation acceptance because Sigma is the recipient and the candidate semantics are independent of that catalog cleanup.
  - Responsible Party Or Role: Anchor

## Completion Expectation

- Signal Kind: return
- Signal Meaning: return a concise Sigma acceptance result to Anchor: PASS if the normal browser path is recognizable and preserves expected navigation context, otherwise one or more concrete bounded defects with the exact observed path and why they block this navigation slice.
- Return To: Anchor
- Return To Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)

## Interpretation Limits

- Does Not Mean: technical qualification is being reopened; Sigma must inspect implementation internals; all Viewer PoC parity is complete; deferred Viewer slices are accepted; remote mutation is authorized; or the temporary Viewer-local Kodax role location has become canonical.
- Must Not Be Used To Claim: final Foundation completion, release readiness, publication/deployment success, acceptance of deferred Viewer capabilities, or semantic authority beyond the bounded human/browser navigation gate.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [002-4-anchor-viewer-navigation-technical-progression-decision.trace.md](002-4-anchor-viewer-navigation-technical-progression-decision.trace.md)
  - Value: U2bZfU-2Y_cp38ZNhuVxT7iY0B9NmTmD4D4PFsaNXds

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: MTixMKZRTz6CTK_HBmcwKjJjWWmFWXm_Gk_tGjzFHcA