# M1 v368 workspace entrypoint lifecycle consolidation

Checkpoint: `v368`

Status: bounded model consolidation after the formally failed v366 M1 attempt and the later v367 recovery acceptance/review FAIL signal. This document is not an M1 PASS claim.

## Problem boundary

Architect review of v367 re-grounded `.old/` around two product domains that must not be conflated:

```text
Add to a concrete workspace
→ add material/source to that workspace

Workspace entrypoint at page/global boundary
→ affect the workspace set
→ Open / Merge
```

A hosted app config is automated workspace-set/startup input. It is not a workspace-local Add operation.

The same review also found a capability leak: schema ids/kinds containing the word `workspace` could make schema-definition material appear Openable. Artifact type/schema information is not Workspace Open/Merge capability.

## Canonical lifecycle contract

v368 uses one workspace-entrypoint lifecycle owner for the workspace-set semantics consumed by:

- hosted/default startup,
- Workspace Artifact Open,
- Workspace Artifact Merge,
- page/global local workspace-file intake.

```text
Open
→ resolve declared workspace entrypoints
→ create/reuse declared workspace set in order
→ replace prior non-draft/source-only visible workspaces
→ preserve durable local work
→ focus the opened workspace set

Merge
→ resolve declared workspace entrypoints
→ retain current workspace set
→ create/reuse missing declared workspaces
→ do not duplicate already loaded workspace/source identities
```

Different ingress paths may prepare different inputs, but they do not own competing workspace-set state machines.

## Product routing

### Page/global workspace file

A page/global local workspace-file intake is treated as a workspace entrypoint:

- with no current workspace set, Open may be applied directly;
- with an existing set, Open/Merge is an explicit workspace-lifecycle choice;
- mixed ordinary material + workspace files are not silently interpreted as global config.

### Concrete workspace drop/Add

A workspace file added/dropped onto a concrete workspace remains canonical artifact/material in that workspace. The concrete workspace surface stops propagation before the page/global entrypoint handler, so the file is not auto-applied as global workspace configuration.

### Add-to-workspace

Primary Add remains PoC-grounded:

```text
Manual files
Manual folder
GitHub source
Explicit URLs
Drag and drop
```

`Paste trace` remains a secondary advanced material intake. `Tiinex app config` is not an Add-to-workspace action in v368.

## Capability ownership

Canonical invariant:

```text
workspace-related schema/type information
!=
openable workspace entrypoint capability
```

Open/Merge capability comes from:

- an actual workspace artifact path such as `*.workspace.md`, or
- an explicit canonical `tiinex.workspace.artifact.role.v1` role.

Schema-definition paths win classification before workspace capability. Therefore:

```text
tiinex.workspace.v1.schema.md
→ schema-definition
→ no Workspace Open/Merge
```

while:

```text
valid *.workspace.md
→ workspace artifact / entrypoint capability
→ Open / Merge
```

Legacy workspace shapes may still be recognized by the intake compatibility detector, but once materialized they receive the explicit canonical workspace-artifact role rather than relying on schema-name substring inference.

## Deliberate exclusions

v368 does not claim or redesign:

- FS25/Gaming material ownership/readmodel without actual source proof,
- source transport/readability,
- lineage/status taxonomy,
- outbound GitHub publication format,
- M4 authoring/Create semantics,
- M2 Workspace Spine,
- broad scroll/CSS/layout ownership.

Those signals remain separate from this bounded workspace-entrypoint lifecycle correction.
