import { SurfaceImplementationStatus, SurfaceTruthBoundary, defineSurface, isSurfaceReady, isSurfaceScaffold } from './contracts.js';

const surfaces = [
  defineSurface({ id: 'feed', kind: 'card', label: 'Feed', purpose: 'Scan current artifact set', status: SurfaceImplementationStatus.partial, owner: 'workspace.discoveryView + workspace.discovery.views', boundary: [SurfaceTruthBoundary.projectionOnly, SurfaceTruthBoundary.noTruthMutation], notes: ['Uses normalized workspace material; not yet full legacy Feed parity.'] }),
  defineSurface({ id: 'tree', kind: 'tree', label: 'Tree', purpose: 'Navigate declared path and continuity structure', status: SurfaceImplementationStatus.partial, owner: 'workspace.discoveryView + workspace.pathTree', boundary: [SurfaceTruthBoundary.projectionOnly, SurfaceTruthBoundary.noTruthMutation], notes: ['Path-tree parity is partial; declared lineage graph parity remains separate.'] }),
  defineSurface({ id: 'lineage', kind: 'graph', label: 'Lineage', purpose: 'Trace loaded-only lineage edges', status: SurfaceImplementationStatus.partial, owner: 'workspace.lineageView', boundary: [SurfaceTruthBoundary.projectionOnly, SurfaceTruthBoundary.noTruthMutation], notes: ['Loaded-only traversal is implemented; no remote traversal.'] }),
  defineSurface({ id: 'audit', kind: 'audit-report', label: 'Audit', purpose: 'Display loaded-only audit and recoverability report', status: SurfaceImplementationStatus.partial, owner: 'workspace.auditView', boundary: [SurfaceTruthBoundary.projectionOnly, SurfaceTruthBoundary.noTruthMutation], notes: ['Loaded-only audit is implemented; full legacy traversal remains partial.'] }),
  defineSurface({ id: 'detail', kind: 'detail', label: 'Detail', purpose: 'Read one artifact deeply', status: SurfaceImplementationStatus.scaffold, owner: 'tiinex.root.v1.presenter', boundary: [SurfaceTruthBoundary.projectionOnly, SurfaceTruthBoundary.noTruthMutation] }),
  defineSurface({ id: 'preview', kind: 'detail', label: 'Preview', purpose: 'Preview material or assets', status: SurfaceImplementationStatus.scaffold, owner: 'tiinex.root.v1.presenter', boundary: [SurfaceTruthBoundary.projectionOnly, SurfaceTruthBoundary.noTruthMutation] }),
  defineSurface({ id: 'share', kind: 'card', label: 'Share', purpose: 'Summarize for session sharing/export', status: SurfaceImplementationStatus.scaffold, owner: 'tiinex.root.v1.presenter', boundary: [SurfaceTruthBoundary.projectionOnly, SurfaceTruthBoundary.commandRequired, SurfaceTruthBoundary.noTruthMutation] }),
  defineSurface({ id: 'create', kind: 'form', label: 'Create', purpose: 'Create artifacts through schema creation contracts', status: SurfaceImplementationStatus.scaffold, owner: 'schemas.creation.contracts', boundary: [SurfaceTruthBoundary.commandRequired, SurfaceTruthBoundary.noTruthMutation] }),
  defineSurface({ id: 'edit', kind: 'form', label: 'Edit', purpose: 'Edit draft artifacts', status: SurfaceImplementationStatus.scaffold, owner: 'future-draft-editor', boundary: [SurfaceTruthBoundary.commandRequired, SurfaceTruthBoundary.noTruthMutation] }),
  defineSurface({ id: 'display-options', kind: 'checklist', label: 'Display Options', purpose: 'Control filters and reader density', status: SurfaceImplementationStatus.scaffold, owner: 'workspace.displayOptions', boundary: [SurfaceTruthBoundary.projectionOnly, SurfaceTruthBoundary.noTruthMutation] }),
  defineSurface({ id: 'source-settings', kind: 'checklist', label: 'Source Settings', purpose: 'Control source mode and boundaries', status: SurfaceImplementationStatus.scaffold, owner: 'source-settings.model', boundary: [SurfaceTruthBoundary.commandRequired, SurfaceTruthBoundary.noTruthMutation] })
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
