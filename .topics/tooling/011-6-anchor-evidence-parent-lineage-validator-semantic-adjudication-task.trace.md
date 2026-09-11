# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-03 21:36:51
  - Trace: [011-schema-slice-factory-qualification-builder-readiness-task.trace.md](011-schema-slice-factory-qualification-builder-readiness-task.trace.md)
  - Origin:
    - [relative](011-schema-slice-factory-qualification-builder-readiness-task.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-04 09:56:21
  - Authors: Anchor
  - Why: Kodax factory proof creates structurally valid Evidence with zero errors but existing validator still degrades it solely for missing artifact Parent.
  - Summary: Adjudicate whether the Evidence preservation-parent warning is canonical or stale implementation policy without conflating schema inheritance with artifact Parent continuity.
  - Status: ready/local

---

# Evidence Parent-Lineage Validator Semantic Adjudication

## Objective

Resolve the semantic conflict exposed by the qualified Kodax schema-factory Viewer proof: standalone `tiinex.evidence.v1` creation is structurally valid and passes the shared factory contract with zero errors, yet the existing Evidence validator degrades it through `evidence.preservation.parent.unresolved` solely because no artifact-level Parent edge is declared.

Determine whether that warning is canonical Evidence authority or stale/private implementation policy. Preserve the distinction between schema inheritance/specialization and artifact continuity Parent semantics. Do not weaken Evidence preservation/provenance obligations merely to make the warning disappear.

## Done Criteria

- Axiom explicitly classifies `evidence.preservation.parent.unresolved` as canonical, non-canonical, or conditionally valid, with the exact authority basis.
- The result states whether an Evidence artifact is required to continue a Preservation artifact through artifact `Parent`, may do so only when truthful continuity exists, or must normally represent preservation basis through Evidence fields/companion references instead.
- Schema inheritance (`Evidence` specializes `Preservation`) remains distinct from artifact continuity (`Parent`). No validator may manufacture an artifact Parent merely because one schema inherits another.
- If the current warning is non-canonical, Axiom specifies the minimal correct validation disposition: removal, replacement, or narrower condition, including whether any finding should instead be based on `Preservation Basis`, `Preservation Artifact`, `External Payload`, provenance/fidelity fields, or another already-owned surface.
- The decision is precise enough for Loom to implement without schema prose guessing or Viewer-private policy.
- No broad factory acceptance or schema fan-out occurs until the semantic conflict is reconciled and the factory proof reruns cleanly at the intended validation state.

## Scope

- Current canonical/candidate `tiinex.evidence.v1`, `tiinex.preservation.v1`, Root continuity semantics, and the already-qualified Evidence structural inheritance override.
- Existing Site Evidence validator finding `evidence.preservation.parent.unresolved` and its conceptual boundary only; Axiom does not implement Site code.
- The Kodax four-schema factory proof as observed evidence of the conflict.

## Dependencies

- [Schema Slice Factory Qualification + Builder Readiness](011-schema-slice-factory-qualification-builder-readiness-task.trace.md)
- [Axiom Schema Factory Canonical Repair Disposition](011-3-1-axiom-schema-factory-canonical-repair-disposition-decision.trace.md)
- [Kodax Schema Factory Viewer Proof Implementation Evidence](011-5-1-2-kodax-schema-factory-viewer-proof-implementation-evidence.trace.md)

## Exclusions

- No remote mutation or publication.
- No special-case Site workaround before semantic adjudication.
- No requirement to fabricate a Preservation artifact merely to satisfy a validator.
- No reinterpretation of schema inheritance as artifact lineage.
- No broad schema fan-out or Sigma factory acceptance in this task.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [011-schema-slice-factory-qualification-builder-readiness-task.trace.md](011-schema-slice-factory-qualification-builder-readiness-task.trace.md)
  - Value: k-972tR9t7s3QQpQ13Id5oG5qHVIqK05f_LEIr_MM5k

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: Woyc40LHRgUO-yxOexdiM0nfHwGoTuHl7W0k0A_dIJc