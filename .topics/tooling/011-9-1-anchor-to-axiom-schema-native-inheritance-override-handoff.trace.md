# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-04 11:11:22
  - Trace: [011-9-anchor-schema-native-inheritance-override-docs-hygiene-task.trace.md](011-9-anchor-schema-native-inheritance-override-docs-hygiene-task.trace.md)
  - Origin:
    - [relative](011-9-anchor-schema-native-inheritance-override-docs-hygiene-task.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-04 11:11:37
  - Authors: Anchor
  - Why: The current explicit inheritance semantics are correct, but their loose companion-file representation is not acceptable as the default scale pattern.
  - Summary: Route the Docs hygiene and future Schema Builder semantic representation question to Axiom without reopening unrelated factory behavior.
  - Status: ready/local

---

# Anchor → Axiom Schema-Native Inheritance Override Handoff

## Handoff Parties

- Purpose: adjudicate the minimum schema-native machine authority for inherited structural overrides so the factory remains deterministic and Builder-ready without normalizing loose companion artifacts inside Docs.
- From: Anchor
- From Kind: role
- From Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
- To: Axiom
- To Kind: role
- To Reference: [Axiom Role](business::.topics/roles/001-2-axiom-role.trace.md)

## Transfers

- schema-native-override-design
  - Transfer Kind: work-and-responsibility
  - Description: decide the canonical machine-readable representation for explicit schema inheritance override when Docs should remain schema-only by default.
  - Controlling Artifact: [Schema-Native Inheritance Override And Docs Hygiene](011-9-anchor-schema-native-inheritance-override-docs-hygiene-task.trace.md)
  - Boundary: preserve the already-qualified Evidence-over-Preservation meaning; change only the authority representation needed to avoid companion-file bloat and future Builder debt.

- evidence-companion-migration-disposition
  - Transfer Kind: work-and-responsibility
  - Description: state whether the current `tiinex.evidence.v1-preservation-body.inheritance.trace.md` should be retired from the forward candidate, retained only as historical/local evidence, or transformed into another schema-native form.
  - Boundary: no remote publication or deletion is authorized by this Handoff.

## Required Context

- hygiene-task
  - Material: Anchor task framing the Docs-bloat and future Schema Builder requirement.
  - Material Reference: [Schema-Native Inheritance Override And Docs Hygiene](011-9-anchor-schema-native-inheritance-override-docs-hygiene-task.trace.md)
  - Purpose: controlling acceptance criteria and exclusions.
  - Availability: available

- prior-axiom-repair
  - Material: Axiom's prior factory canonical repair disposition.
  - Material Reference: [Schema Factory Canonical Repair Disposition](011-3-1-axiom-schema-factory-canonical-repair-disposition-decision.trace.md)
  - Purpose: preserve the exact already-qualified Evidence-over-Preservation semantic meaning while reconsidering only its representation.
  - Availability: available

- factory-reconciliation
  - Material: Anchor's technically green factory reconciliation before the hygiene issue was observed.
  - Material Reference: [Factory Qualification Reconciliation](011-8-anchor-schema-slice-factory-qualification-reconciliation-decision.trace.md)
  - Purpose: prove that the requested change is representation hygiene, not a request to reopen unrelated factory semantics.
  - Availability: available

- factory-task
  - Material: Schema Slice Factory Qualification + Builder Readiness.
  - Material Reference: [Factory Task](011-schema-slice-factory-qualification-builder-readiness-task.trace.md)
  - Purpose: preserve the shared-descriptor, no-private-logic, Root-abstract, and future Builder constraints.
  - Availability: available

## Reference Context

- current-evidence-binding
  - Material: current Site Evidence binding and carried inheritance companion used by the qualified factory candidate.
  - Material Reference: [Evidence binding](src/schemas/core/evidence/tiinex.evidence.v1.schema.json)
  - Purpose: implementation evidence showing why a loose companion file currently exists; not canonical semantic authority.
  - Availability: available

## Retained Responsibilities

- semantic-authority
  - Retained By: Axiom
  - Responsibility: define the canonical override representation and its interpretation limits without introducing implicit child precedence or free-prose inference.

- implementation
  - Retained By: Loom
  - Responsibility: after Axiom returns, implement the chosen representation once in shared Tooling/compiler machinery and remove the loose companion dependency from the forward candidate.

- architecture-and-progression
  - Retained By: Anchor
  - Responsibility: reconcile Axiom and Loom returns, rerun the four-schema Viewer/factory gates, and regenerate the Sigma acceptance handoff only from the cleaned candidate.

- product-acceptance
  - Retained By: Sigma
  - Responsibility: observe and signal deviations; final factory acceptance remains separate from this semantic design turn.

## Exclusions And Dependencies

- docs-thin-default
  - Kind: excluded-scope
  - Description: Docs should contain canonical schemas by default; companion families require explicit evidence and acceptance before becoming normal catalog material.

- no-companion-assumption
  - Kind: excluded-scope
  - Description: being generatable or useful in one workflow does not imply a companion should exist for every schema or live in Docs.

- no-site-semantic-authority
  - Kind: excluded-scope
  - Description: do not solve the issue by moving canonical semantic policy into private Site binding metadata or schema-ID conditionals.

- no-prose-guessing
  - Kind: excluded-scope
  - Description: Tooling must not infer override behavior from natural-language wording such as "replaces" without explicit machine authority.

- no-remote-mutation
  - Kind: excluded-scope
  - Description: no push, merge, publish, deploy, or connector mutation is part of this Handoff.

## Completion Expectation

- Signal Kind: return
- Signal Meaning: return one qualified Axiom Decision plus Axiom-to-Anchor Handoff package defining the minimum schema-native override authority and exact forward disposition of the loose Evidence inheritance companion.
- Return To: Anchor
- Return To Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)

## Interpretation Limits

- Does Not Mean: companions are forbidden from Docs forever; companion families may migrate there later when they are stable, canonical, useful, and intentionally accepted.
- Must Not Be Used To Claim: `.relations` or any other companion family is already approved for Docs, or that the existing factory is Sigma-accepted before the cleaned representation is requalified.
- Authority Limits: Axiom owns schema meaning; Anchor owns architecture/progression; Loom owns shared implementation; Sigma remains human acceptance/feedback authority.
- Transport Limits: successful manufacture proves carrier qualification, not correctness of the future semantic decision.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [011-9-anchor-schema-native-inheritance-override-docs-hygiene-task.trace.md](011-9-anchor-schema-native-inheritance-override-docs-hygiene-task.trace.md)
  - Value: TCfXCrRF0FY4G30EPxlJLYMklsYahlPhCpvL1oumZf0

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: -dLQ4t9sYaEW3jkGhWC-CezemMxFYkDVges32vHPMfk