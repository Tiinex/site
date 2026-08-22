# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-08-22 23:22:00
  - Trace: [Macro Roadmap And Refactor Exit Recovery](001-2-1-macro-roadmap-refactor-exit-recovery-result.trace.md)
  - Origin:
    - [relative](001-2-1-macro-roadmap-refactor-exit-recovery-result.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-23 01:10:00
  - Authors: Anchor
  - Why: The gitignored `.old` directory has survived as an LLM transport convenience even though it represents the separate `site/master` PoC-monolith baseline rather than current refactor workspace ownership.
  - Summary: Retire `.old` as a required in-workspace PoC baseline shape by separating master/PoC reference material from the refactor workspace and removing fixed local-path parity assumptions.
  - Status: planned/local

---

# PoC baseline reference separation

## Objective

Separate the retained `Tiinex/site` master/PoC-monolith comparison baseline from the current refactor workspace so ordinary refactor operation and validation do not depend on an embedded `.old` directory, while parity qualification can still receive exact baseline material explicitly as reference/dependency input.

## Done Criteria

- `.old` is no longer treated as required current refactor workspace material or ownership.
- The retained PoC/master baseline is named and carried as explicit comparison/reference material with source identity separate from the refactor workspace.
- Ordinary current-workspace validation remains usable when no PoC baseline carrier is present.
- Parity-specific checks that genuinely need PoC bytes consume an explicit baseline material/provider/reference seam rather than a fixed `../../.old/...` path.
- The known direct read in `src/parity/poc.m1StartupRenderParity.test.mjs` is reconciled without weakening the retained parity obligation or turning absence of baseline material into fabricated PASS.
- Handoff/package materialization may carry the PoC baseline beside the current workspace when a recipient needs it, without package co-location creating current workspace ownership, canonical source authority, or semantic Parent.
- Exact baseline branch/commit/representation truth remains explicit when parity evidence depends on exact bytes; `master`/PoC-monolith naming alone must not masquerade as an immutable representation.
- A local developer or LLM transport may still keep an optional cache/materialization for convenience, but the path/name `.old` is not a semantic contract.
- Focused parity and package roundtrip evidence demonstrates both modes: refactor-only current workspace and refactor-plus-explicit PoC baseline reference material.

## Scope

This task retires an inherited transport/layout assumption, not the retained PoC product-parity contract. It must not delete or downgrade HARD PARITY evidence merely because the monolith is moved out of the current source-tree shape.

Anchor owns decomposition and final cross-role review. Loom is the likely owner for any portable material/provider/package seam that must carry the external baseline. Kodax is the likely owner for Site/parity-test consumption changes. Axiom is only required if implementation pressure exposes a semantic/schema gap; no role becomes subordinate to another through this decomposition.

Do not broad-clean historical `.old` references in prose solely for vocabulary. Historical traces may truthfully describe `.old` when that was the transport shape at the time.

## Dependencies

- [Macro Roadmap And Refactor Exit Recovery](001-2-1-macro-roadmap-refactor-exit-recovery-result.trace.md) for the retained PoC parity/refactor-exit obligation.
- Current parity ledger and parity test family under `src/parity/**`.
- Accepted recipient-relative Handoff material-closure/package foundation for explicit adjacent workspace/material carriers when transport requires the baseline.
- Current source observation: ordinary static validation already treats `.old` as optional reference material, while `src/parity/poc.m1StartupRenderParity.test.mjs` still directly reads `.old/app.js`; this contradiction is the first bounded retirement pressure point.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:vf53zFAHxLjtwB4f5FYlVSNj6CFHuuwnPdS_xagRTDo
