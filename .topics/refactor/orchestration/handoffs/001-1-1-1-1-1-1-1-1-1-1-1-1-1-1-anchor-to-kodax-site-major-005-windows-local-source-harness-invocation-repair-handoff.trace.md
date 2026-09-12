# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-12 00:06:26
  - Trace: [001-1-1-1-1-1-1-1-1-1-1-1-1-1-site-major-005-windows-local-source-harness-invocation-repair-task.trace.md](../001-1-1-1-1-1-1-1-1-1-1-1-1-1-site-major-005-windows-local-source-harness-invocation-repair-task.trace.md)
  - Origin:
    - [relative](../001-1-1-1-1-1-1-1-1-1-1-1-1-1-site-major-005-windows-local-source-harness-invocation-repair-task.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-12 00:06:26
  - Authors: Anchor
  - Why: The human gate exposed a Site-owned portability defect before dependency/browser qualification; fix that exact host boundary without widening product scope.
  - Summary: Continue the still-open Site Major 005 with a bounded Windows npm/Node invocation repair and one unambiguous Sigma front-door rerun action.
  - Status: ready/local

---

# Anchor To Kodax — Site Major 005 Windows Local-Source Harness Invocation Repair

## Handoff Parties

- Purpose: continue the still-open Site Major 005 after Sigma's real Windows execution exposed a host invocation defect before npm-version qualification; repair only the Site-owned portable harness/launch path and return a trustworthy full-source human gate.
- From: Anchor
- From Kind: role
- From Reference: [Anchor Role — Successor Evolution Continuation](business::.topics/roles/001-1-1-1-anchor-successor-evolution-role.trace.md)
- To: Kodax
- To Kind: role
- To Reference: [Kodax Role](business::.topics/roles/001-6-kodax-role.trace.md)

## Transfers

- windows-npm-invocation-repair
  - Transfer Kind: work-and-responsibility
  - Description: repair the Site local-source harness so Windows resolves and invokes npm/Node portably rather than failing with `spawnSync npm ENOENT`, without introducing machine-specific paths or private first-party publication/install assumptions.
  - Controlling Artifact: [Windows Harness Repair Task](../001-1-1-1-1-1-1-1-1-1-1-1-1-1-site-major-005-windows-local-source-harness-invocation-repair-task.trace.md)
  - Boundary: Site harness/ergonomics only; no sibling source mutation is transferred.

- front-door-human-gate
  - Transfer Kind: work
  - Description: return one exact Sigma-facing command/action and expected receipt after repair, with explicit fail-closed instructions for any next blocker. The action must not require choosing among ambiguous VS Code launch profiles or discovering the procedure through Parent traversal.
  - Controlling Artifact: [Windows Harness Repair Task](../001-1-1-1-1-1-1-1-1-1-1-1-1-1-site-major-005-windows-local-source-harness-invocation-repair-task.trace.md)
  - Boundary: Kodax does not claim Sigma acceptance.

## Required Context

- site-workspace
  - Material: complete current Site Workspace including Major 005 harness, Sigma execution Task/Handoff, and browser-smoke repairs.
  - Material Reference: [Site Workspace](site::.topics/.workspaces/tiinex-site.workspace.md)
  - Purpose: writable owner source and exact failed human-gate context.
  - Availability: available
- app-workspace
  - Material: complete current App Workspace.
  - Material Reference: [App Workspace](app::.topics/.workspaces/tiinex-app.workspace.md)
  - Purpose: exact read-only first-party source consumed by the harness.
  - Availability: available
- core-workspace
  - Material: complete current Core Workspace.
  - Material Reference: [Core Workspace](core::.topics/.workspaces/tiinex-core.workspace.md)
  - Purpose: exact read-only first-party source consumed by the harness.
  - Availability: available
- playthings-workspace
  - Material: complete current Verse Playthings Workspace.
  - Material Reference: [Playthings Workspace](verse-playthings::.topics/.workspaces/tiinex-verse-playthings.workspace.md)
  - Purpose: exact read-only first-party source consumed by the harness.
  - Availability: available

## Reference Context

- sigma-browser-host-handoff
  - Material: exact human-targeted Handoff whose Windows execution produced the observed failure.
  - Material Reference: [Sigma Browser Host Execution Handoff](001-1-1-1-1-1-1-1-1-1-1-1-1-anchor-to-sigma-playthings-browser-host-execution-handoff.trace.md)
  - Purpose: preserve the accepted test scope and prevent accidental Major expansion.
  - Availability: available

- observed-failure
  - Material: Sigma observed `spawnSync npm ENOENT` at the harness `npm --version` gate even though the invoking shell successfully executed npm.
  - Purpose: exact host failure to reproduce/repair.
  - Availability: available

## Retained Responsibilities

- human-execution-and-acceptance
  - Retained By: Sigma
  - Responsibility: rerun only after Anchor delivers a repaired full-source test carrier and decide human acceptance separately from machine receipts.
- cross-owner-routing
  - Retained By: Anchor
  - Responsibility: route any proven non-Site blocker to its owner without widening this Site Major silently.

## Exclusions And Dependencies

- sibling-source-mutation
  - Kind: excluded-scope
  - Description: do not edit Core, App or Playthings source under this Handoff.
- first-party-publication
  - Kind: excluded-scope
  - Description: do not publish or install `@tiinex/*` from a registry merely to make the harness work.
- product-feature-work
  - Kind: excluded-scope
  - Description: no Playthings/Viewer product behavior expansion is delegated.

## Completion Expectation

- Signal Kind: return
- Signal Meaning: Kodax returns a bounded Site Major 005 continuation with the portable Windows invocation repair, focused qualification, and one unambiguous Sigma front-door test action or the smallest exact remaining blocker.
- Return To: Anchor
- Return To Reference: [Anchor Role — Successor Evolution Continuation](business::.topics/roles/001-1-1-1-anchor-successor-evolution-role.trace.md)

## Interpretation Limits

- Does Not Mean: Playthings is human-accepted, Site Major 005 is automatically complete, or any first-party package must be published.
- Must Not Be Used To Claim: sibling ownership, release readiness, network workaround authority, human acceptance or permission to broaden the Major.
- Authority Limits: Kodax owns the bounded Site harness repair; Anchor owns orchestration; Sigma owns human execution/acceptance.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-1-1-1-1-1-1-1-1-1-1-1-1-1-site-major-005-windows-local-source-harness-invocation-repair-task.trace.md](../001-1-1-1-1-1-1-1-1-1-1-1-1-1-site-major-005-windows-local-source-harness-invocation-repair-task.trace.md)
  - Value: GbqY6qd1ZxJAlp4dVO-IJZYbMmfgxvWRbry2bRvjAZs

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: 7yBlqZ6eKwNrLz8TCfsRzOGoJWLTVb2FUmzIB9v9hpU