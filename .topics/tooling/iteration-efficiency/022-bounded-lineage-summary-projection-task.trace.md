# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-28 10:05:12
  - Authors: Loom
  - Status: completed/local
  - Summary: Bound search-lineage and resolve-lineage model-facing projections without changing default full output, qualification, or lineage semantics.

---

# Bounded Lineage Summary Projection

## Parent Epic

- Parent: [Tooling And Workflow Iteration Efficiency](https://github.com/Tiinex/business/blob/47aad3909e18771a4c4a74231c9d88d768919dab/.topics/initiatives/002-6-tooling-workflow-iteration-efficiency-task.trace.md)

## Objective

Reduce generated context from broad lineage discovery by extending the explicit CLI `--summary` receipt to `search-lineage` and `resolve-lineage`, while preserving full output on demand and retaining actionable error/warning findings.

## Done Criteria

- `search-lineage --summary` omits match bodies while retaining query/scope/page/facets, counts, findings, and optional phase timing.
- `resolve-lineage --summary` omits graph/traversal node bodies while retaining traversal/graph statistics, counts, findings, and optional phase timing.
- Default output remains unchanged when `--summary` is absent.
- Exit/finding semantics remain based on the complete underlying operation result.
- Portable bootstrap/help prefer bounded lineage receipts for broad cold-start discovery.
- Focused lineage summary regression and bounded Tooling iteration gate pass.
- Real current-Site A/B records output-size reduction without claiming external review causality.

## Scope

- `src/tooling/portable/adapters/cli/cli.run.js`
- `src/tooling/portable/adapters/cli/cli.help.js`
- `src/tooling/portable/adapters/cli/cli.lineageSummaryProjection.test.mjs`
- `src/tooling/portable/bootstrap/tiinex.llm.bootstrap.md`
- `src/tooling/portable/bootstrap/bootstrap.test.mjs`
- `tools/run-tooling-iteration-gate.mjs`
- current-only task/preservation artifacts

## Dependencies

- Site task `018 Bounded Inspect Audit Summary Projection`.
- Site task `021 Bounded Context Bootstrap Guidance`.
- Business epic `002-6 Tooling And Workflow Iteration Efficiency`.

## Closure State

- Focused lineage summary regression: pass.
- Bootstrap contract regression: pass.
- Bounded Tooling iteration gate: pass 12/12 in 1,870.856 ms.
- Current `.topics` `search-lineage`: 42,151 B full to 1,343 B summary, 31.39x reduction.
- Current `.topics` `resolve-lineage`: 69,953 B full to 2,449 B summary, 28.56x reduction.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:JxDSDrnhUomINUYf87fQXxnF2pzF8Az_4NYFj_1zfZU