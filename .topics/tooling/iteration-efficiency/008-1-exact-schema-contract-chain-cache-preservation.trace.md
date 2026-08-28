# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.preservation.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/preservation/tiinex.preservation.v1.schema.md)
  - Created At: 2026-08-28 11:20:00
  - Authors: Loom
  - Summary: Preserve the measured before/after effect and correctness boundary of the exact-Markdown single-schema cache used only by contract-chain compilation.
  - Status: preserved/local

---

# Exact Schema Contract Chain Cache Preservation

## Preserved Material

- Material Description: source boundary, correctness tests, CPU-profile interpretation, and before/after validation timing for the bounded chain-compilation cache.
- Material Kind: implementation evidence, focused regression results, hotspot timing, and full-chain timing comparison.
- Cache Boundary: only string inputs supplied through `compilePortableSchemaContractChain()` are cached; the exact Markdown string is the cache key; maximum retained entries are 64.
- Composition Boundary: chain qualification and chain composition are rebuilt on every call; only already-compiled single-schema contracts are eligible for reuse.
- Direct API Boundary: `compilePortableSchemaContract()` remains uncached and repeated direct calls still return distinct but deeply equivalent compiled objects.
- Changed-Bytes Regression: `node src/tooling/portable/schema/contract.compile.cache.test.mjs` passed in about `0.04 s`; a changed child-schema string produced changed required-input authority rather than stale cached authority.
- Focused Contract Tests: `contract.foundation`, `contract.machine-shape`, and `contract.ordinary-fields.canonical` passed after the optimization.
- CPU Profile Before: the primary 8.7-second acceptance outlier showed repeated schema-contract parsing/compilation, `canonicalTransition.schemaCache.js` SHA-1 work, and garbage collection among the dominant sampled costs.
- Primary Outlier Before: validation step 75 `postV423CanonicalTransitionProductVerticalSlice.test.mjs` measured `8717.596 ms` in the complete before profile.
- Primary Outlier After: the same step measured `2409.745 ms` in the complete after profile; three separate cold-process focused runs measured `2620.583 ms`, `2643.900 ms`, and `2401.896 ms`.
- Batch 61-90 Before/After: `16,656.291 ms` before and `8,314.164 ms` after, with zero failures in both timing-profile runs.
- Complete 245-Command Before: `47,435.650 ms` summed child-process time with 10 current baseline failures.
- Complete 245-Command After: `37,555.821 ms` summed child-process time with the same 10 current baseline failures.
- Complete-Chain Improvement: `9879.829 ms`, approximately `20.83%`, without deleting, reordering, or parallelizing validation commands.
- Fast Iteration Gate: remained green after the source change at about `0.85 s` in the measured run.

## Preservation Act

- Preservation Method: copied exact timing outputs from the bounded validation profilers and focused tests executed against the same warm Site working state before and after the single source optimization.
- Preservation Time Or State: captured after the complete after-profile and exact-Markdown cache regression passed.

## Provenance

- Known Source: current Site working tree, Site task `007` before-profile preservation, focused CPU profile of validation step 75, and the after-profile covering all 245 exact current validation commands.
- Provenance Limits: measurements are host-local wall/child-process observations; they do not measure model queueing, client streaming, or external review latency.

## Fidelity And Loss

- Fidelity Notes: before and after full-chain measurements use the same profiler semantics and the same exact current package validation command chain; the failure count remained 10.
- Known Losses: process scheduling, filesystem cache state, and Node startup variation can shift individual timings; the preserved claim is the observed magnitude and semantic boundary, not an invariant benchmark number.

## Custody Or Storage Boundary

- Storage Or Custody State: current-only Site continuity artifact under `.topics/tooling/iteration-efficiency/`.
- Reuse Boundary: suitable as the acceptance baseline for this bounded optimization and as input to later Tooling iteration-efficiency work.

## Interpretation Limits

- Does Not Prove: that all schema compilation should be globally memoized, that the remaining validation failures are acceptable, or why any host request may incur additional review or queue time.
- Not Yet Used As: Anchor acceptance, release qualification, or permission to skip full validation closure.
- Must Not Be Treated As: authority to cache non-string mutable schema documents, reuse stale schema authority, suppress failures, or infer internal host-review causality.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: 3CdSRJVf10bnedoE8pFQTbh5WQecT5u5GDkkCbwgqbo