# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: tiinex.task.v1
  - Trace: [Playthings Multiverse Experiment](001-playthings-multiverse-experiment-task.trace.md)
  - Origin: [relative](001-playthings-multiverse-experiment-task.trace.md)
- Current
  - Current Schema: tiinex.task.v1
  - Created At: 2026-09-01 23:28:00
  - Summary: Make Playthings directly activatable from the normal Feed/Tree column workflow without changing canonical persisted Verse state.

---

# Make Playthings directly activatable from the normal Feed/Tree column workflow without changing canonical persisted Verse state.

## Objective

Correct the first manual-test usability failure: Tiinusen must be able to configure ordinary column workspaces using Feed/Tree and then enter the global read-only Playthings multiverse without knowing or editing an experimental URL.

## Done Criteria

- Expanded normal workspace columns expose an explicit Playthings control alongside Feed and Tree.
- Opening Playthings does not replace or mutate the stored workspace Verse; existing Feed/Tree/Lineage configuration remains intact underneath the experiment.
- Exit Playthings returns to the same configured column surface without a page reload for toolbar-initiated activation.
- Historical/read-only workspace review does not expose the experiment activation control.
- The legacy ?experiment=playthings entry remains compatible but is no longer required for manual testing.
- GitHub source transport remains outside this correction; local ZIP/material testing may proceed independently.
- Focused Playthings cases, architecture shape, browser import boundary, and UI shape remain green.

## Scope

- Site-only UI activation seam in TiinexApp and workspace view/chrome components.
- No Business/Docs mutation, no canonical workspace Verse enum/schema change, no source-adapter repair, and no renderer redesign.

## Dependencies

- Parent Task: 001-playthings-multiverse-experiment-task.trace.md.
- Manual finding: URL-only activation was not discoverable in the normal Viewer workflow.
- Existing v0 implementation and evidence under the sibling 001-1 lineage remain historical context.

# Continuity Integrity

- sha256-base64url-c14n-v2
  - Towards: self
  - Value:7-MQj_H4wnKMHmeX_0Yr1e-M8n_TSGcZbcYrHdvMl_o
