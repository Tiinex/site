# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-09-08 01:19:00
  - Trace: [Root Named Companion Source Suite State](../graphics/root/001-5-root-named-companion-source-suite-state-decision.trace.md)
  - Origin:
    - [relative](../graphics/root/001-5-root-named-companion-source-suite-state-decision.trace.md)
- Current
  - Current Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-09-08 01:36:00
  - Authors: Anchor; Sigma
  - Why: Preserve a refined runtime frontier without prematurely coding against the old assumption that the lineage graph itself must be the physical world.
  - Summary: Rebase Playthings runtime around story projection, independent companion resolution, world assembly, and renderer integration while retaining useful current interaction behavior.
  - Status: discussion-ready/local

---

# Playthings Runtime Rebase Plan

The repository placement contract is [Playthings Asset Location And Promotion Contract](001-1-2-playthings-asset-location-and-promotion-contract-decision.trace.md).

## Retain From Current Experience

Keep these useful behaviors unless a concrete replacement proves better:

```text
timeline / history playback
living actor continuity
spawn / split / observed-event choreography
camera and focus behavior
artifact finding / lineage inspection
location and action interaction
```

## Change The Architectural Center

Do not require the lineage graph itself to be the world geometry.

Proposed separation:

```text
Tiinex artifacts + history
        ↓
story projection
what is happening now?
        ↓
Playthings companion resolver
exact schema → Parent → Root, independently per channel
        ↓
world assembler
Places + Tiles + Props + floors + doors + stairs + roofs
        ↓
renderer / playback
Character + Verb + Portrait + Blueprint
```

This lets every schema participate in the story without forcing every schema to become a permanent world node.

## First Integration Slice

The first new-runtime scene should be intentionally small and observable:

```text
Root Gate courtyard
→ actor arrives
→ walk to workshop
→ pass a doorway / door prop
→ enter building
→ roof over active floor fades/cuts away
→ stairs connect to floor 2
→ Blueprint is discovered/studied
→ Verb executes
→ persistent Prop remains
```

This one slice exercises the six companion channels, resolver fallback, world assembly, multi-floor behavior, and the transition between temporary Verb effects and persistent Props.

## Tiles Compiler Boundary

The current Root Tiles source is accepted visual source, but not yet final mask-table product. Runtime work should begin with a deterministic tile compiler/qualifier rather than trusting generated cells to encode abstract bitmask order directly.

## Discussion Gate

No renderer/world-assembler refactor is part of the repository cleanup checkpoint. Before implementation, Anchor and Sigma should agree on:

- how much of the current SVG-world visual language remains;
- whether the first slice replaces or overlays the current world;
- camera scale / screen-space relationship between character, 32×32 Tiles, Props, and Portrait/Blueprint surfaces;
- how story events choose a Place and instantiate persistent world state.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [Root Named Companion Source Suite State](../graphics/root/001-5-root-named-companion-source-suite-state-decision.trace.md)
  - Value: oQgqm4NOYKh3ImyQVl29bNVtUxqqeYBdilDpFJjjPvI

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:KYK_qDJTuHTEq4Gaq0U7scNLfQtQdwqqMqJvTnwEHYA
