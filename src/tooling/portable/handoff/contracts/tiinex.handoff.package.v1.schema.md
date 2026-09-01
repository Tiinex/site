# Continuity Context

- Envelope Schema: [tiinex.root.v1](../../../tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.root.v1](../../../tiinex.root.v1.schema.md)
  - Created At: 2026-09-01 14:19:00
  - Trace: [tiinex.root.v1.schema.md](../../../tiinex.root.v1.schema.md)
  - Origin:
    - [relative](../../../tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.handoff.package.v1](tiinex.handoff.package.v1.schema.md)
  - Created At: 2026-09-01 14:19:00
  - Authors: Axiom
  - Summary: Narrow receiver-facing Handoff carrier schema for package identity, Start/bootstrap exposure, package-local complete Workspace snapshot bindings, route discovery, and carrier continuity without owning Handoff transfer semantics or generic Workspace representation semantics.

---

# Handoff Package

- Status: maintained schema note

## Summary

Defines one receiver-facing Handoff carrier identity and discovery contract.

`tiinex.handoff.package.v1` owns only the semantic facts that belong to the carrier itself: how a recipient enters the carrier, how complete package-local Workspace snapshots are bound to explicit Workspace artifacts, how the selected Handoff route is discovered, and how carrier convenience lineage is represented.

Despite its namespace, this schema is not a specialization of `tiinex.handoff.v1`. It does not transfer work or responsibility. It is also not a specialization of `tiinex.semantic.package.v1`, whose maintained job is portable schema and Transition discovery.

## Core Semantics

- Handoff Package = one recipient-facing carrier identity/discovery boundary.
- The authoritative Handoff remains a `tiinex.handoff.v1` artifact in its owning Workspace; carrying or pointing to it does not duplicate or replace Handoff semantics.
- The authoritative Workspace remains a `tiinex.workspace.v1` artifact. A package-local snapshot is a representation of that Workspace's source bytes, not the Workspace artifact itself.
- A Handoff Package may directly bind a carried Workspace artifact to one exact package-local complete Workspace snapshot when the relation exists only for this carrier and the package schema owns all qualification rules needed to re-establish that binding from the package bytes.
- That package-specific binding is not a `tiinex.workspace.representation.v1` artifact and does not activate generic Workspace Representation authority outside this carrier.
- A standalone `tiinex.external.payload.v1` artifact is not required for the same package-local Workspace snapshot when no independent payload identity, location, access, retention, or recovery semantics need to survive apart from the package binding.
- A standalone `tiinex.workspace.representation.v1` artifact is not required for the same package-local complete snapshot when no independently selectable representation relation, bounded scope, multiple-representation choice, external provider contract, or separate representation lifecycle needs to survive apart from the package binding.
- Generic External Payload and Workspace Representation schemas remain authoritative wherever those independent semantic jobs exist.
- Package-local `Parent` lineage among carrier artifacts may be intentionally manufactured as recipient continuity/navigation. Its semantic subject is the carrier artifact sequence only; it does not rewrite source-artifact Parent, Origin, ownership, authority, Role hierarchy, Handoff endpoints, or participation.
- Package-local Role Pointers are discovery/grounding aids only. Handoff endpoint and participation meaning remains owned by the authoritative Handoff and any separately authoritative typed Relation.
- Workspace placement of a Handoff Pointer is route-resolution navigation: it identifies the Workspace from which the authoritative Handoff is to be resolved, not ownership or authority beyond that resolution fact.
- Package membership, path, filename, adjacency, archive entry order, digest equality, or successful transport do not by themselves create semantic authority.

## Schema Validation Contract

### Handoff Package Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.handoff.package.v1`

Rules

- `tiinex.handoff.package.v1` identifies artifacts whose main job is to declare one recipient-facing Handoff carrier and its bounded discovery/binding contract.
- The package artifact must remain human-readable without a hidden compatibility manifest, application-local state, repository search, or manual archive archaeology.
- The package artifact must not become an exhaustive file inventory, verification receipt, Handoff duplicate, Workspace duplicate, generic workflow engine, or general transport ontology.
- Prose outside `Schema Validation Contract` may explain the package but does not add machine requirements.

### Handoff Package Body

Required Shape

- first body heading after the continuity envelope
- `## Package Identity` section
- `## Bootstrap Exposure` section
- `## Workspace Snapshot Bindings` section
- `## Route Discovery` section
- `## Carrier Continuity` section
- `## Qualification Boundary` section
- `## Interpretation Limits` section

Optional Sections

- Evidence Basis
- Related Artifacts
- References

Rules

- Required sections must be readable and machine-extractable.
- `Workspace Snapshot Bindings` uses repeated named declarations.
- The body must not reproduce the authoritative Handoff body, Workspace body, Role body, or an exhaustive archive/file map.

### Package Identity

Required Fields

- Package Role
- Carrier Kind

Field Value Constraints

- Package Role
  - Allowed Value: recipient-facing-handoff-carrier
  - Domain Policy: closed
- Carrier Kind
  - Allowed Value: self-contained
  - Domain Policy: closed

Rules

- `Package Role` states that the artifact describes the recipient-facing Handoff carrier.
- `Carrier Kind: self-contained` means every material source byte required by the selected qualified route is carried by the package according to the package's explicit bindings and closure rules.
- Package identity does not create identity for contained Workspace, Handoff, Role, Pointer, or other source artifacts.

### Bootstrap Exposure

Required Fields

- Start Artifact
- Tooling Bootstrap Descriptor
- Bootstrap Rule

Field Value Constraints

- Start Artifact
  - Allowed Shape: Markdown Link
  - Domain Policy: closed
- Tooling Bootstrap Descriptor
  - Allowed Shape: Markdown Link
  - Domain Policy: closed
- Bootstrap Rule
  - Allowed Value: start-then-qualified-bootstrap
  - Domain Policy: closed

Rules

- `Start Artifact` must resolve to the package-local recipient ingress artifact, ordinarily a `tiinex.pointer.v1`.
- `Tooling Bootstrap Descriptor` must resolve to the package-local artifact that owns the Tooling bootstrap payload reference and exact bootstrap-payload integrity, ordinarily `tiinex.external.payload.v1`.
- The package schema does not absorb bootstrap payload semantics merely because the bootstrap bytes are carried inside the package.
- `Bootstrap Rule: start-then-qualified-bootstrap` means a cold recipient reads Start first, qualifies the declared bootstrap descriptor/payload, then transfers semantic package interpretation to the qualified Tooling path before following the selected route.

### Workspace Snapshot Bindings

Declaration Shape

- First-Level Hyphen List Item

Required Fields

- Workspace Id
- Workspace Artifact
- Snapshot Path
- Workspace Artifact Inner Path
- Snapshot Kind
- Coverage
- Binding State
- Integrity Method
- Integrity Value

Optional Fields

- Byte Size
- Notes

Field Value Constraints

- Workspace Artifact
  - Allowed Shape: Markdown Link
  - Domain Policy: closed
- Snapshot Path
  - Allowed Shape: Markdown Link
  - Domain Policy: closed
- Snapshot Kind
  - Allowed Value: exact-workspace-byte-tree-archive
  - Domain Policy: closed
- Coverage
  - Allowed Value: complete
  - Domain Policy: closed
- Binding State
  - Allowed Value: verified
  - Allowed Value: declared
  - Allowed Value: unresolved
  - Domain Policy: closed
- Integrity Method
  - Allowed Value: sha256
  - Domain Policy: closed

Rules

- `Workspace Id` is a package-local readability/routing handle. It does not replace the Workspace artifact as semantic Workspace identity.
- `Workspace Artifact` must resolve to exactly one carried artifact whose Current Schema is `tiinex.workspace.v1`.
- `Snapshot Path` must resolve to one package-local payload entry containing the exact complete Workspace byte-tree snapshot for this binding. External URLs and inferred filenames are not allowed.
- `Workspace Artifact Inner Path` is the exact normalized Workspace-relative path at which the bound Workspace artifact must occur inside the snapshot.
- `Snapshot Kind: exact-workspace-byte-tree-archive` fixes this v1 relation to a path-addressable complete Workspace source-byte archive. It does not create or imply a generic Archive or ZIP schema.
- `Coverage: complete` is required. `bounded`, `partial`, and `unknown` are not allowed in this package-local shortcut. If bounded or independently selectable representation semantics are needed, use the generic Workspace Representation contract instead of weakening this binding.
- `Integrity Method: sha256` and `Integrity Value` identify the exact package-member bytes at `Snapshot Path`. `Integrity Value` must be a lowercase 64-character hexadecimal SHA-256 digest.
- `Binding State: verified` is valid only when exact snapshot bytes, safe decoding, normalized path mapping, complete coverage, and exact Workspace-artifact inner-byte correlation have qualified. A receiver must requalify these facts from the carried bytes; the state is not a transport receipt or acceptance proof.
- `declared` and `unresolved` preserve prequalification states but do not satisfy a qualified Handoff carrier.
- `Byte Size`, when present, is a mechanical consistency aid only and does not replace exact byte integrity.
- The archive root is fixed at `.`, Workspace-relative paths map by normalized identity-relative paths, and unsafe, absolute, traversal, duplicate-normalized, or ambiguous entries must fail qualification.
- Exact equality between the carried `Workspace Artifact` bytes and the entry at `Workspace Artifact Inner Path` is required for a verified binding.
- A verified package-local complete binding may activate only the package recipient's complete Workspace source provider for this exact carrier snapshot.
- The binding must not be exported, cached, or re-described as a generic `tiinex.workspace.representation.v1` relation unless that generic relation is separately materialized and qualified.
- If the snapshot needs independent payload identity/location/access/recovery semantics outside the package, materialize `tiinex.external.payload.v1`.
- If the Workspace-to-representation relation needs independent lifecycle, selection, bounded scope, multiple-representation choice, or generic provider authority outside the package, materialize `tiinex.workspace.representation.v1` and its required payload authority.

### Route Discovery

Required Fields

- Route Placement Rule
- Continue-From Rule
- Pre-Handoff Closure Rule

Field Value Constraints

- Route Placement Rule
  - Allowed Value: authoritative-workspace-descended
  - Domain Policy: closed
- Continue-From Rule
  - Allowed Value: exact-package-local-handoff-pointer
  - Domain Policy: closed
- Pre-Handoff Closure Rule
  - Allowed Value: selected-pointer-carrier-ancestors
  - Domain Policy: closed

Rules

- `Route Placement Rule: authoritative-workspace-descended` means a package-local Handoff Pointer route is placed below the packaged Workspace whose source snapshot contains the authoritative Handoff target.
- `Continue-From Rule: exact-package-local-handoff-pointer` means the recipient is given one exact package-local Handoff Pointer path or an explicit qualified selection among such pointers.
- `Pre-Handoff Closure Rule: selected-pointer-carrier-ancestors` means route-specific material required before following the authoritative Handoff must be discoverable on the selected pointer's carrier-local ancestor closure.
- Carrier-local ancestor closure is a recipient discovery plan. It does not make ancestor placement semantic participation, delegation, authority precedence, source Parent truth, Required Context meaning, or Handoff endpoint identity.
- Package-local Role Pointers included on that closure remain `tiinex.pointer.v1` artifacts. Their placement permits pre-Handoff grounding only and must not be used to infer participation.
- The authoritative Handoff target remains the sole owner of Handoff transfer semantics.

### Carrier Continuity

Required Fields

- Carrier Dimension
- Carrier Checkpoint

Optional Fields

- Parent Carrier Dimension
- Major Reason

Field Value Constraints

- Carrier Checkpoint
  - Allowed Value: progression
  - Allowed Value: major
  - Domain Policy: closed

Rules

- `Carrier Dimension` and `Parent Carrier Dimension`, when present, are human progress/retention projections for carriers only.
- Carrier dimensions must be numeric hyphen-separated paths such as `001`, `001-1`, or `001-1-1`; alphabetic lineage components are invalid.
- A child progression extends the parent carrier dimension without advancing or rewriting any contained artifact lineage.
- `Carrier Checkpoint: major` requires a meaningful `Major Reason` and a separately qualified complete source closure required by the governing carrier profile.
- Carrier continuity must not be used to infer or synchronize Root Parent, Trace, Origin, Handoff lifecycle, Workspace identity, or Role authority.

### Qualification Boundary

Required Fields

- Receiver Qualification
- Failure Policy
- Derived Inventory Authority

Field Value Constraints

- Receiver Qualification
  - Allowed Value: reverify-carried-authority-and-bytes
  - Domain Policy: closed
- Failure Policy
  - Allowed Value: fail-closed
  - Domain Policy: closed
- Derived Inventory Authority
  - Allowed Value: none
  - Domain Policy: closed

Rules

- `Receiver Qualification: reverify-carried-authority-and-bytes` requires the recipient to validate the visible package artifacts, selected route, exact bound payload bytes, and required source correlation rather than trusting placement or a sender-side receipt.
- `Failure Policy: fail-closed` means missing, ambiguous, stale, unsafe, mismatched, or unqualified required material blocks a qualified carrier instead of being repaired by filename guessing, repository-global search, hidden network access, or compatibility metadata.
- `Derived Inventory Authority: none` means generated manifests, indexes, checksums, compatibility JSON, file maps, and archive listings may support mechanical verification but do not override the visible semantic artifacts and exact bytes unless another explicit schema grants them authority.
- A checksum match does not prove semantic correctness, provenance, authorship, acceptance, participation, or source identity beyond the exact qualified binding facts.

### Interpretation Limits

Required Fields

- Does Not Mean
- Must Not Be Used To Claim
- Generic Payload Boundary
- Generic Representation Boundary

Rules

- `Does Not Mean` must name important interpretations the package does not support.
- `Must Not Be Used To Claim` must name claims requiring separate authority.
- `Generic Payload Boundary` must preserve `tiinex.external.payload.v1` for payload identity/location/integrity/access/recovery semantics that have independent value outside this package-local binding.
- `Generic Representation Boundary` must preserve `tiinex.workspace.representation.v1` for independently meaningful Workspace representation relations, including bounded scope, multiple selectable representations, generic provider activation, or separate relation lifecycle.
- A Handoff Package must not be used as a Handoff, Workspace, Role, Relation, External Payload, Workspace Representation, preservation record, delivery receipt, acceptance record, provenance record, or generic semantic package.
- Package membership and discovery do not prove authority over contained source artifacts.

### File Naming

Recommended Shape

- `<numeric-dimension>-tiinex-handoff-package.trace.md`

Rules

- Package artifact filenames should make the carrier role readable without becoming semantic identity.
- Filename, dimension, and root placement do not replace the Current Schema declaration.

## Artifact Creation Contract

### Creation Scope

Create `tiinex.handoff.package.v1` only when one self-contained recipient-facing Handoff carrier needs a durable carrier identity/discovery contract that cannot be reconstructed more appropriately from the authoritative Handoff and Workspace artifacts alone.

Do not create this schema merely because a ZIP exists.

### Required Inputs

- Package Role
- Carrier Kind
- Start Artifact
- Tooling Bootstrap Descriptor
- Bootstrap Rule
- one or more qualified Workspace Snapshot Bindings
- Route Placement Rule
- Continue-From Rule
- Pre-Handoff Closure Rule
- Carrier Dimension
- Carrier Checkpoint
- Receiver Qualification
- Failure Policy
- Derived Inventory Authority
- Interpretation Limits

### Generation Rules

- Keep the package artifact narrow and human-readable.
- Bind only package-local complete Workspace snapshots through this v1 shortcut.
- Preserve the Workspace artifact as semantic Workspace identity.
- Reuse External Payload and Workspace Representation schemas when their independent semantics are needed.
- Keep bootstrap/cache payload descriptors under their own owning schemas.
- Do not duplicate Handoff parties, transfers, Required Context, Role participation, or Workspace body content.
- Do not materialize receipt/checksum/index artifacts merely because Tooling can compute them.
- Fail closed when a required binding or selected route cannot be qualified.

## Minimal Example

```md
# Handoff Package

## Package Identity

- Package Role: recipient-facing-handoff-carrier
- Carrier Kind: self-contained

## Bootstrap Exposure

- Start Artifact: [Start](001-1-READ-BEFORE-PROCEEDING.trace.md)
- Tooling Bootstrap Descriptor: [Bootstrap](001-2-bootstrap.trace.md)
- Bootstrap Rule: start-then-qualified-bootstrap

## Workspace Snapshot Bindings

- docs
  - Workspace Id: docs
  - Workspace Artifact: [Docs Workspace](001-2-3-docs.workspace.md)
  - Snapshot Path: [Docs Snapshot](001-2-3-docs-workspace.zip)
  - Workspace Artifact Inner Path: .topics/.workspaces/tiinex-docs.workspace.md
  - Snapshot Kind: exact-workspace-byte-tree-archive
  - Coverage: complete
  - Binding State: verified
  - Integrity Method: sha256
  - Integrity Value: <64 lowercase hexadecimal characters>

## Route Discovery

- Route Placement Rule: authoritative-workspace-descended
- Continue-From Rule: exact-package-local-handoff-pointer
- Pre-Handoff Closure Rule: selected-pointer-carrier-ancestors

## Carrier Continuity

- Carrier Dimension: 001-1
- Parent Carrier Dimension: 001
- Carrier Checkpoint: progression

## Qualification Boundary

- Receiver Qualification: reverify-carried-authority-and-bytes
- Failure Policy: fail-closed
- Derived Inventory Authority: none

## Interpretation Limits

- Does Not Mean: package membership is semantic ownership or Handoff participation
- Must Not Be Used To Claim: recipient acceptance, Handoff completion, source provenance, or Role authority
- Generic Payload Boundary: use External Payload when package-local snapshot bytes need independent payload semantics
- Generic Representation Boundary: use Workspace Representation when the Workspace representation relation needs independent, bounded, selectable, or generic provider semantics
```

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: EhpcG3P3id741U92Hx_Ti97Od552gAMo3ikSQPBictc
