# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-28 13:04:00
  - Authors: Loom
  - Status: completed/local
  - Summary: Correct opt-in CLI phase timing so the pre-serialization measurement boundary is truthful and final JSON serialization/emission are explicitly unmeasured.

---

# CLI Output Serialization Timing Correction

## Parent Work

- Business Task: `002-6-3-1-2 Correct CLI Output/Serialization Timing`.
- Business Parent: `002-6-3-1 Reviewed-Turn Survivability And Benign Review Friction`.
- Anchor Route: `028-anchor-to-loom-cli-output-serialization-timing-correction-reissue.trace.md`.

## Objective

Preserve the accepted early-return phase-timing seam while removing the misleading implication that a timer frozen before `JSON.stringify(...)` represents total CLI elapsed/output time.

## Done Criteria

- Default CLI output remains byte-equivalent when `--phase-timing` is absent.
- `cliPhaseTiming` no longer exposes `totalElapsedMs` from a pre-serialization timestamp.
- The replacement field names the actual boundary: `measuredElapsedBeforeFinalSerializationMs`.
- The receipt states `measurementBoundary: immediately-before-final-json-serialization`.
- Final JSON serialization and final emission are explicitly marked unmeasured rather than assigned fabricated precision.
- Existing input preparation, operation execution, and output materialization phase measurements remain available.
- Focused regression exercises both ordinary default output and a deliberately non-trivial multi-kilobyte serialized CLI result.

## Scope

- `src/tooling/portable/adapters/cli/cli.run.js`
- `src/tooling/portable/adapters/cli/cli.help.js`
- `src/tooling/portable/adapters/cli/cli.run.test.mjs`
- current-only task/preservation/Handoff artifacts
- no broad validation/profile sweep, carrier refactor, legacy cleanup, or unrelated optimization

## Dependencies

- Business task `002-6-3-1-2 Correct CLI Output/Serialization Timing`.
- Business parent `002-6-3-1 Reviewed-Turn Survivability And Benign Review Friction`.
- Exact adopted Site Workspace archive SHA-256 `2e162bde979d61e573f7d34644da2c98dbad0510d28eaf02cfca5be96c1ade92`.

## Focused Validation

- `node --check src/tooling/portable/adapters/cli/cli.run.js`: PASS.
- `node src/tooling/portable/adapters/cli/cli.run.test.mjs`: PASS.
- Focused assertions cover mismatched-turn persistence blocking, opt-in timing shape, no-flag byte-equivalence, and non-trivial final serialization/output boundary.

## Closure State

- Implementation: completed/local.
- Return Policy: immediate workspace-bearing Loom-to-Anchor child carrier after focused evidence only.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:6L8Uy5m1o_e8CCzvoUNVd36S5mBY-gujTNsUCxQVLKs