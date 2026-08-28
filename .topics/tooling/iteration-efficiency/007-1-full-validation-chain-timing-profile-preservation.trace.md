# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.preservation.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/preservation/tiinex.preservation.v1.schema.md)
  - Created At: 2026-08-28 11:53:00
  - Authors: Loom
  - Summary: Preserve the complete current validation-chain timing distribution, family totals, outliers, and baseline failures.
  - Status: preserved/local

---

# Full Validation Chain Timing Profile Preservation

## Preserved Material

- Material Description: per-command timing and exit observations for all 245 exact current `validate` commands, executed in nine bounded ranges.
- Material Kind: elapsed timing distribution, family aggregation, slow-command ranking, failure-step inventory, and non-authoritative profiling boundary.
- Focused Profiler Test: `node tools/profile-validation-chain.test.mjs` passed and proves range selection plus continuation across failure.
- Complete Chain: 245 commands; summed per-command elapsed `47,435.650 ms`; summed batch-internal elapsed `47,444.477 ms`; 10 commands exited non-zero.
- Distribution: median `160.342 ms`; p90 `288.388 ms`; p95 `369.934 ms`; p99 `1051.022 ms`; maximum `8717.596 ms`.
- Dominant Family: `src/acceptance` 92 commands / `28,173.191 ms`, about 59% of measured command time.
- Portable Family In Full Chain: 11 commands / `3676.719 ms`; this is consistent with the separate portable profiling being far below minute scale.
- Primary Outlier: step 75 `src/acceptance/postV423CanonicalTransitionProductVerticalSlice.test.mjs` passed in `8717.596 ms`, about 18% of the entire measured chain.
- Other >1s Commands: step 61 `postV422CanonicalOutputMaterializationPlannerFoundation` `1070.161 ms`; step 64 `postV426QAcceptanceDiscoveryConsolidatedClosure` `1051.022 ms`.
- Current Failure Steps: 4 browser import boundary; 6 static validation; 7 schema bindings; 8 schema runtime projections; 124 startup render parity; 194 local material intake; 215 creation contracts; 233 conformance run; 238 loaded-parent identity evidence closure; 245 portable aggregate test.
- Triage Result: exact current full validation command work is under one minute of summed child-process execution on this host; the measured suite itself does not exhibit a ten-plus-minute runtime.

## Preservation Act

- Preservation Method: copied aggregate results from nine bounded read-only profiling runs covering steps 1-245 exactly once.
- Preservation Time Or State: captured after Site tasks 001-006 with no correctness-gate mutation in this task.

## Provenance

- Known Source: exact current `package.json` `validate` script and current warm Site working tree.
- Provenance Limits: profiling launches each command independently and continues after failures; this is intentionally not the semantics of a successful `npm run validate` correctness gate.

## Fidelity And Loss

- Fidelity Notes: every profiled command string is taken directly from the exact current package script; timing uses monotonic process time around each shell child command.
- Known Losses: shell startup/cache effects may differ slightly from one monolithic `npm run validate`; host queue/review/model time is outside these measurements.

## Custody Or Storage Boundary

- Storage Or Custody State: current-only Site continuity artifact under `.topics/tooling/iteration-efficiency/`.
- Reuse Boundary: suitable as a before-optimization baseline for slow-test and validation-orchestration work.

## Interpretation Limits

- Does Not Prove: why any host request takes longer than these local commands, that current failures are acceptable, or that additional review cannot correlate with a validation turn.
- Not Yet Used As: full validation acceptance, Anchor acceptance, release qualification, or transport closure.
- Must Not Be Treated As: authority to ignore failures, skip full closure validation, or claim internal host-review causality.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: JAW4zDfUx1O2o0dbcVDmN5bk4Hn5LnW0AGU5H52OJbs