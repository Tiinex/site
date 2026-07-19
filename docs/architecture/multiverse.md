# Multiverse

A Multiverse is a layout that contains multiple active Verse panes over one or more workspace or material contexts.

This is a provisional Tiinex Site architecture concept. It is not yet a maintained Tiinex/docs schema.

## Initial Runtime Target

The first practical Multiverse should be the Column Verse: multiple workspace panes side by side, inspired by the legacy app's column/workspace behavior.

## Nesting Policy

A Multiverse may contain another Multiverse when the reader expands into a new material context.

There is no arbitrary max nesting depth in the concept. The safety rule is cycle prevention, not depth prevention.

## Cycle Guard

A pane must not roundtrip back into the same active expansion context as if it were new. A cycle guard should compare context identity such as:

- workspace id
- verse id
- material scope id
- source boundary id
- parent pane path

If the target context is already active in the expansion path, the UI should disclose that it is already open rather than creating an endless loop.

## Renderer Boundary

Leaflet, SVG, Canvas, D3, WebGL, DOM cards, and CSS columns are renderers. They are not the Verse or Multiverse semantics.

## v91 Universe correction

Universe is the root entry verse that presents the first Multiverse to the reader. The first runtime Multiverse is Column Verse because the legacy app already proved column workspaces are useful. Multiverse recursion is allowed in the model, but an expansion must not roundtrip to the same active ancestor context as if it were new. No arbitrary nesting depth is imposed.

## v92 scope hygiene

The first Multiverse remains Column Verse. Atlas is planned as a universe-level arrangement of workspace Maps, but it is not shown as implemented yet. Future renderers such as Leaflet, SVG, Canvas, D3, WebGL, gallery layouts, or game-engine views remain renderer choices, not Verse semantics.
