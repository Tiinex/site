<!-- Contract-only pressure fixture from canonical Root authority lineage through docs@053d46ce. -->
# Continuity Context

- Envelope Schema: tiinex.root.v1
- Current
  - Current Schema: tiinex.root.v1
  - Created At: 2026-08-17 00:00:00

---

# Root

## Schema Validation Contract

### Ordinary Instance Field Targeting

Rules

- An ordinary instance-field group declares `Required Fields` and/or `Optional Fields`, does not declare `Entry Shape`, and uses ordinary unqualified field labels.
- Unless an ordinary instance-field group declares `Instance Target`, its Artifact instance target is the exact second-level heading whose text equals the contract group name.
- Ordinary field occurrences are owned only by their authorized target block. Fields inside a nested heading or named-declaration-owned region are not claimed by an ancestor ordinary group merely because the label matches.

### Instance Target

Required Shape

- one literal Markdown heading token

Rules

- `Instance Target` is singular; it must not be used as a list of multiple Artifact targets.
- Heading text is interpreted using Root exact, case-sensitive heading matching.
- `Instance Target` changes field-ownership location only; it does not make an otherwise optional target section required.

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
  - Human Meaning: Exactly one complete inline Tiinex Markdown link with a non-empty single-line label and non-empty target.

Rules

- Machine-shape definitions are resolved by lineage prefix at the source point of the shape use.
- Source order inside one schema is not semantic.
- Duplicate exact-label definitions are not deduplicated.
- Human Meaning is explanatory readability authority only.
- tiinex.lexical.shape.v1 is the Root-owned generic lexical grammar profile.
