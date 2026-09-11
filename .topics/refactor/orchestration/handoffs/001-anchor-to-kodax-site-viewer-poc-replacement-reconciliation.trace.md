# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-11 16:58:54
  - Trace: [001-site-viewer-repository-local-orchestration-frontier.trace.md](../001-site-viewer-repository-local-orchestration-frontier.trace.md)
  - Origin:
    - [relative](../001-site-viewer-repository-local-orchestration-frontier.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-11 16:59:54
  - Authors: Anchor
  - Why: Resume the blocked Viewer lane from the correct repository boundary.
  - Summary: Delegate Site-owned Viewer PoC replacement reconciliation to Kodax.
  - Status: ready/local

---

# Anchor to Kodax — Site Viewer PoC replacement reconciliation

## Handoff Parties

- Purpose: continue the Viewer PoC replacement reconciliation from Site-owned continuity, preserving the seven product-contract groups and removing Business as the default specialist artifact store.
- From: Anchor
- From Kind: role
- From Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
- To: Kodax
- To Kind: role
- To Reference: [Kodax Role](business::.topics/roles/001-6-kodax-role.trace.md)

## Transfers

- poc-contract-reconciliation
  - Transfer Kind: work-and-responsibility
  - Description: reconcile the seven preserved PoC product-contract groups against current refactored Site/App/Verse/provider behavior using carried local material first. Classify retained user-visible value as KEEP, CHANGED INTENTIONALLY, DROP WITH REASON, or UNKNOWN with exact source evidence.
  - Controlling Artifact: [Site Viewer repository-local orchestration frontier](../001-site-viewer-repository-local-orchestration-frontier.trace.md)
  - Boundary: historical implementation accidents and exact monolith styling are evidence, not automatic requirements.
- parity-ledger-disposition
  - Transfer Kind: work
  - Description: review current parity scenarios and distinguish implementation gap, composition gap, browser/manual evidence gap, intentional change, or stale ledger state. Do not upgrade any scenario beyond its evidence.
  - Boundary: code presence or unit tests alone are not Sigma product acceptance.
- next-major-plan
  - Transfer Kind: work
  - Description: return the smallest ordered Viewer implementation/qualification sequence needed to reach a truthful PoC retirement gate.
  - Boundary: do not silently expand this reconciliation into broad product implementation.

## Required Context

- site-workspace
  - Material: Complete current Site Workspace including Viewer parity history.
  - Material Reference: [Site Workspace](site::.topics/.workspaces/tiinex-site.workspace.md)
  - Purpose: Primary owning repository for this reconciliation and current web host composition.
  - Availability: available
- app-workspace
  - Material: Complete current App Workspace.
  - Material Reference: [App Workspace](app::.topics/.workspaces/tiinex-app.workspace.md)
  - Purpose: Shared Viewer/application implementation and parity ledger.
  - Availability: available
- verse-native-workspace
  - Material: Complete current Native Verse Workspace.
  - Material Reference: [Native Verse Workspace](verse-native::.topics/.workspaces/tiinex-verse-native.workspace.md)
  - Purpose: Exact current native presentation extraction boundary.
  - Availability: available
- business-workspace
  - Material: Current Business orchestration and Role material.
  - Material Reference: [Business Workspace](business::.topics/.workspaces/tiinex-business.workspace.md)
  - Purpose: Role identities, Major coordination and return boundary only; not specialist artifact ownership.
  - Availability: available
- docs-workspace
  - Material: Current canonical semantic contracts.
  - Material Reference: [Docs Workspace](docs::.topics/.workspaces/tiinex-docs.workspace.md)
  - Purpose: Read-only semantic boundary.
  - Availability: available

## Reference Context

- historical-business-viewer-lane
  - Material: Earlier Business-local Viewer Major artifacts and the quarantined return remain historical evidence.
  - Purpose: Preserve prior work without treating Business placement as the desired ongoing repository boundary.
  - Availability: available

## Retained Responsibilities

- major-scope-and-retirement-gate
  - Retained By: Anchor
  - Retained By Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
  - Responsibility: decide later Viewer Majors and whether evidence can approach PoC retirement.
  - Boundary: Kodax returns technical reconciliation; Anchor retains orchestration.
- human-product-acceptance
  - Retained By: Sigma
  - Retained By Reference: [Sigma Role](business::.topics/roles/001-4-sigma-role.trace.md)
  - Responsibility: browser/product acceptance and final PoC retirement decision.
  - Boundary: technical reconciliation is not human acceptance.

## Exclusions And Dependencies

- broad-implementation
  - Kind: excluded-scope
  - Description: Do not implement the full remaining Viewer surface in this Handoff.
  - Responsible Party Or Role: later explicit Viewer implementation Major.
- remote-first-research
  - Kind: excluded-scope
  - Description: Use carried local evidence first; targeted historical remote source requires a concrete unresolved question.
  - Responsible Party Or Role: Anchor approval if needed.
- release-and-deploy
  - Kind: excluded-scope
  - Description: No deployment, publication, package release, remote push or PoC retirement is authorized.
  - Responsible Party Or Role: explicit later gates.

## Completion Expectation

- Signal Kind: return
- Signal Meaning: Return a bounded Site-owned technical reconciliation plus one normal Handoff to Anchor, with product-contract groups and parity scenarios dispositioned as far as exact carried evidence allows and explicit UNKNOWNs where evidence is genuinely missing.
- Return To: Anchor
- Return To Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)

## Interpretation Limits

- Does Not Mean: PoC parity, PoC retirement, Native Verse completeness, Sigma acceptance, or broad implementation authority.
- Must Not Be Used To Claim: Site placement creates semantic authority outside Site ownership; Business Role context makes Business the artifact owner; or Carrier Major 002 maps to artifact filename 002.
- Authority Limits: bounded Viewer/Site technical reconciliation only.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-site-viewer-repository-local-orchestration-frontier.trace.md](../001-site-viewer-repository-local-orchestration-frontier.trace.md)
  - Value: 8-YErGORA0ys1CD1ORmAEgQF10absJdrDcl2gWS4erI

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: IZwgY5Cn0M3HtZau8wWruDvN-FA84rL_e1qLb-oIHuQ