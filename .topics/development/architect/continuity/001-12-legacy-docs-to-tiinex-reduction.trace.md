# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-08-22 23:22:00
  - Trace: [Macro Roadmap And Refactor Exit Recovery](001-2-1-macro-roadmap-refactor-exit-recovery-result.trace.md)
  - Origin:
    - [relative](001-2-1-macro-roadmap-refactor-exit-recovery-result.trace.md)
    - [browse + git](https://github.com/Tiinex/site/blob/1c2685df59270df347bf3c88709fa70f5015b927/.topics/development/architect/continuity/001-2-1-macro-roadmap-refactor-exit-recovery-result.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-23 01:39:00
  - Authors: Anchor
  - Why: `docs/**` still carries valuable pre-dogfood refactor decisions, plans, acceptance failures, UX principles, status ledgers, and handover context in legacy Markdown shapes even though current Tiinex continuity is now artifact-driven and the original historical bytes remain recoverable through Git.
  - Summary: Truthfully reduce legacy `Tiinex/site/docs/**` planning and status material into provenance-bound Tiinex artifacts, reconcile retained and superseded signal against current authority, and retire legacy docs as an operational planning dependency without rewriting history.
  - Status: planned/local

---

# Legacy docs to Tiinex reduction

## Objective

Reduce the pre-dogfood planning, decision, status, UX, acceptance, audit, and handover signal preserved under `Tiinex/site/docs/**` into appropriately typed Tiinex artifacts while retaining exact Git provenance to the historical source material and keeping current source, current `.topics` authority, current parity state, and historical evidence distinct.

This is semantic reduction, not Markdown wrapping or bulk format conversion. The reduction should make the useful historical signal discoverable in the current artifact structure without pretending that newly reduced artifacts existed at the historical checkpoint or that every statement in an old document remains current.

## Done Criteria

- Build a bounded inventory of legacy material under at least `docs/architecture/**`, `docs/decisions/**`, `docs/handover/**`, and `docs/audit/**`, with exact Git representation identity available for source claims that depend on historical bytes.
- Classify meaningful source signal by truth dimension and current disposition rather than by filename alone. At minimum distinguish retained current obligation/principle, already recovered but still qualification-relevant, superseded, future/post-refactor, historical-only rationale/evidence, and conflict/unknown requiring reconciliation.
- Reduce source material into the Tiinex schema family that truthfully owns each retained signal. One legacy document may yield multiple artifacts and multiple legacy documents may be reduced into one current artifact when they are iterations of the same stable truth.
- Preserve historical acceptance failures, rejected or wrong oracles, superseded decisions, and unresolved states as historical facts. Later success must not rewrite an earlier FAIL into PASS or silently erase the reason a correction occurred.
- Preserve exact source provenance for reduced claims through explicit Git repository/commit/path references or equally qualified historical representation evidence. A reduction must not claim that its newly authored artifact existed at the historical source commit.
- Reconcile reduced material against current `.topics` artifacts, current `refactor` source, current PoC parity ledger, and qualified PoC/master behavior evidence so legacy notes do not silently override stronger current authority.
- Produce a durable shared-capability map identifying historical signals that still constrain shared logic intended for both Loom/LLM use and Viewer/Kodax consumption.
- Produce a durable PoC product/feel map for retained human-first qualities that are not adequately represented by machine parity alone, including interaction rhythm, visual continuity, action locality, disclosure discipline, workspace focus/scroll ownership, startup/entrypoint experience, and other recovered qualities supported by evidence.
- Produce or update a durable remaining-parity map showing which reduced historical obligations still block `refactor -> master`, which are already requalified, and which have been consciously superseded or deferred outside refactor exit.
- Route semantic/schema-shape ambiguity to Axiom rather than inventing a new schema or forcing legacy material into an ill-fitting artifact type. Unreducible signal remains explicit until the appropriate semantic owner resolves it.
- Historical prose may remain in Git history or in a temporary source archive during reduction, but ordinary continuation after completion must no longer require reading legacy `docs/**` to know the current plan, role boundaries, retained parity obligations, or stable product principles.
- Any later deletion or archival cleanup of `docs/**` from branch HEAD is a separate explicit disposition after reduction completeness is validated; deleting source files is not a prerequisite for claiming this Task's semantic reduction complete.
- Validate each reduction batch for source traceability, self-integrity where applicable, contradiction/supersession handling, and absence of authority inflation before marking that batch complete.

## Scope

This Task owns historical reduction and reconciliation of the legacy Site documentation layer. It does not mechanically reopen the old M1-M10 sequence, restore obsolete implementation mechanisms, or treat old checkpoint status as current state merely because it was once written down.

Anchor owns cross-document classification, temporal reconciliation, preservation of refactor-exit intent, and review of whether the reduced set is sufficient for successor recovery. Axiom owns schema-semantic questions when current schemas do not cleanly represent the truth being reduced. Loom may provide reusable discovery, Git/material, validation, batch-processing, or provenance machinery when the reduction exposes a genuinely shared mechanism. Kodax is only required where source inspection or current runtime evidence is needed to determine whether a historical product obligation is already implemented, still partial, or superseded. All are peer responsibilities; routing does not create hierarchy.

Git history is the historical representation archive, not current semantic authority. Legacy docs are historical planning/evidence inputs. Current accepted Decisions, Tasks, Roles, source behavior, and parity dispositions remain stronger within their own current truth dimensions.

Do not copy whole historical documents into new artifacts merely to preserve prose. Preserve the smallest sufficient signal, exact source references, interpretation limits, and necessary rationale so later readers can recover why a current obligation or decision exists without replaying the entire pre-dogfood notebook.

## Dependencies

- [Macro Roadmap And Refactor Exit Recovery](001-2-1-macro-roadmap-refactor-exit-recovery-result.trace.md) for current refactor-exit and retained PoC parity obligations.
- [Role family identity transition decision](001-8-1-role-family-identity-transition-decision.trace.md) for current Anchor/Loom/Axiom/Kodax peer identities and authority boundaries.
- Current `Tiinex/site@refactor` source and `.topics/**` artifacts as present-time implementation/continuity authority.
- Current `src/parity/poc.parityLedger.js` and its related parity scenario definitions for current retained parity disposition.
- `Tiinex/site` Git history, including exact historical representations of `docs/**`, as provenance-bearing source evidence for the legacy material being reduced.
- Qualified PoC/master behavior evidence where a legacy note claims or explains retained PoC product behavior.
- Current Tiinex schema authority in `Tiinex/docs`; schema gaps or ambiguous semantic ownership route to Axiom rather than being invented inside this Task.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:2IakN7GqKD91pIbhSzT_02k3Me8dAmzET9z62L5zuis
