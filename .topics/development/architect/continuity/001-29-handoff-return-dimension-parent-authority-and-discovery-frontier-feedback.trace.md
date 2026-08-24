# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.feedback.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/core/feedback/tiinex.feedback.v1.schema.md)
  - Created At: 2026-08-24 10:33:00
  - Authors: Anchor
  - Why: Preserve Q's actual-path concern about return-Handoff dimensions without turning a chronological intuition into false Parent authority, after direct artifact review falsified the initial assumption that Loom 011-2 should mechanically have been 011-1-1.
  - Summary: The discovery concern is real, but current Loom 011-2 is dimensionally consistent with its declared Parent 011; any change to 011-1-1 first requires a semantic Parent decision rather than a filename-only Tooling correction.
  - Status: draft/local

---

# Handoff return dimension, Parent authority, and discovery frontier feedback

## Observed Signal

- Q observed that a return Handoff appearing as `011-2` beside result `011-1` can look like a parallel terminal leaf, making leaf-filtered discovery ambiguous about sequence and current frontier.
- Direct review of the carried artifacts shows both `011-1` and `011-2` declare the same direct Parent Trace, the incoming `011` Handoff.
- Existing canonical Root and Tooling lineage-allocation contracts bind dimensioned child allocation to the declared direct Parent, not to chronological authoring order.

## Interpretation

- The usability concern is real, but it does not by itself prove a dimensional allocation defect. Under the currently declared Parent relations, `011-1` and `011-2` are valid siblings.
- A mechanical rename to `011-1-1` without changing the return Handoff's direct Parent would make the human dimension projection contradict the artifact's declared continuity relation.
- The remaining question is whether the return Handoff's direct Parent is semantically correct, or whether discovery needs a separate workflow/frontier projection that does not equate direct lineage leaves with current progress frontier.

## Feedback Target

- Target: the dimensional lineage and discovery presentation of the fresh Loom cold-start sequence `011` inbound Handoff, `011-1` result, and `011-2` return Handoff, plus the proposed idea that Tooling should always allocate the return as `011-1-1`.

## Feedback Received

- Q observed that a return Handoff appearing as `011-2` beside result `011-1` can look like a parallel terminal leaf, making leaf-filtered discovery ambiguous about sequence and current frontier. Q prefers reducing LLM improvisation and initially proposed `011-1-1` for the return continuation.
- Initial control interpretation agreed too quickly and treated chronological order `011 -> 011-1 result -> return` as sufficient reason for `011-1-1`.
- Direct artifact review falsified that simplification. Both `011-1-known-role-loom-cold-start-qualification-result.trace.md` and `011-2-known-role-loom-cold-start-qualification-return-handoff.trace.md` declare the same direct `Parent -> Trace`: `011-known-role-loom-cold-start-qualification-handoff.trace.md`.
- Canonical Root authority states that `Parent` identifies the direct continuity parent and `Trace` defines the direct continuity relation. Existing Tooling lineage-allocation work likewise says a dimensioned Parent allocates dimensioned child paths under that Parent. Under those currently authored relations, `011-1` and `011-2` are therefore sibling continuations of `011`, and `011-2` is consistent with the current Parent contract.
- Forcing only the return filename/dimension to `011-1-1` while leaving its declared Parent as `011` would make the human dimension projection imply a child path that contradicts the artifact's direct continuity Parent. Tooling must not manufacture semantic Parent from chronology merely to make leaf discovery look sequential.

## Disposition

- State: accepted-with-correction
- The underlying Q discovery concern is accepted: a leaf-only view can conflate direct continuity leaves with workflow/progress frontier and make the sequence difficult to read.
- The filename-only correction `011-2 -> 011-1-1` is rejected as a mechanical default under the currently declared Parent relations.
- Active Anchor should independently classify one of two narrower possibilities before routing implementation: either the return Handoff's true direct continuity Parent should semantically be the result artifact, in which case both Parent and dimension should change together; or the current inbound-Handoff Parent is correct, in which case Viewer/Tooling discovery must distinguish direct lineage leaves from workflow/transfer frontier using explicit semantic relations such as Parent/Trace, Handoff `Controlling Artifact`, completion-facing signals, and other qualified relations rather than dimension alone.
- No current Role should invent a new Parent, rewrite historical artifacts, or change dimensional allocation solely from temporal order. Any deterministic dimension helper must remain subordinate to the declared direct Parent relation.

## Source

- Q actual-path observation during fresh Loom post-018 cold-start review on 2026-08-24.
- Direct local inspection of the carried `011`, `011-1`, and `011-2` artifacts in the reconstructed full Site checkpoint.
- Canonical Root Parent/Trace semantics and the existing Site Tooling v476 dimensioned Parent-to-child allocation contract.

## Limits

- This feedback does not decide whether a return Handoff should canonically parent the inbound Handoff or the produced result; that is a semantic architecture/schema question requiring independent review.
- It does not authorize renaming or repairing the already-carried Loom 011 artifacts, does not declare existing Tooling lineage allocation broken, and does not treat dimension as semantic Parent authority.
- It does not close the separate current-Role materialization, zero-state bootstrap, full-repository performance, or known-Role cold-start trust gates.
- The observation concerns discovery/progress usability as well as dimensional projection; a correct direct-continuity leaf may still not be the same thing as a current workflow frontier.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:NJHcuHI01FpONmw446J38Uem9al26tt5yAoX70kIvpg