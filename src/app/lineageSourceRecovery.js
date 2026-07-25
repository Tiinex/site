import { materializeGithubSource } from '../adapters/github/github.adapter.js';
import { buildSourceTransportPolicy } from '../sources/transport.policy.js';
import { buildWorkspaceLineageView } from '../workspaces/workspace.lineageView.js';

const GITHUB_ADAPTER_ID = 'github';

export async function recoverMissingLineageParentsFromSource({ lifecycle, state, workspace, selectedRecordId, fetchImpl, workspaceConfig, maxPasses = 4 } = {}) {
  let sourceState = state;
  let activeWorkspace = workspace;
  let lineage = buildWorkspaceLineageView(activeWorkspace, { records: Array.isArray(activeWorkspace?.records) ? activeWorkspace.records : [], query: '', selectedRecordId });
  let recoveredParents = 0;
  for (let pass = 0; pass < maxPasses; pass += 1) {
    const recoveryPlan = buildLineageSourceRecoveryPlan(activeWorkspace, lineage);
    if (!recoveryPlan.length) break;
    let changed = false;
    for (const plan of recoveryPlan) {
      const out = await materializeGithubSource(plan.source, { fileRefs: plan.fileRefs, repoDiscovery: false, issueDiscovery: false, issueUrls: '' }, {
        fetchImpl,
        maxFiles: 32,
        transportPolicy: buildSourceTransportPolicy({ mode: 'cache-mirror-proxy-direct', maxRequestsPerOperation: 64, now: new Date().toISOString() }),
        workspaceConfig
      });
      if (out.okCount <= 0) continue;
      const inserted = lifecycle?.addWorkspaceSourceRecords?.(sourceState, activeWorkspace.id, plan.sourceId, out.records || [], { discoveryState: 'partial' });
      if (!inserted?.ok) continue;
      sourceState = inserted.state;
      activeWorkspace = lifecycle?.activeWorkspace?.(sourceState) || inserted.workspace || activeWorkspace;
      recoveredParents += Number(inserted.records?.length || 0);
      changed = true;
    }
    lineage = buildWorkspaceLineageView(activeWorkspace, { records: Array.isArray(activeWorkspace.records) ? activeWorkspace.records : [], query: '', selectedRecordId });
    if (!changed || !lineage.selectedTraversal?.hasMissing) break;
  }
  return { state: sourceState, workspace: activeWorkspace, lineage, recoveredParents };
}

export function buildLineageSourceRecoveryPlan(workspace = {}, lineageView = {}) {
  const records = Array.isArray(workspace.records) ? workspace.records : [];
  const byId = new Map(records.map((record) => [String(record.id || '').trim(), record]));
  const missingEdges = Array.isArray(lineageView?.selectedTraversal?.missingEdges) ? lineageView.selectedTraversal.missingEdges : [];
  const grouped = new Map();
  for (const edge of missingEdges) {
    const declaring = byId.get(String(edge.to || '').trim());
    const fileRef = lineageRecoveryFileRefForTarget(edge.target || '', declaring);
    const source = Object.assign({}, declaring?.source || {}, { ref: declaring?.source?.ref || declaring?.source?.config?.ref || '' });
    if (!fileRef || !isGithubSource(source)) continue;
    const sourceId = String(source.id || '').trim();
    if (!sourceId) continue;
    if (!grouped.has(sourceId)) grouped.set(sourceId, { sourceId, source, fileRefs: [], targets: [] });
    const entry = grouped.get(sourceId);
    if (!entry.fileRefs.some((item) => canonicalRepoPath(item) === canonicalRepoPath(fileRef))) {
      entry.fileRefs.push(fileRef);
      entry.targets.push({ fromRecordId: declaring?.id || '', target: edge.target || '', fileRef });
    }
  }
  return Array.from(grouped.values()).filter((entry) => entry.fileRefs.length);
}

export function lineageRecoveryFileRefForTarget(target = '', declaringRecord = {}) {
  const raw = String(target || '').trim();
  if (!raw || /^record:/i.test(raw)) return '';
  const urlPath = githubRepoRelativePathFromUrl(raw);
  if (urlPath) return urlPath;
  const cleanTarget = canonicalRepoPath(raw);
  if (!cleanTarget) return '';
  if (isDotRelative(raw) || isSimpleRelative(raw)) {
    const declaringPath = firstNonEmpty(declaringRecord?.path, declaringRecord?.sourcePath, declaringRecord?.sourceTarget?.sourceArtifactPath, declaringRecord?.snapshot?.sourceArtifactPath);
    const dir = dirname(githubRepoRelativePathFromUrl(declaringPath) || declaringPath);
    return canonicalRepoPath(dir ? `${dir}/${raw}` : cleanTarget);
  }
  return cleanTarget;
}

function isGithubSource(source = {}) {
  const adapter = String(source.adapterId || source.sourceKind || source.kind || '').toLowerCase();
  return adapter.includes(GITHUB_ADAPTER_ID) || Boolean(source.repo || source.repository || source.config?.repo);
}
function firstNonEmpty(...items) { return items.map((item) => String(item || '').trim()).find(Boolean) || ''; }
function githubRepoRelativePathFromUrl(value = '') {
  try {
    const url = new URL(String(value || '').trim());
    const parts = url.pathname.split('/').filter(Boolean);
    if (url.hostname === 'raw.githubusercontent.com' && parts.length >= 4) return canonicalRepoPath(parts.slice(3).join('/'));
    if (url.hostname === 'github.com' && parts.length >= 5 && parts[2] === 'blob') return canonicalRepoPath(parts.slice(4).join('/'));
  } catch (_) {}
  return '';
}
function isDotRelative(value = '') { return /^\.\.?(?:\/|$)/.test(String(value || '').replace(/\\/g, '/').trim()); }
function isSimpleRelative(value = '') {
  const raw = String(value || '').trim();
  return Boolean(raw && !raw.includes('/') && !/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(raw));
}
function dirname(path = '') {
  const parts = canonicalRepoPath(path).split('/').filter(Boolean);
  parts.pop();
  return parts.join('/');
}
function canonicalRepoPath(value = '') {
  const out = [];
  for (const part of String(value || '').replace(/^record:/i, '').replace(/\\/g, '/').split('/')) {
    const clean = part.trim();
    if (!clean || clean === '.') continue;
    if (clean === '..') out.pop();
    else out.push(clean);
  }
  return out.join('/');
}
