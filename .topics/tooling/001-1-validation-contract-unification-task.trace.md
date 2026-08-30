# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/911d4cf990e35ce25a56e8f376d296e327c48260/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.discovery.v1](https://github.com/Tiinex/docs/blob/911d4cf990e35ce25a56e8f376d296e327c48260/.topics/.schemas/discovery/tiinex.discovery.v1.schema.md)
  - Created At: 2026-08-30 17:08:35
  - Trace: [Tooling Development Loop Efficiency Discovery](001-tooling-development-loop-efficiency-discovery.trace.md)
  - Origin:
    - [relative](001-tooling-development-loop-efficiency-discovery.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/911d4cf990e35ce25a56e8f376d296e327c48260/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-30 17:48:00
  - Authors: Anchor
  - Why: Turn Loom's highest-confidence efficiency finding into one bounded Site-local development slice before broader Tooling, role-resolution, Viewer, or Atlas work expands the validation burden.
  - Summary: Unify focused Tooling, integration, and closure validation into one composable restartable contract without weakening final qualification.
  - Status: ready/local

---

# Validation Contract Unification

## Objective

Make the existing focused Tooling gate, restartable validation chain, checkpoint helpers, profiler, and full closure suite compose as one explicit layered development contract so ordinary bounded Tooling work can run the smallest meaningful profile while final closure still proves the broader risks.

## Done Criteria

- One explicit validation-profile contract names at least `focused/tooling`, `integration`, and `closure`, with each profile's purpose and included checks inspectable without reading a giant shell string.
- The ordinary bounded Loom development path can run the focused profile through restartable/checkpointed execution and emit a stable receipt that identifies the exact profile/commands executed and where a failed run may resume.
- Integration/closure qualification consumes or reuses the same focused-profile definition rather than maintaining a drifting second copy of the fast-path checks.
- Final closure still performs the additional type/runtime/public/build and other meaningful risks required by the current Site qualification contract; this Task does not turn a focused pass into release qualification.
- Existing checks are moved, grouped, or referenced only after their contract purpose is understood. No test is deleted merely because it is numerous, old, or slow, and test count is not used as a quality metric.
- A focused before/after receipt reports local process timing and executed/reused steps without attributing host/model wait that the local process cannot observe.
- The implementation has focused deterministic tests for profile composition, restart identity, failure/resume behavior, and closure inclusion before Sigma is asked for any human product judgment.

## Scope

- Site-local Tooling validation orchestration and its deterministic tests only.
- Prefer adapting the existing `run-tooling-iteration-gate`, `run-validation-chain`, profile/checkpoint helpers, and package scripts over introducing a parallel validation framework.
- Do not implement exact-workset caching, Handoff archive reuse, parallel-safe groups, role inheritance/resolution, shared graph projection, Atlas, or unrelated Viewer work in this slice. Those remain ordered follow-on work in the Parent Discovery.
- Do not bypass the known Site source/release qualification boundary. If the existing browser import blocker prevents a closure demonstration, preserve it as an explicit external blocker rather than weakening or silently skipping the check.
- Do not infer hidden host/safety behavior from wall-clock observations or design around host controls.

## Dependencies

- [Tooling Development Loop Efficiency Discovery](001-tooling-development-loop-efficiency-discovery.trace.md)
- Organizational priority/acceptance remains owned by `Tiinex/business::.topics/initiatives/001-2-6-tooling-workflow-iteration-efficiency-task.trace.md`.
- Current Site validation/checkpoint/profile helpers and their existing deterministic tests.
- Loom implementation/verification after Sigma lands this prepared source; Sigma human review is not a substitute for machine-verifiable Tooling checks.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [Tooling Development Loop Efficiency Discovery](001-tooling-development-loop-efficiency-discovery.trace.md)
  - Value: IK42aYEQn5yCei7G58Q6BxfhoChAdYRo7FKmGJ-2qVw

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:5C3jXAkm8Xd7f4NyfRe4vAJd0XoZQ8fhb18n_rs2Xqw
