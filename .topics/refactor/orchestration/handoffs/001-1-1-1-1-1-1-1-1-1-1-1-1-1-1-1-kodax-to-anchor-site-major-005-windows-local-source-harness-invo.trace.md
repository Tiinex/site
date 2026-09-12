# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-12 00:06:26
  - Trace: [001-1-1-1-1-1-1-1-1-1-1-1-1-1-1-anchor-to-kodax-site-major-005-windows-local-source-harness-invocation-repair-handoff.trace.md](001-1-1-1-1-1-1-1-1-1-1-1-1-1-1-anchor-to-kodax-site-major-005-windows-local-source-harness-invocation-repair-handoff.trace.md)
  - Origin:
    - [relative](001-1-1-1-1-1-1-1-1-1-1-1-1-1-1-anchor-to-kodax-site-major-005-windows-local-source-harness-invocation-repair-handoff.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-12 00:31:22
  - Authors: Kodax
  - Why: The inbound Site Major 005 continuation requested a bounded Windows invocation repair and one unambiguous Sigma rerun action without widening product scope.
  - Summary: Return the Site-owned Windows npm/Node invocation repair with focused 8/8 regression qualification, successful npm-version and exact first-party pack receipts, one Sigma npm-script front door, and the still-unqualified third-party install/build/browser boundary.
  - Status: ready/local

---

## Handoff Parties

- Purpose: return the bounded Site Major 005 Windows npm/Node invocation repair, focused qualification, and one unambiguous Sigma front-door rerun action while preserving the still-unqualified third-party install/build/browser boundary.
- From: Kodax
- From Kind: role
- From Reference: [Kodax Role](business::.topics/roles/001-6-kodax-role.trace.md)
- To: Anchor
- To Kind: role
- To Reference: [Anchor Role — Successor Evolution Continuation](business::.topics/roles/001-1-1-1-anchor-successor-evolution-role.trace.md)

## Transfers

- windows-npm-invocation-repair
  - Transfer Kind: work-and-responsibility
  - Description: receive the repaired Site local-source harness where all npm child-process phases resolve through one host invocation contract. The supported npm-script front door uses npm-provided `npm_execpath` through the already-running Node executable instead of shell-free direct `npm`/`npm.cmd` execution; Windows direct-Node invocation without that metadata fails closed with the supported front-door command.
  - Controlling Artifact: [Windows Invocation Repair Evidence](../../qualification/003-kodax-site-major-005-windows-local-source-harness-invocation-rep.trace.md)
  - Boundary: Site harness/ergonomics only; no Core/App/Playthings source mutation or first-party publication is included.

- focused-qualification-result
  - Transfer Kind: work
  - Description: preserve the current machine result: harness syntax passes; focused harness + browser-contract tests pass `8/8`, including two Windows-specific invocation regressions; Python browser-smoke compilation passes; the actual npm-script probe succeeds through npm-version and all three exact first-party pack phases with source state unchanged.
  - Controlling Artifact: [Windows Invocation Repair Evidence](../../qualification/003-kodax-site-major-005-windows-local-source-harness-invocation-rep.trace.md)
  - Boundary: these receipts prove the repaired invocation path and first-party packaging boundary, not Site build/browser PASS or product readiness.

- sigma-front-door-human-gate
  - Transfer Kind: work
  - Description: give Sigma one command from the Site checkout: `npm run test:browser:local-source -- --core <core-root> --app <app-root> --playthings <playthings-root> --browser <chrome-or-chromium-executable>`. Use this npm-script front door on Windows; do not launch `node tools/local-source-browser-harness.mjs` directly and do not choose among VS Code launch profiles.
  - Controlling Artifact: [Windows Invocation Repair Evidence](../../qualification/003-kodax-site-major-005-windows-local-source-harness-invocation-rep.trace.md)
  - Boundary: Sigma supplies the actual local checkout/browser paths on the dependency-capable Windows host and returns the structured harness result; Kodax does not claim Sigma execution or acceptance.

- truthful-current-host-boundary
  - Transfer Kind: work
  - Description: preserve the smallest remaining role-host boundary: the deterministic cache-only probe reaches npm install and fails with `ENOTCACHED` for exact `vite@8.1.5`; `registry.npmjs.org` does not resolve on this host. Build/browser phases are therefore not reached here.
  - Controlling Artifact: [Windows Invocation Repair Evidence](../../qualification/003-kodax-site-major-005-windows-local-source-harness-invocation-rep.trace.md)
  - Boundary: this is an execution-host dependency boundary, not evidence that the Windows invocation repair failed, not a browser assertion failure, and not a product defect.

## Required Context

- windows-invocation-repair-evidence
  - Material: qualified Site Evidence containing the exact three-file delta, Windows invocation contract, focused `8/8` qualification, first-party pack hashes, source-state receipt, and exact remaining host blocker.
  - Material Reference: [Windows Invocation Repair Evidence](../../qualification/003-kodax-site-major-005-windows-local-source-harness-invocation-rep.trace.md)
  - Purpose: authoritative technical result surface for this return.
  - Availability: available

- repaired-site-workspace
  - Material: complete modified Site Workspace carrying the portable npm invocation repair, regression coverage, and front-door documentation.
  - Material Reference: [Site Workspace](site::.topics/.workspaces/tiinex-site.workspace.md)
  - Purpose: exact returned source state; implementation must be consumed from Workspace bytes rather than reconstructed from prose.
  - Availability: available

- core-workspace
  - Material: exact carried Core Workspace used read-only as local `@tiinex/core@0.1.1` package source.
  - Material Reference: [Core Workspace](core::.topics/.workspaces/tiinex-core.workspace.md)
  - Purpose: first-party source input for the Sigma/full-host harness rerun.
  - Availability: available

- app-workspace
  - Material: exact carried App Workspace used read-only as local `@tiinex/app@0.1.1` package source.
  - Material Reference: [App Workspace](app::.topics/.workspaces/tiinex-app.workspace.md)
  - Purpose: first-party source input for the Sigma/full-host harness rerun.
  - Availability: available

- playthings-workspace
  - Material: exact carried Verse Playthings Workspace used read-only as local `@tiinex/verse-playthings@0.1.0` package source.
  - Material Reference: [Playthings Workspace](verse-playthings::.topics/.workspaces/tiinex-verse-playthings.workspace.md)
  - Purpose: exact current Verse candidate source for the Sigma/full-host harness rerun.
  - Availability: available

- controlling-anchor-to-kodax-handoff
  - Material: inbound Site Major 005 Windows invocation repair Handoff defining delegated scope, exclusions, retained responsibilities, and completion expectation.
  - Material Reference: [Anchor To Kodax Windows Invocation Repair Handoff](001-1-1-1-1-1-1-1-1-1-1-1-1-1-1-anchor-to-kodax-site-major-005-windows-local-source-harness-invocation-repair-handoff.trace.md)
  - Purpose: exact authority and scope boundary for interpreting this return.
  - Availability: available

## Reference Context

- prior-major-005-return
  - Material: predecessor Kodax return that introduced the self-contained local-source browser harness and isolated the third-party dependency-host boundary.
  - Material Reference: [Prior Site Major 005 Return](001-1-1-1-1-1-1-1-1-1-1-kodax-to-anchor-site-major-005-self-contained-playthings-local-source-browser-harness-return.trace.md)
  - Purpose: predecessor harness contract preserved and narrowed by this Windows invocation repair.
  - Availability: available

- sigma-browser-host-handoff
  - Material: exact prior Sigma execution Handoff whose Windows run exposed `spawnSync npm ENOENT`.
  - Material Reference: [Sigma Browser Host Execution Handoff](001-1-1-1-1-1-1-1-1-1-1-1-1-anchor-to-sigma-playthings-browser-host-execution-handoff.trace.md)
  - Purpose: preserve the accepted human-host execution scope and next result shape.
  - Availability: available

## Retained Responsibilities

- dependency-capable-windows-routing
  - Retained By: Anchor
  - Responsibility: package/route the returned exact Site/Core/App/Playthings source set to Sigma's dependency-capable Windows host and give Sigma the single npm-script front-door action.
  - Boundary: Kodax's execution host cannot qualify the public-third-party install/build/browser phases.

- human-execution-and-acceptance
  - Retained By: Sigma
  - Responsibility: run the returned front-door command on Windows and return the harness `result.json` or smallest structured failure stage; human product acceptance remains separate.
  - Boundary: machine/source qualification cannot substitute for Sigma observation or acceptance.

- playthings-readiness-disposition
  - Retained By: Prism
  - Responsibility: consume a later genuine real-browser result under the still-open Playthings readiness flow before declaring a human-test candidate ready.
  - Boundary: this Site return repairs host invocation only and does not close Verse readiness.

## Exclusions And Dependencies

- public-third-party-network-or-cache
  - Kind: unresolved-dependency
  - Description: this role host lacks a complete exact npm cache and cannot resolve `registry.npmjs.org`; cache-only install fails at exact `vite@8.1.5`, so build/browser phases remain unqualified here.
  - Responsible Party Or Role: Anchor / Sigma execution host.
  - Notes: first-party local package validation/packing already succeeds through the repaired npm invocation path.

- no-sibling-source-mutation
  - Kind: excluded-scope
  - Description: no Core, App, or Verse Playthings source modification is included or authorized.
  - Responsible Party Or Role: Anchor

- first-party-publication
  - Kind: excluded-scope
  - Description: no `@tiinex/*` registry publication or registry fallback is required or authorized.
  - Responsible Party Or Role: Anchor

- no-browser-or-human-pass
  - Kind: excluded-scope
  - Description: no Site build, Vite startup, React mount, Playthings interaction, browser PASS, Prism readiness decision, or Sigma acceptance is claimed from this return.
  - Responsible Party Or Role: Anchor

- release
  - Kind: excluded-scope
  - Description: no production deployment, npm publication, Git push, or release is performed or implied.
  - Responsible Party Or Role: Anchor

## Completion Expectation

- Signal Kind: result
- Signal Meaning: Anchor receives one qualified Site Major 005 continuation where the observed Windows npm child-process defect is removed, focused Windows regression qualification passes `8/8`, the actual npm-script probe reaches and passes npm-version plus exact first-party pack phases with unchanged source state, and one exact Sigma front-door command is ready for dependency-capable Windows execution; the current role-host's only remaining technical stop is public third-party install before build/browser.
- Return To: Anchor
- Return To Reference: [Anchor Role — Successor Evolution Continuation](business::.topics/roles/001-1-1-1-anchor-successor-evolution-role.trace.md)
- Expected Result Reference: [Windows Invocation Repair Evidence](../../qualification/003-kodax-site-major-005-windows-local-source-harness-invocation-rep.trace.md)

## Interpretation Limits

- Does Not Mean: Site Major 005 is automatically closed, Playthings is browser-qualified or human-accepted, public third-party packages become Tiinex authority, or first-party packages must be published.
- Must Not Be Used To Claim: deployment/release readiness, product parity, permission to mutate Core/App/Playthings, or a synthetic Windows/browser PASS.
- Authority Limits: Kodax returns only the bounded Site invocation repair and qualification; Anchor retains routing/orchestration, Prism retains later Playthings readiness disposition, and Sigma retains human execution/acceptance.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-1-1-1-1-1-1-1-1-1-1-1-1-1-1-anchor-to-kodax-site-major-005-windows-local-source-harness-invocation-repair-handoff.trace.md](001-1-1-1-1-1-1-1-1-1-1-1-1-1-1-anchor-to-kodax-site-major-005-windows-local-source-harness-invocation-repair-handoff.trace.md)
  - Value: 7yBlqZ6eKwNrLz8TCfsRzOGoJWLTVb2FUmzIB9v9hpU

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: AjN-1TUaAQge5SmwkVqEynx1BVSM4COyN9ZM-AoFjjo