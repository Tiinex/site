# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-08-24 23:37:00
  - Authors: Anchor
  - Why: Independently disposition Axiom's Tooling 027-4 semantic classification before authorizing any archive-backed Handoff carrier implementation.
  - Summary: Anchor accepts the Tooling 027-4 classification — disposable Workspace/archive correlation belongs in package-local closure/materialization truth, while durable archive identity and non-parent representation relations remain owned by External Payload and Relation when independently warranted.
  - Status: accepted-bounded/local

---

# Tooling 027-4 Anchor acceptance — Workspace/archive semantic boundary closed

Axiom's classification is accepted for the bounded recipient-relative Handoff carrier problem. The accepted boundary closes the retained Tooling 027 semantic blocker without mutating `tiinex.workspace.v1` or creating a generic package schema.

## Decision

- State: accepted-bounded / implementation-authorized
- Subject: canonical semantic ownership of one Workspace artifact to one exact package-local workspace archive representation
- Decision: accept Axiom's distinction. For disposable Handoff carriage, exact Workspace↔archive correlation is package-local closure/materialization control metadata. The Workspace artifact remains the semantic/lineage-bearing entrypoint. If an archive or the representation relation later has independent durable semantic value, `tiinex.external.payload.v1` may own the archive reference/integrity identity and `tiinex.relation.v1` may own the typed non-parent Workspace→payload representation relation. No canonical schema mutation is required for Tooling 027.
- Boundary: this acceptance authorizes only a bounded Loom implementation tranche. It does not switch default manufacture, accept a new carrier format, create durable Payload/Relation artifacts for every package, replace package-wide file-map authority, or authorize publication/remote mutation.

## Basis

- The Axiom return package independently orients `ready`; context audit is clean and the selected Axiom→Anchor Handoff is compiled-schema validated with independently verified c14n-v2 self integrity.
- Axiom's `tiinex.decision.v1` result independently audits clean with verified c14n-v2 self integrity and no Parent claim.
- Canonical `tiinex.relation.v1` explicitly owns typed non-parent relationships, permits payload references as targets, and forbids weakening Parent into a generic graph edge.
- Canonical `tiinex.external.payload.v1` explicitly owns readable archive/ZIP payload references, local/content-addressed locations, byte size/media identity, and integrity method/value/target without treating integrity as semantic truth.
- The canonical recipient-relative Handoff transport semantics decision already classifies materialization paths, closure descriptors, provider choice, partial/full workspace materialization, and package roundtrip evidence as disposable transport metadata by default; External Payload is optional only when the archive itself deserves durable recovery/integrity identity.
- The accepted Tooling 027 audit independently established that Workspace Entrypoints, Repository Transports, filename adjacency, compression, and current package placement cannot truthfully create the missing binding.

## Accepted Implementation Contract

- Bind one exact Workspace target to one exact archive representation through explicit package-local control metadata, including a qualified Workspace identifier/reference and digest, exact archive locator/media/size/digest, safe normalized inner-entry map with per-entry exact bytes/digests, and explicit completeness evidence for any complete-snapshot claim.
- Resolve archive-backed bytes by qualified Workspace identity plus normalized inner path; never by filename similarity, adjacency, declaration order, nearest path, prior-package provenance, or UI order.
- Fail closed for duplicate/ambiguous Workspace identities, duplicate/unsafe inner paths, unavailable decoder/provider, archive digest mismatch, per-entry mismatch, stale binding, incomplete snapshot evidence, or unresolvable Workspace target.
- Preserve `tiinex.package/file-map.json` as the current outer-package exact-file integrity owner during this migration; inner archive integrity is additional representation qualification, not replacement package authority.
- Keep bootstrap/runtime Tooling outside nested workspace archives; keep START/Pointer as non-authoritative orientation projections; keep Tooling 026 preferred-ingress semantics unchanged.
- Deduplicate `handoff.material/**` only where an exact qualified workspace-archive entry proves equivalent Required/Reference Context carriage; retain detached fallback otherwise.

## Consequences

- Open Tooling 027-5 to Loom for one opt-in archive-backed carrier-v2 implementation and full downstream acceptance preflight.
- Do not change normal/default Handoff manufacture yet. Loom must return to Anchor using the current qualified carrier; the new topology remains opt-in until Anchor acceptance and Sigma inspection.
- After Loom returns, Anchor must independently diff/replay the implementation and, only if accepted, generate the first human-deliverable new-format package locally.
- When that first package exists, ordinary routing stops and Sigma receives it for the retained personal carrier audit before any fresh worker is asked to consume it.
- Preserve the Axiom `5m49s` host-reported duration separately as a temporal annotation; timing has no authority over this semantic acceptance.

## Review Conditions

- Reopen the semantic question only if implementation evidence shows that the package-local binding itself needs independent durable lifecycle/provenance beyond one disposable transport, or if no existing Workspace artifact can be truthfully and uniquely qualified as the archive target without minting transport-only semantic identity.
- Reject any implementation that moves semantic authority into filenames, archive placement, Workspace Entrypoints, Repository Transports, unqualified in-memory state, or stored digest string equality without independent byte verification.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:YBwUAZhv2cpZriI9IEhnDq8nYUvjQXRl0GhhVlKF3SU
