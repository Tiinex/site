# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-03 15:56:34
  - Trace: [004-anchor-viewer-artifact-action-parity-recovery-active-major-task.trace.md](004-anchor-viewer-artifact-action-parity-recovery-active-major-task.trace.md)
  - Origin:
    - [relative](004-anchor-viewer-artifact-action-parity-recovery-active-major-task.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-03 19:25:01
  - Authors: Anchor
  - Why: Tiinex needs a human graph-orientation surface that can scale from one scoped lineage to multiple carried workspaces without turning spatial layout into authority or importing Playthings-specific semantics.
  - Summary: General Viewer Node Graph Verse and Multi-Verse projection over authoritative Tiinex artifact relations, with derived layout and explicit LOD/performance boundaries.
  - Status: ready/local

---

# Node Graph Verse Projection

## Objective

Implement a general Tiinex Node Graph Verse projection for human orientation over the authoritative artifact graph, with one scoped Verse for a bounded graph and a Multi-Verse that can project several carried workspaces/repositories together without merging their authority. Treat layout, clustering, coordinates, level-of-detail, and visual style as derived projection state; artifact identity and semantic relations remain authoritative Tiinex material.

## Done Criteria

- One underlying graph projection model can drive both a conventional node graph and later spatial/galaxy-like presentations without moving authority into coordinates or layout state.
- A normal Node Graph Verse can scope to one workspace, current frontier, selected artifact/lineage, or other explicit bounded graph selection and render artifacts as nodes with declared semantic edges, with Parent lineage supported as the first mandatory relation.
- Multi-Verse can project multiple carried workspaces/repositories simultaneously while preserving visible workspace/source boundaries and exact cross-workspace semantic edges; co-location never implies ancestry or authority.
- Node selection opens or focuses the canonical artifact representation rather than creating a second artifact model.
- Current, historical/reduced, unresolved, and source/local states remain distinguishable when the underlying shared model supplies those states; presentation must not fabricate status.
- Reduced history is designed as an expandable projection boundary: when shared Reduction expansion Tooling becomes qualified, the graph can request/display historical leaf-to-cut material without making that material current again.
- Large graphs use explicit level-of-detail behavior rather than attempting to render every node interactively at every zoom. Degree, community, currentness, focus neighborhood, or equivalent derived heuristics may drive bounded preview sets but must expose truncation/LOD state.
- Expensive layout preparation is deterministic for the same graph input and is kept off the hot render path; client-side continuous full-graph force simulation is not required for ordinary interaction.
- First paint remains lightweight; richer search/traversal/detail interaction may lazy-load or hydrate after explicit entry.
- Kodax performs bounded library/projection discovery and may choose 2D pan/zoom, canvas/SVG/WebGL, Leaflet-like spatial primitives, or another implementation based on measured fit; no library choice becomes semantic authority.
- Generic `playthings` improvements may be selectively ported only when independently useful to the general Viewer and semantic equivalence is demonstrated. Playthings world/Verse grammar, artwork, road/living-object semantics, progression, or domain-specific UX must not leak into this feature.
- At minimum, inspect the generic value of worker/off-thread preparation, deferred persistence, record hydration/cache behavior, package reconciliation, and explicit material-intake scope from `playthings`; port only what measurably benefits the general Viewer.
- Focused graph-model, projection, LOD, interaction, and regression tests are added, and existing Viewer/Foundation/type/UI-shape gates remain green.
- Return Evidence states measured limits and what remains intentionally deferred, especially 3D/spatial presentation and very-large-graph strategy.

## Scope

- General Viewer Node Graph Verse and Multi-Verse projection/model/application integration.
- Artifact-node and semantic-edge projection, initial Parent lineage, focus/open interaction, LOD/truncation, deterministic layout preparation, and performance boundaries.
- Bounded discovery of reusable generic implementation ideas from current `playthings` and Memstead's published experience.

Out of scope: Playthings product/world semantics; merging the `playthings` branch; canonical schema/Tooling semantic changes; making coordinates authoritative; remote writes; final product acceptance; implementing reduction semantics privately in Viewer.

## Dependencies

- [Viewer Artifact And Action Parity](004-anchor-viewer-artifact-action-parity-recovery-active-major-task.trace.md).
- Canonical [Kodax Role](business::.topics/roles/001-6-kodax-role.trace.md).
- Shared Site workspace artifact/lineage/read-model capabilities already carried in this package.
- Anchor/Loom/Axiom reduction-safety work for future reduced-history expansion; the initial current-graph projection must not block on that future capability.
- Memstead issue #41 and its maintainer feedback as external design evidence, not Tiinex authority.
- `playthings` branch only as an optimization/reference branch under the canonical Kodax Role boundary; no branch-wide merge or Verse-semantic import is authorized.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [004-anchor-viewer-artifact-action-parity-recovery-active-major-task.trace.md](004-anchor-viewer-artifact-action-parity-recovery-active-major-task.trace.md)
  - Value: mKgoDujAWZFxqsNvAln71-LZ2gmTd2urZoTDKEBavys

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: TB7XatMhHU7i4ludN7hYa3ogFgK-DDmsjCeszwxt-J4