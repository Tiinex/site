# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-04 14:14:06
  - Trace: [013-1-anchor-to-axiom-major-planning-role-authority-handoff.trace.md](013-1-anchor-to-axiom-major-planning-role-authority-handoff.trace.md)
  - Origin:
    - [relative](013-1-anchor-to-axiom-major-planning-role-authority-handoff.trace.md)
- Current
  - Current Schema: tiinex.decision.v1
  - Created At: 2026-09-04 14:29:20
  - Authors: Axiom
  - Why: Make the declared Party Role specialization machine-readable so Anchor can continue durable Role authority without simultaneously requiring the replaced Party body.
  - Summary: Axiom accepts the existing Party-to-Role body replacement through one Root-owned inline Inheritance Overrides declaration, with no new companion or schema-specific compiler logic.
  - Status: ready/local

---

## Decision

- State: accepted for bounded progression
- Subject: `tiinex.party.role.v1` body specialization over `tiinex.party.v1`
- Decision: the existing Party→Role body-replacement semantics are correct and must be represented through Root-owned inline `Inheritance Overrides`; no new inheritance ontology, companion artifact, schema-ID conditional, prose parser, or child-wins precedence is required.
- Canonical Repair: add one declaration under `Schema Validation Contract -> Parent Party Specialization` in `tiinex.party.role.v1`:

```text
Inheritance Overrides

- party-role-party-body-structure
  - Merge Operation: override
  - Parent Schema: tiinex.party.v1
  - Parent Node: Schema Validation Contract / Party Body / Required Shape
  - Child Node: Schema Validation Contract / Party Role Body / Required Shape
  - Reason: Party Role specializes Party by replacing only the generic Party artifact-body structure while retaining compatible non-structural Party semantics and provenance.
  - Effective Result: Party Role body structure is authoritative for Party Role artifacts; parent-only structural body groups become inactive, while compatible parent contributions targeting surviving Party Role sections remain active.
```

- Generic Resolution: the declaration qualifies against the existing Root primitive with no Root semantic change. `Party Body / Required Shape` becomes inactive and `Party Role Body / Required Shape` becomes active.
- Structural Deactivation: inherited ordinary groups `Party Identity`, `Party Boundary`, `Role Or Capacity`, `Reference And Privacy Boundary`, and `Use With Other Schemas` become inactive because their exact parent-required headings are absent from the child replacement shape.
- Additive Survivor: inherited `Interpretation Limits` remains active because `## Interpretation Limits` survives in the child Required Shape; its compatible parent contribution remains additive and provenance-preserving with the child group.
- Child Authority: `Role Identity`, `Role Boundary`, `Authority And Responsibility Boundary`, `Holder Relationship`, and child `Interpretation Limits` remain the active Role body groups. The prose statements that these groups specialize or preserve parent meanings do not create extra retargeting, aliasing, or field migration authority beyond the explicit structural override and the child schema's own contract.
- Creation Boundary: the existing Role Artifact Creation Contract remains unchanged. This decision creates no transition, relation, companion, holder, delegation, or authority proof by symmetry.

## Basis

- Root already defines `Inheritance Overrides` as the canonical schema-local machine category for exact inherited contract replacement, requires an actual ancestor, exact `Parent Node` and `Child Node` resolution, and fails closed on ambiguity or unsupported behavior.
- The current Role schema already states that the child body replaces the parent Party body; the missing element was only the machine-readable declaration of that already-intended replacement.
- The repaired runtime projection resolves `inheritanceResolution.state = qualified` with one applied declaration and no findings.
- After repair the compiled required artifact sections are exactly `Continuity Context`, `Continuity Integrity`, `Role Identity`, `Role Boundary`, `Authority And Responsibility Boundary`, `Holder Relationship`, and `Interpretation Limits`; the replaced Party body headings are no longer simultaneously required.
- The current Anchor Role no longer produces any Party-body or Party-field missing findings under the repaired Role contract. Its remaining machine-contract error is the separate historical Root portability requirement `Parent Origin -> browse + git`, because that 2026-08-26 artifact carries only a relative Parent origin. That continuity debt is orthogonal to Party→Role specialization and must not be used to weaken either Root or the Role override.
- Site's generic schema binding/runtime mirror was updated only to carry the same accepted-local canonical Role schema bytes; no compiler branch was added. Schema bindings/manifest validation passed, all 25 runtime projections regenerated exactly, focused/tooling passed 4/4 with introduced static debt `0`, the existing schema factory conformance remained green, and TypeScript typecheck passed.

## Consequences

- Canonical Docs may carry the repaired `tiinex.party.role.v1` as one accepted-local unpublished schema change; Docs remains schema-only by default and no inheritance companion is introduced.
- The shared Site/Tooling schema mirror may consume those same exact schema bytes and generic Root override semantics; no Loom implementation turn is required for the Party→Role body-replacement mechanism itself.
- Anchor may continue the Business Anchor Role once its authoring path supplies a qualified child envelope and body. The new child needs only the active Role body contract; it must not recreate the replaced Party body.
- The durable major-planning responsibilities described by Anchor's controlling Task can therefore be expressed in the child Role's existing fields, primarily `Role Boundary` and `Authority And Responsibility Boundary`, without inventing a new Role schema surface.
- Major planning remains a Role responsibility only when explicitly written into the continued Role artifact; this decision does not itself assign a holder, create the child Role, qualify Major 008, or turn forecasts into promises.
- If the historical Anchor Role's missing `browse + git` Parent Origin blocks ordinary child authoring or recovery, route that as a bounded continuity/lineage repair. Do not solve it through Role-schema weakening or by treating transport placement as provenance.
- No remote Docs or Site mutation, publication, commit, push, deployment, release, or carrier-major advancement is authorized by this decision.

## Review Conditions

- Re-review only if the generic compiler cannot preserve the qualified active/inactive contribution set without Role-specific code, or if a future Party descendant needs a materially different override operation not already represented by Root.
- Re-review the historical Anchor Role continuity separately if its Parent-origin debt becomes an actual blocker for the next qualified child; that issue is not part of this Party→Role semantic repair.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [013-1-anchor-to-axiom-major-planning-role-authority-handoff.trace.md](013-1-anchor-to-axiom-major-planning-role-authority-handoff.trace.md)
  - Value: alc3rvISrBN9MOPmrpn91OOpfObGr5k5u7P6Wj2tONE

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: vHQelFGwBDTlh4014pf-09psxC0hE2PH90JJnZVrn_c