# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-08-22 13:42:00
  - Trace: [recipient-relative Handoff transport package semantics result](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/development/schema/handoff/002-1-1-recipient-relative-handoff-transport-package-semantics-result.trace.md)
  - Origin:
    - [browse + git](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/development/schema/handoff/002-1-1-recipient-relative-handoff-transport-package-semantics-result.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-22 12:47:34
  - Authors: Tiinusen; Architect
  - Why: The accepted recipient-relative Handoff transport semantics now need one shared portable implementation owner so Viewer, LLM workers, CLI/automation, and host integrations can plan materially usable handoffs without hidden chat state or provider-specific semantic branches.
  - Summary: v481 shared portable recipient-relative Handoff material-closure planner foundation
  - Status: draft/local

---

# v481 shared portable recipient-relative Handoff material-closure planner foundation

## Objective

Implement one shared portable material-closure/planning capability that consumes canonical Handoff context semantics plus exact available workspace/material authority and recipient/runtime resolution capabilities, then derives recipient-relative transport readiness and a package materialization plan without creating new Handoff state, artifact authority, workspace completeness, or provider semantics. Reconcile the current Site/portable Handoff package machinery with the newly published Tiinex/docs authority at commit `3988951208eb9a8926e84ab42625d4b42fa00c2d` so the same closure model can later be consumed by Viewer UI, LLM workers, CLI/automation, and host integrations.

## Done Criteria

Use `Tiinex/docs@3988951208eb9a8926e84ab42625d4b42fa00c2d` as the immutable semantic/material authority for this tranche, including current Root schema-reference identifier/locator semantics, current Handoff endpoint-capacity semantics, and the accepted recipient-relative Handoff transport package semantics result. Requalify the Site's loaded/cached Root and Handoff representations where required so any planner or validator claim that depends on those schemas is bound to exact current published bytes rather than stale `053d46ce...` / `e713557f...` material metadata. Do not broad-migrate unrelated schema families merely because the docs commit advanced.

Create one portable/shared planner owner that accepts a qualified Handoff representation/projection, available workspace/material representations, recipient resolution capabilities, and provider-neutral material-resolution results or seams. The planner must preserve Handoff `Required Context` versus `Reference Context` classification and must not infer requirements from package membership, path adjacency, Authors, repository layout, provider choice, or UI state.

For each required material declaration, derive one explicit recipient-relative disposition equivalent in meaning to:

```text
reference-sufficient
materialized
unresolved
ambiguous
integrity-conflict
```

The exact implementation vocabulary may follow existing Tooling conventions, but the meanings must remain distinguishable and machine-readable. Required-material `unresolved`, `ambiguous`, or `integrity-conflict` must block recipient transport closure. Reference-only material may remain unresolved or be intentionally omitted without blocking required closure when the plan records that disposition truthfully. Handoff semantic validity must remain independent from recipient transport readiness.

Provider selection must remain provider-neutral. Portable Tooling may request exact material and consume provider results, but must not hard-code GitHub, a ChatGPT connector, direct sandbox networking, one filesystem, one package path, or Viewer session state as semantic authority. Preserve the distinction between environment capability and system capability: a sandbox with no direct network may still resolve material through a host connector, supplied workspace, cache/mirror, or prior Handoff package provider. Multiple distinct provider candidates without authority to select one must remain ambiguous/fail-closed.

Support prior Handoff/package material reuse as a material provider without promoting the prior package to canonical artifact authority. Exact reused bytes must remain bound back to the requested canonical/exact material through representation/source provenance and integrity evidence where available. A prior package's successful use must not become semantic selection authority for a later package.

Represent workspace materialization truth explicitly. A complete workspace materialization may be called complete only when Tooling has evidence for completeness of the declared workspace boundary. A selected subset must remain `partial` (or exact equivalent) and must not masquerade as a complete workspace because it is stored under a workspace-shaped directory. Package-local mirrors/materializations remain byte carriers; canonical artifact identity and workspace/lineage ownership remain with their owning workspaces/origins.

Add one explicit package-local machine-readable closure descriptor to the operational Handoff transport package path rather than relying on hidden in-memory state. The descriptor is disposable transport metadata, not a canonical Tiinex artifact or new generic package schema. It must be safe to delete with the transport package without deleting semantic history. It should expose at least: required/reference requirement mapping, per-material disposition, materialized representation identity/provenance, workspace materialization `complete|partial`, provider/material-source provenance, optional bootstrap `present|absent`, overall required closure readiness, and roundtrip verification evidence. It must not claim Handoff acceptance/completion, universal package identity, semantic Parent, artifact ownership, or workspace completeness beyond its evidence.

Optional bootstrap/orientation material must remain transport convenience only. The planner/builder may include or omit bootstrap according to an explicit execution input; bootstrap presence must not change semantic Handoff validity, artifact identity, or workspace lineage. No Tiinex artifact may be silently created at package root merely to describe transport.

Integrate with existing shared operational package/portable runtime machinery where that machinery can truthfully carry the derived plan. Do not generalize `tiinex.semantic.package.v1`, do not create a canonical generic Handoff package schema, and do not duplicate closure logic in Viewer/Site UI. `src/export/handoff.plan.js` or another Site-facing consumer may delegate to the portable/shared owner, but it must not become a second semantic/planning authority.

Pressure-test at least these exact families through focused regression: fully local required closure; exact external reference sufficient for a capable recipient; host/provider-resolved mirror for an otherwise sandboxed recipient; unresolved required material; conflicting provider bytes/candidates; prior-package byte reuse; partial external workspace materialization; complete workspace materialization; bootstrap present and absent; package-local control metadata excluded from workspace lineage/artifact truth; and independent archive serialization/extraction/rehydration with byte-exact material and closure-descriptor verification. Preserve current package byte-integrity/file-map controls and all v471-v480 qualified behavior.

Run the complete available focused Tooling/package regression family plus the full source/repository gate matrix that is executable in the supplied source-clean environment. Preserve the inherited missing-React dependency boundary truthfully if it remains the only non-pass; do not relabel unavailable browser/runtime execution as PASS. Return one durable Tooling result/evidence artifact inside the Site workspace and one complete independently roundtrip-verified updated Tiinex/site workspace ZIP.

## Scope

This tranche is the shared portable recipient-relative material-closure/planning foundation plus the minimum exact Root/Handoff schema-source requalification required to consume current published authority. Tooling owns portable/shared material requirement projection, provider-neutral resolution planning, closure qualification, transport-local descriptor generation, package integration, and adversarial regression. Viewer UI, fresh Dev product work, Party/Role/Capability schema design, generic discovery/latest resolution semantics, docs corpus schema-reference normalization, Handoff semantic redesign, canonical package schema creation, delivery/acceptance state machines, and pre-master legacy cleanup remain out of scope.

Do not solve sandbox limitations by weakening closure. Do not infer provider capability from the absence of direct network. Do not infer exact representation from schema id, filename, basename, mutable branch URL, nearest repository file, provider order, or prior package success. Do not treat package existence/download/import as Handoff sent/accepted/active/completed state. Do not place new Tiinex artifacts outside their owning workspace lineages merely because the transport package needs control metadata.

If implementation pressure proves that a durable package/closure/resolution artifact has independent semantic value that current authority cannot express, stop and return the concrete evidence to Architect/Schemer rather than inventing a canonical schema inside Site/Tooling.

## Dependencies

Canonical semantic/material authority for this tranche is `Tiinex/docs@3988951208eb9a8926e84ab42625d4b42fa00c2d`. Required published references include:

- [Root schema](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md), including schema-reference identifier versus representation-locator semantics.
- [Handoff schema](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md), including endpoint identity/capacity separation and the durable Required/Reference Context boundary.
- [Recipient-relative Handoff transport package semantics result](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/development/schema/handoff/002-1-1-recipient-relative-handoff-transport-package-semantics-result.trace.md), which explicitly directs Architect/Tooling to one shared portable material-closure planner and rejects a new canonical generic package schema.
- [Stable schema-reference locator publication-policy result](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/development/schema/handoff/003-1-stable-schema-reference-locator-publication-policy-result.trace.md), which requires schema identifier and representation locator to remain separate and mutable latest/branch locators not to masquerade as immutable exact representation bindings.

The supplied recipient-relative transport includes a complete Tiinex/docs workspace materialization corresponding to that published commit so Tooling execution must not depend on direct GitHub/network access. The Site implementation baseline is the Architect-audited v480 worktree with 1231 files and durable result `.topics/development/tooling/dogfood/007-1-v480-workflow-schema-enablement-creation-projection-closure-resu.trace.md`. Current operational package owners under `src/export/package.*`, `src/export/handoff.plan.js`, `src/tooling/portable/package/runtime.package.js`, and Handoff package intake are implementation evidence, not semantic authority; Tooling must discover and preserve the narrowest correct owner boundaries before mutation.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: uDMUT9j518a1yjcdbt2a76H56g_eMe8KaelyVMo6d-M
