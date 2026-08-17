<!-- Contract-only pressure fixture transcribed from Machine Shape Authority in Tiinex/docs@d69b8ff55a56b8cb9282b8684db6a938a4435b94. Not a canonical snapshot. -->
# Continuity Context

- Envelope Schema: tiinex.root.v1
- Current
  - Current Schema: tiinex.root.v1
  - Created At: 2026-08-16 00:00:00

---

# Root Machine Shape Authority Fixture

## Schema Validation Contract

### Machine Shape Authority

Entry Shape

- Named Declaration

Declaration Fields

- Grammar Profile
- Start Rule
- Grammar Rule
- Human Meaning

Machine Shape Definitions

- Markdown Link
  - Grammar Profile: tiinex.lexical.shape.v1
  - Start Rule: markdown-link
  - Grammar Rule: markdown-link = "[" label "](" target ")"
  - Grammar Rule: label = ANY-EXCEPT("]", TAB, CR, LF)+
  - Grammar Rule: target = ANY-EXCEPT(")", SPACE, TAB, CR, LF)+
  - Human Meaning: Exactly one complete inline Tiinex Markdown link with a non-empty single-line label and non-empty target. ASCII space is allowed in the label; ASCII space, tab, CR, and LF are forbidden in the target.

Rules

- Machine-shape definitions are resolved by lineage prefix at the source point of the shape use.
- Source order inside one schema is not semantic.
- Duplicate exact-label definitions are not deduplicated.
- Human Meaning is explanatory readability authority only.
- tiinex.lexical.shape.v1 is the Root-owned generic lexical grammar profile.
