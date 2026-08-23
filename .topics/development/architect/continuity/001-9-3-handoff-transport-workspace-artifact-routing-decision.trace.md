# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-08-23 02:06:00
  - Trace: [Handoff package companion transport projection](001-9-2-handoff-package-companion-transport-projection-decision.trace.md)
  - Origin:
    - [relative](001-9-2-handoff-package-companion-transport-projection-decision.trace.md)
    - [browse + git](https://github.com/Tiinex/site/blob/85cf6c36e554a7b7fc420b51d45a71a36e23d0c7/.topics/development/architect/continuity/001-9-2-handoff-package-companion-transport-projection-decision.trace.md)
- Current
  - Current Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-08-23 10:05:00
  - Authors: Anchor
  - Why: Fresh-recipient dogfood showed that package discovery and work routing are separate. A recipient-relative package can carry multiple workspaces and many plausible Handoff leaves, while a minimal host message that identifies only the package or only a carrier-relative path forces the recipient to guess workspace identity or infer package topology.
  - Summary: Handoff transport routing identifies the attached current workspace, then an exact workspace-relative controlling artifact; it does not interpret either and does not expose package-internal carrier topology as the artifact identity.
  - Status: accepted/local

---

# Handoff transport workspace and artifact routing

## Decision

- State: accepted
- Subject: minimal host routing for Tiinex Handoff transport
- Decision: a normal Handoff transport message must identify the attached workspace/material context and provide an exact controlling artifact locator relative to that workspace. The transport message must not require the recipient to discover the controlling leaf from package contents, infer which co-located workspace is current, or treat package-internal carrier paths as Tiinex artifact identity.
- Routing tuple: the minimum routing truth is `(workspace, controlling artifact within that workspace)`. When the attachment itself clearly identifies the current workspace, the workspace part may be expressed naturally in the attachment sentence and the artifact remains a workspace-relative path.
- Interpretation boundary: transport routing selects where grounding begins. It does not restate work semantics, Role semantics, authority, completion behavior, debugging guidance, or sender memory; those remain in the selected artifact and recipient-relative package truth.

## Qualified Host Shape

The proven cold-start shape is intentionally small:

```text
Ny current Tiinex/site workspace bifogad.

Fortsätt från:
.topics/.../<controlling-artifact>.trace.md
```

Equivalent localized host presentation may vary, but must preserve both pieces of routing truth without adding work interpretation.

## Failure Modes

- Package-only invocation such as `Use the uploaded Tiinex Handoff package.` is insufficient when more than one plausible leaf or workspace can exist because the recipient is forced to guess the controlling artifact.
- An artifact path without workspace identity is insufficient when package transport can carry multiple workspace/source materializations because the recipient is forced to guess which workspace owns that path.
- A carrier-relative locator such as `handoff.workspaces/<id>/.topics/...` leaks disposable package topology into host routing and conflates carrier placement with workspace-relative artifact identity.
- Sender-authored prose explaining which source is authoritative, how to interpret the work, what to return, or what Role to become is hidden steering and is not a substitute for missing structured package/Tooling capability.

## Tooling Consequence

- Shared Handoff companion/projection Tooling should make the qualified workspace identity and exact workspace-relative controlling artifact available as reusable projection data.
- If a host cannot present this minimal routing tuple without bespoke interpretation, treat that as a missing projection/adapter capability rather than expanding Role memory or transport prose.
- Repeated sender improvisation in Handoff packaging or routing is evidence for reusable Tooling or a missing artifact/contract type, not a reason to grow Role artifacts into procedure manuals.

## Qualification Pressure

A fresh recipient test passes only when the recipient can receive a package containing multiple artifacts and source/workspace materializations, start from the explicitly routed workspace-relative artifact, retain declared authority boundaries, and perform grounding without sender-authored work explanation.

A transport-boundary test fails when the sender must add work interpretation, Role interpretation, source-authority explanation, completion guidance, debugging hints, or package-topology instructions beyond the qualified workspace/artifact routing tuple.

## Consequences

- The `001-9-2` companion decision remains the controlling architectural foundation, but its package-only minimal ideal is refined by this decision: package presence does not replace explicit work routing.
- Future Handoff transport should prefer the proven attachment + workspace-relative artifact template until qualified shared Tooling can project the same routing truth more directly for the host.
- Human carriage remains transport only; providing the routing tuple does not make the carrier a Handoff endpoint, Role holder, authority, approver, or technical intermediary.

## Review Conditions

Reopen if a qualified host/package capability can unambiguously bind one workspace and one controlling artifact without recipient inference, if canonical Handoff semantics later establish a different routing authority, or if real cold-start evidence shows that the workspace/artifact tuple is insufficient or unnecessarily strong.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:S6zfVxC31hf3lsEfyhuIu7ZshlMJnNtWbCLPuTf9ls0
