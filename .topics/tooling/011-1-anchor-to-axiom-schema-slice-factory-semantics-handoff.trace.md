# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-03 21:36:51
  - Trace: [011-schema-slice-factory-qualification-builder-readiness-task.trace.md](011-schema-slice-factory-qualification-builder-readiness-task.trace.md)
  - Origin:
    - [relative](011-schema-slice-factory-qualification-builder-readiness-task.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-03 21:37:19
  - Authors: Anchor
  - Why: Generalization must be constrained by canonical Docs semantics before mechanics or Viewer scale can turn implementation convenience into competing authority.
  - Summary: Axiom route to qualify reusable schema-factory semantics, Root/inheritance boundaries, companion concepts, Builder authority limits, and useful-first scale waves.
  - Status: ready/local

---

# Schema Slice Factory Semantics — Anchor To Axiom

## Handoff Parties

- Purpose: qualify the semantic boundaries of the reusable schema-slice factory before Loom generalizes mechanics or Anchor authorizes broad schema scaling.
- From: Anchor
- From Kind: role
- From Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
- To: Axiom
- To Kind: role
- To Reference: [Axiom Role](business::.topics/roles/001-2-axiom-role.trace.md)

## Transfers

- factory-semantics-qualification
  - Transfer Kind: work
  - Description: inspect current canonical Docs authority and produce the semantic factory contract for the qualification set `tiinex.decision.v1`, `tiinex.evidence.v1`, and `tiinex.handoff.v1`, including Root/inheritance, Artifact Creation Contract, repeated declarations, relations, reusable Transition Definitions, and companion boundaries.
  - Controlling Artifact: [Schema Slice Factory Qualification + Builder Readiness](011-schema-slice-factory-qualification-builder-readiness-task.trace.md)
  - Boundary: semantic classification only; do not implement Site/Viewer mechanics and do not invent capabilities merely for uniformity.

- scale-wave-classification
  - Transfer Kind: work
  - Description: classify the maintained Docs schema families into useful-first scaling waves after factory qualification, with `tiinex.validation.finding.v1` tested as the intended first post-factory consumer and with less useful/specialized families deferred.
  - Controlling Artifact: [Schema Slice Factory Qualification + Builder Readiness](011-schema-slice-factory-qualification-builder-readiness-task.trace.md)
  - Boundary: ordering must follow semantic dependencies and product usefulness, not directory order or a requirement that every schema expose identical companions.

- builder-authority-boundary
  - Transfer Kind: responsibility
  - Description: state which canonical schema-governance surfaces a future Schema Builder may project/edit and which semantic truths remain owned by existing schema artifacts, inheritance, Transition Definitions, Relations, or other companion artifacts.
  - Controlling Artifact: [Schema Slice Factory Qualification + Builder Readiness](011-schema-slice-factory-qualification-builder-readiness-task.trace.md)
  - Boundary: the Builder must consume shared authority rather than become a new schema ontology.

## Required Context

- factory-task
  - Material: controlling factory qualification Task
  - Material Reference: [Schema Slice Factory Qualification + Builder Readiness](011-schema-slice-factory-qualification-builder-readiness-task.trace.md)
  - Purpose: exact qualification set, acceptance gates, Builder-readiness requirement, and no-fan-out boundary.
  - Availability: available

- prior-axiom-reduction-contract
  - Material: prior Axiom semantic precedent for fail-closed declared-contract reasoning
  - Material Reference: [Axiom Reduction Before Delete + Cross-Repository Boundary Decision](010-1-1-axiom-reduction-before-delete-cross-repository-boundary-decision.trace.md)
  - Purpose: retain the rule that Tooling must prove explicit semantic authority rather than rely on LLM/operator convention.
  - Availability: available

- viewer-action-major
  - Material: Viewer artifact/action parity major
  - Material Reference: [Viewer Artifact + Action Parity Recovery](../viewer/004-anchor-viewer-artifact-action-parity-recovery-active-major-task.trace.md)
  - Purpose: product boundary requiring schema actions to consume shared creation/read/transition authority.
  - Availability: available

## Reference Context

- current-docs-schemas
  - Material: carried/current Docs Root, Decision, Preservation, Evidence, Handoff, Transition Definition, Relation, Validation, Schema Family, Schema Module, and Schema Contract-family artifacts
  - Purpose: canonical semantics and machine contract authority for classification.
  - Availability: available

- current-site-factory-evidence
  - Material: current Site generic schema module, capability registry, creation-contract compiler, companion contract, and canonical Topic→Task transition product slice
  - Purpose: implementation evidence only, useful for identifying where current mechanics overfit or underrepresent Docs; Site behavior must not redefine schema meaning.
  - Availability: available

## Retained Responsibilities

- mechanics-and-conformance
  - Retained By: Loom
  - Responsibility: implement generic shared mechanics only after/within the semantic boundaries visible from canonical Docs; fail closed on ambiguity.

- product-proof
  - Retained By: Kodax
  - Responsibility: later prove Viewer consumption after Anchor reconciles Axiom/Loom; no private schema semantics.

- architecture-and-progression
  - Retained By: Anchor
  - Responsibility: reconcile Axiom semantics with Loom mechanics, stop duplicated logic, choose the next role turn, and decide whether the factory is technically ready for Kodax proof.

- factory-acceptance
  - Retained By: Sigma
  - Responsibility: approve the factory pattern only after it is demonstrated in actual shared Tooling/Viewer use.

## Exclusions And Dependencies

- no-forced-root-symmetry
  - Kind: excluded-scope
  - Description: do not require Root to be manually creatable or to own concrete transitions/companions merely because descendants do.
  - Responsible Party Or Role: Axiom

- no-schema-catalog-rewrite
  - Kind: excluded-scope
  - Description: do not redesign all Docs schemas to make Site implementation easier; distinguish genuine semantic contract gaps from mechanics that should become more capable.
  - Responsible Party Or Role: Axiom

- no-implementation
  - Kind: excluded-scope
  - Description: Axiom returns semantic Decision/Discovery/Evidence artifacts and does not implement Viewer or Tooling code in this route.
  - Responsible Party Or Role: Anchor

- no-broad-fanout
  - Kind: unresolved-dependency
  - Description: broad schema scaling waits for Loom factory mechanics, Kodax product proof, and Sigma factory acceptance.
  - Responsible Party Or Role: Anchor

## Session Role Binding

- Sender Role: Anchor.
- Recipient Role: Axiom.
- Holder Binding: the consuming session must explicitly operate in the Axiom capacity; route selection or package consumption is not holder proof.
- Re-grounding Rule: cold grounding must preserve Axiom as recipient Role and report holder/session binding separately.

## Completion Expectation

- Signal Kind: result
- Signal Meaning: Axiom returns one bounded semantic disposition that classifies factory-generic versus schema-specific authority, Root/inheritance rules, creation/transition/relation/companion boundaries, Builder authority limits, and useful-first schema scaling waves, plus any precise canonical Docs contradiction that blocks Loom.
- Return To: Anchor
- Return To Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
- Expected Result Reference: [Schema Slice Factory Qualification + Builder Readiness](011-schema-slice-factory-qualification-builder-readiness-task.trace.md)

## Interpretation Limits

- Does Not Mean: Axiom approval alone accepts the factory, authorizes broad schema scaling, changes Site code, or requires every schema to expose the same capabilities.
- Must Not Be Used To Claim: directory layout is schema authority, Root is concrete, absent transitions are missing by default, or Site implementation behavior can override canonical Docs semantics.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [011-schema-slice-factory-qualification-builder-readiness-task.trace.md](011-schema-slice-factory-qualification-builder-readiness-task.trace.md)
  - Value: k-972tR9t7s3QQpQ13Id5oG5qHVIqK05f_LEIr_MM5k

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: bSETuTufEqIp5jmhGZwimVrZyWQ6kf8vrRGFz3xzdcU