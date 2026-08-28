# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.preservation.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/preservation/tiinex.preservation.v1.schema.md)
  - Created At: 2026-08-28 11:48:00
  - Authors: Loom
  - Summary: Preserve the measured transport-size benefit and small local manufacture timing effect of excluding legacy `.topics/development` material.
  - Status: preserved/local

---

# Legacy Development Artifact Transport Impact Preservation

## Preserved Material

- Material Description: exact current-vs-temporary-pruned workspace file/byte counts plus no-roundtrip and default-roundtrip manufacture A/B.
- Material Kind: cleanup decision evidence.
- Full Current Tree: `1,700` files and `13,053,799` bytes in the direct filesystem count used by this A/B.
- Pruned Temporary Tree: `1,312` files and `10,196,836` bytes after excluding only `.topics/development`.
- Legacy Directory Delta: `388` files and `2,856,963` bytes removed from the temporary comparison tree.
- Full No-Roundtrip: child elapsed `2,442.952 ms`; emitted carrier `17,260,730` bytes; status completed/exit `0`.
- Pruned No-Roundtrip: child elapsed `2,392.903 ms`; emitted carrier `14,286,553` bytes; status completed/exit `0`.
- Carrier Size Reduction: `2,974,177` bytes, approximately `17.2%` of the observed full carrier.
- Full Default Roundtrip: child elapsed `3,315.020 ms`; completed/exit `0`; roundtrip output reported passed.
- Pruned Default Roundtrip: child elapsed `3,260.153 ms`; completed/exit `0`; roundtrip output reported passed.
- Observed Local Timing Delta: approximately `50 ms` no-roundtrip and `55 ms` default-roundtrip in these single A/B runs; not large enough to treat legacy cleanup as a primary local runtime optimization.

## Preservation Act

- Preservation Method: copied the exact current Site working tree to a temporary host directory, removed only `.topics/development` in the copy, and manufactured both variants through the same current Site CLI and package parent using task-013 checkpointing.
- Preservation Time Or State: captured after task `013`, before any legacy cleanup in the authoritative current workspace.

## Provenance

- Known Source: current Site working tree, temporary `/mnt/data/task014-site-without-legacy-development`, current Anchor-to-Loom package parent, and host-local task-014 receipts/output carriers.
- Provenance Limits: timing is host-local and based on one completed execution per A/B mode; transport byte-size differences are deterministic for the observed workspace state.

## Fidelity And Loss

- Fidelity Notes: the temporary pruned tree differed only by `.topics/development`; Handoff route, workspace target, package parent, and Tooling command were identical.
- Known Losses: this task does not measure upload/network latency, model context cost, remote review behavior, or cold-start discovery impact after transport.

## Custody Or Storage Boundary

- Storage Or Custody State: current Site tree remains unchanged; pruned comparison and manufactured outputs are temporary host-local diagnostics.
- Reuse Boundary: suitable as evidence for deciding whether legacy artifact cleanup is worthwhile for current-tree and transport hygiene.

## Interpretation Limits

- Does Not Prove: that deleting legacy artifacts will materially reduce local manufacture time, eliminate external review delays, or be semantically safe without reference/validation checks.
- Not Yet Used As: authority to delete `.topics/development` or Anchor acceptance.
- Must Not Be Treated As: evidence that docs or other artifact families should be removed.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:W3GPUjTa0hKcLVyYAlGRmpJ3Q-ub98bRrHUc1pvLJR4
