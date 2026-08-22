# Continuity Context

- Envelope Schema: [tiinex.root.v1](../../tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.discovery.v1](../tiinex.discovery.v1.schema.md)
  - Created At: 2026-06-29 00:00:00
  - Trace: [tiinex.discovery.v1.schema.md](../tiinex.discovery.v1.schema.md)
  - Origin:
    - [relative](../tiinex.discovery.v1.schema.md)
    - [browse + git](https://github.com/Tiinex/docs/blob/2bf1fbeddb1bad6c98fed68bd2abb15099e91a4d/.topics/.schemas/discovery/tiinex.discovery.v1.schema.md)
- Current
  - Current Schema: [tiinex.discovery.finding.v1](tiinex.discovery.finding.v1.schema.md)
  - Created At: 2026-06-29 00:00:00
  - Summary: Schema for discovered findings that preserve something noticed, absent, unexpected, ambiguous, or worth triage during a discovery.

---

# Discovery Finding

- Status: maintained schema note

## Summary

This schema narrows discovery into a finding: one thing noticed, encountered, missing, unexpected, ambiguous, or worth triage during a discovery.

A finding is earlier than evidence. It records that something was found or not found and why it may matter, while preserving uncertainty about what role it should later play.

A finding may later become evidence, signal, feedback, pointer, relation, task, decision input, or be deferred. It should not pretend that being found makes something true.

## Schema Validation Contract

### Finding Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.discovery.finding.v1`

Rules

- `tiinex.discovery.finding.v1` identifies artifacts centered on one discovered item, absence, anomaly, lead, or triage object.
- A finding artifact should state the discovery context, finding, provenance, triage, and limits.
- A finding artifact may preserve expected, unexpected, absent, ambiguous, negative, or lead-like findings.
- A finding artifact must not overclaim the finding as evidence unless an evidence artifact separately owns preserved supporting material and supported claim.
- Prose outside `Schema Validation Contract` may explain the schema, but it does not add required validation rules.

### Parent Body Specialization

Rules

- `tiinex.discovery.finding.v1` specializes the inherited `Discovery Body`.
- The child body replaces the parent body sections for artifacts whose current schema is `tiinex.discovery.finding.v1`.
- `Discovery Context` preserves the inherited `Discovery Intent`, `Discovery Field`, and relevant method context.
- `Finding` specializes `Discovery Outcome`.
- `Provenance` specializes the method/source portion of `Discovery Method` and outcome recovery.
- `Triage` specializes the next-artifact and disposition meaning of `Discovery Outcome`.
- `Interpretation Limits` preserves the inherited limit semantics and prevents treating findings as evidence by default.

### Finding Body

Required Shape

- first body heading after the continuity envelope
- `## Discovery Context` section
- `## Finding` section
- `## Provenance` section
- `## Triage` section
- `## Interpretation Limits` section

Optional Sections

- Evidence Candidate
- Signal Candidate
- Feedback Candidate
- Pointer Candidate
- Relation Candidate
- Absence
- Freshness
- Next Step
- Linked Artifacts
- References

Rules

- A finding artifact should begin with a human-readable title.
- `Discovery Context` must identify the discovery, follow, research, expedition, monitoring, or surveillance surface that produced the finding when known.
- `Finding` must state what was found, not found, noticed, encountered, or suspected.
- `Provenance` must state where or how the finding was noticed.
- `Triage` must state the likely next role or that the role remains unknown.
- `Interpretation Limits` must state what the finding does not prove.

### Finding Classification

Allowed Shapes

- expected finding
- unexpected finding
- absence finding
- anomaly finding
- ambiguous finding
- lead finding
- negative finding
- duplicate finding
- stale finding
- blocked finding

Rules

- Finding classification should help triage without forcing certainty.
- Absence findings should distinguish not seen, not available, not searched, and not found within declared method.
- Lead findings should point toward a next hop without becoming a pointer unless the main artifact value is navigation.
- Findings based on time-sensitive sources should state freshness limits when known.

### File Naming

Allowed Shapes

- `<lineage>.trace.md`
- `<lineage>-finding.trace.md`
- `<lineage>-<finding-slug>.trace.md`

Rules

- Finding artifacts should keep the lineage label first.
- The optional slug should identify the finding, absence, anomaly, or lead.
- Finding artifacts should keep the `.trace.md` suffix stable.

### Interpretation Boundaries

Rules

- Use `tiinex.discovery.finding.v1` when the main artifact value is one discovered thing or absence needing triage.
- Do not use `tiinex.discovery.finding.v1` to replace evidence, signal, feedback, pointer, relation, task, decision, or privacy schemas.
- A finding is not evidence by default and does not become canon merely because it was noticed.

## Minimal Example

```md
# Unexpected Linked Issue Finding

## Discovery Context

- Context: bounded review of one public GitHub discussion origin

## Finding

- Finding Type: lead finding
- Finding: the discussion links to one GitHub issue that may contain relevant implementation feedback.

## Provenance

- Source: public discussion comment
- Representation: link observed during manual review

## Triage

- Candidate Role: pointer candidate and possible feedback candidate
- Next Step: inspect only the linked issue if a follow or discovery artifact declares that scope

## Interpretation Limits

- Limits: the link does not prove the issue is relevant, current, correct, or endorsed.
```

## Validation-Friendly Shape

Keep this maintained schema note in the exact section order already used here:
`Summary`, `Schema Validation Contract`, `Minimal Example`,
`Validation-Friendly Shape`, `Interpretation Notes`, and
`Artifact Creation Contract`.

Maintain the section headings exactly in this schema note. Free markdown inside
those sections is allowed, but adding undeclared new section headings should be
treated as schema drift.

## Interpretation Notes

- Finding artifacts narrow discovery without replacing parent continuity or origin semantics
- Finding artifacts should remain human-readable and provenance-oriented rather than app-runtime configuration
- Finding artifacts may lead to evidence, signal, feedback, pointer, relation, task, decision, privacy, consent, or attestation artifacts when those schemas own the later role
- Finding artifacts must state what they do not prove or authorize

## Artifact Creation Contract

### Prompt Fields

Required Fields

- version
- createTitle
- summaryPrompt
- summaryPlaceholder

Optional Fields

- whyPrompt
- whyPlaceholder
- targetPrompt
- targetPlaceholder
- boundaryPrompt
- boundaryPlaceholder

Rules

- The current finding create surface uses version `1`.
- `createTitle` should label the create action as `Create Finding`.
- `summaryPrompt` should ask for the finding title.
- `summaryPlaceholder` should guide the user toward the relevant discovery surface.
- Creation surfaces should not require runtime-specific crawler configuration.

### Template Body

Required Shape

- first heading uses `# {summary}`
- `## Discovery Context` section
- `## Finding` section
- `## Provenance` section
- `## Triage` section
- `## Interpretation Limits` section

Rules

- Generated finding artifacts should begin with the title as the first body heading.
- `Discovery Context` should be preserved in generated artifacts.
- `Finding` should be preserved in generated artifacts.
- `Provenance` should be preserved in generated artifacts.
- `Triage` should be preserved in generated artifacts.
- `Interpretation Limits` should be preserved in generated artifacts.

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.discovery.v1.schema.md](https://github.com/Tiinex/docs/blob/2bf1fbeddb1bad6c98fed68bd2abb15099e91a4d/.topics/.schemas/discovery/tiinex.discovery.v1.schema.md)
  - Value: DOEm9XKixnIUzuGNZ06-NUbtKT-GNCJ2ktmfJnqgHvo

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: lXvhkxT-dIyqZ4whxtX1jz_utFJJBUbTBnCZE6Qifos