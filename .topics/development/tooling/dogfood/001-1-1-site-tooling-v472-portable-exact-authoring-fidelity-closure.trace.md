# Continuity Context
- Envelope Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](tiinex.task.v1.schema.md)
  - Created At: 2026-08-21 15:37:00
  - Trace: record:.topics/development/tooling/dogfood/001-1-site-tooling-v471-portable-lineage-authoring-closure-result.trace.md
  - Origin: .topics/development/tooling/dogfood/001-1-site-tooling-v471-portable-lineage-authoring-closure-result.trace.md
  - Boundary: Portable local material; no GitHub provenance inferred.
- Current
  - Current Schema: [tiinex.task.v1](tiinex.task.v1.schema.md)
  - Created At: 2026-08-21 15:58:00
  - Summary: v472 portable exact authoring fidelity closure
  - Status: draft/local
  - Why: Architect adversarial audit found remaining exact-authoring false-PASS and caller-fidelity defects in the v471 portable closure.
---
# v472 portable exact authoring fidelity closure

## Objective

Close the remaining portable exact-authoring truth gaps exposed by dogfooding: exact built-in creation must work from the canonical values-only CLI/operation shape without synthesized title/summary conflicts, and exact continuation must prove the concrete Parent identity it actually renders rather than merely observing that enough Parent fields are present.

## Done Criteria

A built-in Topic or Task with a ready exact creation contract can be created-clean from create-local-draft using only --schema plus required --values and Created At; omitted title/summary convenience fields do not inject conflicting defaults. Exact one-line caller values, including repeated internal whitespace and other representable content, are preserved rather than normalized or truncated by generic portable code. Unrepresentable values fail closed rather than being silently rewritten. If the exact renderer returns empty/unqualified output, the operation must not claim exact tooling was successfully applied. For continue-from-record, the concrete result is requalified against an immutable/coherent Parent snapshot: id parent-A plus continuationTrace record:parent-B must not return created-clean, and a kind-only Parent must not acquire schema authority. Parent Trace, Parent Schema and Origin must remain bound to the exact qualified parent identity. Preserve the v471 root Topic + Task artifact-set and live-lineage regression, custom-schema fail-closed behavior, search-lineage discovery and provider neutrality. Add adversarial regression coverage for values-only CLI/operation creation, exact value fidelity, contradictory Parent identity, kind-only Parent authority and qualification truth.

## Scope

Primary owner remains src/tooling/portable/** in the exact draft/artifact-set/live authoring seam and focused portable tests/CLI adapters only. Prefer consuming the shared Site creation contract/result qualification rather than duplicating schema-specific validation. Do not change canonical schema bytes, Site UI/Open Schema, Schema Builder, provider/plugin architecture, remote code policy, or unrelated portable functionality. Do not add schema-id or field-vocabulary switches.

## Dependencies

Input is the v471 dogfood Tooling result in this same repository snapshot. Architect independently verified the v471 intended root/child/live tests pass and lineage resolves. Adversarial reproduction 1: createPortableLocalDraft with transitionType continue-from-record, Parent {id:"parent-A", path:".topics/p.trace.md", schemaId:"tiinex.topic.v1", continuationTrace:"record:parent-B"} returns status created-clean, creationMode exact-site-creation-contract, exactRuntimeValidation true, while rendered Parent Trace is record:parent-B. Adversarial reproduction 2: a built-in Topic with all required values but omitted title/summary returns created-invalid with empty Markdown while qualification says exactCreateToolingApplied=true; this is the ordinary CLI shape because create-local-draft supplies empty convenience flags when they are omitted. Adversarial reproduction 3: a Parent carrying id/path plus kind:"tiinex.topic.v1" but no schemaId is accepted as exact continuation authority. These are same-seam false-PASS/fidelity defects, not a request for broader architecture work. Q remains HOLD and the pending Dev correction stays deferred until this Tooling prerequisite closes.
# Continuity Integrity
- Draft Local Integrity
  - Method: browser-local-draft
  - Value: pending-publication-or-export
