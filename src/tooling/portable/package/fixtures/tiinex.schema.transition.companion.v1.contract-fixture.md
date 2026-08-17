<!-- Contract-only pressure fixture transcribed from Tiinex/docs@053d46ce. -->
# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: tiinex.root.v1
  - Trace: root.md
  - Origin: root.md
- Current
  - Current Schema: tiinex.schema.transition.companion.v1
  - Created At: 2026-08-17 00:00:00

---

# Schema Transition Companion

## Schema Validation Contract

### Schema Transition Companion Body

Required Shape

- `## Schema Binding` section
- `## Transition Attachments` section
- `## Interpretation Limits` section

### Schema Binding

Required Fields

- Schema Reference

Optional Fields

- Note

Field Value Constraints

- Schema Reference
  - Allowed Shape: Markdown Link
  - Domain Policy: closed

### Transition Attachment Declaration

Entry Shape

- First-Level Hyphen List Item

Required Fields

- Transition Reference

Optional Fields

- Note

Field Value Constraints

- Transition Reference
  - Allowed Shape: Markdown Link
  - Domain Policy: closed

Rules

- Entries under `## Transition Attachments` are repeated named declarations using this shape.
- The literal entry `none` is allowed only as the sole `## Transition Attachments` entry and is exempt from declaration fields.

### Interpretation Limits

Required Fields

- Does Not Mean
- Must Not Be Used To Claim
