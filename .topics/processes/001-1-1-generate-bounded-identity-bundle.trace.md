# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.topic.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/topic/tiinex.topic.v1.schema.md)
  - Created At: 2026-09-06 00:22:00
  - Trace: [Establish Visual Boundary](001-1-establish-visual-boundary.trace.md)
  - Origin:
    - [relative](001-1-establish-visual-boundary.trace.md)
- Current
  - Current Schema: [tiinex.topic.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/topic/tiinex.topic.v1.schema.md)
  - Created At: 2026-09-06 00:23:00
  - Authors: Anchor; Sigma
  - Why: Preserve one bounded Playthings-specific production step under the Site-owned Playthings project while keeping domain-neutral process guidance separate in Business.
  - Summary: Generate Bounded Identity Bundle step in the candidate Playthings visual-source production process.
  - Status: candidate/local

---

# Generate Bounded Identity Bundle

This topic carries one bounded step of the Playthings visual-source production process.

## Current Read

The bounded bundle currently targets one coherent visual board containing canonical FRONT, LEFT, BACK, and eight ordered LEFT-facing walk poses. The image model may materialize the whole bundle in one generation; that is acceptable and presently preferred over many cross-call regenerations when it improves identity consistency.

The bundle is not required to match a runtime grid, transparency contract, final cell size, or final schema-specific sheet layout. Labels, dividers, uneven spacing, and presentation residue may remain when local extraction can remove them deterministically.

## Design Direction

Use visible-art language only: subject identity, materials/clothing, required views, walk direction, pose count, and clean studio presentation. Do not ask the image model to understand downstream Tiinex semantics.

Treat large design drift, missing required views, missing walk poses, severe cutoffs, or incoherent identity as board-level failure. Do not repair isolated bad frames in place during this step.

## Next Artifacts

- [Accept Or Reject And Freeze Board](001-1-1-1-accept-or-reject-and-freeze-board.trace.md)


---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [Establish Visual Boundary](001-1-establish-visual-boundary.trace.md)
  - Value: v3lmmlO1Jh2qZZ8WSHt6lUw_JptJLn8rJw1G8KF47yc

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:7teHA3bEH0R3V6vesKJHL1SX74ikgA1rWNY41dKIucA
