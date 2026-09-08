# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.feedback.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/feedback/tiinex.feedback.v1.schema.md)
  - Created At: 2026-09-06 19:30:30
  - Trace: [023-3-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-sigma-major-012-vscode-second-dogfood-native-runtime-feedback.trace.md](023-3-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-sigma-major-012-vscode-second-dogfood-native-runtime-feedback.trace.md)
  - Origin:
    - [relative](023-3-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-sigma-major-012-vscode-second-dogfood-native-runtime-feedback.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-06 19:30:30
  - Authors: Anchor
  - Why: Sigma's second dogfood remains a human UX blocker even though the current shared-core-backed candidate is technically qualified.
  - Summary: Route one bounded Loom repair for automatic native diagnostics/Quick Fixes, simpler Parent-driven Handoff authoring, package-builder autoload, and observable Handoff discovery.
  - Status: ready/local

---

# Major 012 Native VS Code Runtime UX Repair — Anchor To Loom

## Handoff Parties

- Purpose: repair the remaining blocker-level native operator UX exposed by Sigma's second dogfood without reopening accepted Tiinex semantics or turning VS Code into a parallel implementation of core validation/authoring/package logic.
- From: Anchor
- From Kind: role
- From Reference: [Anchor Role](business::.topics/roles/001-1-1-anchor-major-planning-role.trace.md)
- To: Loom
- To Kind: role
- To Reference: [Loom Role](business::.topics/roles/001-3-loom-role.trace.md)

## Transfers

- automatic-native-diagnostics-and-code-actions
  - Transfer Kind: work-and-responsibility
  - Description: make eligible Tiinex artifacts participate in ordinary VS Code diagnostics automatically on open, debounced in-memory change, and save/requalification. Surface shared-core Error/Warning findings as native editor squiggles and Problems entries on the most precise qualified line and expose deterministic repairs as normal VS Code Quick Fix/Code Actions without requiring the user to press Refresh/Validate first.
  - Boundary: shared core continues to own validator selection, severity, line evidence, and repair bytes. The VS Code adapter may not invent findings or fixes. Manual refresh may remain only as a recovery/debug affordance, never the normal correctness path.

- diagnostic-plumbing-harvest
  - Transfer Kind: work
  - Description: inspect the historical/current `Tiinex/ai-provenance` VS Code implementation for useful proven VS Code DiagnosticCollection, event, CodeAction, Problems, and activation mechanics where access is available; reuse or reimplement only generic host plumbing that reduces risk and duplication.
  - Boundary: `ai-provenance` is implementation evidence only. Do not import provenance-specific semantic authority, runtime concepts, or stale architecture into current Tiinex core/VS Code semantics.

- default-heavy-handoff-authoring
  - Transfer Kind: work-and-responsibility
  - Description: simplify artifact-first Handoff authoring so right-clicking a qualified Parent and choosing the supported Handoff transition opens a persistent native Tiinex form with safe editable defaults and low-frequency sections collapsed. The common case should require minimal semantic input rather than exposing the full schema as mandatory UI.
  - Boundary: Parent remains the explicitly selected artifact. Core authors/seals envelope, Parent/Origin, schema references, body shape, footer, and c14n-v2 integrity. Defaults may come from schema-defined defaults, the explicit Parent, explicit session/workspace preferences, or last-used values; no Role/authority/acceptance/delegation inference from repository layout or ambient prose.

- package-builder-simplification-and-autoload
  - Transfer Kind: work-and-responsibility
  - Description: make the Handoff Package section immediately usable when opened: automatically load/refresh the qualified Handoff-leaf or `No Handoff pointer` choices and discovered Workspaces; present a compact default path with advanced details/exclusions collapsible; keep Handoff artifact Parent authoring separate from package route selection.
  - Boundary: package manufacture remains shared-core-owned and fail-closed. The UI must not synthesize a route, complete snapshot, exclusion, or carrier qualification unsupported by core.

- handoff-package-discovery-observability
  - Transfer Kind: work-and-responsibility
  - Description: make automatic/manual Handoff Package discovery visibly operational. Show whether discovery is disabled, which inbox/path is watched, whether the watcher is active, and the last meaningful candidate/error state. When auto discovery is enabled and a qualified candidate arrives, surface a native VS Code notification/action flow such as Preview/Land/Ignore and continue through the already accepted repository/branch/confirmation safety checks.
  - Boundary: non-destructive defaults remain unchanged. Discovery does not auto-land merely because a file appears. Invalid/unqualified candidates are reported without mutation. Landing retains clean-tree, exact repository match, branch mismatch switch-or-abort, `.git` and ignored-local preservation, explicit confirmation, and bounded optional commit/push/open-Handoff policies.

- always-discoverable-tiinex-entry
  - Transfer Kind: work
  - Description: ensure the Tiinex Activity Bar/sidebar entry is visible and recognizable immediately after extension installation/activation so the primary operator path does not depend on Command Palette knowledge.
  - Boundary: do not force-open intrusive views on every startup if VS Code conventions discourage it; the entry and current status must nevertheless be discoverable without a hidden command.

## Required Context

- sigma-second-dogfood-feedback
  - Material: Sigma's accepted second-dogfood native runtime UX feedback.
  - Material Reference: [Second Dogfood Feedback](023-3-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-sigma-major-012-vscode-second-dogfood-native-runtime-feedback.trace.md)
  - Purpose: exact human actual-path acceptance gaps and next UX boundary.
  - Availability: available

- second-dogfood-handoff
  - Material: the Anchor-to-Sigma Handoff that defined the 0.1.1 second dogfood boundary.
  - Material Reference: [Second Dogfood Handoff](023-3-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-anchor-to-sigma-major-012-vscode-second-dogfood-handoff.trace.md)
  - Purpose: preserve what Sigma was asked to observe and the retained role boundaries.
  - Availability: available

- current-vscode-source
  - Material: exact current Tiinex/vscode source returned and qualified in the 0.1.1 rework tranche.
  - Material Reference: [Tiinex VS Code Workspace](vscode::.topics/.workspaces/tiinex-vscode.workspace.md)
  - Purpose: implementation target, including current diagnostics and persistent operator/package surfaces.
  - Availability: available

- current-shared-core
  - Material: exact current Site shared core used by the VS Code adapter, including portable editor-assistance, authoring, package manufacture, grounding, and landing mechanics.
  - Material Reference: [Tiinex Site Workspace](.topics/.workspaces/tiinex-site.workspace.md)
  - Purpose: authoritative implementation source for validator selection, diagnostic projection, deterministic repair, authoring, package qualification, and landing semantics.
  - Availability: available

- controlling-major-task
  - Material: Major 012 — VS Code Human Operator Bridge.
  - Material Reference: [Major 012 Task](023-vscode-human-operator-bridge.task.trace.md)
  - Purpose: bounded Major purpose and closure boundary.
  - Availability: available

## Reference Context

- prior-first-dogfood-feedback
  - Material: Sigma's first dogfood feedback and artifact-first/multi-root rework basis.
  - Material Reference: [First Dogfood Feedback](023-3-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-sigma-major-012-vscode-dogfood-feedback.trace.md)
  - Purpose: avoid regressing already accepted artifact-first, Parent/route separation, persistent form, and multi-root corrections.
  - Availability: available

## Retained Responsibilities

- architecture-and-human-acceptance
  - Retained By: Anchor
  - Retained By Reference: [Anchor Role](business::.topics/roles/001-1-1-anchor-major-planning-role.trace.md)
  - Responsibility: reconcile Loom's return, build the next dogfood candidate, weigh Sigma observation, and decide Major 012 closure/landing/publication sequencing.

- canonical-semantics
  - Retained By: Axiom
  - Responsibility: resolve only a concrete semantic contradiction if Loom finds current core/Docs authority insufficient; do not reopen semantics merely to simplify UI.

- human-observation
  - Retained By: Sigma
  - Responsibility: naturally dogfood the next installable candidate and report actual-path friction; Sigma is not responsible for formal technical qualification or manual validation workarounds.

## Exclusions And Dependencies

- no-validator-fork
  - Kind: excluded-scope
  - Description: do not duplicate or reinterpret Tiinex validation/linting truth in VS Code. Native diagnostics are an adapter over shared core.

- no-provenance-architecture-import
  - Kind: excluded-scope
  - Description: `ai-provenance` may inform VS Code host plumbing only; do not migrate its historical product scope or semantic authority into Tiinex/vscode.

- no-schema-studio-expansion
  - Kind: excluded-scope
  - Description: do not broaden this repair into a general artifact studio or full schema editor. Handoff remains the bounded authoring PoC for Major 012.

- no-automatic-destructive-ingress
  - Kind: excluded-scope
  - Description: Handoff discovery remains opt-in/configurable and discovery alone never authorizes landing, commit, push, or branch mutation.

- next-human-dogfood
  - Kind: unresolved-dependency
  - Description: Major 012 human closure remains dependent on Sigma naturally observing the repaired VSIX after Loom technical qualification and Anchor reconciliation.
  - Responsible Party Or Role: Anchor; Sigma

## Completion Expectation

- Signal Kind: result
- Signal Meaning: return one technically qualified Loom tranche where ordinary VS Code open/change/save behavior automatically invokes shared Tiinex editor assistance, native diagnostics and deterministic Quick Fixes are observable without a manual validation command, Handoff authoring is default-heavy/collapsible and Parent-driven, package options auto-load, Handoff discovery state/notifications are visible, and the Tiinex sidebar entry is immediately discoverable; include an installable VSIX and exact focused/targeted regression evidence for Anchor reconciliation.
- Return To: Anchor
- Return To Reference: [Anchor Role](business::.topics/roles/001-1-1-anchor-major-planning-role.trace.md)

## Interpretation Limits

- Does Not Mean: VS Code becomes semantic authority, `ai-provenance` becomes current architecture authority, Sigma becomes a technical acceptance gate, or convenience defaults may infer missing authority.
- Must Not Be Used To Claim: universal platform certification, marketplace readiness, automatic Handoff acceptance, permission to mutate repositories without the accepted landing gates, or Major 012 closure before Anchor reconciles technical and human evidence.
- Authority Limits: Loom owns this bounded implementation tranche only; Anchor owns architecture/closure; Axiom owns semantic contradictions; Sigma supplies human actual-path evidence.
- Transport Limits: return transport must carry exact Business/Docs/Site/vscode context needed for cold Anchor reconciliation; package delivery does not itself prove human usability or publication readiness.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [023-3-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-sigma-major-012-vscode-second-dogfood-native-runtime-feedback.trace.md](023-3-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-sigma-major-012-vscode-second-dogfood-native-runtime-feedback.trace.md)
  - Value: iiRs52O9Fvlansb7MMthBQbt7F3aKb2PVDgzPK1qjxs

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: oXJYOPFWnIgiphBV4t-Y7-Zl_g9KXR8jUpkcirUMXVA