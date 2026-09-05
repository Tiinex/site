import { isWorkspaceRecord } from '../actions/record.actions.js';
import { transitionProductContextForWorkspace } from '../transitions/transition.productPresentation.browser.js';
import { buildWorkspaceAuditView } from './workspace.auditView.js';
import { buildDiscoveryMaterialIndex } from './workspace.discoveryView.js';

// Viewer-only memoization boundary. Material-derived indexes are expensive but
// immutable for one workspace/records identity. UI focus, hover, scroll and
// unrelated workspace view changes must not rebuild them.
const materialProjectionByWorkspace = new WeakMap();
const transitionContextByRecords = new WeakMap();

export function resolvedWorkspaceMaterialProjection(workspace = {}, recordsInput = null) {
  const records = Array.isArray(recordsInput) ? recordsInput : (Array.isArray(workspace?.records) ? workspace.records : []);
  if (!workspace || typeof workspace !== 'object') return buildProjection(workspace, records);
  const cached = materialProjectionByWorkspace.get(workspace);
  if (cached && cached.records === records) return cached.projection;
  const projection = buildProjection(workspace, records);
  materialProjectionByWorkspace.set(workspace, { records, projection });
  return projection;
}

export function resolvedWorkspaceTransitionContext(workspaceRecords = [], referenceRecords = []) {
  if (!Array.isArray(workspaceRecords) || !Array.isArray(referenceRecords)) {
    return transitionProductContextForWorkspace({ workspaceRecords, referenceRecords });
  }
  let byReference = transitionContextByRecords.get(workspaceRecords);
  if (!byReference) { byReference = new WeakMap(); transitionContextByRecords.set(workspaceRecords, byReference); }
  const cached = byReference.get(referenceRecords);
  if (cached) return cached;
  const context = transitionProductContextForWorkspace({ workspaceRecords, referenceRecords });
  byReference.set(referenceRecords, context);
  return context;
}

function buildProjection(workspace, records) {
  const materialIndex = buildDiscoveryMaterialIndex(records);
  const audit = buildWorkspaceAuditView(workspace || {}, { records, query: '' });
  const auditById = new Map((audit.items || []).map((item) => [item.id, item]));
  const workspaceArtifactCount = records.filter(isWorkspaceRecord).length;
  return Object.freeze({ records, materialIndex, auditById, workspaceArtifactCount });
}
