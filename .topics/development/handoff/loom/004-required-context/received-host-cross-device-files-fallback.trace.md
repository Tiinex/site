# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-08-23 14:38:00
  - Trace: [Handoff carrier dimensional lineage and human projection decision](001-17-handoff-carrier-dimensional-lineage-and-human-projection-decision.trace.md)
  - Origin:
    - [relative](001-17-handoff-carrier-dimensional-lineage-and-human-projection-decision.trace.md)
- Current
  - Current Schema: [tiinex.feedback.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/core/feedback/tiinex.feedback.v1.schema.md)
  - Created At: 2026-08-23 15:24:00
  - Authors: Anchor
  - Why: Preserve Q's cross-device ChatGPT observation before Tooling 012 transport projection is dispatched, so device switching does not require reopening an unavailable warm conversation or reconstructing routing from memory.
  - Summary: ChatGPT desktop-to-mobile conversation state may remain unavailable while new chats and user-visible Files remain usable, requiring a durable low-cost transport-text fallback that stays separate from Handoff authority.
  - Status: draft/local

---

# ChatGPT cross-device conversation and Files fallback feedback

## Observed Signal

- A desktop-created/advanced ChatGPT conversation can remain practically unavailable from the mobile app after a device swap, repeatedly loading until timeout.
- In Q's prior/current observation the unavailability can persist roughly on the order of a day, while user-visible Files/sources remain available and a new mobile conversation can still be created.
- The current `004` Handoff package was visible from Files on mobile even though the originating desktop conversation containing its routing prose was not usable.

## Source

- Q host/operator observation during the current Tiinex dogfood workflow.
- Current device-swap attempt: desktop-originating conversation unavailable/loading on mobile, shared Files visible, new chat creation available.
- Existing host transport-budget/single-primary-deliverable evidence and Handoff carrier projection decision.

## Interpretation

- Device switching can create an operational cold-start boundary independent of Tiinex Role/work semantics: the previous conversation may exist but be inaccessible to the human carrier.
- Durable transport therefore cannot require reopening the originating chat merely to recover the exact controlling Handoff locator.
- A minimal transport-text fallback can be disposable and host-specific as long as it is regenerated from package truth and never promoted to Handoff authority.

## Feedback Target

- Target: current ChatGPT-host transport presentation and cold-start recovery when Q switches between desktop and mobile.
- Not Target: canonical Handoff semantics, package identity, Role identity, semantic Parent/Trace/Origin, or a universal claim about ChatGPT synchronization behavior.

## Feedback Received

- Q reports that a conversation state created or advanced on desktop can repeatedly load and time out on the mobile app after a device swap; in prior/current experience the unavailable period can be roughly on the order of a day.
- During the same condition, Q can create a new conversation on mobile and can see user-visible Files/sources that were shared from the desktop session.
- Therefore a device swap may force an operational cold start even when the prior conversation still exists and would otherwise have been the warm continuation target.
- Q may need the minimal transport text itself to be available as a small user-visible file in Files, because the old desktop conversation containing the prose may be inaccessible while the Handoff package remains available.
- Q is back on desktop for the current Tooling 012 dispatch and has not yet transported the `004` package; this observation can therefore be included before dispatch rather than handled as a later correction.

## Disposition

- State: accepted-for-dogfood
- Follow-Up: Tooling 012 should preserve one primary package as the normal human fast path while supporting a disposable, regenerable minimal transport-text fallback when host/device conditions make the originating conversation unavailable.
- Preferred Boundary: the fallback text should expose only package/workspace orientation plus the exact workspace-relative controlling Handoff locator required by the existing human transport invariant. It must remain non-authoritative and reconstructable from package truth.
- Device-Swap Safe Path: Files-visible package + Files-visible minimal transport text + new conversation must be sufficient for cold-start continuation without opening the prior conversation.

## Limits

- The roughly day-scale synchronization delay is an observed host UX condition, not a guaranteed duration or Tiinex constant.
- A transport-text sidecar is a host fallback, not a second semantic artifact and not evidence of assignment, acceptance, Parent, or package authority.
- Normal desktop/warm continuation should not emit extra helper files merely because the fallback exists.
- If Tooling later makes single-route packages self-routing enough to recover the exact controlling locator without an external text sidecar, that may supersede the sidecar implementation while preserving the same device-swap requirement.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:QrzSoOICjStZKAGagtDeS7QpkaFGfEA6uBazzt5HoXw
