# Continuity Context

- Envelope Schema: [tiinex.root.v1](../../tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.root.v1](../../tiinex.root.v1.schema.md)
  - Created At: 2026-06-14 00:00:00
  - Trace: [tiinex.root.v1.schema.md](../../tiinex.root.v1.schema.md)
  - Origin:
    - [relative](../../tiinex.root.v1.schema.md)
    - [browse + git](https://github.com/Tiinex/docs/blob/00adbcc5b0319410cf16752a54dcbf4813173040/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.task.v1](tiinex.task.v1.schema.md)
  - Created At: 2026-06-05 02:00:00
  - Summary: Schema for bounded task artifacts that define concrete work and completion.

---

# Task

- Status: maintained schema note

## Summary

This schema defines artifacts whose main job is to state one bounded unit of
work clearly enough to execute, review, or hand off.

It is for concrete work slices where the reader should be able to tell what is
being asked for, what completion means, and what boundaries still apply.

## Schema Validation Contract

### Task Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.task.v1`

Rules

- `tiinex.task.v1` identifies artifacts centered on one bounded unit of work.
- The body should make the requested work legible without requiring special tooling.
- A task artifact should let a later reader tell what work is in scope now and what counts as done.
- Prose outside `Schema Validation Contract` may explain the schema, but it does not add required validation rules.

### Task Body

Required Shape

- first body heading after the continuity envelope
- readable prose or lists that state the concrete work, completion signal, and boundaries

Optional Sections

- Subtasks
- Risks
- Open Questions
- Requested Work
- Acceptance Criteria
- Blockers

Rules

- A task artifact should begin with a human-readable title.
- A task artifact should contain enough body content that a later reader can identify the work being requested now.
- The body should make the current boundaries or constraints readable rather than hiding them in terse metadata.
- Follow-up sections must not replace the concrete work statement or completion signal.
- If the artifact becomes mostly design exploration instead of bounded work, another schema should own it instead.

### Task Semantics

Allowed Shapes

- standalone task
- task with dependencies
- task with recursive subtasks
- blocked task with explicit dependency signal
- task with concrete origin targets

Rules

- A task artifact should make the requested work explicit.
- A task artifact should make clear what completion means for the current task.
- A task artifact should make clear what constraints, non-goals, or boundaries still apply.
- When the task depends on concrete files, traces, or other durable artifacts, the artifact should prefer explicit readable target references over vague mentions.
- Recursive subtasks are allowed when they clarify execution, but the current task should remain the primary reading unit.

### Task Envelope Companions

Optional Fields

- `Current -> Why`
- `Current -> Summary`
- `Current -> Authors`
- `Current -> Origin`

Rules

- Task artifacts may carry light current-side metadata when it helps a reader orient quickly.
- Task artifacts should declare parent signal when they continue, refine, or decompose an earlier local artifact.
- Task artifacts should avoid turning envelope metadata into the only place where the requested work is described.

### File Naming

Allowed Shapes

- `<lineage>.trace.md`
- `<lineage>-<task-slug>.trace.md`

Rules

- Task artifacts should keep the lineage label first.
- The optional slug should describe the concrete work slice.
- Task artifacts should prefer short human-readable slugs.
- Task artifacts should keep the `.trace.md` suffix stable.

### Interpretation Boundaries

Rules

- Use `tiinex.task.v1` when the artifact is mainly defining concrete work and completion criteria.
- Do not use `tiinex.task.v1` for broad design exploration without a bounded work request.
- Do not use `tiinex.task.v1` for thin pointers or passive evidence capture.
- If the artifact's main job is to land what now governs rather than what should be done, another schema should own it.

## Minimal Example

```md
# Continuity Context

- Envelope Schema: tiinex.root.v1
- Current
  - Current Schema: tiinex.task.v1
  - Created At: 2026-06-05 00:00:00
  - Summary: Repair stale schema-note parent links.

---

# Repair Schema Parent Links

## Objective

Replace stale schema-note parent links with the intended committed targets.

## Done Criteria

- parent links point at the intended committed root-schema permalink
- continuity footer values are refreshed after the rewrite

## Scope

- update only the affected schema-note lineage slice

## Dependencies

- root schema permalink remains readable during the repair
```

## Validation-Friendly Shape

Keep this maintained schema note in the exact section order already used here:
`Summary`, `Schema Validation Contract`, `Minimal Example`,
`Validation-Friendly Shape`, `Interpretation Notes`, and
`Artifact Creation Contract`.

Maintain the section headings exactly in this schema note. Free markdown inside
those sections is allowed, but adding undeclared new section headings should be
treated as schema drift.

## Interpretation Notes

- a task artifact should stay concrete enough that a reader can tell what work is being requested now
- recursive subtasks are allowed, but the current task should remain the primary reading unit
- if the artifact becomes mostly design rationale instead of bounded work, a topic schema may be a better fit
- if the artifact becomes mainly about what now governs, a decision schema may be a better fit

## Artifact Creation Contract

### Prompt Fields

Required Fields

- version
- createTitle
- summaryPrompt
- summaryPlaceholder

Optional Fields

- whyPrompt
- whyPlaceholder

Rules

- The current task create surface uses version `1`.
- `createTitle` should label the create action as `Create Task`.
- `summaryPrompt` should ask for the task title.
- `summaryPlaceholder` should guide the user toward the concrete work to be done.
- `whyPrompt` and `whyPlaceholder` may be omitted when create flow does not ask for a why field.

### Template Body

Required Shape

- first heading uses `# {{summary}}`
- `## Objective` section
- `## Done Criteria` section
- `## Scope` section
- `## Dependencies` section

Rules

- Generated task artifacts should begin with the task title as the first body heading.
- `Objective` should describe the concrete work being asked for.
- `Done Criteria` should define what completion means for the task.
- `Scope` should capture boundaries, constraints, and non-goals.
- `Dependencies` should capture blockers, required artifacts, or prerequisite work when they exist.
- Tools should preserve the same generated body shape even when they use a maintained built-in template.

---

# Continuity Integrity

- sha256-base64url-c14n-v1
  - Towards: [tiinex.root.v1.schema.md](https://github.com/Tiinex/docs/blob/00adbcc5b0319410cf16752a54dcbf4813173040/.topics/.schemas/tiinex.root.v1.schema.md)
  - Value: BFWYft1v0Ue0gUoO236DGScvnixS7_MIEwO6mhJhkNw

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: SVkacZ6IRAHU68znToXLqDvAKAVRMUqdZHJNAVmmcBc