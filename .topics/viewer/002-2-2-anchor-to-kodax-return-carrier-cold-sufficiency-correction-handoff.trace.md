# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-03 14:11:43
  - Trace: [002-2-1-anchor-to-kodax-viewer-navigation-parity-recovery-corrected-handoff.trace.md](002-2-1-anchor-to-kodax-viewer-navigation-parity-recovery-corrected-handoff.trace.md)
  - Origin:
    - [relative](002-2-1-anchor-to-kodax-viewer-navigation-parity-recovery-corrected-handoff.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-03 14:44:22
  - Authors: Anchor
  - Why: Kodax technical work is green, but two returned carriers fail closed at recipient-role resolution; correct that transport boundary without reopening implementation.
  - Summary: Correct only the Kodax return carrier so canonical Anchor Role material is resolvable on cold grounding; implementation and evidence remain unchanged.
  - Status: ready/local

---

# Viewer Navigation Return Carrier Cold-Sufficiency Correction — Anchor To Kodax

## Handoff Parties

- Purpose: correct only the return-carrier recipient-role boundary so the already-completed Viewer Navigation implementation can return to a genuinely fresh Anchor through ordinary Tiinex grounding
- From: Anchor
- From Kind: role
- From Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
- To: Kodax
- To Kind: role
- To Reference: [Kodax Role](002-1-1-kodax-role.trace.md)

## Transfers

- return-carrier-correction
  - Transfer Kind: work
  - Description: regenerate the existing Kodax-to-Anchor return carrier without changing the Viewer implementation, ensuring the return Handoff explicitly resolves Anchor through the canonical Business Anchor Role and that canonical manufacture carries/resolves that recipient Role for cold grounding.
  - Controlling Artifact: [Viewer Navigation Parity Recovery — Active Major](002-anchor-viewer-navigation-parity-recovery-active-major-task.trace.md)
  - Boundary: transport/cold-sufficiency correction only; preserve the implementation candidate and existing technical Evidence unchanged.

## Required Context

- active-major
  - Material: current Viewer Navigation Parity Recovery major
  - Material Reference: [Viewer Navigation Parity Recovery — Active Major](002-anchor-viewer-navigation-parity-recovery-active-major-task.trace.md)
  - Purpose: preserves the existing implementation boundary and completion criteria
  - Availability: available

- kodax-role
  - Material: Kodax implementation role used for the completed implementation transfer
  - Material Reference: [Kodax Role](002-1-1-kodax-role.trace.md)
  - Purpose: establishes the sender role for the regenerated return
  - Availability: available

- canonical-anchor-role
  - Material: canonical organizational Anchor Role
  - Material Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
  - Purpose: exact recipient Role that the regenerated Kodax-to-Anchor Handoff must resolve and carry sufficiently for ordinary cold grounding
  - Availability: available

## Reference Context

- previous-transfer
  - Material: corrected Anchor-to-Kodax Viewer Navigation implementation Handoff
  - Material Reference: [Viewer Navigation Parity Recovery — Anchor To Kodax](002-2-1-anchor-to-kodax-viewer-navigation-parity-recovery-corrected-handoff.trace.md)
  - Purpose: preserves the completed implementation scope and existing return expectation; no implementation work is reopened
  - Availability: available

- existing-return
  - Material: Kodax's already-authored technical Evidence and Kodax-to-Anchor return Handoff in the current Kodax workspace
  - Purpose: reuse these artifacts unchanged except for the minimum return-Handoff recipient-role/carry correction required for cold-sufficient manufacture
  - Availability: available

## Retained Responsibilities

- implementation-disposition
  - Retained By: Anchor
  - Responsibility: review and dispose the already-completed Viewer candidate after the corrected return reaches grounded-to-act
  - Boundary: this correction does not authorize Anchor product acceptance before successful cold grounding

- human-browser-acceptance
  - Retained By: Sigma
  - Responsibility: fresh Viewer/browser acceptance after Anchor technical disposition
  - Boundary: Sigma is not asked to diagnose or repair transport packaging

## Exclusions And Dependencies

- no-implementation-change
  - Kind: excluded-scope
  - Description: do not change Viewer source, tests, semantics, UI behavior, or optimization work; do not rerun implementation work merely to satisfy this transport correction unless manufacture itself requires validation
  - Responsible Party Or Role: Kodax

- no-evidence-rewrite
  - Kind: excluded-scope
  - Description: preserve existing technical Evidence unless an exact transport-facing reference must be added; do not alter its technical claims or qualification result
  - Responsible Party Or Role: Kodax

- no-remote-mutation
  - Kind: excluded-scope
  - Description: no commit, push, release, deployment, or remote mutation is authorized
  - Responsible Party Or Role: Anchor

## Completion Expectation

- Signal Kind: return
- Signal Meaning: return a freshly manufactured canonical Kodax-to-Anchor Handoff package for the unchanged Viewer candidate such that ordinary cold `ground` resolves Anchor via `business::.topics/roles/001-1-anchor-role.trace.md` and reaches `grounded-to-act` without recipient-role recovery
- Return To: Anchor
- Return To Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)

## Interpretation Limits

- Does Not Mean: the Viewer implementation is reopened; Kodax must change code; Sigma acceptance has occurred; the Viewer-local Kodax Role has become canonical organizational role authority; or remote mutation is authorized
- Must Not Be Used To Claim: product acceptance, Foundation completion, release readiness, or any technical change beyond the minimum carrier correction

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [002-2-1-anchor-to-kodax-viewer-navigation-parity-recovery-corrected-handoff.trace.md](002-2-1-anchor-to-kodax-viewer-navigation-parity-recovery-corrected-handoff.trace.md)
  - Value: mZq7C6gAIrpG5nDI8D5u4zvxjWVDTsWBpHJJGqKSFPI

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: qyVwrRB5f4pg4ZbdN3YWyQKPjXLVNIGyv6A9tHyaRys