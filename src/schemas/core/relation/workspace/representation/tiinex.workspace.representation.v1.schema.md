# Continuity Context

- Envelope Schema: [tiinex.root.v1](../../../tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.relation.v1](../../tiinex.relation.v1.schema.md)
  - Created At: 2026-06-26 00:00:00
  - Trace: [tiinex.relation.v1.schema.md](../../tiinex.relation.v1.schema.md)
  - Origin:
    - [relative](../../tiinex.relation.v1.schema.md)
    - [browse + git](https://github.com/Tiinex/docs/blob/0fdce5f265298321a41cd90cf5382bcb6ae31a13/.topics/.schemas/relation/tiinex.relation.v1.schema.md)
- Current
  - Current Schema: [tiinex.workspace.representation.v1](tiinex.workspace.representation.v1.schema.md)
  - Created At: 2026-08-27 18:23:50
  - Authors: Axiom
  - Why: Defines the narrow canonical non-Parent relation that binds one explicit Workspace artifact to one explicit complete or intentionally bounded External Payload representation with deterministic Workspace-tree correlation and fail-closed provider qualification.
  - Summary: Relation-owned companion schema for exact complete and bounded Workspace byte-tree representation bindings.
- Repairs
  - Bounded Workspace representation activation
    - Target: Schema Validation Contract / Representation Binding, Representation Scope, Representation Correlation, and Provider Qualification
    - Note: Adds an explicit `bounded` coverage mode and bounded-only activation contract while leaving existing `complete` provider semantics unchanged; legacy `partial` and `unknown` coverage remain non-ready.
    - Reason: Scoped export needs an intentional subset representation of one source Workspace without calling that subset a complete Workspace or treating detached transport closure as Workspace membership.

---

# Workspace Representation

- Status: draft schema note

## Summary

`tiinex.workspace.representation.v1` defines one explicit non-Parent semantic binding
between one `tiinex.workspace.v1` artifact and one `tiinex.external.payload.v1`
artifact whose payload represents either the complete Workspace byte tree or one
explicitly bounded subset of that byte tree.

The Workspace artifact remains the semantic, human-readable, lineage-bearing
Workspace. The External Payload artifact remains the owner of representation
payload identity, location, media/format metadata, exact payload-byte integrity,
access, and recovery boundaries. This companion owns only the relation endpoints,
Workspace-tree-to-payload-entry correlation, explicit bounded-scope semantics when
coverage is intentionally narrower than complete, binding state, and provider
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

- `tiinex.workspace.representation.v1` identifies artifacts whose main job is to bind one explicit Workspace artifact to one explicit complete or bounded representation payload with deterministic byte-tree correlation and provider-qualification semantics.
- The binding is a typed non-Parent relation specialized from `tiinex.relation.v1`.
- The binding must remain readable and machine-extractable without package filenames, directory placement, ZIP adjacency, route labels, package membership, or hidden application state.
- A schema-valid binding may preserve a non-ready state such as `declared`, `stale`, or `unresolved`; schema validity alone does not authorize provider activation.
- Prose outside `Schema Validation Contract` may explain the schema, but it does not add required validation rules.

### Parent Relation Specialization

Rules

- Workspace Representation artifacts specialize the inherited `Relation Body` for artifacts whose `Current -> Current Schema` is `tiinex.workspace.representation.v1`.
- The child body replaces the generic inherited `## Relation Declaration` and `## Relation Target` instance sections with `## Representation Binding` and `## Representation Correlation`.
- `## Representation Binding` owns the fixed relation predicate/direction plus the explicit Workspace and representation-payload endpoints.
- Conditional `## Representation Scope` owns intentional bounded-scope meaning when `Coverage` is `bounded`; it is forbidden as a substitute completeness claim.
- `## Representation Correlation` owns deterministic correlation between represented Workspace paths and representation-payload entries.
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

- Representation Scope
- Evidence Basis
- Related Artifacts
- References

Rules

- A Workspace Representation artifact should begin with a human-readable title.
- Each required section must be readable without specialized tooling and structured enough that a consumer can preserve unresolved or non-ready state without guessing.
- Required sections must not be replaced by package-local control metadata or application state.
- `## Representation Scope` is conditionally required when `Coverage` is `bounded`, forbidden as a bounded-activation substitute when its required fields are absent, and optional/ordinarily omitted for `Coverage: complete`.

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
  - Allowed Value: exact-bounded-workspace-byte-tree-archive
  - Domain Policy: closed
- Coverage
  - Allowed Value: complete
  - Allowed Value: bounded
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
- `Representation Kind: exact-workspace-byte-tree-archive` means the payload is intended to carry a path-addressable complete Workspace byte-tree representation. It does not assert a maintained Archive or ZIP schema.
- `Representation Kind: exact-bounded-workspace-byte-tree-archive` means the payload is intended to carry a path-addressable intentionally bounded set of Workspace-relative byte-tree entries. It does not make the payload a Workspace artifact and does not claim omitted Workspace paths are absent from the source Workspace.
- `Coverage: complete` means the representation is intended to cover the complete Workspace byte tree required by this binding.
- `Coverage: bounded` means the representation intentionally covers exactly the qualified decoded representation-entry set under `## Representation Scope`; it is a positive scope claim, not an incomplete/unknown state and not a completeness claim.
- `partial` and `unknown` remain preserved non-ready states for provider activation and must not be reinterpreted as `bounded`.
- `Binding State: verified` is a current qualification claim and is contradictory when either endpoint, required scope when bounded, required correlation, decoder, payload integrity, coverage, or required comparison evidence is unresolved, stale, invalid, or mismatched.
- `declared`, `stale`, and `unresolved` preserve non-ready states and must not be promoted to `verified` from package placement, digest-string presence, successful decoding alone, or application convenience.
- The semantic relation direction is Workspace artifact -> representation payload. The payload is a representation of complete or bounded Workspace-tree bytes; it is not the Workspace artifact itself.

### Representation Scope

Required When

- `Coverage` is `bounded`

Required Fields

- Scope Basis
- Included Entry Authority
- Omitted Entry Meaning
- Source Membership Claim
- Recovery Closure Boundary

Field Value Constraints

- Scope Basis
  - Allowed Value: exact-representation-entry-set
  - Domain Policy: closed
- Included Entry Authority
  - Allowed Value: qualified-decoded-entry-set
  - Domain Policy: closed
- Omitted Entry Meaning
  - Allowed Value: outside-representation-not-absent-from-workspace
  - Domain Policy: closed
- Source Membership Claim
  - Allowed Value: represented-entries-are-workspace-relative-source-bytes
  - Domain Policy: closed
- Recovery Closure Boundary
  - Allowed Value: separate-qualified-closure
  - Domain Policy: closed

Rules

- `Scope Basis: exact-representation-entry-set` means the bounded semantic scope is exactly the normalized representation entries yielded by the qualified payload, declared decoder, archive-entry root, and path mapping; package siblings, detached dependencies, cache entries, and outer transport files are not members merely because they are carried nearby.
- `Included Entry Authority: qualified-decoded-entry-set` means the included path set is derived only after payload integrity, decoder safety, path normalization, collision handling, and mapping qualify. A filename list, requested UI selection, manufacture plan, or outer file map alone is not bounded-scope authority.
- `Omitted Entry Meaning: outside-representation-not-absent-from-workspace` means a Workspace-relative path absent from the bounded representation is outside this representation only. Its absence must not be interpreted as proof that the path is absent from the source Workspace.
- `Source Membership Claim: represented-entries-are-workspace-relative-source-bytes` means this binding asserts that every bounded representation entry corresponds to the declared Workspace-relative path in the source Workspace scope qualified when the binding became `verified`; a consumer must preserve this as a bounded representation claim rather than promoting it to whole-Workspace completeness.
- `Recovery Closure Boundary: separate-qualified-closure` means Parent/recovery material carried outside the representation payload remains transport closure only. Detached recovery bytes do not become bounded Workspace members unless they are also entries of the representation payload and therefore part of the exact bounded scope.
- A bounded binding must include the bound Workspace artifact at `Workspace Artifact Inner Path` as one representation entry so the semantic Workspace endpoint remains directly correlated to the represented path set.
- Bounded scope must not be inferred from the difference between an archive and some unavailable source tree. `Coverage: bounded` requires this explicit scope section and the bounded-only provider contract below.
- A bounded representation may carry one, many, or all currently selected Workspace-relative source entries, but it remains `bounded` until a separately qualified complete-coverage contract proves `Coverage: complete`; accidental equality with a complete tree does not silently change coverage semantics.

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
- Whole-payload digest verification fixes the exact representation bytes only. Provider qualification must additionally validate the declared decoder, path mapping, bound Workspace inner entry, and the declared coverage-mode requirements.
- For `Coverage: bounded`, every qualified decoded representation entry is part of the bounded scope after mapping; consumers must not silently drop a decoded entry from semantic scope or silently add detached/package material to it.
- When verified payload bytes plus the declared decoder/mapping and exact bound Workspace comparison cannot establish required entry/tree identity, complete coverage when `complete`, or exact bounded-entry correlation when `bounded`, `Entry Integrity Manifest` or equivalent separately qualified integrity material is required; consumers must fail closed rather than infer equivalence.

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
  - Allowed Value: verified-bounded-only
  - Domain Policy: closed
- Payload Integrity Requirement
  - Allowed Value: verified-exact-payload-bytes
  - Domain Policy: closed
- Coverage Requirement
  - Allowed Value: complete
  - Allowed Value: bounded
  - Domain Policy: closed
- Staleness Rule
  - Allowed Value: requalify-on-binding-relevant-change
  - Domain Policy: closed
- Selection Rule
  - Allowed Value: exactly-one-binding-per-workspace
  - Allowed Value: explicit-binding-per-bounded-scope
  - Domain Policy: closed
- Multi-Workspace Isolation
  - Allowed Value: independent-binding-closure
  - Domain Policy: closed

Rules

- `Activation Rule: verified-complete-only` permits an archive-backed complete Workspace provider to report ready only when one binding resolves exactly one Workspace artifact and exactly one Representation Payload, `Binding State` is `verified`, `Coverage` and `Coverage Requirement` are `complete`, `Representation Kind` is `exact-workspace-byte-tree-archive`, `Selection Rule` is `exactly-one-binding-per-workspace`, and every required correlation/integrity condition qualifies.
- `Activation Rule: verified-bounded-only` permits only a bounded Workspace-representation provider to report ready. It requires one explicit binding, `Binding State: verified`, `Coverage` and `Coverage Requirement` `bounded`, `Representation Kind: exact-bounded-workspace-byte-tree-archive`, required `## Representation Scope`, `Selection Rule: explicit-binding-per-bounded-scope`, and every required endpoint/scope/correlation/integrity condition to qualify.
- A `verified-bounded-only` provider must expose its coverage as bounded and must not advertise, materialize, alias, cache, or serialize the result as a complete Workspace snapshot merely because all requested paths resolved successfully.
- `Payload Integrity Requirement: verified-exact-payload-bytes` requires the resolved External Payload's `Integrity Status` and `Integrity Target` to qualify the exact representation bytes actually used. The digest value remains owned by the External Payload and must not be duplicated into this binding merely for convenience.
- `Coverage Requirement: complete` preserves the existing complete Workspace-byte-tree provider contract. `Coverage Requirement: bounded` requires the exact qualified decoded entry set and bounded scope semantics above without any whole-Workspace completeness claim. `partial` and `unknown` never satisfy either activation rule.
- `Staleness Rule: requalify-on-binding-relevant-change` means a changed bound Workspace representation, changed representation payload digest/integrity target, changed coverage/scope declaration, changed mapping, changed required inner path/root, changed decoder requirement, changed required manifest, or another canonical binding-relevant change makes the prior verified state stale or unresolved until requalified.
- `Selection Rule: exactly-one-binding-per-workspace` blocks competing ready complete bindings for the same Workspace unless a separate canonical selection authority explicitly resolves the competition.
- `Selection Rule: explicit-binding-per-bounded-scope` permits multiple different bounded bindings for one Workspace because each binding may carry a different exact scope; a consumer must select the exact Workspace Representation artifact through explicit Handoff/package/reference authority and must not choose a bounded binding from Workspace identity, filename, adjacency, archive basename, or path similarity alone.
- `Multi-Workspace Isolation: independent-binding-closure` means a qualified binding for Workspace A has no authority for Workspace B, even when payload bytes, filenames, layouts, or source repositories are identical.
- Provider activation must fail closed on duplicate or ambiguous Workspace identity; incompatible activation/coverage/representation-kind/selection-rule combinations; competing complete bindings without canonical selection authority; bounded activation without an explicitly selected exact binding; missing required bounded scope; missing, stale, unresolved, or schema-invalid binding; missing or schema-invalid External Payload; unavailable or disallowed decoder; payload digest mismatch or wrong integrity target; missing or wrong bound Workspace inner entry; mismatch between exact bound inner Workspace bytes and the referenced Workspace representation when comparison is available or required; duplicate normalized paths; traversal, absolute, or unsafe entries; path/mapping collisions; missing required Mapping Manifest or Entry Integrity Manifest; incomplete required complete coverage; unqualified bounded entry-set correlation; or a binding resolved only through filename, directory, adjacency, route label, package path, or package membership.
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
- `Transport Boundary` must state that package-local location, Repository Transport, Handoff transport, decoder success, retrieval mechanics, and detached Parent/recovery closure are separate from this semantic binding.
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
- `Coverage: bounded` means only that this representation has one exact intentional scope. It must not be used to claim the source Workspace is itself partial, that omitted entries do not exist, that all Workspace sources are present, or that the bounded payload is a substitute Workspace artifact.
- Detached Parent/recovery closure may make represented artifacts recoverable without becoming part of the bounded Workspace representation; transport recovery authority and representation membership must remain separate.

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
- Do not use `tiinex.semantic.package.v1`, `tiinex.external.payload.v1`, or generic `tiinex.relation.v1` alone to imply bounded Workspace-provider activation: Semantic Package owns package discovery, External Payload owns payload reference/integrity, and generic Relation lacks this specialized Workspace scope/correlation contract.

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

- Scope Basis
- Included Entry Authority
- Omitted Entry Meaning
- Source Membership Claim
- Recovery Closure Boundary
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
- `Coverage: bounded` requires `Representation Kind: exact-bounded-workspace-byte-tree-archive`, all `## Representation Scope` fields, `Activation Rule: verified-bounded-only`, `Coverage Requirement: bounded`, and `Selection Rule: explicit-binding-per-bounded-scope`.
- `Coverage: complete` with provider activation requires `Representation Kind: exact-workspace-byte-tree-archive`, `Activation Rule: verified-complete-only`, `Coverage Requirement: complete`, and `Selection Rule: exactly-one-binding-per-workspace`; existing complete bindings do not need a `## Representation Scope` section.
- `partial` and `unknown` must remain non-ready and must not be emitted as shortcuts for intentional bounded export.
- `Mapping Manifest` is required when `Path Mapping` is `manifest`.
- `Entry Integrity Manifest` is required when the chosen decoder/mapping plus verified whole-payload integrity and exact Workspace comparison cannot establish required entry/tree identity, complete coverage for complete activation, or exact bounded-entry correlation for bounded activation.
- Direct creation of a `verified` binding should require the same endpoint, scope when bounded, decoder, mapping, integrity, entry, coverage, and collision checks that provider activation requires.

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

A bounded export uses the same semantic endpoints but must declare bounded scope and bounded-only activation:

```md
# Tiinex Site Workspace Bounded Representation

## Representation Binding

- Workspace Artifact: [Tiinex Site Workspace](tiinex-site.workspace.md)
- Representation Payload: [Selected Site Workspace Bytes](tiinex-site-bounded-workspace-payload.trace.md)
- Representation Kind: exact-bounded-workspace-byte-tree-archive
- Coverage: bounded
- Binding State: verified

## Representation Scope

- Scope Basis: exact-representation-entry-set
- Included Entry Authority: qualified-decoded-entry-set
- Omitted Entry Meaning: outside-representation-not-absent-from-workspace
- Source Membership Claim: represented-entries-are-workspace-relative-source-bytes
- Recovery Closure Boundary: separate-qualified-closure

## Representation Correlation

- Workspace Tree Root: .
- Workspace Artifact Inner Path: .topics/.workspaces/tiinex-site.workspace.md
- Archive Entry Root: .
- Path Mapping: identity-relative-paths
- Collision Policy: reject-ambiguous-or-unsafe-paths
- Decoder Requirement: ZIP decoder with safe-entry validation

## Provider Qualification

- Activation Rule: verified-bounded-only
- Payload Integrity Requirement: verified-exact-payload-bytes
- Coverage Requirement: bounded
- Staleness Rule: requalify-on-binding-relevant-change
- Selection Rule: explicit-binding-per-bounded-scope
- Multi-Workspace Isolation: independent-binding-closure

## Relation Boundary

- Parent Boundary: neither endpoint becomes Parent through this representation relation
- Workspace Identity Boundary: the referenced Workspace artifact remains the semantic Workspace identity
- Payload Identity Boundary: the referenced External Payload owns archive identity and exact payload-byte integrity
- Transport Boundary: package location, archive adjacency, repository transport, detached recovery closure, and decoder success are not binding authority
- Outer Integrity Boundary: package-wide exact-file/tamper authority remains separately owned

## Interpretation Limits

- Does Not Prove: whole-Workspace completeness, absence of omitted source paths, semantic correctness, provenance, authorship, acceptance, completion, source identity, permission, consent, or truth
- Must Not Be Used As: a complete Workspace snapshot, a replacement for Workspace identity, External Payload authority, Parent continuity, repository transport, preservation, Handoff state, or package-wide integrity authority
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
`## Relation Boundary`, and `## Interpretation Limits`. `## Representation Scope`
is additionally required when `Coverage` is `bounded` and is ordinarily omitted
for `Coverage: complete`.

## Interpretation Notes

- final schema id: `tiinex.workspace.representation.v1`
- canonical family: relation-owned specialization of `tiinex.relation.v1`, not a Workspace-field extension
- canonical path: `.topics/.schemas/relation/workspace/representation/tiinex.workspace.representation.v1.schema.md`
- External Payload continues to own exact representation bytes, digest, location, media/format, access, and recovery context
- existing complete coverage semantics remain unchanged: complete activation still requires a verified, non-stale complete binding
- intentional scoped export uses distinct `Coverage: bounded` plus `verified-bounded-only`; `partial` and `unknown` remain non-ready
- bounded provider activation exposes only the exact qualified decoded representation-entry set and must never report whole-Workspace completeness
- detached Parent/recovery closure remains transport material unless the same bytes are also explicit representation-payload entries
- exact whole-payload integrity does not remove the need to qualify decoder, mapping, collisions, the bound Workspace inner entry, and coverage
- per-entry/tree integrity material is conditional, not duplicated by default
- package-local and repository-transport facts remain separate from semantic binding authority
- `tiinex.archive.v1` and `tiinex.zip.v1` remain unclaimed while reserved-only

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: ZnL0uFsniOfLKBLp7X3NUDDS8RobgJ1tx_Op9oiYs6c
