# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-24 23:16:00
  - Authors: Anchor
  - Why: Resolve the one semantic blocker retained by the accepted Tooling 027 audit before any production recipient-relative carrier can bind a lineage-bearing Workspace artifact to an exact package-local workspace archive.
  - Summary: Tooling 027-4 — Axiom classification of workspace-artifact to exact package-local archive representation binding and the smallest truthful canonical schema boundary required for implementation.
  - Status: open/local

---

# Tooling 027-4 — workspace artifact/archive binding semantic classification

## Objective

Determine, from exact canonical Tiinex schema authority rather than Site implementation convenience, how a lineage-bearing `tiinex.workspace.v1` artifact may be bound to one exact package-local archive representation of that workspace. Decide whether existing canonical schemas already express the relationship truthfully or whether the smallest new/extended semantic owner is required. Return an implementation-ready classification without implementing the carrier or mutating canonical schema sources in this turn.

## Done Criteria

- Inspect the exact canonical `tiinex.workspace.v1` contract and any genuinely adjacent canonical schema families needed to classify representation, relation, preservation, resource, package-local material, or transport semantics; do not infer authority from filenames, package placement, current Site JSON controls, or desired implementation shape.
- Explicitly decide whether `Workspace Entrypoints`, `Repository Transports`, or another existing Workspace field can truthfully own an exact package-local workspace archive binding. If not, state why they must remain un-overloaded.
- Classify the intended two-layer meaning: the Workspace artifact remains the semantic/lineage-bearing workspace entrypoint and the archive remains an exact representation/material carrier of workspace bytes. State whether that distinction is supported as-is, requires an existing companion schema, or requires a bounded new schema/extension.
- If an existing schema is sufficient, identify the exact schema and fields/relationship semantics that Tooling may consume, including how the Workspace artifact target and exact archive representation are bound without filename or directory authority.
- If no existing schema is sufficient, specify the smallest truthful schema-authority need: proposed owner/family, parent schema if any, required human-readable fields, required interpretation limits, and why a new family/extension is narrower than overloading Workspace. Do not edit Tiinex/docs in this turn.
- Make the future implementation contract explicit enough that Loom does not need a semantic-discovery turn: identify the minimum binding facts needed to resolve an archive-backed workspace provider, including Workspace target/reference, exact archive representation identity/digest, archive media/codec or representation kind when semantically relevant, and exact inner-entry correlation/integrity boundary when required.
- Keep package-local location, archive filename, ZIP adjacency, compression choice, and outer carrier path non-authoritative unless a canonical schema explicitly says otherwise.
- Preserve fail-closed multi-workspace behavior: one Workspace binding must not silently satisfy another workspace; duplicate/ambiguous Workspace identities, duplicate inner paths, unavailable decoders, digest mismatch, stale binding, or unresolvable target must remain explicit unresolved/blocked states rather than heuristic recovery.
- Preserve the Tooling 027 separation between semantic binding and package tamper authority: `tiinex.package/file-map.json` remains the current outer-package exact-file integrity owner until separately migrated; a Workspace/archive semantic binding must not silently replace package-wide file-map truth.
- State whether the classification changes any requirement for `handoff.material/**` deduplication, bootstrap placement, Pointer/START semantics, or Tooling 026 preferred ingress. These should remain downstream implementation consequences unless canonical semantics require otherwise.
- Return one explicit decision/disposition to Anchor with: allowed semantics, forbidden interpretations, canonical authority used, unresolved authority if any, whether a canonical schema change is required, and the exact next implementation boundary for Loom.
- Fail closed if canonical authority is insufficient. Do not invent a relation merely because the candidate carrier is attractive or smaller.

## Scope

Canonical semantic classification of one relationship only: a Tiinex Workspace artifact/instance to an exact package-local archive representation of its workspace byte tree for recipient-relative Handoff carriage. The task may compare existing schema families and propose the smallest bounded schema-authority follow-up, but it does not implement archive providers, migrate the production carrier, delete current control JSON, change Viewer/CLI UX, author canonical schemas remotely, publish artifacts, or perform Git/remote mutation.

## Dependencies

- [Tooling 027 original audit task](027-handoff-package-workspace-archive-and-control-plane-minimality-audit.trace.md) owns the carrier audit objective and candidate boundaries.
- [Tooling 027 corrected result](027-1-1-handoff-package-audit-schema-conformance-corrected-result.trace.md) preserves the accepted audit findings, quantitative candidate evidence, and exact semantic blocker.
- [Tooling 027-3-2 Anchor acceptance](027-3-3-full-source-material-closure-regression-anchor-acceptance.trace.md) closes the selected-Handoff conformance/readiness correction and explicitly opens this retained classification tranche.
- [Current Workspace schema material](../../../../src/schemas/workspace/tiinex.workspace.v1.schema.md) is the carried Site source representation used by current Tooling; canonical Tiinex/docs authority must still control interpretation.
- [Tooling 027 Anchor disposition](027-2-handoff-package-audit-anchor-disposition.trace.md) records why archive binding cannot be inferred from current carrier behavior and why Axiom classification precedes implementation.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:BUkMOubaZj36UxUlxUksbkhq2e_b38wJ8wqfTJGH-N0
