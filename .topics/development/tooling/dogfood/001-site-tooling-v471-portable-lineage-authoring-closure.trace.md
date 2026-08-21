# Continuity Context
- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/52ecdea0a75893882ce282214d155f70e1309c2a/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: tiinex.task.v1
  - Created At: 2026-08-21 15:23:00
  - Summary: v471 Portable dogfood lineage authoring closure
---
# v471 Portable dogfood lineage authoring closure

## Objective

Make the Site-included portable tooling sufficient for the repository-mirror dogfood loop before starting the fresh Dev execution session. Correct the portable authoring seam so a built-in root artifact and a child continuation can be created through the portable artifact-set/live-lineage surfaces using the already-qualified Site creation contracts, with exact Parent identity preserved and no transport wrapper or separate bootstrap.zip dependency when full Site source is supplied.

## Done Criteria

A portable root Topic or Task whose registered creation contract is ready uses the exact Site creation renderer without inventing a Parent and validates at the exact available proof level. A two-proposal artifact set with a root Topic followed by a Task child is created-clean: the child Markdown is non-empty, its Parent is bound to the logical parent id rather than conflated with path, its Trace matches the exact Parent identity expected by shared validation, its Origin preserves the parent path, and lineage closure resolves the edge. The equivalent live-lineage continuation path must not retain the same stale transition/parent-id behavior. Built-in creation must not require the caller to separately supply schema Markdown that already exists in the full Site source/registered implementation. Unknown/custom schemas may still require explicit readable material and must remain fail-closed rather than acquiring built-in semantics. Add focused regression coverage for root creation, child continuation, logical-id/path separation, required-shape fidelity, and no fake Parent. Keep search-lineage against .topics usable as the discovery path. Return a full repository/worktree ZIP with the Tooling result represented as a Tiinex artifact continuing this task through the corrected tooling, plus actual validation evidence in that artifact or its explicit Tiinex evidence children.

## Scope

Primary owner is src/tooling/portable/**, especially draft/draft.create.js, draft/draft.set.js and live/live.artifact.js plus focused portable CLI/operation tests. The concrete current defects are: createPortableLocalDraft gates exact tooling on parentRecordSupportsExactRenderer so root built-in creation falls back unnecessarily; createPortableLocalArtifactSet plans continue-from-record but does not pass that transitionType into createPortableLocalDraft, causing the shared root contract to reject the supplied Parent and yield blank child Markdown; createdParent currently replaces the logical draft id with draft.path and builds a relative continuationTrace even though the shared exact continuation validator binds Parent Trace to record:<logical-id>; live lineage carries the same transition/parent projection risk. Do not change canonical schema bytes, Site Open Schema product owners, Schema Builder, provider/plugin architecture, remote code policy, or the pending v470→Dev correction family. Remote Schema/Companion/Transition remain declarative data only. No UI redesign. Preserve provider neutrality and existing portable source boundaries.

## Dependencies

Exact product/source baseline is Tiinex Site v470, package version 0.2.289-v470, original 1158-file full-source SHA256 67f697c748786b70e8675866b058ee7aaf8958ebefc89e46d0e4c6556a1194e1 before this dogfood task artifact was appended. Architect reproduced the portable defect directly on that baseline: prepare-materialization for [root Topic, child Task] reports ready; create-local-artifact-set then blocks because the child draft Markdown is empty and Current Schema is absent. The root Topic also falls back from an available exact creation contract solely because no Parent exists. Direct shared Site creation proves a root Topic can render and validate without a Parent, and a continue-from-record Task validates when transitionType is preserved and Parent id remains the logical id with Trace record:<id>. The previously prepared Architect→Dev v471 Open Schema correction was not sent for execution and is deferred/reissued as the next Dev checkpoint after this portable dogfood prerequisite closes. Q remains HOLD.
# Continuity Integrity
- sha256-base64url-c14n-v2
  - Towards: self
  - Value: _kKHFuzKJXWD_245-HyX54OURNnVey0q1_h1rhwOr0g
