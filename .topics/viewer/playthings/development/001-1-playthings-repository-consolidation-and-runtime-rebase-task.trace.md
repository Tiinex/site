# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.topic.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/topic/tiinex.topic.v1.schema.md)
  - Created At: 2026-09-08 01:31:00
  - Trace: [Playthings Development Root](001-playthings-development-root-topic.trace.md)
  - Origin:
    - [relative](001-playthings-development-root-topic.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-08 01:32:00
  - Authors: Anchor; Sigma
  - Why: Rebase Playthings development onto a smaller durable lineage, remove the parallel reference/staging tree, place non-final visual assets beside the lineage events that created them, and prepare a clean all-workspace continuation before runtime refactoring.
  - Summary: Playthings repository consolidation and runtime-rebase checkpoint.
  - Status: active/local

---

# Playthings Repository Consolidation And Runtime Rebase

## Objective

Turn the current source-complete Playthings work into a clean scalable repository shape before changing runtime behavior.

## Scope

- Site Playthings lineage, graphics-source placement, production companion destination, and Pilot production process.
- Site source cleanup only; Business and Docs remain carried as independent Workspaces in the final Handoff package.
- Preserve the current `src/experiments/playthings` runtime baseline unchanged during this cleanup.
- Establish the next runtime architecture frontier, but do not implement the renderer/world rebase until Anchor and Sigma agree on the experience model.

## Dependencies

- [Root Named Companion Source Suite State](../graphics/root/001-5-root-named-companion-source-suite-state-decision.trace.md).
- Existing accepted Sigma/Root source assets and named sheet contract under `.topics/viewer/playthings/graphics/`.
- Current post-revert `src/experiments/playthings` source as behavioral baseline.
- Tiinex portable Handoff tooling and complete Site/Business/Docs Workspace snapshots.

## Done Criteria

- Repository-root `reference/` directory is absent.
- An already existing in-workspace asset is referenced in place rather than duplicated merely to satisfy lineage.
- A new non-final asset created/returned by a Playthings lineage event is stored beside the controlling lineage artifact with a shared lineage prefix.
- Final accepted runtime product is stored only as a named `.playthings.` companion beside the schema it belongs to under `src/schemas/`.
- Playthings-specific history no longer crowds `.topics/viewer/`; active development lineage is under `.topics/viewer/playthings/development/`.
- The removed legacy Viewer lineage is reduced into compact retained lessons and an exact reduction-manifest hash.
- Pilot UX remains the proven boot-time references + generation text + predeclared return text flow; only the return phrase and hard pre-tool gate are revised.
- A local asset-placement helper makes the placement rules easy to follow without staging copies.
- A clean Site full-source ZIP and a qualified Anchor-to-Anchor Handoff package carrying complete Site, Business, and Docs Workspaces are produced.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [Playthings Development Root](001-playthings-development-root-topic.trace.md)
  - Value: Gc6ojVwC7Tc3Fh78_-agFOMMk1FDVCg2WWln-xO6JYk

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:4fC8eO2oQn1LHNFj-6CNkkeVBvB5jRd9zdMjFBRSpxQ
