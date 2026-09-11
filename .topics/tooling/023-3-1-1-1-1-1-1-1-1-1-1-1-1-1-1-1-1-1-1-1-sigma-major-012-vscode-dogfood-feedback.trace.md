# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-06 17:26:20
  - Trace: [023-3-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-anchor-to-sigma-major-012-vscode-dogfood-handoff.trace.md](023-3-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-anchor-to-sigma-major-012-vscode-dogfood-handoff.trace.md)
  - Origin:
    - [relative](023-3-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-anchor-to-sigma-major-012-vscode-dogfood-handoff.trace.md)
- Current
  - Current Schema: [tiinex.feedback.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/feedback/tiinex.feedback.v1.schema.md)
  - Created At: 2026-09-06 18:07:02
  - Authors: Anchor
  - Why: Preserve the human actual-path evidence before routing a bounded artifact-first UX and multi-root repair back to Loom.
  - Summary: Sigma's first native VS Code dogfood exposed blocker-level operator UX gaps despite a technically qualified implementation candidate.
  - Status: ready/local

---

# Major 012 VS Code Sigma Dogfood Feedback

## Observed Signal

- Sigma did not commit or push the dogfood candidate; no remote landing or acceptance should be inferred.
- Validator diagnostics and Quick Fixes did not work in a usable way. There was no obvious native place where Sigma could see or invoke the Tiinex validation/maintenance surface as intended.
- The overall workflow was too dependent on Command Palette and sequential transient inputs. It was difficult to discover, cumbersome to operate, and transient input UI can be obscured by host/recording overlays.
- The package-builder flow hit a concrete multi-root Git resolution failure: `tiinex.git.root-mismatch:C:\\Users\\micro\\Documents\\Repos\\Tiinex\\business` even though Business was one of the opened repository roots.
- Existing task/problem-matcher output polluted the Problems/Output surface, making the intended Tiinex diagnostic experience less legible; the native extension path must not depend on task-driven operator UX.
- The UI overloaded two different concepts under "Handoff parent": the continuity Parent of a newly authored Handoff artifact versus the authoritative Handoff selected as the Handoff Package route/pointer target.
- Sigma clarified the intended model: a Handoff artifact itself may have any qualified current leaf as its continuity Parent; a Handoff Package separately selects a qualified Handoff leaf as its route target, or explicitly selects no Handoff pointer for a workspace carrier.
- Preferred authoring UX: invoke Tiinex from the artifact itself. Right-clicking a file/leaf should expose only core-qualified supported transitions. Choosing `Create Handoff` from such a context should use that selected artifact as the Handoff Parent automatically, then ask only for Handoff-specific fields.
- Preferred package UX: keep package construction separate from artifact authoring. The builder should present Handoff leaf selection (plus `No Handoff pointer`) and workspace inclusion/exclusion as package-specific controls.
- Longer authoring/package forms should use a persistent native Tiinex view/panel or editor-like form rather than a long chain of ephemeral Quick Input prompts.

## Source

- Source: Sigma human dogfood in a Windows VS Code multi-root workspace, including a silent screen recording and one Handoff artifact created through the candidate UI.

## Interpretation

- Interpretation: the 0.1.0 VSIX is a technically qualified implementation candidate but fails the human operator acceptance boundary for Major 012.
- Interpretation: the accepted rework direction is artifact-first authoring, native diagnostics/Quick Fix visibility, explicit separation of Handoff Parent from package route selection, persistent forms for multi-field operations, and correct multi-root repository resolution.
- Interpretation: Sigma's Windows host is evidence for the tested path only and does not become a universal Tiinex acceptance environment.

## Feedback Target

- Target: the installable Tiinex VS Code 0.1.0 Major 012 dogfood candidate and the human operator flow transferred by the Anchor-to-Sigma dogfood Handoff.

## Feedback Received

- Validator diagnostics and Quick Fixes were not usable or discoverable enough for the intended native operator flow.
- Command Palette/Quick Input chains were too cumbersome as the primary workflow.
- Multi-root repository resolution failed on a valid opened Business repository root.
- Artifact continuity Parent selection and Handoff Package route selection must be separated.
- Artifact authoring should begin from the selected artifact/leaf and expose only supported core-qualified transitions.
- Package construction should use a persistent native form and independently select a Handoff leaf route or `No Handoff pointer` plus workspaces/exclusions.

## Disposition

- State: accepted-actionable
- Major Disposition: Major 012 remains open; the current VSIX is a qualified implementation candidate but fails the human operator acceptance boundary.
- Follow-Up: route one bounded Loom rework over the accepted shared core so the UI becomes artifact-first, multi-root-safe, and visibly native before the next Sigma dogfood.
- Acceptance Boundary: do not ask Sigma to commit/push or repeat formal technical validation. A new dogfood candidate should first make validation, Quick Fix, authoring, package construction, and repository targeting obvious and usable through native VS Code interaction.

## Limits

- This is human workflow/UX and actual-path evidence, not universal product acceptance or canonical schema authority.
- The recording is silent; observations are based on visible interaction plus Sigma's explicit explanation.
- Windows/VS Code host details are evidence about the tested operator path, not a new Windows acceptance requirement for Tiinex generally.
- The preferred context-menu model is an Anchor-accepted UX direction for this bounded operator bridge; shared core must still decide which transitions are semantically supported and fail closed when a transition cannot be qualified.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [023-3-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-anchor-to-sigma-major-012-vscode-dogfood-handoff.trace.md](023-3-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-anchor-to-sigma-major-012-vscode-dogfood-handoff.trace.md)
  - Value: 37MhAb9LR6yEvqs3yi-njpdD4bjxuspD5UQ2M8YmufU

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: G3JRfEtHQNziXNX3l-M0gA7RmrTwvBAY9Rddcc4nqCE