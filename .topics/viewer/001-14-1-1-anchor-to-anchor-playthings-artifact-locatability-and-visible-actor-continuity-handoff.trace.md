# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: tiinex.evidence.v1
  - Created At: 2026-09-03 13:49:00
  - Trace: [Playthings Artifact Locatability Evidence](001-14-1-anchor-playthings-artifact-locatability-and-visible-actor-continuity-evidence.trace.md)
  - Origin:
    - [relative](001-14-1-anchor-playthings-artifact-locatability-and-visible-actor-continuity-evidence.trace.md)
- Current
  - Current Schema: tiinex.handoff.v1
  - Created At: 2026-09-03 13:50:00
  - Summary: Transfer the artifact-locator, local-create attribution, and visible actor-identity continuity checkpoint for manual Playthings evaluation.
  - Status: ready/local

---

# Playthings Artifact Locatability — Anchor To Anchor Follow-Up

## Handoff Parties

- Purpose: verify that observed/user-created artifacts are now easy to locate without violating the living-leaf model, and that linear leaf playback no longer remounts visible actors
- From: Anchor
- From Kind: role
- From Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
- To: Anchor
- To Kind: role
- To Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)

## Transfers

- visible-actor-continuity
  - Transfer Kind: work-and-responsibility
  - Description: the playhead-visible projection now uses the same stable branch-aware lineage actor ids as the full model, removing the remaining current-head actor-id remount path
  - Boundary: actor ids remain presentation-only

- artifact-locator
  - Transfer Kind: work-and-responsibility
  - Description: Find Artifact searches observed material, prioritizes local/session artifacts, and resolves the selected artifact to a living leaf, historical actor ancestry, world place, blueprint, or observed scene
  - Boundary: Find resolves existing projection material only and invents no lineage or semantics

- local-create-attribution
  - Transfer Kind: work-and-responsibility
  - Description: browser-local lineage material receives a persistent LOCAL beacon; newly observed local artifacts receive explicit playback HUD language and are focused once their event is observed
  - Boundary: local presentation reflects record source mode only and is not qualification/provenance authority

- exact-history-selection
  - Transfer Kind: work-and-responsibility
  - Description: locating a historical artifact pins the current actor Tesseract while highlighting the exact requested ancestor as THIS ARTIFACT; Lineage Verse and Detail open that exact artifact
  - Boundary: historical artifacts remain history, not duplicate living Playthings

## Required Context

- prior-task
  - Material: actor continuity/lineage actions Task
  - Material Reference: [Prior Task](001-13-playthings-actor-continuity-lineage-actions-and-local-create-preservation-task.trace.md)
  - Purpose: previous stable-actor and interaction baseline
  - Availability: available

- current-task
  - Material: artifact locatability Task
  - Material Reference: [Current Task](001-14-playthings-artifact-locatability-and-visible-actor-continuity-task.trace.md)
  - Purpose: exact current correctness/discoverability scope
  - Availability: available

- current-evidence
  - Material: artifact locatability Evidence
  - Material Reference: [Current Evidence](001-14-1-anchor-playthings-artifact-locatability-and-visible-actor-continuity-evidence.trace.md)
  - Purpose: validation receipts and interpretation limits
  - Availability: available

## Reference Context

- human-manual-observation
  - Material: latest manual recording and feedback that the browser-created Task could be found in Viewer data but no matching Plaything representation could be located by inspection
  - Purpose: distinguish representation/discoverability failure from proven artifact deletion
  - Availability: unavailable

## Manual Test Frontier

- Find the previously created Task by title/schema using Find. Empty Find should surface browser-local artifacts first.
- If that Task is still a current root/leaf, Find should center/select its living Plaything and the figure should carry a small LOCAL beacon.
- If that Task has since become historical in a continuing lineage, Find should select the current Plaything, pin Tesseract, and mark the exact historical Task as THIS ARTIFACT instead of pretending it is a separate living creature.
- Create a new canonical artifact from Live/Paused tools. During its suffix event the HUD should say that a local leaf/branch/continuation entered; once observed, its representation should be focused automatically.
- Watch one long linear lineage through several advances. The same Plaything should retain visual identity without remount flicker from current-head actor keys.
- Branch the lineage and verify siblings still receive distinct actors while the first branch preserves the original identity.
- Use Lineage Verse and Artifact Detail from the selected exact artifact and verify both open the requested record/context.
- Retest resting migration, A*/roads, schema blueprints, Tech Tree, Follow/Fit, Handoff reconciliation, and Viewer interaction performance for regression.

## Retained Responsibilities

- discoverability-acceptance
  - Retained By: Tiinusen
  - Responsibility: judge whether Find + LOCAL beacon + exact Tesseract makes created/historical material genuinely easy to understand in the world

- flicker-acceptance
  - Retained By: Tiinusen
  - Responsibility: determine whether any remaining disappear/reappear behavior is lifecycle-correct or a further render/compositor defect

- future-refinement
  - Retained By: recipient Anchor
  - Responsibility: refine world navigation/search presentation from manual observation without duplicating artifact semantics

## Exclusions And Dependencies

- public-build-receipt
  - Kind: unresolved-dependency
  - Description: no public production build PASS is claimed

- semantic-actor-identity
  - Kind: excluded-scope
  - Description: Playthings actor ids and LOCAL beacons remain presentation state

- business-docs-mutation
  - Kind: excluded-scope
  - Description: Business and Docs remain unchanged carried context

## Completion Expectation

- Signal Kind: result
- Signal Meaning: Tiinusen receives a checkpoint where browser-local and historical artifacts are explicitly locatable in the shared earth, linear visible actors preserve continuity, and selection can explain where an artifact lives in the current lineage story
- Return To: Anchor
- Return To Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)

## Interpretation Limits

- Does Not Mean: every artifact is a permanent character, local beacons are semantic provenance, or all browser flicker is proven absent
- Must Not Be Used To Claim: production readiness, inferred lineage, invented repository binding, or duplicate semantic representations

# Continuity Integrity

- sha256-base64url-c14n-v2
  - Towards: [Playthings Artifact Locatability Evidence](001-14-1-anchor-playthings-artifact-locatability-and-visible-actor-continuity-evidence.trace.md)
  - Value: fPOC5J3vrripF0ZOxfl6SeOk-kRDu8LFfD-wGYzkjRs

- sha256-base64url-c14n-v2
  - Towards: self
  - Value:PY5v0K6njpxwuZhBhGqbR0NIamL7UMTrIkGB20kgT4g
