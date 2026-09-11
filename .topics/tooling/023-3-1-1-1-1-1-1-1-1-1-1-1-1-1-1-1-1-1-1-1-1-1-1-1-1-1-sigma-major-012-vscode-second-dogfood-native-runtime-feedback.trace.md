# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-06 19:02:49
  - Trace: [023-3-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-anchor-to-sigma-major-012-vscode-second-dogfood-handoff.trace.md](023-3-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-anchor-to-sigma-major-012-vscode-second-dogfood-handoff.trace.md)
  - Origin:
    - [relative](023-3-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-anchor-to-sigma-major-012-vscode-second-dogfood-handoff.trace.md)
- Current
  - Current Schema: [tiinex.feedback.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/feedback/tiinex.feedback.v1.schema.md)
  - Created At: 2026-09-06 19:30:30
  - Authors: Anchor
  - Why: Preserve the second actual-path operator feedback durably before another bounded Loom repair.
  - Summary: Sigma's second dogfood confirms the VS Code bridge still needs automatic native diagnostics, default-heavy authoring, package auto-load, and visible Handoff discovery before human acceptance.
  - Status: ready/local

---

# Major 012 VS Code Sigma Second Dogfood — Native Runtime UX Feedback

## Observed Signal

- Sigma did not commit or push the 0.1.1 dogfood candidate; no remote landing, publication, or human acceptance should be inferred.
- The intended linting/validation/Quick Fix experience was still not observable as a native VS Code language/editor surface. Sigma expected VS Code to invoke shared Tiinex validation automatically and surface ordinary editor squiggles, Problems entries, warnings/errors, and Code Actions without an intermediate command, refresh button, or explicit validation gesture.
- The current diagnostics adapter intentionally marks changed documents `dirty` and asks the user to save before exact validation. This is mechanically understandable for file-path validation but does not meet the accepted human operator expectation. The adapter should validate eligible in-memory document content on open and debounced change, requalify on save, and keep native diagnostics current without requiring a manual refresh action.
- The diagnostics/Quick Fix plumbing may reuse implementation lessons from `Tiinex/ai-provenance` as reference-only VS Code mechanics where useful, but semantic validator choice, severity, line location, and repair content must continue to come from current shared Tiinex core rather than provenance-specific logic.
- The persistent Operator view still exposed too much schema/boilerplate as mandatory form work. Sigma wants Handoff authoring to be biased toward the common lineage case: the selected Parent already defines most current work context, so a new Handoff should be creatable with minimal human input while advanced sections remain available.
- Preferred Handoff authoring presentation: all structurally safe/defaultable values are pre-filled; low-frequency/boilerplate sections are collapsed by default; defaults remain editable; `Required Context`, `Reference Context`, `Retained Responsibilities`, and `Exclusions And Dependencies` may begin as explicit `none` when no additional declaration is supplied; envelope, Parent/Origin, schema references, footer, and integrity are never manually authored.
- Default prefill must remain epistemically safe. It may use schema-defined defaults, the explicit selected Parent, explicit workspace/session preferences, and last-used operator values. It must not silently infer Role authority, acceptance, delegation, ownership, or recipient identity from repository layout or ambient prose.
- The Handoff Package builder did not produce a useful interaction in the observed path. Its route/workspace model should load automatically when the package section becomes active; the user should not have to discover and press a separate `Load qualified options` button before the primary controls become functional.
- Package building should remain conceptually simple: select a qualified Handoff leaf route or explicit `No Handoff pointer`, select included Workspaces, optionally expand advanced exclusions/details, review a concise preview, then manufacture through shared core.
- Handoff Package discovery also appeared inert. Sigma saw no clear notification, prompt, watcher state, or useful indication that the configured discovery path was active. The operator surface must make discovery state visible enough that disabled, watching, candidate-found, candidate-invalid, and landing-awaiting-confirmation cannot all look like "nothing happened".
- When automatic discovery is enabled and a qualified Handoff Package appears in the configured inbox, VS Code should produce a native notification/action surface that clearly identifies the carrier and offers the accepted bounded flow (for example Preview/Land/Ignore). Landing must retain the already accepted repository identity, clean-tree, branch-switch-or-abort, confirmation, `.git`/ignored-file preservation, and optional post-landing commit/push/open-Handoff policies.
- When discovery is disabled or the inbox is unresolved, the Tiinex view should say so explicitly and expose one direct action to configure/choose the inbox rather than silently doing nothing.
- The Tiinex Activity Bar / sidebar entry should be visible immediately after installation/activation. The user should not need Command Palette knowledge to discover the primary operator surface.

## Source

- Source: Sigma second actual-path dogfood of Tiinex VS Code 0.1.1 in a real multi-root VS Code workspace, including a silent screen recording and direct operator feedback.

## Interpretation

- Interpretation: Tiinex VS Code 0.1.1 remains technically useful as an implementation candidate but still fails the Major 012 human operator acceptance boundary.
- Interpretation: the next repair is not a new semantic architecture. It is a bounded native-UX/runtime adapter repair over already accepted shared core: automatic in-memory diagnostics, ordinary VS Code Code Actions, visible discovery state/notification flow, default-heavy collapsible Handoff authoring, and package model auto-load.
- Interpretation: buttons such as `Refresh validation` may remain as diagnostic/recovery affordances, but they must not be part of the normal correctness path.

## Feedback Target

- Target: the installable Tiinex VS Code 0.1.1 Major 012 second-dogfood candidate and the shared-core-backed human operator path.

## Feedback Received

- Native VS Code diagnostics should be automatic and runtime-driven rather than command-driven.
- Handoff authoring should minimize required input by deriving structure from the selected Parent and using editable defaults/collapsible advanced sections.
- Handoff Package building should auto-load its qualified route/workspace model when opened and should not appear inert behind an extra load step.
- Handoff Package discovery must visibly disclose watcher/inbox state and produce a native notification/action when a candidate is found.
- The Tiinex sidebar entry itself must be discoverable immediately.

## Disposition

- State: accepted-actionable
- Major Disposition: Major 012 remains open; 0.1.1 is not a human-accepted landing candidate.
- Follow-Up: return one bounded Loom adapter/UX tranche. Reuse the current shared core and inspect prior `ai-provenance` VS Code diagnostic mechanics only as implementation evidence where useful. Do not fork validator semantics into the VS Code repo.
- Acceptance Boundary: Sigma should not be asked to run a formal matrix or manually refresh validation. The next dogfood must demonstrate ordinary editor-native diagnostics/Quick Fix behavior and a minimal obvious Handoff/Handoff-Package/discovery path through natural use.

## Limits

- This feedback is actual-path human observation, not canonical schema authority, marketplace acceptance, or universal platform certification.
- Windows and recording-host behavior describe the tested path only and do not become general Tiinex acceptance requirements.
- Prefill and convenience must never upgrade ambient context into semantic authority; shared core qualification remains the boundary.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [023-3-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-anchor-to-sigma-major-012-vscode-second-dogfood-handoff.trace.md](023-3-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-anchor-to-sigma-major-012-vscode-second-dogfood-handoff.trace.md)
  - Value: SqKRj8FsfUJETGgJWN-lJ5847eBd8Aqrm2lDzsP6C2I

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: iiRs52O9Fvlansb7MMthBQbt7F3aKb2PVDgzPK1qjxs