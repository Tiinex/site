# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.preservation.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/preservation/tiinex.preservation.v1.schema.md)
  - Created At: 2026-08-28 11:25:05
  - Authors: Loom
  - Summary: Preserve the measured wall-clock cost of the real current Handoff lifecycle primitives and the isolated built-in roundtrip increment.
  - Status: preserved/local

---

# Handoff Lifecycle Timing Baseline Preservation

## Preserved Material

- Material Description: host-local wall-clock measurements for current-carrier orientation, context audit, cold-start qualification, full-Site manufacture without roundtrip, and the same manufacture with default roundtrip.
- Material Kind: operation timing baseline and qualification evidence.
- Carrier Under Read: `tiinex-business-003-1-1-1-1-1-1-1-anchor-to-loom.handoff-package.zip`.
- Orientation: `1.21 s`; status `ready`; zero findings.
- Context Audit: `1.06 s`; status `ready`; zero findings.
- Cold-Start Qualification: `1.16 s`; status `preferred-pass`; zero findings.
- Manufacture Without Roundtrip: `2.98 s` for a `17,001,837` byte Site carrier; status `ready`; zero findings.
- Manufacture With Default Roundtrip: `4.87 s` for the same `17,001,837` byte Site carrier; status `ready`; zero findings; roundtrip summary `passed`.
- Isolated Roundtrip Increment: approximately `1.89 s` wall-clock relative to otherwise identical manufacture.
- Primitive Interpretation: no measured lifecycle primitive in this run is individually a minute-scale operation on this host.

## Preservation Act

- Preservation Method: executed the verified bootstrap runtime carried by the current Anchor-to-Loom package as separate foreground processes, measuring each process with host wall-clock timing; manufacture variants used the same current Site workspace, Handoff route, Workspace target, and explicit package parent.
- Preservation Time Or State: captured against the warm Site working state after task `008` completed and before any lifecycle optimization.

## Provenance

- Known Source: current Anchor-to-Loom carrier, its verified bootstrap runtime, and the current Site working tree.
- Provenance Limits: process measurements exclude model scheduling, browser streaming, external review/queue latency, and user-observed client state.

## Fidelity And Loss

- Fidelity Notes: both manufacture runs produced the same projected carrier filename and byte count; only roundtrip behavior differed.
- Known Losses: filesystem cache state, process scheduling, and Node startup can shift timings; values are observed baselines rather than invariant performance guarantees.

## Custody Or Storage Boundary

- Storage Or Custody State: current-only Site continuity artifact under `.topics/tooling/iteration-efficiency/`; raw timing JSON remains host-local working evidence.
- Reuse Boundary: suitable for deciding whether later work should optimize Handoff primitives or redundant orchestration around them.

## Interpretation Limits

- Does Not Prove: why any host request is sent for additional review, that roundtrip is never expensive on other carriers, or that lifecycle primitives should be skipped.
- Not Yet Used As: Anchor acceptance, release qualification, or authority to weaken Handoff verification.
- Must Not Be Treated As: evidence that external queue/review time belongs to Tiinex process execution.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:sgWZgjg-2XfOhakHcNmC5Q7E4zs9MIgRry_CNAyd1EM