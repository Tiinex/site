# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.discovery.v1](https://github.com/Tiinex/docs/blob/a83baecea45c5863254397b9d84c6004b58d07ee/.topics/.schemas/discovery/tiinex.discovery.v1.schema.md)
  - Created At: 2026-09-06 11:22:00
  - Trace: [023-1-anchor-major-012-vscode-operator-current-state-discovery.trace.md](023-1-anchor-major-012-vscode-operator-current-state-discovery.trace.md)
  - Origin:
    - [relative](023-1-anchor-major-012-vscode-operator-current-state-discovery.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/a83baecea45c5863254397b9d84c6004b58d07ee/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-06 11:23:00
  - Authors: Anchor
  - Why: The bounded current-state discovery shows current semantics are sufficient and the next work is a cross-repository implementation tranche owned by Loom.
  - Summary: Implement the first thin Tiinex VS Code operator bridge over package/bootstrap Handoff ingress and existing Tiinex Git commit-message logic, with no semantic fork or automatic landing publication.
  - Status: ready/local

---

# Major 012 VS Code Human Operator Bridge — Anchor To Loom

## Handoff Parties

- Purpose: implement and qualify the smallest useful `Tiinex/vscode` extension plus any strictly necessary shared Site Tooling seam so human Handoff ingress/landing and Git commit workflow use the same Tiinex core semantics as CLI/LLM paths.
- From: Anchor
- From Kind: role
- From Reference: [Anchor Major Planning Role](business::.topics/roles/001-1-1-anchor-major-planning-role.trace.md)
- To: Loom
- To Kind: role
- To Reference: [Loom Role](business::.topics/roles/001-3-loom-role.trace.md)

## Transfers

- vscode-thin-operator-bridge
  - Transfer Kind: work-and-responsibility
  - Description: bootstrap `Tiinex/vscode` as a minimal VS Code extension and implement the exact Major 012 Done Criteria for opt-in Handoff inbox/landing plus native Tiinex commit-message and explicit stage/commit/push UX.
  - Controlling Artifact: [Major 012 Task](023-vscode-human-operator-bridge.task.trace.md)
  - Boundary: VS Code is a host adapter, not a second Tiinex semantic core.

- shared-core-seam-only-if-required
  - Transfer Kind: work-and-responsibility
  - Description: if package qualification or deterministic landing-plan projection lacks one reusable portable seam, implement the smallest adapter-neutral Site Tooling operation and regression coverage needed by CLI/LLM/Viewer/VS Code alike; do not duplicate that logic inside the extension.
  - Boundary: no schema meaning change is authorized. Return a concrete contradiction to Anchor/Axiom rather than inventing semantics.

## Required Context

- controlling-major-task
  - Material: `023-vscode-human-operator-bridge.task.trace.md`
  - Material Reference: [Major 012 Task](023-vscode-human-operator-bridge.task.trace.md)
  - Purpose: exact scope, done criteria, safety boundaries, and utility intent
  - Availability: available

- anchor-current-state-discovery
  - Material: `023-1-anchor-major-012-vscode-operator-current-state-discovery.trace.md`
  - Material Reference: [Anchor Discovery](023-1-anchor-major-012-vscode-operator-current-state-discovery.trace.md)
  - Purpose: current architecture/ownership disposition and implementation sequence
  - Availability: available

- new-vscode-workspace
  - Material: `vscode::.topics/.workspaces/tiinex-vscode.workspace.md`
  - Material Reference: [Tiinex VS Code Workspace](vscode::.topics/.workspaces/tiinex-vscode.workspace.md)
  - Purpose: exact new repository Workspace target and source identity
  - Availability: available

- current-site-tooling
  - Material: `../.workspaces/tiinex-site.workspace.md` plus Site portable Handoff/bootstrap/tooling and `tools/tiinex-commit-message.mjs` in the carried Site Workspace
  - Material Reference: [Site Workspace](../.workspaces/tiinex-site.workspace.md)
  - Purpose: shared core behavior the extension must invoke rather than fork
  - Availability: available

## Reference Context

- old-provenance-extension
  - Material: `Tiinex/ai-provenance` current VS Code extension
  - Material Reference: [Tiinex ai-provenance VS Code extension](https://github.com/Tiinex/ai-provenance/tree/master/ides/vscode)
  - Purpose: optional host-integration pattern reference only; do not migrate the broad feature set in this tranche
  - Availability: available

- major-011-closure
  - Material: `022-8-anchor-major-011-durable-closure-decision.trace.md`
  - Material Reference: [Major 011 Closure](022-8-anchor-major-011-durable-closure-decision.trace.md)
  - Purpose: establishes the segment boundary before this utility insertion
  - Availability: available

## Retained Responsibilities

- architecture-and-major-closure
  - Retained By: Anchor
  - Responsibility: review core-vs-host boundaries, qualify the returned tranche, decide Sigma dogfood boundary, and close/reforecast Major 012.

- semantic-contradiction
  - Retained By: Axiom
  - Responsibility: only if Loom finds a genuine canonical semantic contradiction; no routine Axiom turn is requested.

- human-ux-observation
  - Retained By: Sigma
  - Responsibility: after a technically qualified VSIX exists, perform bounded human operator observation and report friction/blind spots; no implementation or semantic acceptance authority is implied.

## Exclusions And Dependencies

- no-provenance-migration
  - Kind: excluded-scope
  - Description: do not migrate or rewrite the old ai-provenance extension feature set in this Major.

- no-automatic-publication
  - Kind: excluded-scope
  - Description: Handoff landing never commits or pushes. Stage/commit/push exists only as a separate explicit user command.

- no-semantic-fork
  - Kind: excluded-scope
  - Description: do not implement independent Handoff/package/Workspace or commit-message meaning in VS Code when shared Tooling already owns it.

- no-dirty-tree-mutation
  - Kind: excluded-scope
  - Description: do not auto-stash, auto-merge, or overwrite tracked/non-ignored local modifications.

- no-windows-gate
  - Kind: excluded-scope
  - Description: platform-neutral implementation is required, but Sigma's Windows host is observation evidence rather than normative acceptance.

- later-work-deferred
  - Kind: excluded-scope
  - Description: Viewer/schema parity, Playthings harvesting, destructive apply, Pages/deployment/release, broad schema scaling, Foundation exit, and old-extension consolidation remain later work.

## Completion Expectation

- Signal Kind: result
- Signal Meaning: return one qualified full-source Loom-to-Anchor Handoff containing the Site and new VS Code implementation, permanent automated regressions, build/typecheck/test receipts, installable local VSIX or deterministic VSIX build output, and explicit remaining host/UX limits. No GitHub publication or Sigma acceptance is required for the Loom return.
- Return To: Anchor
- Return To Reference: [Anchor Major Planning Role](business::.topics/roles/001-1-1-anchor-major-planning-role.trace.md)

## Interpretation Limits

- Does Not Mean: VS Code becomes semantic authority, a detected package may be trusted before Tiinex qualification, local landing equals acceptance, human confirmation equals project approval, a commit helper may publish automatically after landing, or old provenance behavior is part of this tranche.
- Must Not Be Used To Claim: Viewer parity, release readiness, destructive apply authority, Foundation exit, broad editor/platform support, or migration completion.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [023-1-anchor-major-012-vscode-operator-current-state-discovery.trace.md](023-1-anchor-major-012-vscode-operator-current-state-discovery.trace.md)
  - Value: Kzp9iqV9h2dj4XPUqnyNBJaO9pxIEh9i3vGY3rmXZd8

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:zC-F1VWv8OKlD1m_bZeXbRyZeDosfugQP2xcljT8tUE
