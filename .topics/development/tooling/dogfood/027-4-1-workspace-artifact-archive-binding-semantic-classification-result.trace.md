# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-08-24 23:29:00
  - Authors: Axiom
  - Why: Resolve the Tooling 027-4 canonical semantic blocker without overloading Workspace fields or promoting recipient-relative package placement into semantic authority.
  - Summary: Existing canonical relation and external-payload semantics are sufficient to keep a Workspace artifact semantic while binding a durable exact archive representation when needed; disposable package-local correlation remains transport-control metadata, not Workspace schema truth.
  - Status: complete/local

---

# Tooling 027-4 workspace/archive semantic classification result

The canonical boundary is sufficient without changing `tiinex.workspace.v1`: the Workspace artifact remains the semantic and lineage-bearing workspace entrypoint, while an exact archive is a material representation whose package-local placement is non-authoritative.

## Decision

- State: accepted
- Subject: binding one lineage-bearing `tiinex.workspace.v1` artifact to one exact package-local archive representation of its workspace byte tree
- Decision: do not add or overload a Workspace field for package-local archive identity. For ordinary disposable Handoff carriage, bind the Workspace target to the exact archive through explicit package-local transport-control metadata. When the archive or binding itself has independent durable semantic value, use `tiinex.external.payload.v1` for the archive reference/integrity identity and `tiinex.relation.v1` for the typed non-parent Workspace-to-payload representation relation. No canonical schema mutation is required for Tooling 027-4.
- Canonical schema change: none
- Workspace schema mutation: none
- Production implementation authority: not granted by this decision; Anchor retains acceptance/routing and Loom retains implementation.

## Basis

### Controlling local authority

- Controlling Task: [Tooling 027-4](027-4-workspace-artifact-archive-binding-semantic-classification.trace.md)
- Controlling Task self digest: `BUkMOubaZj36UxUlxUksbkhq2e_b38wJ8wqfTJGH-N0`
- Carried Workspace schema material: [tiinex.workspace.v1](../../../../src/schemas/workspace/tiinex.workspace.v1.schema.md)
- Accepted audit evidence: [Tooling 027 corrected result](027-1-1-handoff-package-audit-schema-conformance-corrected-result.trace.md)
- Anchor disposition: [Tooling 027 Anchor disposition](027-2-handoff-package-audit-anchor-disposition.trace.md)

### Workspace fields must remain un-overloaded

The carried `tiinex.workspace.v1` contract defines a `.workspace.md` artifact as a portable workspace entrypoint. `Workspace Entrypoints` are workspace source declarations. `Repository Transports` deliver repository material without changing canonical repository identity; snapshot metadata owns resolved commit, archive location, and checksum for a repository snapshot. Those semantics do not describe the Workspace artifact's own exact package-local workspace-tree representation.

Therefore:

- `Workspace Entrypoints` must not be used to mean “this archive is the exact byte-tree representation of this Workspace artifact.”
- `Repository Transports` must not be used for a package-local Workspace archive unless the object is actually repository transport material under that contract.
- `Machine State`, `Export Policy`, filenames, sibling placement, directory naming, ZIP adjacency, compression choice, and outer package paths must not be promoted into representation identity.
- A workspace archive filename such as `tiinex-site.workspace.zip` remains a transport locator only.

### Existing canonical companion semantics are sufficient

[tiinex.relation.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/relation/tiinex.relation.v1.schema.md) owns typed non-parent relationships. It explicitly permits a standalone Relation Artifact when the relation itself has semantic content worth preserving and permits payload references as relation targets. It also says an ordinary artifact may project a typed edge only when that artifact's active contract preserves the predicate/target meaning. `tiinex.workspace.v1` has no such archive-representation relation contract, so Tooling must not simply add local relation-shaped fields to Workspace Markdown.

[tiinex.external.payload.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/external/payload/tiinex.external.payload.v1.schema.md) already owns readable references to archives, ZIP exports, binary payloads, package-local or external locations, media/format identity, byte size, and explicit integrity state. Its `Integrity Reference` can bind an integrity method/value to exact archive bytes or an archive entry without treating integrity as semantic truth.

The already-landed [recipient-relative Handoff transport package semantics result](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/development/schema/handoff/002-1-1-recipient-relative-handoff-transport-package-semantics-result.trace.md) further classifies package-local materialization paths, closure descriptors, provider choice, partial/full workspace materialization, and package roundtrip evidence as recipient-relative transport metadata by default. It preserves `tiinex.external.payload.v1` for cases where an archive itself warrants durable semantic recovery/integrity identity and rejects a generic Handoff transport/package schema for disposable carriage.

`tiinex.preservation.v1` is compatible companion semantics when the main durable value is the preservation act, archive copy, snapshot, custody, fidelity, or loss boundary. It is not the minimum owner for this representation binding because External Payload already owns archive location and integrity context, while Relation owns the typed Workspace-to-representation edge.

### Allowed durable two-artifact composition

When durable semantic artifacts are justified, Tooling may consume this composition without changing Workspace:

1. Workspace artifact — the semantic/lineage-bearing `tiinex.workspace.v1` entrypoint.
2. External Payload artifact — the archive representation reference.
   - `Payload Label`: stable readable archive representation label.
   - `Payload Kind`: `archive` or `zip export` as applicable.
   - `Media Type`: normally `application/zip` for ZIP.
   - `Format`: exact archive format/profile when semantically relevant.
   - `Byte Size`: exact archive byte length when known.
   - `Payload Role`: exact workspace-tree representation or equivalent bounded wording.
   - `Location`: recoverable package-local relative path, content-addressed identifier, or other qualified location.
   - `Location Type`: a declared External Payload location type; package-local carriage normally uses `local` while the package path remains a locator, not identity.
   - `Integrity Status`: `verified` only after independent verification; otherwise preserve the actual declared/partial/unavailable state.
   - `Integrity Method`: exact digest/checksum method, e.g. SHA-256 over archive bytes.
   - `Integrity Value`: exact representation digest.
   - `Integrity Target`: the exact archive bytes as stored/carried; if an inner archive entry is separately addressed, name that exact target rather than implying whole-archive coverage.
3. Relation artifact — the typed non-parent binding.
   - `Relation Type`: exact workspace archive representation.
   - `Relation Direction`: Workspace artifact -> External Payload representation.
   - `Relation Scope`: artifact-level package-carriage representation.
   - `Relation Source`: exact Workspace artifact reference when the binding is standalone.
   - `Relation Target`: exact External Payload artifact reference.
   - `Relation Boundary`: representation relation only; not `Parent`, source identity, workspace identity, or Handoff lifecycle state.

This composition is optional. A disposable package does not need to mint durable Payload and Relation artifacts merely to carry bytes.

### Minimum transport-local binding contract for Loom

For the ordinary Tooling 027 carrier candidate, the exact machine binding should remain in explicit package-local control metadata owned by the Handoff materialization/closure layer, not by `tiinex.workspace.v1`. The minimum facts are:

- workspace target
  - exact workspace identifier used by the carrier
  - exact package-carried Workspace artifact reference/path as a locator
  - exact Workspace artifact byte digest or independently qualified self/representation digest sufficient to prevent cross-workspace substitution
- archive representation
  - representation kind: complete workspace snapshot for the candidate under review
  - exact package-local archive locator
  - media type / archive codec or format when decoder selection depends on it
  - exact archive byte size when available
  - exact archive digest and digest method over the stated archive-byte target
- inner workspace correlation
  - explicit normalization rules for inner paths
  - duplicate inner-path rejection
  - unsafe traversal/path rejection
  - exact included entry set for the declared complete snapshot
  - per-entry byte size and digest, or another equivalently exact independently verifiable entry map
  - explicit completeness evidence for the declared workspace boundary
- provider qualification
  - decoder/provider kind and availability state
  - qualification state sufficient to distinguish ready, unavailable decoder, digest mismatch, stale binding, ambiguous binding, duplicate workspace identity, duplicate path, and unresolvable target
- authority boundary
  - package-local path and archive filename are locators only
  - binding applies to one exact Workspace target only
  - no fallback by filename similarity, adjacency, nearest path, prior package provenance, declaration order, or UI selection

A binding that lacks exact Workspace target qualification plus exact archive-byte identity is unresolved. A complete-snapshot claim that lacks exact entry/completeness evidence is unresolved. Multi-workspace packages must qualify each binding independently and must not let one Workspace archive satisfy another Workspace identity.

### Outer package integrity remains separate

`tiinex.package/file-map.json` remains the current outer-package exact-file/tamper authority until a separately accepted migration changes that owner. The Workspace/archive binding may prove that one archive is the exact representation selected for one Workspace and may prove inner-entry bytes; it must not silently replace package-wide file-map truth.

## Consequences

- Loom may implement an archive-backed workspace material provider after Anchor accepts this disposition, without a new semantic-discovery turn and without changing `tiinex.workspace.v1`.
- The implementation should add or extend explicit package-local closure/materialization metadata for Workspace-to-archive binding rather than teach Workspace parsing to infer the archive from sibling names or paths.
- `handoff.workspaces/<id>/...` may be replaced by an archive-backed provider only after single- and multi-workspace equivalence is proven with exact workspace qualification, safe normalized inner addressing, duplicate rejection, exact bytes/digests, unavailable-decoder failure, and stale/mismatched binding failure.
- `handoff.material/**` deduplication remains a downstream optimization. The six measured duplicates from Tooling 027 may be removed only when each Required/Reference Context requirement can resolve to exact qualified archive entries with equivalent fail-closed digest/provenance proof. Detached material remains required where that proof is unavailable or route-local carriage is intentionally distinct.
- Bootstrap/runtime Tooling remains outside nested workspace archives. Persistent-host bootstrap reuse remains conditional on exact version/source/integrity qualification and explicit unavailable/retrieval behavior.
- START and package-root Pointer semantics do not change. They remain non-authoritative orientation projections and must not become Workspace/archive identity.
- Tooling 026 preferred-ingress qualification does not change. Fewer exposed outer leaves may reduce accidental indexing pressure but never grants semantic authority to native archive traversal.
- Compression policy remains implementation-level. STORE/DEFLATE choice may affect performance and bytes but not Workspace/archive semantic identity.
- Sigma with Anchor still owns first-new-format inspection, and no canonical publication, Git mutation, or remote write is authorized by this result.

## Review Conditions

- Anchor should reject any Loom design that places the semantic binding only in archive filenames, directory layout, adjacency, Workspace Entrypoints, Repository Transports, or unqualified in-memory state.
- Anchor should require the first implementation to demonstrate fail-closed states for duplicate/ambiguous Workspace identities, duplicate/unsafe inner paths, unavailable decoder, archive digest mismatch, per-entry mismatch, stale binding, incomplete snapshot evidence, and unresolvable Workspace target.
- If implementation evidence later shows that the package-local closure binding itself needs independent durable lifecycle/provenance beyond one disposable transport, reopen a bounded schema question with that persisted evidence. Do not pre-emptively create a generic package or Workspace representation schema.

## Immediate Next Questions

- Anchor: accept, qualify, or reject this semantic disposition and select the exact Loom implementation tranche.
- Loom after acceptance: implement one package-local Workspace/archive binding descriptor in the existing closure/materialization control plane plus an archive-backed provider, preserving `file-map.json` outer integrity and current route/material fail-closed behavior.
- Sigma with Anchor after implementation: personally inspect the first actual new-format package before ordinary routing continues.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:nPOMzD5otie2nB6WZ7inYw7ucoi6_fQ4RGPrrZNlSB0
