import { externalWebArtifactUrl } from '../sources/source.explicitTargets.js';

const freeze = Object.freeze;

export function recoverCanonicalParentReference(record = {}, participant = {}) {
  const source = record.source || {};
  const target = record.sourceTarget || {};
  const snapshot = record.snapshot || {};
  const adapterId = token(participant.source?.adapterId || source.adapterId);
  const sourceMode = token(participant.source?.sourceMode || record.sourceMode);
  const sourceKind = token(source.kind || source.sourceKind);
  const targetKind = token(target.targetKind || snapshot.sourceKind);
  const path = String(target.sourceArtifactPath || record.path || participant.source?.sourceArtifactPath || '').replace(/^\/+/, '');
  const schemaId = token(participant.candidateSchemaId);
  const localBoundary = adapterId === 'local' || /(^|[^a-z0-9])(local|session)([^a-z0-9]|$)/i.test(`${sourceMode} ${sourceKind}`);
  const issueBoundary = /github-(issue|comment)-embedded/i.test(`${sourceMode} ${targetKind}`);

  if (issueBoundary) {
    const sourceUrl = token(target.inputTarget || snapshot.sourceUrl || record.recoveredFromUrl);
    if (!path || !sourceUrl) return unavailableCanonicalParentReference('source-topic-social-parent-reference-unavailable');
    const comment = /comment/i.test(`${sourceMode} ${targetKind}`) || /#issuecomment-/i.test(sourceUrl);
    return freeze({ state: 'qualified', representationKind: comment ? 'github-comment-embedded' : 'github-issue-embedded', recoveryKind: comment ? 'github-comment-embedded' : 'github-issue-embedded', trace: path, traceTarget: path, origin: `[github ${comment ? 'comment' : 'issue'}](${sourceUrl})`, originTarget: sourceUrl, permalink: '', repository: '', ref: '', path, sourceUrl, schemaId, finalized: false });
  }

  const webUrl = externalWebArtifactUrl(record);
  if (webUrl) {
    const label = markdownLabel(record.title || participant.artifact?.title || 'Topic');
    return freeze({ state: 'qualified', representationKind: 'web-markdown', recoveryKind: 'web-markdown', trace: `[${label}](${webUrl})`, traceTarget: webUrl, origin: `[web artifact](${webUrl})`, originTarget: webUrl, permalink: webUrl, repository: '', ref: '', path: '', sourceUrl: webUrl, schemaId, finalized: true });
  }
  const webDeclared = sourceMode === 'explicit-url' || targetKind === 'web.markdown' || sourceKind === 'web.markdown' || adapterId === 'web';
  if (webDeclared) return unavailableCanonicalParentReference('source-topic-web-parent-reference-unavailable');

  if (localBoundary && adapterId !== 'github') {
    const localPath = String(record.path || '').replace(/^\/+/, '');
    if (!localPath) return unavailableCanonicalParentReference('source-topic-local-parent-path-unavailable');
    return freeze({ state: 'qualified', representationKind: 'local-path', recoveryKind: 'local-path', trace: localPath, traceTarget: localPath, origin: localPath, originTarget: localPath, permalink: '', repository: '', ref: '', path: localPath, sourceUrl: '', schemaId, finalized: false });
  }

  const repository = token(source.repository || source.repo || source.config?.repo);
  const ref = exactCommit(target.materializedCommit) || exactCommit(source.materializedCommit) || exactCommit(participant.source?.materializedCommit)
    || exactCommit(source.ref) || exactCommit(source.config?.ref) || exactCommit(participant.source?.ref);
  if (adapterId !== 'github' || localBoundary || !repository || !ref || !path) return unavailableCanonicalParentReference();
  const permalink = githubCommitPermalink(repository, ref, path);
  if (!permalink) return unavailableCanonicalParentReference('source-topic-parent-link-target-unavailable');
  const label = markdownLabel(record.title || participant.artifact?.title || 'Topic');
  return freeze({ state: 'qualified', representationKind: 'github-repo-file', recoveryKind: 'github-repo-file', trace: `[${label}](${permalink})`, traceTarget: permalink, origin: `[browse + git](${permalink})`, originTarget: permalink, permalink, repository, ref, path, sourceUrl: permalink, schemaId, finalized: true });
}

export function finalizeCanonicalParentReference(parent = {}, childPath = '') {
  if (parent.state !== 'qualified') return parent;
  if (parent.representationKind === 'github-repo-file' || parent.representationKind === 'web-markdown') return parent.finalized ? parent : freeze({ ...parent, finalized: true });
  const parentPath = String(parent.path || '').replace(/^\/+/, '');
  const concreteChildPath = String(childPath || '').replace(/^\/+/, '');
  if (!parentPath || !concreteChildPath) return unavailableCanonicalParentReference('canonical-parent-finalization-path-unavailable');
  const traceTarget = relativeArtifactPath(concreteChildPath, parentPath) || parentPath;
  const originTarget = parent.representationKind === 'local-path' ? parentPath : token(parent.sourceUrl || parent.originTarget);
  if (!originTarget) return unavailableCanonicalParentReference('canonical-parent-origin-unavailable');
  const origin = parent.representationKind === 'local-path' ? originTarget : `[github ${parent.representationKind === 'github-comment-embedded' ? 'comment' : 'issue'}](${originTarget})`;
  return freeze({ ...parent, trace: traceTarget, traceTarget, origin, originTarget, finalized: true });
}

export function unavailableCanonicalParentReference(reason = 'source-topic-portable-parent-reference-unavailable') {
  return freeze({ state: 'unavailable', trace: '', traceTarget: '', origin: '', originTarget: '', permalink: '', repository: '', ref: '', path: '', sourceUrl: '', schemaId: '', representationKind: '', recoveryKind: '', finalized: false, reason });
}

function githubCommitPermalink(repository, ref, path) {
  try {
    const repo = encodeGithubPath(repository);
    const encodedPath = encodeGithubPath(path);
    const target = repo && encodedPath ? `https://github.com/${repo}/blob/${ref}/${encodedPath}` : '';
    return target && !/[)\s]/.test(target) ? target : '';
  } catch (_) { return ''; }
}
function encodeGithubPath(value = '') {
  return String(value).split('/').map((part) => encodeURIComponent(part).replace(/[!'()*]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`)).join('/');
}
function exactCommit(value = '') { const commit = token(value); return /^[0-9a-f]{40}$/i.test(commit) ? commit : ''; }
function relativeArtifactPath(fromPath = '', toPath = '') {
  const from = normalizePathParts(fromPath); const to = normalizePathParts(toPath);
  if (!from.length || !to.length) return '';
  from.pop();
  let shared = 0; while (shared < from.length && shared < to.length && from[shared] === to[shared]) shared += 1;
  const parts = [...Array(from.length - shared).fill('..'), ...to.slice(shared)];
  return parts.join('/') || to[to.length - 1] || '';
}
function normalizePathParts(value = '') {
  const out = []; for (const part of String(value || '').replace(/\\/g, '/').split('/')) { if (!part || part === '.') continue; if (part === '..') out.pop(); else out.push(part); } return out;
}
function markdownLabel(value) { return String(value || '').replace(/[\[\]\n\r]/g, ' ').trim() || 'Topic'; }
function token(value = '') { return String(value || '').trim(); }
