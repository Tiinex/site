# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-08-22 23:20:00
  - Trace: [Role Family Durability Reconciliation](001-3-2-role-family-durability-reconciliation-result.trace.md)
  - Origin:
    - [relative](001-3-2-role-family-durability-reconciliation-result.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-23 00:55:00
  - Authors: Architect
  - Why: Materialize the human-steered Tiinex role-name transition before the next published Site checkpoint without rewriting historical traces, importing legacy role semantics, or changing bounded peer authority.
  - Summary: Adopt current Tiinex role identities while preserving predecessor role semantics, history, and peer boundaries.
  - Status: closed/local

---

# Role family identity transition

## Objective

Establish the current Tiinex collaboration role names as a durable identity layer over the already reconciled role-family semantics, while preserving historical role labels as historical truth and preventing names from creating hierarchy, authority expansion, or semantic import from legacy experiments.

## Done Criteria

- Current role-name mapping is explicit and readable: Architect -> Anchor, Tooling -> Loom, Schemer -> Axiom, and Dev -> Kodax.
- Q is distinguished as a human/conversational handle rather than a Role label.
- Sigma is preserved as the intended human Role name while its revised current durable Role definition remains explicitly pending rather than reconstructed from legacy material by convenience.
- The transition states that role names are identity/mnemonic labels only; current bounded role semantics remain grounded in the accepted predecessor Role artifacts until role-specific successor artifacts are independently materialized and qualified.
- All roles are explicit peers. No role owns another role, no role gains command authority by sending a Handoff, and responsibility transfer does not create transitive authority.
- A receiving role retains epistemic independence: it may question, narrow, reject, or return work when grounding, authority, scope, confidence, or evidence is insufficient.
- Legacy `Tiinex/ai` role names or experiments may inform later recovery work but are not imported as current semantics merely because a current role reuses a historical name.
- Historical traces remain unchanged and may continue to name Architect, Tooling, Schemer, or Dev when that was the role identity at the time.

## Scope

Role identity and peer-relationship clarification only. This task does not redefine schema semantics, portable Tooling behavior, Site implementation ownership, human product acceptance, holder identity, delegation, employment, publication authority, current Tasks, or historical artifact meaning.

It does not perform the later conversation/role successor migrations. Those migrations may materialize successor `tiinex.party.role.v1` artifacts under the new names after independent role recovery and cold-start pressure.

## Dependencies

- [Role Family Durability Reconciliation](001-3-2-role-family-durability-reconciliation-result.trace.md) remains the semantic predecessor baseline for Architect, Tooling, Dev, and Schemer role boundaries.
- [Architect Role](001-3-1-architect-role.trace.md), [Tooling Role](../../tooling/continuity/001-tooling-role.trace.md), [Dev Role](../../dev/role/001-current-dev-role.trace.md), and the exact published Schemer Role remain the current durable semantic sources until successor Role artifacts are accepted.
- Human steering in the current collaboration establishes the preferred role identities and the peer/no-hierarchy requirement; this Task and its Decision materialize that signal without turning conversational context into hidden continuing authority.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:0MbOzsdBVVIT7eUXHJXbDiU9W3Vvehwq8pLOda4GIzI
