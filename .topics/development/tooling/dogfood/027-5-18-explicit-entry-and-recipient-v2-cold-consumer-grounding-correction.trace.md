# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-25 19:56:00
  - Authors: Anchor
  - Why: Close the two concrete blockers exposed by the first true recipient-v2 cold-start before any default-promotion retest: ambiguous host-layer entry selection and recipient-v2 Workspace-archive route grounding in ground-cold-consumer.
  - Summary: Tooling 027-5-18 — standardize one explicit fixed entry artifact in the outer invocation and make cold-consumer grounding resolve exact Handoff Markdown through the qualified recipient-v2 Workspace archive/path binding instead of decoding the ZIP carrier as Markdown.
  - Status: open/local

---

# Tooling 027-5-18 — explicit entry and recipient-v2 cold-consumer grounding correction

## Objective

Make recipient-v2 self-consumption deterministic at both ingress and route grounding without redesigning the accepted package-local Parent tree.

## Done Criteria

- Freeze one ordinary recipient-v2 outer invocation that explicitly names the stable entry artifact `001-1-READ-BEFORE-PROCEEDING.trace.md` while leaking no Role, Workspace, Handoff path, Task, or expected-result detail.
- Preserve `001-1-READ-BEFORE-PROCEEDING.trace.md` as the stable recipient entry artifact across recipient-v2 packages.
- Package orientation must still derive route, Role, Task, Workspace, and execution boundary from package contents, not from host-layer prose.
- For recipient-v2, `ground-cold-consumer` must treat the route's visible `.workspace.zip` path as an archive carrier and resolve `workspaceRelativeHandoffPath` inside that exact qualified archive.
- The resolved Handoff entry byte count and SHA-256 must match the qualified route declaration before Handoff parsing.
- Missing archive, missing inner route, invalid ZIP, byte mismatch, digest mismatch, or ambiguous route must fail closed with specific findings.
- Current/v1 direct Markdown route grounding must remain unchanged.
- Add regression proving the exact 027-5-17 failure shape no longer returns `portable.cold-start.handoff.route-bytes.unreadable`.
- Preserve package-local Parent/pathing lineage, Parent-target plus self integrity, canonical generated Markdown representation, exact durable Workspace bytes, deterministic outer ZIP behavior, and v1 compatibility.
- Preserve 027-5-17 as immutable recovered-not-preferred evidence.
- Manufacture one fresh-recipient test package after all affected gates pass; do not promote to default until a genuinely fresh LLM passes the preferred path.

## Scope

Bounded recipient-v2 ingress/grounding correction only. No schema invention, broad artifact-tooling debt repair, unrelated carrier redesign, remote publication, or default activation.

## Dependencies

- [027-5-17 fresh cold-start recovered-not-preferred feedback](027-5-17-2-fresh-cold-start-recovered-not-preferred-feedback.trace.md)
- [027-5-17 fresh cold-start qualification](027-5-17-recipient-v2-standard-invocation-fresh-cold-start-qualification.trace.md)
- [027-5-16 outer invocation standardization decision](027-5-16-1-cold-start-outer-invocation-standardization-decision.trace.md)
- [027-5-15 carrier correction result](027-5-15-anchor-package-local-parent-lineage-and-artifact-renderer-correction-result.trace.md)

## Acceptance Invocation Candidate

`Tiinex Handoff package attached. Begin with 001-1-READ-BEFORE-PROCEEDING.trace.md.`

This sentence is host-layer addressing only. It identifies the fixed transport entry artifact and carries no semantic route or work assignment authority.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: PqCtvfp0wZ7X_bJ94BvSSZz7Yx3jRvZmCGzTbwjcQfk
