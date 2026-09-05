# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-04 14:06:25
  - Trace: [012-2-2-1-loom-to-anchor-validation-method-report-shared-factory-return-handoff.trace.md](012-2-2-1-loom-to-anchor-validation-method-report-shared-factory-return-handoff.trace.md)
  - Origin:
    - [relative](012-2-2-1-loom-to-anchor-validation-method-report-shared-factory-return-handoff.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-04 14:13:24
  - Authors: Anchor
  - Why: Sigma identified that Anchor should plan in majors as a durable routine rather than rely on conversation memory.
  - Summary: Make major-sized planning, handoff/turn forecasting, reforecasting, and stable full-source major delivery a cold-start-grounded Anchor responsibility.
  - Status: ready/local

---

# Persist Anchor Major Planning As Grounded Role Authority

## Objective

Make major-sized planning a durable Anchor responsibility that survives cold start through exact carried Role material rather than conversation memory. Anchor should plan larger work as coherent major-sized segments, estimate role handoffs and coordination turns to the next stable major, expose confidence, reforecast when observed work diverges materially, and deliver a major only when that segment has reached a stable full-source checkpoint that makes visible progress legible to Sigma and other followers.

The first direct Role-authoring attempt exposed a canonical schema gap instead of producing a valid continuation: `tiinex.party.role.v1` says its Role body replaces the inherited Party body, but that replacement is not yet expressed through the generic machine-readable inheritance-override authority established by the Schema Factory work. Do not bypass that gap with schema-id branches, manual material bindings, prose guessing, or invalid Role bytes.

## Done Criteria

- Axiom qualifies the existing Party→Role body specialization and, if semantically correct, represents it using the same generic schema-native inheritance-override mechanism already accepted for child body replacement.
- `tiinex.party.role.v1` validates generically without simultaneously requiring the replaced Party body and the Role body.
- A qualified child of `business::.topics/roles/001-1-anchor-role.trace.md` continues the Anchor role with explicit responsibility for plan → major segmentation → turn/handoff estimation → confidence → reforecast → stable major delivery.
- The continued Role states that major boundaries are coherent plan-segment checkpoints, not counters driven by task count, turn count, carrier-path length, or cosmetic numbering pressure.
- A major is delivered only after its segment is coherently closed, stable, full-source, and suitable as a recovery baseline and human-visible progress checkpoint.
- Future Anchor handoffs carry/resolve the continued Role artifact as exact Role material so a cold Anchor receives this routine without conversational teaching.
- A later Tooling enhancement may project Current Major, Current Segment, Next Planned Major, Exit Criteria, remaining turn/handoff estimate, confidence, and reforecast reason; forecasts remain forecasts rather than semantic promises.

## Scope

- Canonical `tiinex.party.role.v1` inheritance/body-specialization semantics only as required for the already-declared Role specialization.
- Business Anchor role lineage continuation.
- Shared grounding/tooling projection needed to make the routine durable and visible.
- The current Validation Method / Validation Report factory tranche remains independently bounded; this task must not rewrite its semantic scope.

## Dependencies

- Current Anchor Role: `business::.topics/roles/001-1-anchor-role.trace.md`.
- Schema-native inline inheritance-override architecture established during the cleaned Schema Factory tranche.
- Sigma feedback on 2026-09-04 that Anchor should plan in majors, estimate turns/handoffs, reforecast, and use stable full-source majors as understandable progress segments.
- Current Loom Validation Method / Validation Report return may be reconciled before routing this task onward, avoiding unnecessary carrier parallelism unless Anchor deliberately chooses a real parallel branch.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [012-2-2-1-loom-to-anchor-validation-method-report-shared-factory-return-handoff.trace.md](012-2-2-1-loom-to-anchor-validation-method-report-shared-factory-return-handoff.trace.md)
  - Value: zjEGoUQlZDsRHr6ikF0cbMA7704doXbl11M9hQMNpb4

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: 9xsAGl5b5sQr45tCDRPVwDmn3IIVg_C4pDHLa6jgYyM