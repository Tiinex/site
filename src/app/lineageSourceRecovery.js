import { materializeGithubSource } from '../adapters/github/github.adapter.js';
import { buildSourceTransportPolicy } from '../sources/transport.policy.js';
import { githubTransportOrderFromTier } from '../sources/github/github.transport.js';
import { buildWorkspaceLineageView } from '../workspaces/workspace.lineageView.js';
import { lineageBasePathForRecord } from '../lineage/lineage.pathBasis.js';

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
      const out = await materializeLineageRecoveryPlan(plan, { fetchImpl, workspaceConfig });
      if (out.okCount <= 0) continue;
      const inserted = lifecycle?.addWorkspaceSourceRecords?.(sourceState, activeWorkspace.id, plan.sourceId, out.records || [], { discoveryState: 'partial', preserveView: true });
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

async function materializeLineageRecoveryPlan(plan = {}, { fetchImpl, workspaceConfig } = {}) {
  const fileRefs = Array.isArray(plan.fileRefs) ? plan.fileRefs : [];
  const issueUrls = Array.isArray(plan.issueUrls) ? plan.issueUrls : [];
  if (issueUrls.length) {
    const requestedTier = plan.source?.transportRefreshTier || plan.source?.preferredTransportTier || '';
    const transportOrder = requestedTier ? githubTransportOrderFromTier(requestedTier) : undefined;
    return await materializeGithubSource(plan.source, { fileRefs: [], repoDiscovery: false, issueDiscovery: false, issueUrls: issueUrls.join('\n') }, {
      fetchImpl,
      maxFiles: 0,
      allowCache: true, allowMirror: true, allowProxy: true, allowDirect: true,
      transportOrder, transportOrderExact: Boolean(requestedTier),
      transportRefreshTier: requestedTier,
      transportPolicy: buildSourceTransportPolicy({ mode: 'targeted-parent-issue-recovery', maxRequestsPerOperation: 64, requestedTier, now: new Date().toISOString() }),
      workspaceConfig
    });
  }
  return await materializeGithubSource(plan.source, { fileRefs, repoDiscovery: false, issueDiscovery: false, issueUrls: '' }, {
    fetchImpl,
    maxFiles: 32,
    allowCache: false, allowMirror: false, allowProxy: false, allowDirect: true,
    transportOrder: ['direct'], transportOrderExact: true,
    transportPolicy: buildSourceTransportPolicy({ mode: 'targeted-parent-file-recovery', maxRequestsPerOperation: 64, now: new Date().toISOString() }),
    workspaceConfig
  });
}

export function buildLineageSourceRecoveryPlan(workspace = {}, lineageView = {}) {
  const records = Array.isArray(workspace.records) ? workspace.records : [];
  const byId = new Map(records.map((record) => [String(record.id || '').trim(), record]));
  const missingEdges = Array.isArray(lineageView?.selectedTraversal?.missingEdges) ? lineageView.selectedTraversal.missingEdges : [];
  const grouped = new Map();
  for (const edge of missingEdges) {
    const declaring = byId.get(String(edge.to || '').trim());
    const source = Object.assign({}, declaring?.source || {}, { ref: declaring?.source?.ref || declaring?.source?.config?.ref || '' });
    if (!isGithubSource(source)) continue;
    const sourceId = String(source.id || '').trim();
    if (!sourceId) continue;
    if (!grouped.has(sourceId)) grouped.set(sourceId, { sourceId, source, fileRefs: [], issueUrls: [], targets: [] });
    const entry = grouped.get(sourceId);
    const issueUrl = lineageRecoveryIssueUrlForTarget(edge.target || '', declaring);
    if (issueUrl && !entry.issueUrls.some((item) => canonicalGithubIssueUrl(item) === canonicalGithubIssueUrl(issueUrl))) {
      entry.issueUrls.push(issueUrl);
      entry.targets.push({ fromRecordId: declaring?.id || '', target: edge.target || '', issueUrl });
      continue;
    }
    const fileRef = lineageRecoveryFileRefForTarget(edge.target || '', declaring);
    if (!fileRef) continue;
    if (!entry.fileRefs.some((item) => canonicalRepoPath(item.ref || item) === canonicalRepoPath(fileRef))) {
      entry.fileRefs.push({ ref: fileRef, surface: 'lineageRecovery', targetKind: 'lineage-parent', inputTarget: edge.target || '', targetIndex: entry.fileRefs.length });
      entry.targets.push({ fromRecordId: declaring?.id || '', target: edge.target || '', fileRef });
    }
  }
  return Array.from(grouped.values()).filter((entry) => entry.fileRefs.length || entry.issueUrls.length);
}

export function lineageRecoveryIssueUrlForTarget(target = '', declaringRecord = {}) {
  const raw = String(target || '').trim();
  const explicitParent = firstNonEmpty(
    declaringRecord?.sourceTarget?.parentRawUrl,
    declaringRecord?.sourceTarget?.parentSourceUrl,
    declaringRecord?.snapshot?.parentRawUrl,
    declaringRecord?.snapshot?.parentSourceUrl
  );
  if (isGitHubSocialTarget(explicitParent) && parentSocialTargetMatchesTrace(explicitParent, raw)) return explicitParent;
  if (isGitHubSocialTarget(raw)) return raw;
  const origin = firstNonEmpty(declaringRecord?.origin || '', declaringRecord?.parentOrigin || '');
  if (isGitHubSocialTarget(origin) && parentSocialTargetMatchesTrace(origin, raw)) return origin;
  return '';
}

export function lineageRecoveryFileRefForTarget(target = '', declaringRecord = {}) {
  const raw = String(target || '').trim();
  if (!raw || /^record:/i.test(raw)) return '';
  if (isGitHubSocialTarget(raw)) return '';
  const declaredParent = declaredParentFileRef(declaringRecord, raw);
  if (declaredParent) return declaredParent;
  const urlPath = githubRepoRelativePathFromUrl(raw);
  if (urlPath) return urlPath;
  if (isUrlLike(raw)) return '';
  const cleanTarget = canonicalRepoPath(raw);
  if (!cleanTarget) return '';
  if (isDotRelative(raw) || isSimpleRelative(raw)) {
    const declaringPath = lineageBasePathForRecord(declaringRecord);
    const dir = dirname(githubRepoRelativePathFromUrl(declaringPath) || declaringPath);
    return canonicalRepoPath(dir ? `${dir}/${raw}` : cleanTarget);
  }
  return cleanTarget;
}



function declaredParentFileRef(record = {}, target = '') {
  const explicitParent = firstNonEmpty(record?.sourceTarget?.parentRawUrl, record?.sourceTarget?.parentSourceUrl, record?.snapshot?.parentRawUrl, record?.snapshot?.parentSourceUrl, record?.sourceTarget?.parentArtifactPath, record?.snapshot?.parentArtifactPath);
  const explicit = recoverableParentFileRef(explicitParent, target, { allowRelative: isSyntheticPublicationRecord(record) });
  if (explicit) return explicit;
  const origin = recoverableParentFileRef(record?.origin || record?.parentOrigin || '', target, { allowRelative: false });
  if (origin) return origin;
  return '';
}
function recoverableParentFileRef(parent = '', target = '', options = {}) {
  if (!parent || isGitHubSocialTarget(parent)) return '';
  const fromUrl = githubRepoRelativePathFromUrl(parent);
  if (fromUrl && originMatchesTarget(fromUrl, target)) return fromUrl;
  if (isUrlLike(parent)) return '';
  const clean = canonicalRepoPath(parent);
  if (!clean || !isRecoverableRepoPathCandidate(parent, clean, options) || !originMatchesTarget(clean, target)) return '';
  return clean;
}
function originMatchesTarget(originPath = '', target = '') {
  const origin = canonicalRepoPath(originPath);
  const cleanTarget = canonicalRepoPath(target);
  if (!origin) return false;
  if (!cleanTarget) return true;
  if (origin === cleanTarget || origin.endsWith('/' + cleanTarget)) return true;
  const originBase = basename(origin);
  const targetBase = basename(cleanTarget);
  return Boolean(originBase && targetBase && originBase === targetBase);
}
function parentSocialTargetMatchesTrace(parentUrl = '', target = '') {
  if (!parentUrl) return false;
  const parentComment = githubIssueCommentIdFromValue(parentUrl);
  const targetComment = githubIssueCommentIdFromValue(target);
  if (parentComment && targetComment) return parentComment === targetComment;
  if (isGitHubSocialTarget(target)) return canonicalGithubIssueUrl(parentUrl) === canonicalGithubIssueUrl(target);
  return true;
}
function githubIssueCommentIdFromValue(value = '') {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const direct = raw.match(/(?:issuecomment-|issues\/comments\/|comment-(?:\d+-)?)(\d{4,})/i)?.[1] || '';
  if (direct) return direct;
  try { const url = new URL(raw); return url.hash.match(/issuecomment-(\d+)/i)?.[1] || ''; } catch (_) {}
  return '';
}
function canonicalGithubIssueUrl(value = '') {
  try {
    const url = new URL(String(value || '').trim());
    const parts = url.pathname.split('/').filter(Boolean);
    if ((url.hostname === 'github.com' || url.hostname.endsWith('.github.com')) && parts.length >= 4 && parts[2] === 'issues') {
      const hash = url.hash.match(/issuecomment-(\d+)/i)?.[1] || '';
      return `https://github.com/${parts[0].toLowerCase()}/${parts[1].toLowerCase()}/issues/${parts[3]}${hash ? `#issuecomment-${hash}` : ''}`;
    }
  } catch (_) {}
  return String(value || '').trim().toLowerCase();
}

function isRecoverableRepoPathCandidate(raw = '', clean = '', options = {}) {
  const text = String(raw || '').trim().replace(/\\/g, '/');
  if (/^\.topics(?:\/|$)/.test(clean)) return true;
  if (options.allowRelative && /^\.\.?\//.test(text)) return true;
  if (options.allowRelative && clean.includes('/')) return true;
  return false;
}
function isSyntheticPublicationRecord(record = {}) {
  const mode = String(record.sourceMode || record.recoveryKind || '').toLowerCase();
  const targetKind = String(record.sourceTarget?.targetKind || record.snapshot?.sourceKind || '').toLowerCase();
  const path = canonicalRepoPath(record.path || '');
  return Boolean(
    mode.includes('github-issue') ||
    mode.includes('github-comment') ||
    targetKind.includes('github-issue') ||
    targetKind.includes('github-comment') ||
    path.includes('/.issues/') ||
    path.includes('/.github/.issues/')
  );
}
function isGithubSource(source = {}) {
  const adapter = String(source.adapterId || source.sourceKind || source.kind || '').toLowerCase();
  return adapter.includes(GITHUB_ADAPTER_ID) || Boolean(source.repo || source.repository || source.config?.repo);
}
function firstNonEmpty(...items) { return items.map((item) => String(item || '').trim()).find(Boolean) || ''; }
function isUrlLike(value = '') { return /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(String(value || '').trim()); }
function isGitHubSocialTarget(value = '') {
  try {
    const url = new URL(String(value || '').trim());
    const parts = url.pathname.split('/').filter(Boolean);
    return (url.hostname === 'github.com' || url.hostname.endsWith('.github.com')) && parts.length >= 4 && parts[2] === 'issues';
  } catch (_) { return false; }
}
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
