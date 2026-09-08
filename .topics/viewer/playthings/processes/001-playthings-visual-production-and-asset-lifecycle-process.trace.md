# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.evidence.v1](https://github.com/Tiinex/docs/blob/089427470f04336dfcc100c4dcf6289d51bf0291/.topics/.schemas/core/evidence/tiinex.evidence.v1.schema.md)
  - Created At: 2026-09-08 01:33:00
  - Trace: [Legacy Viewer Playthings Lineage Reduction Evidence](../development/001-1-1-legacy-viewer-playthings-lineage-reduction-evidence.trace.md)
  - Origin:
    - [relative](../development/001-1-1-legacy-viewer-playthings-lineage-reduction-evidence.trace.md)
- Current
  - Current Schema: [tiinex.topic.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/topic/tiinex.topic.v1.schema.md)
  - Created At: 2026-09-08 01:34:00
  - Authors: Anchor; Sigma
  - Why: Consolidate the proven Playthings Pilot flow, return-state correction, source-fidelity rules, lineage-local asset placement, schema-companion promotion, fan-out, normalization, and retention behavior into one current process after repository cleanup.
  - Summary: Current Playthings visual production, Pilot return, asset placement, promotion, and reduction process.
  - Status: accepted/local

---

# Playthings Visual Production And Asset Lifecycle

## Pilot Boot UX

A fresh Pilot keeps the already-working interaction shape. Its first useful response presents:

1. the exact reference assets the human needs;
2. the exact generation text in its own fenced Markdown code block;
3. the exact post-generation user text in a separate fenced Markdown code block.

The post-generation text for new Playthings routes is exactly:

```text
Approved. No more image generation. Create and return the Tiinex handoff package from the current approved output.
```

No extra setup turn or new user-facing state machine is added.

## Hard Return Gate

When that exact normalized text is received, Pilot enters return-only state **before tool selection**.

Allowed work is only:

```text
preserve exact current result
→ truthful execution Evidence
→ Pilot-to-return-role Handoff
→ manufacture / qualify Handoff package
→ stop
```

Image generation, creative retry, search/exploration, and ambient repository work are forbidden in this state. The human-facing phrase communicates intent; the pre-tool allowlist is the actual dispatch guard.

Historical artifacts that recorded `continue to return` remain historical truth where retained. New routes use the sentence above.

## Human-Mediated Boundary

If the Handoff declares a human-mediated external generation, Pilot exposes references/instructions and waits. Pilot-held image-generation capability does not change that boundary. Any direct substitution is recorded as a process deviation even if the pixels are later visually accepted.

## Asset Placement Invariant

There are only three durable placement cases:

```text
asset already exists in the Workspace
→ reference the existing asset in place
→ do not duplicate it merely to make lineage look local

new asset arises because of a lineage event
+ asset is not final runtime product
→ place it beside the controlling Task/Handoff/Evidence/Decision
→ share that event's numeric lineage prefix where practical

accepted final runtime product bound to a schema
→ src/schemas/<schema path>/<schema>.playthings.<type>.png
→ sibling of the schema artifact it belongs to
```

The repository-root `reference/` directory is not part of the Playthings production model.

If an external upstream asset must be physically carried for reproducibility, carry it as an explicit lineage input with license/source evidence. Do not create a parallel long-lived reference tree.

## Source Fidelity

- Preserve exact returned source bytes before transforms.
- Separate source-generation defects from deterministic-tooling defects.
- Use frame-zones / empty-gap segmentation when one frame contains disconnected but semantically related material.
- Do not use largest-connected-component isolation as a universal rule.
- Request clear empty space between generated frames/cells.
- Compare native source → isolated frames/cells → normalized derivative → decoded review derivative.
- Lossless WebP/contact sheets are temporary review surfaces, not canonical product.
- Deterministic normalization may translate, center, align, scale, reorder, and prune foreign-alpha noise when recorded; it does not repaint source content.

## Tiles Qualification

A visually pleasing 8×8 atlas is source-quality evidence, not proof of the final adjacency table.

Tiles requires:

```text
source cell isolation
→ primitive/category qualification
→ deterministic compiler/topology mapping
→ 32×32 runtime tile cells
→ world-assembly integration
```

Do not rely on image generation to encode abstract `N=1,E=2,S=4,W=8` mask ordering perfectly. Prefer generator-readable primitives/layout plus deterministic compilation/rotation/classification.

## Multi-Route Fan-Out

Parallel independent generation uses:

```text
one shared Handoff package
+ multiple qualified Handoff routes
+ one separate transport text per route
+ one fresh Pilot conversation per route
```

No route may continue into sibling work.

## Tooling Surface

`tools/playthings/playthings-assets.mjs` implements the storage rule:

```text
node tools/playthings/playthings-assets.mjs import   --asset <new-returned-file>   --artifact <controlling.trace.md>   --label generated-01

node tools/playthings/playthings-assets.mjs promote   --source <accepted-lineage.png>   --schema src/schemas/.../<schema>.schema.md   --type character|verb|blueprint|portrait|tiles|props

node tools/playthings/playthings-assets.mjs audit
```

`import` references an asset in place when it already belongs to the Workspace; it copies only a genuinely external/new non-final asset into the controlling lineage. `promote` leaves provenance source intact and creates the schema-sibling final companion.

## Naming Contract

Final companions retain `.playthings.`:

```text
<schema>.playthings.character.png
<schema>.playthings.verb.png
<schema>.playthings.blueprint.png
<schema>.playthings.portrait.png
<schema>.playthings.tiles.png
<schema>.playthings.props.png
```

No generic `.playthings.png` production target and no per-schema Playthings JSON/Markdown sidecar is required.

## Retention And Reduction

Keep by default:

- accepted exact source needed for provenance/recovery;
- final named schema companions;
- concise Task/Evidence/Decision/process artifacts that still explain current authority;
- deterministic tooling needed to reproduce normalized product.

Delete/reduce by default once no longer needed:

- transport ZIPs inside source repositories;
- rejected visual attempts;
- temporary review WebPs/contact sheets/debug JSON;
- duplicate copies created only for transport;
- obsolete iterative continuation Handoffs whose useful lessons have been synthesized.

## Interpretation Limits

- Does Not Mean: every accepted source is automatically a final schema companion.
- Does Not Mean: an already existing source must be copied into `.topics`.
- Does Not Mean: cleanup authorizes runtime redesign without a reviewed runtime slice.
- Must Not Be Used To Claim: visual acceptance proves process conformance or Tiles topology.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [Legacy Viewer Playthings Lineage Reduction Evidence](../development/001-1-1-legacy-viewer-playthings-lineage-reduction-evidence.trace.md)
  - Value: UYPdAGw02iZtP-Ok22_MYiJ8ZeCn6cCr88O7v_neDcc

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:P_rNw-rNQl8xAOiN8dpha7GSXLkfjX2olpYpTFh7SYw
