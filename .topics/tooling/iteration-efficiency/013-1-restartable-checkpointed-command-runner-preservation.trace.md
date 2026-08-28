# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.preservation.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/preservation/tiinex.preservation.v1.schema.md)
  - Created At: 2026-08-28 11:44:00
  - Authors: Loom
  - Summary: Preserve restartable command receipt semantics and real current-carrier timing evidence without treating host stalls or external review behavior as explained.
  - Status: preserved/local

---

# Restartable Checkpointed Command Runner Preservation

## Preserved Material

- Material Description: runner contract, focused unit evidence, one real current-carrier orientation, exact completed-resume behavior, explicit timeout behavior, and bounded iteration-gate result.
- Material Kind: workflow survivability implementation evidence.
- Unit Contract: the runner writes `running` before injected execution, refreshes heartbeat state during execution, writes terminal state atomically, reuses exact completed checkpoints without replay, rejects stale operation identity, and increments attempt on exact failed-operation resume.
- Real Orientation: current Anchor-to-Loom carrier orientation completed through the runner with child elapsed `1,282.270 ms`, `6` heartbeat writes, exit code `0`, and clean Tiinex output.
- Observed Outer Wall: the same wrapper invocation measured approximately `3.94 s` wall-clock, showing process/host wall may exceed the child phase measured inside the runner.
- Completed Resume: immediate exact-operation `--resume` performed no new child execution and returned in approximately `0.02 s` wall-clock.
- Explicit Timeout Probe: an intentionally sleeping synthetic child with `--timeout-ms 80` produced `timed-out`, exit `124`, `SIGTERM`, and `4` heartbeat writes after approximately `87.346 ms` internal elapsed time.
- Inner Loop Gate: `validate:tooling-iteration` passed `6 / 6` steps in `846.784 ms`; the new runner unit test contributed `59.387 ms`.

## Preservation Act

- Preservation Method: exercised the runner first with injected deterministic execution, then around a real read-only orientation using the verified current bootstrap runtime, and finally with an explicitly bounded synthetic sleeper.
- Preservation Time Or State: captured after task `012` and before using the runner as broader process-observability infrastructure.

## Provenance

- Known Source: current Site working tree, current Anchor-to-Loom carrier, verified bootstrap runtime, and host-local checkpoint/report files under `/mnt/data/task013-*`.
- Provenance Limits: runner timestamps and wall-clock measurements do not identify host scheduling policy, external review state, or why a process may stall.

## Fidelity And Loss

- Fidelity Notes: default execution has no timeout; command, argv, and cwd are passed unchanged to the child process.
- Known Losses: checkpoints retain bounded stdout/stderr tails rather than complete child output; an abrupt host kill can leave the last durable state as `running`, which is intentional diagnostic evidence rather than a completed result.

## Custody Or Storage Boundary

- Storage Or Custody State: runner and test live in Site tools; receipts are caller-selected local JSON paths and are not semantic Tiinex artifacts.
- Reuse Boundary: suitable for bounded long-running local Tooling commands where restart/diagnostic survivability is more important than hiding process duration.

## Interpretation Limits

- Does Not Prove: that host stalls are caused by Tiinex, that an external safety/review mechanism is active, or that a timeout is appropriate for any production operation.
- Not Yet Used As: Anchor acceptance or release qualification.
- Must Not Be Treated As: permission to impose silent timeouts, skip failed work, or replay a checkpoint under changed command/cwd identity.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:e-JQabtpOvRAAtVh6h7NtAw2ma8_ByxELtCyljyhdxo
