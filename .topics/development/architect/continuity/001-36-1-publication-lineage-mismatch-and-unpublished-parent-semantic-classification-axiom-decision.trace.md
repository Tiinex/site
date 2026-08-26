# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-08-24 16:45:41
  - Authors: Axiom
  - Why: Return canonical semantic authority for the unpublished Parent-Origin gap and seven historical repaired-local-versus-pre-repair-published Parent representation mismatches without opening repair application or publication.
  - Summary: Current Root cannot truthfully represent a never-published Parent-bearing continuation without `browse + git`; the seven historical mismatches are representation-only changes with Parent semantic continuity preserved, so later approved repair may bind locally to repaired Parent bytes while retaining the old immutable locator only as historical publication provenance.
  - Status: classified/local

---

# Publication lineage mismatch and unpublished Parent semantic classification — Axiom disposition

This decision resolves the two semantic questions transferred by Anchor while preserving Tooling 025 provider authority and Tooling 021's separate mutation/approval boundary.

## Decision

- State: classified-bounded
- Subject: [Publication lineage mismatch and unpublished Parent semantic classification](../../architect/continuity/001-36-publication-lineage-mismatch-and-unpublished-parent-semantic-classification-task.trace.md)
- Unpublished Parent Origin: under the carried qualified `tiinex.root.v1`, a declared `Parent` unconditionally requires `Origin -> browse + git`. The separate local/unpublished allowance for schema-reference locators applies only to schema-reference fields and does not discharge Parent Origin. Additional origin labels are additive extensions and do not remove the inherited required `browse + git` field. Therefore a Parent-bearing continuation whose Parent has never had any truthful portable archive permalink is not fully representable as Root-conformant today; tooling must fail closed rather than fabricate one.
- Canonical authority need: if pre-publication Parent-bearing continuations are intended to be canonical, the smallest required follow-up is a bounded Root Parent-Origin clarification/change that makes archive-locator unavailability truthfully representable. This decision does not choose field syntax, status vocabulary, or an extension label.
- Seven v471-v474 repaired-versus-published mismatches: classify these as representation-only Parent changes with semantic Parent continuity preserved by the carried `Historical canonical representation repair` provenance. The immutable locator at Tiinex/site commit `32c7c291101b2a6a72c12241f3107d4a56af81fc` remains truthful recovery/provenance for the same Parent artifact's pre-repair published representation, but it is not an exact-representation locator or positive publication qualification for the carried repaired Parent bytes.
- Parent-target disposition for those seven: after Anchor accepts this semantic decision and Tooling 021 receives its separately required provider material and per-artifact approval, the child's Parent-target integrity entry may bind locally to the carried repaired Parent representation. The historical published representation must remain separately visible through the existing `Repairs` provenance or an explicit pointer to the Parent's repair record. Do not erase it, rewrite history, or claim the old locator represents the repaired bytes.
- Parent Origin disposition for those seven: the existing old immutable `browse + git` locator may remain as recovery for the same logical Parent artifact before a new repaired representation is published, because Root makes `Trace` the continuity relation and `Origin` a recovery surface rather than the exact-byte integrity binding. Its representation status must remain historical/pre-repair in repair provenance. It must not be used to qualify the repaired current bytes.
- Future repaired publication: if the repaired Parent is later published as a new immutable exact representation, a separately approved origin repair may update `browse + git` to that new representation while preserving the old locator as historical repair provenance. No current authority supports inventing a second representation-state field or new origin label to encode the distinction.
- Tooling 025 consequence: an accepted receipt for the old immutable locator may confirm the pre-repair bytes/history but remains non-qualified/contradictory for the repaired current bytes; it must never be coerced into `publicationOrigin.state = qualified` for the repaired representation.
- Separate cases remain separate: the eight exact-material missing-backfill edges remain a receipt/approval tranche; `001-13-validator-surface-convergence-and-integrity-repair-strategy.trace.md` remains blocked by child self-integrity; the external Tiinex/docs Parent remains unresolved until exact Parent material is supplied.

## Basis

- Qualified Root authority separates ancestry, recovery, repair provenance, and representation integrity. `Parent`/`Trace` declares the direct continuity relation; `Origin` supports recovery and must not replace `Trace`; `Repairs` records trust-impacting corrections without automatically invalidating lineage; integrity values identify or verify representations and do not by themselves prove equal or different logical artifact identity across revisions.
- Root Parent Origin requires `browse + git` whenever `Parent` exists, calls it the portable archive permalink, and only says it should be commit-pinned when available. It does not authorize a missing/unavailable Parent-Origin state.
- Root's schema-reference rule explicitly permits truthful local/unpublished schema locators, but that authority is scoped to `Envelope Schema`, `Parent Schema`, and `Current Schema`; it is analogy only for the Parent-Origin gap.
- Root allows additional Parent-Origin labels only as descendant envelope extensions. Such additions are additive and do not satisfy or cancel the inherited required `browse + git` field. No qualified carried descendant override authorizes a different Parent-Origin requirement for these cases.
- The seven carried Parents explicitly record historical canonical representation repair, name the provider blob as the pre-repair published representation, and state that later repairs corrected envelope/schema-reference/continuity/integrity representation while preserving body/work-result meaning and historical creation time. The provider mismatch therefore corroborates, rather than contradicts, that repair provenance.
- Root says `Repairs` does not automatically invalidate the artifact or lineage and permits repair entries to refer to lineage, Parent, Origin, schema references, and integrity. This is sufficient canonical authority to preserve the semantic Parent relation while recording non-equivalent historical/current representations without inventing a new Origin vocabulary.
- Tooling 021 already requires an explicit representation-only or other qualified semantic disposition before refreshing a mismatching Parent target and forbids fabricated publication provenance. This decision supplies that semantic disposition only; it does not supply mutation approval.

## Consequences

- Never-published Parent case: Tooling 021 remains blocked from claiming a complete canonical repair while `browse + git` cannot truthfully exist. Read-only local Parent identity/digest inspection may continue, but mutation must not fabricate conformance. Route the bounded Root Parent-Origin authority question separately if canonical pre-publication continuations are required.
- Seven historical mismatch cases: after Anchor acceptance, Tooling 021 may treat the semantic mismatch as representation-only and may refresh the Parent-target integrity binding to the repaired local Parent, subject to accepted provider material, per-artifact approval, structure-preserving mutation, cascade rules, and repair receipts. Origin rewrite or publication is not required for that local representation binding and remains separately gated.
- Historical provenance is mandatory. The old commit-pinned locator remains evidence of the pre-repair published representation and must not be deleted or relabeled as the repaired representation.
- If Tooling 021 cannot represent the combination "local current Parent binding + historical Parent Origin + non-qualified current publication representation" without coercing publication state, it must remain blocked and return that implementation-contract limitation rather than alter this semantic classification.
- No schema mutation, lineage mutation, checksum refresh, descendant reseal, publication, commit, push, or remote write is authorized by this decision itself.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:DqtIHrCAjFpfqr59z3Luycj2JEdJvde8AYjzz0w06jQ
