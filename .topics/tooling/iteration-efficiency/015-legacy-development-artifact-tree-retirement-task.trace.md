# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-28 11:55:00
  - Authors: Loom
  - Status: completed/local
  - Summary: Retire the obsolete `.topics/development` Site artifact tree after exact fixture isolation, preserving historical test semantics while reducing current discovery and carrier surface.

---

# Legacy Development Artifact Tree Retirement

## Parent Epic

- Parent: [Tooling And Workflow Iteration Efficiency](https://github.com/Tiinex/business/blob/47aad3909e18771a4c4a74231c9d88d768919dab/.topics/initiatives/002-6-tooling-workflow-iteration-efficiency-task.trace.md)
- Cross-Repository Boundary: Business owns the epic; Site owns this bounded current-tree cleanup child.

## Objective

Remove the obsolete `.topics/development` artifact tree from current Site source after proving the small historical fixture subset is independently preserved, while keeping synthetic historical path semantics and explicit legacy-compatible Tooling behavior where they remain useful.

## Done Criteria

- The physical `.topics/development` tree is absent from current Site.
- Historical bytes still required by tests remain available through the dedicated fixture surface established by task `014 Legacy Artifact Fixture Isolation`.
- The bootstrap manufacture example no longer points at the deleted development tree.
- Focused historical fixture consumers remain green except for pre-existing semantic baselines proven independent of filesystem lookup.
- Broad `.topics` inspect/audit is current-only and clean without relying on quarantine to hide physically present legacy artifacts.
- The bounded Tooling iteration gate remains green and protects the fixture boundary.
- The complete 245-command validation profile retains the same known failure-step set and introduces no legacy-path `ENOENT` failure.
- One real current-tree no-roundtrip manufacture succeeds from the pruned Site state.

## Scope

- removal of `.topics/development/**`
- `src/tooling/portable/bootstrap/tiinex.llm.bootstrap.md` example path hygiene
- `src/tooling/portable/fixtures/legacyArtifactFixtures.test.mjs`
- `tools/run-tooling-iteration-gate.mjs` fixture-boundary regression step
- current-only task/preservation artifacts
- no general docs cleanup
- no rewriting of synthetic historical path strings whose logical identity is part of tests

## Dependencies

- Site task `014 Legacy Artifact Fixture Isolation` proves exact physical fixture independence.
- Site task `014 Legacy Development Artifact Transport Impact` supplies exact current-vs-pruned transport A/B.
- Site task `014 Current Tooling Grounding Boundary And Legacy Quarantine` supplies the reversible pre-deletion grounding boundary and current-only projection baseline.
- Site task `007 Full Validation Chain Timing Profile` and task `008 Exact Schema Contract Chain Cache` supply the complete failure/timing baselines.
- Business epic `002-6 Tooling And Workflow Iteration Efficiency`.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:1JESkAGF6Jxkk7MSV9qOFIgrroAJlQ3BqT3X1eInpNQ
