# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/4cb7046454f1cf75333097fc1a3d4562838afc26/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/4cb7046454f1cf75333097fc1a3d4562838afc26/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-09-02 02:20:00
  - Trace: [Foundation-Critical Schema Read Companions Acceptance Decision](004-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-anchor-foundation-critical-read-companions-acceptance-decision.trace.md)
  - Origin:
    - [relative](004-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-anchor-foundation-critical-read-companions-acceptance-decision.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/4cb7046454f1cf75333097fc1a3d4562838afc26/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-02 02:25:00
  - Authors: Anchor; Sigma
  - Why: Start the next materially distinct Site/Tooling track with explicit grounding first and a dramatically smaller common CLI interaction surface before Viewer PoC implementation resumes.
  - Summary: Tooling-First Foundation Ergonomics
  - Status: accepted/local

---

# Tooling-First Foundation Ergonomics

## Objective

Make the ordinary Tiinex operational path obvious, bounded, and cheap enough for humans and LLMs to use routinely, while preserving the richer internal operation catalog and exact semantic/qualification behavior underneath.

## Done Criteria

- Site first-contact material explicitly distinguishes current active implementation from PoC evidence; branch names/default-branch conventions are not treated as authority.
- The common CLI path exposes a small memorable set of user-oriented operations with predictable positional inputs and safe defaults, while specialist/internal operations may remain available without dominating first contact.
- Normal read/orient/copy-like work should require minimal command ceremony and minimal output/context by default; details remain explicitly requestable.
- Common commands compose over the same canonical portable operations rather than creating a second semantic runtime or bypassing qualification.
- Error states fail explicitly and preserve provenance/authority boundaries; simplification must not hide blocked, degraded, ambiguous, or unqualified state.
- Help/first-contact text prioritizes the common path rather than dumping the entire specialist catalog before the user has oriented.
- Tooling remains host-neutral and source-safe: normal reads do not imply remote mutation, execution of received code, or hidden network behavior.
- Representative LLM cold-start/operation runs measure command/output/context burden after simplification instead of assuming the new façade is cheaper.
- Viewer-required primitives discovered from PoC evidence remain reachable through Tooling before corresponding Viewer implementation claims parity.

## Scope

- Site/Tooling repository grounding projection, common CLI façade, command/help ergonomics, bounded summaries/default output, and measurement of ordinary operational context cost.
- Preserve the rich operation catalog where it remains useful for advanced, internal, diagnostic, or explicit workflows.
- Do not redesign canonical schemas to simplify command names.
- Do not implement Viewer PoC parity in this Task; Viewer recovery consumes the qualified Tooling primitives afterward.

## Dependencies

- Accepted Foundation-critical read-companion tranche and current `refactor` source.
- Business Foundation priority: grounding → CLI/LLM ergonomics → Viewer PoC parity → public trust → Foundation exit.
- Business Site Branch Authority Grounding Discovery.
- Business Viewer PoC Parity Recovery outcome and its Tooling-prerequisite direction.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/4cb7046454f1cf75333097fc1a3d4562838afc26/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [Foundation-Critical Schema Read Companions Acceptance Decision](004-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-anchor-foundation-critical-read-companions-acceptance-decision.trace.md)
  - Value: gbzsMrNzE442u76cIwkWRlaya20YNLvdEznqQ8WTzWg

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/4cb7046454f1cf75333097fc1a3d4562838afc26/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:jw4P4fYtwsJFltZP-iRKrzsQMWMyOpXliDB_2mBn48M
