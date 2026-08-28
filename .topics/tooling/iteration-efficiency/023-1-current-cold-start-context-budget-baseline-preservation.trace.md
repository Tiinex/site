# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.preservation.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/preservation/tiinex.preservation.v1.schema.md)
  - Created At: 2026-08-28 10:06:19
  - Authors: Loom
  - Summary: Preserve the current bounded-versus-full cold-start context budget and timing baseline after Site legacy/context cleanup.
  - Status: preserved/local

---

# Current Cold Start Context Budget Baseline Preservation

## Preserved Material

- Material Description: full-versus-bounded output byte counts and local phase timing for current inspect, audit, search-lineage, resolve-lineage, plus bounded current-source search.
- Material Kind: context-budget and local Tooling workflow baseline.
- Inspect: 268,897 B full versus 970 B bounded; 277.21x reduction.
- Audit: 600,216 B full versus 924 B bounded; 649.58x reduction.
- Search Lineage: 42,151 B full versus 1,343 B bounded; 31.39x reduction.
- Resolve Lineage: 72,333 B full versus 2,449 B bounded; 29.54x reduction.
- Four-Operation Total: 983,597 B full versus 5,686 B bounded; 172.99x reduction.
- Local Timing: 282.721 ms summed full-operation CLI time versus 285.724 ms bounded-operation CLI time.
- Bounded Source Search: 765 B for one current `recipient topology` query; 1 total/returned match.
- Bounded Workflow Total: 6,451 B including source search.

## Preservation Act

- Preservation Method: all full operation bodies were redirected to host-local files; only byte counts, bounded receipts, and timing metadata were projected into the working conversation.
- Preservation Time Or State: current warm Site state after tasks 016-022.

## Provenance

- Known Source: current Site `.topics`, current portable CLI, and current bounded Site source-search tool.
- Provenance Limits: local byte/timing measurements describe only this host process and current Site state.

## Fidelity And Loss

- Fidelity Notes: full results remain explicitly available; bounded receipts retain operation status, structural counts, finding summaries, actionable warnings/errors, and requested phase timing.
- Known Losses: bounded workflow intentionally omits body-scale artifact, audit, match, graph, traversal, and raw repository-search projections.

## Custody Or Storage Boundary

- Storage Or Custody State: host-local measurement files plus this current-only preservation artifact.
- Reuse Boundary: suitable as the current context-budget baseline for later Tooling and false-flag correlation observations.

## Interpretation Limits

- Does Not Prove: causality for any external safety/review event, classifier behavior, model scheduling, or client streaming state.
- Not Yet Used As: Anchor acceptance or final release qualification.
- Must Not Be Treated As: permission to suppress required evidence, skip full qualification, or avoid external safety controls.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:qjrN-hPPNIa2s13x03z7x2DbfNOCEJM2n3JPtDfaq24