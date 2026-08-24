# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.signal.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/core/signal/tiinex.signal.v1.schema.md)
  - Created At: 2026-08-23 19:09:00
  - Authors: Anchor
  - Why: Preserve Q's source-neutral cold-start/discovery design signal without hard-coding Git/default-branch assumptions or prematurely minting canonical Source semantics.
  - Summary: A workspace may need one or more qualified source bindings of different kinds; the current Tiinex/site refactor branch is one useful concrete case, while future discovery could follow explicit source material for lazy traversal instead of inferring authority from host defaults.
  - Status: observed/local

---

# Workspace source binding and lazy discovery signal

## Observed Signal

- During fresh Anchor recovery, availability of a public Git repository/default branch was too easy to mistake for the relevant source-authority boundary of the transported workspace.
- Q clarified that the general problem is source-type neutral: a workspace may have different source kinds or multiple sources, and not every workspace is fundamentally a Git repository.
- A useful future candidate is for a workspace to reference one or more qualified Source artifacts/bindings. In the current Site case, one such Source could identify `Tiinex/site` on the `refactor` branch, but Git/ref is only one concrete source shape.
- Explicit Source material could later support discovery/lazy traversal: when needed material is not loaded, discovery could follow qualified source references rather than infer authority from whichever host/default source is easiest to access.

## Source

- Source: Q process/product feedback during Anchor cold-start review, grounded in the observed default-branch misorientation and the broader requirement that Tiinex workspaces may be backed by heterogeneous sources

## Interpretation

- This is strong pressure for a future source-neutral workspace/source discovery model and a useful Axiom/discovery classification candidate.
- The signal should remain separate from the current Tooling 014 scaling reconciliation and Process semantic classification unless a concrete dependency is established.

## Limits

- This signal does not establish a canonical `Source` artifact schema, cardinality, provider protocol, publication model, or lazy-loading runtime contract.
- The concrete `Tiinex/site@refactor` case is illustrative current pressure, not the semantic definition of Source.
- Source availability must not be treated as source authority merely because a host can browse it.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:wk1ewAsTnHFBxxcpKbxdfZrgtS6N5ybJ74anfXHAZ50
