# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.decision.v1](../../src/schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-09-05 17:17:34
  - Trace: [019-3-1-1-anchor-major-008-durable-closure-decision.trace.md](019-3-1-1-anchor-major-008-durable-closure-decision.trace.md)
  - Origin:
    - [relative](019-3-1-1-anchor-major-008-durable-closure-decision.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-05 17:18:28
  - Authors: Anchor
  - Why: Begin the Sigma-approved post-Major-008 Grounding + Handoff Trust Major from a durable bounded Task.
  - Summary: Make cold-start grounding recover current work, organizational provenance, authority, plan boundaries, carrier profile, and next safe action without human re-narration or Tiinex-specific hardcoding.
  - Status: ready/local

---

# Cold-Start Grounding And Handoff Trust Hardening

## Objective

Make a cold-started Tiinex consumer recover enough structural, organizational, authority, plan, and work-provenance context to continue safely without requiring a human transport/acceptance role to narrate project drift from memory.

This Major exists because the current Handoff/grounding path already qualifies large amounts of exact Parent continuity and package authority, but the current session still required extensive Sigma narration and manual discovery before Anchor reached a trustworthy mental model of current Major, frontier, work provenance, repository/ref authority, carried-vs-remote state, adjacent excluded work, and domain-neutral role/authority boundaries.

The repair must improve generic Tiinex Tooling. Tiinex organization names, repository names, role names, branch names, current schema IDs, or current Foundation topology may be dogfood fixtures/configuration but must not become generic runtime assumptions.

## Done Criteria

- Define and implement a bounded cold-start grounding projection that exposes at least: controlling project/outcome context when explicitly derivable; current planned work segment/Major projection when carried; current work frontier and why it is selected; relevant blockers; semantic reductions of Required Context; explicit exclusions/not-now work; workspace/repository authority; carried/local versus remote identity; relevant ref/branch without default-branch inference; declared role/participant authority; and unresolved/unknown context.
- Preserve the distinction between transport qualification, structural grounding, and authority-to-act. A valid package must not automatically make the recipient grounded enough to act.
- A blank recipient must be able to distinguish artifact Parent continuity, work provenance/why the work exists, and organization/project context without collapsing those relations into one Parent edge.
- Work spawned by Initiative/Epic/outcome context must be discoveryable back to that controlling work context when the relevant artifacts declare such a relation; Tooling must fail visibly when organizational work provenance is unresolved rather than inventing a connection.
- Ordinary human/participant input remains feedback/observation by default. Tooling must not hardcode Sigma or infer an authoritative transition merely because a human role spoke; authority and explicit intent must be derived from project artifacts/runtime context.
- Remove generic Major/Handoff readiness dependence on hard-coded `business`, `docs`, `site` workspace IDs. Required full-source/carrier profiles must come from declared project/carrier context or explicit operator input.
- Audit and separate generic provider/schema-resolution behavior from bundled Tiinex defaults such as `Tiinex/docs`, `master`, or current Site branch conventions; defaults may exist as explicit profiles but may not masquerade as universal semantics.
- Preserve and improve multi-route support: one shared carrier may have N qualified routes and N exact recipient transport texts without sibling-route inference.
- Research return sibling numbering so deterministic original Handoff Pointer order can be weighed against current manufacture-order allocation. Implement only if retry/divergence/collision semantics remain clean and portable; otherwise record the exact blocker/disposition rather than forcing a cosmetic rule.
- Add adversarial cold-start coverage for at least: blank coordinator/Anchor-like role, blank specialist, human-carriable role, multi-route carrier, and a novel project/profile using no Tiinex-specific role/repository names.
- Cold-start acceptance must measure whether a recipient can recover current structural work meaning without human narration, not merely whether Start/Continue and Parent bytes validate.
- Preserve the successful Tiinex-first bootstrap/route qualification path; make the safe path cheaper and more informative rather than replacing it with native archive archaeology.
- Re-run affected focused tests, grounding/Handoff regressions, typecheck, architecture, integration/Foundation qualification, and report introduced static debt honestly.
- End at a full-source, replacement-capable Major checkpoint suitable for the declared human landing role; no partial source transport at Major closure.

## Scope

- common `ground` / grounding-readiness projection and related cold-start receipts
- Required Context bounded semantic projection
- work/organizational provenance discovery and explicit unresolved state
- role/participant/authority projection
- carrier/workspace profile genericity
- bundled provider/default boundaries
- multi-route human delivery ergonomics
- return sibling allocation research and only justified implementation
- adversarial cold-start acceptance tests and metrics
- minimal adjacent Docs/Business semantic reconciliation only where implementation exposes a genuine canonical gap

## Dependencies

- Major 008 durable closure Decision and post-landing durability Evidence.
- Sigma-approved Foundation Major plan in `017-1-sigma-foundation-major-plan-approval-decision.trace.md`.
- Sigma cross-repository work-provenance grounding feedback in `017-2-sigma-cross-repository-work-provenance-grounding-feedback.trace.md`.
- Existing cold-start/grounding work under the historical Tooling 002 lineage must be reused/reconciled rather than silently duplicated.
- Existing shared Handoff material closure, multi-route manufacture, role grounding, and host/provider primitives remain preferred building blocks.
- The separate Site Pages `deploy-public` failure from Major 008 landing is a carried public-surface signal, not part of this Major unless grounding needs to represent it as an unresolved external condition.

## Exclusions

- No artifacted work lifecycle/readiness implementation from planned lifecycle Major.
- No destructive Reduction apply.
- No broad Docs→Site schema scaling or catalog normalization.
- No Viewer PoC parity implementation except where a shared grounding capability requires an adapter-neutral proof projection.
- No remote mutation, commit, push, deployment repair, release, or Foundation acceptance.
- No hardcoded Tiinex organization, Sigma/Anchor/Loom/Axiom, Business/Docs/Site, `master`, `refactor`, or specific Initiative/Epic names in generic Tooling semantics.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [019-3-1-1-anchor-major-008-durable-closure-decision.trace.md](019-3-1-1-anchor-major-008-durable-closure-decision.trace.md)
  - Value: G5MppmVGUpmXp1xGCu3PjHSOC02WdIIk0ppRcaiUBx4

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: BLLfUd2EaqYhLBOufPVfXi2kFL1NtSOn1u9jMNjeue4