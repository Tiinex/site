# Continuation Guide

## Current checkpoint

v92 is a fresh runtime ownership checkpoint. The v79 app is archived under `.old/` as ignored local behavior reference material. The active app starts from `index.html` through `src/main.js` and must remain file-local safe.

## Discipline

- Do not develop new architecture inside `.old/` or `app.js`.
- Preserve local `index.html` testing unless Q explicitly approves a different loop.
- Do not infer GitHub source authority from local, pasted, draft, or static fixture material.
- Keep audit as a domain operation in `src/audit/`, not as per-schema presentation code.
- Keep Verse human-first: a bounded arrangement/experience of artifacts, not a framework component or hidden truth engine.
- Keep UX fast: clarity should come from layout, affordance, color, position, rhythm, and consistency before explanatory prose.
- Show only implemented verses as primary UI actions; planned verses belong in context docs until a concrete implementation slice exists.

## Current scope

v92 keeps Universe/Column as the default entry, removes unimplemented verse directories, and adds context availability for future verses.

Implemented and visible:

- Universe
- Column
- Feed
- Tree

Planned but not shown as ready primary actions:

- Map as a workspace-level spatial verse
- Atlas as a universe-level arrangement of one or more Maps
- Gallery, game-engine rendering, and other future verses after concrete use-cases exist

## Next planned iteration

Current priority is Column happy-path parity. Map/Atlas, Gallery, Desktop, and renderer experiments stay planned until Column is stable and tested. Leaflet, SVG, Canvas, D3, WebGL, and game engines are renderer choices, not Verse semantics.

## Legacy behavior reference discipline

During the refactor, `.old/` is not runtime and must not be imported. It is still behavior evidence. For every rebuilt feature slice, inspect the corresponding legacy flow first, identify which behavior existed for a reason, and carry that lesson into the new owner structure without copying the monolith.
