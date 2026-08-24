# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-24 09:46:00
  - Authors: Anchor
  - Why: Close the remaining cold-start human-output presentation gap exposed by fresh Loom 014: Tooling returns the exact routing bytes, but a fresh Role can still render them as plain prose rather than the required copyable block and surround the normal transport with avoidable semantic summary prose.
  - Summary: Tooling 023 — make normal Handoff return carry an explicit copyable-surface/no-extra-normal-narrative presentation contract while preserving exact routing content and non-authoritative host presentation.
  - Status: open/local

---

# Tooling 023 — normal Handoff routing copyable presentation closure

## Objective

Strengthen the portable normal-human-output contract so a cold-start Role does not improvise how to present `humanOutput.normalInlineRouting.content`. Preserve the exact raw routing bytes, but expose explicit adapter/host presentation metadata requiring a copyable surface and a boring one-primary-carrier-plus-routing normal completion. On chat hosts that support fenced code blocks, the bootstrap guidance must tell the Role to render the exact routing content in a fenced code block without editing it.

## Done Criteria

- Preserve `humanOutput.primary` as the sole normal file choice and `normalInlineRouting.content` as the exact package-derived routing bytes.
- Do not embed Markdown fences, host-specific markup, or UI syntax inside the routing `content`; the content remains a disposable host-neutral text projection with `authority: none`.
- Add explicit machine-readable presentation guidance to normal human output, with semantics equivalent to: copyable surface required; fenced code block preferred/required when supported by a chat host; exact content must be preserved; equivalent copyable host surfaces are allowed; presentation wrapper carries no semantic authority.
- Add an explicit normal-emission boundary that the normal Handoff return consists only of the sole primary carrier plus the adjacent exact routing copy surface. Internal `humanOutput` JSON, helper artifacts, semantic work-summary prose, manually reconstructed routing, and duplicate normal file/download choices are not normal emission unless the user explicitly asks for explanation or review evidence.
- Update portable bootstrap/help so a cold consumer can execute the presentation rule without predecessor-chat memory. Keep wording host-capability based rather than making ChatGPT or Markdown canonical semantics.
- Preserve fallback transport sidecar as optional/non-normal and preserve shared-route selection-required fail-closed behavior.
- Add focused regression coverage for the new presentation metadata and bootstrap/help wording, plus Tooling 018 human-output, carrier projection, manufacturing, Pointer/orientation, and context-audit regressions as directly affected.
- Demonstrate read-only `project-handoff-carrier-output` and manufacture output expose the same presentation contract for the same selected route.
- Return one normal recipient-relative Handoff package using the corrected contract. Do not self-qualify Loom from the implementing session.

## Scope

Human-output projection metadata, bootstrap/help completion wording, focused regressions, manufacture/read-only projection parity, and exact routing-content preservation.

Out of scope: canonical Handoff/Pointer/Workspace semantics, transport text authority, a second normal attachment, Viewer UI, generic ChatGPT formatting policy, package performance optimization, lineage repair application, publication, or remote writes.

## Dependencies

- [Fresh copyable presentation regression](../../architect/continuity/001-32-handoff-normal-routing-copyable-presentation-regression-feedback.trace.md)
- [Tooling 018 Anchor acceptance](018-1-handoff-human-output-normal-emission-anchor-acceptance.trace.md)
- [Original copyable transport block feedback](../../architect/continuity/001-16-1-handoff-human-output-copyable-transport-block-feedback.trace.md)

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: Aw4Gk-mGtKafkwyCxt7VpaNXZ3-UJFkfv-0OaJkH2pc