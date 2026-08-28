# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.preservation.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/preservation/tiinex.preservation.v1.schema.md)
  - Created At: 2026-08-28 11:25:00
  - Authors: Loom
  - Summary: Preserve same-workspace Handoff manufacture timings with and without maintained standard roundtrip.
  - Status: preserved/local

---

# Real Handoff Manufacture And Roundtrip Timing Preservation

## Preserved Material

- Material Description: two local manufacture runs against the same current Site workspace and task-001 Handoff timing fixture, differing only by `--no-roundtrip` versus maintained default roundtrip.
- Material Kind: wall-clock, resource, roundtrip status, workspace enumeration, carrier size, and finding-count evidence.
- No-Roundtrip Wall: `3.14 s`; CPU `110%`; maximum RSS `256716 KB`; operation status `ready`; findings `0`.
- Standard-Roundtrip Wall: `4.64 s`; CPU `113%`; maximum RSS `264340 KB`; operation status `ready`; findings `0`.
- Increment Observed For Default Roundtrip Run: approximately `1.50 s` over the no-roundtrip run on this host.
- Roundtrip Result: `passed` with recipient-facing v2 roundtrip summary.
- Workspace Enumeration: `1682` regular files / `12,983,459` bytes; deterministic enumeration state `qualified`.
- Manufactured Carrier: `17,001,837` bytes in the roundtrip run.
- Tooling Bootstrap: embedded-qualified; 341 runtime files / 3,516,151 bytes.
- Timing Fixture Boundary: task-001 Handoff was reused only to make both transport runs structurally identical; neither generated timing carrier is a new semantic return artifact.

## Preservation Act

- Preservation Method: captured `/usr/bin/time` wall/resource output plus maintained manufacture JSON from two immediately comparable local executions.
- Preservation Time Or State: current warm Site working tree after tasks 001-008; no source mutation by the timing task.

## Provenance

- Known Source: `/mnt/data/tiinex-site-reviewed-turn-work`, verified incoming bootstrap runtime, and the current incoming Anchor-to-Loom package parent.
- Provenance Limits: host-local process timings exclude model execution, client streaming, external queueing, and any platform-side review latency.

## Fidelity And Loss

- Fidelity Notes: both runs use the same workspace root, Workspace target, Handoff path, workspace id, package parent, and output semantics except the roundtrip switch.
- Known Losses: filesystem cache and process scheduling can shift repeated timings; the measured difference is an observed baseline, not a fixed service-level guarantee.

## Custody Or Storage Boundary

- Storage Or Custody State: current-only Site continuity artifact; diagnostic generated ZIPs remain outside the Site workspace under `/mnt/data/measure-manufacture-*`.
- Reuse Boundary: suitable for deciding whether local manufacture/roundtrip deserves optimization relative to larger measured costs.

## Interpretation Limits

- Does Not Prove: that roundtrip can never be expensive on another carrier, why any host request takes minutes, or why an additional-review UI signal may appear.
- Not Yet Used As: Anchor acceptance, release qualification, or authority to disable maintained roundtrip gates.
- Must Not Be Treated As: permission to skip required transport qualification or as evidence about internal platform review behavior.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: gQE85EO_YsityXMX6bAMw07DjwEFGOFdKrLplv7sI6c