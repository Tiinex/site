# Continuity Context

- Envelope Schema: [tiinex.root.v1](../../../tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.root.v1](../../../tiinex.root.v1.schema.md)
  - Created At: 2026-08-17 00:00:00
  - Trace: [tiinex.root.v1.schema.md](../../../tiinex.root.v1.schema.md)
  - Origin:
    - [browse + git](https://github.com/Tiinex/docs/blob/d69b8ff55a56b8cb9282b8684db6a938a4435b94/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.schema.transition.companion.v1](tiinex.schema.transition.companion.v1.schema.md)
  - Created At: 2026-08-17 00:00:00
  - Status: Draft schema proposal
  - Why: Defines explicit schema-local candidate attachments to canonical Transition Definition artifacts without copying Transition behavior or relying on application-code-only registries.
  - Summary: Portable schema-local Transition attachment companion.

---

# Schema Transition Companion

## Summary

Defines an explicit schema-local attachment set over canonical Transition Definition artifacts.

A Schema Transition Companion answers one bounded question:

```text
Which exact canonical Transition Definitions does this schema explicitly include in its local candidate semantic neighborhood?
```

It does not restate Transition roles, outputs, lifecycle, mapping, relations, placement, generation, conditions, runtime qualification, or product presentation.

## Core Semantics

- Companion = explicit schema-local candidate attachment authority.
- Transition Definition artifact = sole canonical Transition semantic truth.
- Attachment = exact reference to one Transition Definition representation.
- Attachment does not prove schema participation, applicability, execution support, UI visibility, ordering, or recommendation.
- No companion and an explicitly empty companion are different states.
- Parent/child schema ancestry does not implicitly inherit Transition attachments in v1.
- The same canonical Transition representation may be attached explicitly by multiple schema companions without duplicating the Transition Definition source.
- Paths and filenames are navigation, not Transition identity.

## Schema Validation Contract

### Schema Transition Companion Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.schema.transition.companion.v1`

Rules

- `tiinex.schema.transition.companion.v1` identifies artifacts whose main job is to declare one schema's explicit local candidate Transition attachments.
- A companion must identify exactly one schema through `Schema Reference`.
- A companion must not duplicate Transition Definition behavior fields.
- Prose outside `Schema Validation Contract` may explain attachment intent but does not add machine attachment semantics.

### Schema Transition Companion Body

Required Shape

- first body heading after the continuity envelope
- `## Schema Binding` section
- `## Transition Attachments` section
- `## Interpretation Limits` section

Rules

- `## Transition Attachments` may contain zero or more attachment declarations.
- An explicitly empty attachment set must contain one literal first-level entry named `none` and no other entries.

### Schema Binding

Required Fields

- Schema Reference

Optional Fields

- Note

Field Value Constraints

- Schema Reference
  - Allowed Shape: Markdown Link
  - Domain Policy: closed

Rules

- `Schema Reference` must resolve to exactly one schema artifact.
- The resolved target artifact, not the companion filename or directory name, determines which schema the companion binds.
- A package-internal Schema Reference should use a relative Markdown link that remains inside the declared package boundary.
- A reference that cannot resolve to exactly one schema artifact leaves the companion binding unresolved.
- Within one selected semantic package compilation, more than one companion resolving to the same exact schema artifact is competing attachment authority and must fail closed; v1 does not merge companion attachment sets implicitly.
- `Note` is human-readable context only and must not add schema or Transition semantics.

### Transition Attachment Declaration

Entry Shape

- First-Level Hyphen List Item

Required Fields

- Transition Reference

Optional Fields

- Note

Field Value Constraints

- Transition Reference
  - Allowed Shape: Markdown Link
  - Domain Policy: closed

Rules

- Entries under `## Transition Attachments` are repeated named declarations using this shape.
- The declaration name is a companion-local readability handle only and is not Transition identity.
- `Transition Reference` must resolve to exactly one artifact whose `Current -> Current Schema` is `tiinex.transition.definition.v1`.
- A package-internal Transition Reference may be relative only when its target remains inside the same declared semantic package boundary.
- An external Transition Reference must be reachable through an explicitly included/dependent package route in the active Semantic Package Manifest context; filesystem or network reachability alone is not package authority.
- A missing or unavailable exact Transition Reference remains an unresolved attachment and must not be replaced by registry-name guessing.
- An ambiguous Transition Reference fails closed.
- Two attachment entries that resolve to the same exact concrete Transition representation are duplicate attachments and invalid even if their local declaration names differ.
- Two different Transition representations that share `Canonical Identifier` and `Version` are not duplicate attachments merely because those fields match.
- The literal entry `none` is allowed only as the sole `## Transition Attachments` entry and is exempt from declaration fields.
- `Note` is non-authoritative readability context and must not restate Input Roles, Output Roles, lifecycle, effects, relations, placement, generation, conditions, product ordering, or UI presentation.

### Attachment Qualification

Rules

- Attachment declaration and Transition participation are separate truths.
- After resolving an attachment, a compiler may compare the bound schema artifact with the referenced Transition Definition's resolved role/schema authority.
- When the canonical Transition Definition explicitly and exactly references the bound schema in a participating Input Role or Output Role, the attachment is participation-consistent.
- When all relevant role/schema authority is fully resolved and definitively excludes the bound schema, the attachment remains a declared source reference but companion qualification contains a contradiction and must fail closed.
- When Transition role/schema authority is generic, unconstrained, or unresolved such that participation cannot be proven or disproven, attachment participation remains unresolved; the compiler must not invent participation.
- Schema ancestry must not be used as an implicit assignability rule when checking attachment participation.
- This qualification step must not modify or restate the Transition Definition.

### Companion Absence And Explicit Empty State

Rules

- Absence of a Schema Transition Companion means no explicit schema-local attachment authority is declared.
- Absence must not cause a compiler to infer attachments from every Transition Definition in the package registry.
- A companion whose `## Transition Attachments` contains only `none` explicitly declares an empty attachment set.
- An explicit empty attachment set is different from companion absence and should remain distinguishable in compiled provenance.
- A Transition Definition may exist in the package registry without being attached by a schema companion; registry existence does not imply attachment.
- The same Transition Definition may be explicitly attached by Topic and Task companions at the same time while remaining one canonical Transition artifact.

### Schema Inheritance Boundary

Rules

- Transition attachments do not implicitly inherit through schema Parent/descendant relationships in v1.
- A child schema with no companion does not inherit its parent's attachment set.
- A parent and child may both explicitly attach the same exact Transition Definition; both attachment declarations retain separate companion provenance.
- This schema does not authorize schema-assignability inference.

### Registry Identity And Dedupe

Rules

- Companion declaration names, paths, filenames, Transition `Canonical Identifier`, and Transition `Version` are not universal representation identity.
- Exact concrete representation sameness may support compiled dedupe only when separately provable.
- Distinct representations sharing Canonical Identifier and Version must remain distinct candidates.
- Compiled attachment projections must preserve companion source, schema binding, Transition reference, resolved representation, and package/discovery provenance.

### Interpretation Limits

Required Fields

- Does Not Mean
- Must Not Be Used To Claim

Rules

- Attachment does not prove schema participation unless canonical Transition truth independently supports that participation.
- Attachment does not prove current applicability, executability, authorization, output existence, runtime support, product visibility, recommendation, or ordering.
- The companion must not become a second Transition registry or behavior ontology.
- Product/UI projection remains outside this schema.

## Artifact Creation Contract

### Creation Scope

Required Fields

- Create When
- Do Not Create When

Rules

- Create a Schema Transition Companion when one schema needs an explicit portable candidate attachment set that should survive without application JavaScript.
- Do not create a companion merely because a Transition Definition references the schema somewhere in canonical Transition semantics.
- Do not use a companion to copy or summarize Transition behavior fields.
- Do not create implicit inherited companion behavior in v1.

### Required Inputs

Required Fields

- Schema Reference
- Transition Attachments
- Interpretation Limits

Rules

- A schema may intentionally use an empty attachment set.
- Missing or unresolved Transition references should remain explicit rather than being replaced by registry heuristics.

### Generation Rules

Rules

- Bind the companion to one exact schema artifact.
- Add one exact Transition Reference per intended candidate attachment.
- Keep human notes short and non-authoritative.
- Do not add role, lifecycle, effect, relation, placement, generation, condition, ordering, or UI fields to attachment entries.

## Minimal Example

```text
# Task Transition Companion

## Schema Binding

Schema Reference: [tiinex.task.v1](tiinex.task.v1.schema.md)
Note: Explicit Task-local candidate Transition neighborhood.

## Transition Attachments

- topic-to-task
  - Transition Reference: [Topic to Task](.transitions/topic-to-task-transition-definition.trace.md)
  - Note: Candidate attachment only; canonical Transition Definition owns behavior.

- finding-to-task
  - Transition Reference: [Finding to Task](.transitions/finding-to-task-transition-definition.trace.md)

- issue-to-task
  - Transition Reference: [Issue to Task](.transitions/issue-to-task-transition-definition.trace.md)

## Interpretation Limits

Does Not Mean: every attached Transition is currently applicable, executable, supported, recommended, or visible in a UI
Must Not Be Used To Claim: that Task participates in a Transition unless the referenced canonical Transition Definition independently supports that participation
```

## File Naming

- Schema Transition Companion artifacts should use `<schema-id>-transitions.trace.md`.
- Example: `tiinex.task.v1-transitions.trace.md`.
- The filename is schema-local navigation only and is not schema identity, Transition identity, participation authority, or package identity.

---

# Continuity Integrity

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: QIgH3N5Jbf3wStEYA7XSVL7J0vNaRaSr8p1hZEonam0