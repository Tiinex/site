# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-21 16:48:00
  - Trace: [001-1-1-1-1-1-site-tooling-v473-portable-parent-authority-coherence-metadata-fidelity-closure-result.trace.md](001-1-1-1-1-1-site-tooling-v473-portable-parent-authority-coherence-metadata-fidelity-closure-result.trace.md)
  - Origin:
    - [relative](001-1-1-1-1-1-site-tooling-v473-portable-parent-authority-coherence-metadata-fidelity-closure-result.trace.md)
    - [browse + git](https://github.com/Tiinex/site/blob/32c7c291101b2a6a72c12241f3107d4a56af81fc/.topics/development/tooling/dogfood/001-1-1-1-1-1-site-tooling-v473-portable-parent-authority-coherence-metadata-fidelity-closure-result.trace.md)
- Repairs:
  - Historical canonical representation repair
    - Target: [pre-repair published representation](https://github.com/Tiinex/site/blob/32c7c291101b2a6a72c12241f3107d4a56af81fc/.topics/development/tooling/dogfood/001-1-1-1-1-1-1-site-tooling-v474-loaded-parent-identity-evidence-closure.trace.md)
    - Note: Canonically repaired after v475-v478 qualified the authoring/validation/reference/integrity oracles; pre-repair Git blob 3fe5e9d11a1a144e912a9d814dda111302e91c82.
    - Reason: Preserve original body/work-result meaning and historical Current Created At while replacing false-PASS envelope, schema-reference, continuity, and integrity representation.
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-21 17:15:00
  - Authors: Architect
  - Why: Architect dogfood audit of v473 found that the loaded-Parent planner still collapses relationship evidence into candidate identity, normalizes identity-bearing strings, and first-wins temporal metadata before exact continuation qualification.
  - Summary: v474 portable loaded Parent identity and evidence closure
  - Status: draft/local

---

# v474 portable loaded Parent identity and evidence closure

## Objective

Make loaded-Parent discovery and projection preserve the same exact identity/evidence distinctions already enforced by the portable exact continuation seam. A loaded artifact must be selectable by its own qualified identity, not by the Parent Trace it declares toward another artifact, and authority-bearing loaded metadata must reach exact Parent qualification without whitespace aliases or first-value collapse.

## Done Criteria

Fix the real dogfood ambiguity where loading the v473 controlling task plus its result and selecting the controlling task by its exact path is reported ambiguous because the result record is also indexed under its Parent Trace. record.trace/Parent Trace is a relationship target and must not become an alternate identity key for the child record. Loaded Parent id/path matching and projection must preserve exact lexical values rather than collapse repeated/internal/surrounding whitespace into aliases; near-but-not-exact parentRef values must not resolve as the same logical record. Where loaded metadata exposes more than one candidate for the same Parent temporal truth (currently currentCreatedAt and createdAt), contradictory non-empty values must remain contradictory/fail closed rather than currentCreatedAt || createdAt first-win selection; one supplied value or multiple exactly equal values may qualify, and omission remains allowed. Apply the same temporal-evidence rule in loaded-parent live lineage if that path consumes the same aliases. Preserve v471-v473 root/child lineage, values-only exact authoring, schemaId/currentSchemaId coherence, exact optional Parent Created At rendering, kind-only blocking, custom-schema fail-closed behavior, provider neutrality, and exact result truth. Add adversarial tests using the real task→result pair shape, exact-vs-near identity strings, and contradictory/equal temporal candidates.

## Scope

Primary owner remains src/tooling/portable/**, especially materialization/epistemic.plan.js and the bounded loaded-parent projection/resolution seam, with live/live.artifact.js only where the same loaded temporal alias defect exists. Do not modify Site UI/Open Schema, canonical schemas, Schema Builder, provider/plugin architecture, remote code policy, or unrelated lineage resolution. Do not make path or Parent Trace semantic identity aliases. Do not add normalization that changes authority-bearing caller/material truth. Authors/viewer first-class support remains a separately observed dogfood product gap, not part of this correction.

## Dependencies

Input is the v473 Tooling result in this same worktree. Architect independently reran v471, v472, v473 focused regressions plus the portable aggregate suite green. Concrete reproduction A on the real v473 artifacts: normalize the v473 task and v473 result as loaded records, then prepare a child proposal whose parentRef is the exact v473 task path; current recordIndex returns portable.materialization.parent.ambiguous because the result record is also indexed under its Parent Trace back to the task. Reproduction B: a loaded record id 'parent  A' / path '.topics/a  b.trace.md' can be selected/projected as 'parent A' / '.topics/a b.trace.md' because normalizeStrings/clean collapses authority-bearing whitespace. Reproduction C: parentProjection and live loaded-parent projection use currentCreatedAt || createdAt, so contradictory temporal evidence is reduced to one value before exact qualification. These are same-family identity/relationship/metadata truth collapses. Q remains HOLD; pending Dev product correction remains deferred until this portable dogfood authoring seam is trustworthy enough for the fresh Dev session.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: J3Vm7K7O7Q-cMg5RCaccy9w4oU053s9ZavXFGS2Jyms
