# Continuity Context
- Envelope Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](tiinex.task.v1.schema.md)
  - Created At: 2026-08-21 16:25:00
  - Trace: record:.topics/development/tooling/dogfood/001-1-1-1-site-tooling-v472-portable-exact-authoring-fidelity-closure-result.trace.md
  - Origin: .topics/development/tooling/dogfood/001-1-1-1-site-tooling-v472-portable-exact-authoring-fidelity-closure-result.trace.md
  - Boundary: Portable local material; no GitHub provenance inferred.
- Current
  - Current Schema: [tiinex.task.v1](tiinex.task.v1.schema.md)
  - Created At: 2026-08-21 16:34:00
  - Summary: v473 portable parent authority coherence and metadata fidelity closure
  - Authors: Architect
  - Status: draft/local
  - Why: Architect adversarial audit found remaining Parent authority and metadata-fidelity false-PASS after the v472 portable exact-authoring closure.
---
# v473 portable parent authority coherence and metadata fidelity closure

## Objective

Close the remaining exact-continuation false-PASS cases where portable Parent metadata can be internally contradictory or lexically invalid while the operation still claims exact Site creation and exact runtime validation.

## Done Criteria

Parent schema authority must be coherent across explicit schemaId/currentSchemaId evidence: one exact value, or multiple consistent representations, may qualify; contradictory schema identities must block before exact rendering and must not be collapsed by first-value precedence. Parent Created At remains optional, but when supplied it must already satisfy the Root YYYY-MM-DD hh:mm:ss representation and the exact rendered Parent must preserve that value byte-for-byte; malformed text, ISO/timezone variants, leading/trailing whitespace, multiline/injection forms, and later representation drift must fail closed rather than normalize or pass exactRuntimeValidation. Omitted Parent Created At must remain allowed. Preserve the v471 root/child/live lineage closure, v472 values-only CLI and exact caller-value fidelity, contradictory id/continuationTrace blocking, kind-only Parent blocking, unknown/custom-schema fail-closed behavior, provider neutrality, and search-lineage discovery. Add adversarial tests for schemaId/currentSchemaId contradiction and consistency, canonical/omitted/invalid Parent Created At, multiline timestamp injection, and qualification truth.

## Scope

Primary owner remains src/tooling/portable/** in the exact draft/continuation seam and focused portable tests. Reuse shared Site creation/result qualification, but do not broaden into Site UI/Open Schema, canonical schema edits, Schema Builder, provider/plugin architecture, remote code policy, or unrelated provenance redesign. Do not add schema-id switches, field-vocabulary switches, aliases, or generic normalization that changes caller truth. A separate dogfood observation exists that Authors is schema-allowed but not yet first-class in exact creation/viewer surfaces; do not fold that UI/schema-authoring work into this correction.

## Dependencies

Input is the v472 Tooling result in this same worktree. Architect independently verified the v471 and v472 focused regressions and portable aggregate suite. Adversarial reproduction A: continue-from-record with Parent {id:"p", path:".topics/p.trace.md", schemaId:"tiinex.topic.v1", currentSchemaId:"tiinex.task.v1"} returns created-clean with exactCreateToolingApplied=true and exactRuntimeValidation=true, silently choosing schemaId. Reproduction B: the same continuation with Parent Created At "not-a-date" or "2026-01-01 00:00:00\nX" also returns created-clean/exactRuntimeValidation=true and renders the malformed value into Parent. Root declares Created At shape YYYY-MM-DD hh:mm:ss. These are same-seam authority/representation false-PASS defects. Q remains HOLD and the pending Dev correction stays deferred until portable handoff authoring is trustworthy enough for the next dogfood stage.
# Continuity Integrity
- Draft Local Integrity
  - Method: browser-local-draft
  - Value: pending-publication-or-export
