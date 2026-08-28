# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/0fdce5f265298321a41cd90cf5382bcb6ae31a13/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.relation.v1](https://github.com/Tiinex/docs/blob/0fdce5f265298321a41cd90cf5382bcb6ae31a13/.topics/.schemas/relation/tiinex.relation.v1.schema.md)
  - Created At: 2026-06-26 00:00:00
  - Trace: [tiinex.relation.v1.schema.md](../../tiinex.relation.v1.schema.md)
  - Origin:
    - [relative](../../tiinex.relation.v1.schema.md)
    - [browse + git](https://github.com/Tiinex/docs/blob/0fdce5f265298321a41cd90cf5382bcb6ae31a13/.topics/.schemas/relation/tiinex.relation.v1.schema.md)
- Current
  - Current Schema: [tiinex.workspace.representation.v1](tiinex.workspace.representation.v1.schema.md)
  - Created At: 2026-08-27 18:23:50
  - Authors: Axiom
  - Why: Defines the narrow canonical non-Parent relation that binds one explicit Workspace artifact to one explicit External Payload representation with deterministic Workspace-tree correlation and fail-closed provider qualification.
  - Summary: Relation-owned companion schema for exact Workspace byte-tree representation bindings.

---

# Workspace Representation

- Status: draft schema note

## Summary

`tiinex.workspace.representation.v1` defines one explicit non-Parent semantic binding
between one `tiinex.workspace.v1` artifact and one `tiinex.external.payload.v1`
artifact whose payload represents the Workspace byte tree.

The Workspace artifact remains the semantic, human-readable, lineage-bearing
Workspace. The External Payload artifact remains the owner of representation
payload identity, location, media/format metadata, exact payload-byte integrity,
access, and recovery boundaries. This companion owns only the relation endpoints,
Workspace-tree-to-payload-entry correlation, binding state, and provider
qualification boundaries needed to interpret those two artifacts together.

The companion does not create or imply maintained `tiinex.archive.v1` or
`tiinex.zip.v1` semantics. An archive format such as `application/zip` remains
External Payload metadata unless a separately maintained schema later owns that
format semantics.

## Schema Validation Contract

### Workspace Representation Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.workspace.representation.v1`

Rules

- `tiinex.workspace.representation.v1` identifies artifacts whose main job is to bind one explicit Workspace artifact to one explicit representation payload with deterministic byte-tree correlation and provider-qualification semantics.
- The binding is a typed non-Parent relation specialized from `tiinex.relation.v1`.
- The binding must remain readable and machine-extractable without package filenames, directory placement, ZIP adjacency, route labels, package membership, or hidden application state.
- A schema-valid binding may preserve a non-ready state such as `declared`, `stale`, or `unresolved`; schema validity alone does not authorize provider activation.
- Prose outside `Schema Validation Contract` may explain the schema, but it does not add required validation rules.

### Parent Relation Specialization

Rules

- Workspace Representation artifacts specialize the inherited `Relation Body` for artifacts whose `Current -> Current Schema` is `tiinex.workspace.representation.v1`.
- The child body replaces the generic inherited `## Relation Declaration` and `## Relation Target` instance sections with `## Representation Binding` and `## Representation Correlation`.
- `## Representation Binding` owns the fixed relation predicate/direction plus the explicit Workspace and representation-payload endpoints.
- `## Representation Correlation` owns deterministic correlation between the represented Workspace byte tree and representation-payload entries.
- `## Relation Boundary` preserves and narrows the inherited non-Parent boundary.
- `## Provider Qualification` and required `## Interpretation Limits` add relation-specific state and interpretation obligations.
- This specialization changes the artifact body contract only; it does not weaken Root continuity, integrity, schema-reference, Parent, or origin semantics.

### Workspace Representation Body

Required Shape

- first body heading after the continuity envelope
- `## Representation Binding` section
- `## Representation Correlation` section
- `## Provider Qualification` section
- `## Relation Boundary` section
- `## Interpretation Limits` section

Optional Sections

- Evidence Basis
- Related Artifacts
- References

Rules

- A Workspace Representation artifact should begin with a human-readable title.
- Each required section must be readable without specialized tooling and structured enough that a consumer can preserve unresolved or non-ready state without guessing.
- Required sections must not be replaced by package-local control metadata or application state.

### Representation Binding

Required Fields

- Workspace Artifact
- Representation Payload
- Representation Kind
- Coverage
- Binding State

Field Value Constraints

- Workspace Artifact
  - Allowed Shape: Markdown Link
  - Domain Policy: closed
- Representation Payload
  - Allowed Shape: Markdown Link
  - Domain Policy: closed
- Representation Kind
  - Allowed Value: exact-workspace-byte-tree-archive
  - Domain Policy: closed
- Coverage
  - Allowed Value: complete
  - Allowed Value: partial
  - Allowed Value: unknown
  - Domain Policy: closed
- Binding State
  - Allowed Value: verified
  - Allowed Value: declared
  - Allowed Value: stale
  - Allowed Value: unresolved
  - Domain Policy: closed

Rules

- `Workspace Artifact` identifies exactly one explicit artifact intended to resolve as `tiinex.workspace.v1`; filename, package membership, directory, adjacency, route label, or archive basename must never substitute for this endpoint.
- `Representation Payload` identifies exactly one explicit artifact intended to resolve as `tiinex.external.payload.v1`; it is the owner of payload identity, location, media/format, integrity value, integrity target, access, and recovery semantics.
- `Representation Kind: exact-workspace-byte-tree-archive` means the payload is intended to carry a path-addressable archive representation of Workspace-tree bytes. It does not assert a maintained Archive or ZIP schema.
- `Coverage: complete` means the representation is intended to cover the complete Workspace byte tree required by this binding. `partial` and `unknown` are preserved non-ready states for provider activation.
- `Binding State: verified` is a current qualification claim and is contradictory when either endpoint, required correlation, decoder, payload integrity, coverage, or required comparison evidence is unresolved, stale, invalid, or mismatched.
- `declared`, `stale`, and `unresolved` preserve non-ready states and must not be promoted to `verified` from package placement, digest-string presence, successful decoding alone, or application convenience.
- The semantic relation direction is Workspace artifact -> representation payload. The payload is a representation of the Workspace byte tree; it is not the Workspace artifact itself.

### Representation Correlation

Required Fields

- Workspace Tree Root
- Workspace Artifact Inner Path
- Archive Entry Root
- Path Mapping
- Collision Policy
- Decoder Requirement

Optional Fields

- Mapping Manifest
- Entry Integrity Manifest

Field Value Constraints

- Path Mapping
  - Allowed Value: identity-relative-paths
  - Allowed Value: manifest
  - Domain Policy: closed
- Collision Policy
  - Allowed Value: reject-ambiguous-or-unsafe-paths
  - Domain Policy: closed
- Mapping Manifest
  - Allowed Shape: Markdown Link
  - Domain Policy: closed
- Entry Integrity Manifest
  - Allowed Shape: Markdown Link
  - Domain Policy: closed

Rules

- `Workspace Tree Root` identifies the logical root from which Workspace-relative paths are interpreted. `.` denotes the represented Workspace root.
- `Workspace Artifact Inner Path` is the exact Workspace-relative path at which the bound Workspace artifact must occur in the represented tree.
- `Archive Entry Root` is the exact representation-payload entry prefix corresponding to `Workspace Tree Root`; `.` denotes a root-preserving representation.
- Workspace and archive path fields must use normalized forward-slash relative path semantics. Absolute paths, drive-qualified paths, NUL-containing paths, `..` traversal, empty non-root paths, and entries that escape their declared root are invalid for provider qualification.
- `Path Mapping: identity-relative-paths` means every Workspace-relative path under `Workspace Tree Root` maps to the same normalized relative path below `Archive Entry Root`.
- `Path Mapping: manifest` requires `Mapping Manifest`; the referenced material must explicitly map Workspace-relative paths to representation entries. Identity fallback is forbidden when manifest mapping is declared.
- `Mapping Manifest` and `Entry Integrity Manifest`, when present, are explicit reference targets whose own schema/source/integrity authority must be qualified separately; the link itself does not prove manifest correctness.
- `Collision Policy: reject-ambiguous-or-unsafe-paths` requires rejection of duplicate normalized entries, multiple entries mapping to one Workspace-relative path, traversal or absolute entries, unsafe entry types, and case/Unicode-normalization ambiguity when the consuming environment cannot preserve a unique comparison.
- `Decoder Requirement` states the decoder/codec capability required to interpret the representation payload. Decoder availability, format compatibility, and safe-entry handling are qualification conditions. Consumers must not guess another decoder or representation when the declared requirement is unavailable.
- Whole-payload digest verification fixes the exact representation bytes only. Provider qualification must additionally validate the declared decoder, path mapping, bound Workspace inner entry, and complete coverage when required.
- When verified payload bytes plus the declared decoder/mapping and exact bound Workspace comparison cannot establish the required entry/tree identity or coverage, `Entry Integrity Manifest` or equivalent separately qualified integrity material is required; consumers must fail closed rather than infer equivalence.

### Provider Qualification

Required Fields

- Activation Rule
- Payload Integrity Requirement
- Coverage Requirement
- Staleness Rule
- Selection Rule
- Multi-Workspace Isolation

Field Value Constraints

- Activation Rule
  - Allowed Value: verified-complete-only
  - Domain Policy: closed
- Payload Integrity Requirement
  - Allowed Value: verified-exact-payload-bytes
  - Domain Policy: closed
- Coverage Requirement
  - Allowed Value: complete
  - Domain Policy: closed
- Staleness Rule
  - Allowed Value: requalify-on-binding-relevant-change
  - Domain Policy: closed
- Selection Rule
  - Allowed Value: exactly-one-binding-per-workspace
  - Domain Policy: closed
- Multi-Workspace Isolation
  - Allowed Value: independent-binding-closure
  - Domain Policy: closed

Rules

- `Activation Rule: verified-complete-only` permits an archive-backed Workspace provider to report ready only when one binding resolves exactly one Workspace artifact and exactly one Representation Payload, `Binding State` is `verified`, `Coverage` is `complete`, and every required correlation/integrity condition qualifies.
- `Payload Integrity Requirement: verified-exact-payload-bytes` requires the resolved External Payload's `Integrity Status` and `Integrity Target` to qualify the exact representation bytes actually used. The digest value remains owned by the External Payload and must not be duplicated into this binding merely for convenience.
- `Coverage Requirement: complete` requires complete Workspace-byte-tree coverage for provider activation even though schema-valid artifacts may preserve `Coverage: partial` or `unknown`.
- `Staleness Rule: requalify-on-binding-relevant-change` means a changed bound Workspace representation, changed representation payload digest/integrity target, changed mapping, changed required inner path/root, changed decoder requirement, changed required manifest, or another canonical binding-relevant change makes the prior verified state stale or unresolved until requalified.
- `Selection Rule: exactly-one-binding-per-workspace` blocks competing ready bindings for the same Workspace unless a separate canonical selection authority explicitly resolves the competition.
- `Multi-Workspace Isolation: independent-binding-closure` means a qualified binding for Workspace A has no authority for Workspace B, even when payload bytes, filenames, layouts, or source repositories are identical.
- Provider activation must fail closed on duplicate or ambiguous Workspace identity; competing bindings without canonical selection authority; missing, stale, unresolved, or schema-invalid binding; missing or schema-invalid External Payload; unavailable or disallowed decoder; payload digest mismatch or wrong integrity target; missing or wrong bound Workspace inner entry; mismatch between exact bound inner Workspace bytes and the referenced Workspace representation when comparison is available or required; duplicate normalized paths; traversal, absolute, or unsafe entries; path/mapping collisions; missing required Mapping Manifest or Entry Integrity Manifest; incomplete required coverage; or a binding resolved only through filename, directory, adjacency, route label, package path, or package membership.
- A bare checksum-string equality, successful archive open, successful path lookup, or successful transport does not satisfy the provider qualification contract by itself.

### Relation Boundary

Required Fields

- Parent Boundary
- Workspace Identity Boundary
- Payload Identity Boundary
- Transport Boundary
- Outer Integrity Boundary

Rules

- `Parent Boundary` must state that neither endpoint is a Tiinex `Parent` merely because this representation binding exists.
- `Workspace Identity Boundary` must preserve the Workspace artifact as the semantic Workspace identity and must not allow the payload, archive filename, inner path, package route, or transport to replace it.
- `Payload Identity Boundary` must preserve External Payload authority over representation payload identity and exact payload-byte integrity.
- `Transport Boundary` must state that package-local location, Repository Transport, Handoff transport, decoder success, and retrieval mechanics are separate from this semantic binding.
- `Outer Integrity Boundary` must state that this relation does not replace separately owned outer-package exact-file/tamper authority such as `tiinex.package/file-map.json`.
- Preservation/custody semantics may be represented by a separate `tiinex.preservation.v1` artifact when independently meaningful; preservation is not implied by every Workspace Representation binding.

### Interpretation Limits

Required Fields

- Does Not Prove
- Must Not Be Used As

Optional Fields

- Preservation Boundary
- Repository Transport Boundary
- Source Boundary
- Open Questions

Rules

- Payload integrity and verified binding state do not prove semantic correctness, provenance, authorship, acceptance, completion, source identity, permission, consent, or truth.
- The representation payload must not be interpreted as the Workspace artifact itself or as a continuity Parent.
- Repository source/transport semantics, optional preservation semantics, Handoff lifecycle truth, recipient addressing, package-parent lineage, START/Pointer behavior, and outer-package tamper authority remain separately owned.
- Unknown or unavailable companion authority must remain unresolved rather than being repaired from path, filename, host, repository, branch, package location, or similar heuristics.

### File Naming

Allowed Shapes

- `<lineage>.trace.md`
- `<lineage>-workspace-representation.trace.md`
- `<lineage>-<workspace-representation-slug>.trace.md`

Rules

- Workspace Representation artifacts should keep the lineage label first.
- The optional slug should identify the bounded represented Workspace/payload binding rather than a low-signal transport detail.
- Workspace Representation artifacts should keep the `.trace.md` suffix stable.

### Interpretation Boundaries

Rules

- Use `tiinex.workspace.representation.v1` when the main artifact value is one explicit Workspace-to-representation binding with deterministic correlation and qualification semantics.
- Do not use this schema to replace `tiinex.workspace.v1`, `tiinex.external.payload.v1`, `tiinex.preservation.v1`, repository transport semantics, Handoff semantics, source/provenance semantics, or package-wide integrity ownership.
- Do not use this schema for generic relations that do not require the specialized Workspace representation contract; use `tiinex.relation.v1` or another owning schema instead.
- Do not infer maintained Archive or ZIP schema semantics from `Representation Kind`, payload media type, file extension, or decoder requirement.

## Artifact Creation Contract

### Creation Fields

Required Fields

- Workspace Artifact
- Representation Payload
- Representation Kind
- Coverage
- Binding State
- Workspace Tree Root
- Workspace Artifact Inner Path
- Archive Entry Root
- Path Mapping
- Collision Policy
- Decoder Requirement
- Activation Rule
- Payload Integrity Requirement
- Coverage Requirement
- Staleness Rule
- Selection Rule
- Multi-Workspace Isolation
- Parent Boundary
- Workspace Identity Boundary
- Payload Identity Boundary
- Transport Boundary
- Outer Integrity Boundary
- Does Not Prove
- Must Not Be Used As

Optional Fields

- Mapping Manifest
- Entry Integrity Manifest
- Preservation Boundary
- Repository Transport Boundary
- Source Boundary
- Open Questions

### Creation Rules

Rules

- Creation tools must require both semantic endpoints explicitly and must not derive them from archive filename, directory placement, package membership, route labels, or adjacency.
- Creation tools should preserve `declared`, `stale`, or `unresolved` when verification evidence is incomplete rather than fabricating `verified`.
- Creation tools must not copy volatile External Payload digest/location fields into the binding solely to make provider resolution easier.
- `Mapping Manifest` is required when `Path Mapping` is `manifest`.
- `Entry Integrity Manifest` is required when the chosen decoder/mapping plus verified whole-payload integrity and exact Workspace comparison cannot establish the entry/tree identity or complete coverage required for activation.
- Direct creation of a `verified` binding should require the same endpoint, decoder, mapping, integrity, entry, coverage, and collision checks that provider activation requires.

## Minimal Example

```md
# Tiinex Site Workspace Representation

## Representation Binding

- Workspace Artifact: [Tiinex Site Workspace](tiinex-site.workspace.md)
- Representation Payload: [Tiinex Site Workspace Archive Payload](tiinex-site-workspace-payload.trace.md)
- Representation Kind: exact-workspace-byte-tree-archive
- Coverage: complete
- Binding State: verified

## Representation Correlation

- Workspace Tree Root: .
- Workspace Artifact Inner Path: .topics/.workspaces/tiinex-site.workspace.md
- Archive Entry Root: .
- Path Mapping: identity-relative-paths
- Collision Policy: reject-ambiguous-or-unsafe-paths
- Decoder Requirement: ZIP decoder with safe-entry validation

## Provider Qualification

- Activation Rule: verified-complete-only
- Payload Integrity Requirement: verified-exact-payload-bytes
- Coverage Requirement: complete
- Staleness Rule: requalify-on-binding-relevant-change
- Selection Rule: exactly-one-binding-per-workspace
- Multi-Workspace Isolation: independent-binding-closure

## Relation Boundary

- Parent Boundary: neither endpoint becomes Parent through this representation relation
- Workspace Identity Boundary: the referenced Workspace artifact remains the semantic Workspace identity
- Payload Identity Boundary: the referenced External Payload owns archive identity and exact payload-byte integrity
- Transport Boundary: package location, archive adjacency, repository transport, and decoder success are not binding authority
- Outer Integrity Boundary: package-wide exact-file/tamper authority remains separately owned

## Interpretation Limits

- Does Not Prove: semantic correctness, provenance, authorship, acceptance, completion, source identity, permission, consent, or truth
- Must Not Be Used As: a replacement for Workspace identity, External Payload authority, Parent continuity, repository transport, preservation, Handoff state, or package-wide integrity authority
```

## Validation-Friendly Shape

Keep this schema note in the exact section order already used here:
`Summary`, `Schema Validation Contract`, `Artifact Creation Contract`,
`Minimal Example`, `Validation-Friendly Shape`, and `Interpretation Notes`.

Maintain those section headings exactly in this schema note. Free markdown inside
those sections is allowed, but adding undeclared new second-level section
headings should be treated as schema drift.

The required artifact body headings are `## Representation Binding`,
`## Representation Correlation`, `## Provider Qualification`,
`## Relation Boundary`, and `## Interpretation Limits`.

## Interpretation Notes

- final schema id: `tiinex.workspace.representation.v1`
- canonical family: relation-owned specialization of `tiinex.relation.v1`, not a Workspace-field extension
- canonical path: `.topics/.schemas/relation/workspace/representation/tiinex.workspace.representation.v1.schema.md`
- External Payload continues to own exact representation bytes, digest, location, media/format, access, and recovery context
- complete coverage plus a verified, non-stale binding is required for archive-backed provider activation
- exact whole-payload integrity does not remove the need to qualify decoder, mapping, collisions, the bound Workspace inner entry, and coverage
- per-entry/tree integrity material is conditional, not duplicated by default
- package-local and repository-transport facts remain separate from semantic binding authority
- `tiinex.archive.v1` and `tiinex.zip.v1` remain unclaimed while reserved-only

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:85SBVrl3-bvDBa92CgObmsKDZYdJMPriq4aI9bbwNIM