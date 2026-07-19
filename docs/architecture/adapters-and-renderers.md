# Adapters and Renderers

Adapters are Tiinex source, artifact, storage, and transport boundaries.

They answer questions such as:

- where material is read from,
- where drafts are held,
- where artifacts can be written or exported,
- how provenance/source boundaries are preserved,
- and whether a source is explicit, local, draft-only, mirrored, or remote.

Examples:

- `github`
- `local`
- `static`
- `export`
- future `direct`
- future `storage`
- future `reddit`

Renderers are visual implementation choices for a Verse or surface.

Examples:

- DOM cards
- CSS columns
- SVG
- Canvas
- Leaflet
- D3
- WebGL
- a game-engine renderer

Renderers are not adapters. A visual library such as Leaflet must not live in `src/adapters/`. When Map, Atlas, Desktop, Gallery, or other visual verses become real runtime slices, shared visual libraries should live near the verse or under a renderer-owned boundary such as `src/renderers/`.

Current rule: Column is the only runtime Verse path. Map, Atlas, Desktop, Gallery, and renderer experiments remain planned until Column happy path parity is stable and tested.
