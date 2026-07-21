export const SurfaceImplementationStatus = Object.freeze({
  parity: 'parity',
  partial: 'partial',
  scaffold: 'scaffold',
  unavailable: 'unavailable'
});

export const SurfaceTruthBoundary = Object.freeze({
  projectionOnly: 'projection-only',
  noTruthMutation: 'no-truth-mutation',
  commandRequired: 'command-required'
});

export function defineSurface(surface = {}) {
  const id = String(surface.id || '').trim();
  if (!id) throw new Error('surface.id.required');
  return Object.freeze({
    id,
    kind: String(surface.kind || 'surface'),
    label: String(surface.label || id),
    purpose: String(surface.purpose || ''),
    status: normalizeSurfaceStatus(surface.status),
    boundary: normalizeBoundary(surface.boundary),
    owner: String(surface.owner || 'surface-registry'),
    notes: Array.isArray(surface.notes) ? surface.notes.map((note) => String(note || '').trim()).filter(Boolean) : []
  });
}

export function isSurfaceReady(surface = {}) {
  return surface.status === SurfaceImplementationStatus.parity || surface.status === SurfaceImplementationStatus.partial;
}

export function isSurfaceScaffold(surface = {}) {
  return surface.status === SurfaceImplementationStatus.scaffold || surface.status === SurfaceImplementationStatus.unavailable;
}

function normalizeSurfaceStatus(status) {
  const value = String(status || SurfaceImplementationStatus.scaffold).trim();
  return Object.values(SurfaceImplementationStatus).includes(value) ? value : SurfaceImplementationStatus.scaffold;
}

function normalizeBoundary(boundary) {
  const values = Array.isArray(boundary) ? boundary : [boundary || SurfaceTruthBoundary.projectionOnly, SurfaceTruthBoundary.noTruthMutation];
  return Object.freeze(values.map((item) => String(item || '').trim()).filter(Boolean));
}
