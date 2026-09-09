# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-09 15:03:19
  - Trace: [001-turn-2-thin-site-integration-frontier.trace.md](../001-turn-2-thin-site-integration-frontier.trace.md)
  - Origin:
    - [relative](../001-turn-2-thin-site-integration-frontier.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-09 15:03:20
  - Authors: Anchor
  - Why: Deployment should select capabilities without becoming their implementation owner.
  - Summary: Compose explicit provider and Verse packages through public App contracts.
  - Status: ready/local

---

# Site provider and Verse composition

## Objective

Update Site to compose provider-neutral App plus explicitly installed Verse/provider packages without hard-coded implementation ownership.

## Done Criteria

- Site imports Verse packages by their current public package names.
- Provider registration/configuration remains explicit and deployment-owned.
- Site does not reintroduce GitHub/native/Playthings implementation inside deployment source.
- Missing optional packages fail visibly rather than being silently replaced by Site internals.

## Scope

Site package/configuration composition only.

## Dependencies

- Parent Site Turn-2 task.
- App provider/Verse host boundary tasks.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-turn-2-thin-site-integration-frontier.trace.md](../001-turn-2-thin-site-integration-frontier.trace.md)
  - Value: Lb9Wx4rW0RKO-0ZHLYrPFSHmdH-u2Y-mEKsoF4R8KmM

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: PZhFfeWWeeuDwZKPP3jnKzky34rygtcQWQGX2oGPaxU