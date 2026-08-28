# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-08-28 20:26:00
  - Trace: [Anchor Default Clean-Carrier Acceptance And Operating Overview Routing](023-anchor-phase2-default-clean-carrier-acceptance-and-operating-overview-routing-decision.trace.md)
  - Origin:
    - [relative](023-anchor-phase2-default-clean-carrier-acceptance-and-operating-overview-routing-decision.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-08-28 20:27:00
  - Authors: Anchor
  - Summary: Transfer one discovery-first Operating Overview Tooling tranche to Loom after Major 007 acceptance, using Axiom's no-new-schema disposition as the semantic boundary and authorizing only the smallest provider-neutral read-only projection gap proven necessary.
  - Status: local

---

# Anchor To Loom — Operating Overview Tooling Projection

## Handoff Parties

- Purpose: determine and, only where concretely necessary, implement the smallest shared portable Tooling projection that lets humans, LLM/CLI, and later Viewer surfaces locate current Tiinex project work without creating a hidden dashboard/status authority.
- From: Anchor
- From Kind: role
- To: Loom
- To Kind: role

## Transfers

- existing-operation-capability-discovery
  - Transfer Kind: work-and-responsibility
  - Description: inspect the current portable Tooling operations first and determine which existing read-only operations already expose the declared facts needed for the Business Operating Overview from loaded material.
  - Boundary: do not add a new operation merely because one combined output would be convenient; prove the actual capability gap first.

- operating-overview-projection-first-slice
  - Transfer Kind: work-and-responsibility
  - Description: if existing operations do not compose the first slice cleanly, implement only the smallest provider-neutral read-only projection needed to expose Project inventory, qualified current-frontier candidates, and blocker/resource signals from their owning artifacts.
  - Boundary: lineage topology, workflow frontier, and Task lifecycle state must remain separate dimensions; no lineage-leaf-equals-current shortcut is allowed.

- monitoring-and-cross-repository-boundary
  - Transfer Kind: work
  - Description: identify whether existing qualified Tooling can expose Monitoring/Source freshness and cross-repository relevance/traversal without hidden host behavior; if not, return those as explicit unavailable/deferred capability gaps rather than fabricating state or widening this tranche.
  - Boundary: no network-provider implementation, repository crawler, hidden cache database, or Viewer-specific source model is authorized here.

- shared-consumer-contract
  - Transfer Kind: work
  - Description: keep any new projection serializable and provider-neutral so LLM/CLI can consume the same declared facts that a later Viewer projection could use.
  - Boundary: presentation may differ later; semantic/runtime truth must not fork into a Viewer-only or machine-only overview model.

- regression-and-preservation
  - Transfer Kind: work
  - Description: add focused tests for any new projection behavior and preserve relevant portable Tooling/Handoff regressions; if shared handoff/runtime modules are touched, keep the accepted 20-of-20 portable Handoff baseline green.
  - Boundary: do not broaden test cleanup or unrelated Discovery work under this authorization.

- stop-on-semantic-gap
  - Transfer Kind: responsibility
  - Description: if truthful projection requires a new canonical schema or reinterpretation of Project, Task, Handoff, Decision, Monitoring, Source, Resource, Relation, Workspace, or Parent semantics, stop and return the exact semantic blocker to Anchor/Axiom before implementation widens.
  - Boundary: UI convenience or a desire for one dashboard-shaped object is not evidence of a schema gap.

## Required Context

- major-007-anchor-acceptance
  - Material: Anchor acceptance of the recipient-v2 default clean-carrier transition and next-frontier authorization.
  - Material Reference: [Major 007 Acceptance](023-anchor-phase2-default-clean-carrier-acceptance-and-operating-overview-routing-decision.trace.md)
  - Purpose: controls the accepted Tooling checkpoint, retained compatibility boundary, next projection authorization, and stop conditions.
  - Availability: available

- axiom-operating-overview-semantic-decision
  - Material: exact Axiom Decision that existing maintained schemas are sufficient and no new Dashboard/Status/Initiative/Epic/Frontier schema is presently justified.
  - Material Reference: [Axiom Operating Overview Decision](external://tiinex/business/operating-overview-semantic-decision)
  - Purpose: controls semantic ownership, composition, projection boundaries, and schema-gap review conditions for this tranche.
  - Availability: available

- controlling-business-operating-overview-task
  - Material: exact Business Operating Overview And Monitoring task.
  - Material Reference: [Business Operating Overview Task](external://tiinex/business/operating-overview-task)
  - Purpose: preserves the original objective, done criteria, scope, and distinction between Monitoring, Workspace navigation, and status dashboards.
  - Availability: available

- portable-operation-catalog
  - Material: current portable Tooling operation catalog.
  - Material Reference: [operation.catalog.js](../../../src/tooling/portable/operation.catalog.js)
  - Purpose: first discovery surface for existing provider-neutral operations before adding a new projection.
  - Availability: available

- lineage-search-implementation
  - Material: current loaded-lineage search/filter implementation.
  - Material Reference: [lineage.search.js](../../../src/tooling/portable/lineage/lineage.search.js)
  - Purpose: likely reusable current read-only query capability; inspect before inventing parallel discovery semantics.
  - Availability: available

## Reference Context

- complete-portable-handoff-baseline
  - Material: accepted portable Handoff regression directory.
  - Material Reference: [Portable Handoff Tests](../../../src/tooling/portable/handoff/)
  - Purpose: preservation gate if shared portable/handoff infrastructure is touched.
  - Availability: available

- default-clean-transition-return
  - Material: Loom return that established ordinary recipient-v2 clean manufacture before this tranche.
  - Material Reference: [Default Clean Return](022-loom-to-anchor-phase2-default-clean-carrier-transition-return.trace.md)
  - Purpose: predecessor implementation checkpoint and package/cold-start baseline.
  - Availability: available

## Retained Responsibilities

- semantic-composition-acceptance
  - Retained By: Anchor
  - Responsibility: reconcile Loom's Tooling capability/projection result against Axiom's accepted semantic boundary and the Business task before calling the Tooling criterion satisfied.
  - Boundary: Loom may identify/implement Tooling capability but does not create canonical schema authority through implementation.

- schema-authority
  - Retained By: Axiom
  - Responsibility: re-enter only if a concrete maintained-schema representation gap or contradiction is demonstrated.
  - Boundary: no generic dashboard/status schema task is open by default.

- human-operating-overview-acceptance
  - Retained By: Sigma
  - Responsibility: later judge whether the projected overview is actually useful and understandable for human operations and Viewer use.
  - Boundary: this tranche need not redesign the Viewer or produce a final human dashboard.

## Exclusions And Dependencies

- no-new-overview-schema
  - Kind: excluded-scope
  - Description: no Dashboard, Status, Initiative, Epic, Frontier, or other generic overview schema is authorized unless a later Axiom review accepts a concrete proven gap.

- no-viewer-mutation
  - Kind: excluded-scope
  - Description: Viewer UI/product integration is deferred until the shared Tooling projection is accepted.

- no-business-copy-database
  - Kind: excluded-scope
  - Description: do not copy every external Task into Business or create a manually maintained status mirror as the product solution.

- no-remote-provider-expansion
  - Kind: excluded-scope
  - Description: remote repository/provider crawling or new host-specific access behavior is not part of this first slice.

## Completion Expectation

- Signal Kind: return
- Signal Meaning: Loom returns one exact Workspace-bearing package with either (a) an evidence-backed map showing existing portable operations already satisfy the first Operating Overview Tooling criterion, or (b) the smallest implemented read-only provider-neutral projection needed for the loaded-material first slice, with focused tests, explicit unavailable/deferred dimensions, preserved semantic separations, and no new schema authority.
- Return To: Anchor

## Interpretation Limits

- Does Not Mean: the final Viewer dashboard exists, Business Roadmap is complete, Monitoring is generic status, Workspace owns project truth, lineage leaves are current frontiers, remote repositories are automatically traversable, or a new schema has been authorized.
- Must Not Be Used To Claim: that one Tooling output becomes canonical semantic truth, that UI convenience justifies schema invention, or that incomplete external access should be filled with inferred state.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [Anchor Default Clean-Carrier Acceptance And Operating Overview Routing](023-anchor-phase2-default-clean-carrier-acceptance-and-operating-overview-routing-decision.trace.md)
  - Value: BsQuDuiWUg2dhbZtzBGTXGEHM46u5L00FyVseeuVG2s

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: sw2JGP_zlhjkfjfo1bdGDmD7_jdWUAQab7jAPTbbkYw