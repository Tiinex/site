# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-23 12:38:00
  - Trace: [Process measurement and calibration schema classification](001-15-process-measurement-calibration-schema-gap.trace.md)
  - Origin:
    - [relative](001-15-process-measurement-calibration-schema-gap.trace.md)
- Current
  - Current Schema: [tiinex.feedback.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/core/feedback/tiinex.feedback.v1.schema.md)
  - Created At: 2026-08-23 14:39:00
  - Authors: Anchor
  - Why: Preserve the first exact host-displayed Worked-time observations for a genuinely fresh Loom successor and its same-conversation correction without forcing them into an unresolved generic metrics schema.
  - Summary: Fresh Loom Tooling 011 run displayed 17m37s Worked time; warm bounded correction displayed 6m17s; keep them separate from practical elapsed time and human active time.
  - Status: accepted/local

---

# Loom cold-start Worked-time observation feedback

## Feedback Target

- Target: process measurement/calibration input cases for Role cold-start and correction work.
- Not Target: Tooling 011 acceptance, model ranking, Q effort, practical end-to-end elapsed time, or a claim that Worked time is stable across hosts/models.

## Feedback Received

- The first genuinely fresh Loom successor run for Tooling 011 surfaced ChatGPT host text `Worked for 17m 37s`.
- The same fresh Loom conversation's later bounded final static-gate correction surfaced `Worked for 6m 17s`.
- The first value is a fresh cold-start + real bounded implementation observation; the second is a warm continuation/correction observation and must not be counted as a second cold-start.
- These values should not be summed and relabeled as one latest-run time when comparing cold-start cost versus correction cost.

## Source

- Q screenshots of the completed Loom host responses during Tooling 011 and its correction.
- The corresponding durable Loom Handoff/result lineages preserve what work each displayed time covered.

## Disposition

- State: accepted-as-calibration-input
- Follow-Up: retain both values as exact observed Worked-time points for the unresolved measurement/calibration classification Task; later measurements should keep at least `Worked`, practical elapsed, and human active time as distinct clocks.
- Acceptance Effect: none on product/Tooling acceptance by itself.

## Limits

- Host `Worked for` semantics are platform-projected and may change; this artifact records the displayed observation, not an externally calibrated compute-time definition.
- No exact practical elapsed time or Q active time is inferred from these values.
- Two observations are insufficient to establish a stable cold-start multiplier, correction multiplier, phase/major cost, or forecast model.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:iQEUloyuOZxspd9WUqyG743XnfY5IYeVhhWYR9xq-VU
