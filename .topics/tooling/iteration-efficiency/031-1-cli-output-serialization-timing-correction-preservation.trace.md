# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.preservation.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/preservation/tiinex.preservation.v1.schema.md)
  - Created At: 2026-08-28 13:04:00
  - Authors: Loom
  - Summary: Preserve the exact CLI timing correction contract and focused evidence without claiming measurement of final self-serialization/emission.
  - Status: preserved/local

---

# CLI Output Serialization Timing Correction Preservation

## Preserved Material

- Material Description: bounded correction to opt-in portable CLI phase timing truthfulness.
- Material Kind: CLI timing contract and focused regression evidence.
- Source Changes: `cli.run.js`, `cli.help.js`, and `cli.run.test.mjs` only before current-only closure artifacts.
- Removed Claim: pre-final-serialization `totalElapsedMs`.
- Replacement Measurement: `measuredElapsedBeforeFinalSerializationMs`.
- Measurement Boundary: immediately before final JSON serialization.
- Explicitly Unmeasured: final JSON serialization and final emission.
- Non-Trivial Regression Surface: real `discover-tooling --phase-timing` CLI output, greater than 4 KiB serialized output.

## Preservation Act

- Preservation Method: focused source syntax check plus focused CLI regression using the real serialization/output path.
- Preservation Time Or State: exact adopted Site Workspace carried by Anchor, archive SHA-256 `2e162bde979d61e573f7d34644da2c98dbad0510d28eaf02cfca5be96c1ade92`, plus this bounded correction.

## Provenance

- Known Source: Anchor-qualified Handoff route and exact carried Site Workspace.
- Provenance Limits: this preservation records Loom-local implementation evidence and is not Anchor acceptance.

## Fidelity And Loss

- Fidelity Notes: no-flag CLI output is explicitly regression-checked as byte-equivalent to ordinary pretty JSON operation output.
- Known Losses: phase timing intentionally does not report final JSON serialization or final emission duration because the same JSON result cannot truthfully self-report timing measured only after that result has been serialized/emitted.

## Custody Or Storage Boundary

- Storage Or Custody State: current Site source/tests and this current-only preservation artifact.
- Reuse Boundary: suitable for Anchor audit of the bounded timing contract and focused return.

## Interpretation Limits

- Does Not Prove: end-to-end host wall-clock, client streaming latency, host review/queue latency, or final JSON serialization/emission duration.
- Not Yet Used As: Anchor acceptance, release qualification, or broad regression evidence.
- Must Not Be Treated As: authority to infer unmeasured output cost or to resume unrelated optimization before Anchor reviews the focused return.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:B-TOxQJWlo22t7sWVT4BrFMpbsqwRm96G6K9DeweyYQ