# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.evidence.v1](https://github.com/Tiinex/docs/blob/089427470f04336dfcc100c4dcf6289d51bf0291/.topics/.schemas/core/evidence/tiinex.evidence.v1.schema.md)
  - Created At: 2026-09-08 00:16:00
  - Trace: [Root Tiles Generation Execution Evidence](001-3-1-root-tiles-generation-execution-evidence.trace.md)
  - Origin:
    - [relative](001-3-1-root-tiles-generation-execution-evidence.trace.md)
- Current
  - Current Schema: [tiinex.evidence.v1](https://github.com/Tiinex/docs/blob/089427470f04336dfcc100c4dcf6289d51bf0291/.topics/.schemas/core/evidence/tiinex.evidence.v1.schema.md)
  - Created At: 2026-09-08 01:16:00
  - Authors: Anchor; Sigma
  - Why: Separate visual/source acceptance from deterministic runtime-topology qualification for the exact returned Root Tiles atlas.
  - Summary: Exact Root Tiles source is strongly isolated as 64 authored components, while abstract adjacency-mask slot ordering remains unqualified.
  - Status: recorded/local

---

# Root Tiles Source Isolation And Topology Qualification Evidence

## Preserved Material

- Material Description: exact returned Root Tiles authoring atlas.
- Material Kind: image/png
- Material Reference: [Root Tiles generation candidate](001-3-1-generated-01.png)
- Represented Subject: one 8×8 Root architectural tile-family source.
- Source: exact Pilot-to-Anchor return bytes.

## Preservation Act

- Preservation Method: byte-exact returned source retained unchanged before analysis.
- Preservation Time Or State: after Pilot return and Sigma visual approval.
- Actor: Anchor; Sigma.
- Capture Conditions: analysis operated on a decode of the exact returned PNG and did not mutate the source.

## Provenance

- Known Source: Root Tiles generation return.
- Provenance Limits: provider-internal generation state is unavailable.
- Preservation Basis: SHA-256 and exact carried source bytes.
- Source Artifact: [Root Tiles Generation Execution Evidence](001-3-1-root-tiles-generation-execution-evidence.trace.md)
- Capture Time: 2026-09-08 01:16:00
- Custody Context: local Anchor review workspace.

## Fidelity And Loss

- Fidelity Notes: source PNG is 1254×1254 RGBA, 1,872,887 bytes, SHA-256 `4dec8a0851b9cd31af000053e7e29524a84720c995a61fe3a8069d983e65624c`.
- Known Losses: none to source bytes; analysis uses decoded alpha only.
- Transformation: none to source authority.
- Uncertainty: exact semantic mapping from each floor/wall/roof source cell to ascending N/E/S/W bitmask values is not proven by the returned pixels alone.

## Custody Or Storage Boundary

- Storage Or Custody State: accepted source is lineage-local beside the Root Tiles execution Evidence as `001-3-1-generated-01.png`.
- Reuse Boundary: safe for deterministic source isolation, visual reference, and later tile compilation; not yet safe to claim the full runtime bitmask table.
- Retention: durable accepted source while Root tile compiler/runtime contract is qualified.
- Permission Boundary: no remote publication is implied by this Evidence.

## Supported Claim Or Question

- Supported Claim Or Question: whether the exact Root Tiles return is technically separable into 64 authored cells and whether it already proves the locked binary adjacency-slot semantics.
- Evidence Role: deterministic technical qualification.
- Target Artifact: Root Tiles source acceptance and later runtime/compiler work.
- Review Context: source separation, foreign-alpha pruning, semantic-slot qualification.

## Evidence Material

- Material: [Root Tiles generation candidate](001-3-1-generated-01.png)
- Material Kind: image/png
- Description: visually approved Root Tiles source.
- Attachment Reference: `.topics/viewer/playthings/graphics/root/001-3-1-generated-01.png`.
- Sample Reference: SHA-256 `4dec8a0851b9cd31af000053e7e29524a84720c995a61fe3a8069d983e65624c`.

## Preservation And Fidelity

- Preservation State: exact-source-preserved; analysis-only.
- Fidelity Notes: source bytes remain unchanged; connected-component analysis used decoded alpha and did not rewrite the PNG.
- Known Losses: none to the preserved source; three one-pixel foreign-alpha specks are only classified for later deterministic pruning.
- Transformation: none to source authority.
- Representation Limits: component count and spatial grouping are mechanically evidenced; binary topology identity is not.
- Storage Boundary: accepted source is lineage-local beside the Root Tiles execution Evidence as `001-3-1-generated-01.png`.

## Deterministic Isolation Result

Using decoded alpha threshold `>16` and 8-neighbour connected-component analysis:

```text
connected components total excluding background: 67
major authored components with area > 1000 px: 64
foreign one-pixel alpha components: 3
major component distribution: 8 rows × 8 columns
```

The 64 major components sort cleanly into eight spatial rows with eight components per row. This is strong evidence that the source-generation separation constraint succeeded and that deterministic cell isolation is possible without repainting.

The three one-pixel components are foreign-alpha noise and may be pruned deterministically without changing authored tile content.

## Family Read

The returned source visually groups as requested:

```text
rows 1-2  floor family
rows 3-4  wall family
rows 5-6  roof family
row 7     doorway/window family
row 8     stairs family
```

Doorways and stairs are visibly present, supporting the intended multi-floor building source vocabulary.

## Topology Gate

The prior Tiles template requested floor/wall/roof slots as ascending adjacency masks using `N=1, E=2, S=4, W=8`.

The exact source is visually coherent, but deterministic geometry inspection does not uniquely prove all sixteen bitmask identities in ascending order. Several source cells have near-duplicate directional extension geometry, and abstract prompt order is not sufficient evidence of runtime slot semantics.

Therefore:

```text
source separation          PASS
64 authored tile cells     PASS
family/category layout     PASS
visual acceptance          PASS
binary mask slot mapping   PENDING
runtime 32×32 compiler     PENDING
```

## Consequence For Runtime Work

Do not silently treat source position `0..15` as verified bitmask identity.

Before adjacency autotiling becomes authority, choose one of these grounded paths:

- provide a concrete visual topology authority and regenerate only if needed; or
- define a smaller generator-friendly primitive vocabulary and deterministically rotate/compile it into the 16 runtime masks; or
- manually classify the accepted source slots in a separate explicit compiler map, then qualify seams/joins.

The current accepted source remains useful for Root world prototyping even before full autotile-mask qualification: base floor/wall/roof material, doorways, windows, and stairs can be exercised without claiming unproven adjacency semantics.

## Interpretation Limits

- Not Yet Used As: accepted `root.playthings.tiles.png` runtime companion or verified adjacency-mask table.
- Does Not Prove: ascending mask identity for all 48 floor/wall/roof topology cells.
- Does Not Mean: visual approval is withdrawn.
- Must Not Be Treated As: permission to infer semantic mask order from image position without a later qualification artifact.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [Root Tiles Generation Execution Evidence](001-3-1-root-tiles-generation-execution-evidence.trace.md)
  - Value: lcBYxKVx9yMoSjTdlXZr6g6x-Lig8xvXKxfz0jl18qM

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:ty52M7uuhRl_0A1QIROgd7UJ8HreUd7HlB392QGyh7Y
