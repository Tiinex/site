# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-24 10:31:00
  - Authors: Loom
  - Why: Record the bounded Tooling 023 implementation and regression evidence for deterministic copyable normal Handoff presentation without giving presentation wrappers semantic authority or changing routing bytes.
  - Summary: Tooling 023 result — normal Handoff routing copyable presentation closure
  - Status: draft/local

---

# Tooling 023 result — normal Handoff routing copyable presentation closure

## Objective

Implemented an explicit host-capability presentation contract for normal Handoff human output while preserving the package-derived routing text as exact host-neutral content. Normal completion is now machine-described and cold-start documented as one primary carrier plus the adjacent exact routing copy surface, with fenced code-block presentation required when the host supports it and equivalent copyable surfaces permitted otherwise.

## Done Criteria

Implementation evidence: src/tooling/portable/handoff/humanOutputPresentation.js defines the copyable-surface/exact-content/non-authoritative-wrapper contract and the normal-emission boundary; src/tooling/portable/handoff/carrierProjection.js projects that metadata without embedding fences or modifying normalInlineRouting.content; src/tooling/portable/adapters/cli/cli.handoff-manufacture.js preserves the contract in manufacture summaries; src/tooling/portable/adapters/cli/cli.help.js and src/tooling/portable/bootstrap/tiinex.llm.bootstrap.md give cold consumers the same host-capability rule and exclude normal semantic work-summary prose, internal humanOutput JSON, helper artifacts, manually reconstructed routing, and duplicate file choices unless explicitly requested. Focused regression src/tooling/portable/handoff/humanOutputCopyablePresentation.test.mjs passes exact routing-byte preservation, no embedded Markdown fences, presentation metadata, normal-emission exclusions, fallback-sidecar non-normality, and read-only project-handoff-carrier-output/manufacture parity. Existing humanOutputNormalEmission, carrierProjection, portable aggregate, Pointer/orientation, context-audit, and handoff manufacture scaling regressions pass.

## Scope

The routing content remains disposable host-neutral text with authority none; Markdown/fenced presentation is a host wrapper only and is not canonical Handoff semantics. Shared-route selection-required behavior and optional fallback transport sidecar remain fail-closed/non-normal. No second normal attachment, Viewer policy, canonical Handoff/Pointer/Workspace semantic change, lineage repair application, publication action, or remote write was introduced. This implementing Loom session records implementation evidence only and does not self-qualify the cold-start Role behavior.

## Validation Evidence

Focused Tooling 023 and directly affected portable regressions pass, including the full src/tooling/portable/portable.test.mjs aggregate and src/tooling/portable/handoff/handoff.manufacture.scale.test.mjs over 1,286 workspace carriers / 1,306 package files. npm run validate reaches the repository static source-size guard and remains blocked only by two files already above the 24k limit in the supplied handoff baseline: src/tooling/portable/engine.facade.js and src/tooling/portable/operation.catalog.js. The Tooling 023-modified carrierProjection.js was refactored below that guard, so the remaining validation failure is not introduced by this tranche.

## Dependencies

Controlling task: .topics/development/tooling/dogfood/023-handoff-normal-routing-copyable-presentation-closure.trace.md. Controlling transfer: .topics/development/handoff/loom/015-human-output-copyable-presentation-and-publication-evidence-correction-handoff.trace.md. Independent fresh actual-path qualification remains retained by Q/Anchor or another qualified reviewer; this result does not claim that host behavior has independently passed.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:mx5xxaove905jN183t1FiOwNjiCAJ6L19xkeS09uwzI
