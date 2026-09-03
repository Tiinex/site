# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: tiinex.task.v1
  - Created At: 2026-09-03 10:31:00
  - Trace: [Viewer Resolved Projection And Playthings Visual Language Task](001-10-viewer-resolved-projection-and-playthings-visual-language-task.trace.md)
  - Origin:
    - [relative](001-10-viewer-resolved-projection-and-playthings-visual-language-task.trace.md)
- Current
  - Current Schema: tiinex.task.v1
  - Created At: 2026-09-03 11:24:00
  - Summary: Correct Playthings schema/place leakage and resting teleportation, then introduce physical place footprints and first deterministic traffic-worn trail/path/road navigation while improving Tech Tree readability.

---

# Playthings resting lifecycle, schema blueprints, and traffic roads

## Objective

Correct two manual-test presentation failures before adding more world grammar: schema documents whose described schema is a place type must remain blueprints rather than castles/workshops, and idle leaves must never blink out merely because resting state changed. Then establish a bounded synthetic world-physics layer where already-built structures reserve real space, leaves that cross the fast-project resting threshold migrate together to visible existing habitats, completed movement wears deterministic trails into paths/roads, and sparse A* can prefer an existing road when its discounted travel cost beats a direct detour. Increase Tech Tree type/card dimensions rather than shrinking text to fit the whole tree on one screen.

## Done Criteria

- A path ending in .schema.md is always presentation-blueprint material regardless of the schema id described by that document.
- Schema documents cannot inherit persistenceKind=structure, spawn capability, arrival choreography, Organization morphology, Workspace habitat semantics, or living-Plaything population membership from the schema they describe.
- World generation defensively refuses to build a persistent structure from a schema artifact even if upstream presentation metadata is malformed or leaks place semantics.
- Resting assignment may use only habitats whose causing artifact has already been observed at the current playhead; future structures cannot make an older Plaything disappear into an invisible building.
- Long-idle/resting state does not globally dim actor opacity; inactivity remains pose/body-language presentation.
- When multiple currently living leaves cross the >7 relative-day resting threshold before the same observed event, they are rendered as one concurrent lifecycle migration batch rather than removed immediately.
- A migrating resting leaf remains visually represented for the full bounded travel sequence; settlement occupancy increments only after migration completes.
- Pausing playback freezes the migration with the same requestAnimationFrame sequence as the current artifact event.
- A resting leaf with no already-built habitat remains visible/resting in place rather than causing a habitat to be invented.
- Later lineage continuation may wake from the already-used habitat presentation without changing semantic leaf identity.
- Organization and Workspace structures carry explicit presentation footprints substantially larger than a Plaything; placement reserves those footprints so structures/actors do not treat buildings as center-point-sized obstacles.
- Synthetic navigation uses a sparse visibility graph around already-built structure footprints and existing road endpoints rather than a visible square navigation grid.
- Movement routing uses A* with an admissible road-discount-aware heuristic; existing worn road segments reduce travel cost, so roads are preferred only when the discounted route is actually cheaper than alternatives.
- Repeated completed movement contributes deterministic traffic wear. Initial experimental thresholds are 3 traversals -> trail, 6 -> path, 12 -> road.
- Traffic wear is Playthings presentation only, reconstructed sequentially from observed history; no road/trail artifact or Tiinex relation is invented.
- Road visibility is prefix-stable: a trail/path/road becomes visible only after the artifact event whose completed traffic crosses that threshold, and future suffix traffic cannot retroactively upgrade an older playhead.
- Habitat resting routes share a stable approach/door corridor so repeated legitimate traffic can naturally produce a road outward from a settlement.
- Tech Tree keeps Implemented only enabled by default but uses larger fixed node widths and larger title/schema/status/body/action text; horizontal scrolling/panning is preferable to unreadably small typography.
- Existing role hats, blueprint event HUD, local Tech Tree progression, hotbar/Create authority, package reconciliation, Viewer performance caches, Follow/Fit, one-earth semantics, and current-time-only authoring remain unchanged.
- Static validation reports zero introduced debt; navigation/road logic is decomposed into its own module rather than expanding playthings.world.js beyond architecture discipline.

## Scope

- Tiinex/site Playthings experiment only.
- Schema-document presentation boundary correction.
- Relative-time resting lifecycle animation and visible-habitat qualification.
- Presentation-only structure footprints, sparse navigation, traffic wear, and road rendering.
- Tech Tree readability sizing.
- Focused Playthings tests plus TypeScript, architecture/browser/UI, smoke, integration, and static-regression-aware qualification.

## Dependencies

- Parent Task: [Viewer Resolved Projection And Playthings Visual Language Task](001-10-viewer-resolved-projection-and-playthings-visual-language-task.trace.md).
- Existing relative playhead, deterministic shared-earth generator, schema Tech Tree, Organization/Workspace presentation companions, role livery, and continuous event motion.
- Human manual observation that playback itself was smooth but living actors visibly blinked in/out, and screenshot evidence that a Party Organization .schema.md was incorrectly rendered as an Organization castle with resting occupancy.
- Human design direction that repeated real traffic may synthesize roads and future Playthings should prefer a road when it genuinely reduces travel cost.

## Exclusions

- canonical road/path artifacts or semantic geography.
- arbitrary decorative roads not caused by completed movement.
- qualifications or durable game progression semantics.
- Business/Docs mutation.
- claims that pathfinding/road thresholds are final game balance.
- production release/build qualification.

# Continuity Integrity

- sha256-base64url-c14n-v2
  - Towards: [Viewer Resolved Projection And Playthings Visual Language Task](001-10-viewer-resolved-projection-and-playthings-visual-language-task.trace.md)
  - Value: ndgvxFtAAzuGX7HNCWP9q6Fac7cZziHf0GBaoTO4-nw

- sha256-base64url-c14n-v2
  - Towards: self
  - Value:6q7r1YnbCMKf889Mc5G2Mo5OhDj25V3Q1TvdRo2k8o0
