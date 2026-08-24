# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-08-24 09:10:00
  - Authors: Anchor
  - Why: Route the newly reproduced Parent-integrity creation defect and the read-only lineage repair-planning foundation to Loom while preserving later mutation/UI work as explicitly blocked follow-up rather than encouraging a cold-started implementation role to auto-repair trust failures.
  - Summary: Anchor-to-Loom bounded Handoff for Tooling 019 prospective Parent-target v2 integrity closure plus Tooling 020 read-only lineage inspection and repair planning; Tooling 021/022 are carried as blocked downstream boundaries only.
  - Status: draft/local

---

# Lineage integrity creation and repair-planning tooling handoff

## Handoff Parties

- Purpose: implement prospective Parent-target v2 integrity and the read-only lineage integrity inspection/repair-plan foundation without silently repairing existing mismatches or broadening into Viewer/VS Code/remote publication
- From: Anchor
- From Kind: role
- To: Loom
- To Kind: role

## Transfers

- tooling-019-prospective-parent-integrity
  - Transfer Kind: work
  - Description: implement and verify Tooling 019 so newly authored Parent-bearing continuations carry the Parent's validated primary v2 self digest as a non-self comparison entry and compute the child's primary self seal last
  - Controlling Artifact: [Tooling 019](../../tooling/dogfood/019-parent-target-v2-continuity-integrity-emission-and-validation-closure.trace.md)
  - Boundary: prospective creation/validation only; do not rewrite existing lineages merely to make tests green

- tooling-020-read-only-repair-foundation
  - Transfer Kind: work
  - Description: implement the adapter-neutral read-only lineage integrity inspection, mismatch classification, cascade-impact analysis, and repair-plan surface defined by Tooling 020
  - Controlling Artifact: [Tooling 020](../../tooling/dogfood/020-lineage-integrity-inspection-and-repair-plan-foundation.trace.md)
  - Boundary: diagnostic/planning only; no artifact mutation, checksum refresh, permalink insertion, or remote publication is authorized in this transfer

## Required Context

- parent-integrity-gap
  - Material: reproduced Q/source evidence that current Parent-bearing continuation creation emits only the child self v2 seal and lacks a Parent target-self-digest entry
  - Material Reference: [Parent-target v2 continuity integrity gap](../../architect/continuity/001-30-parent-target-v2-continuity-integrity-gap-feedback.trace.md)
  - Purpose: establish the actual creation defect and prevalence evidence
  - Availability: available

- repair-workflow-feedback
  - Material: Q/Anchor design boundary for mismatch-as-flag behavior, header/footer-only repair, cascade review, truthful publication permalink handling, Viewer-first human workflow, and VS Code adapter reuse
  - Material Reference: [Lineage integrity repair and human adapter workflow feedback](../../architect/continuity/001-31-lineage-integrity-repair-publication-permalink-and-human-adapter-workflow-feedback.trace.md)
  - Purpose: prevent repair planning from collapsing into broad search/replace or automatic trust refresh
  - Availability: available

- unpublished-parent-origin-gap
  - Material: explicit semantic tension between current Root Parent Origin requirements and truthful local/unpublished Parent material
  - Material Reference: [Unpublished Parent Origin truthfulness gap](../../architect/continuity/001-31-1-unpublished-parent-origin-truthfulness-and-canonical-requirement-gap.trace.md)
  - Purpose: force Tooling to fail closed rather than fabricate Git/publication provenance
  - Availability: available

- tooling-019-task
  - Material: prospective creation integrity implementation task
  - Material Reference: [Tooling 019](../../tooling/dogfood/019-parent-target-v2-continuity-integrity-emission-and-validation-closure.trace.md)
  - Purpose: exact first implementation boundary
  - Availability: available

- tooling-020-task
  - Material: read-only integrity inspection and repair-plan implementation task
  - Material Reference: [Tooling 020](../../tooling/dogfood/020-lineage-integrity-inspection-and-repair-plan-foundation.trace.md)
  - Purpose: exact second implementation boundary
  - Availability: available

- loom-role
  - Material: current Loom role artifact for bounded portable Tooling implementation capacity
  - Material Reference: [Loom Role](../../loom/role/001-loom-role.trace.md)
  - Purpose: ground the recipient's stable implementation boundary without relying on prior chat
  - Availability: available

## Reference Context

- tooling-021-blocked-apply
  - Material: downstream approved repair application, representation preservation, topological resealing, and receipt task
  - Material Reference: [Tooling 021](../../tooling/dogfood/021-lineage-integrity-repair-application-and-representation-preservation.trace.md)
  - Purpose: make the mutation boundary visible now while keeping it explicitly blocked until Tooling 019/020 are independently accepted
  - Availability: available

- tooling-022-blocked-human-projection
  - Material: downstream adapter-neutral human repair opportunity/projection task for Viewer/VS Code reuse
  - Material Reference: [Tooling 022](../../tooling/dogfood/022-lineage-integrity-repair-human-adapter-projection-contract.trace.md)
  - Purpose: preserve the intended human-product direction without authorizing Viewer/VS Code implementation in this Loom leaf
  - Availability: available

- ai-provenance-prior-art
  - Material: historical ai-provenance quick-fix tooling described by Q as prior repair tooling
  - Purpose: optional recovery/reference candidate only if independently available; do not assume currentness or compatibility
  - Availability: unresolved

## Retained Responsibilities

- semantic-parent-origin-classification
  - Retained By: Anchor/Axiom
  - Responsibility: classify the unpublished Parent Origin canonical tension before any Tooling change weakens, invents, or rewrites Root semantics
  - Boundary: Loom may surface evidence/blockers but must not mutate canonical schema meaning

- mismatch-impact-disposition
  - Retained By: Q/Anchor/Axiom as appropriate
  - Responsibility: decide whether an actual Parent digest mismatch changes or leaves intact a child's semantic claims before any refresh
  - Boundary: Tooling 020 reports/plans; it does not decide semantic harmlessness

- viewer-and-vscode-product-integration
  - Retained By: Anchor/Kodax
  - Responsibility: later project the accepted portable repair foundation into Viewer first and VS Code subsequently
  - Boundary: no UI implementation is transferred here

- remote-publication-authority
  - Retained By: human operator and future explicitly authorized adapter/access policy
  - Responsibility: commit/push/authenticate/publish repaired material
  - Boundary: this Handoff authorizes no remote writes

## Exclusions And Dependencies

- no-auto-repair
  - Kind: excluded-scope
  - Description: a mismatch, missing Parent target, or missing permalink must never be silently "fixed" by refreshing checksums/links during Tooling 019/020
  - Responsible Party Or Role: Loom

- no-body-rewrite
  - Kind: excluded-scope
  - Description: even downstream repair must preserve unrelated body representation; Tooling 019/020 must not introduce a broad rerender/search-replace strategy as the assumed repair path
  - Responsible Party Or Role: Loom

- tooling-021-blocked
  - Kind: unresolved-dependency
  - Description: mutation/apply work remains blocked until Tooling 019 and 020 receive independent acceptance and the repair-plan boundary is stable
  - Responsible Party Or Role: Anchor/Loom

- tooling-022-blocked
  - Kind: unresolved-dependency
  - Description: human adapter projection remains blocked until inspection and repair application contracts are accepted
  - Responsible Party Or Role: Anchor/Loom/Kodax

- parent-origin-semantic-gap
  - Kind: unresolved-dependency
  - Description: when a Parent is local/unpublished and current canonical Root appears to require a browse+git Parent Origin, Loom must report the contradiction/blocker rather than invent provenance
  - Responsible Party Or Role: Anchor/Axiom

## Completion Expectation

- Signal Kind: result
- Signal Meaning: Loom returns independently verifiable Tooling 019 and 020 implementation/diagnostic evidence, explicitly reports any canonical/source blockers, leaves Tooling 021/022 blocked, and uses Tooling-owned normal human Handoff output
- Return To: Anchor

## Interpretation Limits

- Does Not Mean: existing Site lineage is authorized for bulk repair, every checksum mismatch is harmless, a missing permalink may be invented, Viewer or VS Code repair UI is implemented, GitHub authentication/write access is authorized, or published history should be rewritten
- Must Not Be Used To Claim: semantic Parent correctness from digest equality, publication from a local repair, full historical provenance repair, completion of Tooling 021/022, or cold-start qualification by the implementing Loom session
- Authority Limits: Root/Handoff/Source/publication semantics remain canonical authorities; Tooling may verify/project/plan against declared truth but must not manufacture missing semantic or publication authority

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:UD_H42i7eaHf5vEEMqpBuztAxdsyZkaf0YzcvB0wY5o
