# Continuity Context

- Envelope Schema: [tiinex.root.v1](../.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.workspace.v1](../.schemas/tiinex.workspace.v1.schema.md)
  - Created At: 2026-08-25 01:10:00
  - Authors: Anchor
  - Why: Establishes a durable portable Workspace entrypoint for Tiinex/site that exists independently of any one Handoff transport package.
  - Summary: Tiinex Site workspace artifact for the Tiinex/site repository and its local viewer/tooling schema surface.
  - Status: active/local

---

# Tiinex Site

## Schema Origins

- [Tiinex docs schemas](https://github.com/Tiinex/docs/tree/master/.topics/.schemas)
  - Kind: github-tree
  - Repository: Tiinex/docs
  - Ref: master
  - Root Path: .topics/.schemas
  - Trust Role: canonical-core

- [Site local schemas](../../src/schemas)
  - Kind: app-local
  - Repository: Tiinex/site
  - Root Path: src/schemas
  - Trust Role: viewer-extension
  - Purpose: site-local schema projections and viewer/tooling implementation companions

## Workspace Entrypoints

### Tiinex site source

- Source Kind: github-tree
- Repository: Tiinex/site
- Ref: refactor
- Root Path: .
- Repo Files Discovery: on

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:A8V4J6Yw-QT0tzpBLjLYh_oJa2e6qUYdHQOS9u54KZ4
