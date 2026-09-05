const MAX_WORKSPACES = 8;
const MAX_SOURCES = 8;

export function projectGroundingSourceEvidence({ records = [], contextAudit = null, continuation = null, sourceProfiles = [] } = {}) {
  const byPath = new Map((records || []).map((record) => [String(record.path || ''), record]));
  const profiles = profileIndex(sourceProfiles);
  const workspaces = (contextAudit?.workspaceMaterializations || []).slice(0, MAX_WORKSPACES).map((workspace) => {
    const workspaceId = String(workspace.workspaceId || '');
    const innerPath = normalizePath(workspace.sourceWorkspaceTargetInnerPath || '');
    const exactPath = workspaceId && innerPath ? `${workspaceId}/${innerPath}` : '';
    const record = exactPath ? byPath.get(exactPath) : null;
    const declared = record ? workspaceEntrypoints(record.markdown || '') : [];
    const explicitProfile = profiles.get(workspaceId) || [];
    const sources = declared.length ? declared : explicitProfile;
    const unique = sources.length === 1 ? sources[0] : null;
    const qualifiedArtifact = Boolean(
      String(workspace.qualification || '') === 'qualified'
      && innerPath
      && record
      && record.hasContinuityContext
      && record.hasIntegrity
    );
    if (!qualifiedArtifact && !explicitProfile.length) return Object.freeze({ workspace: workspaceId, state: 'unresolved' });
    return Object.freeze({
      workspace: workspaceId,
      state: qualifiedArtifact ? 'qualified' : 'explicit-profile',
      carrier: String(workspace.reason || 'qualified-workspace-snapshot'),
      sourceArtifactPath: exactPath,
      sourceArtifactSha256: String(workspace.sourceWorkspaceTargetSha256 || ''),
      repository: String(unique?.repository || ''),
      ref: String(unique?.ref || ''),
      rootPath: String(unique?.rootPath || ''),
      remoteState: String(unique?.remoteState || 'not-checked'),
      sources: Object.freeze(sources.slice(0, MAX_SOURCES))
    });
  });
  return Object.freeze({
    carrier: Object.freeze({
      state: String(contextAudit?.coverage?.state || contextAudit?.status || 'unresolved'),
      workspaceCount: Number(contextAudit?.workspaceMaterializations?.length || 0),
      packageSourcePath: String(continuation?.packageSourcePath || '')
    }),
    workspaces: Object.freeze(workspaces),
    boundary: 'Exact selected Workspace source artifact/profile only.'
  });
}

function workspaceEntrypoints(markdown = '') {
  const body = section(markdown, 'Workspace Entrypoints');
  if (!body) return [];
  const chunks = body.split(/(?=^###\s+)/m).map((item) => item.trim()).filter(Boolean);
  const out = [];
  for (const chunk of chunks) {
    const heading = chunk.match(/^###\s+(.+)$/m)?.[1]?.trim() || '';
    const sourceKind = field(chunk, 'Source Kind');
    const repository = field(chunk, 'Repository');
    const ref = field(chunk, 'Ref');
    const rootPath = field(chunk, 'Root Path');
    if (!heading && !sourceKind && !repository && !ref && !rootPath) continue;
    out.push(Object.freeze({
      label: heading,
      sourceKind,
      repository,
      ref,
      rootPath,
      remoteState: 'not-checked',
      basis: 'qualified-durable-workspace-entrypoint'
    }));
  }
  return out;
}

function profileIndex(value = []) {
  const map = new Map();
  if (!value) return map;
  if (!Array.isArray(value) && typeof value === 'object') {
    for (const [workspaceId, profile] of Object.entries(value)) map.set(String(workspaceId), Object.freeze(normalizeProfileList(profile)));
    return map;
  }
  for (const item of value || []) {
    const workspaceId = String(item?.workspaceId || item?.workspace || '');
    if (!workspaceId) continue;
    const list = map.get(workspaceId) || [];
    list.push(normalizeProfile(item));
    map.set(workspaceId, Object.freeze(list));
  }
  return map;
}
function normalizeProfileList(value) { return (Array.isArray(value) ? value : [value]).filter(Boolean).map(normalizeProfile); }
function normalizeProfile(value = {}) { return Object.freeze({ label: String(value.label || ''), sourceKind: String(value.sourceKind || value.kind || ''), repository: String(value.repository || ''), ref: String(value.ref || ''), rootPath: String(value.rootPath || ''), remoteState: String(value.remoteState || 'not-checked'), basis: 'explicit-source-profile' }); }
function section(markdown = '', heading = '') { const escaped = escape(heading); return String(markdown || '').match(new RegExp(`(?:^|\\n)##\\s+${escaped}\\s*\\r?\\n([\\s\\S]*?)(?=\\n##\\s+|\\n#\\s+Continuity Integrity|$)`, 'i'))?.[1]?.trim() || ''; }
function field(markdown = '', label = '') { const escaped = escape(label); return strip(String(markdown || '').match(new RegExp(`^\\s*-\\s+${escaped}:\\s*(.+)$`, 'mi'))?.[1] || ''); }
function normalizePath(value = '') { return String(value || '').replace(/\\/g, '/').replace(/^\/+/, ''); }
function strip(value = '') { return String(value || '').replace(/^\[([^\]]+)\]\([^)]+\)$/, '$1').replace(/[`*_]/g, '').trim(); }
function escape(value = '') { return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
