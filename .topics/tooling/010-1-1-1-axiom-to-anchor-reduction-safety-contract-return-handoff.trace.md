# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-09-03 20:03:03
  - Trace: [010-1-1-axiom-reduction-before-delete-cross-repository-boundary-decision.trace.md](010-1-1-axiom-reduction-before-delete-cross-repository-boundary-decision.trace.md)
  - Origin:
    - [relative](010-1-1-axiom-reduction-before-delete-cross-repository-boundary-decision.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-03 20:03:51
  - Authors: Axiom
  - Why: Return the qualified semantic result to Anchor so Loom can implement the stronger destructive reduction gate without inventing meaning.
  - Summary: Axiom return carrying the qualified Reduction-before-delete and cross-repository collapse-boundary decision plus one non-semantic multi-route continuation implementation finding.
  - Status: ready/local

---

# Reduction Safety Contract — Axiom To Anchor

## Handoff Parties

- Purpose: return Axiom's canonical semantic disposition for Reduction-before-delete and truthful cross-repository collapse boundaries so Anchor can route one unambiguous implementation contract to Loom.
- From: Axiom
- From Kind: role
- From Reference: [Axiom Role](business::.topics/roles/001-2-axiom-role.trace.md)
- To: Anchor
- To Kind: role
- To Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)

## Transfers

- reduction-before-delete-decision
  - Transfer Kind: work
  - Description: Axiom decided that `tiinex.reduction.v1` remains the general observable Reduction schema, while destructive lineage removal requires a separate fail-closed pre-delete eligibility qualification bound to exact Reduction bytes, exact intact source snapshots, the exact candidate delete set, complete disappearing-leaf coverage, immutable per-leaf references, and complete declared-Parent closure to the truthful surviving boundary.
  - Controlling Artifact: [Reduction-Before-Delete And Cross-Repository Collapse Boundary](010-1-1-axiom-reduction-before-delete-cross-repository-boundary-decision.trace.md)

- cross-repository-boundary-decision
  - Transfer Kind: work
  - Description: repository/workspace co-location has no ancestry authority; the semantic closure endpoint may be cross-repository, and a local placement/carry-forward parent is permitted only when it explicitly and truthfully reissues that semantic boundary rather than substituting for it.
  - Controlling Artifact: [Reduction-Before-Delete And Cross-Repository Collapse Boundary](010-1-1-axiom-reduction-before-delete-cross-repository-boundary-decision.trace.md)

- multi-route-continuation-materializer-observation
  - Transfer Kind: work
  - Description: the supplied three-route recipient-v2 carrier qualified through Tiinex orientation and grounding, but the common `ground --continue` path rejected workspace materialization as `package-unqualified` because its materializer invokes a legacy single-route package-v1 inspector. Continuation for this return used the already-qualified recipient-v2 workspace byte provider and the ordinary author/handoff state contract. This is an implementation/parity finding for Anchor/Loom, not Axiom semantic authority and not a defect in the selected route's qualification.
  - Controlling Artifact: [Safe Reduction And Shared Capability Parity](010-safe-reduction-and-shared-capability-parity-coordination-task.trace.md)

## Required Context

- axiom-reduction-safety-decision
  - Material: qualified Axiom semantic Decision returned by this handoff
  - Material Reference: [Reduction-Before-Delete And Cross-Repository Collapse Boundary](010-1-1-axiom-reduction-before-delete-cross-repository-boundary-decision.trace.md)
  - Purpose: normative implementation target for Loom and the later destructive Site reduction gate.
  - Availability: available

## Reference Context

- coordination-frontier
  - Material: controlling Safe Reduction And Shared Capability Parity Task
  - Material Reference: [Safe Reduction And Shared Capability Parity](010-safe-reduction-and-shared-capability-parity-coordination-task.trace.md)
  - Purpose: preserves the broader audit/repair parity, multi-route grounding, and no-deletion coordination scope around this Axiom result.
  - Availability: available

- current-reduction-schema
  - Material: current `tiinex.reduction.v1` maintained schema note
  - Material Reference: [Reduction Schema](../../src/schemas/reduction/tiinex.reduction.v1.schema.md)
  - Purpose: baseline general Reduction contract that remains valid but does not itself constitute destructive eligibility.
  - Availability: available

- prior-placement-contract
  - Material: current Site-local Reduction Placement And Expansion Decision
  - Material Reference: [Reduction Placement And Expansion Contract](008-reduction-placement-and-expansion-contract-decision.trace.md)
  - Purpose: directionally correct starting contract to be strengthened by the returned pre-delete and closure requirements.
  - Availability: available

## Retained Responsibilities

- implementation-and-shared-tooling
  - Retained By: Loom
  - Responsibility: map the Axiom Decision into shared Tooling/schema validation mechanics, stable findings, audit/plan/apply behavior, and human/LLM parity without inventing or weakening semantic rules.

- coordination-and-later-execution-gate
  - Retained By: Anchor
  - Responsibility: reconcile this return with Loom qualification and create any later reduction execution Task only after the shared gate is proven on the unreduced Site graph.

- destructive-human-acceptance
  - Retained By: Sigma
  - Responsibility: provide the separate human acceptance/commit gate for any later destructive repository mutation.

## Exclusions And Dependencies

- no-destructive-approval
  - Kind: excluded-scope
  - Description: this return does not approve the broad Site reduction candidate or authorize removal of any historical artifact.

- no-tooling-implementation
  - Kind: excluded-scope
  - Description: Axiom does not implement the validator, repair/audit mechanics, Viewer projection, or the observed multi-route continuation fix; those remain Loom/Anchor work.

- schema-surface-follow-through
  - Kind: unresolved-dependency
  - Description: canonical Docs/shared Tooling must encode the conditional destructive-lineage validation rules, either directly under `tiinex.reduction.v1` or in a clearly owned adjacent maintained contract, before destructive execution is reopened.

## Completion Expectation

- Signal Kind: result
- Signal Meaning: Anchor has one qualified Axiom Decision that makes pre-delete destructive eligibility, complete immutable leaf-to-boundary Parent closure, placement-versus-closure distinction, and cross-repository boundary semantics explicit enough to route to Loom without semantic invention.
- Return To: Anchor
- Return To Reference: [Anchor Role](business::.topics/roles/001-1-anchor-role.trace.md)
- Expected Result Reference: [Safe Reduction And Shared Capability Parity](010-safe-reduction-and-shared-capability-parity-coordination-task.trace.md)

## Interpretation Limits

- Does Not Mean: the existing broad Site reduction is approved; historical reductions are retroactively invalid; `tiinex.reduction.v2` is required; the canonical Docs schema has already been changed; or the observed multi-route continuation materializer defect has been repaired.
- Must Not Be Used To Claim: Axiom technical acceptance equals Sigma human acceptance; Loom implementation is qualified; any remote repository write is authorized; repository location defines semantic ancestry; or a leaf permalink/span count alone proves destructive eligibility.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [010-1-1-axiom-reduction-before-delete-cross-repository-boundary-decision.trace.md](010-1-1-axiom-reduction-before-delete-cross-repository-boundary-decision.trace.md)
  - Value: 4K1mQ6rMnZUR2fDvhGyEpzVhCF6rrufOVQ0J2XZs4kg

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: yOTUhLgGEYsCBN6epVGrkUmjSCyf3YZzy0O21t6F9FM