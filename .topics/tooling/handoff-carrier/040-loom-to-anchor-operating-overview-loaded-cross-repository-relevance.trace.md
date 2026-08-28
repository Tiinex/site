# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-08-28 22:43:00
  - Trace: [Anchor To Loom — Operating Overview Loaded Cross-Repository Relevance](039-anchor-to-loom-operating-overview-loaded-cross-repository-relevance.trace.md)
  - Origin:
    - [relative](039-anchor-to-loom-operating-overview-loaded-cross-repository-relevance.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-08-28 22:55:00
  - Authors: Loom
  - Summary: Return the bounded loaded cross-repository relevance projection: explicit qualified Relation targets can now resolve uniquely to already-loaded records by exact path or explicit accepted locator evidence, while same-path ambiguity and missing targets remain visible and no network, Parent, or lifecycle inference occurs.
  - Status: local

---

# Loom To Anchor — Operating Overview Loaded Cross-Repository Relevance

## Handoff Parties

- Purpose: return the smallest provider-neutral Operating Overview composition needed to connect explicit typed non-Parent Relation targets to already-loaded records across preserved source bases without repository traversal, target guessing, or workflow-state invention.
- From: Loom
- From Kind: role
- To: Anchor
- To Kind: role

## Transfers

- loaded-relation-relevance-projection
  - Transfer Kind: work-and-responsibility
  - Description: Operating Overview `crossRepository` now includes `relevanceEdges` derived from explicit `## Relation Target` declarations on already-loaded `tiinex.relation.v1` artifacts. Each edge preserves the Relation overview item, target descriptor, resolution state, candidate evidence, and both loaded source bases when a target resolves.
  - Boundary: the projection is consumer evidence only. Relation remains non-Parent semantics and the target artifact retains its own schema, lifecycle, provenance, ownership, acceptance, and publication authority.

- exact-loaded-target-resolution
  - Transfer Kind: work-and-responsibility
  - Description: relative artifact targets are resolved only by explicit relation-relative path normalization against already-loaded record path/id or accepted repository source path. Explicit URI targets may match only an exactly carried accepted repository permalink or durable locator.
  - Boundary: no basename, filename similarity, sibling order, repository familiarity, provider-specific URL synthesis, hidden source search, or whichever-record-appeared-first heuristic is used.

- ambiguity-and-unresolved-preservation
  - Transfer Kind: work
  - Description: if more than one loaded record truthfully matches the explicit target identity, the edge is `ambiguous` and all candidates remain visible; if no truthful loaded target matches, the edge is `unresolved`. A uniquely identified but non-exact-qualified candidate is also kept unresolved.
  - Boundary: ambiguity and insufficient qualification are never strengthened by repository-shaped metadata, source resemblance, or local/archive placement.

- cross-source-basis-proof
  - Transfer Kind: work
  - Description: focused regression now covers a Relation loaded from accepted repository source A resolving uniquely to a completed Task loaded from accepted repository source B, while preserving both `loadedSourceBasis` objects. A same-authored-path pair loaded from sources B and C remains ambiguous, and a missing target remains unresolved.
  - Boundary: source-basis evidence remains the accepted non-authoritative consumer evidence from the prior tranche; this work does not create canonical repository identity or remote existence proof.

- lifecycle-and-lineage-boundary
  - Transfer Kind: work
  - Description: Relation relevance does not feed frontier, blocker, completion, acceptance, ownership, or Parent derivation. The completed target Task in the focused proof remains outside `frontierCandidates`, and `resolution.lifecycleInference` and `parentInference` are explicitly false.
  - Boundary: workflow state remains owned by Task/Project declarations and existing exact qualification rules; lineage topology remains separate.

- preservation
  - Transfer Kind: work
  - Description: `portable.input.test.mjs` and `operatingOverview.test.mjs` are green after the repair. The complete accepted portable Handoff baseline remains 21-of-21 green. Exact Workspace comparison shows only `operatingOverview.js` and `operatingOverview.test.mjs` changed before this return Handoff was added.
  - Boundary: no portable-input representation, Handoff transport, Viewer, Business, Docs, Monitoring freshness, repository crawler, remote provider traversal, or unrelated application module changed.

## Required Context

- initiating-loaded-relevance-handoff
  - Material: exact Anchor delegation authorizing this loaded cross-repository relevance tranche.
  - Material Reference: [Loaded Cross-Repository Relevance](039-anchor-to-loom-operating-overview-loaded-cross-repository-relevance.trace.md)
  - Purpose: scope, exact-resolution boundary, ambiguity requirements, and completion contract.
  - Availability: available

- operating-overview-projection
  - Material: Operating Overview projection with loaded Relation relevance composition.
  - Material Reference: [operatingOverview.js](../../../src/tooling/portable/overview/operatingOverview.js)
  - Purpose: exact loaded-only target resolution and source-basis preservation seam.
  - Availability: available

- operating-overview-regression
  - Material: focused Operating Overview regression including unique cross-source resolution, same-path ambiguity, unresolved target, and lifecycle non-inference proof.
  - Material Reference: [operatingOverview.test.mjs](../../../src/tooling/portable/overview/operatingOverview.test.mjs)
  - Purpose: adversarial acceptance evidence for this tranche.
  - Availability: available

- portable-input-normalization
  - Material: unchanged provider-neutral portable record/source normalization used by the projection.
  - Material Reference: [portable.input.js](../../../src/tooling/portable/input/portable.input.js)
  - Purpose: confirms this tranche composes existing loaded-record/source facts rather than adding a new representation contract.
  - Availability: available

## Reference Context

- accepted-repository-source-basis
  - Material: prior accepted repository receipt source-basis return.
  - Material Reference: [Qualified Repository Source Basis](037-loom-to-anchor-operating-overview-qualified-repository-source-basis.trace.md)
  - Purpose: retained pinned/moving/lookalike source qualification and no-URL-synthesis boundary.
  - Availability: available

- complete-portable-handoff-baseline
  - Material: accepted 21-test portable Handoff regression directory.
  - Material Reference: [Portable Handoff Tests](../../../src/tooling/portable/handoff/)
  - Purpose: transport non-regression gate.
  - Availability: available

## Retained Responsibilities

- loaded-relevance-review
  - Retained By: Anchor
  - Responsibility: decide whether the returned loaded-only exact-target relevance projection is truthful enough for the next Operating Overview tranche.
  - Boundary: acceptance of a projected relevance edge does not promote it into Parent, Source, provenance, workflow status, ownership, publication authority, or proof of remote material.

- schema-authority
  - Retained By: Axiom
  - Responsibility: re-enter only if a later requirement needs Relation/Workspace/Discovery/Project/Task semantics beyond the maintained target semantics used here.
  - Boundary: this tranche found the existing `tiinex.relation.v1` target contract sufficient and makes no schema change.

- human-reference-usefulness
  - Retained By: Sigma
  - Responsibility: later judge whether resolved/ambiguous/unresolved relevance evidence is understandable in Viewer or Operations presentation.
  - Boundary: this tranche adds no Viewer integration.

## Exclusions And Dependencies

- no-network-or-provider-traversal
  - Kind: excluded-scope
  - Description: repository read/search, network fetch, remote provider traversal, repository crawling, implicit source search, and target materialization are not performed.

- no-target-guessing
  - Kind: excluded-scope
  - Description: targets are never selected by basename, filename similarity, sibling order, repository familiarity, provider convention, or load order. Exact loaded identity evidence only is eligible.

- no-lifecycle-or-parent-inference
  - Kind: excluded-scope
  - Description: Relation presence does not make a target current, blocked, complete, accepted, owned, canonical, or Parent-related. Those truths remain with their owning artifacts.

- no-schema-or-source-authority-expansion
  - Kind: excluded-scope
  - Description: no Relation, Workspace, Discovery, Project, Task, Monitoring, Source, provenance, Parent, Origin, or overview schema semantics were changed, and loaded source basis remains non-authoritative projection evidence.

- no-monitoring-or-viewer
  - Kind: excluded-scope
  - Description: Monitoring freshness, Viewer integration, Business mutation, Docs mutation, public UI, and repository hygiene remain deferred.

## Completion Expectation

- Signal Kind: return
- Signal Meaning: Anchor receives one exact complete Workspace-bearing Loom-to-Anchor package in which Operating Overview projects explicit already-loaded cross-repository Relation relevance to a uniquely resolvable loaded target while preserving both source bases; same-path ambiguity and unresolved targets remain explicit; no network traversal, target guessing, Parent inference, or lifecycle inference occurs; focused Overview/input regressions and all 21 portable Handoff tests are green.
- Return To: Anchor

## Interpretation Limits

- Does Not Mean: a relevance edge is Parent ancestry, canonical provenance, repository ownership, publication authority, workflow status, acceptance, or proof that a remote target exists beyond the already-loaded material.
- Must Not Be Used To Claim: that Tooling may crawl repositories, guess Relation targets, synthesize missing source identity, strengthen ambiguous metadata, infer Task/Project state from Relation presence, or replace authored artifact truth with the Overview projection.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [Anchor To Loom — Operating Overview Loaded Cross-Repository Relevance](039-anchor-to-loom-operating-overview-loaded-cross-repository-relevance.trace.md)
  - Value: RMCBfIHjX1TWdlMTKQJGm0NDeYXwekZj4BQNNAkMz9s

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:HeYC0BhJCz32Mr8vLXsjo8rHDFw3xdAaSka7xGR4-jQ
