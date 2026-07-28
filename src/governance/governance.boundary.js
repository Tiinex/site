export const GOVERNANCE_BOUNDARY_SCHEMA_ID = 'tiinex.governance.boundary.v1';
export const GOVERNANCE_SUMMARY_SCHEMA_ID = 'tiinex.governance.summary.v1';

export const GOVERNANCE_POLICY_NAMES = Object.freeze([
  'LINEAGE_LICENSE.md',
  'LINEAGE_LICENSE',
  'LINEAGE_POLICY.md',
  'LINEAGE_POLICY',
  'LICENSE.md',
  'LICENSE',
  'POLICY.md',
  'POLICY'
]);

export const GOVERNANCE_NOTICE_NAMES = Object.freeze(['NOTICE', 'NOTICE.md']);

const POLICY_NAME_RANK = Object.freeze(new Map(GOVERNANCE_POLICY_NAMES.map((name, index) => [name.toLowerCase(), index])));
const NOTICE_NAME_RANK = Object.freeze(new Map(GOVERNANCE_NOTICE_NAMES.map((name, index) => [name.toLowerCase(), index])));

export function isLineageGovernancePath(path = '') {
  const root = governanceRootPath(path);
  return /^LINEAGE_(LICENSE|POLICY)(\.md)?$/i.test(root);
}

export function isGovernancePolicyPath(path = '') {
  const root = governanceRootPath(path);
  return POLICY_NAME_RANK.has(root.toLowerCase());
}

export function isGovernanceNoticePath(path = '') {
  const root = governanceRootPath(path);
  return NOTICE_NAME_RANK.has(root.toLowerCase());
}

export function governanceRootPath(path = '') {
  const clean = sourceArtifactPath(path).replace(/^\/+/, '').replace(/\\/g, '/').replace(/\/+/g, '/');
  if (!clean || clean.includes('/')) return '';
  return clean;
}

export function governanceBoundaryFromRootFiles(source = {}, files = [], input = {}) {
  const normalizedFiles = normalizeGovernanceFiles(files);
  const policy = firstRankedFile(normalizedFiles.filter((file) => file.type === 'policy'), POLICY_NAME_RANK);
  const notice = firstRankedFile(normalizedFiles.filter((file) => file.type === 'notice'), NOTICE_NAME_RANK);
  return buildGovernanceBoundary(source, { policy, notice, rootChecked: input.rootChecked === true, discoveredFrom: input.discoveredFrom || '' });
}

export function buildGovernanceBoundaryForSource(source = {}, input = {}) {
  const entries = [];
  for (const record of input.records || []) entries.push(governanceFileFromMaterial(record));
  for (const asset of input.assets || []) entries.push(governanceFileFromMaterial(asset));
  return governanceBoundaryFromRootFiles(source, entries.filter(Boolean), { rootChecked: input.rootChecked === true, discoveredFrom: input.discoveredFrom || 'loaded-source-material' });
}

export function buildWorkspaceGovernanceSummary(workspace = {}, input = {}) {
  const records = Array.isArray(input.records) ? input.records : (Array.isArray(workspace.records) ? workspace.records : []);
  const assets = Array.isArray(input.assets) ? input.assets : (Array.isArray(workspace.assets) ? workspace.assets : []);
  const sources = Array.isArray(workspace.sources) ? workspace.sources : [];
  const sourceBoundaries = sources
    .filter((source) => isSourceBacked(source))
    .map((source) => source.governanceBoundary?.schema === GOVERNANCE_BOUNDARY_SCHEMA_ID
      ? source.governanceBoundary
      : buildGovernanceBoundaryForSource(source, { records: records.filter((record) => String(record?.source?.id || '') === String(source.id || '')), assets: assets.filter((asset) => String(asset?.source?.id || '') === String(source.id || '')) }))
    .filter(Boolean);
  const counts = {
    sources: sourceBoundaries.length,
    found: sourceBoundaries.filter((item) => item.status === 'found').length,
    originFallback: sourceBoundaries.filter((item) => item.status === 'origin-fallback').length,
    missing: sourceBoundaries.filter((item) => item.status === 'missing').length,
    unknown: sourceBoundaries.filter((item) => item.status === 'unknown').length,
    local: sourceBoundaries.filter((item) => item.status === 'local').length,
    notices: sourceBoundaries.filter((item) => item.notice?.status === 'found').length
  };
  const status = counts.missing ? 'degraded' : (counts.unknown ? 'unknown' : (counts.found || counts.originFallback || counts.notices ? 'ready' : 'local'));
  return deepFreeze({
    schema: GOVERNANCE_SUMMARY_SCHEMA_ID,
    status,
    boundary: 'Governance summary carries source/root policy, license, and notice context. It is advisory metadata for transitions/export and does not mutate source material.',
    counts: Object.freeze(counts),
    sources: Object.freeze(sourceBoundaries)
  });
}

export function governanceFindingForBoundary(boundary = {}, input = {}) {
  if (!boundary || boundary.schema !== GOVERNANCE_BOUNDARY_SCHEMA_ID) return null;
  const repo = boundary.scope?.repo || input.repo || '';
  if (boundary.status === 'missing') return finding('warning', 'governance.boundary.missing', `No lineage policy/license file was found at the origin root for ${repo || 'this source'}.`, { repo, status: boundary.status });
  if (boundary.status === 'unknown') return finding('info', 'governance.boundary.unknown', `Governance boundary for ${repo || 'this source'} was not checked in this bounded materialization.`, { repo, status: boundary.status });
  if (boundary.status === 'found' || boundary.status === 'origin-fallback') return finding('info', 'governance.boundary.detected', `${boundary.policy?.kind || 'Governance file'} applies to source-backed material from ${repo || 'this source'}.`, { repo, status: boundary.status, kind: boundary.policy?.kind || '' });
  return null;
}

function buildGovernanceBoundary(source = {}, input = {}) {
  const repo = normalizeRepo(source.repo || source.repository || source.config?.repo || '');
  const ref = String(source.ref || source.config?.ref || '').trim();
  const policy = input.policy || null;
  const noticeFile = input.notice || null;
  if (!repo) {
    return deepFreeze({
      schema: GOVERNANCE_BOUNDARY_SCHEMA_ID,
      status: 'local',
      scope: Object.freeze({ kind: 'local', repo: '', ref: '', root: '' }),
      policy: null,
      notice: Object.freeze({ status: 'local', kind: '', path: '', url: '', note: 'Local/browser material has no remote origin governance lookup.' }),
      rootChecked: false,
      boundary: 'Local/browser workspace material does not inherit GitHub repository governance by inference.'
    });
  }
  const status = policy ? (isLineageGovernancePath(policy.path || policy.kind) ? 'found' : 'origin-fallback') : (input.rootChecked ? 'missing' : 'unknown');
  return deepFreeze({
    schema: GOVERNANCE_BOUNDARY_SCHEMA_ID,
    status,
    scope: Object.freeze({ kind: 'github-repo-root', repo, ref, root: '/' }),
    policy: policy ? Object.freeze({ kind: policy.kind || governanceRootPath(policy.path), path: policy.path || policy.kind || '', url: policy.url || repoRawUrl(repo, ref, policy.path || policy.kind || ''), contentAvailable: Boolean(policy.text || policy.content || policy.body) }) : null,
    notice: noticeFile ? Object.freeze({ status: 'found', kind: noticeFile.kind || governanceRootPath(noticeFile.path), path: noticeFile.path || noticeFile.kind || '', url: noticeFile.url || repoRawUrl(repo, ref, noticeFile.path || noticeFile.kind || ''), contentAvailable: Boolean(noticeFile.text || noticeFile.content || noticeFile.body), note: 'NOTICE found at source root.' }) : Object.freeze({ status: input.rootChecked ? 'missing' : 'unknown', kind: '', path: '', url: '', note: input.rootChecked ? 'No NOTICE file found at source root.' : 'Root NOTICE was not checked in this bounded materialization.' }),
    rootChecked: input.rootChecked === true,
    discoveredFrom: input.discoveredFrom || '',
    candidates: Object.freeze({ policy: GOVERNANCE_POLICY_NAMES.slice(), notice: GOVERNANCE_NOTICE_NAMES.slice() }),
    note: status === 'missing'
      ? `No lineage policy/license found at ${repo}@${ref || 'unresolved'} root. Checked known root names only.`
      : status === 'unknown'
        ? `Governance root files for ${repo}@${ref || 'unresolved'} were not checked by this bounded materialization.`
        : `${policy?.kind || governanceRootPath(policy?.path || '')} applies to source-backed material from ${repo}@${ref || 'unresolved'}.`,
    boundary: 'Governance boundary follows explicit source origin root files only. README/validation notes are not treated as license/policy fallback.'
  });
}

function normalizeGovernanceFiles(files = []) {
  return (files || []).map((file) => {
    const path = governanceRootPath(file?.path || file?.kind || file?.name || '');
    if (!path) return null;
    const lower = path.toLowerCase();
    const kind = POLICY_NAME_RANK.has(lower) ? 'policy' : NOTICE_NAME_RANK.has(lower) ? 'notice' : '';
    if (!kind) return null;
    return Object.assign({}, file, { path, kind: file.kind || path, governanceKind: kind });
  }).filter(Boolean).map((file) => Object.assign({}, file, { kind: file.path, type: file.governanceKind }));
}

function firstRankedFile(files = [], rankMap = new Map()) {
  return files.slice().sort((a, b) => (rankMap.get(String(a.path || a.kind || '').toLowerCase()) ?? 999) - (rankMap.get(String(b.path || b.kind || '').toLowerCase()) ?? 999))[0] || null;
}

function governanceFileFromMaterial(item = {}) {
  const path = governanceRootPath(item?.sourceTarget?.sourceArtifactPath || item?.path || item?.name || '');
  if (!path) return null;
  if (!isGovernancePolicyPath(path) && !isGovernanceNoticePath(path)) return null;
  return {
    path,
    kind: path,
    url: item?.sourceTarget?.rawUrl || item?.source?.url || '',
    text: item?.markdown || item?.content || item?.text || ''
  };
}

function sourceArtifactPath(value = '') {
  const raw = String(value || '').trim();
  if (!raw) return '';
  try {
    const url = new URL(raw);
    if (/raw\.githubusercontent\.com$/i.test(url.hostname)) {
      const parts = url.pathname.split('/').filter(Boolean);
      if (parts.length >= 4) return parts.slice(3).join('/');
    }
    if (/github\.com$/i.test(url.hostname) && /\/blob\//i.test(url.pathname)) {
      const parts = url.pathname.split('/').filter(Boolean);
      const blob = parts.indexOf('blob');
      if (blob >= 0) return parts.slice(blob + 2).join('/');
    }
  } catch (_) {}
  return raw;
}

function normalizeRepo(value = '') {
  return String(value || '').trim().replace(/^https?:\/\/github\.com\//i, '').replace(/\.git$/i, '').replace(/^\/+|\/+$/g, '').split('/').slice(0, 2).join('/');
}

function repoRawUrl(repo = '', ref = '', path = '') {
  if (!repo || !ref || !path) return '';
  return `https://raw.githubusercontent.com/${repo}/${encodeURIComponent(ref)}/${String(path).split('/').map((part) => encodeURIComponent(part)).join('/')}`;
}

function isSourceBacked(source = {}) {
  const kind = String(source.adapterId || source.sourceKind || source.kind || '').toLowerCase();
  return kind.includes('github') || kind.includes('source');
}

function finding(severity, code, message, extra = {}) {
  return Object.freeze(Object.assign({ severity, code, message }, extra || {}));
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const item of Object.values(value)) deepFreeze(item);
  return value;
}
