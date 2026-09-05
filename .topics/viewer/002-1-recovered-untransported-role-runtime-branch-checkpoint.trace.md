# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-04 18:08:00
  - Trace: [002-playthings-runtime-companion-expansion-major-task.trace.md](002-playthings-runtime-companion-expansion-major-task.trace.md)
  - Origin:
    - [relative](002-playthings-runtime-companion-expansion-major-task.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-04 18:09:00
  - Authors: Anchor; Sigma
  - Summary: Recovered untransported role/runtime branch checkpoint
  - Status: draft/local

---

# Recovered untransported role/runtime branch checkpoint

## Objective

Preserve the branch status visible in Sigma-provided screenshots without pretending the branch source bytes were transported. Carry forward only the claims the screenshots visibly support and use them as continuation context for later runtime companion work.

## Done Criteria

- Exact screenshot bytes are preserved under `src/experiments/playthings/assets/reference/branch-recovery-2026-09-04/` with SHA-256 receipts.
- Recovery notes only the visible branch claims: accepted gait-v3 connected in Viewer; movement direction selects Down/Left/Right/Up; spawn uses Born; Rest is used for resting Playthings; hats follow lifecycle; no groundedRole means no hat; visualKind/schema/title must not guess a role; branch reported 12/12 Playthings pure-test PASS.
- The screenshots also visibly report that broad Site validation was blocked by two older Tooling files and public build could not be qualified because the environment stalled in `npm ci`; neither is rewritten as PASS.
- The screenshots visibly establish the next continuation point as `.playthings.tiles.png`: token resolver → artifact/schema/root fallback → pure tests → Viewer integration → Tiinex checkpoint.
- Exact branch implementation bytes remain explicitly unavailable and are not claimed to have been recovered.

## Scope

Recovery/context artifact only. It does not reconstruct or certify the missing role/runtime source changes. It exists to preserve the user-supplied branch state and to justify the immediate tiles continuation without relying on chat memory.

## Dependencies

- Parent major 002.
- `001-role-runtime-and-tiles-sitrep.png` SHA-256 `35129b7eb09fc5d7bc14976ccbbe578729dbaf918862833913c1185b73c404df`.
- `002-root-tiles-contract-and-validation.png` SHA-256 `48a718df9c853c29f034000de0c15986c109bad9b5f07980e11fa67927bec383`.
- `003-continuation-point.png` SHA-256 `8879cb3521930706a48e85b04e6afd632737f19fdca16098e25d3c865a2c2971`.
- Exact branch bytes were not delivered by a qualified Handoff package.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [002-playthings-runtime-companion-expansion-major-task.trace.md](002-playthings-runtime-companion-expansion-major-task.trace.md)
  - Value: rBa_FL6VodICHqLiDwOaW1AGM1XYOv_xD340PreOFm0

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: dZCCGbXS03kkHNmZRB5qyhjHmAi10w6o1FEbZMEl_vs
