# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-09-08 01:35:00
  - Trace: [Playthings Asset Location And Promotion Contract](../development/001-1-2-playthings-asset-location-and-promotion-contract-decision.trace.md)
  - Origin:
    - [relative](../development/001-1-2-playthings-asset-location-and-promotion-contract-decision.trace.md)
- Current
  - Current Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-09-08 01:37:00
  - Authors: Anchor; Sigma
  - Why: Lock the minimal named Playthings PNG companion family after Character, Verb, Place/portrait, Blueprint, tiles, persistent-prop, inheritance, and runtime-size experiments converged on a simple resolver contract without per-schema Playthings JSON or Markdown companions.
  - Summary: Re-issue the six named Playthings PNG companion channels under the consolidated lineage and schema-sibling production placement contract.
  - Status: accepted/local

---

# Playthings Named Sheet Companion Contract

## Decision

- State: accepted
- Subject: canonical Playthings PNG companion naming, resolution, and sheet-family boundary.
- Decision: new Playthings production uses the six named optional PNG companion channels below. The former generic `<schema>.playthings.png` form is experimental/legacy and is not the production naming target.

```text
<schema>.playthings.character.png
<schema>.playthings.verb.png
<schema>.playthings.blueprint.png
<schema>.playthings.portrait.png
<schema>.playthings.tiles.png
<schema>.playthings.props.png
```

No seventh sheet type is introduced without a concrete runtime need that cannot be represented cleanly by these six.

## Repository Placement Clarification

- Non-final source, generation inputs/results, and qualification material belong to `.topics/viewer/playthings/...` when they arise from Playthings lineage events.
- Existing Workspace assets are referenced in place instead of copied only for lineage locality.
- A companion becomes final product only when promoted beside its schema under `src/schemas/.../<schema>.playthings.<type>.png`.
- No parallel `reference/` or runtime-asset production tree is part of the canonical model.
- The former Viewer-root `002-playthings-runtime-companion-expansion-major-task.trace.md` ancestry was intentionally reduced during the 2026-09-08 repository consolidation; its useful runtime lessons are preserved by the development reduction Evidence rather than by retaining the full legacy branch.

## Shared Resolver Contract

Each channel resolves independently:

```text
exact schema companion
→ Parent schema companion
→ Parent...
→ Root companion fallback
```

A child schema may therefore override one channel while inheriting every other channel. File naming plus the type template is sufficient for baseline runtime interpretation. Required per-schema Playthings JSON manifests or Playthings-specific Markdown companions are excluded.

PNG metadata may carry optional diagnostics/version hints, but runtime correctness must not depend on metadata that duplicates the filename/type template.

## Character Sheet

- Filename: `<schema>.playthings.character.png`
- Purpose: living figure identity, locomotion, rest, and lifecycle.
- Grid: fixed 8 rows × 8 columns.
- Current qualified runtime cell: 128×192 px; full sheet 1024×1536 px.
- Row grammar:
  1. Hybrid Idle: columns 1-4 = Down/Left/Right/Up static directional stop poses; columns 5-8 = ambient idle loop.
  2. Walk Down: eight temporal frames.
  3. Walk Left: eight temporal frames.
  4. Walk Right: eight temporal frames.
  5. Walk Up: eight temporal frames.
  6. Rest: eight temporal frames.
  7. Born: eight temporal frames.
  8. Expire: eight temporal frames.
- Sigma variant 001 is the first accepted practical qualification of this grammar.

## Verb Sheet

- Filename: `<schema>.playthings.verb.png`
- Purpose: temporary action/choreography; temporary tools and effects may appear inside frames.
- Grid: fixed 1 row × 8 columns.
- Columns represent ordered temporal progression from action start through completion.
- Persistent output must transition to a Prop instance rather than remaining owned indefinitely by the Verb animation.

## Blueprint Sheet

- Filename: `<schema>.playthings.blueprint.png`
- Purpose: schema/study/reveal presentation.
- Grid: fixed 1 row × 8 columns.
- Columns represent ordered reveal/study progression from minimal/closed state to complete blueprint state.

## Portrait Sheet

- Filename: `<schema>.playthings.portrait.png`
- Purpose: compact visual identity for a place/object/concept; may be animated/stateful rather than a static duplicate asset.
- Grid: fixed 1 row × 8 columns.
- State grammar:
  1. neutral/default;
  2. active/engaged;
  3. warning/unstable;
  4. inactive/dormant;
  5-8. ambient portrait loop.
- Character portraits need not be duplicated when they can be derived satisfactorily from accepted character/turnaround authority.

## Props Sheet

- Filename: `<schema>.playthings.props.png`
- Purpose: visible persistent objects that can remain, move, be used, change state, or disappear independently.
- Height: variable number of rows.
- One row = one prop or prop variation.
- Columns: fixed eight-state order for every row:
  1. default;
  2. active/operating;
  3. alternate/open;
  4. carried/attached;
  5. damaged/degraded;
  6. repaired/recovered;
  7. materialized/placed;
  8. removed/consumed/broken.
- Runtime may infer prop count from image height divided by the type-defined row height; row index identifies the prop and column index identifies the state.

## Tiles Sheet

- Filename: `<schema>.playthings.tiles.png`
- Purpose: atomic world/building render material such as floors, walls, corners, openings, stairs, roofs, supports, trim, pipes, and place-specific structural variation.
- Tile cell remains 32×32 px unless a later explicit tile-template Decision changes it.
- Height: variable number of rows.
- One row = one complete tile-set/style variation.
- Every row uses the same fixed column count and ordered tile-role template so runtime can infer tile-set count from image dimensions and resolve placement predictably.
- The exact production column-role map is intentionally gated on the Root dynamic-building integration test; locking the six companion families does not pretend that untested tile-slot roles are already qualified.
- Tiles are the traversable/buildable world material; Place is not a separate sheet suffix.

## Semantic Separation

```text
character = who lives or moves
verb      = what temporarily happens
props     = what persists as an independent object
tiles     = what the traversable world is built from
portrait  = how something is visually identified/presented
blueprint = how something is studied/revealed
```

Temporary smoke, sparks, glow, impacts, and similar effects remain inside Verb until a concrete independent effect-runtime need proves a seventh sheet type necessary.

## Place Representation

A Place uses existing channels instead of a `.place.png` suffix:

```text
<place-schema>.playthings.portrait.png
→ visual identity / place portrait

<place-schema>.playthings.tiles.png
→ dynamic traversable construction material

<place-schema>.playthings.props.png
→ optional persistent interactable/decorative objects
```

This supports one local-world representation rather than separate world-map and local-map artwork sets. Dynamic buildings may be assembled from tile segments with floors, walls, stairs, roof layers, and active-floor cutaway/roof hiding at runtime.

## Root Integration Role

Root is the first complete resolver/integration test and may carry all six channels:

```text
root.playthings.character.png
root.playthings.verb.png
root.playthings.blueprint.png
root.playthings.portrait.png
root.playthings.tiles.png
root.playthings.props.png
```

Root provides ultimate per-channel fallback. Root portrait may represent the steampunk Root Gate; Root tiles provide generic world/building material; Root character provides generic Plaything fallback; remaining Root channels provide generic action, study/reveal, and prop fallbacks.

## Durability And Bloat Boundary

- Durable schema-facing product surface is PNG companions plus the original Tiinex artifact; do not create per-schema Playthings JSON/Markdown companions.
- Shared Playthings process/Decision artifacts may preserve production grammar, recovery rules, and accepted process revisions without multiplying artifacts per schema.
- Review WebPs, debug comparisons, transport ZIPs, rejected attempts, portraits/thumbnails derivable from accepted authority, and temporary normalization candidates are non-durable by default.
- Runtime-quality companions should target mobile-friendly quality where practical; higher-resolution authoring/review sources are production evidence, not automatically shipped companions.

## Consequences

- Named companions replace ambiguous generic `.playthings.png` production naming.
- Resolver implementation can be type-directed and Parent-traversal based without semantic inference from pixels.
- Root-first integration can test all six channels early; frequent schema types can then add exact overrides incrementally.
- Tile and prop collections can scale vertically by adding rows without new companion filenames.
- Existing experimental generic companions remain recoverable historical material and may be deterministically migrated/reduced into named production companions when accepted.

## Interpretation Limits

- Does Not Mean: every schema must own all six companions, every unused Prop state must contain artwork, or a Place needs a separate `.place.png` channel.
- Does Not Mean: the exact Tiles production column-role map is already qualified; Root dynamic-building integration is the explicit qualification gate for that remaining template detail.
- Must Not Be Used To Claim: graphics create Tiinex semantic authority. Playthings companions remain presentation/runtime material resolved from already-grounded artifact identity and Parent lineage.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [Playthings Asset Location And Promotion Contract](../development/001-1-2-playthings-asset-location-and-promotion-contract-decision.trace.md)
  - Value: ZgMmOUzfnXgFufmNZ3EXNNpGm-b5gfEAn9yigoTLq-A

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:uzbMJRgk8RsQ4c9dbooOf3vZcmtoopqeWeoKcMojby4
