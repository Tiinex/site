# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-28 09:58:07
  - Authors: Loom
  - Status: completed/local
  - Summary: Add a bounded current-source search surface so Tooling discovery returns counts plus limited snippets instead of unbounded raw repository match dumps.

---

# Bounded Current Tooling Context Search

## Parent Epic

- Parent: [Tooling And Workflow Iteration Efficiency](https://github.com/Tiinex/business/blob/47aad3909e18771a4c4a74231c9d88d768919dab/.topics/initiatives/002-6-tooling-workflow-iteration-efficiency-task.trace.md)

## Objective

Bound repository/source-search generated context independently from runtime semantics, preserving explicit access to historical fixtures while making current-source discovery concise and deterministic by default.

## Done Criteria

- Literal current-source search reports total counts independently from returned snippet count.
- Returned snippets are bounded by count and per-line character length.
- Historical fixture bytes are excluded from current-default search and recoverable through explicit opt-in.
- Current artifact/source paths remain searchable.
- Search behavior is covered by a tempfile regression and the bounded Tooling iteration gate.
- The command is first-class through `npm run tooling:search -- ...`.

## Scope

- `tools/search-tooling-context.mjs`
- `tools/search-tooling-context.test.mjs`
- `package.json` script exposure
- bounded iteration gate registration
- no product/runtime semantic change
- no claim about external review classification

## Dependencies

- Site task `017 Legacy Development Artifact Physical Cleanup Closure`.
- Site task `018 Bounded Inspect Audit Summary Projection`.
- Business epic `002-6 Tooling And Workflow Iteration Efficiency`.

## Closure State

- Implementation complete/local.
- Tempfile regression pass.
- Bounded iteration gate pass 10/10.
- Real `.topics/development` reference search measured in current-default and explicit legacy-inclusive profiles.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:HTKPZOjYJuLK2XvWwxgHkCuYZOn7YxXZsqIPxKsM3pI