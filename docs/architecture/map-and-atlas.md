# Map and Atlas

Map and Atlas are separate Verse concepts.

## Map

Map is a workspace-level Verse.

It arranges one workspace on a bounded spatial plane. The first implementation is an abstract plane over artifacts and relations, not a geographic map. It must not claim source truth, lineage completeness, validation success, or geographic meaning.

Initial constraints:

- one workspace context
- no map tiles
- no geographic assumptions
- no zoom in the first scaffold
- renderer-neutral
- source boundaries remain visible per workspace

## Atlas

Atlas is a universe-level Verse.

It arranges one or more Maps across one or more workspaces. Atlas is therefore a container/arrangement of Maps, not a renamed node graph.

Atlas remains planned until Map behavior has proven useful.

## Renderer boundary

A renderer implements a Verse. It does not define the Verse.

Possible renderers include DOM, CSS, SVG, Canvas, Leaflet, D3, WebGL, plain Markdown, image gallery layouts, or future game-engine renderers.

Leaflet is a renderer candidate for Map or Atlas. It is not a Tiinex concept by itself.
