# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-09-08 01:35:00
  - Trace: [Playthings Asset Location And Promotion Contract](001-1-2-playthings-asset-location-and-promotion-contract-decision.trace.md)
  - Origin:
    - [relative](001-1-2-playthings-asset-location-and-promotion-contract-decision.trace.md)
- Current
  - Current Schema: [tiinex.evidence.v1](https://github.com/Tiinex/docs/blob/089427470f04336dfcc100c4dcf6289d51bf0291/.topics/.schemas/core/evidence/tiinex.evidence.v1.schema.md)
  - Created At: 2026-09-08 02:50:00
  - Authors: Anchor; Sigma
  - Why: Record the concrete correction of Playthings non-final asset filenames that previously used attachment-order numbers as if they were lineage children.
  - Summary: Same-event asset prefixes corrected and Playthings asset audit extended to detect false child dimensions.
  - Status: accepted/local

---

# Playthings Co-Event Asset Prefix Correction Evidence

## Preserved Material

- Material Description: corrected Playthings lineage-local PNG naming plus the updated placement-audit behavior.
- Material Kind: repository correction evidence.
- Material Reference: current Site Workspace.
- Represented Subject: non-final visual assets under `.topics/viewer/playthings/graphics/`.

## Preservation Act

- Preservation Method: rename only lineage-local asset paths whose numeric prefixes falsely implied a later event, update textual references, retain exact image bytes, and add a same-dimension audit rule.
- Preservation Time Or State: before the corrected full-source and all-Workspace Handoff checkpoint.
- Actor: Anchor; Sigma.
- Capture Conditions: no PNG decode/resave or pixel transformation occurred.

## Provenance

- Known Source: refined Playthings source checkpoint reviewed by Sigma.
- Provenance Limits: this correction changes filenames/references, not the historical time at which the underlying image bytes were first generated.
- Preservation Basis: Sigma clarified that numeric lineage children encode later events; attachment order belongs at the end of the slug.
- Source Artifact: [Playthings Asset Location And Promotion Contract](001-1-2-playthings-asset-location-and-promotion-contract-decision.trace.md).
- Capture Time: 2026-09-08 02:50:00.
- Custody Context: local Anchor cleanup Workspace.

## Fidelity And Loss

- Fidelity Notes: exact PNG bytes are retained unchanged.
- Known Losses: none in image content.
- Transformation: path/reference rename only.
- Uncertainty: none for the corrected paths listed below.

## Custody Or Storage Boundary

- Storage Or Custody State: durable active Site source.
- Reuse Boundary: use the corrected paths as current lineage names; do not infer a later child event from the removed attachment-index paths.
- Retention: durable.
- Permission Boundary: no remote publication implied.

## Supported Claim Or Question

- Supported Claim Or Question: whether current Playthings lineage-local assets use the same numeric dimension as the event that created them rather than attachment-order child dimensions.
- Evidence Role: source-layout correction evidence.
- Target Artifact: Playthings asset-lifecycle process and future Handoff manufacture.
- Review Context: pre-commit repository refinement.

## Evidence Material

- Material: corrected lineage-local asset paths and updated `tools/playthings/playthings-assets.mjs`.
- Material Kind: repository path/tooling correction.
- Description: same-event visual assets use the exact controlling numeric dimension; attachment order is encoded at the end of the semantic slug.
- Attachment Reference: none; the corrected files are already carried in the Site Workspace.

Corrected same-event names include:

```text
graphics/seeds/
001-verb-task-work.playthings-seed-01.png
001-place-workspace.playthings-seed-02.png
001-blueprint-schema-module.playthings-seed-03.png

graphics/root/
001-1-input-character-identity-01.png
001-1-input-verb-style-02.png
001-5-actual-input-character-identity-01.png
001-5-actual-input-verb-style-02.png
001-5-generated-01.png
```

The source bytes are unchanged; only lineage-address meaning is corrected.

## Preservation And Fidelity

- Preservation State: exact PNG bytes retained; filenames and textual references corrected.
- Fidelity Notes: no visual asset was decoded, resaved, resized, cropped, or otherwise transformed.
- Known Losses: none in image bytes; obsolete path spellings are intentionally replaced by corrected lineage addresses.
- Transformation: filesystem rename plus textual-reference update and asset-audit enhancement.
- Representation Limits: this Evidence qualifies source placement/naming, not visual content or final runtime promotion.
- Storage Boundary: active Site Workspace under `.topics/viewer/playthings/` and `tools/playthings/`.

## Verification

`node tools/playthings/playthings-assets.mjs audit` must report zero errors. Its lineage audit now requires each visual asset under `.topics/viewer/playthings/` to have at least one same-directory controlling trace with the exact same numeric dimension.

## Interpretation Limits

- Does Not Prove: visual acceptance or final schema-companion promotion.
- Not Yet Used As: runtime qualification evidence.
- Must Not Be Treated As: permission to flatten genuine later Handoff/Evidence/Decision child events into their parents.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [Playthings Asset Location And Promotion Contract](001-1-2-playthings-asset-location-and-promotion-contract-decision.trace.md)
  - Value: ZgMmOUzfnXgFufmNZ3EXNNpGm-b5gfEAn9yigoTLq-A

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:spkXDE9sBpn_Te1EAxnFWobzI20z6XjiIrBYD9HpAgI
