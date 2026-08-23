# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-08-23 16:37:00
  - Trace: [Role conversation rotation condensation routine decision](001-18-role-conversation-rotation-condensation-routine-decision.trace.md)
  - Origin:
    - [relative](001-18-role-conversation-rotation-condensation-routine-decision.trace.md)
- Current
  - Current Schema: [tiinex.feedback.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/core/feedback/tiinex.feedback.v1.schema.md)
  - Created At: 2026-08-23 16:38:00
  - Authors: Anchor
  - Why: Preserve Q's process-modeling design signal that reusable working methods should compose real Tiinex artifacts and relations rather than duplicate their semantics in runtime-shaped process nodes, while keeping the exact canonical schema classification open for Axiom.
  - Summary: Candidate Process semantics are a reusable qualified scope over existing artifact/lineage relations; boundary-crossing requirements derive inputs/outputs, provenance may point to the concrete lineage segment from which the process was extracted, and Viewer node graphs should project those real artifacts.
  - Status: draft/local

---

# Process artifact scope composition and lineage extraction feedback

## Observed Design Signal

- Tiinex continuously discovers reusable working methods during real work. Those methods should survive Role cold-start and be human-readable without copying procedural prose into every Role, Handoff, Task, or runtime implementation.
- Q proposes that a Process should primarily compose or scope real Tiinex artifacts and their existing relations. The nodes in a process graph are therefore genuine artifacts, artifact requirements, or qualified references to them rather than synthetic runtime-only node types that restate another schema's semantics.
- Human-first reading remains primary: a person without computer knowledge should be able to understand what is needed, what happens, and what can come out. Machine graph structure is a projection of the same artifact semantics, not a second authority.

## Candidate Process Model

A reusable Process is tentatively understood as one artifact that declares a qualified scope over an existing or reusable pattern of Tiinex artifact relations.

- Inside the scope: the artifacts/relations that constitute the reusable method.
- Outside the scope: concrete surrounding artifacts that are intentionally not part of the reusable method.
- Input boundary: a qualified relation or requirement enters the process scope from outside and is not satisfied by an artifact included inside the scope.
- Output boundary: a qualified relation leaves the process scope toward an artifact/result outside the scope.
- Reuse: another execution imitates/instantiates the scoped pattern with different concrete boundary bindings; equivalent process outcome means satisfying the process contract, not reproducing identical bytes or values.

This supports the simple experimental example where a concrete first run used constants `A` and `B`, while the reusable Process scopes only the transformation/artifact relations. Removing the concrete `A` and `B` artifacts from scope exposes two boundary holes; those become process inputs rather than being re-described manually in prose. A forgotten third required crossing should leave the Process incomplete/blocked until it is either declared as an input or brought inside scope.

## Provenance And Lineage Extraction

- A Process may originate from an intentionally designed method, from the first successful experimental lineage segment, or from a much later observed cycle after repeated runs reveal what the method should have been.
- Process provenance should therefore be able to point to the concrete lineage segment or evidence lineage from which the reusable scope was extracted or revised.
- Later revisions may be justified by accumulated runs, deviations, corrections, or improved outcomes without rewriting the historical segment that originally produced the Process.
- A future human/social action such as `Create process from lineage selection` is a natural product projection: select a lineage segment, establish scope, derive candidate boundary inputs/outputs, review the resulting Process, then share/reuse it with new bindings.

## Human And Viewer Projection

- Default conceptual unit: one reusable Process should normally be one Process artifact, not one artifact per node/transition merely for runtime convenience.
- The Process artifact references/composes existing artifacts or semantic requirements. Each referenced artifact schema continues to own its own meaning; Process owns only the additional reusable scope/composition/boundary semantics that are genuinely missing.
- A node-graph Verse may draw the referenced artifacts and relations directly, visually mark the Process boundary, and show incoming inputs/outgoing outputs. The graph is a projection, not independent process authority.
- Large subgraphs should become separate reusable processes only when they are meaningfully separate processes to a human, not because a renderer prefers smaller graphs.

## Semantic Questions For Axiom

- Determine whether current canonical schemas already express this reusable scoped-composition meaning or whether a maintained Process schema is missing.
- If a Process schema is required, minimize new semantics: prefer scope, composition/reference, boundary/interface, applicability, and provenance over duplicating Handoff/Role/Decision/Result/etc. fields inside Process.
- Determine whether concrete process executions/runs need a distinct schema at all. Existing lineage/results/observations may already record actual executions sufficiently; do not mint `Process Run`, `Method`, `Procedure`, `Playbook`, or similar siblings unless a genuine semantic distinction survives human-first review.
- Determine how reusable slots/boundary requirements bind concrete artifact instances/types without turning Process into a programming language.
- Preserve that Process lineage/provenance and artifact Parent/Trace/Origin remain explicit; graph topology or dimensional filename lineage must not silently become semantic Parent authority.

## Disposition

- State: accepted-for-semantic-classification
- Follow-Up: route this bounded semantic question to Axiom before implementing a private Viewer/runtime process model. Tooling may assist discovery/validation only after maintained artifact semantics are clear enough to remain portable.
- Product Follow-Up: after semantics stabilize, Kodax may project Process artifacts into node-graph/lineage/social interactions without inventing Viewer-only process truth.

## Limits

- `Process` is a working semantic name, not yet a minted canonical schema id.
- The boundary-derived input/output model is a design hypothesis with strong local fit, not canonical docs authority until Axiom reviews available schemas and classification.
- This artifact records Q's design feedback plus Anchor's bounded interpretation; it does not treat Q as schema authority or require runtime implementation immediately.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:NbdOIntvkqXzTglfbI_AM0OALY3yVB9LJ-C-bjykFfs
