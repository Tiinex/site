# Continuity Context

- Envelope Schema: [tiinex.root.v1](../../tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.root.v1](../../tiinex.root.v1.schema.md)
  - Created At: 2026-06-14 00:00:00
  - Trace: [tiinex.root.v1.schema.md](../../tiinex.root.v1.schema.md)
  - Origin:
    - [relative](../../tiinex.root.v1.schema.md)
    - [browse + git](https://github.com/Tiinex/docs/blob/78a3673444666f1145be4feca6e7eb1476a44281/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.validation.method.v1](tiinex.validation.method.v1.schema.md)
  - Created At: 2026-06-26 00:00:00
  - Summary: Schema for validation-method definitions that declare verification scope, trust boundary, and failure modes.

---

# Validation Method

- Status: maintained schema note

## Summary

This schema defines validation-method artifacts that describe what a validation
method verifies, what it does not verify, and where its trust boundary ends.

It exists so Tiinex tools and readers do not collapse byte integrity, schema
validity, signature validity, human attestation, lineage continuity, and runtime
reproducibility into one vague word such as `verified`.

## Schema Validation Contract

### Validation Method Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.validation.method.v1`

Rules

- `tiinex.validation.method.v1` identifies artifacts whose main job is to define the semantics and limits of a validation method.
- A validation method artifact describes a method contract; it does not by itself prove that a particular target satisfies the method.
- Validation method artifacts should make positive verification scope and negative scope explicit.
- Prose outside `Schema Validation Contract` may explain the schema, but it does not add required validation rules.

### Validation Method Body

Required Shape

- first body heading after the continuity envelope
- `## Method Identity` section
- `## Verification Scope` section
- `## Trust Boundary` section
- `## Failure Modes` section
- `## Recommended Use` section

Optional Sections

- Canonicalization
- Required Context
- Replayability
- Human Verifiability
- Machine Verifiability
- Examples
- Related Methods
- Not Recommended For

Rules

- A validation method artifact should begin with a human-readable method name.
- `Method Identity` must identify the method and version.
- `Verification Scope` must state both what the method verifies and what it does not verify.
- `Trust Boundary` must state the assumptions or authority limits of the method.
- `Failure Modes` must state known ways the method can fail, mislead, or be misapplied.
- `Recommended Use` must state where the method is appropriate.

### Method Identity

Required Fields

- Name
- Version
- Method Family
- Canonical Identifier

Optional Fields

- Supersedes
- Related Method

Rules

- `Name` should be stable enough for human-readable method entries and UI surfaces to reference.
- `Canonical Identifier` should be the stable machine-readable method id used by integrity entries, validator output, and UI method labels.
- `Version` should change when interpretation, canonicalization, trust boundary, or failure semantics change.
- `Method Family` should identify the broad method class, such as digest, signature, schema validation, lineage traversal, human attestation, runtime reproduction, or external authority.

### Verification Scope

Required Fields

- Verifies
- Does Not Verify

Optional Fields

- Target Types
- Required Inputs
- Output Signal

Rules

- `Verifies` must describe the positive claim the method can support.
- `Does Not Verify` must describe important claims the method does not support.
- A method must not imply truth, authorship, intent, consent, identity, or historical provenance unless those are inside its declared verification scope.
- UI labels should prefer method-scoped language such as `byte-integrity verified`, `schema-valid`, `lineage-continuity verified`, `human-attested`, or `runtime-reproducible` over generic `verified`.

### Trust Boundary

Required Fields

- Trust Boundary
- Required Context

Optional Fields

- Machine Verifiable
- Human Verifiable
- Replayable
- Cryptographic Strength
- Social Or Legal Strength

Rules

- `Trust Boundary` must state what authority, environment, secret, key, witness, runtime, or context the method depends on.
- `Required Context` must state what a later reader or validator needs before applying the method.
- Machine-verifiable and human-verifiable status should be explicit when known.
- Replayability should be explicit when repeat validation is possible.

### Failure Modes

Required Fields

- Failure Modes

Optional Fields

- Ambiguity Risks
- Misuse Risks
- Known Weaknesses

Rules

- A validation method should state known failure modes rather than only describing successful use.
- Non-cryptographic validation methods should be especially explicit about weakness and context dependence.
- Weak methods may still be useful when their boundaries are clear.

### Recommended Use

Required Fields

- Recommended Use

Optional Fields

- Not Recommended For
- Example UI Labels

Rules

- `Recommended Use` should state where the method is appropriate.
- `Not Recommended For` should state common misuse cases when known.
- `Example UI Labels` should prefer method-scoped language over generic `verified`.

### File Naming

Allowed Shapes

- `<lineage>-<method-slug>.trace.md`
- `<lineage>-validation-method.trace.md`
- `<method-slug>.trace.md`
- `<method-slug>-validation-method.trace.md`
- `<method-slug>.validator.md`
- `<method-slug>-validation-method.validator.md`

Rules

- Validation method artifacts should use a slug that identifies the method or method family.
- Lineage-first `.trace.md` names should be used when the method artifact is part of an ordinary local trace lineage.
- Canonical registry-like method artifacts may use a method slug without a lineage prefix when the artifact is intentionally maintained as a reusable method definition.
- Canonical registry-like method definitions may use `.validator.md` when the artifact is intentionally maintained as a reusable validation method definition.
- `.validator.md` files define validation method semantics; they are not executable validator implementations.
- `.validator.md` files are not validation result artifacts.
- Trace-lineage validation method artifacts should keep the `.trace.md` suffix stable.

### Interpretation Boundaries

Rules

- Use `tiinex.validation.method.v1` to define method semantics, not to record one validation result.
- A specific validation result may reference a validation method artifact but should be owned by the schema that records that result.
- Integrity-specific methods may later be narrowed by a descendant such as `tiinex.integrity.method.v1` if needed.
- Attestation-specific methods may later be narrowed by a descendant or companion attestation schema if needed.

## Minimal Example

```md
# Continuity Context

- Envelope Schema: tiinex.root.v1
- Current
  - Current Schema: tiinex.validation.method.v1
  - Created At: 2026-06-26 00:00:00
  - Summary: Method boundary for a canonical byte digest check.

---

# SHA-256 Canonical Byte Digest Method

## Method Identity

- Name: SHA-256 canonical byte digest
- Version: 1
- Method Family: digest
- Canonical Identifier: sha256-base64url-c14n-v1

## Verification Scope

- Verifies: same canonical bytes for the declared target
- Does Not Verify: truth, authorship, intent, consent, semantic correctness, or historical provenance

## Trust Boundary

- Trust Boundary: canonicalization algorithm plus digest implementation
- Required Context: target bytes and the canonicalization rules
- Machine Verifiable: yes
- Human Verifiable: partial
- Replayable: yes

## Failure Modes

- Failure Modes: wrong canonicalization, wrong target, truncated content, stale digest, implementation bug

## Recommended Use

- Recommended Use: byte-integrity checks for stable artifacts and payloads
- Not Recommended For: proving truth or authorship
- Example UI Labels: byte-integrity verified
```

## Validation-Friendly Shape

Keep this schema note in the exact section order already used here:
`Summary`, `Schema Validation Contract`, `Minimal Example`,
`Validation-Friendly Shape`, and `Interpretation Notes`.

Maintain the section headings exactly in this schema note. Free markdown inside
those sections is allowed, but adding undeclared new section headings should be
treated as schema drift.

## Interpretation Notes

- validation methods define what a method can and cannot prove
- method-scoped verification language should replace generic trust language in future UI surfaces
- integrity methods, attestations, and runtime reproducibility can all reference validation method artifacts
- `.validator.md` method artifacts are reusable validation method definitions, not executable validators or validation result ledgers
- this schema should stay method-semantics-oriented rather than becoming a result ledger
- this support/governance schema intentionally omits `Artifact Creation Contract` until ordinary app creation behavior is explicitly declared

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.root.v1.schema.md](https://github.com/Tiinex/docs/blob/78a3673444666f1145be4feca6e7eb1476a44281/.topics/.schemas/tiinex.root.v1.schema.md)
  - Value: BFWYft1v0Ue0gUoO236DGScvnixS7_MIEwO6mhJhkNw

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: C0az3msKICiqcp2tNF5uWe-qN7Mw7LZdbCcZfSDsx1k