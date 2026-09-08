# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.feedback.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/feedback/tiinex.feedback.v1.schema.md)
  - Created At: 2026-09-06 22:32:33
  - Trace: [023-3-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-sigma-major-012-fourth-dogfood-watcher-panel-feedback.trace.md](023-3-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-sigma-major-012-fourth-dogfood-watcher-panel-feedback.trace.md)
  - Origin:
    - [relative](023-3-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-sigma-major-012-fourth-dogfood-watcher-panel-feedback.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-06 22:32:48
  - Authors: Anchor
  - Why: Sigma fourth dogfood found two blocker-level host defects that require one bounded Loom repair before further human acceptance.
  - Summary: Repair historical inbox spam and the rendered-yet-unresponsive Tiinex Operator sidebar while preserving the current native operator architecture.
  - Status: ready/local

---

# Major 012 Watcher Session Boundary And Operator Interaction Repair — Anchor To Loom

## Handoff Parties

- Purpose: repair the two blocker-level host integration defects exposed by Sigma's 0.1.3 actual-path dogfood without broadening Major 012 or redesigning the accepted operator surface.
- From: Anchor
- From Kind: role
- From Reference: [Anchor Role](business::.topics/roles/001-1-1-anchor-major-planning-role.trace.md)
- To: Loom
- To Kind: role
- To Reference: [Loom Role](business::.topics/roles/001-3-loom-role.trace.md)

## Transfers

- session-scoped-auto-discovery
  - Transfer Kind: work-and-responsibility
  - Description: change automatic Handoff Package inbox discovery so activation/discovery enablement establishes a session start boundary and historical files already present before that boundary are not automatically emitted as candidate notifications. Future qualifying filesystem arrivals after the boundary remain discoverable.
  - Boundary: manual discovery of older inbox material may remain available as an explicit user action. Do not reinterpret the time boundary as semantic carrier staleness or validity.

- narrow-package-candidate-filter
  - Transfer Kind: work
  - Description: ensure the automatic inbox watcher filters to the supported Handoff Package filename/material shape before qualification/notification so unrelated Downloads files or generic ZIPs cannot create notification spam.
  - Boundary: qualification remains fail-closed and core-backed; filename filtering is only an intake prefilter, not semantic authority.

- operator-panel-interaction-wiring
  - Transfer Kind: work-and-responsibility
  - Description: reproduce and repair the observed Tiinex Operator sidebar state where visible controls render but clicks do not execute the expected commands. Verify Validate/recovery, Create Handoff, Build Package, Choose Inbox, Open Tiinex Settings, and discovery candidate actions through the actual packaged VSIX/runtime path.
  - Boundary: retain the current Activity Bar/sidebar information architecture unless a minimal host fix requires structural adjustment. Do not replace the native surface with manual tasks or terminal commands.

- focused-regression-and-vsix
  - Transfer Kind: work
  - Description: add focused regressions for historical-inbox suppression, post-start candidate detection, explicit manual old-carrier discovery if retained, candidate filtering, and command wiring; rebuild an installable VSIX for Anchor/Sigma qualification.
  - Boundary: preserve prior validation/Quick Fix correctness work and all no-implicit-mutation safety rules.

## Required Context

- fourth-dogfood-feedback
  - Material: Sigma's accepted fourth-dogfood watcher/panel feedback.
  - Material Reference: [Fourth Dogfood Feedback](023-3-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-sigma-major-012-fourth-dogfood-watcher-panel-feedback.trace.md)
  - Purpose: exact actual-path blocker observations and revised automatic-discovery boundary.
  - Availability: available

- fourth-dogfood-handoff
  - Material: Anchor-to-Sigma Handoff defining the 0.1.3 dogfood boundary.
  - Material Reference: [Fourth Dogfood Handoff](023-3-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-anchor-to-sigma-major-012-fourth-dogfood-handoff.trace.md)
  - Purpose: preserve the accepted technical/human observation boundary for the current candidate.
  - Availability: available

- current-vscode-source
  - Material: exact Tiinex/vscode 0.1.3 source carried by the qualified Major 012 correctness return.
  - Material Reference: [Tiinex VS Code Workspace](vscode::.topics/.workspaces/tiinex-vscode.workspace.md)
  - Purpose: primary implementation target for watcher policy and Operator command wiring.
  - Availability: available

- current-shared-core
  - Material: current Site shared core consumed by Tiinex/vscode.
  - Material Reference: [Tiinex Site Workspace](site::.topics/.workspaces/tiinex-site.workspace.md)
  - Purpose: shared qualification/intake mechanics where host-neutral support is actually required.
  - Availability: available

- controlling-major-task
  - Material: Major 012 — VS Code Human Operator Bridge.
  - Material Reference: [Major 012 Task](023-vscode-human-operator-bridge.task.trace.md)
  - Purpose: bounded Major purpose and human closure boundary.
  - Availability: available

## Reference Context

- prior-correctness-reconciliation
  - Material: Anchor reconciliation of Loom's 0.1.3 correctness tranche.
  - Material Reference: [Correctness Reconciliation](023-3-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-anchor-major-012-correctness-reconciliation-decision.trace.md)
  - Purpose: preserve the accepted diagnostics/Quick Fix correctness baseline while repairing only the new host defects.
  - Availability: available

## Retained Responsibilities

- architecture-and-human-acceptance
  - Retained By: Anchor
  - Retained By Reference: [Anchor Role](business::.topics/roles/001-1-1-anchor-major-planning-role.trace.md)
  - Responsibility: reconcile Loom's return, decide whether another VSIX dogfood is justified, and own Major 012 closure/landing/checkpoint sequencing.

- canonical-semantics
  - Retained By: Axiom
  - Responsibility: resolve only a concrete semantic contradiction if Loom discovers one; no semantic redesign is requested.

- human-observation
  - Retained By: Sigma
  - Responsibility: naturally dogfood the next qualified installable candidate; Sigma is not responsible for formal technical validation.

## Exclusions And Dependencies

- no-historical-auto-scan-by-default
  - Kind: excluded-scope
  - Description: do not restore automatic backlog scanning that notifies on every pre-existing carrier at extension startup. Historical discovery must be explicit/manual if retained.

- no-broad-operator-redesign
  - Kind: excluded-scope
  - Description: the current sidebar organization is sufficient for this tranche; fix interaction wiring rather than reopening UX architecture.

- no-implicit-mutation
  - Kind: excluded-scope
  - Description: discovery and panel repairs do not authorize automatic landing, branch changes, commit, push, or destructive repository mutation beyond already-declared confirmation policies.

- next-human-dogfood
  - Kind: unresolved-dependency
  - Description: Major 012 human closure remains dependent on Anchor qualification and another natural Sigma observation of the repaired VSIX.
  - Responsible Party Or Role: Anchor; Sigma

## Completion Expectation

- Signal Kind: result
- Signal Meaning: return one technically qualified Loom tranche where automatic inbox discovery ignores pre-start historical backlog, detects a newly arriving supported Handoff Package after the session boundary, exposes a bounded manual old-carrier path if retained, and every visible Tiinex Operator primary control is interactable in the packaged VSIX runtime; include focused regressions and an installable VSIX.
- Return To: Anchor
- Return To Reference: [Anchor Role](business::.topics/roles/001-1-1-anchor-major-planning-role.trace.md)

## Interpretation Limits

- Does Not Mean: older carriers become invalid, timestamps create semantic authority, VS Code becomes schema authority, or successful button wiring proves human acceptance.
- Must Not Be Used To Claim: universal platform certification, marketplace readiness, repository mutation permission, Handoff acceptance, or Major 012 closure before Anchor reconciles technical and human evidence.
- Authority Limits: Loom owns the bounded host implementation repair; Anchor owns architecture/closure; Axiom retains canonical semantic authority; Sigma supplies actual-path human evidence.
- Transport Limits: return transport should remain full-source and cold-start qualified; package delivery alone is not acceptance.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [023-3-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-sigma-major-012-fourth-dogfood-watcher-panel-feedback.trace.md](023-3-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-sigma-major-012-fourth-dogfood-watcher-panel-feedback.trace.md)
  - Value: HncUvwiFCpIr4CooRBYOBQm4y5xvYHQoMx5nNibaZp0

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: Zl-saXzROJjktrz-w-g0x_HKE77Es0dHNJe3lc3C-Ak