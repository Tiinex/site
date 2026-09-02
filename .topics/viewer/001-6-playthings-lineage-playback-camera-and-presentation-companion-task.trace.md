# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: tiinex.task.v1
  - Trace: [Playthings Multiverse Experiment](001-playthings-multiverse-experiment-task.trace.md)
  - Origin: [relative](001-playthings-multiverse-experiment-task.trace.md)
- Current
  - Current Schema: tiinex.task.v1
  - Created At: 2026-09-02 18:32:00
  - Summary: Turn Playthings from a static lineage world into a deterministic read-only history experience where leaves live, roots spawn, siblings split, schema presentation companions shape appearance, and the human can navigate space and time without changing Tiinex semantics.

---

# Turn Playthings into deterministic lived lineage with camera, time controls, and provisional presentation companions.

## Objective

Materialize the co-designed Playthings interaction model: begin from static empty repository realms, replay artifacts in Parent-safe chronological order, represent every current lineage leaf as a living Plaything moving through artifact stations, and preserve observation state so later visits can replay only newly observed delta. Keep all artwork, coordinates, animation, cache state, and presentation inheritance non-semantic and experiment-local.

## Done Criteria

- Entering Playthings with no valid prior observation begins from static realm geography with zero observed artifacts and replays history toward Now.
- Artifact order is topological-safe and chronological: declared Parent always precedes child; timestamp and stable identifiers only order otherwise independent material.
- A root artifact spawns one Plaything; a first child advances the existing Plaything; later siblings split the branch into additional living leaves.
- Playthings are projected from current visible lineage leaves, not from arbitrary artifact files; scrubbing history recomputes the visible leaf population.
- Every observed artifact becomes an interaction station whose presentation resolves from an experiment-local schema presentation companion.
- Missing exact presentation companion walks the registered schema Parent chain to the nearest available companion of the same Playthings presentation kind, with Root fallback only when no nearer companion exists.
- Presentation companion resolution explicitly has no semantic authority and cannot modify schema meaning, Parent, Relation, provenance, truth, or validation.
- First observation can replay full history; a valid later observation resumes from the cached prefix and only new delta plays. Invalidated observation baselines fail back to full replay rather than guessing continuity.
- Observation cache is presentation-only session state and cannot become Tiinex history or source truth.
- Playthings is entered and exited from the global Tiinex header action; ordinary Feed/Tree workspace configuration is retained unchanged.
- Playthings owns the remaining viewport while active and hides the unrelated Viewer persistence toast without changing the persistence subsystem itself.
- Camera supports WASD pan, left-button drag pan, wheel zoom, and fit-to-worlds.
- Timeline supports play, pause, Origin, Now, and scrub-to-event while remaining read-only.
- Movement between artifact events is continuously interpolated; settled Now is still and no ambient Plaything motion is introduced.
- Implementation remains decomposed across model, timeline, observation, camera, layout, presentation companions, renderer, and app-shell seams rather than creating a second Tiinex runtime or monolithic semantic owner.
- Business and Docs remain unchanged context. GitHub source-adapter repair, Viewer persistence repair, canonical schema promotion of the experimental presentation companion, and production promotion remain excluded.

## Scope

- Tiinex/site Playthings experiment only.
- Deterministic history planner and projection cursor.
- Observation-cache compatibility boundary.
- Camera and timeline controls.
- Global Playthings header action and experiment-local toast suppression.
- Provisional schema presentation companion files and Parent-chain fallback.
- Lineage-derived artifact geography and continuously animated event traversal.
- Focused/Foundation validation and Anchor-to-Anchor manual-test handoff.

## Dependencies

- Parent Task: 001-playthings-multiverse-experiment-task.trace.md.
- Prior immersive-world Task: 001-5-playthings-immersive-fullscreen-world-continuity-manual-test-task.trace.md.
- Co-design observation: a Plaything is always a lineage leaf; roots spawn, first children advance, later siblings split, while artifacts are the things the Plaything encounters and interacts with.
- Co-design observation: first viewing should replay genesis; later viewing should use an observational cache and replay only delta.
- Co-design observation: Playthings should be borderless/fullscreen beneath the Tiinex header with direct camera and time controls.
- Current carried experiment lineage originates from site/refactor 56ba75025b7a8fd44b5318d2560d2ec63eb0106f. Live refactor was independently observed at 5d472b1b1f3a926db1b4034b01961be10d7af1e6 and recipient Anchor must rebase/merge-qualify before remote integration.

# Continuity Integrity

- sha256-base64url-c14n-v2
  - Towards: self
  - Value:Snn6bb8J_SS5IT0h4Vky3iIhxrW68J7PAju8hmZXrr0
