# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-23 21:44:00
  - Authors: Anchor
  - Why: Prevent successful cold-start/Handoff tests from depending on unqualified extra context that an LLM or manufacturing path carried merely to help the recipient.
  - Summary: Audit and harden recipient-relative Handoff packages so every materialized semantic byte has an explicit carriage reason, Required Context resolution is traceable, complete-workspace carriage is distinguishable from route-required context, and hidden-context leakage cannot silently become a success dependency.
  - Status: open/local

---

# Tooling 017 — recipient context minimality and hidden-context leak audit

## Objective

Add a bounded, inspectable context-carriage audit for Handoff packages and use it adversarially against current full-workspace and detached-material manufacturing. The audit must explain why every semantic/material carrier is present without pretending that a complete carried workspace is the same thing as the Handoff's Required Context.

## Done Criteria

- Inventory every non-control/non-bootstrap package carrier and classify its explicit carriage reason at minimum as: complete/partial workspace materialization; resolved Required Context; resolved Reference Context; explicitly supplied detached material; or another named qualified package requirement. Unexplained semantic/material carriers are findings, not silent convenience.
- For every `handoff.material/**/material.bin`, expose the exact Handoff requirement id/name, reference target, selected provider/provenance, byte count, SHA-256, and whether identical bytes also exist in a carried workspace.
- Prove that `handoff.material` contains requirement-resolved bytes rather than hidden chat summaries, old answer artifacts, or undeclared convenience context. Deliberate unbound detached-material injection must be rejected or clearly surfaced as unexplained.
- Distinguish `carried because this workspace snapshot is complete` from `required to ground this route`. Do not label unrelated members of a deliberately complete workspace as Required Context.
- Compare a full-workspace carrier and a minimally materialized carrier for the same bounded Handoff where possible. Package/closure/orientation should recover the same explicit route and Required Context truth; if success depends on unrelated workspace artifacts, preserve that as a failure signal rather than broadening Required Context after the fact.
- Audit the current duplicate-byte case where a Required Context artifact is both present in `handoff.workspaces/**` and copied to `handoff.material/**/material.bin`. Decide with evidence whether physical duplication is required for closure/integrity. If exact workspace-byte binding can safely replace duplication, propose/implement only within existing package authority; otherwise document why duplication is intentional.
- Add adversarial tests for stale requirement bindings, wrong provider bytes, undeclared material, unrelated prior Handoff/decision artifacts, full-workspace extra context, and binary detached material.
- Make the audit discoverable through a normal portable operation/inspection path and keep output bounded enough for an LLM/human reviewer.
- Do not attempt to mechanically decide the semantic relevance of every artifact inside an explicitly complete workspace. The hard guarantee is provenance/reason visibility and route Required Context closure, not magical semantic understanding.
- Return exact findings, any justified hardening changes, test evidence, limitations, and a Loom return Handoff to Anchor.

## Scope

Portable Handoff package inspection/audit, material closure provenance, focused adversarial fixtures, optional locally justified duplicate-material hardening, and documentation. Out of scope: canonical Handoff schema mutation, deleting legitimate complete workspace history, automatic semantic relevance inference, Viewer product behavior, Process semantics, or publication.

## Dependencies

- [Tooling 011 Anchor acceptance](011-2-handoff-package-manufacturing-bootstrap-and-scale-anchor-acceptance.trace.md) owns current deterministic package manufacturing and roundtrip behavior.
- [Tooling 012 Anchor acceptance](012-2-handoff-carrier-projection-shared-route-and-human-output-anchor-acceptance.trace.md) owns route-specific Required Context closure.
- [Tooling 013 Anchor acceptance](013-1-handoff-package-cold-consumer-entrypoint-and-multi-workspace-anchor-acceptance.trace.md) owns current cold-consumer orientation.
- [Workspace source binding signal](../../architect/continuity/001-19-5-workspace-source-binding-and-lazy-discovery-signal.trace.md) preserves the distinction between available/carried bytes and authority.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:5aqzA61sfCrAGD0VZn4BO_XTnTpZt-N9jiEpqgnVSI8
