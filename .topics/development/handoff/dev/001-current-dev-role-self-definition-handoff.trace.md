# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-22 18:46:03
  - Trace: [Role family durability](../../architect/continuity/001-3-role-family-durability.trace.md)
  - Origin:
    - [relative](../../architect/continuity/001-3-role-family-durability.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-08-22 20:48:07
  - Authors: Architect
  - Why: Let the current Dev worker define its own stable collaboration capacity from actual experience and authority, rather than having Architect guess it, while preserving a clean additive branch for later role-drift reconciliation.
  - Summary: Handoff for independent current Dev role self-definition.
  - Status: draft/local

---

# Current Dev role self-definition handoff

## Handoff Parties

- Purpose: transfer one bounded role-family durability slice so Dev independently materializes the stable Dev capacity it actually operates under, suitable for later cold-start use and Architect cross-role reconciliation
- From: Architect
- From Kind: role
- From Reference: [Architect Role](../../architect/continuity/001-3-1-architect-role.trace.md)
- To: Dev
- To Kind: role

## Transfers

- dev-role-self-definition
  - Transfer Kind: work-and-responsibility
  - Description: independently recover and express the current stable Dev collaboration capacity as Dev understands it from current authority and actual working experience, then materialize one durable `tiinex.party.role.v1` Dev Role artifact in a Dev-owned additive path; distinguish what Dev owns, may do, must not authorize, when it should push back or escalate, and what its stable review/return boundary is without turning the Role into a personality prompt or current-work checklist
  - Controlling Artifact: [Role family durability Task](../../architect/continuity/001-3-role-family-durability.trace.md)
  - Boundary: self-description is Dev-owned evidence of current stable capacity; do not copy Architect's guessed semantics, do not adjudicate other roles, and do not mutate unrelated implementation or continuity work

## Required Context

- current-site-workspace
  - Material: the complete Tiinex/site workspace supplied with this Handoff
  - Purpose: current source/material authority and durable context for role-family work; nearby historical implementation material does not create transferred work by presence alone
  - Availability: available

- controlling-role-family-task
  - Material: Architect role-family durability Task
  - Material Reference: [Role family durability Task](../../architect/continuity/001-3-role-family-durability.trace.md)
  - Purpose: controls objective, done criteria, separation of Role from holder/identity/delegation, and cold-start boundary
  - Availability: available

- canonical-party-role-schema
  - Material: current canonical `tiinex.party.role.v1` schema authority in Tiinex/docs
  - Material Reference: [tiinex.party.role.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/party/role/tiinex.party.role.v1.schema.md)
  - Purpose: controls the semantic and structural boundary of the Dev Role artifact; if current Role authority cannot represent Dev truthfully, preserve that as a blocker rather than inventing schema meaning
  - Availability: available

## Reference Context

- architect-sibling-role
  - Material: Architect's independently materialized sibling Role artifact
  - Material Reference: [Architect Role](../../architect/continuity/001-3-1-architect-role.trace.md)
  - Purpose: comparison aid for cross-role seams only; it is not Dev role authority and must not be copied as Dev self-description
  - Availability: available

- current-product-and-source-material
  - Material: current Tiinex/site product, acceptance, architecture, source, and validation material already present in the supplied workspace
  - Purpose: concrete evidence of the environment Dev works within; no nearby artifact becomes Dev responsibility without explicit transfer
  - Availability: available

- historical-dev-role-evidence
  - Material: branch #1 or other earlier Dev role/grounding evidence already available to the recipient session, if any
  - Purpose: optional historical comparison for detecting unchanged capacity, legitimate evolution, possible drift, or ambiguity; absence must not be filled by guessing and historical conversation context must not override current material authority
  - Availability: unknown

## Retained Responsibilities

- cross-role-reconciliation
  - Retained By: Architect
  - Retained By Reference: [Architect Role](../../architect/continuity/001-3-1-architect-role.trace.md)
  - Responsibility: compare returned self-defined roles across Architect, Tooling, Dev, Schemer, historical evidence, and current authority; classify stable truth, legitimate evolution, drift, and unresolved ambiguity
  - Boundary: Dev defines its own current stable capacity but does not self-authorize final project-wide role-family reconciliation

- current-v481-review
  - Retained By: Architect
  - Retained By Reference: [Architect Role](../../architect/continuity/001-3-1-architect-role.trace.md)
  - Responsibility: preserve current v481 Tooling review/acceptance responsibility outside this Dev role-definition branch
  - Boundary: Dev must not infer implementation work from the presence of Tooling correction material in the same workspace

## Exclusions And Dependencies

- shared-artifact-mutation
  - Kind: excluded-scope
  - Description: use an additive Dev-owned path for new role material; do not mutate, reseal, renumber, or rewrite the role-family Task, Architect Role, Architect continuity artifacts, role Handoffs, Tooling v481 implementation/results, or another role's artifacts
  - Responsible Party Or Role: Dev

- schema-semantic-invention
  - Kind: excluded-scope
  - Description: Dev may use current Party Role authority but does not own canonical Role/Handoff schema semantics; if the schema is insufficient or ambiguous, return a precise durable blocker for Schemer/Architect rather than extending semantics locally
  - Responsible Party Or Role: Dev

- holder-or-model-identity
  - Kind: excluded-scope
  - Description: do not make the Role artifact proof of a model/person/chat holder, permanent assignment, employment, delegation authority, handoff acceptance, or model personality
  - Responsible Party Or Role: Dev

## Completion Expectation

- Signal Kind: result
- Signal Meaning: one durable self-defined Dev `tiinex.party.role.v1` artifact in a Dev-owned additive path, or a precise durable blocker if current Role authority cannot represent the capacity truthfully, returned inside one complete updated Tiinex/site workspace with unrelated bytes preserved
- Return To: Architect
- Return To Reference: [Architect Role](../../architect/continuity/001-3-1-architect-role.trace.md)

## Interpretation Limits

- Does Not Mean: Dev accepted permanent responsibility, Dev may redefine Architect/Tooling/Schemer/Q, historical chat is source authority, nearby current source becomes assigned Dev work, or the resulting Role artifact proves who holds Dev
- Must Not Be Used To Claim: cross-role role-family closure before Architect reconciliation, canonical schema changes without Schemer authority, implementation work outside this bounded self-definition, or role stability where Dev itself records ambiguity or missing evidence

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:Hh8u6E5v9XMyjty-csRzLw2FX-8DvT-8kIeAR1GmNhk
