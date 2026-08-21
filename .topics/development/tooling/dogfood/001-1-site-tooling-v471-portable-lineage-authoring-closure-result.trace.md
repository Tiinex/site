# Continuity Context
- Envelope Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](tiinex.task.v1.schema.md)
  - Created At: 2026-08-21 15:23:00
  - Trace: record:.topics/development/tooling/dogfood/001-site-tooling-v471-portable-lineage-authoring-closure.trace.md
  - Origin: .topics/development/tooling/dogfood/001-site-tooling-v471-portable-lineage-authoring-closure.trace.md
  - Boundary: Portable local material; no GitHub provenance inferred.
- Current
  - Current Schema: [tiinex.task.v1](tiinex.task.v1.schema.md)
  - Created At: 2026-08-21 15:37:00
  - Summary: v471 portable lineage authoring closure result
  - Status: draft/local
  - Why: Record the source-qualified Tooling closure and concrete dogfood evidence required by the controlling v471 task.
---
# v471 portable lineage authoring closure result

## Objective

Close the Site-included portable authoring seam for exact built-in root creation, logical-id child continuation, lineage closure, and live-lineage continuation without a transport bootstrap wrapper.

## Done Criteria

PASS evidence: createPortableLocalDraft creates a tiinex.topic.v1 root with exact-site-creation-contract, no Parent, exact required shape, and no caller-supplied schema Markdown. A two-proposal Topic root plus Task child is created-clean through create-local-artifact-set; the child is non-empty, uses Trace record:dogfood-root-topic, preserves Origin .topics/development/tooling/dogfood/generated/dogfood-root-topic.trace.md, and shared resolveLineage resolves the logical-id parent edge. Live-lineage root plus Task child is processed-with-artifact-change with Trace record:live-root and exact parent Origin. Unknown/custom schema without readable material remains blocked. search-lineage against .topics remains usable and finds the controlling task. Focused portable draft/live/CLI/creation-contract/lineage tests pass. Full src test sweep: 275 PASS of 276, with only src/app/useLocalMaterialIntake.test.mjs blocked by missing installed react in the supplied source-clean workspace; npm run validate reaches the same dependency boundary. architecture:shape, browser:imports, ui:shape, metrics, storage:scan, portable:smoke, and usecase:uc001 pass.

## Scope

Changed only portable authoring owners src/tooling/portable/draft/draft.create.js, src/tooling/portable/draft/draft.set.js, src/tooling/portable/live/live.artifact.js; added focused regression src/tooling/portable/draft/portable.lineageAuthoringClosure.test.mjs; registered that regression in package.json validate. No canonical schema bytes, Site UI, Schema Builder, provider/plugin architecture, remote policy, or remote-write semantics were changed.

## Dependencies

Controlling task: .topics/development/tooling/dogfood/001-site-tooling-v471-portable-lineage-authoring-closure.trace.md. Input workspace SHA256: 6ebf5494a33602ea63599f073cacf65e7b1ffe83797f93bb33375d289dac1c5d. Dogfood receipts were produced by the included tools/tiinex-portable.mjs prepare-materialization, create-local-artifact-set, audit, resolve-lineage, and search-lineage operations. The supplied worktree has no node_modules, so dependency-bound React/typecheck/public-runtime claims are not upgraded beyond observed receipts.
# Continuity Integrity
- Draft Local Integrity
  - Method: browser-local-draft
  - Value: pending-publication-or-export
