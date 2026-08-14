# M1 v369 workspace entrypoint contract closure

Checkpoint: `v369`

Architect review of v368 passed the intended lifecycle consolidation but found three local ownership gaps. v369 closes only those gaps.

## 1. Default startup consumes the shared lifecycle

`prepareDefaultWorkspaceStartCommand()` now delegates workspace-set application to `openWorkspaceEntrypointSet()` rather than maintaining a second create/hydrate/replace state machine.

Callbacks preserve the existing default-start requirements:

- deterministic default workspace IDs,
- local-delta hydration after each workspace creation,
- bootstrap/workspace-config annotations,
- `registerSources: false` before explicit source materialization,
- declared workspace-entrypoint order.

The regression also proves shared Open semantics: prior source-only/non-draft workspace context is replaced while durable browser-local work survives.

## 2. Record actions consume canonical capability

`presentRecordActions()` now consumes `workspaceEntrypointCapability(record)` and exposes Open and Merge independently.

Regression coverage includes:

```text
open=false / merge=true → Merge only
open=true / merge=false → Open only
ordinary *.workspace.md → Open + Merge
```

## 3. Legacy role migration normalizes once

Legacy candidate-bearing persistence now emits:

```text
schema: tiinex.workspace.artifact.role.v1
openEligible: true
mergeEligible: true
```

The stale shape:

```text
tiinex.workspace.artifact-role.v1
openMergeEligible
```

is not retained in canonical runtime records.

## Scope boundary

No FS25/readmodel, transport, lineage, scroll/layout, authoring, M2 or Q-test work is included.

```text
original M1 acceptance = FAIL
v368 lifecycle consolidation = architect PASS on intended correction
v369 = bounded contract-closure candidate
v369 ≠ M1 PASS
v369 ≠ Q-test-ready
```
