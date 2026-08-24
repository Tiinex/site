# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-24 10:38:00
  - Authors: Anchor
  - Why: Close the artifact-creation integrity gap exposed by Q and direct source review: continuation creation currently renders a Parent but emits and validates only one self c14n-v2 integrity entry, so the produced child does not carry a machine-checkable digest link to the Parent snapshot.
  - Summary: Tooling 019 — make Parent-bearing continuation creation emit and verify the maintained c14n-v2 Parent target-self-digest entry before the primary child self seal, while preserving exact Parent authority and failing closed when target integrity cannot be qualified.
  - Status: open/local

---

# Tooling 019 — Parent-target v2 continuity integrity emission and validation closure

## Objective

Make every qualified Tooling/Viewer/portable continuation-creation path that declares a Root `Parent` preserve a cryptographically checkable continuity link to the exact resolved Parent snapshot. The child footer must record the Parent's validated primary `sha256-base64url-c14n-v2` self digest as a non-self comparison entry and then compute the child's single primary self seal last. Do not derive Parent from dimensions, chronology, filenames, repository adjacency, or host context.

## Done Criteria

- Preserve canonical Parent authority exactly as today: Parent Schema, Trace, Origin, source qualification and continuation identity remain owned by Root/schema/source contracts. Integrity must verify the declared relation; it must not invent or change it.
- Extend continuation creation so a qualified Parent produces exactly one Parent-target `sha256-base64url-c14n-v2` comparison entry plus exactly one primary `Towards: self` entry. Root/no-Parent creation continues to emit only the primary self entry.
- The Parent-target `Towards` must resolve to the exact Parent representation already qualified for continuation creation. Prefer the qualified commit-pinned `browse + git` target where canonical Root/method policy requires it; otherwise preserve the exact qualified target form without guessing a different representation.
- The Parent-target `Value` must equal the resolved Parent artifact's validated primary v2 self digest. Do not silently use direct-target recomputation when the Parent has no valid primary self entry; report/fail as unavailable, ambiguous, unsupported, stale, or mismatched according to the existing validation contract.
- Compute/validate the Parent target value first, render all fixed sibling footer entries, and compute the child's primary self seal last so removal or mutation of the Parent-target entry invalidates the child self seal.
- Update creation representation qualification. Continuation creation must no longer require exactly one total integrity method entry; instead it must require exactly one primary self v2 entry and the exact required Parent-target v2 entry, while rejecting duplicate/ambiguous Parent targets and extra unexplained integrity entries. Root creation keeps its one-self-entry expectation unless another explicit contract applies.
- Add a reusable non-self c14n-v2 target-self-digest verification surface rather than embedding Parent-specific hash logic in the renderer. The verifier must resolve/read the target's primary self entry and compare exact digest values under the maintained v2 method.
- Add focused tests proving: qualified Parent -> target entry + final self seal; changing/removing the Parent-target entry breaks child self integrity; mismatched Parent digest fails; missing/ambiguous Parent primary self digest fails closed; root creation does not invent a target entry; sibling footer preservation remains deterministic; exact Parent Source/Origin/Trace fidelity remains unchanged.
- Run the existing creation fidelity/continuation/integrity pressure suites including v455-v460, portable lineage authoring/parent-authority/integrity closures, and any directly affected Handoff/package creation tests. Do not claim unavailable full-repository gates as passed.
- Treat the current bounded scan (`159` Parent-bearing Markdown artifacts, `0` v2 non-self target entries) as prevalence evidence, not common-provenance proof. Audit current local/unpublished Parent-bearing artifacts produced after the affected creation path became authoritative and report which can be safely repaired before publication. Do not rewrite already published history merely to backfill stronger integrity. If historical repair is warranted, return a separate bounded migration task/disposition.
- Return exact implementation evidence and one normal recipient-relative Handoff package using Tooling-owned human output. The implementing Loom session does not self-qualify the cold-start trust gate.

## Scope

Artifact creation rendering, continuation representation qualification, c14n-v2 non-self target-self-digest verification, focused regression fixtures, portable/Viewer creation parity where they share the affected path, and bounded local/unpublished audit. Out of scope: changing Root Parent semantics, dimension/discovery policy, rewriting published history, inventing direct-target recomputation semantics, canonical schema mutation, Source semantics, Viewer product redesign, or broad package performance work.

## Dependencies

- [Parent-target v2 continuity integrity gap feedback](../../architect/continuity/001-30-parent-target-v2-continuity-integrity-gap-feedback.trace.md) is the controlling Q/source evidence.
- [Validator surface convergence and integrity repair strategy](../../architect/continuity/001-13-validator-surface-convergence-and-integrity-repair-strategy.trace.md) preserves earlier integrity-method and validator-surface discipline.
- Maintained `sha256-base64url-c14n-v2` authority at `Tiinex/docs@3988951208eb9a8926e84ab42625d4b42fa00c2d` defines primary self sealing and non-self target-self-digest behavior.
- [Known Role cold-start trust closure](../../architect/continuity/001-24-known-role-cold-start-trust-closure-task.trace.md) remains the wider trust tranche; same-session correction is not qualification evidence.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: GjZEnPzKQx9J2f0GI9rETH1NloIZ2x4WvNqsQRTV9T8
