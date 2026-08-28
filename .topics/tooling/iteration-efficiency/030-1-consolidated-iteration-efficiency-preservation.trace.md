# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.preservation.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/preservation/tiinex.preservation.v1.schema.md)
  - Created At: 2026-08-28 12:35:26
  - Authors: Loom
  - Summary: Consolidate the current Site iteration-efficiency tranche, exact workspace-diff scale, measured performance/context evidence, and bounded unresolved baseline findings for Anchor review.
  - Status: preserved/local

---

# Consolidated Iteration Efficiency Preservation

## Preserved Material

- Material Description: current Loom Site state after completed/local iteration-efficiency tasks 001 through 029, including early-return timing, workset measurement, restartable validation/closure orchestration, schema compile caching, legacy fixture isolation and physical cleanup, bounded artifact/lineage/search projections, lifecycle profiling, and validation regression profiling.
- Material Kind: consolidated implementation and measurement evidence for Anchor review.
- Workspace Diff Against Carried Site Baseline: 516 file-level differences total: 106 added, 388 removed, 22 modified.
- Primary Removal: legacy `.topics/development` current artifact tree, 388 removed files; required historical test material is isolated under explicit `src/tooling/portable/fixtures/legacy-artifacts/` fixtures rather than normal artifact discovery.
- Current Workset Baseline After Cleanup: 1,336 files / approximately 10.32 MB; legacy-development category zero.
- Generated Context Baseline: four broad Tooling operations reduced from 983,597 B full projection to 5,686 B bounded receipts, approximately 173x smaller, with operation time approximately unchanged at 282.7 ms full versus 285.7 ms bounded.
- Bounded Current Workflow Including Source Search: approximately 6,451 B model-facing projection.
- Lineage Projection: `search-lineage` 42,151 B to 1,343 B; `resolve-lineage` 69,953 B to 2,449 B, while retaining error/warning findings.
- Inspect/Audit Projection: real current `.topics` inspect 213,774 B to 970 B; audit 474,629 B to 922 B.
- Fast Inner Loop Gate: `validate:tooling-iteration`, approximately 1-2 s on current completed task set; full `validate` remains the closure correctness gate.
- Full Validation Timing: original measured chain approximately 47.44 s; after bounded exact-schema contract compile caching approximately 37.56 s, about 20.8 percent faster with the same baseline failure set.
- Schema-Heavy Outlier: `postV423CanonicalTransitionProductVerticalSlice.test.mjs` approximately 8.72 s before, 2.4-2.6 s after exact unchanged-schema Markdown contract caching.
- Portable Test Timing: all 70 portable tests approximately 20.20 s total; slowest observed test approximately 1.60 s.
- Handoff Lifecycle Current Baseline: approximately 2.41 s manufacture without roundtrip and 3.22 s with roundtrip; post-cleanup roundtrip premium approximately 0.81 s.
- Restartability: validation command runner and generic closure plan checkpoint after completed steps, resume without replay, reject stale command/plan identity, and preserve nonzero/fail-closed behavior.
- Validation Regression Profile: all 245 exact commands profiled in bounded ranges at 36.40 s summed child time / 36.65 s bounded batch wall; same exact 10 baseline nonzero exits as preserved before cleanup/context changes.
- Final Narrow Isolation: validation steps 21-60 independently profiled in seven small ranges, all zero failures and each approximately 0.32-1.12 s wall.

## Preservation Act

- Preservation Method: current-only Site tasks/preservations, focused tests, bounded fast gate, read-only timing/profile tools, exact baseline workspace comparison, and no broad deletion or optimization without measured justification.
- Preservation Time Or State: warm Loom Site state immediately before consolidated Loom-to-Anchor return manufacture.

## Provenance

- Known Source: exact Site workspace carried by the current Anchor-to-Loom Handoff plus Loom-local modifications under Business epic `002-6 Tooling And Workflow Iteration Efficiency`.
- Provenance Limits: Business remained read-only for Loom implementation; cross-repo Business epic references are coordination authority, not copied implementation ownership.

## Fidelity And Loss

- Fidelity Notes: current workspace preserves full source bytes, focused regression fixtures, task/preservation artifacts, explicit opt-ins for full/legacy projections, and unchanged final correctness-gate semantics.
- Known Losses: host-local profiler JSON, CPU profiles, temporary manufacture outputs, and client UI review indicators are not embedded wholesale into Site; bounded numeric evidence and interpretation limits are preserved instead.

## Custody Or Storage Boundary

- Storage Or Custody State: current Site workspace and the child Handoff carrier manufactured from it.
- Reuse Boundary: Anchor may audit, reconcile, accept/reject individual completed tasks, or select a new child tranche without reconstructing Loom's warm-run measurements.

## Interpretation Limits

- Does Not Prove: the root cause of any client-side additional-review indication, elimination of all iteration latency, full release readiness, or that current baseline failures are acceptable for product release.
- Not Yet Used As: final Anchor acceptance or publication authority.
- Must Not Be Treated As: authorization to bypass safety/review controls, skip final correctness gates, delete local docs broadly, or mutate Business source.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:4aQ-s1e1FD3Xek--k9scIHqbNkwY9BwFJkmcUHFazjc
