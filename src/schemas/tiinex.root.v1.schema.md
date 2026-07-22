# Continuity Context

- Envelope Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)
  - Created At: 2026-06-14 00:00:00
  - Summary: Root schema for Tiinex lineage artifacts with repair-note support.

---

# Root

## Summary

Defines the minimum shared contract for Tiinex lineage artifacts.

A Tiinex artifact must be identifiable, traversable, and verifiable before any descendant schema adds body-specific meaning.

## Root Semantics

Root requires:

- schema identity
- creation time
- continuity position
- integrity footer

If `Parent` exists, the artifact continues a declared parent artifact.

If `Parent` is absent, the artifact is the root of its local lineage.

Parent absence does not erase origin or provenance. It only means no parent edge is declared.

If `Repairs` exists, the artifact declares known repair, correction, or trust-impacting context that should remain visible to later readers and tools.

## Contract Reading Model

The `Schema Validation Contract` section is the machine-readable validation surface for this schema.

Validators should not infer additional required fields, sections, or rules from prose outside the `Schema Validation Contract`.

Descendant schema contracts are additive unless they explicitly define an override.

## Inheritance

Descendant schemas may add:

- sections
- fields
- semantics
- validation requirements
- derived concepts
- envelope fields

Descendant schemas should not restate inherited requirements unless local readability requires it.

## Extension

Any descendant-defined extension should declare:

- Name
- Base Concept
- Interpretation

Envelope extensions should also declare the envelope block they extend.

---

## Schema Validation Contract

### Machine Authority Surfaces

Validation Authority

- Schema Validation Contract

Generation Authority

- Artifact Creation Contract

Integrity Authority

- Continuity Integrity

Non-Authoritative For Validation

- Summary
- Root Semantics
- Contract Reading Model
- Inheritance
- Extension
- Artifact Creation Contract

Rules

- Validators must read `Schema Validation Contract` as the validation surface.
- Validators must not infer extra required fields from non-authoritative prose sections.
- `Artifact Creation Contract` defines generation when present.
- `Artifact Creation Contract` must not override `Schema Validation Contract`.
- `Continuity Integrity` defines the integrity footer.
- Descendant schema contracts are additive unless they explicitly define an override.

### Contract Syntax

Group Shape

- Third-Level Heading

Category Shape

- Category Label
- Hyphen List Items

List Marker

- hyphen

Known Category Labels

- Allowed Labels
- Allowed Shapes
- Allowed Target Blocks
- Applies To
- Category Shape
- Declaration Fields
- Entry Shape
- Fields
- Footer Sections
- Generation Authority
- Group Shape
- Header Sections
- Integrity Authority
- Known Category Labels
- List Marker
- Non-Authoritative For Validation
- Optional Fields
- Optional Sections
- Ordering
- Required Entries
- Required Fields
- Required Heading
- Required Shape
- Required When
- Rules
- Severity Levels
- Towards Allowed Shapes
- Validation Authority

Rules

- A contract group begins at a third-level heading.
- A category label is a plain text line from the known category label set.
- A category label applies to the first hyphen list after the label.
- Blank lines between a category label and its list are allowed.
- Machine contract list items use hyphen bullets.
- Envelope list items use hyphen bullets.
- Footer method entries use hyphen bullets.
- Star bullets are not part of the root machine contract shape.
- List item order is not significant unless the category label is `Ordering`.
- `Rules` list items are normative.
- Only third-level headings, category labels, and hyphen list items are part of the machine contract.
- Other prose inside `Schema Validation Contract` is not part of the machine contract.
- Descendant schemas may introduce new category labels only through `Contract Category Extension`.
- `Artifact Creation Contract`, when present, uses the same contract syntax.

### Validator Response Policy

Severity Levels

- error
- warning
- info
- preserve

Rules

- `error` means the artifact does not satisfy the active contract.
- `warning` means the artifact remains readable but is degraded, ambiguous, or not fully portable.
- `info` means the validator may surface non-blocking state without changing validity.
- `preserve` means the validator must retain the signal without claiming to understand or normalize it.
- Validators must not silently downgrade `error` conditions.
- Validators must not silently upgrade `preserve` conditions into `warning` or `error` without contract authority.

### Unknown Handling

Applies To

- contract category labels
- envelope fields
- extension declarations

Rules

- Declared but unsupported contract category labels are `preserve` and may also be `warning`.
- Undeclared contract category labels are `error` when full schema lineage is available.
- Undeclared contract category labels are `warning` when full schema lineage is unavailable.
- Unknown envelope fields are `preserve` by default.
- Unknown envelope fields may become `warning` or `error` only when full schema lineage proves they are undeclared.
- Unknown extension declarations must be preserved unless the active schema contract explicitly forbids them.

### Matching And Normalization

Applies To

- heading text
- category labels
- field names
- line endings
- blank lines between category labels and lists
- bullet markers in machine-authoritative surfaces

Rules

- Heading text is exact after trimming leading and trailing whitespace.
- Category labels are exact after trimming leading and trailing whitespace.
- Field names are exact after trimming leading and trailing whitespace.
- Matching is case-sensitive unless a descendant schema explicitly defines a local exception.
- Blank lines between a category label and its list are ignored.
- Line endings may be normalized before parsing.
- Bullet marker normalization is not allowed in machine-authoritative surfaces.

### Inheritance And Override

Rules

- Descendant schema contracts are additive by default.
- Descendant schemas may add groups, categories, declarations, fields, and stricter local rules.
- Descendant schemas must not weaken root identity, continuity, or integrity requirements.
- Descendant schemas must not remove inherited requirements unless they explicitly define override semantics.
- Override semantics must identify which inherited requirement is being replaced and how the replacement is interpreted.
- Validators must not guess override behavior when a descendant schema does not define it.
- A descendant extension must not silently redeclare an inherited contract category label as if it were new.

### Contract Cardinality

Applies To

- contract groups
- category labels within a contract group
- named declarations within a contract group
- required groups
- optional groups

Rules

- Contract groups are identified by third-level heading text.
- Contract group names should be unique within the same machine-readable contract section.
- Category labels may appear at most once within the same contract group unless a descendant schema explicitly declares repeat semantics.
- Named declarations must be unique within the same contract group.
- Duplicate named declarations are invalid unless a descendant schema explicitly defines override semantics.
- Missing required groups are `error`.
- Missing optional groups are valid.
- Duplicate handling must not be silently guessed.

### Named Declaration

Entry Shape

- First-Level Hyphen List Item

Declaration Fields

- Base Concept
- Interpretation

Rules

- Each named declaration is represented as one first-level hyphen list item.
- The first-level list item text is the declaration name.
- Declaration fields are represented as nested hyphen list items under the declaration entry.
- Declaration names must be unique within the same contract group.
- Duplicate declaration names are invalid unless a descendant schema explicitly defines override semantics.

### Contract Category Extension

Required When

- A descendant schema introduces a contract category label.

Entry Shape

- Named Declaration

Declaration Fields

- Base Concept
- Interpretation

Rules

- Each contract category extension uses the `Named Declaration` shape.
- The declaration name is the new contract category label.
- A descendant schema must not redeclare an already inherited category label here unless it explicitly defines override semantics.
- A descendant schema must declare a new category label in `Contract Category Extension` before using it in its own contract.
- Declared category labels extend the known category label set for that schema and its descendants.
- Validators that do not understand a declared category label should preserve it and may warn.
- Strict validators may fail on undeclared category labels when the full schema lineage is available.

### Contract Category Override

Required When

- A descendant schema replaces the interpretation of an inherited contract category label.

Entry Shape

- Named Declaration

Declaration Fields

- Replacement Interpretation

Rules

- Each contract category override uses the `Named Declaration` shape.
- The declaration name identifies the inherited contract category label being replaced.
- `Replacement Interpretation` describes how the descendant schema now interprets that inherited label.
- A descendant schema must not rely on an override unless it declares it here.
- Validators must not guess contract category overrides that are not declared here.

### Document Layout

Header Sections

- Continuity Context

Footer Sections

- Continuity Integrity

Rules

- `Continuity Context` must appear before the artifact body.
- `Continuity Integrity` must appear after the artifact body and machine-readable contract sections.
- `Continuity Integrity` is a footer section even though it is represented by a markdown heading.
- `Continuity Integrity` should be the final top-level section of the artifact.

### Continuity Context

Required Fields

- Envelope Schema
- Current

Optional Fields

- Parent
- Repairs

Rules

- `Envelope Schema` identifies the envelope-reading schema.
- `Current` identifies the current artifact.
- `Parent` identifies the direct continuity parent when one is declared.
- Parent present means the artifact continues a declared parent.
- Parent absent means the artifact is the root of its local lineage.
- Parent absence does not erase origin or provenance.

### Repairs

Required When

- Repairs exists

Entry Shape

- First-Level Hyphen List Item

Optional Fields

- Target
- Note
- Reason

Rules

- `Repairs` records known repairs, corrections, or trust-impacting changes to the artifact.
- A repair entry should state what was repaired and why.
- A repair entry may refer to lineage, parent, origin, current metadata, body claims, schema references, integrity, or another readable target.
- Structured repair entries should expose `Target`, `Note`, and `Reason` as nested fields.
- Free-text repair entries are allowed and must be preserved, but structured entries are preferred for tooling.
- `Repairs` must not silently replace `Parent`, `Trace`, `Origin`, `Current`, or `Continuity Integrity` semantics.
- `Repairs` does not automatically invalidate the artifact or lineage.
- Validators may warn when a repair entry is too vague to support audit or update tooling.
- Tools that update descendants because of a repair should preserve the repair note or point to the artifact that contains it.

### Parent

Required When

- Parent exists

Required Fields

- Parent Schema
- Trace
- Origin

Optional Fields

- Created At

Rules

- `Trace` defines the direct continuity relation.
- `Parent` describes ancestry only.
- `Parent` must not point to child artifacts.
- `Parent` must not point to planned descendants.

### Parent Origin

Required When

- Parent exists

Required Fields

- browse + git

Allowed Labels

- relative
- absolute
- browse + git

Entry Shape

- Markdown Link

Ordering

- relative
- absolute
- browse + git

Rules

- `Origin` supports recovery.
- `Origin` must not replace `Trace`.
- Every origin candidate should identify the same parent artifact.
- Origin candidates must not mix alternate parents.
- `browse + git` gives the portable archive permalink for the parent artifact.
- `browse + git` should be commit-pinned when available.
- `absolute` paths are local recovery hints, not portable authority.
- Additional origin labels may be introduced by descendant schemas as envelope extensions.

### Current

Required Fields

- Current Schema
- Created At

Optional Fields

- Summary

Rules

- `Current Schema` identifies the schema governing the current artifact.
- `Created At` records artifact creation time.
- `Summary` is a compact fallback description.

### Schema Reference Fields

Fields

- Envelope Schema
- Parent Schema
- Current Schema

Allowed Shapes

- Markdown Link
- Plain Schema Id

Rules

- Markdown Link is preferred when a schema artifact target is available.
- Plain Schema Id is allowed when no useful target is available or when local context already resolves the schema id.

### Trace Field

Allowed Shapes

- Markdown Link
- Relative Path

Rules

- Markdown Link is preferred when a target is available.
- Relative Path is allowed when the parent trace is local and directly recoverable.

### Created At

Required Shape

- YYYY-MM-DD hh:mm:ss

Rules

- UTC is implied.
- Time precision is seconds.
- Timezone suffixes are not part of the root timestamp shape.
- Local zone names are not part of the root timestamp shape.
- Numeric offsets are not part of the root timestamp shape.
- Milliseconds are not part of the root timestamp shape.

### Envelope Extension

Required When

- A descendant schema adds envelope fields.

Entry Shape

- Named Declaration

Declaration Fields

- Target Block
- Base Concept
- Interpretation

Allowed Target Blocks

- Continuity Context
- Parent
- Parent Origin
- Current
- Continuity Integrity
- Repairs

Rules

- Each envelope extension uses the `Named Declaration` shape.
- The declaration name is the added envelope field name.
- Declaration fields are represented as nested hyphen list items under the declaration entry.
- Descendant schemas may add machine-readable envelope fields.
- Added envelope fields must declare which envelope block they extend.
- Root validators should preserve unknown envelope fields even when they cannot validate them.
- Strict validators may warn or fail on undeclared envelope fields when the full schema lineage is available.

### Continuity Integrity Footer

Required Heading

- Continuity Integrity

Required Entries

- Method Entry

Rules

- `Continuity Integrity` is a footer surface.
- `Continuity Integrity` verifies relation or artifact integrity according to the named method.
- The footer should be the final top-level section of the artifact.

### Method Entry

Entry Shape

- First-Level Hyphen List Item

Allowed Shapes

- Plain Method Identifier
- Markdown Link Method Label

Required Fields

- Towards
- Value

Towards Allowed Shapes

- Markdown Link
- self

Rules

- `Method Entry` is represented by a first-level hyphen list item under `Continuity Integrity`.
- The `Method Entry` label names the integrity method.
- The `Method Entry` label may be a plain canonical method identifier or a markdown link to a validation method artifact.
- A markdown-link method label must use the canonical method identifier as link text.
- When a maintained validation method artifact has an available commit-pinned `browse + git` permalink, the markdown-link method label must use that permalink as its link target.
- `Towards` identifies the validated target.
- `Value` carries the method output.
- For hash-based continuity methods, the validated target is hashed without the `# Continuity Integrity` section and everything after it.
- When `Towards` is not `self`, `Value` must be computed from the validated target identified by `Towards`, not from the current artifact body.
- `self` is allowed only when the method validates the current artifact itself.
- When a maintained schema artifact has an available commit-pinned `browse + git` permalink for its validated target, `Towards` should use that permalink instead of a relative local path.

### Extension

Required When

- A descendant schema introduces an extension.

Entry Shape

- Named Declaration

Declaration Fields

- Base Concept
- Interpretation

Rules

- Each extension uses the `Named Declaration` shape.
- The declaration name is the extension name.
- Declaration fields are represented as nested hyphen list items under the declaration entry.
- Root defines how extensions are introduced.
- Root does not define all future extensions.

### Optional Machine Sections

Optional Sections

- Artifact Creation Contract

Rules

- `Artifact Creation Contract` is present only when the schema supports direct artifact generation.
- `Artifact Creation Contract` uses the same contract syntax as `Schema Validation Contract`.
- Absence of `Artifact Creation Contract` means artifact generation is not declared by this schema.

---
