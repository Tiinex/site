import path from 'node:path';
import { projectQualifiedHandoffEndpoints } from './handoffEndpointProjection.js';
import { projectQualifiedHandoffLeaves } from './handoffLeafProjection.js';
import { projectQualifiedWorkspacePackageSources } from './workspacePackageSources.js';

export const PORTABLE_OPERATOR_CONTEXT_SCHEMA_ID = 'tiinex.portable.operator-context.v1';

export function projectPortableOperatorContext(input = {}) {
  const files = Array.isArray(input.files) ? input.files : [];
  const repositories = normalizeRepositories(input.repositories || input.localRepositories || []);
  const roots = normalizeRoots(input.workspaceRoots || input.roots || [], repositories);
  const findings = [];
  const projectedRoots = [];
  const flattenedWorkspaces = [];
  const flattenedLeaves = [];
  const flattenedEndpoints = [];

  if (!roots.length) {
    findings.push(finding('error', 'portable.operator-context.roots.required', 'Operator context requires explicit Workspace roots; repository basenames or ambient process paths are not semantic Workspace identity.'));
  }

  for (const root of roots) {
    const rootFiles = files.filter((file) => fileBelongsToRoot(file, root.root));
    const rootRepositories = repositories.filter((repository) => samePath(repository.root, root.root));
    const sources = projectQualifiedWorkspacePackageSources({ files: rootFiles, repositories: rootRepositories.length ? rootRepositories : repositories });
    const workspaces = [];
    for (const candidate of sources.candidates || []) {
      const leaves = projectQualifiedHandoffLeaves({ files: rootFiles });
      const endpoints = projectQualifiedHandoffEndpoints({ files: rootFiles, workspaceId: candidate.workspaceId });
      const workspace = freeze({
        ...candidate,
        hostRootId: root.id,
        hostRoot: root.root,
        handoffLeaves: leaves.leaves || [],
        pointerless: leaves.pointerless,
        endpoints: endpoints.candidates || []
      });
      workspaces.push(workspace);
      flattenedWorkspaces.push(workspace);
      for (const leaf of workspace.handoffLeaves) flattenedLeaves.push(freeze({ ...leaf, workspaceId: candidate.workspaceId, hostRootId: root.id, hostRoot: root.root }));
      for (const endpoint of workspace.endpoints) flattenedEndpoints.push(freeze({ ...endpoint, hostRootId: root.id, hostRoot: root.root }));
    }
    findings.push(...(sources.findings || []).map((item) => finding(item.severity || 'warning', item.code || 'portable.operator-context.workspace-source', item.message || 'Workspace source projection finding.', { ...(item.context || {}), hostRootId: root.id, hostRoot: root.root })));
    projectedRoots.push(freeze({ id: root.id, root: root.root, repository: rootRepositories[0] || null, workspaces }));
  }

  const workspaceIds = new Map();
  for (const workspace of flattenedWorkspaces) workspaceIds.set(workspace.workspaceId, (workspaceIds.get(workspace.workspaceId) || 0) + 1);
  for (const [workspaceId, count] of workspaceIds.entries()) {
    if (count > 1) findings.push(finding('error', 'portable.operator-context.workspace-id.ambiguous', 'Multiple explicit roots projected the same package-local Workspace identity; the host must not collapse them by repository basename.', { workspaceId, count }));
  }

  const status = findings.some((item) => item.severity === 'error') ? 'blocked' : 'ready';
  const pointerless = freeze({
    selectionLabel: 'No Handoff pointer',
    packageRole: 'recipient-facing-workspace-carrier',
    semanticState: 'qualified-canonical-docs',
    manufactureState: status === 'ready' ? 'ready' : 'blocked',
    blockerCode: status === 'ready' ? '' : 'portable.operator-context.blocked',
    consequence: 'Workspace transport only — no Handoff semantics.'
  });
  return freeze({
    schema: PORTABLE_OPERATOR_CONTEXT_SCHEMA_ID,
    status,
    roots: projectedRoots,
    workspaces: flattenedWorkspaces.sort((a, b) => a.workspaceId.localeCompare(b.workspaceId) || a.workspaceTargetPath.localeCompare(b.workspaceTargetPath)),
    handoffLeaves: flattenedLeaves.sort((a, b) => a.workspaceId.localeCompare(b.workspaceId) || a.path.localeCompare(b.path)),
    endpoints: dedupeEndpoints(flattenedEndpoints),
    pointerless,
    findings,
    operationBoundary: { sourceMutation: false, remoteWrite: false, manufacture: false, identityInference: false },
    boundary: 'Projects one multi-root operator context from explicit host roots. Qualified Workspace artifact identity remains distinct from physical repository identity; Role/Party endpoints and Handoff leaves are shared-core projections, and No Handoff pointer remains explicit.'
  });
}

function normalizeRoots(value = [], repositories = []) {
  const supplied = Array.isArray(value) ? value : [];
  const list = supplied.length ? supplied : repositories.map((repository) => ({ id: repository.id || repository.root, root: repository.root }));
  const seen = new Set();
  const roots = [];
  for (const item of list) {
    const root = path.resolve(String(item?.root || item?.path || '')).replace(/\\/g, '/').replace(/\/$/, '');
    if (!root || seen.has(root)) continue;
    seen.add(root);
    roots.push(freeze({ id: String(item?.id || root), root }));
  }
  return roots;
}
function normalizeRepositories(value = []) {
  return (Array.isArray(value) ? value : []).map((item) => freeze({ ...item, id: String(item?.id || item?.root || ''), root: path.resolve(String(item?.root || item?.id || '')).replace(/\\/g, '/').replace(/\/$/, '') })).filter((item) => item.root);
}
function fileBelongsToRoot(file = {}, root = '') {
  const localPath = String(file?.locator?.localPath || '').replace(/\\/g, '/');
  if (!localPath || !root) return false;
  const base = String(root).replace(/\\/g, '/').replace(/\/$/, '');
  return localPath === base || localPath.startsWith(`${base}/`);
}
function samePath(a = '', b = '') { return String(a || '').replace(/\\/g, '/').replace(/\/$/, '') === String(b || '').replace(/\\/g, '/').replace(/\/$/, ''); }
function dedupeEndpoints(candidates = []) {
  const byTarget = new Map();
  for (const candidate of candidates) byTarget.set(candidate.target, candidate);
  return [...byTarget.values()].sort((a, b) => a.kind.localeCompare(b.kind) || a.label.localeCompare(b.label) || a.target.localeCompare(b.target));
}
function finding(severity, code, message, context = {}) { return freeze({ severity, code, message, context }); }
function freeze(value) { if (Array.isArray(value)) return Object.freeze(value.map(freeze)); if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value; return Object.freeze(Object.fromEntries(Object.entries(value).map(([key, item]) => [key, freeze(item)]))); }
