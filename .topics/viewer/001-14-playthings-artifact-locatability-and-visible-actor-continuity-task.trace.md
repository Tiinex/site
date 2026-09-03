# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: tiinex.task.v1
  - Created At: 2026-09-03 13:35:00
  - Trace: [Playthings Actor Continuity Lineage Actions And Local Create Preservation Task](001-13-playthings-actor-continuity-lineage-actions-and-local-create-preservation-task.trace.md)
  - Origin:
    - [relative](001-13-playthings-actor-continuity-lineage-actions-and-local-create-preservation-task.trace.md)
- Current
  - Current Schema: tiinex.task.v1
  - Created At: 2026-09-03 13:48:00
  - Summary: Make every observed artifact locatable in Playthings, eliminate the remaining visible-projection actor remount path, and make browser-local creation results visually attributable even when the artifact becomes historical inside a continuing lineage.

---

# Playthings artifact locatability and visible actor continuity

## Objective

Correct the gap between data presence and world representation. The full Playthings model already used stable branch-aware actor identities, but the playhead-visible projection still rebuilt actors as lineage:<current-head>, allowing linear leaf advances to remount figures. Reuse the same stable lineage actor derivation in both models, add a Find Artifact surface that resolves any observed artifact to its living leaf, historical lineage position, world place, blueprint, or scene, and visibly mark browser-local material so a user-created Task is not lost in a dense world merely because its lineage later advances.

## Done Criteria

- Linear leaf continuation preserves the same deterministic actor id in both the full model and the playhead-visible model.
- A visible-projection regression test fails if a linear Parent advance changes the rendered actor identity.
- Browser-local canonical root Tasks in an unambiguously repository-bound workspace remain Playthings artifacts and living leaves.
- A local-artifact regression test proves local-transition-canonical Task material remains represented.
- Playthings exposes a Find Artifact control while tools are available.
- Empty Find query prioritizes browser-local/session artifacts; text search may match title, schema, path, summary, or repository.
- Locating an artifact resolves whether it is a current living leaf, historical point inside a continuing actor ancestry, persistent place, schema blueprint, or observed scene.
- Locating historical material selects the current living actor, pins the Tesseract, and highlights the exact requested artifact rather than silently substituting the current leaf.
- Find may advance the historical cursor only when the explicitly requested artifact has not yet been observed; the result remains paused for inspection.
- Browser-local lineage material receives a small persistent LOCAL beacon so user-created material is discoverable without relying on sprite colour recognition.
- When a newly added local artifact reaches the observed playhead, Playthings focuses/selects its representation instead of leaving the user to search the whole earth.
- Local artifact playback HUD text explicitly distinguishes local creation/continuation/branch presentation.
- Existing Lineage Verse, Artifact Detail, camera centering, valid/unlocked transitions, schema blueprint boundary, resting lifecycle, A*/roads, role hats, Tech Tree, package reconciliation, and Viewer caching remain intact.
- Focused Playthings tests, TypeScript, architecture, browser imports, UI shape, smoke, integration, and static regression validation remain green with zero introduced static debt.

## Scope

- Tiinex/site Playthings visible projection, artifact-finder presentation, local-artifact discoverability, and tests.
- Existing Viewer Lineage Verse and Detail routes only.
- Local validation and manual-test Handoff package.

## Dependencies

- Parent Task: [Playthings Actor Continuity Lineage Actions And Local Create Preservation Task](001-13-playthings-actor-continuity-lineage-actions-and-local-create-preservation-task.trace.md).
- Human manual recording and correction: the created Task record existed, but the expected world representation could not be found by visual inspection.
- Existing Playthings observation/timeline, Viewer lineage route, and browser-local canonical creation material.

## Exclusions

- new Tiinex artifact identity or semantic actor identity.
- duplicating every historical artifact as a permanent living creature.
- durable server-side Find/index state.
- qualifications or new transition authority.
- Business/Docs mutation.
- production release qualification.

# Continuity Integrity

- sha256-base64url-c14n-v2
  - Towards: [Playthings Actor Continuity Lineage Actions And Local Create Preservation Task](001-13-playthings-actor-continuity-lineage-actions-and-local-create-preservation-task.trace.md)
  - Value: M2GjknTN-Enm2E4IYzBslVhnVOPeRSwz1MJvbBnqVMo

- sha256-base64url-c14n-v2
  - Towards: self
  - Value:_5Jio3nP1eGEmrRFxNl0rS7iUpc2d8sxSZVWDlzT92E
