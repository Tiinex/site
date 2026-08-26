# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-25 20:30:00
  - Authors: Anchor
  - Why: Close the remaining recipient-addressing ambiguity by standardizing one shared recipient-v2 package whose outer invocation identifies the recovery entry and exactly one carried Handoff route without pruning sibling routes or leaking semantic work instructions.
  - Summary: Tooling 027-5-19 — shared recipient-v2 carrier with exact route/recovery addressing: same ZIP bytes across parallel dialogs, fixed READ recovery entry, one package-local selected route pointer, exact Workspace/Handoff path, and fail-closed sibling-route inference.
  - Status: open/local

---

# Tooling 027-5-19 — shared recipient-v2 route addressing and recovery contract

## Objective

Make recipient-v2 transport self-addressing for parallel Handoff delivery while preserving one reusable package representation.

## Done Criteria

- A shared recipient-v2 package may contain multiple qualified package-local Handoff Route Pointer siblings.
- Normal recipient-v2 serialization must preserve those sibling qualified routes; selecting a recipient must not mutate or prune the shared ZIP bytes.
- Tooling-generated outer routing text must identify, at minimum, the fixed Recovery Entry, exactly one package-local Selected Handoff Route Pointer, its Workspace, and the exact Workspace-relative Selected Handoff.
- The outer invocation must instruct the recipient to begin at Recovery Entry and follow only the selected route’s declared Parent/payload lineage; sibling Handoff routes must not be inferred.
- `001-1-READ-BEFORE-PROCEEDING.trace.md` must declare the same route-selection/recovery contract and fail closed if route selection is absent, ambiguous, or mismatched.
- The selected Handoff Route Pointer remains the package-local route authority and carries the exact Handoff digest/path binding.
- The same shared ZIP must ground two different explicitly selected routes in regression coverage without changing package bytes.
- Current/default v1 semantics remain unchanged.
- Parent/pathing lineage, Parent-target plus self c14n-v2, canonical generated Markdown representation, deterministic ZIP bytes, Workspace archive qualification, and cold-consumer exact-route grounding remain green.
- Produce one new fresh Loom retest transport only after affected gates pass.

## Dependencies

- [Sigma shared-recipient clarification](027-5-18-2-sigma-shared-recipient-route-addressing-clarification-feedback.trace.md)
- [027-5-18 correction result](027-5-18-1-explicit-entry-and-cold-consumer-grounding-correction-result.trace.md)
- [027-5-17 fresh cold-start feedback](027-5-17-2-fresh-cold-start-recovered-not-preferred-feedback.trace.md)

## Scope

Bounded recipient-v2 shared-carrier addressing and recovery contract only. No schema invention, broad artifact-tooling debt refactor, remote publication, or default activation.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:3Ow__4uu_dIy1A2XEg_4Jhtva4nW02bkZIqGSFxbAZw
