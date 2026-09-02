# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/4cb7046454f1cf75333097fc1a3d4562838afc26/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/4cb7046454f1cf75333097fc1a3d4562838afc26/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-02 02:25:00
  - Trace: [Tooling-First Foundation Ergonomics](005-tooling-first-foundation-ergonomics-task.trace.md)
  - Origin:
    - [relative](005-tooling-first-foundation-ergonomics-task.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/4cb7046454f1cf75333097fc1a3d4562838afc26/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-02 02:28:00
  - Authors: Anchor
  - Why: Repair the concrete first-contact branch-authority ambiguity before specialist CLI work starts, so Loom and future cold recipients share the same current-versus-PoC baseline.
  - Summary: Site Branch Authority Grounding
  - Status: accepted/local

---

# Site Branch Authority Grounding

## Objective

Make `Tiinex/site` branch purpose obvious from the ordinary `refactor` first-contact surface so a cold reader does not infer current implementation authority from Git naming conventions.

## Done Criteria

- `README.md` states that `refactor` is the current active Viewer/reference/shared Tooling implementation during Foundation work.
- `README.md` states that `master` and `poc-monolith` are PoC evidence rather than current implementation targets.
- `README.md` states that Viewer PoC parity compares observed PoC behavior from `master` + `poc-monolith` against `refactor`.
- `llms.txt` exposes the same branch authority before a cold LLM reaches deeper bootstrap material.
- The wording does not claim `refactor` is a qualified public release or that branch purpose is universal Tiinex semantics.
- No branch rename/default-branch mutation, schema change, or remote source mutation is required for this bounded repair.
- Existing Site static/front-door/checkpoint identity gates remain green after the text change.

## Scope

- `Tiinex/site` root `README.md` and `llms.txt` first-contact grounding only.
- The Business Discovery owns the organizational reason; this Site Task owns the concrete repository projection repair.
- Do not alter PoC source branches while documenting their evidence role.


## Outcome

- The carried `README.md` and `llms.txt` explicitly project `refactor` as the current active implementation and `master` + `poc-monolith` as PoC evidence, without claiming public-release qualification or universal branch semantics.
- Anchor re-grounded the carried Site source and verified the candidate against the Task Done Criteria before opening the next Tooling tranche.
- Current deterministic checks passed on the carried source: checkpoint identity, static source guards, schema bindings, schema-runtime projections, workspace schema/config/parser drift guard, and the full Foundation acceptance spine (54/54).
- No branch rename, default-branch mutation, schema change, Handoff package topology change, or remote source mutation was required.
- This acceptance is local carried-state evidence only; remote landing/publication remains separately unproven until explicitly requested and verified.

## Dependencies

- Business Site Branch Authority Grounding Discovery.
- Current public branch observations: `master` and `poc-monolith` as PoC evidence; `refactor` as current active implementation.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [Tooling-First Foundation Ergonomics](005-tooling-first-foundation-ergonomics-task.trace.md)
  - Value: jw4P4fYtwsJFltZP-iRKrzsQMWMyOpXliDB_2mBn48M

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: mncosttRwJYRkFDIQQE1y3BqD5H0dosVG0O9agG99WU
