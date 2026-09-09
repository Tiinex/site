# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-08 17:38:00
  - Trace: [025-thin-site-deployment-task.trace.md](../025-thin-site-deployment-task.trace.md)
  - Origin:
    - [relative](../025-thin-site-deployment-task.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-09 15:03:19
  - Authors: Anchor
  - Why: Site must not regain shared implementation while Turn 2 decomposes providers and Verses.
  - Summary: Keep Site thin while composing provider and Verse packages through current public boundaries.
  - Status: ready/local

---

# Turn 2 thin Site integration frontier

## Objective

Keep Site a thin official deployment that composes current App, Verse and provider packages while preserving a separately qualified historical Reduction gate.

## Done Criteria

- Site contains deployment/configuration and host-specific integration only.
- Concrete providers and Verses are selected through public packages rather than copied or private source.
- Real browser qualification covers the important host/Verse transition and visible failure states.
- Historical deletion occurs only through exact qualified Reduction evidence; unqualified history remains recoverable.

## Scope

Official web deployment, composition and Site-owned Reduction only.

## Dependencies

- Controlling Business epic: `business::.topics/initiatives/refactor/001-turn-2-stable-full-source-frontier.trace.md`.
- Existing thin Site deployment task `.topics/025-thin-site-deployment-task.trace.md`.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [025-thin-site-deployment-task.trace.md](../025-thin-site-deployment-task.trace.md)
  - Value: HtJrHXje6wzo9OZtxjZ3Ao20AjzZoA3HZjIuWRW6lCo

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: Lb9Wx4rW0RKO-0ZHLYrPFSHmdH-u2Y-mEKsoF4R8KmM