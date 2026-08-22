# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-22 18:46:00
  - Trace: [Architect cold-start trust foundation](001-architect-cold-start-trust-foundation.trace.md)
  - Origin:
    - [relative](001-architect-cold-start-trust-foundation.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-22 18:46:02
  - Authors: Architect
  - Why: Decompose the Architect cold-start trust foundation into a bounded work unit that remains visible/recoverable in Tiinex lineage and Work in Progress projections.
  - Summary: Macro roadmap and refactor-exit recovery
  - Status: draft/local

---

# Macro roadmap and refactor-exit recovery

## Objective

Recover the historical refactor macro-roadmap and product exit intent from durable evidence so a fresh Architect understands why the refactor exists, what M0 originally did, how later milestone/capability families relate to PoC parity, and what remains before refactor completion.

## Done Criteria

- M0 original function is artifact-grounded as PoC capability extraction/parity classification rather than guessed from conversation memory.\n- M1→later milestone/capability families are reconstructed only as far as evidence permits; exact historical labels are separated from inference and unknown milestone names remain unknown.\n- Each recoverable family is classified as closed, partial, superseded/refined, or remaining with evidence pointers.\n- The retained PoC HARD PARITY obligation and the behavioral meaning of “refactor complete” are explicit: canonical architecture working is not alone sufficient if retained PoC product behavior has neither been recovered/requalified nor consciously superseded.\n- Later S1/Transition/post-M4 work is reconciled as legitimate implementation/refinement/supersession where evidence supports it, without mechanically reviving obsolete roadmap mechanics.

## Scope

Historical/project-plan recovery only. Do not reopen closed milestones merely because old artifacts exist, guess M10 or other names without evidence, or make PoC architecture implementation authority.

## Dependencies

Branch-1 continuity material, durable milestone/checkpoint artifacts, PoC parity ledgers, Q evidence, and current Architect authority model.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:ZEgp9C0rr2qKT0BPPDvX_d8xQ0Ft8JOkLZx9an3VSjo