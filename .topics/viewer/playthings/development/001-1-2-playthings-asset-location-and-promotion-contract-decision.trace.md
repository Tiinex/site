# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.topic.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/topic/tiinex.topic.v1.schema.md)
  - Created At: 2026-09-08 01:34:00
  - Trace: [Playthings Visual Production And Asset Lifecycle](../processes/001-playthings-visual-production-and-asset-lifecycle-process.trace.md)
  - Origin:
    - [relative](../processes/001-playthings-visual-production-and-asset-lifecycle-process.trace.md)
- Current
  - Current Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-09-08 01:35:00
  - Authors: Anchor; Sigma
  - Why: Lock the repository placement contract so lineage provenance stays visually inspectable without duplicating already-existing material and final companions stay co-located with the schemas they extend.
  - Summary: Accept lineage-local non-final assets, in-place references for existing assets, and schema-sibling final companions; retire the reference tree.
  - Status: accepted/local

---

# Playthings Asset Location And Promotion Contract

## Decision

```text
existing asset
→ reference it where it already lives

new non-final asset caused by lineage event
→ .topics/viewer/playthings/... beside that event

final accepted schema-bound product
→ src/schemas/... beside its schema
```

No additional durable Playthings asset tree is introduced.

## Consequences

- Repository-root `reference/` is retired.
- Transport/Handoff manufacture must resolve materials from their real Workspace paths instead of requiring a staging tree.
- Generated source filenames should share the controlling event dimension, e.g. `001-3-1-generated-01.png` beside `001-3-1-...evidence.trace.md`.
- Multiple sibling Handoffs may reference one shared existing lineage asset without copying it into every branch.
- Promotion to `src/schemas` is the moment an image becomes current product surface; provenance source may remain in `.topics` when needed for recovery.

## Final Destination

For a schema at:

```text
src/schemas/<path>/tiinex.foo.v1.schema.md
```

final product companions are only:

```text
src/schemas/<path>/tiinex.foo.v1.playthings.character.png
src/schemas/<path>/tiinex.foo.v1.playthings.verb.png
src/schemas/<path>/tiinex.foo.v1.playthings.blueprint.png
src/schemas/<path>/tiinex.foo.v1.playthings.portrait.png
src/schemas/<path>/tiinex.foo.v1.playthings.tiles.png
src/schemas/<path>/tiinex.foo.v1.playthings.props.png
```

Only types actually owned by that schema need to exist; missing channels resolve through Parent→Root at runtime.

## Interpretation Limits

- Does Not Mean: every lineage asset is duplicated into schema product.
- Does Not Mean: a source is final merely because Sigma visually approved it for continued work.
- Must Not Be Used To Claim: a schema companion exists until the file is actually promoted beside that schema.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [Playthings Visual Production And Asset Lifecycle](../processes/001-playthings-visual-production-and-asset-lifecycle-process.trace.md)
  - Value: P_rNw-rNQl8xAOiN8dpha7GSXLkfjX2olpYpTFh7SYw

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:ZgMmOUzfnXgFufmNZ3EXNNpGm-b5gfEAn9yigoTLq-A
