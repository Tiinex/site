# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-23 01:11:00
  - Trace: [Role successor conversation migration](001-11-role-successor-conversation-migration.trace.md)
  - Origin:
    - [relative](001-11-role-successor-conversation-migration.trace.md)
    - [browse + git](https://github.com/Tiinex/site/blob/refactor/.topics/development/architect/continuity/001-11-role-successor-conversation-migration.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-23 12:38:00
  - Authors: Anchor
  - Why: Preserve a discovered ontology gap before process-timing/calibration data is forced into broad Evidence/Topic or resource-allocation semantics that would make repeated interpretation more expensive.
  - Summary: Classify the durable semantic home for process measurements, benchmarks, calibration models, forecast-vs-actual error, and conversation-lineage performance observations.
  - Status: planned/local

---

# Process measurement and calibration schema classification

## Objective

Determine the precise Tiinex semantic home for repeatable process measurements, benchmarks, calibration models, and forecast-vs-actual observations so consumers can distinguish their meaning from card/schema type without repeatedly reconstructing it from prose.

## Done Criteria

- Current canonical Docs schema families are checked for an existing exact owner before proposing any new schema.
- The classification distinguishes at least: bounded measurement/observation; reproducible benchmark/conditions; calibration derived from multiple measurements/benchmarks; and forecast/projection that consumes calibration.
- Nearby broad or adjacent schemas such as Evidence, Topic, Discovery Monitoring, Resource Allocation Usage, Temporal Annotation, Signal, and Projection are accepted only when their declared semantics actually own the artifact's main value; convenience is not sufficient.
- If one or more semantic types are missing, return the smallest justified schema-family proposal with explicit parent/child placement, boundaries, required distinctions, and examples. Do not create a catch-all `metrics` dumping ground.
- Preserve the current process observations as input cases without promoting approximate human recollection into exact measurement.

## Scope

Schema/ontology classification only. No mass schema creation, Viewer integration, automated telemetry collection, or process-governance change until the semantic owner is decided.

## Dependencies

- User-provided `docs-latest.zip` snapshot (SHA-256 `fde97c2359230c9abeeb58ccf377b996f21f088d64fb2adef8cd2196b39a5398`, 672 files) is current local discovery material; publication/canonical Git binding must still be established separately for any promoted schema authority.
- Current observed use cases include approximate ChatGPT web queue time (~3 s), render time (~10–20 s early and ~1–2 min later in aging conversation lineage), increasing lineage/branch overhead, Q transport (~0–10 min), Q merge+push (~1–2 min without checksum validation), Q actual-path test/recording/feedback (~10–30 min), exact per-run ChatGPT `Worked for` values when surfaced, and historical forecast error recollection around ±20–30%.
- Conversation-rotation candidate behavior: early branch 2 should normally trigger a cold-start Handoff plus deliberate comparison against the retiring conversation so missing durable inference can be detected; branch 3–4 is an observed high-overhead condition rather than a desired normal operating state.
- Stale historical Parallax/old `Tiinex/ai` runtime timings are explicitly excluded from the current calibration basis.
- Axiom owns canonical schema/method semantics and should receive this Task at its next suitable fresh-conversation bounded leaf.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: 0NZqaKhAzkOjYByYfsHxy5q-q8gNYEVYjh2sao8BwZE
