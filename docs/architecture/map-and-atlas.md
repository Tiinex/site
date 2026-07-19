# Map and Atlas

Map and Atlas are planned Verse concepts. They are intentionally not runtime-visible while Column Verse is still being restored to the old happy path.

## Map

Map is planned as a workspace-level Verse.

It should eventually arrange one workspace on a bounded spatial plane. The first future implementation should be an abstract plane over artifacts and relations, not a geographic map. It must not claim source truth, lineage completeness, validation success, or geographic meaning.

Initial future constraints:

- one workspace context,
- no map tiles unless a concrete map use-case exists,
- no geographic assumptions,
- no zoom until an actual zoom/pan use-case is validated,
- renderer-neutral,
- source boundaries remain visible per workspace.

## Atlas

Atlas is planned as a universe-level Verse.

It should arrange one or more Maps across one or more workspaces. Atlas is therefore a container/arrangement of Maps, not a renamed node graph.

Atlas remains planned until Column is stable and Map behavior has proven useful.

## Renderer boundary

A renderer implements a Verse. It does not define the Verse.

Possible future renderers include DOM, CSS, SVG, Canvas, Leaflet, D3, WebGL, plain Markdown, image gallery layouts, or future game-engine renderers.

Leaflet is a renderer candidate for future Map or Atlas work. It is not a Tiinex concept by itself and should not be introduced as runtime dependency before the Column happy path is stable.
