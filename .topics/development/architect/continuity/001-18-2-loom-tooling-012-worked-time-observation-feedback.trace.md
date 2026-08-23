# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.feedback.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/core/feedback/tiinex.feedback.v1.schema.md)
  - Created At: 2026-08-23 13:23:00
  - Trace: [Loom cold-start worked-time observation feedback](001-15-1-loom-cold-start-worked-time-observation-feedback.trace.md)
  - Origin:
    - [relative](001-15-1-loom-cold-start-worked-time-observation-feedback.trace.md)
- Current
  - Current Schema: [tiinex.feedback.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/core/feedback/tiinex.feedback.v1.schema.md)
  - Created At: 2026-08-23 16:41:00
  - Authors: Anchor
  - Why: Preserve later Loom host-reported Worked-for observations as calibration evidence without conflating warm correction turns with fresh cold-start duration or treating UI timing as a canonical benchmark.
  - Summary: Tooling 012 initial shared-route implementation reported 19m11s Worked-for and its bounded secondary-route correction reported 9m47s; both occurred in the already-warm fresh-successor Loom conversation.
  - Status: draft/local

---

# Loom Tooling 012 worked-time observation feedback

## Observed Signal

- Tooling 012 initial shared-carrier/shared-route implementation turn: ChatGPT UI displayed `Worked for 19m 11s`.
- Tooling 012 secondary-route Required Context correction turn: ChatGPT UI displayed `Worked for 9m 47s`.
- Both observations belong to the Loom successor conversation that had already cold-started earlier; they are warm continuation/correction observations, not additional fresh-session cold-start measurements.
- The screenshots were supplied voluntarily by Q as host/meta evidence. Package bytes, durable results, and reproducible tests remain the acceptance basis for Tooling behavior.

## Calibration Use

- Keep these values separate from the earlier fresh Loom cold-start `17m37s` observation and earlier warm Tooling 011 correction `6m17s` observation.
- These UI values may inform future empirical Worked-time distributions by work type, but must not be treated as exact wall-clock, CPU, queue, or practical end-to-end elapsed time.
- Practical elapsed and Q active transport time remain separate clocks where later evidence is available.

## Limits

- `Worked for` is current host UI evidence, not a Tiinex canonical timing source or guaranteed stable platform metric.
- A longer or shorter future run does not by itself prove regression or improvement without comparable scope and environment.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:jKN0SFCu8G7J_Sn2Bh1q0bQdyaWcQypNbgg1LrxYf_E
