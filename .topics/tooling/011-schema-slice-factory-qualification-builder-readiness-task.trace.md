# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-03 15:56:34
  - Trace: [004-anchor-viewer-artifact-action-parity-recovery-active-major-task.trace.md](../viewer/004-anchor-viewer-artifact-action-parity-recovery-active-major-task.trace.md)
  - Origin:
    - [relative](../viewer/004-anchor-viewer-artifact-action-parity-recovery-active-major-task.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-03 21:36:51
  - Authors: Anchor
  - Why: Scale useful Docs schemas without multiplying schema-specific product/tooling logic; factory acceptance requires proof across structurally different concrete schemas while Root remains abstract.
  - Summary: Qualify a reusable schema-slice factory on Decision, Evidence, and Handoff before broad schema scaling, with shared Tooling/Viewer/Builder capability authority.
  - Status: ready/local

---

# Schema Slice Factory Qualification + Builder Readiness

## Objective

Qualify one reusable schema-slice factory before broad schema expansion. Prove that the same shared schema authority and capability machinery can support materially different concrete schemas without Viewer-private, Tooling-private, or schema-copy/paste semantic logic, while keeping `tiinex.root.v1` an abstract inherited envelope rather than forcing concrete creation or transition behavior onto Root.

The qualification set is intentionally small but structurally different:

- `tiinex.decision.v1` — simple maintained concrete schema whose creation contract is nearly generic but currently leaves one residual Required Shape item unqualified.
- `tiinex.evidence.v1` — maintained Preservation descendant whose Artifact Creation Contract is field-oriented and currently exposes unmapped creation inputs despite qualified schema authority.
- `tiinex.handoff.v1` — maintained coordination schema with structured endpoint, repeated declaration, completion, and interpretation-limit surfaces; creation/tooling/package behavior must converge without a second Handoff ontology.

`tiinex.validation.finding.v1` is the first intended post-factory scale proof because it is operationally useful to audit/repair and has field-oriented creation semantics. It must not require a new architecture if the factory is genuinely qualified.

## Done Criteria

- Root remains abstract: no factory rule requires Root to be manually creatable, to expose schema-specific transitions, or to mimic concrete descendants merely for symmetry.
- One compiled schema descriptor/capability model remains the shared basis for Tooling, Viewer, future Schema Builder, and LLM-facing guidance; directory placement and handwritten app code do not become semantic authority.
- Decision, Evidence, and Handoff each expose an exact capability disposition for read, validate, present, create, transition participation, findings/i18n, relation/companion needs, and degraded/fallback behavior. Unsupported capability is explicit rather than guessed.
- Ordinary creation authority is derived from the qualified `Artifact Creation Contract`. Generic representation machinery supports the recurring contract shapes needed by the qualification set rather than adding per-schema Markdown writers.
- Field-oriented creation contracts can bind exact required fields to their schema-authorized target sections without document-wide guessing. Repeated declaration/named-entry shapes remain structurally represented rather than flattened into opaque free text merely to make Handoff pass.
- Residual Required Shape handling has one explicit extension boundary: generic primitives are compiled once; a schema-owned residual qualifier is permitted only when the canonical contract genuinely declares semantics not expressible by a qualified generic primitive. Residual JS must not silently restate ordinary contract rules.
- Inherited schema contributions remain additive and provenance-preserving. Evidence must continue to respect Preservation inheritance without copying the parent contract into a new private validator/generator.
- Canonical Transition Definition authority stays distinct from companion metadata. The factory does not invent transitions for schemas that do not declare applicable reusable transitions, and Root is not forced to own transitions.
- Handoff authoring, Handoff-package manufacture, Viewer authoring, and portable Tooling consume the same Handoff schema/creation authority. Existing specialized package transport mechanics may remain specialized mechanics, but they must not duplicate or redefine Handoff semantic fields.
- Viewer proof for the qualification schemas consumes shared descriptors/capabilities and shared creation/validation execution. If Viewer needs a missing primitive, Kodax returns it to Anchor/Loom instead of implementing a private schema rule.
- Schema Builder prerequisites are explicit and reusable: schema identity/inheritance, section/field ownership, value/shape constraints, creation inputs/bindings, repeated declaration structure, transition-definition discovery, relation/companion references, capability availability, and validation findings can be projected from shared data rather than reverse-engineered from UI components.
- A machine-readable factory qualification/conformance test covers at least one simple concrete schema, one inherited field-oriented schema, and one complex repeated-declaration coordination schema. Adding the first post-factory schema must demonstrate reuse of the same machinery with no new semantic subsystem.
- Current merged Axiom + Loom + Kodax candidate remains green through Foundation, typecheck, UI shape, schema companion, and canonical transition-slice checks before and after the bounded factory changes.
- Sigma approval is required before the factory pattern is called accepted and before broad multi-wave schema fan-out begins.

## Scope

- Current `refactor` Site schema registry, compiled schema-source/contract machinery, capability registry, creation representation/binding/renderer path, generic artifact module, transition-definition integration, schema companions, portable Tooling projections, and Viewer consumption seams.
- Bounded new generic primitives or descriptor fields that are directly justified by Decision/Evidence/Handoff canonical contracts and clearly reusable by later schemas.
- Builder-readiness architecture only: expose/qualify shared descriptor and operations needed by a future Schema Builder; do not build the full Builder UI in this task.
- Conformance/acceptance fixtures that prove no competing semantic logic is introduced.
- Preserve the previously qualified Node Graph projection and Loom audit/repair/reduction capabilities while this factory work proceeds.

## Dependencies

- [Viewer Artifact + Action Parity Recovery — Active Major](../viewer/004-anchor-viewer-artifact-action-parity-recovery-active-major-task.trace.md) — existing requirement that Viewer actions consume canonical shared creation/read authority.
- [Axiom Reduction Before Delete + Cross-Repository Boundary Decision](010-1-1-axiom-reduction-before-delete-cross-repository-boundary-decision.trace.md) — retained semantic authority boundary precedent: Tooling proves declared contracts rather than relying on operator memory.
- [Loom Reduction Audit Repair Parity Implementation Evidence](010-2-1-loom-reduction-audit-repair-parity-implementation-evidence.trace.md) — shared-capability precedent and proof that Viewer/Tooling should project the same capability owner.
- [Kodax Node Graph Verse Projection Implementation Evidence](../viewer/005-1-1-kodax-node-graph-verse-projection-implementation-evidence.trace.md) — current product architecture baseline; graph projection remains derived and must survive factory work.
- Current canonical Docs schema authority for Root, Decision, Evidence, Handoff, Transition Definition, Relation, validation/schema-governance companions, and their inherited parent chains.
- Existing Site `postV423CanonicalTransitionProductVerticalSlice` is reference proof for canonical transition-driven product execution, not permission to hardcode Topic/Task assumptions into the factory.

## Role Routing

- Axiom: qualify semantic factory boundaries from current Docs, classify which companion concepts are canonical/generic/optional, identify transition/relation/inheritance constraints, and produce a wave ordering that does not invent symmetry or semantics.
- Loom: implement/qualify the shared descriptor, creation-binding/representation, capability/conformance, and Builder-ready seams needed by the three qualification schemas; fail closed on semantic ambiguity and return blockers instead of schema-specific private policy.
- Kodax: held until Axiom/Loom reconciliation. Then consume the shared factory in Viewer to prove Decision/Evidence/Handoff read/create/validation interaction without private schema logic.
- Anchor: reconcile semantics/mechanics/product use, stop fan-out on duplicated logic, and prepare Sigma factory acceptance only after the pattern is demonstrated in actual use.
- Sigma: accept or reject the factory pattern after technical and product proof; broad schema scaling is not authorized by this Task alone.

## Exclusions

- No broad schema catalog fan-out before factory qualification and Sigma acceptance.
- No requirement that every schema have every companion, transition, relation, create action, presenter, findings pack, or i18n pack. Absence may be correct and must remain explicit.
- No Root manual creation semantics or synthetic Root transitions merely for factory uniformity.
- No schema semantics inferred from directory hierarchy, filename conventions, UI forms, existing implementation accidents, or LLM training/instructions.
- No second schema ontology in Viewer, portable Tooling, or future Schema Builder.
- No destructive historical reduction; Reduction-before-delete remains fail-closed until its separate cross-repository closure work is qualified.
- No Playthings branch merge and no import of Playthings-specific world semantics.
- No remote push, merge, publication, or deployment is authorized by this Task alone.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [004-anchor-viewer-artifact-action-parity-recovery-active-major-task.trace.md](../viewer/004-anchor-viewer-artifact-action-parity-recovery-active-major-task.trace.md)
  - Value: mKgoDujAWZFxqsNvAln71-LZ2gmTd2urZoTDKEBavys

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: k-972tR9t7s3QQpQ13Id5oG5qHVIqK05f_LEIr_MM5k