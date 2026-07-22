# Continuity Context

- Envelope Schema: [tiinex.root.v1](../../tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.preservation.v1](../preservation/tiinex.preservation.v1.schema.md)
  - Created At: 2026-06-30 00:00:00
  - Trace: [tiinex.preservation.v1.schema.md](../preservation/tiinex.preservation.v1.schema.md)
  - Origin:
    - [relative](../preservation/tiinex.preservation.v1.schema.md)
    - [browse + git](https://github.com/Tiinex/docs/blob/089427470f04336dfcc100c4dcf6289d51bf0291/.topics/.schemas/core/preservation/tiinex.preservation.v1.schema.md)
- Current
  - Current Schema: [tiinex.evidence.v1](tiinex.evidence.v1.schema.md)
  - Created At: 2026-06-30 00:00:00
  - Summary: Schema for preserved material used to support, illuminate, test, or challenge a claim or question, inheriting preservation boundaries.

---

# Evidence

- Status: maintained schema note

## Summary

This schema defines evidence artifacts as a preservation specialization.

Evidence is preserved material used to support, illuminate, test, or challenge a claim, question, decision input, review, or interpretation. It inherits the preservation rule that material must remain judgeable with provenance, fidelity, representation, and loss boundaries visible.

Evidence is not all preservation. Preserved material can exist before it is used as evidence. Evidence begins when preserved material is placed in relation to a supported claim, question, or issue while keeping interpretation limits visible.

## Schema Validation Contract

### Evidence Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.evidence.v1`

Rules

- `tiinex.evidence.v1` identifies artifacts centered on preserved supporting material used for a claim, question, review, or interpretation.
- Evidence artifacts inherit `tiinex.preservation.v1` semantics for preserved material, provenance, fidelity, custody or storage boundary, and interpretation limits.
- An evidence artifact should let a later reader tell what material is preserved, what it supports or bears on, how it represents the underlying source, and what it does not prove.
- Evidence artifacts must not silently become truth, attestation, validation, consent, decision, relation, or authority artifacts.
- Prose outside `Schema Validation Contract` may explain the schema, but it does not add required validation rules.

### Parent Preservation Specialization

Rules

- Evidence narrows preservation by adding a supported claim, question, or issue.
- Evidence uses preserved material; it does not create preservation merely by linking, seeing, fetching, or temporarily holding material.
- Evidence body sections replace the generic preservation body for artifacts whose current schema is `tiinex.evidence.v1`.
- Parent preservation specialization applies to the artifact body only; it does not alter root continuity, integrity, or parent-origin requirements.

### Evidence Body

Required Shape

- first body heading after the continuity envelope
- `## Supported Claim Or Question` section
- `## Provenance` section
- `## Evidence Material` section
- `## Preservation And Fidelity` section
- `## Interpretation Limits` section

Optional Sections

- Representation
- Linked Preservation Artifact
- Linked Artifacts
- References
- Fidelity Notes
- Dispute Or Counter-Evidence
- Review Notes

Rules

- An evidence artifact should begin with a human-readable title.
- `Supported Claim Or Question` must expose the claim, question, issue, or review point the evidence bears on.
- `Provenance` must expose what is known about source, origin, preservation, and representation.
- `Evidence Material` must expose the preserved supporting material itself or a bounded reference to a preservation or external payload artifact.
- `Preservation And Fidelity` must state preservation method, fidelity, loss, transformation, redaction, or excerpting limits when known.
- `Interpretation Limits` must state what the evidence does not prove.
- Follow-up sections must not replace the preserved material or preservation boundary.

### Supported Claim Or Question

Required Fields

- Supported Claim Or Question
- Evidence Role

Optional Fields

- Claim Reference
- Target Artifact
- Review Context
- Counterclaim
- Decision Context

Rules

- `Supported Claim Or Question` should be readable rather than hidden in metadata.
- `Evidence Role` should state whether the material supports, illustrates, challenges, weakens, contextualizes, or tests the claim or question.
- Evidence does not make the supported claim true by itself.

### Provenance

Required Fields

- Known Source
- Preservation Basis
- Provenance Limits

Optional Fields

- Origin
- Source Artifact
- Access Artifact
- Preservation Artifact
- Relation Artifact
- Capture Time
- Custody Context

Rules

- `Known Source` should name the source or bounded source descriptor when known.
- `Preservation Basis` should state whether material is embedded, attached, linked to a preservation artifact, referenced through an external payload, or otherwise preserved.
- `Provenance Limits` must state missing, partial, transformed, redacted, private, or uncertain provenance when present.
- When concrete files, traces, or other durable artifacts ground the evidence, explicit readable target references should be preferred over vague mentions.

### Evidence Material

Required Fields

- Material
- Material Kind

Optional Fields

- Excerpt
- Description
- Attachment Reference
- External Payload
- Preservation Artifact
- Transcript Extract
- Screenshot Description
- Sample Reference

Rules

- `Material` must preserve the readable excerpt, summary, description, bundle items, transcript material, explicit asset reference, or preservation artifact reference itself rather than only naming it.
- `Material Kind` should state whether the material is quote, excerpt, scan, photo, transcript, sample, export, attachment, snapshot, external payload, or another precise shape.
- If the material is too large, binary, private, or machine-shaped to embed, the artifact should use a bounded preservation or external payload reference.

### Preservation And Fidelity

Required Fields

- Preservation State
- Fidelity Notes
- Known Losses

Optional Fields

- Transformation
- Redaction
- Excerpting
- Representation Limits
- Storage Boundary
- Custody Boundary

Rules

- Evidence material must be preserved or explicitly reference a preservation boundary.
- `Preservation State` should distinguish embedded material, preserved attachment, preservation artifact, external payload, custody record, transcript, snapshot, or other bounded preservation state.
- `Fidelity Notes` should state how directly the material represents the underlying source.
- `Known Losses` should state what may have been lost, transformed, redacted, cropped, excerpted, normalized, summarized, or made uncertain.

### Interpretation Limits

Required Fields

- Does Not Prove
- Must Not Be Treated As

Optional Fields

- Uncertainty
- Counter-Evidence
- Need For Review
- Consent Limits
- Authority Limits

Rules

- `Does Not Prove` must state important claims the evidence does not support by itself.
- `Must Not Be Treated As` should call out adjacent semantics such as truth, consent, attestation, validation, decision, permission, identity, or authority when those risks are present.
- Evidence artifacts may support decisions, findings, feedback, tasks, reports, or attestations, but those schemas own their own role.

### File Naming

Allowed Shapes

- `<lineage>.trace.md`
- `<lineage>-evidence.trace.md`
- `<lineage>-<evidence-slug>.trace.md`

Rules

- Evidence artifacts should keep the lineage label first.
- The optional slug should describe the preserved material or evidence slice.
- Evidence artifacts should prefer short human-readable slugs.
- Evidence artifacts should keep the `.trace.md` suffix stable.

### Interpretation Boundaries

Rules

- Use `tiinex.evidence.v1` when the artifact is mainly preserved material bearing on a claim, question, or review point.
- Use `tiinex.preservation.v1` when the main artifact value is preservation without claim-bearing evidence use.
- Do not use `tiinex.evidence.v1` for broad topic discussion, generic task planning, thin pointers, opaque runtime exports, or validation findings.
- If the artifact's main job is to land what now governs, another schema should own it.

## Artifact Creation Contract

### Creation Fields

Required Fields

- Supported Claim Or Question
- Evidence Role
- Known Source
- Preservation Basis
- Provenance Limits
- Material
- Material Kind
- Preservation State
- Fidelity Notes
- Known Losses
- Does Not Prove
- Must Not Be Treated As

### Creation Rules

Rules

- Creation tools should not create evidence from material that is only linked, seen, fetched, cached, or temporarily held unless a preservation boundary is also declared.
- Creation tools should prefer preservation artifacts when material is being captured before claim-bearing use is known.
- Creation tools should keep evidence weaker than truth, attestation, validation, consent, identity, and authority unless separate artifacts support those claims.
## Minimal Example

```md
# Preserved Comment Evidence Slice

## Supported Claim Or Question

- Supported Claim Or Question: whether external feedback mentioned mobile overflow
- Evidence Role: supports that the issue was observed in external feedback

## Provenance

- Known Source: public project feedback comment
- Preservation Basis: preserved excerpt in this artifact
- Provenance Limits: surrounding discussion may contain additional context

## Evidence Material

- Material Kind: excerpt
- Material: user reported that mobile Use-as options overflowed outside the screen

## Preservation And Fidelity

- Preservation State: readable excerpt preserved in markdown
- Fidelity Notes: summarized from observed feedback text
- Known Losses: exact UI state and device context not fully preserved

## Interpretation Limits

- Does Not Prove: cause of overflow, fix correctness, or user acceptance
- Must Not Be Treated As: validation result, task completion, or consent
```

## Validation-Friendly Shape

Keep this schema note in the exact section order already used here: `Summary`, `Schema Validation Contract`, `Artifact Creation Contract`, `Minimal Example`, `Validation-Friendly Shape`, and `Interpretation Notes`.

Maintain the section headings exactly in this schema note. Free markdown inside those sections is allowed, but adding undeclared new section headings should be treated as schema drift.

The body headings required for artifacts using this schema are: `## Supported Claim Or Question`, `## Provenance`, `## Evidence Material`, `## Preservation And Fidelity`, `## Interpretation Limits`.

## Interpretation Notes

- evidence is preservation with claim-bearing use
- preserved material is not automatically evidence until an evidence artifact owns the claim or question relationship
- evidence remains bounded by provenance, preservation, fidelity, and interpretation limits

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.preservation.v1.schema.md](https://github.com/Tiinex/docs/blob/089427470f04336dfcc100c4dcf6289d51bf0291/.topics/.schemas/core/preservation/tiinex.preservation.v1.schema.md)
  - Value: RbWNCNrr75j7UhGmcKFd-a6qJEGntHGR2EztvQXQGTQ

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: jUD3kCR-P8TIKnMDAm7rov1a6IPoyRHeGCGEC2zBO9k