# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-28 09:50:12
  - Authors: Loom
  - Status: completed/local
  - Summary: Establish a reversible current-Tooling grounding boundary that quarantines legacy Site development traces from broad directory reads while retaining explicit full-fidelity access.

---

# Current Tooling Grounding Boundary And Legacy Quarantine

## Parent Epic

- Parent: [Tooling And Workflow Iteration Efficiency](https://github.com/Tiinex/business/blob/47aad3909e18771a4c4a74231c9d88d768919dab/.topics/initiatives/002-6-tooling-workflow-iteration-efficiency-task.trace.md)
- Cross-Repository Boundary: Business owns the epic; this Site artifact owns only the bounded current-grounding policy and regression surface.

## Objective

Reduce accidental legacy-context projection during broad local Tooling reads without deleting history, weakening explicit recovery, changing Handoff carrier bytes, or changing generic material-loader fidelity.

## Done Criteria

- Broad directory grounding commands quarantine `.topics/development` by default.
- `--include-legacy-topics` restores the historical full directory read explicitly.
- A direct target inside `.topics/development` remains readable without an opt-in flag.
- Direct `loadNodePortableInput()` use remains full-fidelity by default.
- ZIP/carrier ingress and Handoff manufacture are outside this quarantine policy.
- The bounded Tooling iteration gate protects the quarantine behavior.
- Real Site A/B measurements preserve output-size and timing evidence.

## Implemented Boundary

- Affected broad commands: `inspect`, `audit`, `resolve-lineage`, `search-lineage`, and `prepare-task` when reading a directory target.
- Quarantined subtree: `.topics/development` only.
- Explicit legacy access: `--include-legacy-topics` or a direct target within `.topics/development`.
- Full-fidelity boundaries retained: generic Node portable input, ZIP/carrier reads, manufacture, and explicit file targets.

## Changed Files

- `src/tooling/portable/input/node.input.js`
- `src/tooling/portable/adapters/cli/cli.run.js`
- `src/tooling/portable/adapters/cli/cli.help.js`
- `src/tooling/portable/adapters/cli/cli.legacyTopicsGrounding.test.mjs`
- `tools/run-tooling-iteration-gate.mjs`
- this Task and its Preservation companion.

## Scope

- Broad portable CLI directory-grounding policy only.
- `.topics/development` only; no other Site subtree is quarantined by this task.
- No physical deletion or relocation of legacy material.
- No changes to ZIP/carrier ingress, Handoff manufacture, generic material loading, or explicit legacy reads.
- No claim about external review systems or platform classification.

## Dependencies

- Site task `002 Site Grounding Workset Baseline`.
- Site task `010 Legacy Topics Discovery Amplification`.
- Business epic `002-6 Tooling And Workflow Iteration Efficiency`.

## Closure State

- Implementation: complete/local.
- Focused fixture regression: pass.
- Current-only Site audit: clean, zero errors and zero warnings.
- Bounded iteration gate: pass.
- Physical deletion of legacy artifacts: not performed and not authorized by this task.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:EFC0uERgqlWfsH3FJFRmoGML1c2s8oVhnPXAXiWT0v8