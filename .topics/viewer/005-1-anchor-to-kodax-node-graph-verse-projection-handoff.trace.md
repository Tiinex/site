# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-03 19:25:01
  - Trace: [005-node-graph-verse-projection-task.trace.md](005-node-graph-verse-projection-task.trace.md)
  - Origin:
    - [relative](005-node-graph-verse-projection-task.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-03 19:25:09
  - Authors: Anchor
  - Why: The Node Graph product slice is implementation-ready independently of the still-blocked reduction execution, provided shared semantics remain Tooling-owned and Playthings is treated only as a bounded reference.
  - Summary: Kodax implementation route for general Node Graph Verse and Multi-Verse projection, with derived layout, LOD, and bounded generic reference harvesting.
  - Status: ready/local

---

# Node Graph Verse Projection — Anchor To Kodax

## Handoff Parties

- Purpose: implement the bounded general Node Graph Verse / Multi-Verse projection in Viewer while preserving Tiinex artifact authority and harvesting only generic proven optimization ideas from reference work.
- From: Anchor
- From Kind: role
- From Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
- To: Kodax
- To Kind: role
- To Reference: [Kodax Role](business::.topics/roles/001-6-kodax-role.trace.md)

## Transfers

- node-graph-verse-implementation
  - Transfer Kind: work
  - Description: implement the general Node Graph Verse and Multi-Verse projection described by the controlling Task, including graph-model boundaries, LOD, deterministic/off-hot-path layout preparation, artifact focus/open integration, tests, and measured performance evidence.
  - Controlling Artifact: [Node Graph Verse Projection](005-node-graph-verse-projection-task.trace.md)
  - Boundary: coordinates/layout/community are derived projection only; no Viewer-private artifact or lineage authority.

- bounded-reference-harvest
  - Transfer Kind: responsibility
  - Description: inspect Memstead feedback and current `playthings` only for general Viewer architecture/performance techniques worth porting; document provenance and semantic equivalence for anything copied or adapted.
  - Controlling Artifact: [Node Graph Verse Projection](005-node-graph-verse-projection-task.trace.md)
  - Boundary: do not merge `playthings`, import its world/Verse grammar, or couple the general Viewer to Playthings-specific presentation/state.

## Required Context

- controlling-node-graph-task
  - Material: Node Graph Verse projection Task
  - Material Reference: [Node Graph Verse Projection](005-node-graph-verse-projection-task.trace.md)
  - Purpose: exact implementation scope and done criteria.
  - Availability: available

- viewer-current-major
  - Material: current Viewer Artifact + Action parity major
  - Material Reference: [Viewer Artifact And Action Parity](004-anchor-viewer-artifact-action-parity-recovery-active-major-task.trace.md)
  - Purpose: current general Viewer product boundary that the new projection must integrate with rather than replace.
  - Availability: available

## Reference Context

- memstead-spatial-feedback
  - Material: Memstead spatial graph navigation issue and maintainer implementation feedback
  - Material Reference: [Memstead issue 41](https://github.com/memstead/memstead/issues/41)
  - Purpose: external evidence that spatial graph views work best as human orientation, with baked deterministic layout, communities/LOD, lightweight preview, and lazy richer interaction.
  - Availability: available

- playthings-generic-package-reconciliation
  - Material: current generic recipient-v2 package reconciliation implementation on the reference branch
  - Material Reference: [handoffPackageRecipientV2.js at playthings d4df150](https://github.com/Tiinex/site/blob/d4df15015f3cb0f5da7f123990077b21aab106c2/src/app/handoffPackageRecipientV2.js)
  - Purpose: inspect only general multi-workspace reconciliation/transient-session patterns that may benefit the general Viewer.
  - Availability: available

- playthings-generic-record-cache
  - Material: current generic record hydration cache on the reference branch
  - Material Reference: [recordUi.cache.js at playthings d4df150](https://github.com/Tiinex/site/blob/d4df15015f3cb0f5da7f123990077b21aab106c2/src/app/recordUi.cache.js)
  - Purpose: inspect bounded positive/negative hydration caching as a general Viewer optimization candidate.
  - Availability: available

- playthings-generic-persistence-scheduler
  - Material: current generic deferred persistence scheduler on the reference branch
  - Material Reference: [statePersistenceScheduler.js at playthings d4df150](https://github.com/Tiinex/site/blob/d4df15015f3cb0f5da7f123990077b21aab106c2/src/app/statePersistenceScheduler.js)
  - Purpose: inspect view-only persistence deferral as a general Viewer responsiveness candidate.
  - Availability: available

## Retained Responsibilities

- product-progression
  - Retained By: Anchor
  - Responsibility: review Kodax evidence, reconcile shared Tooling dependencies, and decide follow-up scope.

- human-acceptance
  - Retained By: Sigma
  - Responsibility: browser/human acceptance after Anchor technical review when the implementation is ready.

- shared-semantics
  - Retained By: Loom
  - Responsibility: shared lineage/reduction/audit mechanics remain Tooling-owned; Kodax must surface missing primitives rather than creating private semantics.

## Exclusions And Dependencies

- no-playthings-merge
  - Kind: excluded-scope
  - Description: the active `playthings` branch remains independently owned and ongoing; only bounded generic techniques may be studied/ported.
  - Responsible Party Or Role: Anchor

- no-reduction-private-implementation
  - Kind: unresolved-dependency
  - Description: historical Reduction expansion in graph views must wait for or consume qualified shared Tooling; do not invent a Viewer-only expansion contract.
  - Responsible Party Or Role: Loom

- no-remote-write
  - Kind: excluded-scope
  - Description: implementation is local/package return work; no push, merge, publication, or deployment is authorized by this Handoff.
  - Responsible Party Or Role: Sigma

## Session Role Binding

- Sender Role: Anchor.
- Recipient Role: Kodax.
- Holder Binding: the consuming coding session must explicitly operate in the Kodax capacity; package consumption, route selection, or a model/tool name does not itself prove holder assignment.
- Re-grounding Rule: cold grounding must preserve the Kodax Role endpoint and report actual holder/session binding separately.

## Completion Expectation

- Signal Kind: result
- Signal Meaning: Kodax returns qualified technical Evidence plus a return Handoff/carrier with the bounded Node Graph Verse implementation, tests, measured performance/LOD limits, generic reference techniques actually used, deferred spatial/3D work, and any missing Loom primitive.
- Return To: Anchor
- Return To Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
- Expected Result Reference: [Node Graph Verse Projection](005-node-graph-verse-projection-task.trace.md)

## Interpretation Limits

- Does Not Mean: Node Graph layout becomes Tiinex authority, `playthings` is merged, Memstead semantics are adopted, or Kodax owns shared Tooling/schema decisions.
- Must Not Be Used To Claim: technical tests are Sigma product acceptance, spatial layout is required navigation, or package consumption assigns the Kodax holder.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [005-node-graph-verse-projection-task.trace.md](005-node-graph-verse-projection-task.trace.md)
  - Value: TB7XatMhHU7i4ludN7hYa3ogFgK-DDmsjCeszwxt-J4

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: jGQp_3XP9Iusw5txewioA3BM5hgRlnvriV413UqvB24