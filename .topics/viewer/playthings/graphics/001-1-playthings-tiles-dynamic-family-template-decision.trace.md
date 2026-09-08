# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-09-07 23:16:00
  - Trace: [Playthings Named Sheet Companion Contract](001-playthings-named-sheet-companion-contract-decision.trace.md)
  - Origin:
    - [relative](001-playthings-named-sheet-companion-contract-decision.trace.md)
- Current
  - Current Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-09-07 23:20:00
  - Authors: Anchor; Sigma
  - Why: Lock the remaining Tiles production template so dynamic buildings, multiple floors, doors, windows, roofs, and stairs can be tested through Root without adding metadata or companion sidecars.
  - Summary: Accept an 8-column, vertically extensible, 32×32 Playthings tile-family template with one 8×8 block per style variation.
  - Status: accepted/local

---

# Playthings Tiles Dynamic Family Template

## Decision

- State: accepted
- Filename: `<schema>.playthings.tiles.png`.
- Tile cell: fixed 32×32 px.
- Width: fixed 8 columns = 256 px.
- Height: dynamic, but MUST be a positive multiple of 256 px.
- One complete tile-family/style variation occupies exactly eight consecutive rows = one 8×8 / 64-slot block.
- Additional variations append another eight-row block vertically.
- Runtime derives `familyCount = imageHeight / 256`; no Playthings JSON, Markdown sidecar, or required PNG metadata is needed to interpret the baseline layout.

## Family Slot Contract

Within each eight-row family block, columns are 1-8:

```text
family row 1  floor adjacency masks  0-7
family row 2  floor adjacency masks  8-15

family row 3  wall adjacency masks   0-7
family row 4  wall adjacency masks   8-15

family row 5  roof adjacency masks   0-7
family row 6  roof adjacency masks   8-15

family row 7
  col 1 doorway North
  col 2 doorway East
  col 3 doorway South
  col 4 doorway West
  col 5 window North
  col 6 window East
  col 7 window South
  col 8 window West

family row 8
  col 1 stairs-up North
  col 2 stairs-up East
  col 3 stairs-up South
  col 4 stairs-up West
  col 5 stairs-down North
  col 6 stairs-down East
  col 7 stairs-down South
  col 8 stairs-down West
```

Adjacency masks use the fixed cardinal bit contract `N=1, E=2, S=4, W=8`, yielding mask values 0-15 in ascending slot order.

## Structural Boundary

- Doorway slots represent the architectural opening/threshold only.
- A physical door leaf that opens, closes, breaks, locks, or disappears is a persistent object and belongs in `<schema>.playthings.props.png`.
- Windows in Tiles are structural wall openings/faces; independently stateful shutters or mechanisms may be Props.
- Decorative/interactable machines, benches, crates, lamps, and similar objects are Props rather than consuming structural tile slots.

## Multi-Floor Runtime Intent

```text
floor N
├─ floor layer
├─ wall/opening layer
├─ props layer
├─ stairs connecting N-1 / N+1
└─ roof/ceiling layer
```

- Outside a building, roof layers may remain visible.
- When the actor occupies a floor, the roof/ceiling obscuring that active floor may be hidden/faded/cut away.
- Moving through stairs changes the active floor without switching to a separate local-map artwork family.
- The same Tiles family may therefore assemble buildings of different width, height, room topology, and floor count.

## Naming And Interpretation

All production companion names retain the `.playthings.` namespace, including:

```text
<schema>.playthings.character.png
<schema>.playthings.verb.png
<schema>.playthings.blueprint.png
<schema>.playthings.portrait.png
<schema>.playthings.tiles.png
<schema>.playthings.props.png
```

File suffix + type template + dimensions are the baseline parsing contract. Metadata may be diagnostic only and must not be required to recover slot meaning.

## Consequences

- Tiles can grow vertically without changing parsing or adding filenames.
- Root can carry the first complete family at 256×256; later Root or schema-specific style variants append another 256 px of height per family.
- Dynamic Place construction, doors, windows, stairs, roofs, cutaway, and multi-floor testing have a deterministic slot grammar.
- Props remain independently scalable using their own variable-row / fixed-eight-state-column contract.

## Interpretation Limits

- This Decision locks presentation/runtime slot grammar only; it does not create Tiinex semantic meaning for walls, rooms, floors, doors, or Places.
- It does not require every schema to own Tiles; missing channels continue to resolve Parent-to-Root.
- It does not require a second world-map art set.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [Playthings Named Sheet Companion Contract](001-playthings-named-sheet-companion-contract-decision.trace.md)
  - Value: uzbMJRgk8RsQ4c9dbooOf3vZcmtoopqeWeoKcMojby4

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:ujW--eFs9TL2sA7icDKIq6fOculfZhThdDsZg4XKZWM
