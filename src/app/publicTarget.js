import { parseGithubIssueSnapshotTarget } from '../adapters/github/github.issueSnapshot.js';
import { normalizeWorkspaceMemberIdentity, singleWorkspaceMemberBinding } from '../workspaces/workspace.memberIdentity.js';

export const PUBLIC_TARGET_SCHEMA = 'tiinex.publicTarget.v1';

export const PublicTargetRestoreCapability = Object.freeze({
  restorable: 'restorable',
  unsupported: 'unsupported',
  invalid: 'invalid'
});

export function classifyRouteLocation(locationLike = {}) {
  const hash = String(locationLike?.hash || '').trim();
  if (!hash) return Object.freeze({ kind: 'clean', hash: '' });
  if (/^#state=/i.test(hash)) return Object.freeze({ kind: 'semantic-state', hash });
  const target = parsePublicTargetHash(hash);
  if (target) return Object.freeze({ kind: 'public-target', hash, target });
  return Object.freeze({ kind: 'unsupported-hash', hash });
}

export function parsePublicTargetHash(hashValue = '') {
  const raw = String(hashValue || '').replace(/^#/, '').trim();
  if (!raw) return null;
  const decoded = safeDecode(raw);
  if (/^(?:state|view)=/i.test(decoded)) return null;
  const splitter = decoded.indexOf('|');
  const adapterHint = splitter > 0 ? normalizePublicAdapter(decoded.slice(0, splitter)) : '';
  const payload = splitter > 0 ? decoded.slice(splitter + 1) : decoded;
  if (adapterHint === 'workspace.member') return parseWorkspaceMemberRoutePayload(payload);
  const externalTarget = safeDecode(payload);
  return publicTargetFromExternalUrl(externalTarget, adapterHint);
}

export function publicTargetFromExternalUrl(value = '', adapterHint = '') {
  const externalTarget = String(value || '').trim();
  if (!/^https?:\/\//i.test(externalTarget)) return null;
  const hinted = normalizePublicAdapter(adapterHint);
  const githubIssue = parseGithubIssueSnapshotTarget(externalTarget);
  if (githubIssue.ok && (!hinted || hinted === 'github.issue' || hinted === 'github.discussion')) {
    return freezeTarget({
      adapterId: 'github',
      targetKind: githubIssue.commentId ? 'github.issue.comment' : (githubIssue.kind === 'discussion' ? 'github.discussion' : 'github.issue'),
      externalTarget: githubIssue.canonicalUrl,
      repository: githubIssue.repository,
      issueNumber: githubIssue.number,
      commentId: githubIssue.commentId || ''
    });
  }
  const githubFile = parseGithubFileTarget(externalTarget);
  if (githubFile && (!hinted || hinted === 'github.file' || hinted === 'workspace')) {
    return freezeTarget(Object.assign({}, githubFile, {
      targetKind: hinted === 'workspace'
        ? 'workspace'
        : (hinted === 'github.file' ? 'github.file' : (/\.workspace\.md$/i.test(githubFile.path) ? 'workspace' : 'github.file'))
    }));
  }
  let url;
  try { url = new URL(externalTarget); } catch (_) { return null; }
  const path = url.pathname || '';
  const targetKind = hinted === 'workspace'
    ? 'workspace'
    : (hinted === 'web.markdown'
      ? 'web.markdown'
      : (/\.workspace\.md$/i.test(path) ? 'workspace' : (/\.(?:md|markdown|txt)$/i.test(path) ? 'web.markdown' : 'web.url')));
  return freezeTarget({ adapterId: 'web', targetKind, externalTarget: url.href });
}

export function artifactPublicTargetFromRecord(record = {}) {
  for (const value of recordPublicTargetValues(record)) {
    const parsed = artifactPublicTargetFromExternalUrl(value);
    if (parsed) return parsed;
  }
  return null;
}

export function publicTargetFromRecord(record = {}) {
  for (const value of recordPublicTargetValues(record)) {
    const parsed = publicTargetFromExternalUrl(value, isWorkspaceArtifact(record) ? 'workspace' : '');
    if (parsed) return parsed;
  }
  return null;
}

export function buildPublicTargetHash(target = {}) {
  const normalized = normalizePublicTarget(target);
  if (!normalized) return '';
  const adapter = routeAdapterForTarget(normalized);
  if (normalized.targetKind === 'workspace.member') {
    const payload = JSON.stringify({ target: normalized.externalTarget, memberKey: normalized.memberIdentity?.key || '' });
    return `#${encodeURIComponent(`${adapter}|${payload}`)}`;
  }
  return `#${encodeURIComponent(`${adapter}|${normalized.externalTarget}`)}`;
}

export function buildPublicViewerTargetUrl(target = {}, publicViewerUrl = '') {
  const hash = buildPublicTargetHash(target);
  const base = safePublicViewerUrl(publicViewerUrl);
  if (!hash || !base) return '';
  const url = new URL(base);
  url.hash = '';
  return `${url.href}${hash}`;
}

export function normalizePublicTarget(target = {}) {
  if (target?.schema === PUBLIC_TARGET_SCHEMA && /^https?:\/\//i.test(String(target.externalTarget || ''))) {
    if (target.targetKind === 'workspace.member' && !normalizeWorkspaceMemberIdentity(target.memberIdentity)) return null;
    return freezeTarget(target);
  }
  return publicTargetFromExternalUrl(target?.externalTarget || target?.url || '', target?.targetKind || target?.adapter || target?.adapterId || '');
}

export function publicTargetFromWorkspaceMemberBinding(binding = null) {
  const descriptor = binding?.descriptorTarget;
  const memberIdentity = normalizeWorkspaceMemberIdentity(binding?.memberIdentity);
  if (!descriptor || !memberIdentity) return null;
  const target = publicTargetFromExternalUrl(descriptor.externalTarget || '', 'workspace');
  return target ? freezeTarget(Object.assign({}, target, { targetKind: 'workspace.member', memberIdentity })) : null;
}

export function publicTargetFromWorkspace(workspace = {}) {
  const binding = singleWorkspaceMemberBinding(workspace);
  return binding ? publicTargetFromWorkspaceMemberBinding(binding) : null;
}


export function publicTargetRestoreCapability(target = {}) {
  const normalized = normalizePublicTarget(target);
  if (!normalized) return PublicTargetRestoreCapability.invalid;
  const kind = normalized.targetKind;
  if (kind === 'web.url') return PublicTargetRestoreCapability.unsupported;
  if (['github.issue', 'github.issue.comment', 'github.discussion'].includes(kind)) {
    return normalized.adapterId === 'github' && normalized.repository && normalized.issueNumber
      ? PublicTargetRestoreCapability.restorable
      : PublicTargetRestoreCapability.invalid;
  }
  if (kind === 'github.file') {
    return normalized.adapterId === 'github' && normalized.repository && normalized.path
      ? PublicTargetRestoreCapability.restorable
      : PublicTargetRestoreCapability.invalid;
  }
  if (kind === 'web.markdown') {
    return normalized.adapterId === 'web'
      ? PublicTargetRestoreCapability.restorable
      : PublicTargetRestoreCapability.invalid;
  }
  if (kind === 'workspace' || kind === 'workspace.member') {
    if (normalized.adapterId === 'github') {
      return normalized.repository && normalized.path
        ? PublicTargetRestoreCapability.restorable
        : PublicTargetRestoreCapability.invalid;
    }
    return normalized.adapterId === 'web'
      ? PublicTargetRestoreCapability.restorable
      : PublicTargetRestoreCapability.invalid;
  }
  return PublicTargetRestoreCapability.unsupported;
}

function artifactPublicTargetFromExternalUrl(value = '') {
  const externalTarget = String(value || '').trim();
  if (!/^https?:\/\//i.test(externalTarget)) return null;
  const githubIssue = parseGithubIssueSnapshotTarget(externalTarget);
  if (githubIssue.ok) return publicTargetFromExternalUrl(externalTarget);
  if (parseGithubFileTarget(externalTarget)) return publicTargetFromExternalUrl(externalTarget, 'github.file');
  let url;
  try { url = new URL(externalTarget); } catch (_) { return null; }
  if (/\.(?:md|markdown|txt)$/i.test(url.pathname || '')) return publicTargetFromExternalUrl(externalTarget, 'web.markdown');
  return publicTargetFromExternalUrl(externalTarget);
}

function recordPublicTargetValues(record = {}) {
  return [
    record?.sourceTarget?.inputTarget,
    record?.sourceTarget?.sourceUrl,
    record?.sourceTarget?.rawUrl,
    record?.snapshot?.target?.canonicalUrl,
    record?.snapshot?.sourceUrl,
    record?.source?.url
  ].map((value) => String(value || '').trim()).filter(Boolean);
}

function freezeTarget(input = {}) {
  const memberIdentity = input.targetKind === 'workspace.member' ? normalizeWorkspaceMemberIdentity(input.memberIdentity) : null;
  return Object.freeze({
    schema: PUBLIC_TARGET_SCHEMA,
    adapterId: String(input.adapterId || '').trim(),
    targetKind: String(input.targetKind || '').trim(),
    externalTarget: String(input.externalTarget || '').trim(),
    repository: String(input.repository || '').trim(),
    ref: String(input.ref || '').trim(),
    path: String(input.path || '').trim(),
    issueNumber: Number(input.issueNumber || 0),
    commentId: String(input.commentId || '').trim(),
    ...(memberIdentity ? { memberIdentity } : {})
  });
}

function parseWorkspaceMemberRoutePayload(payload = '') {
  let parsed = null;
  try { parsed = JSON.parse(String(payload || '')); } catch (_) { return null; }
  const descriptor = publicTargetFromExternalUrl(parsed?.target || '', 'workspace');
  const memberIdentity = normalizeWorkspaceMemberIdentity({ key: parsed?.memberKey || '' });
  if (!descriptor || !memberIdentity) return null;
  return freezeTarget(Object.assign({}, descriptor, { targetKind: 'workspace.member', memberIdentity }));
}

function parseGithubFileTarget(value = '') {
  let url;
  try { url = new URL(value); } catch (_) { return null; }
  const parts = url.pathname.split('/').filter(Boolean);
  if (url.hostname === 'github.com' && parts.length >= 5 && parts[2] === 'blob') {
    const [owner, repo, , ref, ...pathParts] = parts;
    if (!owner || !repo || !ref || !pathParts.length) return null;
    return { adapterId: 'github', externalTarget: url.href, repository: `${owner}/${repo}`, ref, path: pathParts.join('/') };
  }
  if (url.hostname === 'raw.githubusercontent.com' && parts.length >= 4) {
    const [owner, repo, ref, ...pathParts] = parts;
    if (!owner || !repo || !ref || !pathParts.length) return null;
    return { adapterId: 'github', externalTarget: url.href, repository: `${owner}/${repo}`, ref, path: pathParts.join('/') };
  }
  return null;
}

function normalizePublicAdapter(value = '') {
  const key = String(value || '').trim().toLowerCase().replace(/:/g, '.');
  if (['issue', 'github-issue', 'github.issue'].includes(key)) return 'github.issue';
  if (['discussion', 'github-discussion', 'github.discussion'].includes(key)) return 'github.discussion';
  if (['github.file', 'github.raw', 'github.blob', 'github.raw-file'].includes(key)) return 'github.file';
  if (['workspace.member', 'tiinex.workspace.member', 'workspace-member'].includes(key)) return 'workspace.member';
  if (['workspace', 'tiinex.workspace', 'web.workspace', 'workspace.md'].includes(key)) return 'workspace';
  if (['web.markdown', 'web.md', 'markdown', 'web.file'].includes(key)) return 'web.markdown';
  if (['web.url', 'web', 'url'].includes(key)) return 'web.url';
  return key;
}

function routeAdapterForTarget(target = {}) {
  if (target.targetKind === 'workspace.member') return 'workspace.member';
  if (target.targetKind === 'workspace') return 'workspace';
  if (target.targetKind === 'github.issue' || target.targetKind === 'github.issue.comment') return 'github.issue';
  if (target.targetKind === 'github.discussion') return 'github.discussion';
  if (target.targetKind === 'github.file') return 'github.file';
  if (target.targetKind === 'web.markdown') return 'web.markdown';
  return 'web.url';
}

function isWorkspaceArtifact(record = {}) {
  return Boolean(record?.workspaceArtifactRole?.openEligible) || /\.workspace\.md$/i.test(String(record?.path || record?.sourceTarget?.sourceArtifactPath || ''));
}

function safeDecode(value = '') { try { return decodeURIComponent(String(value || '')); } catch (_) { return String(value || ''); } }
function safePublicViewerUrl(value = '') { try { const url = new URL(String(value || '').trim()); return /^https?:$/.test(url.protocol) ? url.href : ''; } catch (_) { return ''; } }
