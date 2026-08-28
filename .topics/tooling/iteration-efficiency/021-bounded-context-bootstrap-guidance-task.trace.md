# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-28 09:59:43
  - Authors: Loom
  - Status: completed/local
  - Summary: Teach the portable bootstrap to prefer bounded receipts and bounded current-source search before escalating to full or legacy-inclusive projections.

---

# Bounded Context Bootstrap Guidance

## Parent Epic

- Parent: [Tooling And Workflow Iteration Efficiency](https://github.com/Tiinex/business/blob/47aad3909e18771a4c4a74231c9d88d768919dab/.topics/initiatives/002-6-tooling-workflow-iteration-efficiency-task.trace.md)

## Objective

Make current bounded-context practices part of the portable Tooling entry guidance so cold-started agents naturally consume concise qualification/search receipts before requesting full historical or body-scale projections.

## Done Criteria

- Bootstrap CLI examples use `inspect/audit --summary --phase-timing` for broad reads.
- Bootstrap explains explicit escalation to full output when detailed evidence is required.
- Bootstrap explains default `.topics/development` quarantine and explicit legacy opt-in.
- Site-checkout guidance names bounded `tooling:search` and explicit legacy-fixture opt-in.
- Bootstrap contract test prevents accidental guidance regression.
- Bounded Tooling iteration gate includes the bootstrap test.

## Scope

- `src/tooling/portable/bootstrap/tiinex.llm.bootstrap.md`
- `src/tooling/portable/bootstrap/bootstrap.test.mjs`
- bounded iteration gate registration
- guidance/orchestration only; no qualification, schema, transport, or artifact semantics changed

## Dependencies

- Site task `016 Current Tooling Grounding Boundary And Legacy Quarantine`.
- Site task `018 Bounded Inspect Audit Summary Projection`.
- Site task `020 Bounded Current Tooling Context Search`.
- Business epic `002-6 Tooling And Workflow Iteration Efficiency`.

## Closure State

- Bootstrap guidance updated/local.
- Bootstrap contract test pass.
- Bounded Tooling iteration gate pass 11/11.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:kM56Jxrxl2s_8NqDlEG9okzxX5RvHiYrTliBWav72rA