# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-09-07 20:43:00
  - Trace: [Sigma Character V1 Sheet Acceptance](001-1-1-5-6-1-1-character-sheet-acceptance-decision.trace.md)
  - Origin:
    - [relative](001-1-1-5-6-1-1-character-sheet-acceptance-decision.trace.md)
- Current
  - Current Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-09-08 01:24:00
  - Authors: Anchor; Sigma
  - Why: Migrate the accepted Sigma Character bytes from the earlier generic experimental filename/manifest convention into the locked named Playthings companion contract.
  - Summary: Sigma Character v1 production authority is the named `.playthings.character.png` PNG; the old manifest is historical assembly/debug material, not required runtime authority.
  - Status: accepted/local

---

# Sigma Character Named Companion Migration

## Decision

- State: accepted.
- Historical lineage source remains `001-1-1-5-6-1-sigma.playthings.png`, SHA-256 `853246ec9827bb2092e7efcf3db6c5e41894745b2ced662b144211d45ddd603c`.
- Accepted Sigma Character v1 source remains `001-1-1-5-6-1-sigma.playthings.png` in this lineage. It is not duplicated into a production tree; a future schema companion may reference or derive from it when a real schema binding is accepted.
- The historical `sigma.playthings.manifest.json` was useful during assembly but is not a required or durable runtime companion under the later named-companion contract.

## Basis

- Named companion channels are now explicit through `.playthings.character.png`, `.playthings.verb.png`, `.playthings.blueprint.png`, `.playthings.portrait.png`, `.playthings.tiles.png`, and `.playthings.props.png`.
- Runtime must infer the companion family from the filename/type template rather than a generic `.playthings.png` plus sidecar manifest.

## Consequences

- New code and documentation should reference `sigma.playthings.character.png` for production use.
- The old generic filename remains only as historical lineage evidence and must not be used as the naming pattern for new companions.
- No per-character Playthings JSON manifest is required for baseline runtime interpretation.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [Sigma Character V1 Sheet Acceptance](001-1-1-5-6-1-1-character-sheet-acceptance-decision.trace.md)
  - Value: JARw2yYnLirmRt0rvejz1MWfLq1UEn0cbpD0QjUjSng

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:od2zwiR3l-wCPkazP3WblYv7JFzHGrFvieTRB0NC_Ck
