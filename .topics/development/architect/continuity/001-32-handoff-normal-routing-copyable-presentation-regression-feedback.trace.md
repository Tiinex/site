# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.feedback.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/core/feedback/tiinex.feedback.v1.schema.md)
  - Created At: 2026-08-24 09:42:00
  - Authors: Anchor
  - Why: Preserve Q's fresh actual-path observation that a Loom return carried the correct Tooling-derived normal routing text but rendered it as ordinary prose rather than the already-required adjacent copyable/fenced block, proving the Tooling 018 presentation signal is still too weak for reliable cold-start human transport.
  - Summary: Fresh Loom 014 returned the correct package and route text without a copyable code-block presentation, so normal human Handoff output remains operationally incomplete on the current host despite Tooling 018 mechanics being correct.
  - Status: draft/local

---

# Handoff normal routing copyable presentation regression feedback

## Observed Signal

- Q received the fresh Loom 014 return package and exact Tooling-derived routing content.
- The routing content was rendered as ordinary prose rather than an adjacent fenced/copyable code block.
- The response also included implementation-summary prose around the normal return, so the actual-path presentation was not the intentionally boring one-carrier-plus-copyable-routing fast path.
- The returned package itself independently reprojects `humanOutput.normalInlineRouting.content` correctly; the failure is presentation/completion signaling, not route truth or carrier qualification.

## Source

- Source: Q screenshot and actual-path observation of the fresh Loom 014 return on 2026-08-24, plus independent package-local carrier-output replay.

## Feedback Target

- Target: normal human-facing Role-to-Role Handoff presentation on the current chat host, specifically the copyable presentation surface for exact Tooling-derived routing and the no-extra-normal-narrative completion boundary.

## Feedback Received

- The correct routing bytes were present but rendered as ordinary prose rather than a fenced/copyable block, and implementation-summary prose surrounded the normal return.
- Q expects the established fast path to remain one obvious primary carrier plus one directly copyable minimal routing block.

## Interpretation

- Tooling 018 successfully made the routing bytes available but did not make the required current-host copyable presentation sufficiently deterministic for a fresh Role.
- Existing feedback `001-16-1-handoff-human-output-copyable-transport-block-feedback.trace.md` already records the current-host invariant as an adjacent fenced/copyable code block.
- The normal routing content must remain exact disposable Tooling output. Markdown fences or equivalent host presentation wrappers must not become canonical Handoff/package semantics.
- This is a cold-start actual-path regression and therefore must not be coached away in the same Loom session or treated as a qualification PASS.

## Desired Correction

- Preserve one sole primary Handoff carrier.
- Preserve exact `humanOutput.normalInlineRouting.content` bytes.
- Add an explicit adapter/host-presentation contract that says the content requires a copyable surface; on chat hosts with fenced code blocks, render it as a fenced code block.
- Make normal Handoff completion explicitly exclude extra semantic work-summary prose, structured `humanOutput` JSON, helper artifacts, or a duplicate manual route reconstruction unless the user asks for additional explanation.
- Keep fallback sidecar behavior non-normal and unchanged.

## Source

- Q screenshot and actual-path observation of the fresh Loom 014 return on 2026-08-24.
- Independent package-local `project-handoff-carrier-output` replay against `tiinex-site-014-loom-to-anchor.handoff-package.zip` returned a ready single primary package and the exact expected normal inline routing content.
- Existing Tooling 018 acceptance and copyable transport feedback remain the governing prior evidence.

## Disposition

- State: accepted-for-dogfood
- Follow-Up: open a bounded Tooling correction that strengthens normal human presentation metadata/bootstrap guidance without changing the routing text or canonical Handoff semantics.
- Acceptance Effect: Loom 014 is not a clean actual-path human-output qualification run; the Tooling 019/020 implementation may still be reviewed independently on its own evidence.

## Limits

- This feedback does not make Markdown fences semantic authority.
- It does not invalidate the Loom 014 package, route, Required Context closure, or implementation evidence.
- It does not require a second normal transport attachment.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: dEVkClTxkK9Cp1qyab8OjXHRyfhB0jyMcoN1Ar8SsuQ