# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-08-24 17:22:00
  - Authors: Anchor
  - Why: Transfer only Tooling 021 implementation to Loom after Axiom 011 semantic classification, preserving evidence, approval, publication, and unresolved Root authority as explicit retained boundaries.
  - Summary: Anchor-to-Loom Handoff for Tooling 021 repair-application implementation after Axiom 011 semantic classification; implementation and dry-run are open, while live current-Site mutation remains per-artifact evidence/approval gated.
  - Status: draft/local

---

# Lineage integrity repair application handoff

## Handoff Parties

- Purpose: implement Tooling 021's structure-aware local lineage repair application and qualification path now that Axiom has classified the seven repaired-Parent representation mismatches, while keeping every live current-Site mutation behind the task's exact evidence and approval gates
- From: Anchor
- From Kind: role
- To: Loom
- To Kind: role

## Transfers

- tooling-021
  - Transfer Kind: work
  - Description: implement deterministic approved repair application, root-to-leaf resealing, representation preservation, idempotence, adversarial fixtures, and repair receipts over explicit Tooling 020 plans and per-artifact dispositions
  - Controlling Artifact: [Tooling 021](../../tooling/dogfood/021-lineage-integrity-repair-application-and-representation-preservation.trace.md)
  - Boundary: local Tooling implementation and dry-run qualification only unless every candidate separately satisfies Tooling 021 evidence/approval gates; no publication or remote write

## Required Context

- tooling-021-task
  - Material: exact repair-application objective, Done Criteria, structure-preservation boundary, cascade rules, and receipt requirements
  - Material Reference: [Tooling 021](../../tooling/dogfood/021-lineage-integrity-repair-application-and-representation-preservation.trace.md)
  - Purpose: controlling implementation scope and completion contract
  - Availability: available

- axiom-semantic-disposition
  - Material: canonical semantic classification for never-published Parent Origin and the seven repaired-local versus pre-repair-published Parent cases
  - Material Reference: [Axiom disposition](../../architect/continuity/001-36-1-publication-lineage-mismatch-and-unpublished-parent-semantic-classification-axiom-decision.trace.md)
  - Purpose: prevent Tooling from deciding semantic harmlessness or representation identity itself
  - Availability: available

- anchor-acceptance
  - Material: bounded Anchor acceptance converting Axiom's classification into Tooling 021 implementation authority while preserving live-mutation gates
  - Material Reference: [Anchor acceptance](../../architect/continuity/001-36-2-publication-lineage-mismatch-and-unpublished-parent-anchor-acceptance.trace.md)
  - Purpose: exact execution/routing boundary for this transfer
  - Availability: available

- tooling-020-result
  - Material: accepted read-only lineage integrity inspection and explicit repair-plan foundation consumed by Tooling 021
  - Material Reference: [Tooling 020 result](../../tooling/dogfood/020-1-lineage-integrity-inspection-and-repair-plan-foundation-result.trace.md)
  - Purpose: implementation baseline for plan/disposition inputs and fail-closed repair classes
  - Availability: available

- tooling-025-anchor-acceptance
  - Material: accepted publication-provider receipt binding boundary for any candidate requiring positive publication/source qualification
  - Material Reference: [Tooling 025 Anchor acceptance](../../tooling/dogfood/025-2-lineage-publication-provider-receipt-binding-anchor-acceptance.trace.md)
  - Purpose: preserve the accepted provider evidence trust boundary during repair application
  - Availability: available

- current-site-provider-reconciliation
  - Material: current evidence split of eight missing-backfill candidates, seven historical representation mismatches, one child-self mismatch, and one unavailable external Parent
  - Material Reference: [Current Site publication provider material reconciliation](../../architect/continuity/001-35-current-site-publication-provider-material-reconciliation-feedback.trace.md)
  - Purpose: ground fixtures and dry-run behavior in the actual current candidate classes without authorizing blanket mutation
  - Availability: available

## Reference Context

- tooling-019-result
  - Material: accepted prospective Parent-target integrity creation behavior and c14n-v2 binding mechanics
  - Material Reference: [Tooling 019 result](../../tooling/dogfood/019-1-lineage-integrity-creation-correction-result.trace.md)
  - Purpose: reuse accepted prospective integrity mechanics where applicable rather than inventing a second integrity model
  - Availability: available

- tooling-022-downstream
  - Material: downstream human-adapter repair opportunity/projection contract
  - Material Reference: [Tooling 022](../../tooling/dogfood/022-lineage-integrity-repair-human-adapter-projection-contract.trace.md)
  - Purpose: keep future Viewer/VS Code projection needs visible without implementing them in Tooling 021
  - Availability: available

## Retained Responsibilities

- semantic-authority
  - Retained By: Axiom/Anchor
  - Responsibility: own any further canonical Parent-Origin or representation-semantic decision that Tooling 021 cannot truthfully represent
  - Boundary: Loom must return an implementation-contract blocker rather than inventing schema semantics

- live-repair-approval-and-provider-evidence
  - Retained By: Anchor/Q/qualified host
  - Responsibility: supply accepted exact provider receipts/material and explicit per-artifact approval before any current-Site repair candidate is actually mutated
  - Boundary: this Handoff does not convert fixtures, scans, or old provider metadata into blanket mutation authority

- publication-and-remote-state
  - Retained By: Anchor/Q/human
  - Responsibility: authorize any eventual commit, push, publication, or remote representation creation after local repair review
  - Boundary: Loom must not perform remote writes or claim publication

## Exclusions And Dependencies

- never-published-parent-origin
  - Kind: unresolved-dependency
  - Description: current Root still cannot truthfully represent a Parent-bearing continuation whose Parent has never had a `browse + git` archive locator; Tooling 021 must fail closed for that canonical repair case and must not solve Root inside this task
  - Responsible Party Or Role: Axiom/Anchor

- eight-missing-backfill-live-application
  - Kind: unresolved-dependency
  - Description: eight missing-backfill candidates remain live-mutation blocked until accepted full provider receipts/material and per-artifact approval are supplied, even though current reconciliation suggests exact byte-compatible Parents
  - Responsible Party Or Role: Anchor/Q/Loom

- child-self-mismatch
  - Kind: unresolved-dependency
  - Description: `001-13-validator-surface-convergence-and-integrity-repair-strategy.trace.md` has an independent child-self mismatch and must not be treated as a clean Parent-target backfill case
  - Responsible Party Or Role: Anchor/Loom

- external-parent-material
  - Kind: unresolved-dependency
  - Description: the external Tiinex/docs Parent remains unavailable in the current Site workspace until exact Parent material is separately supplied
  - Responsible Party Or Role: Anchor/Q

- no-remote-write
  - Kind: excluded-scope
  - Description: no GitHub authentication, commit, push, publication, history rewrite, or remote mutation is authorized
  - Responsible Party Or Role: future explicitly authorized human/host adapter

## Completion Expectation

- Signal Kind: result
- Signal Meaning: Loom returns Tooling 021 implementation and focused/aggregate regression evidence proving explicit-plan plus per-artifact approval gating, structure-aware header/footer-only mutation, root-to-leaf cascade/reseal, representation-diff fail-closed behavior, c14n-v2 Parent/self ordering, repair receipts, idempotence, adversarial formatting preservation, and blocked live-candidate behavior where evidence/semantic authority is incomplete
- Return To: Anchor

## Interpretation Limits

- Does Not Mean: existing current-Site lineage is approved for blanket repair, the eight missing-backfill candidates have accepted provider receipts, the seven historical mismatches are exact-byte equivalent to their old published Parents, never-published Parent Origin is solved, Tooling 022 is open, or any repaired material is published
- Must Not Be Used To Claim: semantic continuity implies byte identity, an old immutable locator qualifies repaired current bytes, a repair plan alone authorizes mutation, a local dry-run is publication evidence, or Loom may weaken Root/Origin/provider authority to make repair succeed
- Authority Limits: Axiom's returned semantic classification and Anchor's acceptance control the representation-only cases; Tooling 020/025 control plan and provider-evidence mechanics; Loom owns only bounded Tooling 021 implementation/application behavior under explicit inputs.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: 9aupyCpjZuvC3vzV00wMWCcKbEmtumQiNltuMXY-Gcw