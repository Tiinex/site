# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-28 11:20:00
  - Authors: Loom
  - Status: completed/local
  - Summary: Reuse compiled single-schema contracts for exact repeated Markdown within contract-chain compilation to remove measured repeated parse/compile cost without hiding schema changes.

---

# Exact Schema Contract Chain Cache

## Parent Epic

- Parent: [Tooling And Workflow Iteration Efficiency](https://github.com/Tiinex/business/blob/47aad3909e18771a4c4a74231c9d88d768919dab/.topics/initiatives/002-6-tooling-workflow-iteration-efficiency-task.trace.md)
- Cross-Repository Boundary: Business owns the epic; this Site artifact owns only this bounded schema-contract compilation optimization child.

## Objective

Remove the measured repeated single-schema parse/compile cost from `compilePortableSchemaContractChain()` while preserving exact-byte sensitivity, chain recomposition, direct compile API behavior, and existing validation outcomes.

## Done Criteria

- Chain compilation may reuse a compiled single-schema contract only when the supplied schema Markdown string is exactly unchanged.
- Changed schema Markdown cannot reuse stale compiled authority.
- The direct `compilePortableSchemaContract()` API remains uncached and retains its existing object-identity behavior.
- Cache growth is bounded.
- Focused schema-contract tests and an explicit exact-Markdown cache regression pass.
- The previously measured validation hotspot and complete 245-command timing baseline are rerun and show the effect without changing the set of baseline failures.

## Scope

- `src/tooling/portable/schema/contract.compile.js`
- `src/tooling/portable/schema/contract.compile.cache.test.mjs`
- current-only artifacts under `.topics/tooling/iteration-efficiency/`
- no global transition/product-context cache
- no command, validation, or carrier semantic changes

## Dependencies

- Site task `007 Full Validation Chain Timing Profile` supplies the before-optimization baseline and identifies the primary schema-heavy outlier.
- Business epic `002-6 Tooling And Workflow Iteration Efficiency`.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: niJGhMIHVhW3eEfB_79QCUbQ-F-6h_XqljM-yeWq0c0