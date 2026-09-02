# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: tiinex.task.v1
  - Trace: [Playthings Multiverse Experiment](001-playthings-multiverse-experiment-task.trace.md)
  - Origin: [relative](001-playthings-multiverse-experiment-task.trace.md)
- Current
  - Current Schema: tiinex.task.v1
  - Created At: 2026-09-01 21:11:00
  - Summary: Implement the first Playthings read-only multiverse and refresh-delta playback slice in Site.

---

# Implement the first Playthings read-only multiverse and refresh-delta playback slice in Site.

## Objective

Materialize the experiment as a deterministic read projection over loaded workspace records, reuse normal source refresh, and animate only newly observed resolved lineage/portal delta until Now.

## Done Criteria

- ?experiment=playthings enters an isolated read-only surface while ordinary Tiinex behavior remains the default.
- The model groups repository-bound records into Verses, consumes the existing loaded-lineage resolver, and projects only resolved Parent edges in v0.
- Linear new Parent continuity advances a lineage inhabitant; a newly observed sibling branch is classified as a split; a newly resolved cross-repository Parent is classified as a portal.
- Existing visible state remains frozen while refresh resolves; no-delta refresh produces no playback; reduced-motion users do not receive staged motion.
- Artifact glyphs can open the existing read-only Record Detail surface without giving Playthings mutation authority.
- Focused model and source-refresh tests, architecture shape, browser import boundary, TypeScript check, schema binding/runtime projection/workspace validation, and foundation acceptance pass, except any explicitly recorded pre-existing repository validation debt.

## Scope

- New modules under src/experiments/playthings plus a minimal TiinexApp opt-in integration.
- React/SVG/CSS original pixel projection for this semantic proof slice; no new production dependency or lockfile change.
- Source refresh orchestration may call the existing addGitHubSource path but must not implement a parallel transport.
- No persisted workspace Verse enum/schema change in v0.

## Dependencies

- Parent Task: 001-playthings-multiverse-experiment-task.trace.md.
- Existing Site modules: src/lineage/lineage.resolve.js and existing GitHub source materialization in src/app/TiinexApp.jsx.
- Exact implementation base: Tiinex/site refactor commit 56ba75025b7a8fd44b5318d2560d2ec63eb0106f.

# Continuity Integrity

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: wpc5o5MZmlnlHp5xY-tUnfzUJjFy9oPOFXqTM_Wfk9s