# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.preservation.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/preservation/tiinex.preservation.v1.schema.md)
  - Created At: 2026-08-28 11:40:00
  - Authors: Loom
  - Summary: Preserve exact boundary accounting, focused regressions, digest-volume A/B, and cold-process timing for recipient roundtrip digest-witness propagation.
  - Status: preserved/local

---

# Recipient Roundtrip Digest Witness Propagation Preservation

## Preserved Material

- Material Description: exact large-digest call stacks, full SHA multiplicity A/B, cold-process wall-clock A/B, and focused recipient-v2 regression results.
- Material Kind: implementation evidence and performance comparison.
- Intended Large-Archive Boundaries After Change: finalized construction digest; source physical recipient inspection; independent post-serialize outer-ZIP parser digest.
- Generated Workspace Archive Large SHA Passes: `7 -> 3`.
- Generated Bootstrap Archive Large SHA Passes: `5 -> 3` after the task-011 bootstrap/cache witness call-site closure.
- Instrumented Before: `14,957` SHA calls; `285.94 MB` total hashed bytes; `214.83 MB` duplicate identical bytes.
- Instrumented After: `14,937` SHA calls; `224.79 MB` total hashed bytes; `153.72 MB` duplicate identical bytes.
- Hash Volume Reduction: approximately `61.15 MB`, about `21.4%` of observed total hash volume; duplicate-identical volume reduced by approximately `61.11 MB`, about `28.4%`.
- Cold Before Runs: `3.74 s`, `3.80 s`, `3.58 s`; median `3.74 s`.
- Cold After Runs: `3.14 s`, `3.33 s`, `3.24 s`; median `3.24 s`.
- Median Wall-Clock Improvement: approximately `0.50 s`, about `13.4%` for the observed full-Site default-roundtrip manufacture.
- Focused Green Checks: recipient-v2 transport purity; archive-carrier v2 tamper/fail-closed regression; material closure; cold-start qualification; `validate:tooling-iteration` (`805.119 ms` internal in the recorded run).
- Manufacture Result: all observed before/after A/B default-roundtrip processes returned `ready`.

## Preservation Act

- Preservation Method: compared temporary pre-task-012 and current runtime copies against the same current Site workspace and exact package parent; diagnostics were outside Site and did not alter authoritative source bytes.
- Preservation Time Or State: current warm Site state after task `011` closure wiring and task `012` implementation.

## Provenance

- Known Source: current Site workspace, captured pre-task-012 runtime copy, current Anchor-to-Loom carrier, and host-local SHA/timing diagnostics.
- Provenance Limits: wall-clock values are host-local and include filesystem/process variance; they do not measure host-side model scheduling or additional review latency.

## Fidelity And Loss

- Fidelity Notes: source-side transport manifest still hashes physical carrier bytes independently; post-serialization outer ZIP parsing still hashes received entry bytes independently; manifest-absent/fallback paths retain normal digest computation.
- Known Losses: diagnostic SHA counters add bookkeeping overhead and the embedded bootstrap archive changes slightly with runtime source changes, so exact archive byte sizes differ between variants.

## Custody Or Storage Boundary

- Storage Or Custody State: implementation in current Site source; summarized evidence in this current-only preservation artifact; temporary A/B runtimes remain non-authoritative host-local material.
- Reuse Boundary: suitable as acceptance baseline for same-operation construction/inspection/rehydration digest-witness propagation.

## Interpretation Limits

- Does Not Prove: that independent operations may reuse mutable-byte digests, that received-byte verification can be skipped, or why host-side additional review occurs.
- Not Yet Used As: Anchor acceptance or release qualification.
- Must Not Be Treated As: authority for global digest memoization, cross-process caching, or removal of the source/received physical integrity boundaries.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:s_defa_eru-2XNc1cjQ5Nhc_k_atMYuIfjmQM2GShEY
