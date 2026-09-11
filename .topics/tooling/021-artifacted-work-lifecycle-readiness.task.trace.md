# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.decision.v1](../../src/schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-09-06 00:00:03
  - Trace: [020-12-anchor-major-009-durable-closure-decision.trace.md](020-12-anchor-major-009-durable-closure-decision.trace.md)
  - Origin:
    - [relative](020-12-anchor-major-009-durable-closure-decision.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-06 00:01:53
  - Authors: Anchor
  - Why: Major 009 is durably closed and the approved next segment is artifacted lifecycle/readiness; current schemas expose the pieces but not yet one shared deterministic readiness model.
  - Summary: Reconcile observation, derived re-test readiness, authoritative acceptance/validation, and closure into one deterministic artifacted work lifecycle without pulling destructive Reduction into this Major.
  - Status: ready/local

---

# Major 010 — Artifacted Work Lifecycle And Readiness

## Objective

Make Tiinex represent and evaluate the real artifacted work cycle deterministically without collapsing observation, derived readiness, authoritative acceptance/validation, or historical lineage into one status.

The target lifecycle is symmetric and fail-visible: failed parent criteria may expand bounded child work; child work executes and converges into qualified current representations; the parent may then become ready for acceptance re-evaluation; re-evaluation either expands more work or establishes the authoritative pass needed for closure. Physical cleanup, missing files, many descendants, a `Status` label, or a Reduction artifact must never become completion proof by themselves.

This Major must first reconcile canonical semantics, then add one shared Tooling projection/evaluator, then reconcile public process guidance only after the semantics/mechanics qualify. Reduction may participate as qualified convergence evidence, but destructive Reduction/recovery remains the next separate track.

## Planning Context

- Segment: Artifacted Work Lifecycle + Readiness.
- Purpose: make work progression machine-evaluable enough that a cold or active role can distinguish current work, unresolved descendants, derived re-test readiness, actual acceptance/validation outcome, and safe next action without relying on LLM convention or filesystem disappearance.
- End Condition: qualified canonical lifecycle/readiness semantics plus one shared deterministic Site/Tooling evaluator with neutral regressions and a public process surface that matches the accepted expand → converge → re-test → close model.
- Expected Handoffs: approximately 4–7 if current schemas can be composed without a new generic schema; reforecast after Axiom semantics reconciliation.
- Confidence: medium. Current schemas provide much of the raw authority, but no dedicated deterministic parent-readiness contract is yet visible.
- After This Segment: Reduction composition/destructive recovery remains next; Viewer/schema parity, deployment/release, Foundation exit, and broad schema scaling remain later.

## Done Criteria

- Axiom reconciles the current Task, Root Status, Discovery Follow, Reduction, Validation Report/Method/Finding, Relation, and Transition Definition semantics and decides the minimum canonical change, including the valid possibility that no new schema is needed.
- The accepted model explicitly separates `observation/discovery hint` → `derived readiness for re-evaluation` → `authoritative acceptance/validation outcome` → `closure`, with unknown/partial/disputed states preserved.
- Failed parent criteria can justify bounded child work without making child existence itself proof that the parent is incomplete forever; resolved/converged child scope can make a parent ready for re-test without making convergence itself a pass.
- Parent closure must depend on the authority that owns the relevant acceptance/validation criteria, not on `Status`, file absence, branch state, lineage depth, reduction count, or human presence alone.
- The semantic design specifies how exact qualified lineage, unresolved descendants, blockers/disputes, current/reduced representatives, and explicit acceptance/validation evidence affect readiness. Ambiguity or missing required evidence fails closed.
- Reduction remains provenance/carry-forward evidence only in this Major. No destructive deletion, reduction-of-reductions implementation, cross-repository collapse mechanics, or recovery-authority widening is introduced here.
- Discovery Follow remains bounded attention and must not be repurposed as acceptance authority merely to express readiness.
- Transition Definition lifecycle effects are reused only where their declared semantics genuinely apply; no arbitrary process-instance workflow ontology is inferred from them.
- Loom implements one adapter-neutral shared Tooling projection/evaluator after Axiom's semantic decision. Viewer, CLI, LLM, and VS Code consumers must be able to consume the same normalized result rather than inventing independent readiness rules.
- Neutral regressions cover at least: failed criterion with child expansion; unresolved descendant; converged child but no acceptance re-test; passing re-test; failed re-test causing new child work; ambiguous/missing lineage; historical nonterminal ancestor; qualified Reduction that is not completion proof; and explicit authority mismatch.
- Existing destructive Reduction preflight must not silently become the lifecycle evaluator. Any lexical lifecycle-status heuristic used there remains bounded to that preflight until explicitly reconciled.
- Public Tiinex process/orientation guidance is updated only after semantics and Tooling qualify so human readers see the same lifecycle that the shared evaluator implements.
- Anchor independently reconciles specialist returns, reruns relevant Foundation/focused/integration/static qualification, and prepares the next major checkpoint only when the bounded lifecycle/readiness segment is coherent and cold-start recoverable.

## Scope

- Canonical lifecycle/readiness semantics needed to interpret artifacted work progression.
- Shared deterministic readiness/closure-retest projection in Site/Tooling.
- Existing Task/Relation/Transition/Validation/Reduction/Discovery Follow authority as inputs.
- Minimal public process/orientation reconciliation after qualification.
- Neutral multi-workspace/cross-lineage fixtures where needed to prove domain neutrality.

### Explicit exclusions

- No destructive Reduction or delete/apply authority.
- No Reduction composition/reduction-of-reductions implementation except preserving the later requirement.
- No broad schema catalog/fanout/normalization work.
- No Viewer parity/Playthings merge. Playthings remains an evidence/donor line for later Viewer work only.
- No Pages/deployment/release repair.
- No Foundation exit claim.
- No Windows-specific acceptance host requirement.

## Dependencies

- [Major 009 Durable Closure](020-12-anchor-major-009-durable-closure-decision.trace.md)
- [Historical Lifecycle/Readiness Reconciliation Task](014-process-reconciliation-reduction-readiness-lifecycle.task.trace.md)
- [Approved Foundation Major Plan](017-1-sigma-foundation-major-plan-approval-decision.trace.md)
- Current Docs Task, Root, Discovery Follow, Reduction, Validation, Relation, and Transition Definition contracts.
- Current Site lineage/audit/reduction Tooling and Foundation validation suites.
- Anchor Role major-planning/currentness/closure authority; Axiom canonical semantic authority; Loom bounded shared Tooling implementation authority; Sigma ordinary observation/feedback boundary.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [020-12-anchor-major-009-durable-closure-decision.trace.md](020-12-anchor-major-009-durable-closure-decision.trace.md)
  - Value: NuHgiz6q19aZjNimZA1SNP8uDcbwhK3J_ri6dFXdXkU

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: ToInuuAQJxH87MSJTrgrrUmsRO6lI_hohX3ltZYQmd4