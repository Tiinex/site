# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.topic.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/topic/tiinex.topic.v1.schema.md)
  - Created At: 2026-09-06 00:24:00
  - Trace: [Accept Or Reject And Freeze Board](001-1-1-1-accept-or-reject-and-freeze-board.trace.md)
  - Origin:
    - [relative](001-1-1-1-accept-or-reject-and-freeze-board.trace.md)
- Current
  - Current Schema: [tiinex.topic.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/topic/tiinex.topic.v1.schema.md)
  - Created At: 2026-09-06 00:25:00
  - Authors: Anchor; Sigma
  - Why: Preserve one bounded Playthings-specific production step under the Site-owned Playthings project while keeping domain-neutral process guidance separate in Business.
  - Summary: Extract And Normalize Board step in the candidate Playthings visual-source production process.
  - Status: candidate/local

---

# Extract And Normalize Board

This topic carries one bounded step of the Playthings visual-source production process.

## Current Read

The current deterministic extractor locates the top canonical-view band and walk band from foreground density, identifies walk pose centers without assuming one exact source resolution, and applies one shared scale across the whole walk strip/export profile. It does not use per-frame rescue scaling or character-specific crop coordinates.

Proof-of-two pressure material includes explorer and robot boards at multiple source dimensions. The current `world64` projection is a mechanical compatibility probe only, not the final Playthings presentation taxonomy.

## Design Direction

Keep extraction/normalization reproducible, source bytes frozen, and assumptions explicit. Fail visibly when band/pose/foreground detection is ambiguous. Future world/interior/detail/export profiles may change without regenerating accepted source boards.

## Next Artifacts

- [Review Motion And Qualify Visual Source](001-1-1-1-1-1-review-motion-and-qualify-visual-source.trace.md)


---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [Accept Or Reject And Freeze Board](001-1-1-1-accept-or-reject-and-freeze-board.trace.md)
  - Value: JlZL-ZnmAioY3OmqnjI7x1r07tkN8lKF-_YxoIqYhLQ

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:o5228WqgLbm0wZ_cuCcW7vBbfWht2a-HwJlanlcGNZs
