# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.project.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/project/tiinex.project.v1.schema.md)
  - Created At: 2026-08-26 22:24:00
  - Trace: [Tiinex Tooling](001-2-tooling-project.trace.md)
  - Origin:
    - [relative](001-2-tooling-project.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-27 12:25:00
  - Authors: Anchor; Sigma
  - Why: Repeated real multi-role turns are taking roughly tens of minutes, and current evidence does not separate host safety latency, Tooling execution, test-suite cost, repeated full scans, Handoff manufacture, and avoidable serial workflow overhead.
  - Summary: Epic work package for measuring and reducing Tiinex iteration wall-clock without weakening safety, validation, provenance, or review quality.
  - Status: accepted/local

---

# Tooling And Workflow Iteration Efficiency

## Objective

Make Tiinex development iteration observably faster and more parallelizable by measuring where wall-clock time is spent, removing redundant Tooling/test work, and defining bounded fast paths that preserve the same semantic and safety guarantees.

## Done Criteria

- Representative Tiinex turns expose measured wall-clock and attributable Tooling/test/manufacture phases, with externally visible host wait recorded separately when it can be observed, rather than relying on subjective timing.
- Focused validation and full-suite gates have explicit purposes so routine bounded work does not repeatedly pay unrelated global test cost. Test count is not treated as a quality metric; a small representative contract set is preferred when it protects the same meaningful risk.
- Broad, slow, duplicated, or historical tests are reduced or reorganized only after their contract purpose and replacement coverage are understood; old tests are not deleted merely for age or runtime.
- Repeated scans, archive work, schema resolution, and Handoff qualification are profiled and optimized where evidence shows material cost.
- Terminology is improved toward clear Tiinex domain intent when wording is unnecessarily ambiguous, while host-control behavior remains outside the optimization target.
- Parallel-safe work and integration gates are explicit enough that independent role work can proceed concurrently without hidden authority or merge conflicts.
- Optimization never bypasses host controls, weakens validation, fabricates receipts, or trades provenance correctness for speed.

## Scope

- Tooling/runtime performance, test orchestration, Handoff manufacture, Discovery cost, validation strategy, development workflow instrumentation, and clear domain terminology where ambiguity causes avoidable friction.
- Treat additional externally visible host wait/review as a separate observed factor when visible. Do not infer hidden trigger logic from timing or wording correlations and do not design workarounds around host controls.
- Do not optimize by suppressing meaningful findings, multiplying tiny tests without a distinct contract purpose, or replacing exact qualification with unverified caches.

## Specialist Discovery Disposition

- Loom completed a bounded three-workspace efficiency Discovery against the carried Business, Docs, and Site snapshots. Anchor independently rechecked the material claims used for the next-work ordering.
- The strongest current result is orchestration/contract composition, not a demonstrated need to weaken validation: the current Site source already contains focused, restartable, checkpoint, profiling, and closure primitives, but they do not yet form one explicit developer-to-closure contract.
- The first concrete technical slice is **Validation Contract Unification** in `Tiinex/site`, downstream of the durable Site copy of Loom's Discovery. It should establish focused/tooling, integration, and closure profiles that compose rather than drift, with restartable receipts in the ordinary bounded development loop.
- Timing/restart receipts, exact workset reuse, Handoff manufacture profiling/reuse, conditional parallel-safe groups, bootstrap role resolution, and the shared graph projection remain ordered follow-on seams from the Discovery; they are not duplicated here as Business subtasks.
- Business owns priority and acceptance. Detailed Loom work and verification stay in Site/Tooling source, and transport Handoffs do not become permanent Business work ancestry.

## Dependencies

- Real measured multi-role Tiinex work as the primary performance dataset.
- Portable Tooling and test-suite timing surfaces.
- Browser Companion observation may later add end-to-end host turn timing where the browser can truthfully observe submit-to-ready state.
- Human observations of long host-side waits and broad test cost are summarized by the current Foundation Readiness lineage; they are measurement inputs, not a proven causal diagnosis.

## Current Operating Read

- This work package is Active during the foundation phase for measurement and simplification only; it is not authority to open a broad new Tooling feature tranche.
- Recent observations include both fast bounded Tiinex operations and materially longer turns where local validation cost and external host wait cannot yet be separated reliably. A Business-reconciliation turn on 2026-08-29 also entered extended host processing before Sigma interrupted it for observation; that event is evidence of friction, not evidence of a specific trigger.
- The desired outcome is a faster understandable development loop: focused checks during bounded work, explicit broader integration gates, a small meaningful regression spine, and phase timing sufficient to identify where time is actually spent.
- Foundation Priority: this is Loom's priority 1 when Loom begins new development or decomposes new Tooling work. Broader Tooling capability and Viewer-support work should not materially expand the validation/checkpoint burden before this iteration seam is made practical enough for routine development.
- Developer Loop Boundary: ordinary bounded implementation should have focused, restartable checks chosen by the changed contract/risk. Broad qualification remains available for integration and acceptance gates; it should not be the default price of every small local change.
- Human Test Boundary: Sigma or another human should not be used as the routine test runner for Tooling semantics that can be covered by deterministic Tooling/fixture checks. Human review remains valuable for product comprehension, judgment, and real-path evidence after machine-verifiable behavior is qualified.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [Tiinex Tooling](001-2-tooling-project.trace.md)
  - Value: id2V3L4aVv616_NbFUngZrbSnZ9T_HN5G-x8Z1003W4

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: HYsccUvA0Y3cWgJbmAOrvD5u4SdCPtbo5UTA2bhXVb4
