# v384 — bounded cross-owner PoC-parity recovery

## Boundary

v384 follows three failed M2 Q acceptance rounds. It is not another M2 acceptance iteration. It repairs four concrete owner paths while preserving the existing Workspace Spine/source/candidate architecture.

## Owner contracts

### Workspace view
`workspaceViews[id]` is the canonical per-workspace presentation owner. Schema navigation must patch that owner, not only top-level `state.view`.

### Targeted GitHub schema source
Compatible exact schema reads share one configured GitHub source boundary. Exact files accumulate in `explicitFileRefs`; `repoDiscovery` remains explicit user configuration. Exact record provenance remains on `sourceTarget`.

### Parent authority/recovery
A declared exact parent can be known but unloaded. That is recoverable `missing`, not `ambiguous`. Comment identity and issue-root identity are exact publication identities; broad issue membership is insufficient. Embedded Tiinex artifacts are preferred over publication shells after exact identity filtering.

### Startup config application
`workspace-discovery` is a bootstrap phase, not the final workspace. After source materialization, startup selects the matching Workspace Artifact and applies it through the shared Open/entrypoint lifecycle owner. This auto-application exists only at startup/app-config ownership, not for arbitrary later Workspace Artifacts.

## Nonclaims

No M3/M4/full M5 redesign and no M2 Q #4.
