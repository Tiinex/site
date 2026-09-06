# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-06 15:13:40
  - Trace: [Pilot To Anchor UAL 8x8 Locomotion Master Generation Return](003-3-1-5-1-3-pilot-to-anchor-ual-8x8-locomotion-master-generation-return-handoff.trace.md)
  - Origin:
    - [relative](003-3-1-5-1-3-pilot-to-anchor-ual-8x8-locomotion-master-generation-return-handoff.trace.md)
- Current
  - Current Schema: [tiinex.evidence.v1](https://github.com/Tiinex/docs/blob/089427470f04336dfcc100c4dcf6289d51bf0291/.topics/.schemas/core/evidence/tiinex.evidence.v1.schema.md)
  - Created At: 2026-09-06 16:55:00
  - Authors: Anchor; Sigma
  - Why: Review the exact Pilot-returned 8x8 candidate at row level and distinguish execution fidelity from motion acceptance before deciding whether to repair or retry bounded subsets.
  - Summary: Returned 8x8 candidate has valid alpha and useful directional rows, but front/back rows collapse motion separation and require focused regeneration.
  - Status: ready/local

---

# Anchor UAL 8x8 Row Motion Review Evidence

## Preserved Review Facts

- Returned candidate: `.topics/viewer/003-3-1-5-1-2-generated-01.png`, exact returned SHA-256 `26a7b1b0ddc5866f6d1d43458f313fb068b72934fb8abeef797b91f0773d53ab`.
- Candidate is 1254×1254 RGBA with alpha range 0..255 and contains non-empty occupancy in all 64 nominal 8×8 cells.
- The carried and host-observed first motion-authority PNG files have different encoded-byte hashes but decode to pixel-identical RGBA content. The mismatch is therefore classified as byte mismatch + decoded-pixel equivalence; host/provider cause remains unobserved.
- Identity attachment remained exact-byte identical.

## Row Motion Findings

Deterministic alpha-silhouette diagnostics compare neighboring generated frames after normalization against the corresponding UAL authority row. Higher neighboring IoU means weaker visible phase separation.

- Row 1: generated adjacent-IoU mean 0.916 versus authority 0.644 — motion separation FAIL.
- Row 2: generated 0.720 versus authority 0.285 — usable but materially flatter than authority.
- Row 3: generated 0.657 versus authority 0.246 — strongest transfer; usable.
- Row 4: generated 0.823 versus authority 0.266 — weak/borderline.
- Row 5: generated 0.941 versus authority 0.640 — motion separation FAIL.
- Row 6: generated 0.710 versus authority 0.281 — usable.
- Row 7: generated 0.721 versus authority 0.248 — usable; strongest width-profile preservation.
- Row 8: generated 0.732 versus authority 0.278 — usable.

Rows 1 and 5 correspond to the views where the projected 3D walk authority has the least obvious 2D limb separation. The generated result mostly preserves view/identity there but collapses the temporal gait. The current candidate is therefore not accepted as a complete locomotion master.

## Disposition

- Whole-sheet source: PROCESS EVIDENCE / PARTIAL CANDIDATE, not stable locomotion master.
- Rows 3, 6, 7, and 8 are suitable as reusable row seeds for later assembly; row 2 is usable with review; row 4 remains borderline.
- Regenerate the failed frontal/opposite row in a focused eight-frame 2×4 task before considering whole-sheet assembly.
- Preserve exact returned source; do not repaint it to manufacture missing gait phases.

## Interpretation Limits

- Does Not Prove: semantic correctness of every limb pose, stable runtime readiness, or that high IoU alone determines visual rejection.
- Must Not Be Used To Claim: full 8×8 PASS, provider-side failure, or semantic corruption from the first-input byte mismatch.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [Pilot To Anchor UAL 8x8 Locomotion Master Generation Return](003-3-1-5-1-3-pilot-to-anchor-ual-8x8-locomotion-master-generation-return-handoff.trace.md)
  - Value: IopjMdnSDUGKugxGmVQtVIpdEz4TZVgLs0-QO5UqkLo

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: 1uULHwRayeBOFvty4CsJEv4xJfBItl2H92-txjOLg9Y
