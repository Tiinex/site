import { externalWebArtifactUrl, normalizeExternalWebArtifactUrl } from '../sources/source.explicitTargets.js';

const EXACT_GITHUB_COMMIT = /^[0-9a-f]{40}$/i;

export function projectPackageSourceReference(material = {}, options = {}) {
  const source = material.source || options.source || {};
  const sourceTarget = material.sourceTarget || options.sourceTarget || {};
  const adapterId = String(source.adapterId || options.adapterId || '').trim();
  const repo = String(source.repo || source.repository || source.config?.repo || options.repo || '').trim();
  const configuredRef = String(source.ref || source.config?.ref || source.resolvedRef || options.ref || '').trim();
  const materializedCommit = exactCommit(sourceTarget.materializedCommit || source.materializedCommit || source.commit || options.materializedCommit);
  const inputTarget = exactInputTarget(material, sourceTarget, adapterId);
  const sourceArtifactPath = String(sourceTarget.sourceArtifactPath || options.sourceArtifactPath || (sourceTarget.surface === 'repoFiles' ? material.path || '' : '')).trim();
  const path = sourceArtifactPath || String(options.path || material.path || '').trim();
  const targetKind = String(sourceTarget.targetKind || source.sourceKind || options.targetKind || '').trim();
  const surface = String(sourceTarget.surface || options.surface || '').trim();
  const rawUrl = normalizeExternalWebArtifactUrl(sourceTarget.rawUrl || source.url || options.rawUrl || '');
  const refKind = materializedCommit ? 'immutable-commit' : configuredRef ? 'mutable-or-unqualified-ref' : 'unpinned';
  const githubTargetReady = adapterId === 'github' && Boolean(repo) && Boolean(path || inputTarget);
  const externalTargetReady = adapterId !== 'github' && Boolean(inputTarget);
  const exactTarget = githubTargetReady || externalTargetReady;
  const status = adapterId === 'github'
    ? (githubTargetReady && materializedCommit ? 'pinned-reference' : 'degraded-reference')
    : (externalTargetReady ? 'exact-target-reference' : 'degraded-reference');

  return deepFreeze({
    schema: 'tiinex.export.package.source-target.v2',
    adapterId,
    status,
    exactTarget,
    immutability: materializedCommit ? 'immutable-materialized-commit' : (exactTarget ? 'target-exact-content-not-immutable' : 'degraded'),
    repo,
    configuredRef,
    materializedCommit,
    ref: materializedCommit || configuredRef,
    refKind,
    path,
    sourceArtifactPath,
    surface,
    targetKind,
    inputTarget,
    rawUrl,
    sourceId: String(source.id || ''),
    sourceKind: String(source.sourceKind || source.kind || ''),
    boundary: String(source.boundary || material.importBoundary || options.boundary || ''),
    unavailable: Boolean(options.unavailable || material.previewState === 'metadata-only' || material.previewState === 'omitted-large')
  });
}

export function isExactGithubCommit(value = '') {
  return EXACT_GITHUB_COMMIT.test(String(value || '').trim());
}

export function sourceReferencePackageStatus(target = {}) {
  if (target.adapterId === 'github') return target.materializedCommit && target.repo && (target.path || target.inputTarget) ? 'pinned-reference' : 'degraded-reference';
  return target.inputTarget ? 'exact-target-reference' : 'degraded-reference';
}

function exactCommit(value = '') {
  const text = String(value || '').trim();
  return EXACT_GITHUB_COMMIT.test(text) ? text.toLowerCase() : '';
}

function exactInputTarget(material = {}, target = {}, adapterId = '') {
  const explicit = String(target.inputTarget || '').trim();
  if (explicit) {
    if (adapterId === 'github') return explicit;
    return normalizeExternalWebArtifactUrl(explicit) || explicit;
  }
  const external = externalWebArtifactUrl(material);
  if (external) return external;
  const permalink = String(material.source?.permalink || material.source?.config?.permalink || '').trim();
  return permalink;
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer) return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}
