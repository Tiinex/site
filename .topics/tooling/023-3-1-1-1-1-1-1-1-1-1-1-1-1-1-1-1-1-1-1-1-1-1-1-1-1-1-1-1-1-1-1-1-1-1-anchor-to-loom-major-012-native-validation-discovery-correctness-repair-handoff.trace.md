# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.feedback.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/feedback/tiinex.feedback.v1.schema.md)
  - Created At: 2026-09-06 20:51:16
  - Trace: [023-3-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-sigma-major-012-vscode-third-dogfood-native-correctness-feedback.trace.md](023-3-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-sigma-major-012-vscode-third-dogfood-native-correctness-feedback.trace.md)
  - Origin:
    - [relative](023-3-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-sigma-major-012-vscode-third-dogfood-native-correctness-feedback.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-06 20:51:29
  - Authors: Anchor
  - Why: Sigma's third dogfood shows that automatic native diagnostics now run, but correctness and discovery reliability still block human acceptance.
  - Summary: Repair exact schema authority/inheritance validation, diagnostic location fidelity, deterministic hygiene Quick Fixes, stale editor lifecycle safety, and reliable initial-scan Handoff discovery while preserving the now-working native VS Code operator surface.
  - Status: ready/local

---

# Major 012 Native Validation And Discovery Correctness Repair — Anchor To Loom

## Handoff Parties

- Purpose: repair the remaining blocker-level correctness defects exposed by Sigma's third VS Code dogfood while preserving the now-working native Activity Bar and automatic Problems integration and keeping semantic truth in shared Tiinex core.
- From: Anchor
- From Kind: role
- From Reference: [Anchor Role](business::.topics/roles/001-1-1-anchor-major-planning-role.trace.md)
- To: Loom
- To Kind: role
- To Reference: [Loom Role](business::.topics/roles/001-3-loom-role.trace.md)

## Transfers

- exact-schema-authority-and-inheritance-resolution
  - Transfer Kind: work-and-responsibility
  - Description: reproduce the third-dogfood false/implausible diagnostic groups and repair the shared/adapter path so an artifact is validated against the exact qualified schema authority/ref and inherited contract applicable to that material. Preserve ambiguity/staleness as unresolved or blocked rather than selecting a convenient same-id schema implementation.
  - Boundary: Loom may repair shared mechanics and projections only. If exact current Docs authority is semantically insufficient or contradictory, return that concrete seam to Anchor/Axiom instead of inventing semantics in VS Code.

- diagnostic-location-fidelity
  - Transfer Kind: work-and-responsibility
  - Description: project the most precise qualified VS Code range available for each shared-core finding. When a required/missing declaration has no literal source line, deterministically anchor the diagnostic to the nearest owning section/field/schema/envelope/footer region rather than line 1/column 1, while preserving any explicit unresolved-location state in detail.
  - Boundary: host anchoring may improve presentation but must not fabricate evidence that shared core did not establish.

- deterministic-hygiene-code-actions
  - Transfer Kind: work-and-responsibility
  - Description: ensure exact shared-core repairs for envelope/footer/reference/integrity hygiene are exposed through ordinary VS Code Quick Fix/CodeAction mechanics on the corresponding diagnostics. Verify that the common maintenance cases produce a visible lightbulb and exact edit when deterministic repair is qualified.
  - Boundary: no heuristic rewrite or LLM-authored repair bytes. If core cannot deterministically repair a finding, no Quick Fix is preferable to an unsafe one.

- stale-editor-and-debounce-safety
  - Transfer Kind: work
  - Description: eliminate the observed closed/disposed TextEditor warnings by generation-guarding and cancelling/ignoring stale asynchronous validation/CodeAction work when documents or editors close, switch, or are superseded. Diagnostics must never be applied to the wrong document generation.
  - Boundary: keep automatic open/change/save validation; do not regress to save-only or command-driven validation as a workaround.

- discovery-initial-scan-and-native-notification
  - Transfer Kind: work-and-responsibility
  - Description: retain watcher-based Handoff Package discovery but add a bounded initial inbox scan on activation, discovery enablement, and inbox-path change so already-present carrier files are considered. For each new qualified candidate state, reliably surface the native Preview/Land/Ignore flow and update the visible Tiinex discovery status.
  - Boundary: discovery remains non-destructive and fail-closed. Existing repository identity, clean-tree, branch-switch-or-abort, confirmation, `.git`/ignored preservation, and optional post-landing policies remain unchanged.

- vscode-plumbing-reference-harvest
  - Transfer Kind: work
  - Description: inspect `Tiinex/ai-provenance` only where useful for robust DiagnosticCollection, CodeActionProvider, document event, cancellation, watcher, or notification lifecycle patterns and reimplement/reuse generic mechanics where appropriate.
  - Boundary: do not import provenance-specific semantic authority, product scope, or stale validator meaning. Site/shared core remains the Tiinex semantic/mechanical source of truth.

## Required Context

- sigma-third-dogfood-feedback
  - Material: Sigma's accepted third-dogfood correctness feedback.
  - Material Reference: [Third Dogfood Feedback](023-3-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-sigma-major-012-vscode-third-dogfood-native-correctness-feedback.trace.md)
  - Purpose: exact human actual-path blocker observations and next repair boundary.
  - Availability: available

- third-dogfood-handoff
  - Material: the Anchor-to-Sigma Handoff that defined the 0.1.2 dogfood boundary.
  - Material Reference: [Third Dogfood Handoff](023-3-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-anchor-to-sigma-major-012-third-dogfood-handoff.trace.md)
  - Purpose: preserve what Sigma was asked to observe and the retained role boundaries.
  - Availability: available

- current-vscode-source
  - Material: exact Tiinex/vscode 0.1.2 source returned in the qualified native-runtime repair tranche.
  - Material Reference: [Tiinex VS Code Workspace](vscode::.topics/.workspaces/tiinex-vscode.workspace.md)
  - Purpose: implementation target containing current diagnostics, CodeAction, operator, and inbox watcher adapters.
  - Availability: available

- current-shared-core
  - Material: exact current Site shared core consumed by VS Code for schema/validation/editor assistance, package qualification, and landing.
  - Material Reference: [Tiinex Site Workspace](site::.topics/.workspaces/tiinex-site.workspace.md)
  - Purpose: validator selection, authority resolution, findings, repair projection, package discovery/landing mechanics, and shared tests.
  - Availability: available

- controlling-major-task
  - Material: Major 012 — VS Code Human Operator Bridge.
  - Material Reference: [Major 012 Task](023-vscode-human-operator-bridge.task.trace.md)
  - Purpose: bounded Major purpose and human closure boundary.
  - Availability: available

## Reference Context

- prior-native-runtime-repair
  - Material: prior Loom native runtime UX repair and Anchor reconciliation.
  - Material Reference: [Native Runtime Repair Reconciliation](023-3-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-anchor-major-012-native-runtime-ux-repair-reconciliation-decision.trace.md)
  - Purpose: preserve the accepted Activity Bar, automatic diagnostics, authoring defaults, and discovery observability improvements while correcting the next layer.
  - Availability: available

## Retained Responsibilities

- architecture-and-human-acceptance
  - Retained By: Anchor
  - Retained By Reference: [Anchor Role](business::.topics/roles/001-1-1-anchor-major-planning-role.trace.md)
  - Responsibility: reconcile Loom's return, decide whether another VSIX dogfood is justified, and own Major 012 closure/landing/checkpoint sequencing.

- canonical-semantics
  - Retained By: Axiom
  - Responsibility: resolve only a concrete schema/method authority contradiction returned by Loom; no speculative semantic redesign is requested.

- human-observation
  - Retained By: Sigma
  - Responsibility: naturally dogfood the next installable candidate if Anchor qualifies it; Sigma is not responsible for formal technical validation or diagnosing implementation internals.

## Exclusions And Dependencies

- no-broad-ux-redesign
  - Kind: excluded-scope
  - Description: retain the working Activity Bar/sidebar and automatic native Problems path. This tranche is primarily correctness/lifecycle repair, not another operator-surface redesign.

- no-validator-fork
  - Kind: excluded-scope
  - Description: do not create VS Code-local Tiinex truth to make diagnostics look correct. Repair exact shared authority resolution or fail closed.

- no-provenance-semantic-import
  - Kind: excluded-scope
  - Description: ai-provenance is host-plumbing evidence only and must not become current Tiinex schema/validator authority.

- no-destructive-discovery
  - Kind: excluded-scope
  - Description: initial inbox scan and watcher events never authorize automatic landing, branch mutation, commit, or push.

- next-human-dogfood
  - Kind: unresolved-dependency
  - Description: Major 012 human closure remains dependent on Anchor qualification and Sigma observing the repaired installable path naturally.
  - Responsible Party Or Role: Anchor; Sigma

## Completion Expectation

- Signal Kind: result
- Signal Meaning: return one technically qualified Loom tranche where representative real artifacts validate against their exact qualified schema authority/inheritance without implausible false diagnostic groups, native diagnostics use useful deterministic source anchors, qualified envelope/footer hygiene repairs appear as normal VS Code Quick Fixes, stale editor/debounce work is safe, and Handoff Package discovery finds already-present inbox candidates and reliably offers Preview/Land/Ignore; preserve the accepted native operator UX and include an installable VSIX plus focused regression evidence.
- Return To: Anchor
- Return To Reference: [Anchor Role](business::.topics/roles/001-1-1-anchor-major-planning-role.trace.md)

## Interpretation Limits

- Does Not Mean: Sigma's observed artifacts redefine schema semantics, VS Code becomes semantic authority, ai-provenance becomes current architecture authority, or every diagnostic must have a Quick Fix.
- Must Not Be Used To Claim: universal platform certification, marketplace readiness, Handoff acceptance, repository mutation permission, or Major 012 closure before Anchor reconciles technical and human evidence.
- Authority Limits: Loom owns this bounded implementation/correctness tranche; Anchor owns architecture/closure; Axiom owns canonical semantic contradictions; Sigma supplies actual-path human evidence.
- Transport Limits: return transport must carry exact Business/Docs/Site/vscode context needed for cold Anchor reconciliation; package delivery alone is not human acceptance.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [023-3-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-sigma-major-012-vscode-third-dogfood-native-correctness-feedback.trace.md](023-3-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-sigma-major-012-vscode-third-dogfood-native-correctness-feedback.trace.md)
  - Value: 7d5mBn60DMJjqRTy2TUfQM7oNtQwZFvB2eYmT4ygH_Y

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: HR1m6dfTiJlYL8I5goPDw4xQagbr2_qAA6Vxr5jFNSs