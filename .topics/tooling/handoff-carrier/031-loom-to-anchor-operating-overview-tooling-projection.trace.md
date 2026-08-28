# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-08-28 21:14:00
  - Trace: [Anchor To Loom — Operating Overview Tooling Projection Resumption](030-anchor-to-loom-operating-overview-tooling-projection-resumption.trace.md)
  - Origin:
    - [relative](030-anchor-to-loom-operating-overview-tooling-projection-resumption.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-08-28 21:35:00
  - Authors: Loom
  - Summary: Return the smallest provider-neutral loaded-material Operating Overview projection after proving existing search/inspect operations could expose records but could not share a qualified workflow-frontier and blocker/resource derivation without consumer-specific Markdown reinterpretation.
  - Status: local

---

# Loom To Anchor — Operating Overview Tooling Projection

## Handoff Parties

- Purpose: return the bounded first Operating Overview Tooling slice: one shared read-only loaded-material projection for Project inventory, exact-qualified current-frontier Task candidates, and blocker/resource signals, while leaving Monitoring freshness and remote cross-repository traversal explicitly deferred.
- From: Loom
- From Kind: role
- To: Anchor
- To Kind: role

## Transfers

- capability-discovery-and-gap-proof
  - Transfer Kind: work-and-responsibility
  - Description: existing `search-lineage`, `inspect`, `audit`, and `resolve-lineage` operations already expose loaded records, schema identity, schema-owned read sections, qualification, and lineage topology. They do not provide one shared schema-aware derivation of workflow-frontier candidates or blocker/resource signals; using `relation: leaf` would be lineage topology only, and making each CLI/LLM/Viewer consumer reinterpret Markdown independently would fork projection rules.
  - Boundary: this is a concrete Tooling projection gap only; it is not evidence for a new Dashboard, Status, Initiative, Epic, or Frontier semantic schema.

- first-loaded-material-projection
  - Transfer Kind: work-and-responsibility
  - Description: added read-only serializable operation `project-operating-overview`. It inventories loaded `tiinex.project.v1` artifacts, promotes only exact-qualified `tiinex.task.v1` artifacts with an explicitly nonterminal declared status and Objective into current-frontier candidates, and surfaces explicit blocker cues from Task status/Dependencies plus Resource Need/Resource/Signal artifacts. Every item preserves path, schema, declared status, source mode, and qualification basis.
  - Boundary: a lineage leaf is never used as frontier evidence; candidate status is projection-only and does not replace Task lifecycle truth, Project truth, Handoff transfer truth, or Decision outcomes.

- monitoring-and-cross-repository-boundary
  - Transfer Kind: work
  - Description: the projection can surface already-loaded Monitoring, Source, Relation, and Workspace declarations, but deliberately reports Monitoring freshness as `deferred-no-dedicated-freshness-derivation` and remote cross-repository traversal as false. On the carried Site `.topics` material, 112 records yield no Business Project/frontier/resource artifacts, no loaded Monitoring/Source declarations, and three loaded Workspace declarations only; no external state is inferred.
  - Boundary: no network provider, repository crawler, host-time freshness inference, hidden cache/status database, or remote source traversal was added.

- shared-consumer-contract-proof
  - Transfer Kind: work
  - Description: the focused regression proves the identical provider-neutral projection through direct module invocation, the portable operation catalog, and the CLI. The synthetic loaded-material specimen distinguishes one Project, one blocked/current exact-qualified Task candidate, one completed Task that is excluded, explicit task blocker cues, one Resource Need signal, loaded Monitoring/Source declarations, and loaded Relation relevance while keeping remote traversal false.
  - Boundary: Viewer integration remains future work; a later Viewer may consume this projection but must not fork semantic ownership or derivation rules.

- preservation-and-validation
  - Transfer Kind: work
  - Description: focused `operatingOverview.test.mjs`, `operation.catalog.test.mjs`, portable Node input/CLI, and bootstrap tests are green. The complete accepted portable Handoff baseline remains 21-of-21 green after the change.
  - Boundary: no Handoff carrier transport module, Business artifact, Docs schema, Viewer surface, or unrelated application module was changed.

## Required Context

- initiating-operating-overview-handoff
  - Material: exact Anchor delegation that authorizes this discovery-first tranche.
  - Material Reference: [Operating Overview Resumption](030-anchor-to-loom-operating-overview-tooling-projection-resumption.trace.md)
  - Purpose: scope, semantic boundaries, deferred dimensions, and return contract.
  - Availability: available

- operating-overview-projection
  - Material: provider-neutral loaded-material projection implementation.
  - Material Reference: [Operating Overview Projection](../../../src/tooling/portable/overview/operatingOverview.js)
  - Purpose: first-slice Project/frontier/blocker/resource projection and explicit deferred capability boundaries.
  - Availability: available

- operating-overview-regression
  - Material: focused direct/catalog/CLI shared-consumer regression.
  - Material Reference: [Operating Overview Projection Test](../../../src/tooling/portable/overview/operatingOverview.test.mjs)
  - Purpose: proves semantic separations, exact-qualified Task candidate selection, blocker/resource signals, serialization, and consumer parity.
  - Availability: available

- portable-operation-catalog
  - Material: registered read-only portable operation and CLI exposure.
  - Material Reference: [Portable Operation Catalog](../../../src/tooling/portable/operation.catalog.js)
  - Purpose: shared provider-neutral operation discovery and execution surface.
  - Availability: available

## Reference Context

- accepted-human-projection-return
  - Material: accepted clean-carrier human projection predecessor.
  - Material Reference: [Clean Carrier Human Projection Return](029-loom-to-anchor-clean-carrier-human-projection-parity.trace.md)
  - Purpose: preserved transport checkpoint.
  - Availability: available

- queued-operating-overview-delegation
  - Material: original queued Operating Overview tranche.
  - Material Reference: [Operating Overview Tooling Projection](024-anchor-to-loom-operating-overview-tooling-projection.trace.md)
  - Purpose: original tranche scope and Axiom-informed composition boundary.
  - Availability: available

## Retained Responsibilities

- first-slice-acceptance
  - Retained By: Anchor
  - Responsibility: reconcile this provider-neutral projection against Axiom's semantic composition Decision and the controlling Business Operating Overview task before calling the first Tooling criterion accepted.
  - Boundary: Loom implemented Tooling projection only and did not create canonical semantic authority.

- monitoring-freshness-next-slice
  - Retained By: Anchor; Axiom
  - Responsibility: decide whether a later tranche should define a maintained Tooling derivation for Monitoring/Source freshness from declared observation semantics.
  - Boundary: host clock, remote fetch state, and undeclared observations remain unavailable here.

- cross-repository-traversal-next-slice
  - Retained By: Anchor
  - Responsibility: decide whether provider-neutral remote/repository traversal capability belongs in a later Tooling tranche.
  - Boundary: the current operation is loaded-only and does not crawl or fetch repositories.

- viewer-consumption
  - Retained By: Sigma; Anchor
  - Responsibility: later judge and integrate a human Viewer surface over the same accepted projection if useful.
  - Boundary: no Viewer-specific semantic model was created.

## Exclusions And Dependencies

- no-new-overview-schema
  - Kind: excluded-scope
  - Description: no Dashboard, Status, Initiative, Epic, Frontier, or other canonical overview schema was added.

- no-lineage-frontier-conflation
  - Kind: excluded-scope
  - Description: lineage root/leaf position is not used to infer workflow frontier or Task lifecycle state.

- no-monitoring-freshness-inference
  - Kind: excluded-scope
  - Description: freshness is not inferred from current host time, network reachability, or loaded Source presence.

- no-remote-provider-expansion
  - Kind: excluded-scope
  - Description: no repository crawler, network provider, remote write, hidden status database, or provider-specific traversal was added.

- no-viewer-or-business-mutation
  - Kind: excluded-scope
  - Description: Viewer, Business, Docs, and unrelated application artifacts remain unchanged.

## Completion Expectation

- Signal Kind: return
- Signal Meaning: Anchor receives one exact complete Workspace-bearing Loom-to-Anchor package containing the smallest provider-neutral loaded-material Operating Overview projection, focused shared-consumer proof, explicit Monitoring/cross-repository deferred boundaries, and the accepted 21-of-21 portable Handoff baseline intact.
- Return To: Anchor

## Interpretation Limits

- Does Not Mean: the final human dashboard exists, Project inventory is globally complete, a current-frontier candidate is canonical workflow truth, a lineage leaf is current work, Monitoring freshness has been solved, remote repositories have been traversed, or a new semantic schema has been authorized.
- Must Not Be Used To Claim: that empty Site-loaded Project/resource results imply Business has no such artifacts, that Task status and lineage position are interchangeable, that loaded Workspace declarations prove remote relevance freshness, or that this projection becomes a second status database.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [Anchor To Loom — Operating Overview Tooling Projection Resumption](030-anchor-to-loom-operating-overview-tooling-projection-resumption.trace.md)
  - Value: Jv5bwctGCYj2Lx2P1s-f-xcX7dJLWGhUplrDASS6gVE

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:RE3SqMLOf_Rfg5sTq0e5Njp-ERThwjHKvTQH3Jb_jc8