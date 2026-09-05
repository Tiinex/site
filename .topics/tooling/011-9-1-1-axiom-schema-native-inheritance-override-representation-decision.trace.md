# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-04 11:11:37
  - Trace: [011-9-1-anchor-to-axiom-schema-native-inheritance-override-handoff.trace.md](011-9-1-anchor-to-axiom-schema-native-inheritance-override-handoff.trace.md)
  - Origin:
    - [relative](011-9-1-anchor-to-axiom-schema-native-inheritance-override-handoff.trace.md)
- Current
  - Current Schema: tiinex.decision.v1
  - Created At: 2026-09-04 11:19:10
  - Authors: Axiom
  - Why: Keep explicit fail-closed inheritance semantics inside canonical child schemas by default while preserving standalone inheritance artifacts only for intentional first-class records.
  - Summary: Axiom accepts one Root-owned inline Inheritance Overrides contract category as the canonical schema-local override authority, retiring loose Evidence companion dependency from the forward factory candidate.
  - Status: ready/local

---

# Schema-Native Inheritance Override Representation Decision

The forward factory should keep inheritance override authority inside canonical schema contracts by default. A standalone inheritance artifact remains useful only when the inheritance relationship itself needs an independent artifact lifecycle, provenance, audit, or migration record.

## Decision

- State: accepted.
- Subject: minimum canonical machine representation for explicit inherited structural override without loose schema companion files.
- Canonical owner: `tiinex.root.v1` must own one generic machine-contract category named `Inheritance Overrides`; child schemas may declare that category inside their own `Schema Validation Contract`.
- Root syntax change: add exact category label `Inheritance Overrides` to `Contract Syntax -> Known Category Labels`, and define its machine semantics once in Root rather than in Viewer, Site bindings, directory conventions, or schema-specific code.
- Declaration shape: `Inheritance Overrides` uses `Entry Shape: Named Declaration` with required declaration fields `Merge Operation`, `Parent Schema`, `Parent Node`, and `Child Node`; optional declaration fields are `Reason` and `Effective Result`.
- Operation boundary: for this qualified version, `Merge Operation` must be exactly `override`. Additive inheritance remains Root's default; this decision does not introduce generic `child-wins`, `parent-wins`, `refine`, `deprecate`, `forbid`, `rename`, or `migrate` execution through the inline category.
- Child identity: the child schema is the canonical schema that contains the declaration. No separate `Child Schema` field is required because duplicating the containing schema identity would create a mismatch surface without adding authority.
- Node addressing: `Parent Node` and `Child Node` each identify one exact machine-contract path of the form `Schema Validation Contract / <third-level group> / <category label>`. The parent schema must resolve to an actual ancestor of the declaring child in the active schema lineage; the parent contribution and child contribution must each resolve exactly once.
- Fail-closed behavior: unresolved lineage, non-ancestor parent, zero or multiple node matches, unsupported operation, malformed declaration, or competing active declarations for the same exact parent contribution make inheritance resolution unresolved/error. Source order, filename order, directory adjacency, prose wording, and schema identity must never choose a winner.
- Override effect: a qualified declaration deactivates only the exact addressed parent contribution and activates the exact addressed child replacement contribution while retaining source-schema and declaration provenance for both.
- Structural Required Shape rule: when the addressed parent and child nodes are both `Required Shape` contributions and their machine-readable items identify exact second-level body headings, Root-owned generic inheritance interpretation may also deactivate parent ordinary instance-field groups contributed by that same parent schema whose Root-authorized target heading is required by the overridden parent shape but absent from the child replacement shape. Parent ordinary groups targeting headings still present in the child replacement remain additive and provenance-preserving. If the heading set or target ownership cannot be resolved exactly, the override is unresolved rather than guessed.
- Evidence proving case: `tiinex.evidence.v1` should carry the following declaration inside `Schema Validation Contract -> Parent Preservation Specialization`:

```text
Inheritance Overrides

- evidence-preservation-body-structure
  - Merge Operation: override
  - Parent Schema: tiinex.preservation.v1
  - Parent Node: Schema Validation Contract / Preservation Body / Required Shape
  - Child Node: Schema Validation Contract / Evidence Body / Required Shape
  - Reason: Evidence specializes Preservation by replacing only the generic Preservation artifact-body structure while retaining compatible non-structural Preservation semantics and provenance.
  - Effective Result: Evidence body structure is authoritative for Evidence artifacts; parent-only structural body groups become inactive, while compatible parent contributions targeting surviving Evidence sections remain active.
```

- Evidence structural result: the active required body headings remain `Supported Claim Or Question`, `Provenance`, `Evidence Material`, `Preservation And Fidelity`, and `Interpretation Limits`. Parent structural ordinary groups `Preserved Material`, `Preservation Act`, `Fidelity And Loss`, and `Custody Or Storage Boundary` become inactive for Evidence because their exact parent-required target headings are absent from the child replacement shape. Parent contributions targeting surviving `Provenance` and `Interpretation Limits` remain additive with provenance, matching the already-qualified factory meaning.
- Standalone inheritance artifacts: `tiinex.schema.inheritance.v1` remains the canonical schema for a first-class inheritance record when the merge relationship itself needs independent provenance, lifecycle, review, migration, or audit. It must not be an implicit schema-compilation dependency merely because such an artifact exists beside a schema.
- Authority precedence: for schema-local compilation, the inline `Inheritance Overrides` declaration in the child schema is canonical. A standalone `tiinex.schema.inheritance.v1` artifact may document, propose, test, or audit that declaration, but cannot silently add or change schema semantics. If both exist and disagree, tooling reports the mismatch; it does not apply source-order or companion precedence.
- Inheritance schema clarification: canonical `tiinex.schema.inheritance.v1` should be minimally refined so its Creation Scope no longer implies that every schema override requires a standalone artifact. It should state that standalone creation is appropriate only when independent inheritance-record semantics are needed, while schema-local compilation authority comes from Root-owned inline `Inheritance Overrides` declarations.
- Root remains abstract. This category is contract-compilation authority only and does not make Root manually creatable, concrete, transition-bearing, or an artifact-instance schema for inheritance records.
- Transition, relation, module, presentation, finding, and other companion authority remain separate and asymmetric. This decision does not approve `.relations` or any other companion family for Docs.

## Basis

- Root already requires explicit override semantics, exact identification of the inherited requirement being replaced, additive inheritance by default, and fail-visible behavior when override authority is missing. The missing piece is a schema-local machine representation, not a new inheritance ontology.
- The current `tiinex.schema.inheritance.v1` companion proves the intended Evidence-over-Preservation merge but makes schema compilation depend on a separate artifact and a Site binding list. Scaling that representation would normalize helper files beside schemas and create unnecessary catalog and Builder debt.
- A Root-owned category is the smallest reusable authority because every descendant schema already inherits Root contract syntax. It avoids a new top-level schema-note section, avoids Parent-envelope misuse, avoids a Viewer/Site private metadata seam, and does not require every child to create a companion artifact.
- Reusing exact `Parent Node` and `Child Node` addressing preserves the already-qualified semantics and compiler behavior. The Evidence case remains one explicit Required Shape override with deterministic structural deactivation rather than child-wins ordering or prose interpretation.
- Keeping standalone `tiinex.schema.inheritance.v1` for independent records preserves that schema's legitimate use without allowing two competing sources of schema truth. The same distinction already applies elsewhere in Tiinex: a concept may have a first-class artifact form without every schema needing a companion instance of it.
- Future Schema Builder support becomes simpler: the Builder can read and author `Inheritance Overrides` from the same canonical child schema contract it already edits, while still offering separate inheritance-record artifacts when a user intentionally needs audit or migration documentation.

## Consequences

- Loom should update shared Root contract parsing/compilation to recognize `Inheritance Overrides` as one generic category and project each qualified declaration with source child schema, declaration name, parent schema, parent node, child node, operation, active/inactive contribution provenance, and resolution findings.
- Loom should migrate Evidence by adding the exact inline declaration to the canonical Evidence schema snapshot/candidate, remove the forward `inheritanceCompanions` dependency from `src/schemas/core/evidence/tiinex.evidence.v1.schema.json`, and stop requiring `tiinex.evidence.v1-preservation-body.inheritance.trace.md` for factory compilation.
- The loose Evidence inheritance companion should be retired from the forward factory candidate as semantic input. It may remain in historical/local evidence where preservation is useful, but it should not be copied into canonical Docs or treated as required runtime authority.
- Loom should refine the canonical `tiinex.schema.inheritance.v1` wording narrowly enough to distinguish standalone inheritance records from inline schema-compilation authority; no broad redesign of that schema is authorized.
- Conformance must prove the inline declaration yields the same active/inactive Evidence contribution set and provenance as the current qualified companion-based implementation, then prove deleting the binding/companion from the forward candidate does not change the qualified descriptor.
- Conformance must also prove malformed, ambiguous, non-ancestor, duplicate, or missing-node inline overrides fail closed, and that schemas without `Inheritance Overrides` remain purely additive.
- Builder-readiness projection should expose the inline declarations directly from the compiled shared descriptor; Builder must not reverse-engineer them from renderer behavior or generate a companion file merely to make the override executable.
- No remote Docs mutation, publication, deletion, merge, or deployment is authorized by this Decision. Anchor should route the bounded implementation to Loom, rerun the four-schema factory/Viewer gates, and only then regenerate Sigma acceptance material from the cleaned candidate.

## Review Conditions

- Re-review if exact node addressing cannot be implemented without schema-specific logic, or if Root contract parsing cannot preserve declaration and contribution provenance.
- Re-review if a future use case requires inline operations beyond exact `override`; do not silently broaden this category to the full standalone inheritance operation vocabulary.
- Re-review if canonical Docs governance rejects adding one Root contract category; the fallback must still be schema-native and machine-readable, not a return to directory-adjacent companion inference.
- Factory acceptance remains separate and requires the cleaned representation to pass the existing shared conformance and Sigma product-acceptance gates.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [011-9-1-anchor-to-axiom-schema-native-inheritance-override-handoff.trace.md](011-9-1-anchor-to-axiom-schema-native-inheritance-override-handoff.trace.md)
  - Value: -dLQ4t9sYaEW3jkGhWC-CezemMxFYkDVges32vHPMfk

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: 6zU6CfHy_lmTi4fXo9S_oIqcb4gGoA0JDbo1eZ4ra4s