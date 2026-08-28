# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.preservation.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/preservation/tiinex.preservation.v1.schema.md)
  - Created At: 2026-08-28 11:39:43
  - Authors: Loom
  - Summary: Preserve package-parent lineage reuse correctness evidence, deterministic hash-volume reduction, and observed host wall-clock variance.
  - Status: preserved/local

---

# Package Parent Qualified Lineage Reuse Preservation

## Preserved Material

- Material Description: focused regression results, real parented manufacture status, exact package-parent hash-multiplicity A/B, and host wall-clock observations for qualified-lineage reuse.
- Material Kind: implementation evidence and performance diagnostic comparison.
- Source Files: `carrierLineage.js`, `cli.handoff-manufacture.js`, and `carrierLineage.test.mjs` only.
- Focused Green Checks: `carrierLineage.test.mjs`; `cli.run.test.mjs`; `validate:tooling-iteration` with `5 / 5` steps passed in `977.611 ms` internal elapsed time.
- Real Parented Smoke: current-source no-roundtrip manufacture returned `ready`, exit code `0`, in approximately `2.52 s` wall-clock; the surrounding shell wrapper later returned nonzero because of unrelated terminal-clear behavior, not Tiinex manufacture status.
- Instrumented Before: `12,117` SHA calls; approximately `216.95 MB` hashed; approximately `144.95 MB` duplicate identical bytes hashed; exact carried Site payload and bootstrap source each hashed `3` times.
- Instrumented After: `12,108` SHA calls; approximately `199.24 MB` hashed; approximately `127.23 MB` duplicate identical bytes hashed; exact carried Site payload and bootstrap source each hashed `2` times.
- Deterministic Hash Reduction: approximately `17.71 MB`, corresponding to one redundant package-parent internal-inspection pass removed while preserving the separate outer parent-ZIP digest.
- Initial Uninstrumented Before Runs: `2.84 s`, `3.20 s`, `2.94 s`; median `2.94 s`.
- Initial Uninstrumented After Runs: `7.11 s`, `3.39 s`, `3.17 s`; median `3.39 s`; this series does not establish a wall-clock improvement.
- Interleaved Completed Runs: before `3.01 s`, `8.64 s`, `3.02 s`, `2.98 s`; after `2.89 s`, `3.30 s`, `2.99 s`, `2.87 s`.
- Host Stall Observation: the next identical after-variant manufacture produced no output bytes and remained active until the host process runner killed it at its `180 s` hard timeout, despite preceding identical-input executions normally completing near `3 s`.

## Preservation Act

- Preservation Method: compared temporary runtime variants that differed only in package-parent qualified-lineage reuse, retained exact hash counters, then stopped repeated benchmarking after host variance made wall-clock attribution unreliable.
- Preservation Time Or State: captured after focused tests and a real current-source parented smoke passed.

## Provenance

- Known Source: current Site working tree, exact carried Site baseline, current Anchor-to-Loom package parent, and host-local A/B output under `/mnt/data/task012-*`.
- Provenance Limits: wall-clock measurements include host process scheduling/filesystem/runtime variance and cannot identify external review behavior.

## Fidelity And Loss

- Fidelity Notes: outer parent ZIP digest remains computed from exact bytes; only already-qualified internal carrier lineage is reused within the same CLI operation.
- Known Losses: the 180-second host timeout provides a lower bound on one anomalous execution rather than its unconstrained completion time.

## Custody Or Storage Boundary

- Storage Or Custody State: implementation in current Site source; summarized evidence in this current-only preservation artifact.
- Reuse Boundary: suitable as the bounded acceptance baseline for same-operation package-parent lineage reuse and for later stalled-process diagnostics.

## Interpretation Limits

- Does Not Prove: a stable wall-clock speedup, that hashing caused the 180-second stall, or why any external additional-review signal appears.
- Not Yet Used As: Anchor acceptance or release qualification.
- Must Not Be Treated As: authority to reuse package-parent lineage across independent operations, skip outer ZIP hashing, or weaken parent-carrier qualification.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:6QoFPDI74vTCxsLD22FTY2rDq52doYiYi6AzmJrz2w0
