# Continuity Context

- Envelope Schema: [tiinex.root.v1](../../.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.topic.v1](../../.topics/.schemas/core/topic/tiinex.topic.v1.schema.md)
  - Created At: 2026-07-19 00:00:00
  - Summary: Demo topic artifact for parser/root fallback validation.

---

# Parser Grounding Topic

This topic captures the current direction for artifact parsing and root fallback in the fresh Tiinex Site shell.

## Current Read

The app should parse continuity envelope fields before child schema-specific presentation is trusted.

## Design Direction

Keep root fallback visible when a child schema module is unavailable.

## Next Artifacts

- Add feed/detail cards from parsed artifact view models.

---

# Continuity Integrity

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: demo-topic-v84-not-authoritative
