# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.preservation.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/preservation/tiinex.preservation.v1.schema.md)
  - Created At: 2026-08-28 11:29:22
  - Authors: Loom
  - Summary: Preserve exact recipient-v2 SHA multiplicity and CPU-profile evidence showing repeated exact-byte verification within one manufacture process.
  - Status: preserved/local

---

# Recipient Hash Multiplicity Profile Preservation

## Preserved Material

- Material Description: CPU samples plus exact SHA-call multiplicity from real full-Site manufacture with and without built-in roundtrip.
- Material Kind: performance diagnostic evidence.
- Default-Roundtrip CPU Profile: `4.79 s` wall-clock; `2,621 / 4,107` sampled ticks, about `63.8%`, landed in portable `sha256Hex()`.
- No-Roundtrip Hash Profile: `12,101` SHA calls; `1,827` unique `(length,digest)` identities; `216.83 MB` total bytes hashed; `144.97 MB` duplicate identical bytes hashed.
- Default-Roundtrip Hash Profile: `16,587` SHA calls; `1,828` unique `(length,digest)` identities; `400.15 MB` total bytes hashed; `328.29 MB` duplicate identical bytes hashed.
- Workspace Source Repetition: the exact `13,222,309` byte carried Site workspace identity was hashed `3` times in both profiles.
- Generated Workspace Archive Repetition: the exact `13,347,947` byte generated workspace archive was hashed `2` times without roundtrip and `11` times with roundtrip.
- Bootstrap Source Repetition: the exact `3,653,621` byte bootstrap identity was hashed `3` times in both profiles.
- Generated Bootstrap Archive Repetition: the exact `3,654,529` byte generated bootstrap archive was hashed `2` times without roundtrip and `9` times with roundtrip.
- Dominant Call Paths: recipient transport-manifest inspection, stored workspace archive inspection, recipient ZIP payload inspection, carrier-correlation evidence, route-pointer inspection, package file finalization, package-parent lineage inspection, and roundtrip reinspection/comparison.

## Preservation Act

- Preservation Method: used one CPU profile of the verified bootstrap manufacture path plus a temporary copied runtime whose only diagnostic modification recorded final SHA digest multiplicity; diagnostic copies were outside Site and were discarded as authority.
- Preservation Time Or State: captured after task `009` against the same current Site state and package parent.

## Provenance

- Known Source: verified incoming bootstrap runtime, current Anchor-to-Loom carrier, current Site working tree, and host-local profiler output.
- Provenance Limits: diagnostic instrumentation adds small bookkeeping overhead and does not measure external model/review latency.

## Fidelity And Loss

- Fidelity Notes: diagnostic manufacture remained status `ready`; measured wall times stayed near the uninstrumented task-009 baseline.
- Known Losses: CPU sampling is statistical; exact multiplicity counts are authoritative only for the observed process execution and carrier shape.

## Custody Or Storage Boundary

- Storage Or Custody State: summarized in this current-only Site preservation artifact; raw profiler/instrumented-runtime data remains host-local and non-authoritative.
- Reuse Boundary: suitable as the before-baseline for bounded intra-operation digest-witness reuse.

## Interpretation Limits

- Does Not Prove: that any integrity boundary can be skipped, that external review latency is caused by hashing, or that global digest memoization is safe.
- Not Yet Used As: Anchor acceptance or release qualification.
- Must Not Be Treated As: permission to cache mutable bytes across independent operations or bypass rehydration verification.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:u3Q1J61jfZcPIZSJpsF5SIMaR68ud8YboEmjxcGR-iM