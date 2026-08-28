# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.preservation.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/preservation/tiinex.preservation.v1.schema.md)
  - Created At: 2026-08-28 11:28:00
  - Authors: Loom
  - Summary: Preserve restart/no-replay validation execution evidence and the real baseline-prefix checkpoint observation.
  - Status: preserved/local

---

# Restartable Validation Chain Preservation

## Preserved Material

- Material Description: focused restartable-runner tests plus real execution observations against the bounded Tooling gate and the current 245-step full validation prefix.
- Material Kind: checkpoint state, command identity, elapsed timing, exit status, and resume/no-replay evidence.
- Focused Runner Test: `node tools/run-validation-chain.test.mjs` passed, covering exact `&&` chain splitting, stable SHA-256 chain identity, partial checkpointing, no-replay resume, stop-on-first-failure, and stale-checkpoint rejection.
- Fast-Gate Checkpoint Run: `validate:tooling-iteration` executed as one package-script step in `845.755 ms` internal / `0.87 s` wall, checkpointed step 1 complete, then `--resume` executed zero steps in `0.01 ms` internal / `0.02 s` wall.
- Full Validation Prefix: runner identified 245 configured commands and executed four before the known baseline failure; total internal `260.168 ms` / external `0.32 s`.
- Prefix Step 1: checkpoint identity passed in `70.878 ms`.
- Prefix Step 2: icon imports passed in `62.461 ms`.
- Prefix Step 3: architecture shape passed in `38.664 ms`.
- Prefix Step 4: browser import boundary failed in `86.501 ms` on the pre-existing `src/tooling/portable/handoff/carrierLineage.js -> node:path` edge.
- Failure Checkpoint: `lastCompletedStep: 3`, `failedStep: 4`; the known baseline failure is preserved as a stop point rather than replayed or repaired by this task.

## Preservation Act

- Preservation Method: copied machine output and checkpoint JSON fields from focused and real local executions of the restartable runner.
- Preservation Time Or State: captured after Site tasks 001-004; no full-suite completion was attempted.

## Provenance

- Known Source: current warm Site working state and exact current `package.json` scripts.
- Provenance Limits: the real full-chain observation covers only the first four commands because the existing browser-boundary baseline correctly stopped execution.

## Fidelity And Loss

- Fidelity Notes: the runner hashes the exact script name plus script text, preserves command order, and uses atomic checkpoint file replacement after each completed/failing step.
- Known Losses: child process output is retained only as a bounded failure tail in machine results; successful child stdout is intentionally not duplicated into checkpoint state.

## Custody Or Storage Boundary

- Storage Or Custody State: current-only Site continuity artifact; runtime checkpoint files are caller-selected local paths and are not repository authority.
- Reuse Boundary: suitable for long validation execution/restart across Loom turns while the exact chain remains unchanged.

## Interpretation Limits

- Does Not Prove: that the full validation suite passes, that any baseline failure is acceptable for release, or that checkpointing changes host review behavior.
- Not Yet Used As: full validation completion, Anchor acceptance, release qualification, or transport closure.
- Must Not Be Treated As: permission to skip failed commands, alter their order, parallelize unproven tests, or weaken final validation requirements.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: VvYtgSHfGUNkf9GzIxArR4D7g2Vo0nMg9G0mFFUxhLY