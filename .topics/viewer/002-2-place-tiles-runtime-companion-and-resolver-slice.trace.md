# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-04 18:08:00
  - Trace: [002-playthings-runtime-companion-expansion-major-task.trace.md](002-playthings-runtime-companion-expansion-major-task.trace.md)
  - Origin:
    - [relative](002-playthings-runtime-companion-expansion-major-task.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-04 18:10:00
  - Authors: Anchor
  - Summary: Place tiles runtime companion and resolver slice
  - Status: draft/local

---

# Place tiles runtime companion and resolver slice

## Objective

Implement the screenshot-established `.playthings.tiles.png` continuation: a deterministic Root/default 256×256 RGBA runtime sheet with 64 semantic presentation tokens, PNG-embedded token mapping, companion fallback aligned with the existing presentation inheritance resolver, pure tests, and a first Viewer Root-fallback integration.

## Done Criteria

- `root.playthings.tiles.png` is exact 256×256 RGBA, 8×8, 32×32 cells, 64 non-empty transparent-edge-safe slots and carries its own uncompressed `iTXt` metadata under `tiinex.playthings.tiles`.
- Metadata maps every token to row/column in the PNG itself; no Playthings mapping sidecar is required to interpret custom tile companions.
- Resolver precedence is artifact-local companion → exact schema companion → schema/presentation ancestor → Root fallback.
- Missing token in a custom companion may fall back to the Root token without changing semantic meaning.
- Unknown semantic concepts do not implicitly become tile tokens.
- Viewer Root integration consumes tile art for terrain and Place presentation while the existing semantic model remains unchanged.
- Independent rerender of the Root PNG is byte-identical.
- All existing Playthings pure cases plus the new tile cases pass; browser-import-boundary, architecture-shape and TypeScript pass.
- `build:public` is not marked PASS because the current environment stalls in dependency installation (`npm ci`).

## Scope

Presentation-only runtime tiles. The runtime compact sheet is separate from the 768×384 8×4 96×96 authoring template format. Custom workspace binary companion discovery/binding is outside this slice; the resolver API supports artifact/schema overrides but the Viewer currently exercises the bundled Root fallback. Tile presence never creates needs, rooms, roads, roles, Places or artifact semantics.

## Dependencies

- Parent major 002 and recovered branch checkpoint.
- Existing schema presentation resolver `src/experiments/playthings/presentation/playthings.presentation.js`.
- Runtime generator `src/experiments/playthings/tools/plaything_tiles_v1.py`.
- Root runtime PNG `src/experiments/playthings/assets/runtime/root.playthings.tiles.png`.
- Pure resolver/parser `src/experiments/playthings/presentation/playthings.tiles.js`.
- Viewer artwork integration in `src/experiments/playthings/playthings.artwork.jsx`.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [002-playthings-runtime-companion-expansion-major-task.trace.md](002-playthings-runtime-companion-expansion-major-task.trace.md)
  - Value: rBa_FL6VodICHqLiDwOaW1AGM1XYOv_xD340PreOFm0

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: bOSRTPneyhmS00D7dxrWZOdb-IfcMnGr7JttmYO4-I4
