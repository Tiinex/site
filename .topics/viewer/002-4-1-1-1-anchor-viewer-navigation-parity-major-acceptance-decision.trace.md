# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.feedback.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/feedback/tiinex.feedback.v1.schema.md)
  - Created At: 2026-09-03 15:27:49
  - Trace: [002-4-1-1-anchor-materialized-sigma-viewer-navigation-human-acceptance-feedback.trace.md](002-4-1-1-anchor-materialized-sigma-viewer-navigation-human-acceptance-feedback.trace.md)
  - Origin:
    - [relative](002-4-1-1-anchor-materialized-sigma-viewer-navigation-human-acceptance-feedback.trace.md)
- Current
  - Current Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-09-03 15:28:11
  - Authors: Anchor
  - Why: The technical and human gates are both satisfied at the pushed checkpoint; close the navigation slice without overstating later Viewer parity, polish, or release readiness.
  - Summary: Anchor closes the bounded Viewer Navigation Parity major after green technical qualification, Sigma practical browser PASS, and verification of the pushed refactor checkpoint.
  - Status: ready/local

---

# Viewer Navigation Parity — Major Acceptance Decision

## Decision

- Decision: accept and close the bounded Viewer Navigation Parity Recovery major at the pushed `refactor` checkpoint `3962609e716f570662a7db14a2e8feb099ff372e`.
- State: accepted/local major checkpoint.
- Human gate: satisfied by Sigma's direct PoC/Test browser comparison and practical PASS observation, materialized by Anchor in the immediate Parent Feedback.
- Technical gate: satisfied by Kodax Evidence, Anchor independent reproduction, and the pushed commit's successful GitHub `build-public` validation job.

## Basis

- Kodax returned a cold-sufficient candidate after the return-carrier recipient-role correction; the implementation itself remained unchanged through that transport fix.
- Anchor independently reproduced focused Viewer navigation parity, typecheck, UI-shape, and the complete Foundation acceptance spine at 57/57 before routing Sigma.
- Sigma's recording exercises the current Test build against the PoC reference in actual browser use and reports the experience as decent and not too laggy.
- The recording visibly exercises source/workspace loading, Feed and Tree discovery states, filtering/display controls, artifact browsing, and state transitions without an acceptance-blocking navigation stall. Slower visible intervals are coupled to explicit import/source progress rather than unexplained UI freeze.
- GitHub `refactor` currently points to `3962609e716f570662a7db14a2e8feb099ff372e`, whose `build-public` job passed source validation, portable CLI smoke, UI shape guard, typecheck, runtime smoke, UC-001 workflow, storage scan, metrics diagnostics, public build, output check, and Pages artifact upload.
- The separate `deploy-public` job failed before executing deployment steps on `refactor`; this remains non-blocking branch/pipeline noise and is not treated as a Viewer source-quality failure.

## Consequences

- Viewer Navigation Parity is accepted at its bounded product-contract level: Feed and Tree remain discovery/material projections over stable artifact identity; Lineage remains declared semantic-relation truth; filtering/display state remains presentation-only; navigation/return context is usable enough for this tranche.
- Kodax's Viewer implementation remains frozen and may leave active implementation duty for this major.
- The PoC remains a behavior/interaction reference, not architecture authority. The `playthings` branch remains an optimization/reference source only; selective reuse must preserve accepted semantics and never make UI caches authoritative.
- Before the next implementation major, Anchor should complete the already-agreed housekeeping boundary: migrate Kodax into the canonical Business role registry and perform a post-pushed-checkpoint Reduction that removes superseded current-lineage burden while retaining immutable Git recovery references and unresolved debt.
- After that housekeeping checkpoint, the next product major is Viewer Artifact + Action Parity unless Reduction discovery exposes a genuine prerequisite.

## Limits

- This decision does not claim complete Viewer PoC parity, final visual polish, formal latency benchmarking, public release readiness, or Foundation exit.
- This decision does not authorize Extension/Host Bridge work, broad visual redesign, Viewer-side semantic inference, package semantic redesign, or remote mutation by Anchor.
- This decision does not make the Viewer-local Kodax Role canonical; organizational role migration remains required before future Kodax handoffs should be treated as clean precedent.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [002-4-1-1-anchor-materialized-sigma-viewer-navigation-human-acceptance-feedback.trace.md](002-4-1-1-anchor-materialized-sigma-viewer-navigation-human-acceptance-feedback.trace.md)
  - Value: CqcLxQ8Kadh1Y_x6tGmUYTvQHqVsJNA2qDFyAV0eMjA

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: oCWWGzVfTncjWm53ZUjkmainUEOMeTO13rYuy3ooSSM