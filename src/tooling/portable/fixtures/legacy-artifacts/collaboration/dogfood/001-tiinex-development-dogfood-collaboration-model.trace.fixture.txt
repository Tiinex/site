# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/tiinex.root.v1.schema.md)
- Repairs:
  - Historical canonical representation repair
    - Target: [pre-repair published representation](https://github.com/Tiinex/site/blob/32c7c291101b2a6a72c12241f3107d4a56af81fc/.topics/development/collaboration/dogfood/001-tiinex-development-dogfood-collaboration-model.trace.md)
    - Note: Canonically repaired after v475-v478 qualified the authoring/validation/reference/integrity oracles; pre-repair Git blob 8db25b99346cec48439a641f490c9954f3d89aa7.
    - Reason: Preserve original body/work-result meaning and historical Current Created At while replacing false-PASS envelope, schema-reference, continuity, and integrity representation.
- Current
  - Current Schema: [tiinex.topic.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/topic/tiinex.topic.v1.schema.md)
  - Created At: 2026-08-21 16:33:00
  - Authors: Tiinusen; Architect
  - Summary: Tiinex development dogfood collaboration model

---

# Tiinex development dogfood collaboration model

This topic captures the current direction for Tiinex development dogfood collaboration model.

## Current Read

The Tiinex project has begun using its own artifact/tooling model for Architect, Tooling, Dev, and human handoffs. A repository/worktree ZIP is transported between workers; the ZIP mirrors the real Site tree and excludes .git rather than wrapping project truth in a separate transport envelope. The included Site tooling is expected to be sufficient when full source is present. bootstrap.zip remains the portable/minified tooling distribution for cases where full Site source is intentionally absent. Git remains source history/publication and is not replaced by the ZIP.

## Design Direction

Treat chat sessions as replaceable workers and Tiinex artifacts as durable collaboration context. Human handoff text should carry only the routing delta needed for the session: role when a fresh session needs it, the exact controlling artifact, and expected return shape. WHAT, WHY, acceptance, lineage, and durable decisions belong in Tiinex artifacts. Discovery placement follows workspace configuration; .topics is a configurable convention/default rather than semantic authority. Only qualified Tiinex artifacts are cross-read semantically; remote Schema, Companion, and Transition material is declarative data, never remotely executable code. Record real authorship separately from transport/provenance: Tiinusen is the human collaborator nickname to use when he is an author or co-author.

## Next Artifacts

Continue dogfooding with Tooling and then a fresh Dev session using the same repo-mirror ZIP pattern. Observe whether LLM workers can discover bounded current work without hidden conversational context and whether Tiinusen can follow the lineage in the viewer as a human. Record friction rather than silently routing around it, especially authorship authoring/presentation, current-work discovery, lineage readability, export size, and viewer/local discovery behavior.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: 2zmo_kpYfcR_3-9LZAd4DNjCDVDU-XDOCucl1yWHw54
