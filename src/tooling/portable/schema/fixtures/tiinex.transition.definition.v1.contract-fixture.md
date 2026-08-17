<!-- Contract-only test fixture for Tiinex/docs@068241174421716b941421e95931ec5a6e95b0da. Transition Definition schema/body contract is byte-unchanged from the prior canonical baseline; only machine-authoritative contract surfaces are retained. -->
# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: tiinex.root.v1
  - Trace: root.trace.md
  - Origin: root.trace.md
- Current
  - Current Schema: tiinex.transition.definition.v1
  - Created At: 2026-08-15 00:00:00

---

# Transition Definition

## Schema Validation Contract

### Transition Definition Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.transition.definition.v1`

Rules

- `tiinex.transition.definition.v1` identifies artifacts whose main job is to define a reusable semantic transformation.
- A Transition Definition is not proof of invocation, execution, mutation, authorization, output existence, validation, evidence, truth, approval, consent, preservation, or successful materialization.
- A Transition Definition must not inherit semantics from legacy `tiinex.transition.v1` or `tiinex.artifact.transition.v1` merely because historical labels appear in examples or presentation surfaces.
- Prose outside `Schema Validation Contract` may explain the schema, but it does not add required validation rules.

### Transition Definition Body

Required Shape

- first body heading after the continuity envelope
- `## Transition Identity` section
- `## Purpose And Scope` section
- `## Input Roles` section
- `## Output Roles` section
- `## Lifecycle And Continuity Effects` section with `### Lifecycle Effects` and `### Parent Effects` subsections
- `## Relation Effects` section
- `## Applicability And Conditions` section
- `## Authoring Bindings` section
- `## Placement Intent` section with `### Destination Bindings` and `### Output Placements` subsections
- `## Interpretation Limits` section

Optional Sections

- Examples
- Related Definitions
- Migration Notes
- Relationship to Other Schemas

Rules

- Required sections must remain readable without specialized tooling.
- Repeated declarations must follow the named-entry shapes declared below and must not depend on prose parsing.
- A required repeated-declaration section with intentionally zero declarations must contain one literal first-level entry named `none` and no other entries.
- Literal `none` distinguishes intentional zero from a missing required section.

### Transition Identity

Required Fields

- Name
- Version
- Canonical Identifier

Optional Fields

- Transition Family
- Human Label
- Related Definition
- Supersedes Definition
- Tags

Rules

- `Canonical Identifier` identifies the reusable Transition Definition, not an invocation and not every artifact it may produce.
- `Version` should change when reusable transformation semantics materially change.
- `Transition Family` is optional classification or discovery metadata only and must not control lifecycle, Parent, relation, authoring, placement, or applicability behavior.
- Artifact state is owned by root `Current -> Status`; Transition Identity does not introduce a second generic Status authority.
- Human labels such as Create, Edit, Continue, Reference, Merge, Split, Build Car, Qualify, React, or Transfer are not a closed behavioral ontology.

### Purpose And Scope

Required Fields

- Purpose
- Semantic Boundary

Optional Fields

- Intended Domains
- Not Intended For
- Examples

Rules

- `Purpose` must explain the transformation in human-readable terms.
- `Semantic Boundary` must state important limits on what the definition owns.
- A definition may describe scientific, physical, social, legal, creative, computational, software, organizational, or mixed-domain transformations.

### Input Role Declaration

Entry Shape

- First-Level Hyphen List Item

Required Fields

- Meaning
- Minimum Count
- Maximum Count

Optional Fields

- Acquisition Policy
- Target Kind
- Schema Constraint
- Condition
- Condition Reference
- Selection Notes

Allowed Labels

- existing-only
- existing-or-create
- create-only
- invocation-provided
- derived
- artifact
- non-artifact
- unknown
- unbounded

Rules

- Entries under `## Input Roles` are repeated named declarations using this shape.
- Declaration names are role names and must be unique within `## Input Roles`.
- `Minimum Count` must be zero, a positive integer, or `unknown`.
- `Maximum Count` must be zero, a positive integer, `unbounded`, or `unknown`.
- `unbounded` means the upper bound is known to have no finite limit; it must not be used to mean an unresolved upper bound.
- `unknown` means that bound is unresolved. Tools must preserve it and must not normalize it to zero, one, or `unbounded`.
- Maximum count must not be lower than minimum count when both bounds are numeric. Numeric ordering is not inferred when either bound is `unknown` or Maximum Count is `unbounded`.
- `Acquisition Policy` is optional invocation/planning guidance; absence means this Transition Definition does not prescribe how invocation obtains members for the role.
- `Target Kind` follows the shared Target Kind Semantics below. Acquisition Policy does not determine or override participant representation class.
- Recognized acquisition labels are `existing-only`, `existing-or-create`, `create-only`, `invocation-provided`, `derived`, and `unknown`.
- `existing-only` requires an already bound/existing suitable participant when the role is required.
- `existing-or-create` allows either an existing suitable participant or satisfaction through an applicable Transition Definition capable of producing the role.
- `create-only` means the role should be satisfied through an applicable producing Transition Definition rather than by binding an already-existing participant.
- `schema.generation` may shape content, draft state, defaults, or unknowns after semantic creation is authorized, but generation semantics do not independently authorize artifact creation.
- Role names express semantics rather than positional identity.
- When neither `Condition` nor `Condition Reference` is declared, the role cardinality applies to every invocation.
- When a role condition is satisfied, that role participates and its declared cardinality applies.
- When a role condition is not satisfied or is not applicable, that role does not participate for that invocation and its `Minimum Count` does not independently make the invocation invalid.
- When the role condition is unknown, unavailable, or not evaluated, role participation and any cardinality-dependent applicability remain unresolved; planner/runtime must not guess that the role is required or absent.
- Role conditions follow the shared Condition Binding Semantics below.
- The literal entry `none` is allowed only as the sole `## Input Roles` entry and is exempt from declaration fields.

### Output Role Declaration

Entry Shape

- First-Level Hyphen List Item

Required Fields

- Meaning
- Minimum Count
- Maximum Count

Optional Fields

- Target Kind
- Schema Constraint
- Generation Binding
- Selection Notes

Allowed Labels

- target-schema
- artifact
- non-artifact
- unbounded
- none
- unknown

Rules

- Entries under `## Output Roles` are repeated named declarations using this shape.
- Declaration names are role names and must be unique within `## Output Roles`.
- `Minimum Count` must be zero, a positive integer, or `unknown`.
- `Maximum Count` must be zero, a positive integer, `unbounded`, or `unknown`.
- `unbounded` means the upper bound is known to have no finite limit; it must not be used to mean an unresolved upper bound.
- `unknown` means that bound is unresolved. Tools must preserve it and must not normalize it to zero, one, or `unbounded`.
- Maximum count must not be lower than minimum count when both bounds are numeric. Numeric ordering is not inferred when either bound is `unknown` or Maximum Count is `unbounded`.
- Cardinality does not imply Create, Edit, Split, Merge, Preserve, Consume, or another lifecycle effect.
- `Target Kind` follows the shared Target Kind Semantics below and does not imply lifecycle, materialization, placement, generation, or completeness.
- `Generation Binding`, when present, is the single output-specific reference to generation semantics for this role. Transition-level Authoring Bindings must not override it.
- `Generation Binding: target-schema` means use the generation / Artifact Creation Contract semantics owned by the schema identified by this role's `Schema Constraint`.
- An explicit Generation Binding other than `target-schema` must be a resolvable Markdown reference to the schema or contract that owns those generation semantics; arbitrary descriptive prose is not a machine-resolvable Generation Binding.
- When `Generation Binding` is absent, this Transition Definition does not prescribe generation semantics for that output role.
- `Generation Binding: target-schema` is unresolved when `Schema Constraint` is absent/unresolved or when the target schema exposes no resolvable generation/creation authority; tools must not invent one.
- Output completeness is owned by the target schema / referenced generation semantics. It may remain unknown or incomplete when those authorities permit a legitimate draft, and Transition Definition does not add a second completeness expectation field.
- The literal entry `none` is allowed only as the sole `## Output Roles` entry and is exempt from declaration fields.

### Target Kind Semantics

Applies To

- Input Role Declaration
- Output Role Declaration

Allowed Labels

- artifact
- non-artifact
- unknown

Rules

- `Target Kind` classifies participant representation/binding semantics for planning. It does not name the participant's scientific, social, legal, software, or other domain type.
- `artifact` means the role binds Tiinex Artifact participant(s). Such participants are eligible for canonical artifact-index lookup/binding when the role's Acquisition Policy and invocation context permit it; `artifact` does not by itself assert that a suitable artifact exists or is applicable.
- For `artifact`, `Schema Constraint` may further restrict which Tiinex Artifact schemas qualify. Absence of `Schema Constraint` leaves the artifact schema class unconstrained within Tiinex Artifacts; it does not permit arbitrary non-artifact values.
- `non-artifact` means the role binds participant(s) that are not represented/bound as Tiinex Artifacts for this role. A runtime must not satisfy such a role merely by finding an Artifact with a compatible title, value, label, or UI context; the role's invocation/reference/value/resource authority determines its concrete binding.
- `unknown` means participant representation class is unresolved. Tools must preserve this unknown and must not guess artifact/non-artifact classification.
- `Acquisition Policy` is orthogonal to Target Kind. In particular, `invocation-provided` may bind either an Artifact participant or a non-artifact participant.
- A fully resolved role must have deterministic participant classification either through explicit `Target Kind` or through a resolvable `Schema Constraint`/authority that normatively determines the participant representation class.
- When both explicit `Target Kind` and a resolvable normative `Schema Constraint`/authority determine participant representation, they must agree. If they disagree, the role contains contradictory participant-classification truth: neither authority silently overrides the other, participant classification is unresolved/invalid for execution, and a fully resolved Transition Definition cannot retain the contradiction.
- An unresolved `Schema Constraint`/authority is not itself a contradiction with an explicit Target Kind. The explicit participant representation may remain known while the unresolved schema restriction remains unresolved.
- A resolvable schema constraint determines `artifact` only when that authority actually declares an Artifact contract; a schema-like name, path, label, role name, acquisition mode, UI context, or naming heuristic is not sufficient evidence.
- If neither explicit Target Kind nor a resolvable normative authority determines participant representation, the role's Target Kind remains unresolved and applicability/planning that depends on that classification remains unresolved.
- Artifact-index lookup must not be attempted solely because a role has `Schema Constraint`, `existing-only`, `existing-or-create`, `invocation-provided`, or an artifact-looking human label; classification must first resolve to `artifact`.
- Output Target Kind uses the same representation classes. `artifact` outputs are Tiinex Artifact participants; `non-artifact` outputs are semantic results/state not represented as Tiinex Artifacts for that role; `unknown` remains unresolved.
- Output Target Kind does not imply `create-new`, file materialization, placement, generation semantics, or completeness. Those remain owned by Lifecycle Effect, Output Placement, Generation Binding, and target/generation contracts respectively.
- A domain concept may legitimately use different Target Kinds in different definitions. For example, a person may be represented as a Tiinex Artifact in one role and as a non-artifact external identity/reference in another; `person` itself is not a Target Kind binding class.

### Lifecycle Effect Declaration

Entry Shape

- First-Level Hyphen List Item

Required Fields

- Target Binding
- Effect

Optional Fields

- Result Binding
- Logical Continuity
- Effect Meaning
- Required Materialization Operation
- Preserve Why
- Member Mapping
- Mapping Key
- Mapping Meaning
- Condition
- Condition Reference
- Notes

Allowed Labels

- create-new
- revise-current
- preserve
- supersede
- retire
- domain-consume
- remove-materialization
- custom
- unknown
- new-subject
- preserve-subject
- no-subject-effect
- create
- revise
- delete
- move
- tombstone
- restore
- single
- broadcast
- pairwise
- all-to-all
- by-key
- explicit-at-invocation

Rules

- Entries under `### Lifecycle Effects` are repeated lifecycle declarations using this shape.
- Declaration names must be unique within the lifecycle declaration set.
- `Target Binding` must resolve to a declared Input Role or Output Role.
- `Result Binding`, when present, must resolve to a declared Input Role or Output Role and is used when an affected participant maps to a separately declared resulting representation or entity.
- A semantic participant that already exists outside the definition still participates through an Input Role; S1 defines no hidden third participant-binding class.
- Lifecycle effects may target inputs without requiring an output artifact.
- `Effect` recognized labels are `create-new`, `revise-current`, `preserve`, `supersede`, `retire`, `domain-consume`, `remove-materialization`, `custom`, and `unknown`.
- `create-new` means the target output is introduced as a newly created transition result rather than a revision of an already bound current representation.
- `revise-current` means an existing bound logical subject is revised into the declared result/current representation; `Result Binding` should identify the resulting role when it differs from `Target Binding`.
- `preserve` means this Transition Definition declares no lifecycle-state change for the targeted participant.
- `supersede` means the targeted participant ceases to be the current/active semantic result in favor of a declared replacement/result; when the replacement is a separate role, `Result Binding` must identify it.
- `retire` means the targeted participant becomes inactive/retired without by itself asserting physical deletion or a replacement.
- `domain-consume` means the participant is consumed under domain semantics; it does not automatically mean physical deletion or loss of provenance/history.
- `remove-materialization` means the active materialized representation is intentionally removed where the mechanism supports that effect; it does not by itself erase logical continuity, provenance, or history.
- `custom` means lifecycle semantics are intentionally outside the recognized S1 labels and requires `Effect Meaning`.
- `unknown` means the lifecycle effect itself is unresolved and must not be guessed into a recognized effect.
- `Effect Meaning`, when present, is a readable explanation of the declared lifecycle effect. It is REQUIRED when `Effect` is `custom`.
- `Logical Continuity` recognized labels are `new-subject`, `preserve-subject`, `no-subject-effect`, and `unknown`.
- `new-subject` means the effect/result introduces a logically distinct artifact/subject rather than continuing the same logical subject.
- `preserve-subject` means the same logical artifact/subject continues across the effect even if its concrete representation or integrity fingerprint changes.
- `no-subject-effect` means this lifecycle declaration does not assert a logical-subject identity/continuity relationship.
- `unknown` means logical continuity is unresolved and must remain unresolved.
- `Logical Continuity` supplements lifecycle meaning and must not contradict `Effect`; contradictory combinations make the definition unresolved rather than creating implicit precedence.
- `Required Materialization Operation` is the single transition-definition authority for the requested mechanism operation. Recognized S1 labels are `create`, `revise`, `delete`, `move`, `tombstone`, and `restore`; explicit extensions are allowed when their meaning is declared elsewhere.
- `Member Mapping` is required when multiplicity in `Target Binding` / `Result Binding` would otherwise make the member association ambiguous.
- `Condition` / `Condition Reference` may condition this lifecycle effect according to the shared condition-binding rules below.
- `revise-current` may preserve logical artifact continuity while changing the concrete representation and its content-derived integrity fingerprint.
- `domain-consume` does not automatically mean physical deletion.
- Unsupported materialization operations must not be silently substituted with a different lifecycle effect.
- `Preserve Why`, when present, uses `yes`, `no`, or `unknown`.
- Placement preservation is not a Lifecycle Effect field; placement is owned by Output Placement `Placement Intent`.
- In a fully resolved Transition Definition, every declared Output Role must be covered by at least one applicable Lifecycle Effect through `Target Binding` or `Result Binding` so output lifecycle is not inferred from cardinality.
- Conditional alternative lifecycle effects may provide that coverage. If their conditions leave an output's lifecycle unresolved/gapped for an invocation, lifecycle coverage remains unresolved rather than defaulting to `create-new`, `preserve`, or another effect.
- S1 defines no implicit lifecycle-effect precedence or composition. If different lifecycle effects can apply simultaneously to the same concrete participant and their meanings conflict, the definition is unresolved unless the conflict is removed or separately modeled.
- Input Roles do not require Lifecycle Effects merely because they participate. Absence of an input-targeted Lifecycle Effect means this Transition Definition declares no lifecycle mutation of that input.
- The literal entry `none` is allowed only as the sole `### Lifecycle Effects` entry when no lifecycle effect is intended and is exempt from declaration fields.

### Parent Effect Declaration

Entry Shape

- First-Level Hyphen List Item

Required Fields

- Output Binding
- Effect

Optional Fields

- Parent Binding
- Member Mapping
- Mapping Key
- Mapping Meaning
- Condition
- Condition Reference
- Notes

Allowed Labels

- set
- preserve
- clear
- replace
- unknown
- single
- broadcast
- pairwise
- by-key
- explicit-at-invocation
- custom

Rules

- Entries under `### Parent Effects` are repeated Parent Effect declarations using this shape.
- Declaration names must be unique within `### Parent Effects`.
- `Output Binding` must resolve to a declared Output Role.
- `Parent Binding` must resolve to a declared Input Role or Output Role that is eligible to serve as the direct continuity parent when `Effect` is `set` or `replace`.
- `Member Mapping` is required when multiplicity would otherwise make output-to-Parent assignment ambiguous.
- Parent remains singular direct continuity ancestry: mapping must resolve to at most one direct Parent per concrete output artifact.
- `broadcast` may map one concrete Parent to multiple outputs, or many candidate outputs to one Parent binding, only when each output still resolves to at most one direct Parent.
- `all-to-all` is not a recognized Parent Effect mapping because it can assign multiple direct Parents to one output.
- `Condition` / `Condition Reference` may condition this Parent effect according to the shared condition-binding rules below.
- Parent must not be used to represent all inputs, generic derivation, provenance, storage location, or path.
- Ordinary Edit should preserve Parent unless the definition intentionally changes continuity structure.
- The literal entry `none` is allowed only as the sole `### Parent Effects` entry when no Parent effect is intended and is exempt from declaration fields.

### Relation Effect Declaration

Entry Shape

- First-Level Hyphen List Item

Required Fields

- Effect
- Subject Binding
- Predicate Identifier
- Predicate Meaning
- Object Binding
- Directionality

Optional Fields

- Predicate Label
- Predicate Vocabulary
- Predicate Authority
- Condition
- Condition Reference
- Inverse Predicate Identifier
- Member Mapping
- Mapping Key
- Mapping Meaning
- Notes

Allowed Labels

- declare
- remove
- preserve
- unknown
- directed
- undirected
- bidirectional
- single
- broadcast
- pairwise
- all-to-all
- by-key
- explicit-at-invocation
- custom

Rules

- Entries under `## Relation Effects` are repeated named declarations using this shape.
- Declaration names must be unique within `## Relation Effects`.
- `Subject Binding` and `Object Binding` must resolve to declared Input Roles or Output Roles.
- Input-to-output, input-to-input, output-to-output, and output-to-input relation effects are legal.
- An existing external/current entity that participates semantically must be declared as an Input Role rather than referenced through an undefined third participant class.
- `Predicate Identifier` is the stable machine-facing semantic key within its declared vocabulary or authority.
- When neither `Predicate Vocabulary` nor `Predicate Authority` is supplied, `Predicate Identifier` is local to the exact defining Transition Definition artifact/version. `Canonical Identifier` plus `Version` is its local semantic key inside that defining artifact, but those text values alone are not asserted globally unique across independent origins.
- A locally scoped predicate exported or materialized outside this Transition Definition context must carry a resolvable reference/authority for the exact defining Transition Definition artifact/version together with the local Predicate Identifier. Ordinary Tiinex references, continuity references, or source/permalink references may provide that scope where available.
- A bare local identifier/label, or merely matching `Canonical Identifier` + `Version` strings from unrelated definitions, is not portable predicate identity.
- If predicate identity must remain portable independently across Transition Definition versions/origins, declare an explicit `Predicate Vocabulary` or `Predicate Authority` rather than relying on local scope.
- `Predicate Meaning` must keep the edge understandable when the vocabulary cannot be resolved.
- `Predicate Label` is presentation only and is not predicate identity.
- `Predicate Vocabulary` or `Predicate Authority` may identify Tiinex, scientific, standards-based, domain, schema-local, or external semantic authority.
- `Directionality` is required and must be `directed`, `undirected`, or `bidirectional`.
- `Inverse Predicate Identifier`, when present, resolves in the same predicate scope unless it is explicitly qualified by another declared authority.
- `Member Mapping` is required when subject/object multiplicity would otherwise make concrete edge assignment ambiguous.
- Role cardinality owns participant multiplicity; Member Mapping owns how those concrete members form edges. Relation Effect does not add a second minimum/maximum count authority.
- `replace` is not a recognized Relation Effect operation; relation replacement is expressed as an explicit `remove` effect plus an explicit `declare` effect.
- `Condition` / `Condition Reference` may condition this relation effect according to the shared condition-binding rules below.
- Unknown predicates must be preserved and must not be normalized into a vague generic relation merely because labels look similar.
- Relation Effects do not implicitly create Relation Artifacts.
- When a relation instance deserves independent artifact ownership, declare that artifact through an ordinary Output Role and its normal generation, lifecycle, and placement semantics.
- Direct continuity ancestry uses Parent Effects, not a generic relation predicate.
- The literal entry `none` is allowed only as the sole `## Relation Effects` entry and is exempt from declaration fields.

### Member Mapping Semantics

Allowed Labels

- single
- broadcast
- pairwise
- all-to-all
- by-key
- explicit-at-invocation
- custom
- unknown

Rules

- Member Mapping is required only when multiplicity would otherwise make a Lifecycle, Parent, or Relation effect ambiguous.
- `single` means all bindings relevant to the effect resolve unambiguously to one concrete member where an association is required.
- `broadcast` means exactly one side of the effect association resolves to one concrete member and that member is associated with every relevant member on the other side; the effect's named bindings determine which semantic roles participate.
- `pairwise` means a complete one-to-one association over the concrete members participating in the owning effect. Every participating concrete member on either paired side appears in exactly one explicit pair. Pairing must never be inferred from list, declaration, or index order.
- If an effect intentionally uses an irregular or partial association, use `explicit-at-invocation`, `custom`, or bind only the intended participant subset before applying the effect; `pairwise` must not silently omit members.
- `all-to-all` means the Cartesian association is intentional. It is legal only for effect types whose own semantics permit it and is not legal for Parent Effects.
- `by-key` means concrete members are matched through `Mapping Key`. Missing, duplicate, or unresolved keys remain unresolved and must never fall back to positional order.
- `explicit-at-invocation` means invocation supplies the exact association set.
- `custom` requires `Mapping Meaning`; a runtime that cannot understand it must preserve the declared semantics and must not claim deterministic execution.
- `unknown` means association is explicitly unresolved.
- A mapping declaration must operate only over bindings explicitly named by the owning effect; it must not introduce hidden positional participants.

### Condition Binding Semantics

Applies To

- Input Role Declaration
- Lifecycle Effect Declaration
- Parent Effect Declaration
- Relation Effect Declaration
- Applicability And Conditions

Rules

- `Condition` alone is a local readable semantic condition.
- `Condition Reference` alone points to separately owned Condition semantics, which remain semantic authority.
- When both appear, `Condition Reference` remains semantic authority and local `Condition` is only a readable restatement or context note; it must not independently narrow, alter, or compose the referenced semantics.
- A genuinely different or narrower condition must be represented by the appropriate separately owned Condition semantics rather than hidden prose composition.
- Unknown condition state remains unknown; no implicit `else` branch is created.
- For an Input Role, no condition means its cardinality always applies; a satisfied condition activates the role and its cardinality; an unsatisfied/not-applicable condition removes that role from the invocation for that condition state; an unknown/unavailable/not-evaluated condition leaves role participation and cardinality-dependent applicability unresolved.

### Applicability And Conditions

Required Fields

- Applicability Meaning

Optional Fields

- Condition
- Condition Reference
- Failure Meaning
- Unknown Meaning

Rules

- Transition applicability is distinct from artifact completeness.
- Required role participation is derived from declared Input Role cardinality after role-local conditions are resolved; `Applicability And Conditions` does not introduce a second required-role authority.
- Transition-level conditions and concrete invocation bindings combine with role cardinality to determine applicability. A missing participating role whose resolved `Minimum Count` requires members may make invocation inapplicable.
- If applicability depends on an `unknown` cardinality bound or an unknown/unavailable condition, applicability remains unresolved rather than being guessed applicable or inapplicable.
- Required-for-completeness output fields may remain unknown when creation is still semantically legitimate under the referenced generation/target contract.
- Unknown condition state must remain unknown rather than being guessed true or false.
- Condition references should preserve readable semantic meaning even when no runtime can execute them.

### Authoring Bindings

Optional Fields

- Interaction Unit
- Schema Module
- Presentation Surface
- Authoring Notes

Rules

- Output Role `Generation Binding` owns generation semantics for that particular output role.
- Transition-level Authoring Bindings may reference interaction, module, presentation, or readable orchestration guidance, but they must not define, override, or silently default an Output Role's generation semantics.
- Transition Definition must not encode React components, wizard page order, one Verse's UI, or another framework-specific authoring flow as semantic truth.
- Different presentation surfaces may project different interactions over the same Transition Definition without changing its semantics.
- A literal first-level entry `none` may be used when no authoring binding is needed.

### Destination Binding Declaration

Entry Shape

- First-Level Hyphen List Item

Required Fields

- Meaning

Optional Fields

- Required
- Destination Kind
- Capability Requirement
- Notes

Rules

- Entries under `### Destination Bindings` are named reusable destination slots using this shape.
- Declaration names must be unique within the destination-binding set.
- A Transition Definition declares the destination slot; one invocation supplies the concrete destination value.
- Multiple Output Placements may reference the same Destination Binding so an entire result molecule can use one selected root or destination.
- `Required`, when present, uses `yes`, `no`, or `unknown`.
- Definition origin and input origins do not satisfy a Destination Binding by implication.
- In a fully resolved definition, each Destination Binding with `Required: yes` must be referenced by at least one Output Placement. A required but unused destination slot is unresolved/invalid rather than an instruction to ask for an unrelated destination.
- The literal entry `none` is allowed only as the sole `### Destination Bindings` entry when no destination binding is needed and is exempt from declaration fields.

### Output Placement Declaration

Entry Shape

- First-Level Hyphen List Item

Required Fields

- Output Binding
- Placement Intent

Optional Fields

- Destination Binding
- Naming Authority
- Naming Authority Reference
- Relative To Binding
- Relative Placement Meaning
- Explicit Override Allowed
- Notes

Allowed Labels

- preserve-current
- new-materialization
- no-materialization
- unknown
- target-schema
- explicit-binding
- external-authority

Rules

- Entries under `### Output Placements` are repeated Output Placement declarations using this shape and declaration names must be unique within `### Output Placements`.
- `Output Binding` must resolve to a declared Output Role. `Result Binding` in a Lifecycle Effect is only a reference to a declared role and does not create another Output Binding namespace.
- `Destination Binding`, when present, must resolve to a declared Destination Binding.
- Multiple outputs may share one Destination Binding.
- `Placement Intent` is the single semantic placement axis for the output. Recognized labels are `preserve-current`, `new-materialization`, `no-materialization`, and `unknown`.
- `preserve-current` means preserve the current placement of the logically continued/revised subject represented by this output; it must not be used when no current placement can be resolved.
- `new-materialization` means the output requires a new placement under the bound/resolved destination; concrete path selection still belongs to the resolver/planner.
- `no-materialization` means the definition requires no physical/persisted output placement for this output role. It does not change lifecycle semantics by itself.
- `unknown` means output placement semantics are unresolved and must not be guessed.
- Destination requiredness is owned by `Destination Binding -> Required`; explicit override policy is owned by `Explicit Override Allowed`. Neither is encoded again inside `Placement Intent`.
- Placement owns destination and relative-placement constraints only; it must not duplicate the Lifecycle Effect's required materialization operation.
- `Naming Authority: target-schema` means use the File Naming authority declared by the schema identified by the Output Role's `Schema Constraint`. If that schema or naming contract is unresolved/unavailable, naming remains unresolved.
- `Naming Authority: explicit-binding` means invocation supplies the concrete naming value/segment for this Output Placement declaration according to the destination/placement contract; it does not create another reusable semantic binding namespace.
- `Naming Authority: external-authority` requires `Naming Authority Reference`, which must be a resolvable Markdown reference to the external schema/contract/authority that owns naming semantics.
- `Naming Authority: unknown` means naming authority is unresolved and must remain unresolved.
- `Naming Authority Reference` must not be used as a substitute for a Destination Binding and does not determine semantic identity.
- `Relative To Binding` may resolve to a declared Input Role or Output Role and express relative placement without turning that relation into Parent. An external/current container used for relative placement must participate through an Input Role rather than an undeclared container-binding class.
- Concrete path resolution belongs to a resolver/planner at invocation time.
- `Explicit Override Allowed`, when present, uses `yes`, `no`, or `unknown`.
- If naming or destination cannot be resolved truthfully, tools must expose unresolved placement or require explicit binding rather than invent a path.
- The literal entry `none` is allowed only as the sole `### Output Placements` entry when no output placement is intended and is exempt from declaration fields.

### Placement Intent

Required Shape

- `### Destination Bindings` subsection
- `### Output Placements` subsection

Rules

- Each required subsection contains one or more named declarations or the literal sole entry `none`.
- Destination Binding and Output Placement declaration names must be distinguishable and unique within their respective declaration sets.
- One invocation may bind a destination once and reuse it for multiple outputs.
- Transition Definition storage origin, concrete input origins, and output destinations are independent.
- Parent is not path and Origin is not path.

### Binding Resolution

Rules

- Semantic participant references (`Target Binding`, `Result Binding`, `Parent Binding`, `Subject Binding`, and `Object Binding`) must resolve to declared Input Roles or Output Roles as allowed by their local contract. `Output Binding` must resolve to a declared Output Role. S1 defines no other semantic participant or mapped-result declaration class.
- `Destination Binding` references resolve only to declared Destination Bindings and remain placement-only.
- `Relative To Binding` resolves to a declared Input Role or Output Role allowed by Output Placement and does not create a Parent by itself.
- Unresolved required bindings are invalid for a fully resolved definition and must remain visibly unresolved during draft authoring rather than being guessed.
- Duplicate declaration names are invalid unless a future explicit override contract defines otherwise.

### File Naming

Allowed Shapes

- `<transition-slug>-transition-definition.trace.md`
- `<lineage>-<transition-slug>.trace.md`

Rules

- Transition Definition artifacts should use a slug that identifies the reusable transformation.
- Registry-like reusable definitions may use `<transition-slug>-transition-definition.trace.md`.
- Lineage-first definitions may use `<lineage>-<transition-slug>.trace.md` when they continue an ordinary local lineage.
- File naming is placement guidance only; it is not Transition Definition semantic identity or invocation identity.
- A Transition Definition's filename or origin must not determine output paths.
- Output target schemas retain their own File Naming authority where declared.
- S1 introduces no `.transition.md` extension.

### Interpretation Limits

Required Fields

- Does Not Prove
- Must Not Be Inferred

Optional Fields

- Execution Boundary
- Authorization Boundary
- Completeness Boundary
- Validation Boundary
- Materialization Boundary
- Remaining Unknowns

Rules

- A Transition Definition alone does not prove invocation occurred, code executed, an output exists, an output is complete, an output is valid, a source was mutated, an actor was authorized, an adapter capability exists, a relation was materialized, Parent changed, execution succeeded, or a receipt/event exists.
- Definition semantics and execution/materialization truth must remain separate.

## Artifact Creation Contract

### Creation Scope

Required Fields

- Create When
- Do Not Create When

Rules

- Create a `tiinex.transition.definition.v1` artifact when a reusable transformation needs portable semantic ownership across humans, LLMs, tools, runtimes, or domains.
- Do not create a Transition Definition merely for a one-off occurrence that has no reusable transformation semantics.
- Do not create a separate Transition Definition merely to encode one UI button label when the actual behavior is already owned by another definition.

### Required Inputs

Required Fields

- Name
- Version
- Canonical Identifier
- Purpose
- Semantic Boundary
- Input Roles
- Output Roles
- Lifecycle And Continuity Effects
- Relation Effects
- Applicability Meaning
- Placement Intent
- Interpretation Limits

Optional Fields

- Transition Family
- Authoring Bindings
- Conditions
- Related Definitions

Rules

- Intentional zero roles/effects must be explicit as `none` in required repeated-declaration sections.
- Unknown values must remain unknown rather than being invented.
- Creation of a Transition Definition does not invoke it.

### Generation Rules

Rules

- Name semantic roles before choosing presentation labels.
- State cardinality separately from lifecycle.
- Resolve participant representation (`Target Kind`) independently from domain meaning and acquisition guidance; do not infer Artifact-index eligibility from labels or UI context.
- State participant lifecycle effects separately from relation and placement effects.
- Keep required materialization operation only in Lifecycle Effects.
- Use Parent Effects only for direct continuity ancestry.
- Bind output-specific generation semantics through each Output Role `Generation Binding`; reuse existing interaction, module, and presentation contracts for transition-level authoring without duplicating or overriding output generation authority.
- In a fully resolved definition, each declared Output Role must have applicable lifecycle coverage. Do not infer output lifecycle from cardinality, Generation Binding, Placement Intent, or UI labels.
- Generation semantics may shape content after a Transition Definition authorizes creation, but generation does not independently authorize semantic artifact creation.
- Keep definition origin, input origins, and invocation destination independent.
- Add interpretation limits before treating the definition as ready for use.
