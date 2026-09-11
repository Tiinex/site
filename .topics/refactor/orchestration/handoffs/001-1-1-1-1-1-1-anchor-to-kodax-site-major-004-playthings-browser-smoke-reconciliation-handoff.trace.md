# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-11 20:54:04
  - Trace: [001-1-1-1-1-1-site-major-004-playthings-browser-smoke-reconciliation-task.trace.md](../001-1-1-1-1-1-site-major-004-playthings-browser-smoke-reconciliation-task.trace.md)
  - Origin:
    - [relative](../001-1-1-1-1-1-site-major-004-playthings-browser-smoke-reconciliation-task.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-11 20:54:05
  - Authors: Anchor
  - Why: Prism isolated the remaining Playthings readiness blocker to stale Site smoke assumptions plus dependency-capable browser-host availability.
  - Summary: Delegate the bounded Site-owned smoke/host repair needed to test the existing Playthings candidate through the current App/Site browser path.
  - Status: ready/local

---

# Anchor To Kodax — Site Major 004 Playthings Browser Smoke Reconciliation

## Handoff Parties

- Purpose: delegate one bounded Site-owned tranche that reconciles the stale Playthings browser smoke with the current App/Playthings host contract and attempts a genuine real-browser qualification without widening into Viewer or Verse product work.
- From: Anchor
- From Kind: role
- From Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
- To: Kodax
- To Kind: role
- To Reference: [Kodax Role](business::.topics/roles/001-6-kodax-role.trace.md)

## Transfers

- site-browser-smoke-reconciliation
  - Transfer Kind: work-and-responsibility
  - Description: implement the exact Site-owned smoke/host changes required to align `tools/browser-smoke.py` with the current Playthings DOM contract, Root Gate/Fullscreen path, visible-moment projection and current navigation labels.
  - Controlling Artifact: [Site Major 004 Task](../001-1-1-1-1-1-site-major-004-playthings-browser-smoke-reconciliation-task.trace.md)
  - Boundary: mutate Site only unless a new cross-owner blocker is proven and returned to Anchor; do not privately patch Playthings, App or Core.

- real-browser-qualification
  - Transfer Kind: work-and-responsibility
  - Description: run the bounded real Site React/Vite Playthings browser smoke when the exact dependency-capable host is available, using an explicit already-installed compatible browser executable when needed.
  - Controlling Artifact: [Site Major 004 Task](../001-1-1-1-1-1-site-major-004-playthings-browser-smoke-reconciliation-task.trace.md)
  - Boundary: absence of Vite/dependency closure remains a blocker, not permission to install from the network, weaken the gate, or synthesize PASS.

- next-playthings-gate
  - Transfer Kind: work
  - Description: return either genuine browser-PASS evidence sufficient for Anchor to continue Playthings Major 003 with Prism, or the smallest exact remaining blocker.
  - Controlling Artifact: [Site Major 004 Task](../001-1-1-1-1-1-site-major-004-playthings-browser-smoke-reconciliation-task.trace.md)
  - Boundary: Kodax does not issue Sigma acceptance or close Playthings Major 003.

## Required Context

- site-major-004-task
  - Material: exact delegated Task.
  - Material Reference: [Site Major 004 Task](../001-1-1-1-1-1-site-major-004-playthings-browser-smoke-reconciliation-task.trace.md)
  - Purpose: fixed Major scope and done criteria.
  - Availability: available

- site-workspace
  - Material: complete current Site Workspace.
  - Material Reference: [Site Workspace](site::.topics/.workspaces/tiinex-site.workspace.md)
  - Purpose: exact writable owner source including completed Viewer Major 003 baseline and current browser smoke.
  - Availability: available

- playthings-workspace
  - Material: complete current Verse Playthings Workspace.
  - Material Reference: [Playthings Workspace](verse-playthings::.topics/.workspaces/tiinex-verse-playthings.workspace.md)
  - Purpose: exact read-only current product/contract source used by the smoke.
  - Availability: available

- app-workspace
  - Material: complete current App Workspace.
  - Material Reference: [App Workspace](app::.topics/.workspaces/tiinex-app.workspace.md)
  - Purpose: exact read-only host/adaptor contract source.
  - Availability: available

- core-workspace
  - Material: complete current Core Workspace.
  - Material Reference: [Core Workspace](core::.topics/.workspaces/tiinex-core.workspace.md)
  - Purpose: exact read-only shared mechanics/source used by current package composition.
  - Availability: available

- playthings-major-003-evidence
  - Material: Prism browser-readiness evidence from the still-open Playthings Major 003.
  - Material Reference: [Playthings Major 003 Evidence](verse-playthings::.topics/refactor/qualification/002-prism-playthings-major-003-real-browser-readiness-evidence.trace.md)
  - Purpose: exact stale-smoke findings, successful Verse-local gates and remaining browser/dependency blocker.
  - Availability: available

## Reference Context

- viewer-major-003-return
  - Material: completed Viewer/Site Major 003 return.
  - Material Reference: [Viewer Major 003 Return](001-1-1-1-1-kodax-to-anchor-viewer-major-003-qualification-ownership-repair-return.trace.md)
  - Purpose: exact current Site/App qualification baseline and separation from later Native Verse work.
  - Availability: available

- playthings-major-003-return
  - Material: Prism return for the open Playthings Major 003.
  - Material Reference: [Playthings Major 003 Return](verse-playthings::.topics/refactor/qualification/003-prism-to-anchor-playthings-major-003-real-browser-readiness-retu.trace.md)
  - Purpose: exact current browser-readiness disposition and owner boundary.
  - Availability: available

## Retained Responsibilities

- playthings-product-ownership
  - Retained By: Prism
  - Responsibility: consume a later qualified Site browser result and decide whether the existing Playthings candidate reaches the Sigma-test gate under its still-open Major 003.
- orchestration-and-cross-owner-routing
  - Retained By: Anchor
  - Responsibility: audit the return, merge only Site-owned qualified deltas, route any genuine cross-owner blocker, and continue Playthings Major 003 without silently widening either Major.
- human-acceptance
  - Retained By: Sigma
  - Responsibility: perform the first current Playthings human test only after real-browser technical readiness is proven and a bounded test card is returned.

## Exclusions And Dependencies

- native-verse-extraction
  - Kind: excluded-scope
  - Description: Native Verse implementation remains a separate Viewer architecture Major and is not part of this Site smoke repair.
- playthings-feature-work
  - Kind: excluded-scope
  - Description: no Playthings visual, world, interaction or runtime feature expansion is delegated.
- network-dependency-workaround
  - Kind: excluded-scope
  - Description: do not bypass missing locked dependencies with opportunistic network installs, alternate dependency versions or weakened smoke gates.
- dependency-capable-host
  - Kind: unresolved-dependency
  - Description: a genuine Vite/browser run requires the exact locked dependency closure to be present in the execution host; if absent, preserve the blocker exactly.
  - Responsible Party Or Role: Anchor / Sigma host when separately requested.

## Completion Expectation

- Signal Kind: return
- Signal Meaning: Kodax returns one bounded Site-owned result with exact changed source/evidence, current machine qualification, and either a genuine real-browser Playthings smoke PASS or one smallest exact remaining host blocker.
- Return To: Anchor
- Return To Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)

## Interpretation Limits

- Does Not Mean: Playthings Major 003 is complete, Sigma has accepted the experience, Native Verse is complete, Viewer has PoC parity, or a browser smoke PASS proves release readiness.
- Must Not Be Used To Claim: authority to mutate Playthings/App/Core, network-install permission, product parity, human acceptance, or semantic authority from package carriage.
- Authority Limits: Kodax owns only the delegated Site implementation/qualification tranche; Anchor owns orchestration; Prism owns later Playthings disposition; Sigma owns human acceptance.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-1-1-1-1-1-site-major-004-playthings-browser-smoke-reconciliation-task.trace.md](../001-1-1-1-1-1-site-major-004-playthings-browser-smoke-reconciliation-task.trace.md)
  - Value: 58SXfe_4yIT5vgylbIXY7bTITqvl-uQztHNqf__5EDw

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: 5yLjqKvoaCa81VSyqYv7GHsr_UMnhq6HEJPc86gWTU4