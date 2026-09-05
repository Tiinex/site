# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.topic.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/topic/tiinex.topic.v1.schema.md)
  - Created At: 2026-09-06 00:21:00
  - Trace: [Plaything Visual Source Production](001-plaything-visual-source-production-process.trace.md)
  - Origin:
    - [relative](001-plaything-visual-source-production-process.trace.md)
- Current
  - Current Schema: [tiinex.topic.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/topic/tiinex.topic.v1.schema.md)
  - Created At: 2026-09-06 00:22:00
  - Authors: Anchor; Sigma
  - Why: Preserve one bounded Playthings-specific production step under the Site-owned Playthings project while keeping domain-neutral process guidance separate in Business.
  - Summary: Establish Visual Boundary step in the candidate Playthings visual-source production process.
  - Status: candidate/local

---

# Establish Visual Boundary

This topic carries one bounded step of the Playthings visual-source production process.

## Current Read

A new Plaything identity should begin from a strong user/Sigma visual boundary when the current host lane is sticky, contaminated, or being reused from another identity. Current ChatGPT image-surface experiments showed that assistant-only resets can fail while a user-issued boundary can establish a new lane.

A clean boundary is an operating precondition, not a claim about model internals. The first generated result remains a probe: if a prior subject, layout, or presentation family resurfaces instead of the requested identity, the lane is not considered clean.

## Design Direction

Keep the boundary message visual and bounded. After the boundary, Anchor avoids evaluative/meta commentary between image calls and does not send unrelated Tiinex/process/runtime/schema/Carrier semantics to the image model.

On a failed boundary probe, stop prompt-debugging and request another human/user boundary. On a clean probe, continue directly to bounded identity-bundle generation while the lane remains coherent.

## Next Artifacts

- [Generate Bounded Identity Bundle](001-1-1-generate-bounded-identity-bundle.trace.md)


---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [Plaything Visual Source Production](001-plaything-visual-source-production-process.trace.md)
  - Value: UEt13bCdlUiKLy5fhItzZAyyBd2iSTSdcjZ_X3_nqTY

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:v3lmmlO1Jh2qZZ8WSHt6lUw_JptJLn8rJw1G8KF47yc
