# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-04 18:10:00
  - Trace: [002-2-place-tiles-runtime-companion-and-resolver-slice.trace.md](002-2-place-tiles-runtime-companion-and-resolver-slice.trace.md)
  - Origin:
    - [relative](002-2-place-tiles-runtime-companion-and-resolver-slice.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-04 18:18:00
  - Authors: Anchor
  - Summary: Place tiles v1 resolver and Viewer integration checkpoint
  - Status: draft/local

---

# Place tiles v1 resolver and Viewer integration checkpoint

## Objective

Preserve the completed first runtime tiles slice after deterministic Root-sheet manufacture, PNG metadata/token parsing, artifact/schema/ancestor/Root resolution, pure qualification and bundled Root Viewer integration.

## Done Criteria

- Root runtime PNG `src/experiments/playthings/assets/runtime/root.playthings.tiles.png` SHA-256 `ae282bbfa467311c13fac00e61101a5bb2de64541b0a952030daf276fa3a313e` is 256×256 RGBA with 64 validated 32×32 cells and embedded `tiinex.playthings.tiles` iTXt mapping.
- Independent generator rerender is byte-identical (`root.playthings.tiles.validation.json` reports PASS).
- Resolver/parser `playthings.tiles.js` SHA-256 `14d2fe077291c661a0923a182c675f7f895a9094f99884b500e6182dab01d26e` implements artifact-local, exact schema, ancestor and Root fallback plus Root token fallback.
- Viewer artwork integration `playthings.artwork.jsx` SHA-256 `115fbafb57c5fbd70984a85b044824fdd76d2276bb764ee5650fb5e82ca5e71d` consumes Root tiles for terrain and Place presentation without changing semantic world state.
- All 12 current Playthings case files pass, including new tiles metadata/token/fallback cases.
- Browser import boundary PASS, architecture shape PASS and TypeScript PASS.
- Public build is NOT PASS: `build:public` stalled in `npm ci --no-audit --no-fund` in the current environment and was terminated rather than misreported.
- Custom workspace binary companion loading remains outside this checkpoint and becomes the next slice.

## Scope

Checkpoint for bundled Root runtime and pure resolver only. Artifact/schema override behavior is qualified as pure resolution logic, but loaded workspace assets are not yet bound into the Playthings artifact projection. No semantic authority is delegated to tiles or metadata.

## Dependencies

- Parent Place tiles runtime companion/resolver slice.
- `root.playthings.tiles.validation.json`.
- `playthings.tiles.case.mjs`.
- Existing presentation companion inheritance resolver.
- Current Viewer SVG artwork layer.
- Environment build log `/mnt/data/tiles-build-public.log` is execution-only evidence and not source authority.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [002-2-place-tiles-runtime-companion-and-resolver-slice.trace.md](002-2-place-tiles-runtime-companion-and-resolver-slice.trace.md)
  - Value: bOSRTPneyhmS00D7dxrWZOdb-IfcMnGr7JttmYO4-I4

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: VjX4iWxuG0kK3e649P37-7HpB-aKfsblOqb2D7j-TKg
