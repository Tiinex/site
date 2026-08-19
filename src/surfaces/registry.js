import { SurfaceImplementationStatus, SurfaceTruthBoundary, defineSurface, isSurfaceReady, isSurfaceScaffold } from './contracts.js';

const surfaces = [
  defineSurface({ id: 'feed', kind: 'card', label: 'Feed', purpose: 'Scan current artifact set', status: SurfaceImplementationStatus.partial, owner: 'workspace.discoveryView + workspace.discovery.views', boundary: [SurfaceTruthBoundary.projectionOnly, SurfaceTruthBoundary.noTruthMutation], notes: ['Uses normalized workspace material; not yet full legacy Feed parity.'] }),
  defineSurface({ id: 'tree', kind: 'tree', label: 'Tree', purpose: 'Navigate declared path and continuity structure', status: SurfaceImplementationStatus.partial, owner: 'workspace.discoveryView + workspace.pathTree', boundary: [SurfaceTruthBoundary.projectionOnly, SurfaceTruthBoundary.noTruthMutation], notes: ['Path-tree parity is partial; declared lineage graph parity remains separate.'] }),
  defineSurface({ id: 'lineage', kind: 'graph', label: 'Lineage', purpose: 'Trace loaded-only lineage edges', status: SurfaceImplementationStatus.partial, owner: 'workspace.lineageView', boundary: [SurfaceTruthBoundary.projectionOnly, SurfaceTruthBoundary.noTruthMutation], notes: ['Loaded-only traversal is implemented; no remote traversal.'] }),
  defineSurface({ id: 'audit', kind: 'audit-report', label: 'Audit', purpose: 'Display loaded-only audit and recoverability report', status: SurfaceImplementationStatus.partial, owner: 'workspace.auditView', boundary: [SurfaceTruthBoundary.projectionOnly, SurfaceTruthBoundary.noTruthMutation], notes: ['Loaded-only audit is implemented; full legacy traversal remains partial.'] }),
  defineSurface({ id: 'detail', kind: 'detail', label: 'Detail', purpose: 'Read one artifact deeply', status: SurfaceImplementationStatus.partial, owner: 'workspace.recordDialogs.views + workspace.read.views', boundary: [SurfaceTruthBoundary.projectionOnly, SurfaceTruthBoundary.noTruthMutation], notes: ['Record detail/read sheet is implemented; final PoC/mobile readability remains a Q product gate.'] }),
  defineSurface({ id: 'preview', kind: 'detail', label: 'Preview', purpose: 'Preview material or assets', status: SurfaceImplementationStatus.partial, owner: 'workspace.cards.views + storage.policy + source.assetReferences', boundary: [SurfaceTruthBoundary.projectionOnly, SurfaceTruthBoundary.noTruthMutation], notes: ['Local text/image asset preview is implemented; source-backed references preserve availability/source truth without inventing remote preview fetches.'] }),
  defineSurface({ id: 'share', kind: 'card', label: 'Share', purpose: 'Project reconstructive share targets without mutating source material', status: SurfaceImplementationStatus.partial, owner: 'm3 share projection + TiinexApp share actions', boundary: [SurfaceTruthBoundary.projectionOnly, SurfaceTruthBoundary.commandRequired, SurfaceTruthBoundary.noTruthMutation], notes: ['Record/workspace share actions are implemented; final receiver/browser parity remains deferred.'] }),
  defineSurface({ id: 'create', kind: 'form', label: 'Create', purpose: 'Create artifacts through qualified canonical Transition/schema authoring authority', status: SurfaceImplementationStatus.partial, owner: 'transition product preparation + workspace.canonicalTaskDialog.views', boundary: [SurfaceTruthBoundary.commandRequired, SurfaceTruthBoundary.noTruthMutation], notes: ['Contextual and bounded standalone canonical Create paths are implemented; broad PoC creation breadth is not a parity claim.'] }),
  defineSurface({ id: 'edit', kind: 'form', label: 'Edit', purpose: 'Edit qualified browser-local draft artifacts', status: SurfaceImplementationStatus.partial, owner: 'localDraftMutationCommand + canonical Task authoring projection', boundary: [SurfaceTruthBoundary.commandRequired, SurfaceTruthBoundary.noTruthMutation], notes: ['Canonical local Task Edit is implemented through the existing lossless mutation owner; source-backed artifacts remain read-only.'] }),
  defineSurface({ id: 'display-options', kind: 'checklist', label: 'Display Options', purpose: 'Control filters and reader density', status: SurfaceImplementationStatus.partial, owner: 'workspace.displayOptions + workspace.displayOptions.views', boundary: [SurfaceTruthBoundary.projectionOnly, SurfaceTruthBoundary.noTruthMutation], notes: ['Current loaded-workspace display/filter controls are implemented; bounded Time Portal preserves explicit temporal intent, exact GitHub snapshot identity, and read-only historical review without replacing live source truth.'] }),
  defineSurface({ id: 'source-settings', kind: 'checklist', label: 'Source Settings', purpose: 'Plan, continue, and materialize bounded source configuration', status: SurfaceImplementationStatus.partial, owner: 'workspace.add.views + github source operation/materialization commands', boundary: [SurfaceTruthBoundary.commandRequired, SurfaceTruthBoundary.noTruthMutation], notes: ['GitHub source planning/continuation and boundary controls are implemented; broader PoC source-management parity remains deferred.'] })
];

export const surfaceRegistry = Object.freeze({
  schema: 'tiinex.surface.registry.v1',
  surfaces: Object.freeze(surfaces),
  counts: Object.freeze({
    total: surfaces.length,
    parity: surfaces.filter((surface) => surface.status === SurfaceImplementationStatus.parity).length,
    partial: surfaces.filter((surface) => surface.status === SurfaceImplementationStatus.partial).length,
    scaffold: surfaces.filter((surface) => surface.status === SurfaceImplementationStatus.scaffold).length,
    unavailable: surfaces.filter((surface) => surface.status === SurfaceImplementationStatus.unavailable).length,
    ready: surfaces.filter(isSurfaceReady).length,
    notReady: surfaces.filter(isSurfaceScaffold).length
  })
});

export function surfaceLabels(options = {}) {
  const includeScaffold = options.includeScaffold !== false;
  return includeScaffold ? surfaceRegistry.surfaces : surfaceRegistry.surfaces.filter(isSurfaceReady);
}

export function resolveSurfaceDescriptor(surfaceId) {
  const id = String(surfaceId || '').trim();
  return surfaceRegistry.surfaces.find((surface) => surface.id === id) || null;
}

export function listSurfaceFindings() {
  const findings = [];
  for (const surface of surfaceRegistry.surfaces) {
    if (isSurfaceScaffold(surface)) {
      findings.push({
        severity: 'info',
        code: 'surface.status.scaffold',
        surfaceId: surface.id,
        message: `${surface.label} is registered as ${surface.status}; do not treat it as parity-ready.`,
        source: 'tiinex.surface.registry.v1'
      });
    }
    if (!surface.boundary.includes(SurfaceTruthBoundary.noTruthMutation)) {
      findings.push({ severity: 'error', code: 'surface.boundary.truthMutation.missing', surfaceId: surface.id, message: `${surface.label} must declare no-truth-mutation unless backed by an explicit command.`, source: 'tiinex.surface.registry.v1' });
    }
  }
  return findings;
}
