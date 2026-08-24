# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-08-23 21:46:00
  - Trace: [007-handoff-package-multi-root-pointer-entrypoint-context-minimality-closure-handoff.trace.md](007-handoff-package-multi-root-pointer-entrypoint-context-minimality-closure-handoff.trace.md)
  - Origin:
    - [relative](007-handoff-package-multi-root-pointer-entrypoint-context-minimality-closure-handoff.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-23 22:25:00
  - Authors: Loom
  - Why: Preserve Tooling 017's recipient-relative context-carriage audit, exact material provenance hardening, duplicate-byte disposition, and hidden-context limits for independent Anchor acceptance.
  - Summary: Loom result for Tooling 017 Handoff recipient context minimality and hidden-context leak audit
  - Status: draft/local

---

# Loom result for Tooling 017 Handoff recipient context-carriage audit

## Objective

Make Handoff package context carriage inspectable and fail closed: explain the explicit reason/provenance for every non-control/non-bootstrap carrier, expose exact requirement/material binding, distinguish complete workspace carriage from route-required context, and adversarially prove that successful orientation does not depend on undeclared convenience context.

## Done Criteria

Implementation is complete at the Loom portable Tooling boundary and awaits Anchor acceptance.

A new read-only portable operation, `audit-handoff-package-context`, is implemented by `src/tooling/portable/handoff/contextAudit.js` and registered in the normal operation catalog. It composes existing package closure/carrier/Pointer inspections and then classifies every non-control/non-bootstrap file-map carrier under an explicit reason: complete/partial workspace materialization; resolved Required Context; resolved Reference Context; generated qualified package requirement such as the route Pointer; explicitly supplied detached transport; or another named package requirement. Any carrier that cannot be explained by the supported package surfaces is an error finding rather than silent convenience context.

For every `handoff.material/**/material.bin`, the audit exposes the requirement id and name, reference target, requirement class, selected provider/provenance and authority, descriptor byte count/SHA-256, actual package byte count/SHA-256, and exact carried-workspace locations containing identical bytes. Requirement materialization descriptors now preserve `requirementName` so this output can identify the Handoff field that caused carriage rather than only an opaque generated id.

The audit makes the complete-workspace boundary explicit. Workspace members are summarized as complete/partial workspace snapshot carriage and are not relabeled as Required Context merely because a route happens to live in that workspace. Only the exact qualified route grounding and exact Handoff requirement/material bindings are promoted to route/requirement evidence. A complete workspace may deliberately contain unrelated prior Handoffs, decisions, or other history; their presence is visible as workspace snapshot carriage and is not evidence that the active Handoff requires them.

The full-vs-minimal regression constructs the same bounded Handoff in both a complete workspace carrier and a minimally materialized carrier. Both recover the same explicit qualified route and Required Context truth and both orient ready. The full package carries additional workspace bytes only under the complete-workspace reason; the minimal carrier does not need those unrelated extras to succeed. Adversarial fixtures also cover stale requirement binding, wrong provider bytes, undeclared/unexplained material injection, unrelated prior Handoff/decision artifacts, full-workspace extras, and binary detached material.

Binary audit required one small input hardening change: Node ZIP material loading now retains the raw `entry.bytes` as material `data` instead of exposing only a locator, so audit can compute/compare the exact binary byte count and SHA-256 from a loaded recipient package. This does not add new semantic authority; it preserves exact carried bytes for inspection.

The currently observed duplicate-byte case is intentional under the accepted dual verification surfaces and is now explicitly reported rather than hidden. When a Required Context artifact is both inside `handoff.workspaces/**` and materialized as `handoff.material/**/material.bin`, the latter is the material-closure carrier selected by the Handoff requirement while the former independently grounds the complete workspace/route snapshot. Exact byte equality is surfaced by the audit. Removing the physical duplicate safely would require extending the existing material-closure planner so a workspace byte can itself become the materialized requirement carrier while preserving descriptor/closure verification. That is a broader core binding change than Tooling 017 needs and was not performed merely to reduce bytes. Anchor may route such a deduplication successor separately if the cost justifies changing that verification representation.

No hidden chat, old assistant answer, or prior conversation state is an input to the audit or closure. The operation reasons only over bytes and metadata present in the loaded package plus declared package controls/descriptor/carrier surfaces. Explicit detached material is surfaced under its transport reason, and semantic-looking detached `.trace.md` content cannot silently become Required Context. Unexplained root-level carrier injection blocks the audit. This is a provenance/reason guarantee, not a claim that Tooling can infer the semantic relevance of every file in an explicitly complete workspace.

Focused coverage is in `src/tooling/portable/handoff/contextAudit.test.mjs`; the final timed focused run passed in 0.40 s wall time with 87,756 KB maximum RSS. The aggregate portable suite passes and the normal operation is discoverable in `npm run portable:smoke`. Final `node tools/validate-static.mjs` passes. Full `npm run validate` retains the unrelated transported-workspace `.old/app.js` ENOENT boundary after passing through `src/app/emptyStageProductHierarchy.test.mjs`.

Exact implementation surfaces for this result are new `src/tooling/portable/handoff/contextAudit.js`, `src/tooling/portable/handoff/materialClosure.materials.js`, `src/tooling/portable/handoff/materialClosure.descriptor.js`, `src/tooling/portable/input/node.input.js`, `src/tooling/portable/operation.catalog.js`, `src/tooling/portable/operation.catalog.test.mjs`, `src/tooling/portable/bootstrap/tiinex.llm.bootstrap.md`, `src/tooling/portable/bootstrap/bootstrap.test.mjs`, new `src/tooling/portable/handoff/contextAudit.test.mjs`, and `src/tooling/portable/portable.test.mjs`. The new operation was split/worded within the existing static source-size gate rather than raising that gate.

## Scope

Read-only package context-carriage inspection, material requirement provenance, complete-vs-minimal route/requirement comparison, duplicate-byte evidence/disposition, binary ZIP byte audit, adversarial hidden-context tests, operation/bootstrap discoverability, and bounded output. No canonical Handoff mutation, semantic-relevance inference, deletion of legitimate complete-workspace history, Viewer behavior, Process semantics, publication, or speculative material-planner redesign.

## Dependencies

Controlling work is `007-handoff-package-multi-root-pointer-entrypoint-context-minimality-closure-handoff.trace.md` and Tooling 017 `../../tooling/dogfood/017-handoff-package-recipient-context-minimality-and-hidden-context-leak-audit.trace.md`. Accepted material/route/cold-consumer behavior remains Tooling 011 `../../tooling/dogfood/011-2-handoff-package-manufacturing-bootstrap-and-scale-anchor-acceptance.trace.md`, Tooling 012 `../../tooling/dogfood/012-2-handoff-carrier-projection-shared-route-and-human-output-anchor-acceptance.trace.md`, and Tooling 013 `../../tooling/dogfood/013-1-handoff-package-cold-consumer-entrypoint-and-multi-workspace-anchor-acceptance.trace.md`. Source-neutral carried-byte semantics remain bounded by `../../architect/continuity/001-19-5-workspace-source-binding-and-lazy-discovery-signal.trace.md`.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:IwOzZGWWZzIOPRuPnectlPOPARknSO_T1OtS1IR1hEk
