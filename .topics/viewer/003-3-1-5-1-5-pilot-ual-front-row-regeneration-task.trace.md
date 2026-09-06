# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.evidence.v1](https://github.com/Tiinex/docs/blob/089427470f04336dfcc100c4dcf6289d51bf0291/.topics/.schemas/core/evidence/tiinex.evidence.v1.schema.md)
  - Created At: 2026-09-06 16:55:00
  - Trace: [Anchor UAL 8x8 Row Motion Review Evidence](003-3-1-5-1-4-anchor-ual-8x8-row-motion-review-evidence.trace.md)
  - Origin:
    - [relative](003-3-1-5-1-4-anchor-ual-8x8-row-motion-review-evidence.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-06 16:55:00
  - Authors: Anchor; Sigma
  - Why: Recover one failed directional walk row with a focused eight-frame authority at larger per-pose scale instead of regenerating the entire 64-slot master.
  - Summary: Pilot-mediated UAL front-row eight-phase regeneration Task.
  - Status: active/local

---

# Pilot-Mediated UAL Front-Row Regeneration

## Objective

Execute one bounded human-mediated image-generation attempt that retargets one focused UAL eight-frame walk-row authority to the accepted Plaything identity, returning exact source and evidence to Anchor for row-level motion review and later deterministic 8x8 assembly.

## Done Criteria

- Pilot uses exactly the ordered motion-row and identity authorities carried with the Handoff.
- One external generation attempt returns exactly eight same-direction full-body poses in a 2×4 transparent layout.
- Pilot preserves exact observed inputs/result and reports byte/pixel fidelity layers separately when evidence permits.
- Pilot authors Evidence and a return Handoff, manufactures the return package, then stops immediately under the Site-local terminal containment specialization.
- Pilot does not inspect ambient workspace/Tooling implementation after terminal package manufacture and does not accept/reject the visual source.

## Scope

One directional eight-frame regeneration attempt only. No whole-sheet retry, no identity redesign, no generative repair, no stable promotion, and no secondary attempt unless separately delegated.

## Dependencies

- Business Pilot Role at `business::.topics/roles/001-7-pilot-role.trace.md`.
- Site-local Pilot terminal containment specialization at `.topics/processes/001-1-playthings-pilot-terminal-containment-and-fidelity-specialization.trace.md`.
- Exact focused motion authority, identity authority, attachment manifest, and execution request under the same outbound Handoff lineage stem.
- A human-operated external image-generation context able to accept two image references and expose the returned source when available.
- Tiinex portable Tooling carried by the Handoff package for Evidence/return manufacture.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [Anchor UAL 8x8 Row Motion Review Evidence](003-3-1-5-1-4-anchor-ual-8x8-row-motion-review-evidence.trace.md)
  - Value: 1uULHwRayeBOFvty4CsJEv4xJfBItl2H92-txjOLg9Y

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: qdeZmX_WnZd_Wzn_XrFklkt_ozPhpN-6M9ucrLGYnqU
