# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: tiinex.task.v1
  - Created At: 2026-09-01 23:28:00
  - Trace: [Playthings Toolbar Activation Manual-Test Correction](001-2-playthings-toolbar-activation-manual-test-task.trace.md)
  - Origin:
    - [relative](001-2-playthings-toolbar-activation-manual-test-task.trace.md)
- Current
  - Current Schema: tiinex.evidence.v1
  - Created At: 2026-09-01 23:36:00
  - Authors: Anchor
  - Why: Preserve the correction made after Tiinusen could not discover how to activate Playthings from the normal column Viewer.
  - Summary: Playthings toolbar activation now opens the read-only multiverse from normal Feed/Tree configuration without persisting a new canonical workspace Verse.
  - Status: ready/local

---

# Playthings Toolbar Activation — Manual-Test Correction Evidence

## Preserved Material

- Material Description: explicit Playthings button in normal discovery mode, experiment-local activation state in TiinexApp, and unchanged canonical workspace Verse normalization.
- Material Kind: Site-local source correction and focused validation receipts.

## Preservation Act

- Preservation Method: keep ordinary workspace view state authoritative; open Playthings through ephemeral app presentation state; preserve the legacy URL gate only as compatibility; return to the untouched column configuration on Exit.
- Preservation Time Or State: after the first manual activation failure reported by Tiinusen on 2026-09-01.

## Supported Claim Or Question

- Supported Claim Or Question: whether a user can configure the ordinary Feed/Tree multi-column Viewer first and then explicitly enter/exit Playthings without URL editing or a canonical Verse schema change.
- Evidence Role: supports continued manual testing of the Playthings experiment; does not promote Playthings into canonical Viewer semantics.

## Evidence Material

- Material: src/app/TiinexApp.jsx; src/schemas/workspace/workspace.views.jsx; src/schemas/workspace/workspace.chrome.views.jsx.
- Description: ModeToolbar exposes Playthings next to Feed/Tree on editable current-state columns. WorkspaceColumnSurface forwards a dedicated experiment-open action. TiinexApp owns one ephemeral playthingsOpen flag and renders the existing global PlaythingsMultiverse while preserving all workspace view state.
- Validation Receipt: playthings.model.case passed; playthings.refresh.case passed; check-architecture-shape passed; check-browser-import-boundary passed with 483 reachable production modules and zero Node edges/unresolved local imports; check-ui-shape passed.

## Preservation And Fidelity

- Fidelity Notes: the normal persisted workspaceVerse allowlists are intentionally unchanged. Toolbar activation therefore cannot silently turn experimental presentation into a canonical persisted Verse value.
- Known Losses: browser/manual confirmation of the corrected button remains with Tiinusen; ZIP-derived repository Verse materialization is a separate test frontier and GitHub transport remains explicitly out of scope.

## Custody Or Storage Boundary

- Storage Or Custody State: correction exists only in the carried Site workspace; no remote branch/commit/PR could be created because GitHub mutation is unavailable in this session.
- Reuse Boundary: recipient Anchor may rebase and merge/discard this correction together with the Playthings experiment.

## Interpretation Limits

- Does Not Prove: source-adapter correctness, ZIP repository identity recovery, production readiness, merge safety against a newer refactor head, or manual visual acceptance.
- Must Not Be Treated As: authorization to add playthings to canonical workspace Verse schemas or persisted state merely because the toolbar calls it a Verse.

# Continuity Integrity

- sha256-base64url-c14n-v2
  - Towards: [Playthings Toolbar Activation Manual-Test Correction](001-2-playthings-toolbar-activation-manual-test-task.trace.md)
  - Value: 7-MQj_H4wnKMHmeX_0Yr1e-M8n_TSGcZbcYrHdvMl_o

- sha256-base64url-c14n-v2
  - Towards: self
  - Value:EmGP8PrJRJqIVU2zmrc0vFtvLWJi0uJzFtcPTG4MO50
