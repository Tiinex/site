# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.preservation.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/preservation/tiinex.preservation.v1.schema.md)
  - Created At: 2026-08-28 12:25:00
  - Authors: Loom
  - Summary: Preserve real restartable closure-plan timing, fail-closed behavior, resume behavior, and the observed current-versus-parent runtime authority boundary.
  - Status: preserved/local

---

# Restartable Closure Plan Dogfood Baseline Preservation

## Preserved Material

- Material Description: real five-step closure-like plan timings, completed-plan resume timing, fail-closed checkpoint behavior, and parent-carrier runtime authority evidence.
- Material Kind: closure orchestration dogfood and local timing baseline.
- Full Correct Plan: 5 steps completed in 5,140.497 ms internal / 5.18 s wall.
- Completed Resume: 0 steps executed, 5 reused, 0 ms internal / 0.02 s wall.
- Fail-Closed Dogfood: three completed steps remained checkpointed when the fourth command returned exit 2; resume reran only that fourth step.
- Authority Boundary: current Site runtime owns current Site operations; incoming verified bootstrap runtime owns parent-carrier context audit and cold-start qualification for the older incoming carrier shape.

## Preservation Act

- Preservation Method: host-local checkpointed-plan runs with exact command/argument arrays, bounded child diagnostics, and this self-integrity-sealed preservation artifact.
- Preservation Time Or State: current warm Site state after task 024 closure.

## Provenance

- Known Source: current Site runtime, current Tooling fast gate, incoming Anchor-to-Loom carrier, and the bootstrap runtime verified by that carrier cold start.
- Provenance Limits: local timings describe this host and current process state only.

## Fidelity And Loss

- Fidelity Notes: represented commands were executed unchanged; nonzero exit remained blocking and no accepted-exit override was introduced.
- Known Losses: checkpoint receipts retain bounded stdout/stderr tails rather than full child output.

## Custody Or Storage Boundary

- Storage Or Custody State: temporary host-local plan/checkpoint files plus current Site task/preservation artifacts.
- Reuse Boundary: suitable as evidence for restartable closure orchestration and runtime authority separation, not as a substitute for final return-carrier qualification.

## Interpretation Limits

- Does Not Prove: that current Site can context-audit every historical carrier shape, that a child process survives between turns, or that external review/classification behavior is affected.
- Not Yet Used As: Anchor acceptance or final release qualification.
- Must Not Be Treated As: permission to ignore a nonzero command, choose a runtime by convenience rather than declared authority, or bypass required final gates.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:FUKii0La4j_BDCFs8OzqgKXUAxNL3NZ6o-cwGQHrkJ4
