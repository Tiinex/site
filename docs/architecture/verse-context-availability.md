# Verse Context Availability

Verse availability is scoped by the context where the reader is working.

The app should scale to many future verses, but primary UI should show only implemented verses. Future candidates such as Map, Atlas, Gallery, game-engine rendering, timeline, or world/universe map projections belong in planning notes until a real use-case and runtime slice exist.

## Current implemented contexts

### Universe context

Implemented:

- Column

Planned, not shown as ready:

- Atlas

### Workspace context

Implemented:

- Feed
- Tree

Planned, not shown as ready:

- Map

## Map and Atlas

Map is a workspace-level spatial verse: one workspace arranged on a bounded plane.

Atlas is a universe-level verse: multiple Maps arranged together across one or more workspaces.

Atlas is therefore not a replacement name for Node Graph. It is a container/arrangement of Maps.

## Renderer boundary

A Verse owns arrangement semantics. A renderer is only a technical implementation.

Possible renderers include DOM, CSS columns, SVG, Canvas, Leaflet, D3, WebGL, plain Markdown, image gallery layouts, and future game-engine renderers.

Renderer choice must not become source truth, validation truth, or schema authority.

## UX rule

Do not show future or scaffolded verses as normal primary actions. A user should see the working path first, not a roadmap disguised as UI.
