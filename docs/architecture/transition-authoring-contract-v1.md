# Transition Authoring Contract v1

Status: design contract for the post-Milestone A authoring slice. This file is not a runtime implementation.

Milestone A made Root/viewer/source/workspace behavior stable enough to build schema-owned authoring on top of it. The next step must be a narrow vertical slice, not a broad migration of every PoC schema or transition.

## Purpose

Define how Tiinex should describe, validate, and present artifact transitions before implementing new Create/Edit behavior.

The contract optimizes for:

- schema-owned meaning,
- explicit source/draft boundaries,
- compact card actions,
- mobile-friendly action disclosure,
- no PoC monolith behavior,
- no broad legacy fallback burden.

## Non-goals

This contract does not implement:

- full Create/Edit UI,
- remote writes,
- broad PoC schema migration,
- Reference graph semantics,
- Like/Feedback/custom transition families,
- source-backed artifact mutation,
- inert form scaffold files.

## Core distinction

Open and Merge are workspace lifecycle actions, not artifact transitions.

```text
Open
  Replaces the active workspace set with the workspace entrypoints declared by a workspace artifact.

Merge
  Adds missing workspace entrypoints without duplicating already loaded workspaces.
```

Artifact transitions describe how one artifact can produce a new local/draft artifact or a relation-like result. They do not replace workspace lifecycle ownership.

## Terms

### Transition intent

The semantic family of a transition. Intent affects where the result belongs and how users should reason about it.

Initial intent families:

```text
continue
reference
custom
```

`continue` means the result is a child/continuation in lineage.

`reference` means the result preserves or relates to source material without automatically becoming a lineage child.

`custom` is reserved for future families such as feedback, classify, annotate, fork, or like. Custom intents must still declare their boundary and result semantics before they become active.

### Transition definition

A schema-owned declaration of one available transition from a source artifact schema to a result schema or relation result.

A transition definition is not a button. UI may present it as a direct action, an item in a group, or an overflow item.

### Transition group

A presentation/navigation grouping. Groups make many actions navigable but do not define semantics.

Often intent and group match:

```text
intent: continue
presentation.group: Continue
```

But they do not have to. A recommended action may be placed in a primary group while still exposing its intent as Continue.

### Quick action

A presentation hint that lets a transition appear directly on the artifact card when there is enough action budget.

Quick actions do not create new semantics. They must not hide transition intent.

### Draft schema conversion

Changing the schema of a local draft during edit is not an artifact transition. It is draft conversion/edit behavior and must remain separate from source-backed lineage semantics.

## Minimal definition shape

The first implementation should be able to consume a shape like this:

```yaml
id: topic.continue.task
fromSchema: tiinex.topic.v1
intent: continue
resultSchema: tiinex.task.v1
label: Create task
shortLabel: Task
priority: 100
availability:
  sourceModes:
    - local-*
    - source-backed
  parentKinds:
    - loaded-record
  requiresEditableParent: false
resultBoundary:
  mode: browser-local-draft
  sourceMutation: none
  remoteWrite: false
  mayInheritParentSource: false
presentation:
  group: Continue
  placement: primary
  variant: icon-only
  icon: task
  tooltip: Continue · Create task
  ariaLabel: Continue: Create task
  mobileLabel: Create task
form:
  id: topic.continue.task.default
  ownerSchema: tiinex.task.v1
  context: continue-from-record
  variant: compact
```

Required fields for an active transition:

```text
id
fromSchema
intent
resultSchema or resultKind
label
availability
resultBoundary
presentation
```

Optional fields may exist later, but missing optional fields must not trigger hidden fallback behavior.

## Boundary rules

Source-backed artifacts are read-only for authoring.

A transition from a source-backed parent may create a local/draft continuation, but the result must not inherit the parent's GitHub/source object.

```text
source-backed parent
→ transition
→ browser-local draft child
→ explicit export/publication later
```

Local/draft parents stay local unless explicitly exported. No transition may infer GitHub provenance from a local parent.

Every transition result must preserve:

```text
Parent Schema
Parent Trace
Parent Boundary
Current Schema
Created At
Summary
Status / Why
Continuity Integrity footer
```


## Local draft storage path policy

Transition result paths are authoring artifacts, not source provenance. They must be deterministic enough to be predictable, but they must never overwrite an existing sibling draft.

Initial policy:

```text
default directory:
  dirname(parent.path)

default trace suffix:
  .trace.md

non-dimensioned parent:
  <parent-dir>/<draft-slug>--<target-schema-slug>.trace.md
  <parent-dir>/<draft-slug>--<target-schema-slug>-2.trace.md

dimensioned parent:
  <parent-dir>/<parent-dimension>-<child-ordinal>-<draft-slug>.trace.md

examples:
  .topics/ai-provenance/12-01-gpt-5-mini.trace.md
  → .topics/ai-provenance/12-01-01-model-follow-up.trace.md

  .topics/.github/tiinusen/socials/.issues/3/comment-001-...lagar-och-regler.trace.md
  → .topics/.github/tiinusen/socials/.issues/3/001-1-lagar-och-regler-continuation.trace.md
```


GitHub issue/discussion material is adapter-owned sidecar material, not repo-file material. Canonical sidecar paths therefore use `.topics/.github/<owner>/<repo>/.issues/<issue>/...` or `.topics/.github/<owner>/<repo>/.discussions/<discussion>/...`. Repo files themselves remain at their exact repository paths; no `.repo` wrapper is introduced. Internal transport/cache ids may use compact slugs, but those ids must not leak into browsable artifact paths.

The path is local/draft storage placement only. Keeping it near the parent does not make the draft source-backed, does not mutate the source file/comment, and does not infer GitHub provenance.

Recovered issue-comment paths include transport/publication wording, for example `comment-001-5008615398-...`. `comment-` and the long GitHub id are publication/recovery identity, not part of the canonical lineage dimensions. Continuation children must therefore preserve the canonical dimension prefix and start at `001-1-...`, then `001-2-...` in the same folder.

The final create path must be rechecked against the active workspace immediately before insertion. Dialog previews can become stale if another draft is created while a dialog is open; the add path guard must allocate a new sibling path instead of replacing the older leaf.

Programmatic transition drafts must expose parsed envelope metadata on the runtime record (`trace`, `origin`, `parentSchemaId`, `schemaId`, and current timestamps) in addition to embedding it in Markdown. Runtime lineage/readmodels should not need to parse Markdown during render just to recover a freshly created draft edge.

A future folder picker may choose a different folder, especially for Reference-style work. It must still use the same no-overwrite sibling rule and must make lineage parent separate from storage placement.

## Form ownership and selection

A transition may choose a form, but the form is still schema-owned authoring behavior, not generic card/UI logic.

The transition definition may reference a form contract such as:

```yaml
form:
  id: topic.continue.task.default
  ownerSchema: tiinex.task.v1
  context: continue-from-record
  variant: compact
```

This means:

```text
- the transition chooses the result schema and authoring context
- the result schema companion owns the fields, defaults, validation, and renderer
- multiple forms can exist for the same result schema when context requires it
- unsupported form references must fail closed instead of falling back to a broad schema picker
```

Examples:

```text
Topic → Continue → Task
  may use a compact task form seeded from the parent topic

Topic → Continue → Task from meeting note
  may later use another task form with due-date/owner emphasis

Draft type conversion
  is not a transition form; it belongs to local draft edit/conversion behavior
```

B1 may use one locked Task continuation form. It must not introduce a broad universal form engine or a schema picker that suggests unsupported schemas.

## Presentation policy

Card actions have an action budget. Tiinex should not make cards wider or wrap action rows just because more transitions become available. Static record actions keep their learned order; schema-owned transition actions are appended as the right-edge dynamic group instead of being inserted between static controls.

Desktop may use icon-only actions when all of these are true:

```text
- tooltip exists
- aria-label exists
- icon token is registered
- placement is stable
- intent remains visible through tooltip, group, or accessible label
```

Mobile should prefer a FAB/action sheet or compact overflow surface that shows full labels and intent.

```text
Desktop example:
  [Task icon] [Reference icon] [More]

Tooltips:
  Continue · Create task
  Reference · Preserve evidence
  More actions

Mobile example:
  Actions
    Continue · Create task
    Reference · Preserve evidence
```

Intent must remain visible somewhere in the action. Icon-only is a compression strategy, not a semantic hiding strategy.

## Icon policy

Transitions choose icons by token, not by arbitrary SVG or emoji.

```yaml
presentation:
  icon: task
```

The UI owns the icon registry and visual rhythm. This prevents multiple unrelated transitions from accidentally sharing the same glyph or breaking card alignment.

Initial icon token classes may include:

```text
continue
reference
task
decision
evidence
feedback
more
```

Only tokens with implemented visual/semantic meaning should be allowed in active transition definitions.

## Grouping and action selection

A first UI implementation can use these rules:

```text
1. Resolve available transitions from the selected record's schema companion.
2. Filter by availability and boundary rules.
3. Sort by priority.
4. Reserve at most one primary quick action on narrow cards.
5. If multiple transitions share intent, show an intent group.
6. Put lower-priority or unsupported presentations in overflow.
7. Keep static record actions in stable learned order.
8. Append transition quick actions as the right-edge dynamic group.
9. On mobile, collapse to FAB/action sheet with full labels.
```

Example outcomes:

```text
One Continue transition:
  desktop: icon-only Task action with tooltip "Continue · Create task"
  mobile: action sheet item "Continue · Create task"

Multiple Continue transitions:
  desktop: Continue group/dropdown
  mobile: action sheet section "Continue"

Continue + Reference:
  desktop: primary quick action + Reference group or overflow
  mobile: action sheet sections "Continue" and "Reference"
```

## Companion ownership

Schema-specific transition meaning belongs with the schema companion.

Generic runtime may own:

```text
- transition definition normalization
- availability filtering
- action budget selection
- draft boundary validation
- generic result envelope requirements
```

Schema companions own:

```text
- which transitions exist for that schema
- labels and short labels
- result schema choice
- schema-specific input requirements
- schema-specific validation/presenter behavior
```

Do not add form companions until a real form owner is implemented. No inert scaffold files should ship.

## First vertical slice

The first implementation slice should be exactly:

```text
tiinex.topic.v1
→ intent: continue
→ tiinex.task.v1
```

This slice proves the authoring pipeline without migrating the full PoC schema set.

It must demonstrate:

```text
- transition definition discovery from Topic companion
- compact action presentation under card action budget
- browser-local Task draft creation
- draft-only edit for Task
- export/import roundtrip for Task
- source-backed parent remains read-only
- no source object inherited by the draft
```

If `tiinex.task.v1` is not yet implemented as a schema companion, B1 should create the minimal companion needed for this slice. It should not create companions for unrelated schemas.

## Explicitly deferred

```text
Reference relation semantics
Like/feedback/custom transition families
remote publication writes
source-backed direct edit
wide schema conversion UI
bulk migration of PoC artifacts
legacy issue envelope compatibility beyond currently documented source recovery limits
```

## Validation expectations

B0 is complete when this document is accepted as the design basis.

B1 must add tests before claiming runtime support:

```text
- transition definitions normalize and validate
- Topic exposes exactly the intended Task transition
- unavailable schemas do not surface active actions
- source-backed parent creates local draft only
- local parent does not gain source provenance
- icon-only actions have tooltip and aria-label
- mobile presentation has full labels
```

## Milestone A closure note

Legacy issue-comment artifacts that do not recover full lineage should not block this authoring slice. New Create/Edit/Export work should produce canonical envelopes so problematic PoC-era material can be re-exported instead of forcing the viewer to carry every historical variant forever.
