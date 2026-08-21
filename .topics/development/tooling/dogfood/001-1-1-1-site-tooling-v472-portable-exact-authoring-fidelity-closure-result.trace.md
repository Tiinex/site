# Continuity Context
- Envelope Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](tiinex.task.v1.schema.md)
  - Created At: 2026-08-21 15:58:00
  - Trace: record:.topics/development/tooling/dogfood/001-1-1-site-tooling-v472-portable-exact-authoring-fidelity-closure.trace.md
  - Origin: .topics/development/tooling/dogfood/001-1-1-site-tooling-v472-portable-exact-authoring-fidelity-closure.trace.md
  - Boundary: Portable local material; no GitHub provenance inferred.
- Current
  - Current Schema: [tiinex.task.v1](tiinex.task.v1.schema.md)
  - Created At: 2026-08-21 16:25:00
  - Summary: v472 portable exact authoring fidelity closure result
  - Status: draft/local
  - Why: Record the source-qualified Tooling closure and exact-authoring dogfood evidence required by the controlling v472 task.
---
# v472 portable exact authoring fidelity closure result

## Objective

Close the remaining Site-included portable exact-authoring fidelity gaps while preserving the v471 root, continuation, and live-lineage behavior.

## Done Criteria

PASS evidence: create-local-draft and the create-local-draft portable operation create built-in Topic/Task artifacts from schema plus required values and Created At without injected title/summary conflicts. Exact caller values preserve repeated internal whitespace and long representable one-line content. Unrepresentable exact one-line content fails closed with draft null and exactCreateToolingApplied false. An exact renderer that returns empty or unqualified output cannot claim exact tooling applied. continue-from-record requalifies the rendered Parent against a frozen exact Parent snapshot: contradictory id parent-A plus continuationTrace record:parent-B is blocked; kind-only Parent does not acquire schema authority; coherent Parent preserves Parent Schema tiinex.topic.v1, Trace record:parent-A, and Origin .topics/p.trace.md. The v471 root Topic plus Task artifact-set and live-lineage regression remains green; unknown/custom schema without authority remains fail-closed. Actual tools/tiinex-portable.mjs values-only CLI dogfood created a clean Topic with exact Created At, repeated whitespace, and verified c14n-v2 integrity. Full src test sweep: 276 PASS of 277, 0 timeouts, with only src/app/useLocalMaterialIntake.test.mjs blocked by missing installed react in the supplied source-clean workspace. checkpoint identity, architecture shape, browser-import boundary, static/schema/workspace guards, UI shape, metrics, storage scan, portable smoke, UC001, and typecheck pass. The aggregate npm run validate reaches the known missing-react dependency boundary before its late portable regression entries; the independent full src sweep passes both the v471 and v472 regressions.

## Scope

Changed only portable exact authoring owners src/tooling/portable/draft/draft.create.js and src/tooling/portable/adapters/cli/cli.run.js; added src/tooling/portable/draft/draft.exact.js and focused regression src/tooling/portable/draft/portable.exactAuthoringFidelityClosure.test.mjs; registered the regression in package.json validate. No canonical schema bytes, Site UI/Open Schema, Schema Builder, provider/plugin architecture, remote code policy, or remote-write semantics were changed.

## Dependencies

Controlling task: .topics/development/tooling/dogfood/001-1-1-site-tooling-v472-portable-exact-authoring-fidelity-closure.trace.md. Input workspace ZIP SHA256: 3243a33fcda6cc2e65dd2fb9c8fdf3b7e1d244b55e941e0220d8d6578281d7a3. Result evidence was produced with the Site-included portable CLI and shared Site creation-contract/result qualification. Final dogfood receipts: values-only create-local-draft is created-clean with exact Created At and preserved whitespace; result audit is clean; full-root resolve-lineage reports the controlling-task to result edge resolved; search-lineage returns exactly the v472 controlling task and result for the closure query. The supplied source-clean worktree has no installed react dependency, so browser/public-runtime claims are not upgraded beyond observed source receipts.
# Continuity Integrity
- Draft Local Integrity
  - Method: browser-local-draft
  - Value: pending-publication-or-export
