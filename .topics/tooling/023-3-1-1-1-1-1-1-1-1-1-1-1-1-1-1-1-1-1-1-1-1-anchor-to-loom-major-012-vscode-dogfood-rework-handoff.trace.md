# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.feedback.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/feedback/tiinex.feedback.v1.schema.md)
  - Created At: 2026-09-06 18:07:02
  - Trace: [023-3-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-sigma-major-012-vscode-dogfood-feedback.trace.md](023-3-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-sigma-major-012-vscode-dogfood-feedback.trace.md)
  - Origin:
    - [relative](023-3-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-sigma-major-012-vscode-dogfood-feedback.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-06 18:08:40
  - Authors: Anchor
  - Why: The first installable candidate was technically qualified but failed the human operator acceptance boundary; preserve the actual-path findings and repair the UI without moving Tiinex semantics into VS Code.
  - Summary: Route Sigma's first VS Code dogfood blockers into one bounded artifact-first, native, multi-root-safe operator rework before the next human dogfood.
  - Status: ready/local

---

# Major 012 Human Operator Dogfood Rework — Anchor To Loom

## Handoff Parties

- Purpose: repair the bounded Tiinex VS Code operator bridge against Sigma's first real dogfood evidence without moving Tiinex semantics into VS Code or broadening Major 012 into a general IDE product.
- From: Anchor
- From Kind: role
- From Reference: [Anchor Role](business::.topics/roles/001-1-1-anchor-major-planning-role.trace.md)
- To: Loom
- To Kind: role
- To Reference: [Loom Role](business::.topics/roles/001-3-loom-role.trace.md)

## Transfers

- native-diagnostics-and-hygiene
  - Transfer Kind: work-and-responsibility
  - Description: make Tiinex validation visibly native and automatic for supported artifacts, with exact line/range diagnostics in Problems/editor and deterministic Quick Fixes for the accepted envelope/footer hygiene surface.
  - Boundary: consume shared validator/repair semantics; VS Code must not own substitute validation or checksum meaning.

- artifact-first-authoring-ux
  - Transfer Kind: work-and-responsibility
  - Description: add artifact-context commands so a selected qualified artifact can expose only supported Tiinex transitions. `Create Handoff` invoked from an artifact must bind that artifact as the new Handoff continuity Parent and then collect only the remaining Handoff creation inputs.
  - Boundary: supported transitions come from shared/core-qualified capability; filename, UI placement, and context-menu presence do not create semantic authority.

- package-builder-separation
  - Transfer Kind: work-and-responsibility
  - Description: separate Handoff artifact Parent selection from Handoff Package route selection. Package construction must present qualified Handoff leaves plus explicit `No Handoff pointer`, workspace inclusion/exclusion, and a clear preview before manufacture.
  - Boundary: use the accepted canonical handoff-carrier/workspace-carrier semantics and the shared manufacture path; do not invent a VS Code-only package format.

- multi-root-repository-repair
  - Transfer Kind: work-and-responsibility
  - Description: repair repository/workspace matching so a valid VS Code multi-root workspace resolves each carried Tiinex Workspace to its own Git root instead of failing with `tiinex.git.root-mismatch` because another root is active or selected.
  - Boundary: exact repository/workspace identity must still fail closed on ambiguous or contradictory matches.

- persistent-native-flow
  - Transfer Kind: work-and-responsibility
  - Description: reduce long chains of transient Command Palette/Quick Input prompts. Use a compact persistent native Tiinex view, panel, or editor-like form for multi-field Handoff authoring and package construction; retain Command Palette commands as discoverable escape hatches rather than the primary workflow.
  - Boundary: keep the extension thin; shared core owns authoring, qualification, manufacture, commit-message derivation, and semantic decisions.

- operator-surface-hygiene
  - Transfer Kind: work-and-responsibility
  - Description: ensure the new extension does not require task-driven operator paths and remove or reconcile any Major-012-owned VS Code task/problem-matcher configuration that pollutes the intended Problems experience when it is no longer needed.
  - Boundary: do not broadly rewrite unrelated developer tasks unless they directly conflict with the accepted operator bridge.

## Required Context

- sigma-dogfood-feedback
  - Material: `.topics/tooling/023-3-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-sigma-major-012-vscode-dogfood-feedback.trace.md`
  - Material Reference: [Sigma Dogfood Feedback](023-3-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-sigma-major-012-vscode-dogfood-feedback.trace.md)
  - Purpose: preserves the exact human actual-path findings and accepted rework direction.
  - Availability: available

- prior-dogfood-handoff
  - Material: `.topics/tooling/023-3-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-anchor-to-sigma-major-012-vscode-dogfood-handoff.trace.md`
  - Material Reference: [Anchor To Sigma Dogfood](023-3-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-anchor-to-sigma-major-012-vscode-dogfood-handoff.trace.md)
  - Purpose: preserves the candidate and human acceptance boundary that this rework continues.
  - Availability: available

- canonical-pointerless-carrier-authority
  - Material: `docs::.topics/.schemas/coordination/handoff/package/tiinex.handoff.package.v1.schema.md`
  - Material Reference: [Handoff Package](docs::.topics/.schemas/coordination/handoff/package/tiinex.handoff.package.v1.schema.md)
  - Purpose: canonical package mode/route semantics, including the accepted workspace-carrier no-Handoff route.
  - Availability: available

- shared-site-core-candidate
  - Material: `site::.topics/.workspaces/tiinex-site.workspace.md`
  - Material Reference: [Tiinex Site Workspace](site::.topics/.workspaces/tiinex-site.workspace.md)
  - Purpose: reuse the already-qualified shared authoring/manufacture/operator core rather than rebuilding semantics in the host adapter.
  - Availability: available

- vscode-host-candidate
  - Material: `vscode::.topics/.workspaces/tiinex-vscode.workspace.md`
  - Material Reference: [Tiinex VS Code Workspace](vscode::.topics/.workspaces/tiinex-vscode.workspace.md)
  - Purpose: continue the already-qualified native VS Code host surface as the bounded UI adapter for this rework.
  - Availability: available

## Reference Context

- sigma-generated-handoff-example
  - Material: human-created dogfood Handoff example from the first VSIX run
  - Purpose: demonstrates the current authoring interaction and the need to make continuity Parent selection artifact-first and unambiguous.
  - Availability: unresolved

## Retained Responsibilities

- architecture-and-major-acceptance
  - Retained By: Anchor
  - Responsibility: reconcile the returned implementation and decide whether the next VSIX is ready for another Sigma dogfood.

- canonical-semantics
  - Retained By: Axiom
  - Responsibility: resolve only a concrete semantic contradiction discovered during implementation; no new semantic work is requested by this Handoff.

- human-dogfood
  - Retained By: Sigma
  - Responsibility: naturally exercise the next installable candidate and report actual-path friction; no formal test matrix or technical acceptance is delegated.

## Exclusions And Dependencies

- no-general-artifact-studio
  - Kind: excluded-scope
  - Description: do not expand this rework into a complete generic editor for every Tiinex schema.

- no-viewer-replacement
  - Kind: excluded-scope
  - Description: VS Code remains a thin human operator interface to shared Tiinex core and does not replace Viewer semantics or presentation roadmap.

- no-windows-gate
  - Kind: excluded-scope
  - Description: reproduce the observed Windows/multi-root defect as needed, but do not turn Sigma's host into a universal Tiinex acceptance environment.

- no-auto-authority
  - Kind: excluded-scope
  - Description: context menus, selected files, open folders, Git roots, and UI defaults must not manufacture Parent, Role, Handoff, package-route, acceptance, or publication authority beyond explicit qualified core results.

## Completion Expectation

- Signal Kind: result
- Signal Meaning: return one qualified full-source candidate where native diagnostics/Quick Fixes are visible, Handoff authoring is artifact-first, package route selection is separate and clear, multi-root repository matching is repaired, and the long-form workflow is materially simpler for Sigma.
- Return To: Anchor
- Return To Reference: [Anchor Role](business::.topics/roles/001-1-1-anchor-major-planning-role.trace.md)

## Interpretation Limits

- Does Not Mean: the first VSIX was semantically invalid, Sigma rejected Tiinex generally, VS Code becomes semantic authority, or every operator feature must be completed in this rework.
- Must Not Be Used To Claim: human acceptance before the next dogfood, generalized Windows certification, permission to bypass core qualification, or permission to commit/push Sigma's repository state.
- Authority Limits: Loom owns the bounded shared/host implementation and qualification only; Anchor retains architecture/closure, Axiom retains canonical meaning, and Sigma remains human observation/feedback rather than implementation authority.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [023-3-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-sigma-major-012-vscode-dogfood-feedback.trace.md](023-3-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-sigma-major-012-vscode-dogfood-feedback.trace.md)
  - Value: G3JRfEtHQNziXNX3l-M0gA7RmrTwvBAY9Rddcc4nqCE

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: 0Cz2yBlAUZeancyFecdq2DsvtS4ahhf5i5ze3MOfg5M