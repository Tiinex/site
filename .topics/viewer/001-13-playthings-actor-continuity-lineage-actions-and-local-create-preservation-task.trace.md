# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: tiinex.task.v1
  - Created At: 2026-09-03 11:14:00
  - Trace: [Playthings Original Pixel Art And World Readability Task](001-12-playthings-original-pixel-art-and-world-readability-task.trace.md)
  - Origin:
    - [relative](001-12-playthings-original-pixel-art-and-world-readability-task.trace.md)
- Current
  - Current Schema: tiinex.task.v1
  - Created At: 2026-09-03 13:35:00
  - Summary: Eliminate Plaything remount/flicker across lineage advances, make figure interaction lineage-first instead of detail-only, preserve browser-local created artifacts across Handoff reconciliation, and tighten parent-safe chronological playback ordering.

---

# Playthings actor continuity, lineage actions, and local create preservation

## Objective

Make living figures behave as persistent lineage actors rather than disposable leaf DOM nodes: linear continuation retains one actor identity, real branch siblings create new identities, temporary traveller/resting representations do not unmount the underlying actor, and click interaction selects/pins history before offering Lineage Verse, Artifact Detail, camera centering, or valid unlocked transitions. Preserve user-created browser-local artifacts when a later recipient-v2 Handoff package reconciles the same workspace, and make history ordering choose the earliest currently-ready artifact after every parent release rather than consuming stale ready batches.

## Done Criteria

- Linear Parent continuation preserves one deterministic Plaything actor id across leaf changes.
- At a real branch, the first chronological branch preserves the existing actor identity and sibling branches receive distinct identities.
- Active-traveller and resting-migration presentation suppresses duplicate pixels without unmounting the underlying actor component.
- Click on a living Plaything selects it and pins its Tesseract/history rather than immediately opening Detail.
- Selected figures offer Lineage Verse as the primary deep-navigation action, plus Artifact Detail, Center Camera, and only Viewer-qualified/unlocked transitions.
- Persistent structures are also selectable and expose lineage/detail/camera actions instead of forcing immediate Detail.
- Hover remains a temporary history affordance; selection is persistent until changed, closed, or Escape.
- Lineage Verse reuses the existing Viewer lineage focus path and exits global Playthings rather than implementing a parallel lineage browser.
- Recipient-v2 Handoff reconciliation preserves explicit browser-user local records such as local-transition-canonical while refreshing carrier-owned material.
- A package re-drop cannot silently erase a local canonical artifact created after the package snapshot.
- Topological playback selects one earliest currently-ready artifact at a time so newly released children immediately compete chronologically while Parent-before-child remains absolute.
- Existing schema-blueprint boundary, resting migration, A*/roads, role hats, Tech Tree, Viewer performance caching, package-global DnD, and one-earth semantics remain intact.
- Focused Playthings and Handoff reconciliation tests, TypeScript, architecture, browser-import, UI-shape, smoke, integration, and static regression checks remain green with zero introduced static debt.

## Scope

- Tiinex/site Playthings interaction/render continuity and timeline projection.
- Recipient-v2 local-record reconciliation guard.
- Existing Viewer lineage/detail/navigation paths only.
- Local validation and manual-test Handoff package.

## Dependencies

- Parent Task: [Playthings Original Pixel Art And World Readability Task](001-12-playthings-original-pixel-art-and-world-readability-task.trace.md).
- Existing Viewer Lineage Verse and canonical local creation paths.
- Human manual observation that living figures still visibly disappeared/reappeared and that Detail-only interaction made lineage exploration difficult.
- Human report that a locally created artifact disappeared after the package-backed session changed.

## Exclusions

- new Tiinex semantic actor identity.
- durable Playthings selection/history state.
- new qualifications or transition authority.
- Business/Docs mutation.
- production release qualification.

# Continuity Integrity

- sha256-base64url-c14n-v2
  - Towards: [Playthings Original Pixel Art And World Readability Task](001-12-playthings-original-pixel-art-and-world-readability-task.trace.md)
  - Value: QEfFvZtyTZ0vxa4NCBv6ZXMWauEmTiDOmWMc1bpybDs

- sha256-base64url-c14n-v2
  - Towards: self
  - Value:M2GjknTN-Enm2E4IYzBslVhnVOPeRSwz1MJvbBnqVMo
