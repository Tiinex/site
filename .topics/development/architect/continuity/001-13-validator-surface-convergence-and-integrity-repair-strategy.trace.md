# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-08-22 23:22:00
  - Trace: [Macro Roadmap And Refactor Exit Recovery](001-2-1-macro-roadmap-refactor-exit-recovery-result.trace.md)
  - Origin:
    - [relative](001-2-1-macro-roadmap-refactor-exit-recovery-result.trace.md)
    - [browse + git](https://github.com/Tiinex/site/blob/13ab5498e1fbc730c85c41428246367ca2241a04/.topics/development/architect/continuity/001-2-1-macro-roadmap-refactor-exit-recovery-result.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-23 02:18:00
  - Authors: Anchor
  - Why: Q observed that the still-used Tiinex ai-provenance VS Code validator reports current refactor artifacts as having unreadable schema permalinks and missing/incomplete Continuity Integrity even when the artifact visibly carries a v2 self-integrity entry, creating mixed trust signals between editor tooling and current Tiinex validation surfaces.
  - Summary: Reconcile current portable validation with the stale-but-used VS Code validation surface, characterize representation and resolver drift, and define a dependency-safe artifact repair strategy before any bulk quick-fix or reseal.
  - Status: planned/local

---

# Validator surface convergence and integrity repair strategy

## Objective

Establish a bounded repair and convergence strategy for Tiinex artifact validation surfaces so a human using editor diagnostics does not receive an unexplained red signal for artifacts that current qualified Tooling considers valid, while preserving the possibility that some diagnostics expose real representation or integrity defects.

This Task is characterization and repair planning first. It must not assume that current artifacts are correct merely because current Tooling produced them, and it must not assume that the historical VS Code validator is authoritative merely because it emits an error.

## Observed Delta

- Q observed the `Tiinex Traceable Continuity` VS Code diagnostics on current `Tiinex/site@refactor` artifacts after merge.
- The observed diagnostics include unreadable Envelope/Parent/Current schema permalinks against local repo/workspace state and `Continuity Integrity footer is missing or incomplete`.
- The open artifact visibly contains a `# Continuity Integrity` section, a linked `sha256-base64url-c14n-v2` method, `Towards: self`, and a `Value` field.
- Current refactor artifacts sampled in this continuity family serialize the value as `Value:<digest>` without a space after the field colon.
- The `Tiinex/ai-provenance` continuity parser supports `sha256-base64url-c14n-v2`, but its labeled-value parser requires whitespace after `:`. Therefore at least one current diagnostic can arise from representation/parser incompatibility rather than absence of the footer.
- Canonical `sha256-base64url-c14n-v2` authority documents the field as `Value: <computed ...>`. Whether the no-space representation is formally invalid, merely non-recommended, or intentionally accepted by newer Tooling must be reconciled rather than inferred.
- Exact schema permalinks currently point to commit-pinned `Tiinex/docs` material. A local-only editor resolver may truthfully lack that material while the permalink itself remains valid; unavailable resolution must remain distinguishable from an invalid schema reference.

## Done Criteria

- Inventory the affected validator surfaces and exact versions/checkpoints, including current Tiinex portable validation, canonical validator/schema authority, and the still-used `Tiinex/ai-provenance` VS Code extension.
- Build a reproducible validation matrix over representative pre-refactor and current-refactor artifacts and classify each disagreement as at least: actual integrity mismatch, representation/parser drift, required material unavailable to the current resolver, stale host-specific rule, or unresolved semantic ambiguity.
- Determine with Axiom/schema authority if needed whether `Value:<digest>` versus `Value: <digest>` is a validity rule, interoperability requirement, recommended representation, or implementation accident. Do not silently normalize syntax under Tooling authority if canonical meaning is ambiguous.
- Verify current self-integrity values independently before describing the current corpus as valid. A current generator/test PASS is evidence, not permission to assume the stored values are correct.
- Define an artifact repair planner that can normalize an affected representation and recompute the primary v2 self seal without losing exact before/after provenance.
- Before bulk resealing, discover non-self integrity entries or other qualified snapshot references that depend on an affected self digest. Repair planning must model the dependency closure so changing one artifact cannot silently stale downstream comparison entries or their own self seals.
- Preserve historical bytes through Git. A repaired HEAD artifact may legitimately obtain a new self digest; the repair must not rewrite the claim that an older commit had the older representation or fingerprint.
- Define idempotent batch behavior, dry-run/report mode, exact changed-file inventory, and a durable repair result/ledger shape before any repository-wide mutation.
- Define a convergence path where VS Code diagnostics consume or adapt the shared portable Tiinex validator/resolver contracts instead of maintaining a second semantic interpretation. Host UX may add diagnostics and quick fixes, but it must not redefine validation meaning.
- Distinguish `invalid`, `mismatch`, `unavailable`, `unsupported/stale surface`, and `ambiguous` in editor-facing diagnostics. An unavailable external schema materialization must not be presented as equivalent to a malformed schema reference.
- Any editor quick fix that changes checksum-governed bytes must either perform the qualified reseal/closure operation or refuse and point to the repair operation; a blind whitespace rewrite is not an acceptable integrity fix.
- Add regression cases covering at least: legacy valid artifact, current v2 artifact, no-space/space representation pressure, true checksum mismatch, missing integrity entry, commit-pinned external schema unavailable locally, resolved external schema, and a dependent non-self digest that would become stale after target repair.
- Record whether this debt blocks refactor exit or is ordinary post-refactor tooling convergence. Do not promote it to an exit blocker unless current qualified evidence shows that retained artifacts or required validation paths are actually invalid.
- Q may provide product/editor observation but is not the debugging loop. Source characterization, repair closure, and regression evidence belong to the relevant Tooling/implementation roles.

## Scope

This Task owns convergence and repair strategy for artifact validation surfaces and editor trust signals. It does not immediately rewrite the artifact corpus, republish `Tiinex/ai-provenance`, change canonical validation semantics, or declare the current VS Code extension current.

Loom is the likely implementation owner for shared validator/resolver adapters, repair planning, dependency-safe resealing, and machine evidence. Axiom owns any canonical syntax or validation-method semantic ambiguity. Kodax is only required if Site/editor-facing integration consumes the shared capability. Anchor owns cross-surface reconciliation and the decision about whether discovered debt affects refactor-exit confidence.

The preferred direction is shared-first: canonical semantics and portable validation remain the reusable owner; VS Code, Viewer, CLI, LLM, and future adapters consume that machinery rather than forking it.

## Dependencies

- [Macro Roadmap And Refactor Exit Recovery](001-2-1-macro-roadmap-refactor-exit-recovery-result.trace.md) for refactor-exit classification and the distinction between exit-critical debt and ordinary later evolution.
- `Tiinex/site@refactor` at or after `13ab5498e1fbc730c85c41428246367ca2241a04` for the currently observed artifact representations and portable Tooling implementation.
- `Tiinex/docs@3988951208eb9a8926e84ab42625d4b42fa00c2d` canonical schema and `sha256-base64url-c14n-v2` validation-method authority.
- `Tiinex/ai-provenance@ef9a07cec7cbd6cc5fa32ebecef55c7851ade580` as historical/partially-current validator and VS Code implementation evidence; its own README requires fresh validation for VS Code extension behavior.
- Q's 2026-08-23 actual editor observation showing mixed diagnostics on current continuity artifacts.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: oNxI_CF4LVALxZOMP4HIr6H-YWTBerCj8avM2Qs1f3M
