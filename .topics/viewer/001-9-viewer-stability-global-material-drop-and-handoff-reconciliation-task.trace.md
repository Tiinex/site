# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: tiinex.task.v1
  - Created At: 2026-09-02 21:39:00
  - Trace: [Playthings Organic World Live Tools And Schema Tech Tree Task](001-8-playthings-organic-world-live-tools-and-schema-tech-tree-task.trace.md)
  - Origin:
    - [relative](001-8-playthings-organic-world-live-tools-and-schema-tech-tree-task.trace.md)
- Current
  - Current Schema: tiinex.task.v1
  - Created At: 2026-09-03 00:18:00
  - Summary: Stabilize Viewer and Playthings interaction under multi-workspace material, align Handoff package intake with current Tooling recipient-v2 qualification, replace active-workspace drag/drop routing with explicit drop-scope semantics, and preserve Playthings observation continuity across global material reconciliation.

---

# Viewer stability, global material drop, and Handoff reconciliation

## Objective

Remove locally caused interaction stalls observed after loading Docs alongside Business and Site; make package and local-material intake follow explicit workspace/global scope instead of hidden active-workspace state; reuse current Tooling recipient-v2 Handoff topology for multi-workspace package reconciliation; keep large package material transient rather than repeatedly serializing it through Viewer persistence; and restore responsive Playthings camera/interaction behavior without turning TiinexApp, package intake, or persistence into a monolith.

## Done Criteria

- Normal Feed/Playthings UI interaction does not initiate GitHub material fetches merely because records are rendered, hovered, paused, or selected; source transport remains explicit.
- Deferred Viewer persistence does not repeatedly serialize complete imported record/asset snapshots, local recovery material, and session cache for view-only query/scroll/focus changes.
- Large multi-workspace batch record import clones workspace state once per batch rather than once per artifact.
- Playthings qualifies transition options lazily for the currently hovered living leaf rather than resolving transitions for the entire living population on every render.
- A recipient-facing v2 Handoff package is inspected through current Tooling topology qualification and projected as its qualified workspace set without relying on old export-envelope assumptions.
- Handoff package reconciliation is global regardless of drop target: matching open workspaces are updated/replaced, new package workspaces are added, open workspaces absent from the package remain open, and ambiguous identity is not guessed.
- Recipient-v2 Viewer projection decompresses only material needed by the Viewer artifact/workspace surface rather than loading arbitrary repository code/assets into UI state.
- Handoff package material is treated as a transient browser session projection and does not force large imported snapshots through durable local recovery/session-cache persistence merely because the package was dropped.
- Dropping an artifact or ordinary ZIP on a concrete Viewer workspace mutates only that exact workspace.
- Dropping an artifact or ordinary ZIP outside workspace surfaces creates a new workspace; no active-workspace fallback decides the recipient.
- Dropping any material on the Playthings surface is global. A Handoff package reconciles its contained workspaces; other material opens a new workspace behind the shared world rather than requiring exit from Playthings.
- Playthings remains mounted across workspace-state reconciliation so its observation baseline/camera can be preserved and newly observed suffix material can continue toward the new Now when compatible.
- Historical-prefix incompatibility remains a rebuild condition rather than being misrepresented as a pure delta.
- Follow Plaything samples the latest camera-follow state during an active requestAnimationFrame sequence instead of capturing a stale callback when Follow is toggled mid-event.
- Fit World and camera controls remain bounded to the current world/camera surface and their pointer events do not accidentally begin world drag.
- Existing Playthings semantic boundaries, one-earth projection, relative-time rules, canonical Create flow, local-only skill progression, and Tiinex transition authority remain unchanged.
- Viewer stability work is decomposed into lifecycle, persistence, package-recipient, local-intake, archive-filter, and Playthings interaction modules; no static monolith threshold is raised to accommodate new behavior.
- Focused lifecycle/import/persistence/DnD/Playthings cases plus TypeScript, browser-import, UI-shape, smoke, integration, and static-regression-aware validation remain qualified with no introduced static debt.

## Scope

- Tiinex/site Viewer and Playthings experiment integration only.
- Local workspace lifecycle/import and deferred persistence costs directly implicated by the observed multi-workspace lag.
- Recipient-v2 Handoff package browser intake and global workspace reconciliation.
- Explicit global-vs-workspace drag/drop routing.
- Playthings transition-resolution and Follow-camera interaction costs.
- Validation and a manual-test Handoff package.

## Dependencies

- Parent Task: [Playthings Organic World Live Tools And Schema Tech Tree Task](001-8-playthings-organic-world-live-tools-and-schema-tech-tree-task.trace.md).
- Current portable Tooling recipient-v2 topology inspection and qualified Workspace representation carried in the local Site workspace.
- Existing Viewer workspace lifecycle, persistence scheduler, local material intake, canonical source registration, and Playthings observation/timeline model.
- Human observation that Docs is the practical tipping point for Viewer lag, Playthings playback remains comparatively smooth until interaction, Fit/Follow appear unresponsive under the stalled UI, and active-workspace drag/drop is undesirable.
- Human direction to continue the already-known local Playthings line without a fresh site/refactor discovery for this experiment checkpoint.

## Exclusions

- GitHub/source-adapter optimization or changing remote materialization semantics without evidence of remote fetch spam.
- Business or Docs source mutation.
- qualifications or durable Playthings profile semantics.
- redesigning Playthings world grammar/organic placement during this stability pass.
- release qualification or production performance guarantees.
- raising static-size limits or merging recipient-v2 logic into a monolithic command/controller.

# Continuity Integrity

- sha256-base64url-c14n-v2
  - Towards: [Playthings Organic World Live Tools And Schema Tech Tree Task](001-8-playthings-organic-world-live-tools-and-schema-tech-tree-task.trace.md)
  - Value: ozIn7CxLitfPmiHlVvBE-M1p3l7TRDGayMTCRAjv65k

- sha256-base64url-c14n-v2
  - Towards: self
  - Value:iEyg-MExkP8j2kKYc-zpqHlKaoVpoBZw16hclm2Mc0w
