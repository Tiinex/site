# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-11 22:13:18
  - Trace: [001-1-1-1-1-1-1-1-1-site-major-005-self-contained-playthings-local-source-browser-harness-task.trace.md](../001-1-1-1-1-1-1-1-1-site-major-005-self-contained-playthings-local-source-browser-harness-task.trace.md)
  - Origin:
    - [relative](../001-1-1-1-1-1-1-1-1-site-major-005-self-contained-playthings-local-source-browser-harness-task.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-11 22:13:18
  - Authors: Anchor
  - Why: Sigma requires a full Handoff package for tests and should not have to diagnose or publish missing first-party dependencies manually.
  - Summary: Delegate a disposable local-source composition harness so Anchor can later give Sigma one full current Playthings test carrier without first-party npm publication.
  - Status: ready/local

---

# Anchor To Kodax — Site Major 005 Self-Contained Playthings Local-Source Browser Harness

## Handoff Parties

- Purpose: build the Site-owned temporary local-source composition harness needed to test current Playthings without publishing current `@tiinex/*` packages, so Anchor can later give Sigma one full Handoff package with no missing first-party source dependency.
- From: Anchor
- From Kind: role
- From Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
- To: Kodax
- To Kind: role
- To Reference: [Kodax Role](business::.topics/roles/001-6-kodax-role.trace.md)

## Transfers

- local-source-composition-harness
  - Transfer Kind: work-and-responsibility
  - Description: implement and qualify the disposable Site test harness defined by the controlling Task, using exact local Core/App/Playthings package bytes and only public third-party npm resolution where necessary.
  - Controlling Artifact: [Site Major 005 Task](../001-1-1-1-1-1-1-1-1-site-major-005-self-contained-playthings-local-source-browser-harness-task.trace.md)
  - Boundary: source repositories remain unmodified by the test composition and no first-party publication is authorized.

- sigma-test-contract
  - Transfer Kind: work
  - Description: return a concise one-command Sigma execution contract and exact required source set so Anchor can manufacture a full Sigma-targeted Handoff package after audit.
  - Controlling Artifact: [Site Major 005 Task](../001-1-1-1-1-1-1-1-1-site-major-005-self-contained-playthings-local-source-browser-harness-task.trace.md)
  - Boundary: Kodax does not ask Sigma to debug missing first-party dependencies manually and does not claim human acceptance.

- browser-evidence
  - Transfer Kind: work-and-responsibility
  - Description: if the role host can execute the exact temporary composition, run current Site build/browser smoke and return genuine PASS/failure evidence; if public third-party installation is unavailable, preserve that exact environment blocker while still qualifying the harness structurally and with focused tests.
  - Controlling Artifact: [Site Major 005 Task](../001-1-1-1-1-1-1-1-1-site-major-005-self-contained-playthings-local-source-browser-harness-task.trace.md)
  - Boundary: never manufacture a PASS by using registry `@tiinex/*` packages instead of the carried source.

## Required Context

- site-workspace
  - Material: complete current Site Workspace including Site Major 004 browser-smoke repair.
  - Material Reference: [Site Workspace](site::.topics/.workspaces/tiinex-site.workspace.md)
  - Purpose: writable test/host owner source.
  - Availability: available
- core-workspace
  - Material: complete current Core Workspace.
  - Material Reference: [Core Workspace](core::.topics/.workspaces/tiinex-core.workspace.md)
  - Purpose: exact read-only first-party package source.
  - Availability: available
- app-workspace
  - Material: complete current App Workspace.
  - Material Reference: [App Workspace](app::.topics/.workspaces/tiinex-app.workspace.md)
  - Purpose: exact read-only first-party package source.
  - Availability: available
- playthings-workspace
  - Material: complete current Verse Playthings Workspace including open Major 003 evidence.
  - Material Reference: [Verse Playthings Workspace](verse-playthings::.topics/.workspaces/tiinex-verse-playthings.workspace.md)
  - Purpose: exact read-only product/package source to be tested.
  - Availability: available
- business-workspace
  - Material: complete current Business Workspace containing Anchor/Kodax/Sigma Role endpoints and recovery context.
  - Material Reference: [Business Workspace](business::.topics/.workspaces/tiinex-business.workspace.md)
  - Purpose: exact endpoint Role authority and test-routing context.
  - Availability: available

## Reference Context

- site-major-004-return
  - Material: completed Site Major 004 browser-smoke repair return.
  - Material Reference: [Site Major 004 Return](001-1-1-1-1-1-1-1-kodax-to-anchor-site-major-004-playthings-browser-smoke-reconcil.trace.md)
  - Purpose: current repaired browser-smoke contract and exact dependency blocker.
  - Availability: available
- playthings-major-003-return
  - Material: current Prism return for open Playthings Major 003.
  - Material Reference: [Playthings Major 003 Return](verse-playthings::.topics/refactor/qualification/003-prism-to-anchor-playthings-major-003-real-browser-readiness-retu.trace.md)
  - Purpose: current product/readiness evidence and requirement for genuine browser execution.
  - Availability: available

## Retained Responsibilities

- sigma-package-manufacture
  - Retained By: Anchor
  - Responsibility: audit the returned harness and manufacture the full Sigma-targeted Handoff package containing all exact required first-party Workspaces.
- playthings-readiness-disposition
  - Retained By: Prism
  - Responsibility: consume genuine browser evidence under the still-open Playthings Major 003 before declaring a Sigma test candidate.
- human-acceptance
  - Retained By: Sigma
  - Responsibility: perform the current human Playthings test only from Anchor's full qualified Handoff package.

## Exclusions And Dependencies

- first-party-publication
  - Kind: excluded-scope
  - Description: do not publish Core/App/Playthings packages merely to make the test run.
- product-feature-work
  - Kind: excluded-scope
  - Description: no Playthings/App product changes are authorized.
- public-third-party-network
  - Kind: unresolved-dependency
  - Description: a clean human host may need public npm access for exact declared React/Vite/FontAwesome/TypeScript and transitive third-party packages; this is explicitly separate from first-party Tiinex source availability.
  - Responsible Party Or Role: execution host.
- release
  - Kind: excluded-scope
  - Description: no production deployment, npm publication or Marketplace release.

## Completion Expectation

- Signal Kind: return
- Signal Meaning: Kodax returns one Site-owned Major 005 result containing the qualified local-source composition harness, focused tests, one-command Sigma execution contract, and genuine browser evidence when executable or the exact remaining third-party-host blocker otherwise.
- Return To: Anchor
- Return To Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)

## Interpretation Limits

- Does Not Mean: public third-party dependencies become Tiinex source authority, browser PASS equals Sigma acceptance, Playthings Major 003 closes automatically, or first-party publication is required.
- Must Not Be Used To Claim: release readiness, product parity, Core/App mutation authority, or permission to modify Sigma source checkouts during the disposable test composition.
- Authority Limits: Kodax owns only Site test-harness implementation; Anchor owns package/test routing; Prism owns later Playthings readiness disposition; Sigma owns human acceptance.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-1-1-1-1-1-1-1-1-site-major-005-self-contained-playthings-local-source-browser-harness-task.trace.md](../001-1-1-1-1-1-1-1-1-site-major-005-self-contained-playthings-local-source-browser-harness-task.trace.md)
  - Value: mEcidGcjUIRZP1gi_faKWF6zN0K18O6tWNhYMgY5J3Q

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: z0l9SncB7qzp-e7W48CyHmHXdmAzyyZQnRd-N5Pt_dQ