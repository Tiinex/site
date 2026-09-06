# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.topic.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/topic/tiinex.topic.v1.schema.md)
  - Created At: 2026-09-06 16:55:00
  - Trace: [Playthings Pilot Terminal Containment And Fidelity Specialization](001-1-playthings-pilot-terminal-containment-and-fidelity-specialization.trace.md)
  - Origin:
    - [relative](001-1-playthings-pilot-terminal-containment-and-fidelity-specialization.trace.md)
- Current
  - Current Schema: [tiinex.topic.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/topic/tiinex.topic.v1.schema.md)
  - Created At: 2026-09-06 20:08:00
  - Authors: Anchor; Sigma
  - Why: Preserve the successful two-phase Pilot pattern that first creates a static identity authority and only then combines that exact identity with an independent authored motion authority, while recording the phase-control and language behavior observed in the human-mediated session.
  - Summary: Playthings clean identity first, motion second, multi-turn Pilot specialization.
  - Status: accepted/local

---

# Playthings Clean Identity Then Motion Pilot Specialization

## Authority Purity

For Playthings animation work, character identity authority should be non-animated by default. Prefer one neutral static full-body reference or a neutral turnaround whose views do not imply temporal progression. Do not use a prior walk strip or multi-frame action sheet as identity authority when a separate motion authority is intended to control movement.

Motion authority and identity authority are separate semantic dimensions. Motion authority defines pose/time progression and direction; identity authority defines the person, body, clothing, equipment, materials, and visual style. Layout authority may be separate again when needed.

## Two-Phase Pilot Pattern

A reproducible multi-turn Pilot session may use:

1. **Phase 1 — identity master:** one neutral layout authority plus exact identity text; no motion authority and no prior animated identity reference. Preserve the exact generated static identity bytes.
2. **Phase 2 — motion retarget:** authored motion authority first, exact Phase-1 identity output second. Preserve the exact generated motion bytes.
3. **Return:** Pilot records both human-visible inputs, actual attachments/results, host anomalies, Evidence, and the Pilot-to-Anchor return Handoff, then stops.

The demonstrated Phase 1 produced a clean four-view static turnaround. Phase 2 produced an eight-frame left-walk source while keeping the new identity materially coherent.

## Human Control Signals

Do not rely on a single period as a universal phase-transition token. For cold-started Pilot sessions, operational guidance and control signals should be English/language-neutral by default unless the controlling artifact explicitly chooses another language. External user-visible generation text may use whatever language the controlling work requires.

Recommended explicit control semantics are conceptually 'Continue.', 'Return.', and 'Stop.'; the exact words remain a process/interface concern rather than visual semantics. If a provider asks only for confirmation, the execution plan must state the minimum confirmation expected instead of asking the human to infer it.

## Terminal Return

After the final phase result is returned, Pilot enters terminal-return mode. The controlling Handoff already declares the return role; Pilot must not rediscover Anchor by searching ambient workspace/continuation material. Preserve exact output, author Evidence + return Handoff, manufacture the package, then stop. If the terminal path needs extra human steering in a specific host, record that as process evidence rather than hidden context.

## Review And Promotion

Pilot does not visually accept either phase. Anchor reviews identity purity/consistency, alpha/layout, motion, deterministic postprocess, and promotion. Exact generated outputs remain transient lineage-local evidence until explicitly accepted. Stable selected assets move outside `.topics` while preserving immutable lineage/hash linkage.

## Interpretation Limits

- Does Not Mean: a static turnaround guarantees perfect motion retargeting; every provider follows authority order identically; English external generation prompts are required; or Pilot owns identity/motion acceptance.
- Must Not Be Used To Claim: provider-internal prompt equivalence, stable promotion merely because the two phases completed, or permission to let an animated identity image compete with a separately declared motion authority.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [Playthings Pilot Terminal Containment And Fidelity Specialization](001-1-playthings-pilot-terminal-containment-and-fidelity-specialization.trace.md)
  - Value: g_bChxrRYbbxXyavr6uM8voAshjPHjdWjM5jHyrzpXc

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: AxoXv3wNY1Xveek012qAolhn7m7gdC7qF2f3tYwTO_s
