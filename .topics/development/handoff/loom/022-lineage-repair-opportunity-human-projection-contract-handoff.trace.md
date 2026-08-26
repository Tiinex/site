# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-24 09:09:00
  - Trace: [022-lineage-integrity-repair-human-adapter-projection-contract.trace.md](../../tooling/dogfood/022-lineage-integrity-repair-human-adapter-projection-contract.trace.md)
  - Origin:
    - [relative](../../tooling/dogfood/022-lineage-integrity-repair-human-adapter-projection-contract.trace.md)
    - [browse + git](https://github.com/Tiinex/site/blob/b7de59cc6c47e122265188debbd2964b8e5a00a1/.topics/development/tooling/dogfood/022-lineage-integrity-repair-human-adapter-projection-contract.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-08-24 18:04:00
  - Authors: Anchor
  - Why: Replace the not-yet-delivered Loom transport with the same bounded Tooling 022 route while preserving the newly surfaced shared continuity-integrity creation concern as a separate deferred Tooling 028 sibling rather than allowing projection code to fork integrity policy.
  - Summary: Revised cold-start Anchor-to-Loom Handoff for Tooling 022, with shared Parent-bearing continuity-integrity creation conformance explicitly retained outside this route as planned Tooling 028.
  - Status: draft/local

---

# Lineage repair opportunity and human projection contract handoff

## Handoff Parties

- Purpose: implement Tooling 022's shared adapter-neutral projection over accepted Tooling 020/021 repair truth so human surfaces can inspect, preview, approve local actions, and export changesets without reimplementing lineage integrity policy
- From: Anchor
- From Kind: role
- To: Loom
- To Kind: role

## Transfers

- tooling-022
  - Transfer Kind: work
  - Description: implement one portable repair-opportunity/projection contract, stable machine states, concise human explanations, host capability boundaries, deterministic fixtures, and adapter-neutral local/export actions over accepted Tooling 020/021 behavior
  - Controlling Artifact: [Tooling 022](../../tooling/dogfood/022-lineage-integrity-repair-human-adapter-projection-contract.trace.md)
  - Boundary: shared portable Tooling/projection only; no Viewer component implementation, VS Code implementation, credential flow, commit, push, publication, or remote mutation

## Required Context

- tooling-022-task
  - Material: exact adapter-neutral projection objective, Done Criteria, human wording boundary, fixtures, and access separation
  - Material Reference: [Tooling 022](../../tooling/dogfood/022-lineage-integrity-repair-human-adapter-projection-contract.trace.md)
  - Purpose: controlling implementation scope and completion contract
  - Availability: available

- tooling-021-anchor-acceptance
  - Material: independent bounded acceptance of Tooling 021 and explicit remaining live-repair/publication gates
  - Material Reference: [Tooling 021 Anchor acceptance](../../tooling/dogfood/021-2-lineage-integrity-repair-application-anchor-acceptance.trace.md)
  - Purpose: satisfy Tooling 022's accepted-repair-application dependency without widening mutation authority
  - Availability: available

- tooling-021-result
  - Material: accepted local repair application, structure preservation, cascade resealing, provider/semantic gates, idempotence, receipts, and fail-closed current-Site pressure evidence
  - Material Reference: [Tooling 021 result](../../tooling/dogfood/021-1-lineage-integrity-repair-application-and-representation-preservation-result.trace.md)
  - Purpose: projection must expose existing repair truth rather than recreate it
  - Availability: available

- tooling-020-result
  - Material: accepted read-only lineage inspection and explicit repair-plan foundation
  - Material Reference: [Tooling 020 result](../../tooling/dogfood/020-1-lineage-integrity-inspection-and-repair-plan-foundation-result.trace.md)
  - Purpose: inspection/plan states and opportunity classes consumed by the projection
  - Availability: available

- repair-human-adapter-feedback
  - Material: human adapter workflow requirement, publication-permalink opportunity, body-preservation boundary, and review-first mismatch behavior
  - Material Reference: [Lineage repair and human adapter feedback](../../architect/continuity/001-31-lineage-integrity-repair-publication-permalink-and-human-adapter-workflow-feedback.trace.md)
  - Purpose: ground human projection intent in accepted actual-path feedback
  - Availability: available

## Reference Context

- cold-start-carrier-feedback
  - Material: current cold-start Tiinex-first ingress and shared-provider/carrier direction
  - Material Reference: [Cold-start consumer grounding feedback](../../architect/continuity/001-37-cold-start-consumer-grounding-provider-capability-and-carrier-ingress-feedback.trace.md)
  - Purpose: keep shared CLI/Viewer/LLM consumption direction visible without combining 026/027 carrier execution into Tooling 022
  - Availability: available

- tooling-025-anchor-acceptance
  - Material: accepted provider-receipt qualification boundary
  - Material Reference: [Tooling 025 Anchor acceptance](../../tooling/dogfood/025-2-lineage-publication-provider-receipt-binding-anchor-acceptance.trace.md)
  - Purpose: human projection must not promote declared locators into qualified publication evidence
  - Availability: available

## Retained Responsibilities

- independent-tooling-022-acceptance
  - Retained By: Anchor or another fresh reviewer
  - Responsibility: replay focused/aggregate validation and independently accept or correct Tooling 022
  - Boundary: implementing Loom must not self-accept or open Viewer/Kodax work

- viewer-and-vscode-product-implementation
  - Retained By: Kodax/future adapter owners
  - Responsibility: consume the shared projection in actual human products after Tooling 022 acceptance
  - Boundary: Tooling 022 owns the shared contract/fixtures, not product component implementation

- authenticated-publication-and-remote-state
  - Retained By: Anchor/Q/explicitly authorized host adapters
  - Responsibility: separately authorize credentials, commit/push, publication, or remote mutation if that capability is designed later
  - Boundary: default/level-0 projection may inspect, plan, preview, apply to local owned material, and export a changeset only

## Exclusions And Dependencies

- no-integrity-policy-fork
  - Kind: excluded-scope
  - Description: Viewer and VS Code must not receive separate lineage repair algorithms or independent publication qualification policy through this task
  - Responsible Party Or Role: Loom/Anchor

- no-viewer-component-work
  - Kind: excluded-scope
  - Description: do not implement actual Viewer component UX, drag/drop flow, modal state, or visual design in this route
  - Responsible Party Or Role: future Kodax route

- no-authenticated-remote-write
  - Kind: excluded-scope
  - Description: no OAuth, credential collection, GitHub commit, push, publication, repository mutation, or remote write is authorized
  - Responsible Party Or Role: future explicitly authorized host/adaptor route

- canonical-root-origin-gap
  - Kind: unresolved-dependency
  - Description: local-only/unpublished Parent publication state must remain unresolved/unavailable where current Root cannot truthfully express browse + git; projection must show the blocker rather than fabricate a locator
  - Responsible Party Or Role: Axiom/Anchor

- shared-continuity-integrity-creation-conformance
  - Kind: excluded-scope
  - Description: Parent-bearing artifact creation/footer conformance is a separate shared Tooling concern planned as Tooling 028. Tooling 022 must consume current integrity truth but must not introduce a projection-side rule that treats self-only v2 as sufficient for Parent-bearing output, must not opportunistically rewrite historical footers, and must not fork integrity rendering between CLI, LLM, or Viewer adapters.
  - Responsible Party Or Role: Anchor/Loom future Tooling 028 route

## Completion Expectation

- Signal Kind: result
- Signal Meaning: Loom returns one adapter-neutral Tooling 022 projection implementation plus deterministic fixtures and focused/aggregate evidence proving stable repair-opportunity states, concise human explanations, equivalent package/workspace intake, qualified permalink opportunity without auto-application, truthful unpublished-parent blockers, capability/authorization separation, local/export safe actions, and no Viewer/VS Code policy fork
- Return To: Anchor

## Interpretation Limits

- Does Not Mean: Viewer or VS Code integration is implemented, local repair opportunity equals approval, a package authorizes repair, a declared locator proves publication, remote publication is available, 026/027 carrier redesign is executed, Tooling 028 continuity-integrity creation conformance is executed, or current-Site repairs are authorized
- Must Not Be Used To Claim: human projection may infer semantic authority, UI adapters may bypass Tooling 020/021 gates, unpublished Parents may receive fabricated permalinks, or exported local changes are published state
- Authority Limits: Tooling 020/021 and accepted semantic/provider evidence remain authoritative for repair truth; Tooling 022 owns only the shared projection/action contract consumed later by adapters.

# Continuity Integrity
- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [022-lineage-integrity-repair-human-adapter-projection-contract.trace.md](https://github.com/Tiinex/site/blob/b7de59cc6c47e122265188debbd2964b8e5a00a1/.topics/development/tooling/dogfood/022-lineage-integrity-repair-human-adapter-projection-contract.trace.md)
  - Value: _21cN0SLcaXU9Mibt1GEFHUdiwed5cev6LxlJQ9bB-g

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: EejK1vAIdHX3Ar-K6vLqYyypGUOYoN3M0YOSuyKX728
