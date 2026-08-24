# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-24 09:07:00
  - Authors: Anchor
  - Why: Build the read-only trust surface required before any existing lineage is rewritten: identify missing/stale Parent integrity, distinguish backfill from mismatch, model cascade impact, and preserve publication/provenance ambiguity without automatic repair.
  - Summary: Tooling 020 — lineage integrity inspection, mismatch classification, and structure-preserving repair-plan foundation.
  - Status: open/local

---

# Tooling 020 — lineage integrity inspection and repair-plan foundation

## Objective

Add a portable, deterministic, read-only lineage integrity inspection and repair-planning capability over loaded Tiinex artifacts. It must resolve declared Parent relations exactly, validate Parent and child primary c14n-v2 self seals, classify the child's Parent-target entry and Parent Origin/publication state, compute downstream repair impact without authorizing mutation, and emit a human/adapter-safe plan that can later drive Viewer, VS Code, or an LLM without requiring those clients to improvise integrity semantics.

## Done Criteria

- Reuse canonical Root `Parent`/`Trace`/`Origin` authority and maintained c14n-v2 target-self-digest semantics. Never infer Parent from dimensions, chronology, filenames, adjacency, or source layout.
- Introduce or extend an adapter-neutral portable read-only operation for lineage integrity inspection/repair planning rather than embedding logic only in Viewer or one host.
- For every Parent-bearing artifact in scope, resolve/classify at least: Parent availability, Parent primary v2 self state, child primary v2 self state, child Parent-target entry state, exact target digest comparison, Parent Origin locator availability/qualification, and downstream declared descendants affected if this artifact's representation changes.
- Use explicit states such as healthy, parent-target-missing, parent-target-mismatch, parent-self-unavailable, child-self-mismatch, parent-unresolved, parent-ambiguous, publication-origin-missing/unresolved, publication-origin-stale/contradictory, and unsupported. Exact vocabulary may differ but must remain machine-distinguishable and fail closed.
- Treat `parent-target-mismatch` as a trust-impacting flag, never as permission to refresh the digest. The plan must state that semantic impact/disposition is required before mutation.
- Distinguish clean backfill/migration candidates from mismatches. A missing Parent-target entry may be proposed for backfill only when the exact declared Parent and its primary v2 self digest are qualified and no contradictory integrity/provenance evidence exists.
- Compute cascade impact as dependency information only. If repairing artifact B changes B's primary self digest, descendants that bind to B must be identified in topological order, but no descendant repair is auto-approved merely because it is mechanically downstream.
- Produce a repair-plan model suitable for per-artifact human review: current state, exact Parent target, old/new candidate target digest where computable, publication locator state, expected mutation sections/lines, descendant impact, required approval/disposition, blockers, and reasons.
- Preserve the current generic `repair-plan` capability where useful; do not fork a second incompatible planning language if the existing operation can be extended cleanly.
- Include a bounded scan against the current Site lineage and prove that current known self-only Parent-bearing artifacts are classified as missing-backfill rather than falsely reported as already chained. Do not mutate them in Tooling 020.
- Recover the historical `ai-provenance` quick-fix only as optional prior art if available; report what remains reusable and what conflicts with current Root/c14n-v2/source truth.
- Add focused tests for missing target, matching target, mismatching target, unresolved Parent, ambiguous Parent, Parent self mismatch/missing, child self mismatch, truthful local-only Parent material, qualified commit-pinned Parent material, and cascade-impact ordering.
- Return normal Tooling-owned Handoff output. The implementing Loom session does not self-qualify cold-start trust.

## Scope

Read-only integrity inspection, exact Parent target resolution, c14n-v2 comparison state, publication-locator state projection, repair-plan generation, cascade-impact analysis, focused tests, and bounded current-workspace diagnostics.

Out of scope: mutating artifacts, automatically refreshing mismatches, changing Root/Origin semantics, remote GitHub writes, Viewer UI implementation, VS Code UI implementation, authorization/access-level design, rewriting body prose, or declaring the existing lineage repaired.

## Dependencies

- [Parent-target v2 creation gap](../../architect/continuity/001-30-parent-target-v2-continuity-integrity-gap-feedback.trace.md)
- [Lineage repair and human adapter feedback](../../architect/continuity/001-31-lineage-integrity-repair-publication-permalink-and-human-adapter-workflow-feedback.trace.md)
- [Unpublished Parent Origin semantic gap](../../architect/continuity/001-31-1-unpublished-parent-origin-truthfulness-and-canonical-requirement-gap.trace.md) must remain fail-closed and is not Tooling authority to resolve.
- [Tooling 019](019-parent-target-v2-continuity-integrity-emission-and-validation-closure.trace.md) owns prospective creation integrity and may land before or alongside this read-only diagnostic foundation.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:utOiynOFPl7QBbJSgQgIT0jtvxDuc195xV4xUkGeJNc
