# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.preservation.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/preservation/tiinex.preservation.v1.schema.md)
  - Created At: 2026-08-28 12:28:58
  - Authors: Loom
  - Summary: Preserve the post-cleanup 245-command validation timing profile, unchanged baseline failure set, and bounded-versus-one-shot execution observation.
  - Status: preserved/local

---

# Current Validation Regression Profile Preservation

## Preserved Material

- Material Description: post-cleanup timing and exit observations for all 245 exact current `validate` commands.
- Material Kind: regression timing baseline and failure-set comparison.
- Total Child Elapsed: 36,402.409 ms.
- Total Bounded Batch Wall: 36.65 s.
- Nonzero Commands: 10, exactly matching the prior baseline at steps 4, 6, 7, 8, 124, 194, 215, 233, 238, and 245.
- Primary Schema-Heavy Outlier: step 75 passed in 2,597.908 ms, preserving the earlier ~8.72 s to ~2.6 s optimization.
- One-Shot Observation: one unbounded profiler invocation exceeded a 120 s host tool-call window and returned no result even though the same exact commands completed in bounded ranges in 36.65 s.

## Preservation Act

- Preservation Method: nine bounded read-only profiling ranges covering steps 1-245 exactly once, with full profiler bodies kept host-local and only aggregate timing/failure evidence projected.
- Preservation Time Or State: current warm Site state after tasks 016-026.

## Provenance

- Known Source: exact current `package.json` `validate` script and current Site working tree.
- Provenance Limits: local profiling is not equivalent to a successful correctness gate and does not explain host scheduling or review behavior.

## Fidelity And Loss

- Fidelity Notes: every command comes directly from the current validation script and was run in original order within its bounded range.
- Known Losses: bounded ranges use separate profiler parent processes and therefore do not reproduce any parent-process accumulation specific to one unbounded profiler process.

## Custody Or Storage Boundary

- Storage Or Custody State: host-local profiling receipts plus this current-only preservation artifact.
- Reuse Boundary: suitable as the post-cleanup validation regression baseline and as evidence motivating bounded/restartable profiling.

## Interpretation Limits

- Does Not Prove: why the unbounded profiler exceeded the host window, why external review events occur, or that the ten baseline failures are acceptable for release.
- Not Yet Used As: final release qualification or Anchor acceptance.
- Must Not Be Treated As: authority to ignore the known failures or replace full final validation.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:A_umcYTU1ZwJhAsi2k6cVtBGd5a8Ww4Gnf3Rgcicz5g
