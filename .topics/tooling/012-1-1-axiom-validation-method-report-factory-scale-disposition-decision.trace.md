# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-04 12:13:52
  - Trace: [012-1-anchor-to-axiom-validation-method-report-factory-scale-handoff.trace.md](012-1-anchor-to-axiom-validation-method-report-factory-scale-handoff.trace.md)
  - Origin:
    - [relative](012-1-anchor-to-axiom-validation-method-report-factory-scale-handoff.trace.md)
- Current
  - Current Schema: tiinex.decision.v1
  - Created At: 2026-09-04 12:48:12
  - Authors: Axiom
  - Why: Give Loom one exact shared-factory capability disposition without manufacturing create, transition, relation, or companion symmetry.
  - Summary: Axiom qualifies Validation Method as read/validate-only and Validation Report as generation-qualified but transition-gated, preserving capability asymmetry as first-class Builder truth.
  - Status: ready/local

---

# Validation Method And Report Factory Scale Disposition

The first post-factory scale pair is semantically clean and should preserve capability asymmetry as first-class descriptor truth. Validation Method and Validation Report are both canonical readable/validatable Artifact schemas, but only Validation Report declares generation authority; neither schema gains transition, relation, or companion behavior by adjacency, naming, or Viewer convenience.

## Decision

- State: accepted for bounded factory progression.
- Subject: canonical capability and Builder disposition for `tiinex.validation.method.v1` and `tiinex.validation.report.v1`.
- Validation Method — read: qualified. The schema is a concrete Root descendant with a complete human-readable Schema Validation Contract.
- Validation Method — validate: qualified through Root plus the schema's own validation groups. Required body sections are `Method Identity`, `Verification Scope`, `Trust Boundary`, `Failure Modes`, and `Recommended Use`; their ordinary required/optional fields remain exact Root-targeted scalar fields.
- Validation Method — generation authority: unavailable. The schema explicitly omits `Artifact Creation Contract`; Root states that absence means artifact generation is not declared by that schema.
- Validation Method — direct create action: unavailable. Do not synthesize a create form, creation contract, or Create action for symmetry. If ordinary app creation is later desired, canonical Docs must first declare generation authority, and an applicable reusable Transition Definition must separately authorize invocation.
- Validation Method — transition: none qualified for this tranche. The carried canonical Docs set contains no applicable Transition Definition targeting `tiinex.validation.method.v1`; transition behavior must not be inferred from schema identity, `.validator.md` naming, or neighboring schemas.
- Validation Method — relation: none qualified. `Related Method`, references, and explanatory prose do not create typed Relation authority.
- Validation Method — companion: none required. `.validator.md` is an allowed representation/file-naming shape for reusable validation-method artifacts; it is not an executable validator implementation and not a required companion artifact.
- Validation Method — closed domains: none on its artifact fields in the active contract. Examples such as digest, signature, yes/no-like values, or UI labels remain guidance unless a canonical Field Value Constraint declares closure.
- Validation Report — read: qualified. The schema is a concrete Root descendant with a complete human-readable Schema Validation Contract.
- Validation Report — validate: qualified through Root plus six required ordinary body sections: `Report Scope`, `Validation Methods`, `Findings Summary`, `Finding List`, `Run Boundary`, and `Interpretation Limits`.
- Validation Report — generation authority: qualified. Its `Artifact Creation Contract` declares exactly eleven required inputs: `Scope`, `Targets`, `Methods Used`, `Method Boundaries`, `Summary`, `Overall State`, `Findings`, `Run Context`, `What Was Not Checked`, `Does Not Prove`, and `Must Not Hide`.
- Validation Report — generic binding map: `Scope` and `Targets` -> `## Report Scope`; `Methods Used` and `Method Boundaries` -> `## Validation Methods`; `Summary` and `Overall State` -> `## Findings Summary`; `Findings` -> `## Finding List`; `Run Context` and `What Was Not Checked` -> `## Run Boundary`; `Does Not Prove` and `Must Not Hide` -> `## Interpretation Limits`. Every one of these is an `ordinary-field` binding under Root's exact same-name ordinary field targeting; no schema-ID branch, structured declaration adapter, or prose parser is needed.
- Validation Report — `Summary` identity: the creation input `Summary` is owned by the ordinary field `## Findings Summary -> Summary`. It must not be rebound to `Current -> Summary` or the body title merely because the label is `Summary`. A generic renderer may supply independent Root envelope/title presentation metadata, but that metadata is not the schema's `Summary` creation input.
- Validation Report — direct create action: not qualified from Docs authority alone. A Creation Contract gives generation semantics, while Schema Family/Transition Definition authority states that direct creation requires an applicable reusable Transition Definition. No such canonical definition is carried for `tiinex.validation.report.v1` in this tranche. Therefore Builder/Viewer may expose the qualified generation descriptor without exposing an invocable Create action until transition applicability resolves.
- Validation Report — transition: none qualified for this tranche. Do not infer Create, Continue, Reference, revise, or another lifecycle effect from the Creation Contract itself.
- Validation Report — relation: none qualified. Plural fields such as `Targets`, `Methods Used`, `Findings`, and optional fields such as `Validation Method Artifacts` or `Finding Artifacts` remain ordinary scalar fields/references under the current contract; they do not authorize typed relation materialization.
- Validation Report — companion: none required. The schema allows references to artifacts that own their own semantics, but it does not require a relation, finding, method, module, or other companion artifact for the report to exist or validate.
- Validation Report — closed domains: none on the report artifact's ordinary fields in the active contract. `Allowed Or Common Shapes` is explicitly guidance, not an exhaustive vocabulary. `Overall State` must therefore remain open; tools must not manufacture `pass/warning/fail` or another closed enum. The Root-owned closed `Merge Operation` constraint belongs to Root's inheritance-override machinery and is unrelated to report fields.
- Validation Report — inheritance: purely additive Root inheritance with no schema-local override declaration. Root envelope, continuity, integrity, exact targeting, cardinality, and fail-closed unknown rules remain active. Artifact `Parent` remains optional direct ancestry and must not be synthesized from validation targets, methods, or findings.
- Builder capability model: represent at least three independent states—`read/validate`, `generation authority`, and `invocable transition`. `Validation Method` proves `read/validate = yes`, `generation authority = no`, `direct create transition = no`. `Validation Report` proves `read/validate = yes`, `generation authority = yes`, `direct create transition = unresolved/unavailable until separately qualified`.
- Builder must preserve absence as truth. It must not infer generation from ordinary validation fields, infer a transition from an Artifact Creation Contract, infer relation semantics from plural/reference-looking fields, or require companion files because neighboring schemas use them.
- No canonical Docs semantic blocker was found. This pair is qualified as the first clean post-factory capability-asymmetry scale proof, provided Loom keeps create invocation gated separately from generation-contract compilation.

## Basis

- Root explicitly says `Artifact Creation Contract` is present only when a schema supports direct artifact generation and that absence means generation is not declared.
- Canonical Schema Family semantics separately say direct creation requires an applicable reusable Transition Definition; generation semantics do not independently authorize semantic artifact creation.
- Validation Method explicitly identifies itself as support/governance semantics and intentionally omits its Artifact Creation Contract until ordinary app creation behavior is declared.
- Validation Report declares one exact Creation Fields group with eleven required inputs and no creation-specific Required Shape residue. Its validation groups provide unique Root-authorized ordinary field targets for all eleven inputs.
- The shared compiler model already distinguishes ordinary-field bindings and treats Root envelope fields as outside ordinary instance-field targeting. Under that model the report's `Summary` maps uniquely to `Findings Summary`, not to Root metadata.
- Neither schema has canonical Field Value Constraints that close its ordinary artifact-field domains. Human examples and `Allowed Or Common Shapes` wording are not domain closure authority.
- No canonical Transition Definition, relation contract, or required companion artifact in the carried Docs authority targets either schema. Absence must remain visible rather than being filled from Site metadata, directory adjacency, or naming conventions.

## Consequences

- Loom may add both schemas to the shared read/validate factory path without introducing new architecture or schema-specific branches.
- Loom should project Validation Method with creation/generation unavailable and must not include it in ordinary standalone Create choices.
- Loom should project Validation Report's eleven exact ordinary-field authoring descriptors and six representation sections through the existing generic factory machinery.
- Loom must keep Validation Report's generation descriptor distinct from action availability. If the product currently equates a qualified Artifact Creation Contract with an enabled Create action, that implementation coupling must be corrected rather than treated as schema authority.
- A future reusable Transition Definition may make Validation Report directly creatable; that later definition must determine applicability/lifecycle/placement while `Generation Binding: target-schema` may consume the already-qualified report Creation Contract.
- A future decision to make Validation Method ordinarily creatable requires an explicit canonical Artifact Creation Contract first, plus separate transition authority for an invocable create action. Do not reverse that order from UI demand.
- Schema Builder must be able to display and author capability asymmetry directly: readable/validatable without generation, generation without an invocable transition, and transition only when canonical definition authority resolves.
- Do not introduce `.relations`, form companions, transition companions, generated examples, or validator-implementation files into canonical Docs merely to make either schema appear complete.
- Anchor may route one bounded Loom implementation/registration step for this pair and treat any failure of the shared compiler to preserve these distinctions as an implementation defect, not a reason to broaden Docs semantics.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [012-1-anchor-to-axiom-validation-method-report-factory-scale-handoff.trace.md](012-1-anchor-to-axiom-validation-method-report-factory-scale-handoff.trace.md)
  - Value: rPgYJR5mp812Cj68c_-BMS-_nGDsMsnDbMtav_GyLqk

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: InmOve0Ts7w6C3u-lf9tEmWzyOkwmNPiwMdFY9CAV74