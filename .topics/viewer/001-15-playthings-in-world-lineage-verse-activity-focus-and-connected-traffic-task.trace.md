# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: tiinex.task.v1
  - Created At: 2026-09-03 13:48:00
  - Trace: [Playthings Artifact Locatability And Visible Actor Continuity Task](001-14-playthings-artifact-locatability-and-visible-actor-continuity-task.trace.md)
  - Origin:
    - [relative](001-14-playthings-artifact-locatability-and-visible-actor-continuity-task.trace.md)
- Current
  - Current Schema: tiinex.task.v1
  - Created At: 2026-09-03 14:45:00
  - Summary: Keep Playthings spatial context intact while inspecting lineage, strengthen active-event/local-create focus, add activity-scoped camera fitting, and make repeated routed traffic accumulate as connected world corridors rather than isolated road sticks.

---

# Playthings in-world Lineage Verse, activity focus, and connected traffic

## Objective

Turn the selected-Plaything lineage action into an in-world Playthings dialog rather than navigating into the Viewer multi-column Verse, while reusing the existing loaded Tiinex Parent-lineage resolver. Improve playback readability with zoom-compensated ACTIVE/NEW LOCAL beacons and Fit Activity, preserve exact camera/playhead state when the lineage dialog closes, and refine synthetic traffic wear so repeated A* journeys accumulate along sampled connected corridors that can become preferred paths/roads without becoming Tiinex semantics.

## Done Criteria

- Selecting Lineage Verse from a Plaything/place opens an HTML overlay inside Playthings and does not leave the shared earth.
- The overlay obtains its lineage from the existing loaded Tiinex lineage projection, not from a new inferred Playthings graph.
- The Lineage Verse shows only the selected loaded Parent chain, preserving root/terminal/missing/mismatch status rather than guessing hidden ancestry.
- Clicking lineage nodes changes the dialog inspector; Locate in world closes the dialog and selects/centers the exact corresponding Playthings representation when available.
- Artifact Detail remains a secondary explicit action and Open full Viewer lineage remains an escape hatch for the existing Viewer lineage surface.
- Closing the Lineage Verse leaves the current camera, selection, and historical playhead unchanged.
- Active playback receives a stronger zoom-compensated beacon that remains readable across camera zoom levels.
- Browser-local active events are labelled NEW LOCAL and automatically Fit Activity once when their event begins so local creation is visibly attributable.
- Fit Activity frames the active event route/resting migration or current selection neighbourhood without replacing Fit World.
- Repeated completed routes contribute traffic along sampled approximately 24px corridor segments instead of only full A* edge endpoints.
- Trail/path/road thresholds remain 3/6/12 completed traversals; existing road travel-cost preference remains presentation-only.
- Placement keeps deterministic prefix stability while strengthening soft proximity around an actual lineage place; no undeclared containment is introduced.
- Existing actor continuity, resting migration, schema blueprint boundary, role hats, Tech Tree, Find/LOCAL attribution, package reconciliation, Viewer performance caches, and canonical Create/transition authority remain intact.
- Focused Playthings cases, TypeScript, architecture, browser imports, UI shape, smoke, integration, and static regression validation remain green with zero introduced static debt.

## Scope

- Tiinex/site Playthings interaction/readability and synthetic world-traffic presentation only.
- New Playthings Lineage Verse overlay backed by the existing loaded Tiinex lineage resolver.
- Activity camera framing, event beacon, deterministic corridor traffic accumulation, and focused tests.
- Site-only Handoff package for manual evaluation.

## Dependencies

- Parent Task: [Playthings Artifact Locatability And Visible Actor Continuity Task](001-14-playthings-artifact-locatability-and-visible-actor-continuity-task.trace.md).
- Human feedback that Lineage Verse should be a dialog showing only that lineage rather than leaving Playthings for the multi-column Viewer.
- Existing workspace.lineageView/lineage.resolve/traverse semantics, Playthings A* routing, observation timeline, artifact locator, and camera implementation.

## Exclusions

- a second semantic lineage resolver or invented Parent edges.
- persistent semantic road artifacts or navigation truth.
- replacement of the full Viewer lineage/audit workflow.
- new artifact kinds, qualifications, or transition authority.
- Business/Docs mutation.
- production release qualification.

# Continuity Integrity

- sha256-base64url-c14n-v2
  - Towards: [Playthings Artifact Locatability And Visible Actor Continuity Task](001-14-playthings-artifact-locatability-and-visible-actor-continuity-task.trace.md)
  - Value: _5Jio3nP1eGEmrRFxNl0rS7iUpc2d8sxSZVWDlzT92E

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: xkZNPDxecN1qWjsThXtGzlwSsJuY7LRoQ6ke8hhQyjc
