# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-06 20:26:47
  - Trace: [023-3-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-anchor-to-sigma-major-012-third-dogfood-handoff.trace.md](023-3-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-anchor-to-sigma-major-012-third-dogfood-handoff.trace.md)
  - Origin:
    - [relative](023-3-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-anchor-to-sigma-major-012-third-dogfood-handoff.trace.md)
- Current
  - Current Schema: [tiinex.feedback.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/feedback/tiinex.feedback.v1.schema.md)
  - Created At: 2026-09-06 20:51:16
  - Authors: Anchor
  - Why: Preserve the third actual-path operator feedback durably before another bounded Loom correctness repair.
  - Summary: Sigma's third dogfood confirms native diagnostics now run automatically, but false/implausible validation results, line-1 location fallback, absent hygiene Quick Fixes, stale-editor warnings, and missed existing inbox carriers still block human acceptance.
  - Status: ready/local

---

# Major 012 VS Code Sigma Third Dogfood — Native Correctness Feedback

## Observed Signal

- Sigma did not commit or push the 0.1.2 dogfood candidate; no remote landing, publication, or human acceptance should be inferred.
- The 0.1.2 candidate is materially closer to the intended operator experience: the Tiinex Activity Bar/sidebar entry is visible and ordinary VS Code Problems diagnostics are being populated automatically without a manual Validate command.
- Human acceptance still fails because the visible diagnostics are not yet trustworthy enough to use for maintenance. In the observed multi-root workspace, ordinary Business/root and schema material receives large groups of missing inherited/party-section findings that appear inconsistent with the artifacts being viewed. The next repair must verify exact schema authority/version selection and inherited contract application before treating those findings as user-facing truth.
- VS Code must not validate an artifact merely against an arbitrary current module sharing the same schema id when the artifact or qualified workspace supplies a more exact schema authority/ref. Ambiguous, stale, or unresolved schema authority must fail visibly rather than project confident false diagnostics.
- Diagnostic location fidelity is insufficient. Many findings are surfaced as `location unresolved by shared validator` and end up at line 1/column 1. When the missing fact has no literal source line, the adapter/shared projection should anchor the finding to the nearest qualified owning section, field, schema declaration, envelope declaration, or footer region that a human can inspect and where a deterministic Code Action can act.
- Quick Fix acceptance is still not met. The observed view reports zero deterministic Quick Fixes while many diagnostics are present. Envelope/footer hygiene remains the highest-value maintenance case: where shared core can deterministically repair envelope/footer/reference/integrity bytes, VS Code should expose the normal lightbulb/Quick Fix on the anchored diagnostic without a separate Tiinex command.
- Handoff Package discovery is still not visibly completing the expected flow. The Tiinex view can report a watching state, but Sigma did not observe a reliable native Preview/Land/Ignore notification for existing carrier files in the configured Downloads/inbox path.
- Discovery must perform an initial bounded inbox scan when the extension activates, when discovery is enabled, and when the configured inbox changes, in addition to watching future filesystem events. A carrier that already exists before the watcher starts must not be silently missed.
- Candidate discovery state must remain fail-visible: disabled, watching, candidate found, invalid/unqualified, awaiting confirmation, landed, ignored, and blocked should not collapse into the same passive state.
- The Extension Host output shows repeated closed/disposed TextEditor warnings during the observed editing flow. Debounced/in-memory validation work must be generation-guarded and cancelled or ignored safely when the editor/document closes or is replaced; stale editor state must not leak warnings or apply diagnostics/fixes to the wrong document.
- `Tiinex/ai-provenance` remains useful as reference-only evidence for proven VS Code DiagnosticCollection, CodeAction, document-event, cancellation, and editor-lifecycle mechanics. Current Site/shared core remains the semantic authority for validator choice, exact schema resolution, findings, severity, location evidence, and deterministic repair bytes.

## Source

- Source: Sigma third actual-path dogfood of Tiinex VS Code 0.1.2 in the real multi-root operator workspace, including a silent screen recording and direct follow-up observations.

## Interpretation

- Interpretation: Major 012 remains open. 0.1.2 is a meaningful native-plumbing advance but is not yet usable enough for human maintenance because correctness and location fidelity of validation output are not sufficiently trustworthy.
- Interpretation: the next repair is narrower than the prior UX rounds. The primary remaining work is shared-core/host-adapter correctness: exact schema authority and inheritance resolution, diagnostic anchoring, deterministic hygiene Quick Fix exposure, stale-editor cancellation, and reliable discovery initial-scan/notification behavior.
- Interpretation: the Activity Bar/sidebar and automatic Problems integration should be retained; this feedback does not request another broad operator-surface redesign.

## Feedback Target

- Target: the installable Tiinex VS Code 0.1.2 Major 012 third-dogfood candidate and its shared-core-backed validation/discovery adapters.

## Feedback Received

- Keep validation automatic and native; fix the correctness of what is surfaced rather than adding another button or command.
- Resolve the exact qualified schema authority/version/inheritance path before projecting diagnostics.
- Anchor findings to meaningful source regions instead of line 1 when exact literal locations are unavailable.
- Expose deterministic envelope/footer hygiene as ordinary VS Code Quick Fixes where shared core supports exact repair.
- Make Handoff Package discovery scan already-present inbox files and reliably produce the native Preview/Land/Ignore flow.
- Cancel stale debounced editor work cleanly when documents/editors close.

## Disposition

- State: accepted-actionable
- Major Disposition: Major 012 remains open; 0.1.2 is not a human-accepted landing candidate.
- Follow-Up: return one bounded Loom correctness tranche over current Site shared core and Tiinex/vscode. Preserve the now-working native entry/automatic diagnostics UX while repairing authority resolution, diagnostic location, deterministic Code Actions, discovery initial scan, and editor lifecycle safety.
- Acceptance Boundary: the next Sigma dogfood should be able to trust that visible diagnostics correspond to the artifact's qualified schema authority, see useful line/section anchors and hygiene Quick Fixes, and observe a carrier already present in the configured inbox without manually retriggering discovery.

## Limits

- This feedback is human actual-path evidence, not canonical schema authority or universal platform certification.
- The observed Windows/VS Code host is an operator environment, not a new normative acceptance host.
- Apparent false diagnostics are a blocker-level correctness signal that must be investigated against exact qualified authority; this feedback does not itself redefine schema semantics or declare which validator implementation is canonically wrong.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [023-3-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-anchor-to-sigma-major-012-third-dogfood-handoff.trace.md](023-3-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-anchor-to-sigma-major-012-third-dogfood-handoff.trace.md)
  - Value: nPhonn7G4t5oL2nYuS1O0-LlRBeB4omvnL0xvZoz4IE

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: 7d5mBn60DMJjqRTy2TUfQM7oNtQwZFvB2eYmT4ygH_Y