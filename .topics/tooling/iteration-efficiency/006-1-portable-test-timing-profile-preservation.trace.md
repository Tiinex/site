# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.preservation.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/preservation/tiinex.preservation.v1.schema.md)
  - Created At: 2026-08-28 11:39:00
  - Authors: Loom
  - Summary: Preserve current portable test timing distribution and baseline failure observations.
  - Status: preserved/local

---

# Portable Test Timing Profile Preservation

## Preserved Material

- Material Description: individual timing/exit observations for obvious package/carrier candidates and the complete current portable test-file set.
- Material Kind: per-file elapsed milliseconds, exit status, bounded failure tails, distribution percentiles, and total batch elapsed.
- Focused Profiler Test: `node tools/profile-test-files.test.mjs` passed and proves per-file timing plus continuation across failure.
- Initial Eight Candidates: total internal `3902.934 ms`, external `3.92 s`; slowest `archiveCarrierV2.test.mjs` `1486.519 ms`.
- Additional Named Sweep: 16 package/carrier-oriented tests totaled `3597.998 ms`, external `3.64 s`; slowest in that sweep `postV425SemanticPackageLocalityIntegration.test.mjs` `574.852 ms`.
- Complete Portable Suite Profile: 70 test files; summed per-file elapsed `20184.643 ms`; two profiling batch walls `10.38 s` and `9.93 s`; 10 tests currently exit non-zero.
- Distribution: median `231.395 ms`; p90 `546.188 ms`; p95 `679.911 ms`; p99/max `1597.331 ms`.
- Slowest Portable Test: `src/tooling/portable/handoff/archiveCarrierV2.test.mjs` `1597.331 ms`, passing.
- Current Non-Zero Portable Tests: `portable.loadedParentIdentityEvidenceClosure`, `carrierProjection`, `coldConsumerEntrypoint`, `contextAudit`, `handoff.manufacture.scale`, `handoff.manufacture`, `multiRootManufacture`, `pointerEntrypoint`, `portable.lineageIntegrityRepairHumanProjectionContract`, and `portable.test`.
- Triage Result: no individual portable test reached two seconds on this host; the complete portable test-file set is tens of seconds, not ten-plus minutes, when launched independently.

## Preservation Act

- Preservation Method: copied machine profile results from two bounded complete-portable batches plus earlier candidate sweeps.
- Preservation Time Or State: captured after Site tasks 001-005 with no portable production mutation in this task.

## Provenance

- Known Source: current warm Site working state and exact current test files under `src/tooling/portable` plus selected package/export tests.
- Provenance Limits: each file is launched as an independent Node process; this is not identical to every orchestration/environment effect of the full repository validation chain.

## Fidelity And Loss

- Fidelity Notes: profiler uses monotonic `process.hrtime.bigint()` around each child process and captures exit code; failure output is bounded to a tail for diagnostics.
- Known Losses: cold/warm filesystem cache variance, host scheduling variance, and cross-test shared-process effects are not represented.

## Custody Or Storage Boundary

- Storage Or Custody State: current-only Site continuity artifact under `.topics/tooling/iteration-efficiency/`.
- Reuse Boundary: suitable for later timing comparison and choosing which test groups warrant orchestration optimization.

## Interpretation Limits

- Does Not Prove: that the full validation chain cannot be slow, that current failures are acceptable, or that any test does or does not correlate with host additional review.
- Not Yet Used As: broad regression acceptance, release qualification, Anchor acceptance, or transport closure.
- Must Not Be Treated As: authority to remove slow tests, ignore failures, weaken assertions, or infer internal host review behavior from test content.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: 3Xy4aRSBarCMZOHh2ihZY41tjwc6J8epNOWwV46LVng