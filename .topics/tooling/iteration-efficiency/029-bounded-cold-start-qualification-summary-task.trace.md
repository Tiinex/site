# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-28 12:41:00
  - Authors: Loom
  - Status: completed/local
  - Summary: Add an opt-in bounded cold-start qualification receipt that preserves route/task/closure state while omitting body-scale grounded context from model-facing output.

---

# Bounded Cold Start Qualification Summary

## Parent Epic

- Parent: [Tooling And Workflow Iteration Efficiency](https://github.com/Tiinex/business/blob/47aad3909e18771a4c4a74231c9d88d768919dab/.topics/initiatives/002-6-tooling-workflow-iteration-efficiency-task.trace.md)

## Objective

Reduce generated cold-start qualification projection volume for status/route/continuation triage without changing qualification execution, exit status, default full output, or required-context authority.

## Done Criteria

- Extend opt-in `--summary` to `qualify-cold-start` while leaving full output unchanged by default.
- Preserve preferred/recovery qualification state, metrics, selected route summary, handoff purpose/endpoints, continuation transfers, required-context identity metadata, completion expectation, return-package metadata, one-shot evidence summary, finding summary, and actionable warnings/errors.
- Omit `requiredContext.content` bodies and large role/capability/orientation internals from the bounded projection.
- Cap projected transfers, required-context entries, and actionable findings and report omitted counts.
- State explicitly that omitted required-context bodies must be read through full qualification or explicit qualified material before relying on their text for substantive reasoning.
- Preserve CLI phase timing and exit behavior.
- Add focused default-versus-summary regression and bounded Tooling fast-gate coverage.

## Scope

- `src/tooling/portable/adapters/cli/cli.run.js`
- `src/tooling/portable/adapters/cli/cli.help.js`
- `src/tooling/portable/adapters/cli/cli.coldStartSummaryProjection.test.mjs`
- bounded Tooling iteration gate
- current-only task/preservation artifacts
- no change to cold-start qualification algorithm or Handoff semantics

## Dependencies

- Site task `018 Bounded Inspect Audit Summary Projection`.
- Site task `022 Bounded Lineage Summary Projection`.
- Site task `023 Current Cold Start Context Budget Baseline`.
- Business epic `002-6 Tooling And Workflow Iteration Efficiency`.

## Closure State

- Focused cold-start summary regression: PASS.
- Bounded Tooling iteration gate: PASS, 15/15 steps, 2,142.453 ms.
- Real current-shape one-shot qualification: full 50,714 bytes versus bounded 15,707 bytes, about 3.23x smaller; both `preferred-pass`.
- Real current summary phase timing: 1,037.888 ms internal total; operation execution 1,023.750 ms; wall about 1.24 s.
- Previously captured larger incoming-parent qualification projected through the same summary function: 99,027 bytes versus 21,172 bytes, about 4.68x smaller, preserving six transfers and four required-context identities while omitting four required-context content bodies.
- Large synthetic regression proves 20-entry caps, omitted counts, content-body removal, actionable-finding cap, and more than 10x reduction for body-dominated input.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:VAxuRr2cCA6N5-Jg5SJE2mF3-Vo5hsAD51877DPqBcQ
