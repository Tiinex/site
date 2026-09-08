# Continuity Context

- Envelope Schema: [tiinex.root.v1](../.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.workspace.v1](../.schemas/tiinex.workspace.v1.schema.md)
  - Created At: 2026-09-08 20:46:00
  - Authors: Anchor
  - Why: Reconcile the current deployment entrypoint after Sigma's source landing and the Core/App split; historical input bytes remain in the supplied input archive.
  - Summary: Tiinex Site deployment Workspace consuming the shared App/Core packages; reusable schema/tooling sources are not owned by Site.
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

## Workspace Entrypoints

### Tiinex site source

- Source Kind: github-tree
- Repository: Tiinex/site
- Ref: master
- Root Path: .
- Repo Files Discovery: on

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:MVr7--y9G71AdXOHOFMK5XsXG51MI64Zlqkuxmvy8I4