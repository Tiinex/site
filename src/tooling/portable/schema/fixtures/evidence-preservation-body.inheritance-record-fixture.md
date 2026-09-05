<!-- Intentional first-class standalone inheritance-record fixture; not schema-local compilation authority. -->
# Continuity Context

- Envelope Schema: [tiinex.root.v1](../../tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.schema.inheritance.v1](../../schema/contract/inheritance/tiinex.schema.inheritance.v1.schema.md)
  - Created At: 2026-09-04 00:00:00
  - Authors: Axiom, Anchor
  - Why: Make Evidence's structural replacement of the generic Preservation body machine-explicit without weakening inherited Preservation semantics or introducing child-wins policy.
  - Summary: Explicit Preservation-to-Evidence body-structure override for schema-factory compilation.
  - Status: maintained

---

# Evidence Extends Preservation — Body Structure Inheritance

## Inheritance Identity

Inheritance Handle: evidence-preservation-body-structure
Inheritance Name: Evidence replaces generic Preservation body structure
Inheritance Kind: override

## Parent Contract

Parent Schema: tiinex.preservation.v1
Parent Contract Nodes: Schema Validation Contract / Preservation Body / Required Shape
Parent Resolution State: resolved

## Child Contract

Child Schema: tiinex.evidence.v1
Child Contract Nodes: Schema Validation Contract / Evidence Body / Required Shape
Child Resolution State: resolved

## Merge Rules

- override Preservation artifact-body structural requirements with Evidence body structure
  - Merge Operation: override
  - Applies To: artifact-body structural Required Shape contributed by tiinex.preservation.v1 Preservation Body when validating or generating tiinex.evidence.v1 artifacts
  - Parent Node: Schema Validation Contract / Preservation Body / Required Shape
  - Child Node: Schema Validation Contract / Evidence Body / Required Shape
  - Reason: Evidence is a Preservation specialization whose canonical body sections replace the generic Preservation body while retaining compatible non-structural Preservation obligations and provenance.
  - Effective Result: Evidence requires one first body heading followed by exactly the child structural sections Supported Claim Or Question, Provenance, Evidence Material, Preservation And Fidelity, and Interpretation Limits. Preservation-only structural sections Preserved Material, Preservation Act, Fidelity And Loss, and Custody Or Storage Boundary are not independently required for Evidence. Compatible inherited Preservation contributions targeting surviving Evidence sections remain active with their source provenance.

## Conflict Handling

Conflict Policy: report-conflict
Conflict Severity: fail
Unknown Parent Handling: require-review
Unknown Child Handling: require-review
Review Needed: yes when either contract node cannot be resolved exactly or when implementation cannot preserve active and inactive contributor provenance

## Interpretation Limits

Does Not Mean: Evidence stops inheriting Preservation semantics, parent field contributions on surviving compatible sections disappear, or descendants generally override ancestors.
Must Not Be Used To Claim: global child-wins precedence, schema-order precedence, permission to suppress unrelated Preservation obligations, Evidence truth, evidence sufficiency, validation success, or authorization.
Merge Boundary: only the explicit Preservation Body Required Shape contribution is structurally replaced for Evidence; all other inheritance remains governed by Root additive semantics unless separately overridden.

---

# Continuity Integrity

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: rtWRmeA7PhhFWuYfGuVi15FhC4DHgsypTSV7L9tX7-Y
