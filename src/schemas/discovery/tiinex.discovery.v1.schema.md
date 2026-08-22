# Continuity Context

- Envelope Schema: [tiinex.root.v1](../tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.root.v1](../tiinex.root.v1.schema.md)
  - Created At: 2026-06-14 00:00:00
  - Trace: [tiinex.root.v1.schema.md](../tiinex.root.v1.schema.md)
  - Origin:
    - [relative](../tiinex.root.v1.schema.md)
    - [browse + git](https://github.com/Tiinex/docs/blob/df3260c77a7c14b2ece67456d1a9fe4b3e026a7c/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.discovery.v1](tiinex.discovery.v1.schema.md)
  - Created At: 2026-06-29 00:00:00
  - Summary: Schema for intentional discovery artifacts that preserve bounded search, exploration, inquiry, and observation as readable provenance.

---

# Discovery

- Status: maintained schema note

## Summary

This schema defines artifacts whose main job is to preserve an intentional act of discovery: a bounded search, exploration, inquiry, follow, survey, monitoring pass, expedition, or other attempt to notice what is present, absent, changing, unknown, or worth following.

Discovery is not a runtime crawler configuration. It is a provenance artifact for making the journey legible: why the search began, where it was allowed to look, how it proceeded, what it found or did not find, what remained uncertain, and what later artifacts may result.

A discovery artifact should let later readers understand the route without treating every discovered item as evidence, truth, canon, or permission to keep looking.

## Schema Validation Contract

### Discovery Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.discovery.v1`

Rules

- `tiinex.discovery.v1` identifies artifacts centered on an intentional bounded discovery act.
- A discovery artifact should state the discovery intent, field, method, boundaries, outcome, and interpretation limits.
- Discovery artifacts may describe search, exploration, inquiry, follow, survey, monitoring, expedition, or research surfaces without becoming app runtime configuration.
- Discovery artifacts must not silently turn discovered material into evidence, feedback, signal, relation, pointer, decision, or canonical lineage.
- Prose outside `Schema Validation Contract` may explain the schema, but it does not add required validation rules.

### Discovery Body

Required Shape

- first body heading after the continuity envelope
- `## Discovery Intent` section
- `## Discovery Field` section
- `## Discovery Method` section
- `## Discovery Boundaries` section
- `## Discovery Outcome` section
- `## Interpretation Limits` section

Optional Sections

- Starting Question
- Prior Context
- Route Or Pass
- Findings
- Absence
- Uncertainty
- Linked Artifacts
- Evidence Candidates
- Signal Candidates
- Feedback Candidates
- Pointer Candidates
- Relation Candidates
- Next Artifacts
- References

Rules

- A discovery artifact should begin with a human-readable title.
- `Discovery Intent` must state why discovery was undertaken and what it sought to learn, notice, test, follow, or map.
- `Discovery Field` must state where discovery may happen and what is in scope.
- `Discovery Method` must state how discovery was or should be performed in human-readable terms.
- `Discovery Boundaries` must state what is out of scope, prohibited, unknown, or not authorized by the artifact.
- `Discovery Outcome` must state what was found, not found, deferred, or still unknown.
- `Interpretation Limits` must state what the discovery does not prove or authorize.
- If no discovery has been performed yet, `Discovery Outcome` should say the artifact is a proposed or planned discovery.
- Runtime tools may use discovery artifacts as guidance, but the schema itself must remain readable without a specialized app.

### Discovery Field

Required Fields

- Field
- In Scope
- Out Of Scope

Optional Fields

- Source Or Origin
- Target
- Destination
- Terrain
- Time Window
- Access Boundary
- Privacy Boundary
- Consent Or Authority
- Freshness Boundary

Rules

- `Field` should name the source, domain, repository, discussion, issue, dataset, place, community, process, system, or bounded target area where discovery may occur.
- `In Scope` should state what may be examined or considered.
- `Out Of Scope` should state what must not be examined, inferred, collected, or claimed.
- External sources may be origins, relation targets, pointer destinations, or evidence sources without becoming `Parent`.
- If access, consent, privacy, or authority is uncertain, the artifact should preserve uncertainty rather than invent permission.

### Discovery Outcome

Allowed Shapes

- planned discovery
- completed discovery
- partial discovery
- ongoing discovery
- finding list
- absence report
- uncertain result
- lead list
- deferred discovery
- blocked discovery

Rules

- Discovery outcome should distinguish found material, missing material, uncertain material, and follow-up leads.
- A discovered item is not evidence merely because it was found.
- A discovered item may later become a finding, evidence, signal, feedback, pointer, relation, task, decision input, or another artifact when the proper schema owns that later role.
- Absence of a finding should not be overstated as proof of absence unless the method and field support that claim.
- Time-sensitive discovery should state freshness or drift limits when known.

### Discovery Family Boundary

Rules

- Use `tiinex.discovery.v1` when the main artifact value is the bounded discovery act itself.
- Use `tiinex.discovery.finding.v1` when the main artifact value is one discovered item, absence, anomaly, lead, or triage object.
- Use `tiinex.discovery.follow.v1` when the main artifact value is bounded ongoing attention to a track, source, person, issue, community, or artifact family.
- Use `tiinex.discovery.research.v1` when the main artifact value is question-driven inquiry, hypothesis review, source review, or synthesis support.
- Use `tiinex.discovery.expedition.v1` when the main artifact value is exploratory movement through a partly unknown field.
- Use `tiinex.discovery.monitoring.v1` when the main artifact value is recurring or continued observation over time.
- Use `tiinex.discovery.surveillance.v1` when monitoring is high-impact, power-asymmetric, sensitive, rights-affecting, or requires stronger authority and oversight boundaries.

### File Naming

Allowed Shapes

- `<lineage>.trace.md`
- `<lineage>-discovery.trace.md`
- `<lineage>-<discovery-slug>.trace.md`

Rules

- Discovery artifacts should keep the lineage label first.
- The optional slug should identify the discovery field, intent, route, or pass.
- Discovery artifacts should keep the `.trace.md` suffix stable.

### Interpretation Boundaries

Rules

- Discovery artifacts preserve provenance of looking, searching, following, observing, or exploring.
- Discovery artifacts must not be used to hide surveillance, broad crawling, or authority-sensitive observation behind neutral wording.
- Discovery artifacts must not replace evidence, signal, feedback, relation, pointer, privacy, consent, attestation, monitoring, or surveillance artifacts when those schemas own the main role.
- Discovery artifacts do not grant access, permission, consent, legal compliance, truth, or canonical status by themselves.

## Minimal Example

```md
# Continuity Context

- Envelope Schema: tiinex.root.v1
- Current
  - Current Schema: tiinex.discovery.v1
  - Created At: 2026-06-29 00:00:00
  - Summary: Discovery pass for a bounded external discussion origin.

---

# External Discussion Discovery Pass

## Discovery Intent

- Intent: inspect one public discussion to understand whether it contains relevant provenance or review leads.

## Discovery Field

- Field: one public GitHub discussion linked as a current origin
- In Scope: discussion root, directly relevant visible comments, explicit linked targets named by the discussion
- Out Of Scope: unrelated repository activity, unrelated user activity, private material, broad crawling

## Discovery Method

- Method: human-readable review of the declared public discussion and explicit links.

## Discovery Boundaries

- Boundary: this pass notices possible leads but does not treat them as evidence or maintainer approval.

## Discovery Outcome

- Outcome: planned discovery; findings will be recorded separately if material is found.

## Interpretation Limits

- Limits: this artifact does not prove freshness, correctness, acceptance, or permission to monitor the target.
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

- discovery is the journey or pass, not automatically the discovered material
- discovery should make boundaries and absence as readable as findings
- discovery output should land through the appropriate later schema instead of becoming canon by default
- discovery may be supported by tools, but should remain readable as provenance without those tools
- discovery should be safe to read like a book: intent, field, route, findings, uncertainty, and next trail

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
- fieldPrompt
- fieldPlaceholder
- boundaryPrompt
- boundaryPlaceholder

Rules

- The current discovery create surface uses version `1`.
- `createTitle` should label the create action as `Create Discovery`.
- `summaryPrompt` should ask for the discovery title.
- `summaryPlaceholder` should guide the user toward the discovery intent or field.
- Creation surfaces should not require runtime-specific crawler configuration.

### Template Body

Required Shape

- first heading uses `# {summary}`
- `## Discovery Intent` section
- `## Discovery Field` section
- `## Discovery Method` section
- `## Discovery Boundaries` section
- `## Discovery Outcome` section
- `## Interpretation Limits` section

Rules

- Generated discovery artifacts should begin with the discovery title as the first body heading.
- `Discovery Intent` should state why discovery exists.
- `Discovery Field` should state where discovery may happen and what is in or out of scope.
- `Discovery Method` should state how discovery proceeds.
- `Discovery Boundaries` should prevent overbroad collection or interpretation.
- `Discovery Outcome` should preserve found, absent, deferred, or unknown results.
- `Interpretation Limits` should prevent overclaiming.

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.root.v1.schema.md](https://github.com/Tiinex/docs/blob/df3260c77a7c14b2ece67456d1a9fe4b3e026a7c/.topics/.schemas/tiinex.root.v1.schema.md)
  - Value: BFWYft1v0Ue0gUoO236DGScvnixS7_MIEwO6mhJhkNw

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: Brkf2JAe-lUS5-vyMd5bwiMpNd2oIi2KcKbsErnfAnw