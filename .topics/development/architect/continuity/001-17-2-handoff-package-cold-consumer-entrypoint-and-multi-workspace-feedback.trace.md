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
  - Created At: 2026-08-23 16:06:00
  - Authors: Anchor
  - Why: Preserve Q's product/process observation that a Handoff package should remain self-orienting for a completely cold consumer and should not structurally assume exactly one workspace even though current Tiinex/site and Tiinex/docs progress remains intentionally separated.
  - Summary: A future Handoff package cold-consumer entrypoint should be parseable, generated from package truth, route-aware, and 1..N-workspace capable while keeping single-workspace packaging the ergonomic default.
  - Status: draft/local

---

# Handoff package cold-consumer entrypoint and multi-workspace feedback

## Observed Signal

- A completely cold LLM/platform consumer may receive only the Handoff ZIP and should not depend on transport prose from an inaccessible prior conversation to discover how to begin.
- Q prefers an obvious package-local entrypoint such as `tiinex.package/START.md` provided that it is reliably parseable rather than free-form prose that a consumer must heuristically interpret.
- The entrypoint should project package truth: one or more workspace identities plus route(s) mapping to exact workspace-relative controlling Handoff artifacts. It must remain orientation/projection rather than semantic authority.
- Current Tiinex/site and Tiinex/docs work should continue to use separate package/dimensional lineages because that separation is useful for present progress and human orientation.
- The package capability should nevertheless remain 1..N-workspace capable for future projects where a recipient must see several qualified workspaces in one bounded Handoff package.
- Viewer import may later distinguish a package apparently intended for another consumer from one native to the Viewer, ask before activating an external-target Handoff, and on explicit open hydrate the qualified workspaces and navigate to the selected controlling Handoff lineage. Required/Reference material should remain progressively disclosed rather than dumped into the primary UI.

## Interpretation

- Single-workspace is an ergonomic default, not a package cardinality invariant.
- A parseable cold-consumer entrypoint is a generated transport projection and should be mechanically checkable against package/closure/carrier truth. A mismatch must fail closed or degrade explicitly rather than override package truth.
- The entrypoint should model `workspaces[]` and route-to-workspace binding from its first maintained shape so multi-workspace does not require redefining a singular `workspace` field later.
- Consumer classification should derive from qualified package/companion/route capability data, not outer filename text such as `anchor-to-loom` or hard-coded ChatGPT product names.

## Feedback Target

- Target: future portable Handoff package cold-start orientation plus later Viewer Handoff-package intake behavior.
- Not Target: changing canonical Handoff semantics, merging Tiinex/site and Tiinex/docs progress into one workspace, making `START.md` authoritative, or requiring every package to carry multiple workspaces.

## Disposition

- State: accepted-for-dogfood
- Follow-Up: after Tooling 012 is independently closed, route a bounded Tooling leaf for a parseable package-local cold-consumer entrypoint and for removing accidental single-workspace assumptions from the human carrier projection where package core already supports multiple qualified workspace materializations.
- Later Product Follow-Up: route Viewer-specific import/activation/navigation behavior to Kodax only after the portable package projection is stable enough to consume without private Viewer-only semantics.

## Limits

- `START.md` is a working filename candidate, not a canonical schema decision.
- A JSON/fenced-JSON or other parseable block inside Markdown is an implementation candidate; exact maintained shape remains Tooling/schema-review work rather than Q-authored authority.
- Multi-workspace capability must not force multi-workspace packaging when one workspace is sufficient.
- Q screenshots and UI observations remain optional host/meta evidence; package truth and reproducible tests remain the acceptance basis.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:2Vllhthd6ppKOJLu0nV7UxO0o-ucpgiJvNEg-9-2bek
