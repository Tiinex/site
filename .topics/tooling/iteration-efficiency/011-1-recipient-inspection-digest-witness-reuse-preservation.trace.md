# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.preservation.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/preservation/tiinex.preservation.v1.schema.md)
  - Created At: 2026-08-28 11:33:11
  - Authors: Loom
  - Summary: Preserve correctness boundaries and measured hash/wall-clock effect of recipient inspection digest-witness reuse.
  - Status: preserved/local

---

# Recipient Inspection Digest Witness Reuse Preservation

## Preserved Material

- Material Description: source boundary, focused regression results, exact hash-multiplicity A/B, and cold-process manufacture timing for the recipient-v2 witness-reuse optimization.
- Material Kind: implementation evidence and performance comparison.
- Source Files: `recipientV2.transportManifest.js`, `recipientV2.inspect.helpers.js`, and `recipientV2.inspect.js` only.
- Before Instrumented Roundtrip: `14,262` SHA calls, `311.88 MB` hashed, `276.71 MB` duplicate identical bytes hashed; generated workspace archive hashed `11` times and bootstrap archive `9` times.
- After Instrumented Roundtrip: `14,240` SHA calls, `250.79 MB` hashed, `215.62 MB` duplicate identical bytes hashed; generated workspace archive hashed `7` times and bootstrap archive `7` times.
- Hash-Volume Reduction: approximately `61.09 MB`, about `19.6%` of total hashed volume and about `22.1%` of duplicate hashed volume in the observed A/B process.
- Cold Uninstrumented Before Runs: `7.61 s`, `3.82 s`, `3.50 s`; median `3.82 s`.
- Cold Uninstrumented After Runs: `3.37 s`, `3.48 s`, `3.12 s`; median `3.37 s`.
- Median Wall-Clock Improvement: approximately `0.45 s`, about `11.8%` for the observed root-roundtrip manufacture; the `7.61 s` first-before run is retained as a host/cache outlier rather than discarded.
- Focused Green Checks: recipient-v2 transport purity, archive-carrier v2 tamper/fail-closed regression, material-closure regression, cold-start qualification, and `validate:tooling-iteration` (`0.90 s` wall in the recorded run).
- Known Baseline Failure: `coldConsumerEntrypoint.test.mjs` still fails on the pre-existing filename-dimension assertion (`005` expected, `001` produced); this task did not touch that path.

## Preservation Act

- Preservation Method: compared temporary before/after copies of the same current Site state, restoring only the three exact carried baseline inspector files for the before variant; both variants manufactured ready carriers with passed roundtrip.
- Preservation Time Or State: captured immediately after focused recipient-v2 qualification passed.

## Provenance

- Known Source: current Site working tree, exact carried Site baseline workspace ZIP, current Handoff fixtures, and host-local A/B outputs.
- Provenance Limits: wall-clock values include process/filesystem variation and do not measure external review or model scheduling.

## Fidelity And Loss

- Fidelity Notes: received/rehydrated bytes still undergo a fresh recipient-v2 inspection; manifest-absent comparison retains the old full digest path.
- Known Losses: temporary profiler counters add overhead; performance evidence is host-local, not a universal benchmark.

## Custody Or Storage Boundary

- Storage Or Custody State: implementation in current Site source; evidence summarized in this current-only preservation artifact.
- Reuse Boundary: suitable as the acceptance baseline for bounded intra-inspection digest witness reuse only.

## Interpretation Limits

- Does Not Prove: that global digest memoization is safe, that independent operations may reuse mutable-byte digests, or why host-side additional review occurs.
- Not Yet Used As: Anchor acceptance or release qualification.
- Must Not Be Treated As: authority to skip manifest verification, archive parsing, received-side inspection, or tamper checks.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:yqAUhHsIHYUTOml5qfF-WpC3ptdh7IR5EoUrjcWV-qk