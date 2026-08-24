# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-08-23 20:15:53
  - Authors: Axiom
  - Why: Land the requested canonical semantic classification of reusable Process scope/composition after recovering the exact published Root, Task, Handoff, Relation and Transition authorities, without promoting Viewer/runtime convenience or the separate measurement/calibration gap into Process truth.
  - Summary: Classify a canonical Process artifact/schema as semantically warranted to own reusable qualified scope/composition, exposed boundary contract and extraction provenance over real Tiinex artifacts and relations, while reusing existing Transition Definition, Relation and lineage authority and deferring all schema authoring to a separate Tiinex/docs task.
  - Status: accepted/local

---

# Process artifact scope composition semantic classification disposition

## Decision

- State: accepted
- Subject: reusable Tiinex Process scope/composition, boundary interface, reuse contract, extraction provenance and projection semantics
- Decision: classify the candidate as **a new canonical Process artifact/schema is semantically warranted**. The missing semantic owner is a reusable qualified composition boundary over real Tiinex artifacts, semantic roles/requirements, Transition Definitions and typed relations. Process should not become an execution engine, a graph-runtime node taxonomy, a package boundary, a Project synonym, or a single oversized Transition Definition. Existing member artifacts and relation/transition authorities keep their own meaning; Process owns only the additional reusable composition/scope truth that no recovered current schema owns.
- Next Boundary: `schema-warranted` — open a separately scoped Tiinex/docs Process schema-authoring task. This disposition performs no schema mutation, publication, Site/Kodax implementation, Viewer design, portable Tooling work, execution-engine design or measurement/calibration design.
- Trust Level: accepted semantic classification / exact pinned canonical recovery / schema authoring not yet performed / no runtime or publication authority

## Basis

### Canonical authority recovered

- [Root at 3988951208eb9a8926e84ab42625d4b42fa00c2d](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md) keeps `Parent` narrow: `Trace` is the direct continuity relation, `Parent` is ancestry only, and `Origin` supports recovery without replacing `Trace`. This prevents graph topology or extraction source material from silently becoming Process Parent authority.
- [Task at 053d46ce082d4ec261b82abc44ecca403d61e240](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md) owns one bounded concrete unit of work and its completion boundary. A reusable method/composition therefore must not be modeled by stretching Task into a process definition.
- [Handoff at 3988951208eb9a8926e84ab42625d4b42fa00c2d](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md) owns explicit transfer of bounded work/responsibility between endpoints. Context carriage, package membership and completion-facing signals do not define a reusable method.
- [Relation at 3988951208eb9a8926e84ab42625d4b42fa00c2d](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/relation/tiinex.relation.v1.schema.md) owns typed non-parent relationships and explicitly permits another artifact to project typed relation edges when that artifact owns the main semantics. A standalone Relation Artifact is needed only when the relation instance itself has independent semantic/provenance/state/lifecycle value. Process therefore may compose qualified real relations without minting one relation artifact or synthetic node for every graph edge.
- [Legacy Transition at 3988951208eb9a8926e84ab42625d4b42fa00c2d](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/transition/tiinex.transition.v1.schema.md) is preserved for invocation/provenance-shaped bounded source-to-result transitions and explicitly delegates new reusable transformation definitions to Transition Definition. It is not the reusable Process owner.
- [Transition Definition at 3988951208eb9a8926e84ab42625d4b42fa00c2d](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/transition/definition/tiinex.transition.definition.v1.schema.md) already owns reusable bounded transformation contracts, including named input/output roles, cardinality, target classification, conditions, lifecycle/Parent effects, relation effects, authoring bindings and placement. Process must reuse or reference that authority rather than duplicate it. Its distinct missing role is composition/scope across multiple independently meaningful artifacts/relations/definitions, not another transformation-effect vocabulary.
- [Semantic Package at 3988951208eb9a8926e84ab42625d4b42fa00c2d](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/package/semantic/tiinex.semantic.package.v1.schema.md) explicitly owns transport/discovery boundary only; package containment is not semantic ownership. Filesystem/package scope therefore cannot substitute for Process membership.
- [Project at 3988951208eb9a8926e84ab42625d4b42fa00c2d](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/project/tiinex.project.v1.schema.md) owns a bounded coordinated effort over time and explicitly avoids making one project methodology the base concept. Project is therefore not the reusable Process/method contract.
- [Derivation at 3988951208eb9a8926e84ab42625d4b42fa00c2d](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/knowledge/derivation/tiinex.derivation.v1.schema.md) may preserve public reviewable reasoning for why a Process was recognized or revised, but does not own the Process contract itself.
- The [pinned schema tree at 3988951208eb9a8926e84ab42625d4b42fa00c2d](https://api.github.com/repos/Tiinex/docs/git/trees/3988951208eb9a8926e84ab42625d4b42fa00c2d?recursive=1) was searched before classifying. No `process` schema path and no standalone `tiinex.reference.v1` schema were recovered there. Reference-like semantics remain distributed through exact artifact references, Relation, Transition intent and schema-local reference fields; none supplies reusable Process composition ownership.

### Why existing semantics are not sufficient by themselves

- Task, Handoff, Relation, Transition Definition, Project and Semantic Package each own a necessary neighboring truth, but none owns the durable statement that a selected set of independently meaningful semantic artifacts/relations together constitutes one reusable method boundary with an exposed reusable interface.
- Treating the whole composition as one Transition Definition would collapse two distinct concerns. Transition Definition says what one reusable bounded transformation may do to named participants; Process must be able to include/reference multiple artifacts, requirements, relations and Transition Definitions while leaving each of those authorities intact. Membership in a method is not itself an input/output role, lifecycle effect or relation effect.
- Leaving Process as a non-schema Viewer/runtime pattern would make scope membership, interface exposure, reuse and extraction provenance depend on application state or prose. That would create exactly the duplicate/hidden semantic authority the candidate is intended to avoid.

### Process semantic boundary

- Process membership is explicit qualified composition truth. It may name or reference genuine Tiinex artifacts, semantic requirements/roles, Transition Definitions and typed relations directly. Member schemas continue to own their own fields, lifecycle, claims, completion, relation predicates, conditions and other domain semantics.
- Membership is not `Parent`, filesystem containment, Semantic Package containment, Project membership, graph adjacency, render order, execution order or runtime-node identity.
- Synthetic runtime-only node classes that merely restate Task, Decision, Handoff, Result, Relation, Transition or another existing artifact meaning are rejected by this classification. A renderer/runtime may project or bind real artifacts, but it does not gain semantic ownership by doing so.

### Boundary inputs and outputs

- A relation/requirement crossing the Process scope boundary is a **candidate** interface signal, not automatically a canonical input or output merely because graph topology crosses a line.
- An incoming crossing may be exposed as a Process input when its predicate/direction and participant or requirement semantics are qualified and the Process contract explicitly exposes that unresolved/outside dependency as an input role. An outgoing crossing may be exposed as an output when its predicate/direction and result/participant semantics are qualified and the Process contract explicitly exposes it as an output role.
- The local hypothesis that an unsatisfied crossing requirement becomes an input is accepted only at this qualified level. No recovered authority establishes a generic process-wide satisfaction engine that can infer canonical interface roles from graph holes alone. Discovery tooling may propose candidates; the durable Process contract must carry the accepted qualification.
- Cardinality, conditions, target classification and lifecycle already have explicit authority where a Process boundary exposes an existing Transition Definition role or another schema-owned constraint. Process should reference/preserve that authority. This disposition does not invent aggregate Process cardinality, requirement-satisfaction or execution rules when no current contract owns them.

### Reuse and instantiation

- The reusable invariant is the Process contract: qualified composition membership, selected relation semantics, referenced Transition Definitions/requirements, exposed boundary roles/bindings and interpretation limits.
- A later reuse may bind different concrete artifact instances, values, conditions, destinations or surrounding lineage while still instantiating the same Process contract.
- Equivalent outcome means satisfaction of the Process contract together with the contracts owned by referenced artifacts/Transition Definitions. It does not mean identical bytes, identifiers, values, paths or output representations.
- Transition Definition already establishes that an invocation binds concrete inputs/values/conditions/destinations and normally does not require a Transition receipt artifact. Current evidence likewise does not warrant a separate `Process Run` schema. Concrete executions may remain visible through their ordinary artifacts, transitions/events, evidence and lineage unless a later independently valuable run/occurrence concept survives separate semantic review.

### Extraction provenance

- A Process recognized from real work may preserve typed non-parent provenance to the concrete artifact(s), lineage segment or evidence set from which the reusable composition was extracted, recognized or later revised.
- Such extraction provenance is not the Process's canonical meaning and is not automatically `Parent`. Root Parent remains direct artifact-continuity ancestry. If a later Process artifact directly continues/revises an earlier Process artifact, Process-to-Process Parent may be appropriate under Root; the observed source lineage remains a separate provenance relation.
- Prefer an explicit specific typed relation such as `extracted-from`/`recognized-from` semantics rather than a vague generic `related` edge. If the provenance relation itself has independent state, evidence, interpretation limits or lifecycle worth preserving, Relation may own a standalone relation artifact; otherwise the future Process contract may project the typed relation directly under Relation authority. Derivation/Evidence may separately support why the extraction/revision is justified when that rationale matters.

### Human and Viewer projection

- Human-first reading remains the semantic baseline: one Process normally denotes one reusable method/composition boundary, while the referenced artifacts retain their own readable meanings.
- A Viewer graph may draw those same artifacts and typed relations, mark the Process boundary, and visually expose qualified inputs/outputs. The graph is a projection of the durable Process/member/relation truth, not a second authority and not a reason to mint graph-specific semantic nodes.

## Consequences

- The controlling [Process semantic classification task](001-20-process-artifact-scope-composition-semantic-classification-task.trace.md) is semantically complete at classification level: exact pinned authority was recovered, the candidate is classified `schema-warranted`, and no canonical source blocker remains for this disposition.
- The [Process scope/composition design feedback](001-18-1-process-artifact-scope-composition-and-lineage-extraction-feedback.trace.md) is promoted only as validated design direction where this decision says so. It remains historical candidate evidence rather than the canonical Process schema contract.
- Open one separately bounded Tiinex/docs schema-authoring task for the minimal Process artifact/schema. That task should decide the exact schema identifier/path and machine contract, and should add only semantics not already owned elsewhere: Process identity/purpose and semantic boundary; qualified composition-member declarations; boundary/interface exposure/binding declarations; reusable contract/binding boundary; extraction-provenance relations; and interpretation limits.
- The schema-authoring task must reuse rather than duplicate Relation predicate/edge semantics, Transition Definition roles/cardinality/conditions/lifecycle/Parent/relation effects, target schema creation/generation authority, Root Parent/Origin, or Semantic Package discovery semantics. If a Process-level constraint genuinely cannot be expressed by referenced authority, that gap must be named explicitly before adding new vocabulary.
- Do not open a `Process Run`, workflow engine, orchestration runtime, Viewer graph-node, Site/Kodax implementation or portable Tooling task from this decision alone. Any later implementation transfer waits for maintained Process semantics and its own acceptance boundary.
- The separate [measurement/calibration schema gap](001-15-process-measurement-calibration-schema-gap.trace.md) remains separate. Process may eventually reference measurement/calibration artifacts, but this classification neither defines nor absorbs those semantics.
- The contradictory Tooling scaling evidence remains outside this semantic branch exactly as the Handoff requires; it neither supports nor blocks Process schema classification.
- This artifact is local workspace authority only. It performs no Tiinex/docs publication, merge, push or canonical schema creation.

## Review Conditions

Revisit this classification if a published canonical schema is recovered that already owns reusable qualified multi-artifact composition/scope and boundary interface semantics without semantic duplication, if schema-authoring proves that Transition Definition can express the full composition while preserving independent member authority and membership/interface meaning without overload, or if a concrete cross-domain example demonstrates that the proposed Process boundary cannot remain human-readable without becoming an execution language. Until then, preserve the minimal schema-warranted boundary and keep runtime/Viewer/package mechanics downstream projections.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:usYuxTxcCzVk142MFgJFLhKa5NtBhkf7yKoUHDMkYJ4
