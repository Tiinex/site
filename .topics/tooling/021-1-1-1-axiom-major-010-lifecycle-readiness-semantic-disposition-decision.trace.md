# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-06 00:03:13
  - Trace: [021-1-1-anchor-to-axiom-major-010-lifecycle-readiness-semantics-handoff.trace.md](021-1-1-anchor-to-axiom-major-010-lifecycle-readiness-semantics-handoff.trace.md)
  - Origin:
    - [relative](021-1-1-anchor-to-axiom-major-010-lifecycle-readiness-semantics-handoff.trace.md)
- Current
  - Current Schema: tiinex.decision.v1
  - Created At: 2026-09-06 00:18:06
  - Authors: Axiom
  - Why: Reissue the already-completed Axiom semantic disposition unchanged in meaning so the corrected return carrier contains the qualified Decision Anchor requested.
  - Summary: Accept composition of existing canonical semantics for artifacted-work lifecycle/readiness; no new Docs schema or global readiness predicate is required for Major 010.
  - Status: ready/local

---

# Major 010 Lifecycle/Readiness Semantic Disposition

Current canonical schemas already provide the semantic owners needed for artifacted work progression. Major 010 therefore requires no new Docs schema, no new canonical readiness artifact, and no new global relation predicate. The missing contract is the accepted composition boundary below: observation may inform a shared derived readiness projection; readiness may request an authoritative re-test; only a qualified outcome from the authority that owns the relevant criteria may establish pass/fail; and closure remains an explicit authoritative disposition rather than a side effect of convergence, status, or cleanup.

## Decision

- State: accepted composition semantics; no canonical Docs schema change required for this Major.
- Subject: deterministic artifacted-work lifecycle/readiness semantics for failed criteria -> bounded child expansion -> execution -> qualified convergence/current representation -> parent re-test readiness -> authoritative pass/fail -> explicit closure or further bounded work.
- Canonical disposition: compose existing `tiinex.task.v1`, Root, `tiinex.relation.v1`, `tiinex.reduction.v1`, `tiinex.validation.report.v1`, Discovery Follow, Transition Definition, and the already-governing Task/Handoff/Role/Decision authority surfaces. Do not create a second generic work item, readiness schema, closure schema, or readiness relation merely to make Tooling traversal convenient.
- Observation layer: filesystem shape, artifact presence/absence, Root `Status`, Discovery Follow updates, lexical lifecycle labels, Reduction existence, validation output, human feedback, and descendant counts may be observations or evidence candidates. They do not by themselves change the controlling Task's readiness, acceptance outcome, or closure state.
- Derived readiness layer: `ready-for-retest` is a non-authoritative deterministic projection over qualified evidence for one controlling Task. It means the controlling acceptance/completion criteria can now be re-evaluated without a known unresolved work/evidence prerequisite. It does not mean those criteria pass.
- Authoritative re-test layer: pass/fail exists only when an explicit qualified outcome targets the controlling scope/criteria and is produced or adopted under the authority that owns that acceptance/validation decision. A Validation Report may carry bounded methods/findings/overall state, and a Decision may carry governing disposition, but schema shape or report existence alone does not manufacture authority.
- Closure layer: `closed` exists only when a qualified artifact explicitly disposes the controlling Task/scope as closed under the correct authority after an authoritative pass. A single authoritative artifact may carry both the pass and closure when both are explicit and within its authority; otherwise a passing re-test leaves closure open pending a separate closure disposition.
- Failure loop: an authoritative failed re-test leaves the parent unclosed and may justify new bounded child work. The failure does not itself create that work; the resulting Task/relation artifacts must be separately declared and qualified.
- Parent boundary: `Parent` remains direct artifact continuity. A child Task may truthfully continue/refine/decompose an earlier Task through Parent when that is the actual continuity relation, but Tooling must not reinterpret arbitrary Parent ancestry as generic work dependency, controlling-work provenance, readiness, or acceptance. Cross-workspace/non-continuity work edges require already-declared qualified typed relation/provenance semantics; no new global predicate is introduced here.
- Transition boundary: Transition Definition may describe reusable lifecycle effects such as supersede/retire/revise, but the definition alone never proves invocation, currentness, success, validation, or closure. Loom may use a transition effect only when separate qualified occurrence/current-state evidence establishes that the declared effect actually applies to the evaluated participants.

### Derived Readiness Contract

For one exact controlling Task, Loom may project `readiness.state` as `ready-for-retest`, `not-ready-for-retest`, `unresolved`, or `not-applicable` with the following meanings:

- `ready-for-retest`: all evidence required to perform the parent's declared re-evaluation is qualified and current enough, every in-scope required child/work obligation has a qualified converged/resolved/current representation sufficient for re-test, and no current qualified blocker/dispute/incomplete prerequisite remains.
- `not-ready-for-retest`: qualified evidence positively establishes at least one current blocking prerequisite, such as active required child work, an unresolved declared blocker/dispute, a known incomplete required criterion input, or a failed re-test that has not yet been remediated.
- `unresolved`: the evaluator cannot safely decide readiness because required lineage, scope, currentness, representative selection, criterion material, evidence, or authority is missing, ambiguous, contradictory, or unqualified. `unresolved` is not normalized to `not-ready` or `ready`.
- `not-applicable`: a qualified explicit closure already governs the evaluated scope; readiness for another re-test is not projected unless later authoritative work explicitly reopens or replaces that scope.

`ready-for-retest` requires all of the following, fail-closed:

- the controlling Task and its completion/acceptance criteria are qualified and exactly identified;
- the set of in-scope child/work obligations is derived only from qualified Task continuity and/or already-declared typed work/provenance relations whose meaning actually applies;
- required child/work obligations have qualified current/converged representatives adequate to re-run the parent criteria;
- no current qualified blocker, dispute, or positively incomplete required obligation remains;
- any Reduction used as a current representative exposes its carry-forward state, loss/uncertainty, and validation boundary, and no material unresolved loss affects the parent's re-test inputs;
- competing representatives, stale-vs-current ambiguity, missing lineage, or conflicting lifecycle effects are resolved by explicit qualified evidence rather than ordering, filenames, timestamps alone, or lexical status tokens;
- evidence needed to execute the re-test is available and qualified enough for the declared method; readiness does not require the re-test to have already passed.

### Re-test Outcome And Closure Contract

Loom may separately project `retest.state` as `not-observed`, `passed`, `failed`, or `unresolved`, and `closure.state` as `open`, `closed`, or `unresolved`:

- `retest.not-observed`: no qualified authoritative re-test outcome is present; this is the normal state after convergence first makes the parent ready.
- `retest.passed`: a qualified outcome explicitly reports/adopts a pass for the controlling criteria and the outcome authority matches the authority that owns those criteria.
- `retest.failed`: the same authority/scope requirements hold, but the authoritative outcome is failure.
- `retest.unresolved`: an apparent outcome exists but target, method, criterion coverage, currentness, or authority cannot be qualified; the apparent result remains evidence only.
- `closure.open`: no qualified explicit closure disposition governs the Task/scope, including when `retest.passed` is already true but closure has not been explicitly declared.
- `closure.closed`: an explicit qualified governing artifact closes the exact Task/scope under the correct authority and its basis includes or incorporates an authoritative passing outcome for the required criteria.
- `closure.unresolved`: apparent closure exists but scope, parent/currentness, pass basis, or authority is ambiguous/missing/conflicting.

The projection must preserve `basis`, `reasons`, `blockers`, `missingEvidence`, `ambiguities`, the exact authority basis used for any outcome/closure, and the exact current representatives relied upon. It must not collapse these surfaces into one status string.

## Basis

- `tiinex.task.v1` already owns one bounded unit of work, explicit completion meaning, dependencies/origin targets where declared, and recursive subtasks; it does not need a sibling generic readiness schema.
- Root explicitly states that `Status` does not by itself prove validity, completeness, execution success, approval, or readiness. Therefore historical/current status strings remain observational metadata unless another active contract gives them narrower qualified meaning.
- `tiinex.relation.v1` already supports typed non-Parent edges and explicitly allows another artifact or schema contract to project a typed edge without a mandatory Relation Artifact. This is sufficient for exact work/provenance/dependency edges when they are truly declared; readiness itself does not need to become a relation predicate.
- `tiinex.reduction.v1` already exposes Source Context, Carry-Forward State, Loss And Uncertainty, and Validation, requires disposition/recoverability clarity, and forbids implied human acceptance. A qualified Reduction can therefore contribute a current/converged representative while remaining non-authoritative for parent completion.
- `tiinex.validation.report.v1` already exposes bounded scope, methods, overall state, findings, unchecked work, and interpretation limits, while explicitly refusing to silently become proof or authority. It can carry re-test evidence/outcome only when the exact method/scope and governing authority also qualify.
- Discovery Follow already owns bounded ongoing attention and explicitly does not imply approval, ownership, or decisions. It can surface an update/evidence candidate but cannot establish readiness or acceptance.
- Transition Definition explicitly separates reusable lifecycle semantics from invocation/execution/validation truth and fails unresolved on conflicting effects. It is therefore input semantics only when occurrence/current-state evidence separately qualifies the effect.
- The current Anchor discovery found the actual gap in composition, not storage: Site already has exact lineage/audit/ambiguity/blocker substrate and adapter-neutral result patterns. A shared Tooling projection can therefore implement this Decision without making runtime heuristics canonical.
- The approved Foundation plan keeps destructive Reduction/recovery after this Major; widening Reduction or cleanup authority here would violate the accepted ordering.

## Consequences

- Loom may implement one adapter-neutral lifecycle/readiness evaluator in Site/Tooling using projection-only result vocabulary from this Decision. These projection fields are not Root `Status`, do not create a new schema vocabulary, and must not be persisted as canonical artifact truth merely because the runtime exposes them.
- The normalized result should identify the exact controlling Task, readiness state, re-test state, closure state, qualified current representatives, blocking work/disputes, missing evidence/ambiguities, outcome/closure authority basis, reasons, and a bounded next action.
- Bounded next-action semantics are: resolve the named blocking work/evidence for `not-ready-for-retest`; repair qualification/currentness/authority ambiguity for `unresolved`; invoke the declared authorized re-test for `ready-for-retest` with no authoritative outcome; address failed criteria/new bounded work after `retest.failed`; obtain explicit closure after `retest.passed` with `closure.open`; and return no additional re-test action for qualified `closure.closed` absent a new authoritative work artifact.
- Historical nonterminal artifacts or stale `Status` values do not block forever merely because they exist. They matter only when still current under qualified lineage/representative semantics. If a later qualified superseding/current/closure artifact resolves them, the historical observation remains provenance; if currentness cannot be established, the evaluator returns `unresolved`.
- Physical cleanup, empty directories, disappeared source artifacts, branch state, file counts, number of descendants, number of reductions, or the mere presence of a human/role may trigger discovery or reassessment but must never upgrade readiness, pass, or closure.
- A qualified Reduction/current representative may satisfy the evidence-availability side of readiness only to the extent its declared carry-forward and loss boundary preserves what the parent re-test needs. Material loss/uncertainty affecting required criteria makes readiness `unresolved` or `not-ready-for-retest` according to whether the deficiency is unknown or positively known.
- Authority mismatch is never repaired by agreement of content. A report authored by the wrong role, an unbound human statement, an unauthorized validation method, or a closure claim outside the governing role remains evidence only; re-test/closure stays `unresolved` or `open` as appropriate.
- Loom must not reuse the destructive Reduction preflight's lexical `lifecycleStatus/currentStatus` tokens as the generic evaluator. Any adapter may ingest such strings only as observations unless a qualified active schema contract gives them exact meaning.
- Neutral regressions must cover at least: failed criterion with child expansion; active unresolved descendant; child convergence with no parent re-test; authoritative passing re-test with closure still open; explicit authoritative closure; failed re-test followed by new child work; ambiguous/missing lineage; stale historical nonterminal status superseded by qualified current evidence; qualified Reduction that preserves re-test inputs but is not completion proof; Reduction with material unresolved loss; and explicit authority mismatch.
- Public process/orientation material should be reconciled only after Loom's shared evaluator qualifies and Anchor accepts the return, so prose reflects rather than substitutes for the implemented semantics.

## Review Conditions

- Re-open canonical semantics only if Loom demonstrates that one of the required inputs cannot be represented or qualified through current Task/Root/Relation/Reduction/Validation/Role/Handoff/Decision/Transition semantics without schema-specific guessing.
- Re-review if a future requirement needs readiness itself to be a durable independently governed artifact rather than a derived projection; this Decision does not pre-authorize a new readiness schema.
- Re-review if a domain requires an acceptance authority model that cannot be expressed by its existing controlling Task/Handoff/Role/validation or decision artifacts. Do not respond by treating authorship, human identity, or report state as universal authority.
- Re-review any proposal that would make Parent a generic dependency edge, make Reduction a completion/cleanup authority, or make Transition Definition proof of occurrence.

## Immediate Next Questions

- Anchor should independently reconcile this no-schema-change disposition against Major 010 and, if accepted, delegate only the shared projection/evaluator mechanics to Loom.
- Loom should return a normalized result shape and neutral regression proof that preserves `not-ready-for-retest` versus `unresolved`, outcome authority, and closure as separate surfaces without lexical status heuristics.
- After Loom qualification, Anchor should reconcile public Tiinex process/orientation to the same expand -> converge -> re-test -> close model and then decide Major 010 closure; destructive Reduction remains the next separate track.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [021-1-1-anchor-to-axiom-major-010-lifecycle-readiness-semantics-handoff.trace.md](021-1-1-anchor-to-axiom-major-010-lifecycle-readiness-semantics-handoff.trace.md)
  - Value: EflIOgWXHPYbch22Pu2py6_ttmIZmerLDnDXw-hXaFM

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: LxJiVOt302S-edlLBi4JiHP995G5RkDrEkhFoYtsv7c