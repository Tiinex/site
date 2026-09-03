# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-03 17:59:13
  - Trace: [008-1-kodax-canonical-business-role-durability-task.trace.md](008-1-kodax-canonical-business-role-durability-task.trace.md)
  - Origin:
    - [relative](008-1-kodax-canonical-business-role-durability-task.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-03 17:59:22
  - Authors: Anchor
  - Why: Make the next human repository action explicit and role-correct while ensuring Site cannot claim the Viewer-local Kodax Role is superseded before canonical Business authority is durably committed.
  - Summary: Operational Sigma handoff to land the exact qualified canonical Kodax Role in Tiinex/business, commit and push Business only, and return the immutable Business SHA before Site reduction finalization.
  - Status: ready/local

---

# Kodax Canonical Business Role Durability — Anchor To Sigma

## Handoff Parties

- Purpose: transfer the human repository action required to make the already-qualified canonical Kodax Role durably present in Tiinex/business before Site reduction claims that the Viewer-local Kodax Role has a durable organizational successor.
- From: Anchor
- From Kind: role
- From Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
- To: Sigma
- To Kind: role
- To Reference: [Sigma Role](business::.topics/roles/001-4-sigma-role.trace.md)

## Transfers

- business-kodax-role-durability
  - Transfer Kind: work
  - Description: review and land the exact carried canonical Kodax Role at `.topics/roles/001-6-kodax-role.trace.md` in `Tiinex/business`, then commit and push that Business-only change and return the exact durable commit SHA to Anchor.
  - Controlling Artifact: [Kodax Canonical Business Role Durability Task](008-1-kodax-canonical-business-role-durability-task.trace.md)
  - Boundary: human repository landing only; Sigma is not asked to redesign Kodax, modify Site, perform Viewer implementation, or infer additional reduction changes.

## Required Context

- canonical-kodax-role
  - Material: canonical Kodax Role candidate for the Business Roles lineage
  - Material Reference: [Canonical Kodax Role Candidate](business-candidate::.topics/roles/001-6-kodax-role.trace.md)
  - Purpose: exact qualified bytes to place under the canonical Business Roles parent without semantic rewriting.
  - Availability: available

- business-role-durability-task
  - Material: Kodax Canonical Business Role Durability Task
  - Material Reference: [Current Task](008-1-kodax-canonical-business-role-durability-task.trace.md)
  - Purpose: authoritative human action, done criteria, ordering, and return expectation for the Business-only durability gate.
  - Availability: available

- reduction-placement-contract
  - Material: Reduction Placement And Expansion Contract
  - Material Reference: [Reduction Contract](008-reduction-placement-and-expansion-contract-decision.trace.md)
  - Purpose: explains why Business durability must precede Site reduction of the Viewer-local Kodax Role and why the resulting immutable Business SHA becomes the expansion/supersession boundary.
  - Availability: available

## Reference Context

- canonical-business-roles-parent
  - Material: Business Roles parent
  - Material Reference: [Roles](business::.topics/roles/001-roles.trace.md)
  - Purpose: canonical organizational parent under which the Kodax Role must land.
  - Availability: available

## Retained Responsibilities

- site-reduction-finalization
  - Retained By: Anchor
  - Responsibility: after Sigma returns the exact pushed Business SHA, bind the Viewer-local Kodax supersession entry to that immutable Business commit, finish the per-ancestor Site reductions and leaf expansion map, and issue a separate Anchor-to-Sigma Site operational Handoff.

- viewer-implementation
  - Retained By: Anchor
  - Responsibility: do not route new Kodax Viewer implementation until the Business role is durably committed and the current Site reduction frontier is qualified.

## Exclusions And Dependencies

- no-site-mutation
  - Kind: excluded-scope
  - Description: do not commit, delete, replace, or reduce Site material in this Handoff. Site receives its own later operational Handoff after the Business SHA is known.
  - Responsible Party Or Role: Sigma

- no-role-redesign
  - Kind: excluded-scope
  - Description: do not rewrite the carried Kodax Role semantics merely for style or convenience. If the exact carried Role cannot land cleanly under the canonical Roles parent, stop and return the blocker to Anchor.
  - Responsible Party Or Role: Sigma

- business-first-ordering
  - Kind: unresolved-dependency
  - Description: the Business commit/push is a prerequisite for any Site reduction that claims the Viewer-local Kodax Role is superseded by canonical Business authority.
  - Responsible Party Or Role: Sigma

## Completion Expectation

- Signal Kind: result
- Signal Meaning: `Tiinex/business` contains the exact carried `.topics/roles/001-6-kodax-role.trace.md` under the canonical Roles lineage, the change is committed and pushed by the human repository authority, and Anchor receives the exact immutable Business commit SHA plus any blocker or deviation.
- Return To: Anchor
- Return To Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
- Expected Result Reference: [Canonical Business Kodax Role](business::.topics/roles/001-6-kodax-role.trace.md)

## Interpretation Limits

- Does Not Mean: the Site reduction is complete, the Viewer-local Kodax Role may already be deleted, Viewer Artifact + Action implementation has started, or Sigma grants product acceptance by performing this repository action.
- Must Not Be Used To Claim: a local candidate path is remotely durable before the returned Business commit SHA is verified; Site lineage may reference the canonical role as durable only after this Handoff's completion signal is satisfied.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [008-1-kodax-canonical-business-role-durability-task.trace.md](008-1-kodax-canonical-business-role-durability-task.trace.md)
  - Value: PsmfBFpF18g9iZ2bEBjo0xI07NVgXyHEcsipnoSGiNs

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: xSvb8SzXKogvC1ZgZUUJkVJyrGL82z_Ly6Nh3CixbWM