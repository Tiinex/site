# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-08-23 08:56:00
  - Trace: [Handoff package companion transport projection decision](001-9-2-handoff-package-companion-transport-projection-decision.trace.md)
  - Origin:
    - [relative](001-9-2-handoff-package-companion-transport-projection-decision.trace.md)
- Current
  - Current Schema: [tiinex.feedback.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/core/feedback/tiinex.feedback.v1.schema.md)
  - Created At: 2026-08-23 13:23:00
  - Authors: Anchor
  - Why: Preserve host-level transport constraints exposed by the first fresh Loom return so human carriage remains a single obvious action rather than a file-selection/debugging responsibility.
  - Summary: ChatGPT host attachment budget and lineage aging make one primary human-visible Handoff carrier plus early conversation rotation operational requirements for current dogfood.
  - Status: draft/local

---

# ChatGPT host transport budget and single-primary-deliverable feedback

## Feedback Target

- Target: Role-to-human-to-Role Handoff presentation, return-package manufacturing output, and conversation-rotation behavior on the current ChatGPT web host.
- Not Target: canonical Handoff transfer semantics, Role authority, source authority, or whether internal receipts/evidence artifacts should exist.

## Feedback Received

- Q reports a current ChatGPT host limit of approximately 60 attachments per three-hour window.
- The first fresh Loom Tooling 011 return surfaced the primary return Handoff ZIP plus updated-workspace ZIP, result JSON, workspace receipt JSON, durable result trace, return-Handoff trace, and other helper files into the host library. Because surfaced files become human-visible attachment choices, Q could not reliably tell which single file Anchor actually needed without asking.
- Q's desired safe path is one primary deliverable for normal Role return: the recipient-relative Handoff package. Verification receipts, result traces, workspace receipts, and other reconstruction material may remain inside the workspace/package or machine output, but should not normally become separate human transport decisions.
- Screenshots or other host/meta observations supplied by Q are optional evidence and must not become required transport material.
- Q also reports that long-lived ChatGPT conversation lineages degrade operationally as they are branched; the current hard workflow boundary is no more than one branch before rotation. Early branch 2 should trigger a cold-start successor Handoff plus a deliberate comparison against the retiring conversation for missing inference rather than continuing toward branch 3-4.
- Earlier host timing observations remain separate process-calibration evidence: queue/render overhead grows with conversation lineage age and should encourage rotation rather than be normalized as permanent operating cost.

## Source

- Q host/operator observation during the first fresh Loom Tooling 011 return.
- Screenshots showing multiple Loom-generated files visible in the ChatGPT library and the completed fresh Loom run.
- Existing transport-only human participation and companion projection decisions.

## Evidence Material

- [Handoff package companion transport projection decision](001-9-2-handoff-package-companion-transport-projection-decision.trace.md)
- [Handoff transport workspace/artifact routing decision](001-9-3-handoff-transport-workspace-artifact-routing-decision.trace.md)
- [Loom first fresh-run review pending correction](001-11-2-loom-first-fresh-run-review-pending-correction-decision.trace.md)
- [Process measurement/calibration schema gap](001-15-process-measurement-calibration-schema-gap.trace.md)

## Disposition

- State: accepted-for-dogfood
- Follow-Up: normal Handoff return should expose one primary human-visible transport artifact and make helper outputs non-required for human selection. Pressure-test this immediately on the Tooling 011 correction return before deciding whether a dedicated Tooling/host projection Task is required.
- Conversation Rotation: use early branch 2 as the normal cold-start successor checkpoint and do not plan normal work through branch 3-4.
- Acceptance Effect: this is a host/transport constraint for current workflow and Tooling pressure, not canonical Handoff semantics.

## Limits

- The attachment-budget value is host-observed and may change; it is not a Tiinex canonical constant.
- "One primary deliverable" does not mean one file exists internally. It means the human fast path should require choosing/carrying one unambiguous carrier.
- Conversation rotation does not prove a Role change, invalidate historical chat evidence, or require deleting old conversations.
- Q is not required to inspect receipts, choose among helper artifacts, reconcile package topology, or infer which generated file is authoritative.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:tbEtbkMhUTG-G-Ad3JBOwPDHSrlrJeFc8dgcfp0Ii-w
