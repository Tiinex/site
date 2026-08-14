# M1 structural recovery plan — v369 qualification map

Checkpoint: `v369`

This artifact maps the fresh `.old/` PoC audit to the structural recovery owners used in v359–v369. It is a recovery/qualification map, not a claim of browser parity.


## v367 acceptance-fail correction (architect-verified)

The v366 Q acceptance gate failed. v367 corrected three explicit PoC product oracles without reopening the broader recovery architecture: Workspace Artifact Open replaces prior non-draft workspaces while Merge retains context; startup applies the full openable Workspace Entrypoints set; and Add restores the PoC primary hierarchy. Architect independently verified that bounded correction against `.old/`. Subsequent v367 recovery feedback/discovery still produced a FAIL signal for the workspace-entrypoint lifecycle/capability model, so neither the original failed acceptance nor the later recovery failure is erased by the correction PASS.

## v368 workspace-entrypoint lifecycle consolidation

A subsequent bounded discovery found that workspace/app config still lived in the wrong product domain and that schema/type substring inference could grant Workspace Open/Merge capability. v368 consolidates hosted/default startup, Workspace Artifact Open/Merge and page/global workspace-file intake behind one workspace-entrypoint set lifecycle; removes app config from Add-to-workspace; preserves concrete-workspace `.workspace.md` as artifact/material intake; and centralizes capability ownership so schema definitions cannot become Openable workspaces by name/type alone.


## v369 workspace-entrypoint contract closure

Architect review passed v368's intended lifecycle consolidation but found three local ownership gaps. v369 removes the duplicate default-start state machine by routing default startup through `openWorkspaceEntrypointSet()`, makes record actions consume `workspaceEntrypointCapability()` per action, and normalizes legacy candidate migration to the canonical `tiinex.workspace.artifact.role.v1` role with separate Open/Merge flags.

## Contract collapse

### 1. Startup/config ownership + local continuity

**PoC contract:** explicit route/query/runtime/hosted workspace configuration owns startup before embedded/default fallback. Browser-local continuity augments the canonical workspace/config context; it does not replace config ownership with a competing local-only startup model.

**v366 owners:**
- `src/app/tiinexAppStartupSource.js` — query/runtime/host/hosted candidate resolution.
- `src/app/initialWorkspaceBootstrapOperation.js` — config/default ownership first, then durable local augmentation.
- `src/app/workspaceStartupTransition.js` — reusable mount/Home/clean-route transition.
- `src/app/startupWorkspaceCommand.js` / `defaultWorkspaceStartCommand.js` — bounded canonical workspace/source bootstrap commands.
- `workspace.persistence.js` / `workspace.persistenceRecovery.js` — matching local delta merge + unmatched standalone local recoverability.

**Proof:** startup operation/transition tests, persistence tests, empty-stage product hierarchy guard.

**v366 closure:** explicit route membership remains authoritative; route compaction truthfully marks omitted material unavailable; cache hydration cannot downgrade richer route-carried material; route ownership requires a supported semantic route shape/version; and stale async startup ownership (including diagnostics) is invalidated by newer route/navigation owners.

### 2. Canonical workspace artifact identity

**PoC contract:** workspace Markdown is an artifact on the normal artifact/file spine; workspace-ness is a role/capability, not a second primary object.

**v366 owners:** new local/source/import paths create canonical records. Persisted legacy candidate-bearing state is normalized before normal runtime use. `workspace.runtimeCanonical.js` exposes the runtime invariant, and normal local/source ingress refuses a candidate-layer leak.

**Invariant:**

```text
normal site bootstrap/import/source/persistence migration
→ workspaceMergeCandidates.length === 0
```

Compatibility candidate descriptors may remain in legacy/export/tooling boundaries, but are not a second product-runtime authority.

### 3. Source-over-import canonical takeover

**PoC contract:** verified equivalent local material is redundant once source is canonical; divergent local material remains explicit. Closing source must not resurrect an exact dedupe.

**Owners:** material reconciliation/source-close lifecycle and source-over-import tests.

### 4. Storage authority split + visible failure

**PoC contract:** durable local work is distinct from disposable source/route cache, and persistence failure must not silently put local work at risk.

**Owners:**
- `tiinex.site.routeCache.v2` — metadata/source route shell cache.
- `tiinex.site.localDeltas.v1` — durable browser-local records/assets/workspace-local state.
- `tiinex.site.localRecoveryIndex.v1` — discoverability of durable local work after route/hash loss.
- `workspace.persistenceRecovery.js` — recovery and old-shape normalization.
- `tiinex:local-persistence-failure` — user-surfaceable failure event consumed by `TiinexApp`.

Source-backed Markdown is not durable local semantic authority. v366 additionally preserves the last-known-good local delta/recovery index when a newer durable write fails after disposable-cache pruning/retry, and surfaces that the newest changes were not persisted.

### 5. Import placement/conflict contract

**PoC contract:** same-path and trace-slot conflicts require an explicit choice: sibling, replace, cancel.

**Owner:** `workspace.importConflicts` + local material command/intake.

### 6. Workspace import classification

**PoC contract:** actual `.workspace.md` and legacy viewer/workspace entrypoint forms are recognized as workspace material at intake. Once materialized they receive explicit canonical workspace-artifact role/capability. Workspace-related schema/type information or schema-definition files do not gain Open/Merge capability merely from a schema id/name containing `workspace`.

**Owner:** archive/local workspace artifact detection.

### 7. Password archive + pasted trace intake

**PoC contract:** bounded stored-entry ZipCrypto password intake and pasted trace Markdown are available without inventing source provenance.

**Owners:** archive adapter + local material intake.

### 8. PoC-visible chrome during parity recovery

Current parity chrome is constrained to the approved PoC-visible hierarchy: Tiinex brand / Create / Share / Help. Multiverse and schema-building diagnostics remain deferred and are not allowed to leak into current product chrome.

## Qualification boundaries

Still not claimed by this checkpoint:
- Browser/Q PoC parity.
- M1 close/product PASS.
- Public Vite bundle/runtime PASS.
- Full removal of compatibility candidate code from export/tooling boundaries (M7/M9).
- M2 Workspace Spine.
