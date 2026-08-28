# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.preservation.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/preservation/tiinex.preservation.v1.schema.md)
  - Created At: 2026-08-28 09:58:07
  - Authors: Loom
  - Summary: Preserve bounded repository-search behavior, real match cardinality, fixture-exclusion evidence, and iteration-gate qualification.
  - Status: preserved/local

---

# Bounded Current Tooling Context Search Preservation

## Preserved Material

- Material Description: real current Site literal search receipts plus bounded search regression and fast-gate qualification.
- Material Kind: generated-context/search-workset evidence.
- Query: `.topics/development`.
- Current-Default Search: 1,326 text files scanned; 34 files matched; 112 total matches; 10 returned snippets; 3,294 JSON output bytes; result marked truncated.
- Explicit Legacy-Inclusive Search: 1,342 text files scanned; 45 files matched; 135 total matches; 10 returned snippets; 3,243 JSON output bytes; result marked truncated.
- Legacy Fixture Default: `src/tooling/portable/fixtures/legacy-artifacts/` excluded from current-default source search.
- Output Scaling Boundary: returned projection size is bounded by `--limit` and `--snippet-chars`, not by total match cardinality.
- Bounded Tooling Iteration Gate: passed 10/10 steps in 1,526.449 ms.

## Preservation Act

- Preservation Method: deterministic Node filesystem search with literal matching, bounded snippets, explicit exclusion profile, and host-local JSON receipts.
- Preservation Time Or State: current warm Site state after tasks 017-019.

## Provenance

- Known Source: current Site filesystem.
- Provenance Limits: counts describe the current snapshot only and do not represent external model context/tokenization directly.

## Fidelity And Loss

- Fidelity Notes: total match/file counts are retained even when returned snippets are truncated; explicit legacy-fixture inclusion restores historical fixture search.
- Known Losses: current-default result intentionally omits historical fixture snippets and returns only the configured bounded number of current snippets.

## Custody Or Storage Boundary

- Storage Or Custody State: current-only Site continuity artifact and host-local search receipts.
- Reuse Boundary: suitable for routine Tooling discovery before escalating to explicit broader or legacy-inclusive search.

## Interpretation Limits

- Does Not Prove: that raw repository search caused any external review event or that broad search is never required.
- Not Yet Used As: Anchor acceptance or release qualification.
- Must Not Be Treated As: permission to hide total match cardinality or prevent explicit historical investigation when needed.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:hGBVetBRDIu8P_aLnVbgt5j6weHsgUL1EuK9nwmBn2A