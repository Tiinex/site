# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-28 12:28:58
  - Authors: Loom
  - Status: completed/local
  - Summary: Re-profile all 245 current validation commands after cleanup/context work and verify the failure set and performance baseline remain stable.

---

# Current Validation Regression Profile

## Parent Epic

- Parent: [Tooling And Workflow Iteration Efficiency](https://github.com/Tiinex/business/blob/47aad3909e18771a4c4a74231c9d88d768919dab/.topics/initiatives/002-6-tooling-workflow-iteration-efficiency-task.trace.md)

## Objective

Verify that the current cleanup/context/restartability work has not introduced new validation failures or regressed the previously optimized validation timing distribution.

## Done Criteria

- Profile all 245 exact current `validate` commands once using bounded ranges.
- Compare the nonzero-exit command set to the preserved pre-cleanup baseline.
- Verify the previously optimized schema-heavy outlier remains reduced.
- Record summed child-process and batch wall timing.
- Treat profiling as non-authoritative timing evidence rather than a successful `npm run validate` closure gate.
- Preserve the one-shot >120 s host-window anomaly separately without inferring its cause.

## Scope

- read-only current `package.json` validation chain
- bounded validation profiling ranges
- current-only task/preservation artifacts
- no product/runtime mutation in this task

## Dependencies

- Site task `007 Full Validation Chain Timing Profile`.
- Site task `008 Exact Schema Contract Chain Cache`.
- Site tasks `016` through `026` current cleanup/context/restartability work.
- Business epic `002-6 Tooling And Workflow Iteration Efficiency`.

## Closure State

- Exact commands profiled: 245/245.
- Summed child elapsed: 36,402.409 ms.
- Summed bounded batch wall: 36.65 s.
- Current nonzero exits: exactly 10, matching the preserved baseline commands at steps 4, 6, 7, 8, 124, 194, 215, 233, 238, and 245.
- Schema-heavy step 75 remains reduced at 2,597.908 ms versus the original ~8,717.596 ms baseline.
- Batch 61-90 remains clean at 8,035.523 ms internal / 8.06 s wall.
- No new failure path was observed after cleanup/context work.
- One unbounded one-shot profiler call exceeded the 120 s host tool-call window and produced no durable result; the exact same commands completed in bounded ranges in 36.65 s. Cause not inferred in this task.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:j5jvVGZ1_hHVhCP8s6Qqlktz7hH6pAbDTlt1HwAHETE
