import { resolveGithubSnapshotInput } from '../adapters/github/github.repoDiscovery.js';
import { normalizeResolvedSnapshot, timePortalIntentFor } from '../workspaces/workspace.timePortal.js';

export function timePortalGithubSources(workspace = {}) {
  return (Array.isArray(workspace?.sources) ? workspace.sources : [])
    .filter((source) => source && source.id !== 'local' && (source.adapterId === 'github' || source.sourceKind === 'github.repo' || source.kind === 'github-tree'))
    .map((source) => ({
      id: String(source.id || '').trim(),
      label: String(source.label || source.repo || 'GitHub source').trim(),
      repository: String(source.repo || source.repository || source.config?.repo || '').trim(),
      ref: String(source.ref || source.config?.ref || '').trim(),
      rootPath: String(source.rootPath || source.config?.rootPath || '').trim()
    }))
    .filter((source) => source.id && source.repository);
}

export function selectedTimePortalGithubSource(workspace = {}, sourceId = '') {
  const candidates = timePortalGithubSources(workspace);
  const id = String(sourceId || '').trim();
  if (id) return candidates.some((source) => source.id === id)
    ? (workspace.sources || []).find((source) => source.id === id) || null
    : null;
  if (candidates.length !== 1) return null;
  return (workspace.sources || []).find((source) => source.id === candidates[0].id) || null;
}

export async function resolveTimePortalSnapshot({ workspace, view = {}, sourceId = '', snapshotInput = '', fetchImpl } = {}) {
  const candidates = timePortalGithubSources(workspace);
  const selectedId = String(sourceId || timePortalIntentFor(view).sourceId || '').trim();
  if (!selectedId && candidates.length > 1) return failure('time-portal.source.ambiguous', 'Choose which configured GitHub source to review historically.');
  const source = selectedTimePortalGithubSource(workspace, selectedId);
  if (!source) return failure(candidates.length ? 'time-portal.source.required' : 'time-portal.source.unsupported', candidates.length ? 'Choose a configured GitHub source.' : 'Time Portal requires a configured GitHub repository source.');
  const input = String(snapshotInput || timePortalIntentFor(view).snapshotInput || '').trim();
  if (!input) return failure('time-portal.snapshot-input.required', 'Paste an exact commit, GitHub commit/tree URL, or explicit ref.');
  const resolved = await resolveGithubSnapshotInput(source, input, { fetchImpl });
  if (!resolved.ok) return failure(resolved.code || 'time-portal.snapshot.resolve.failed', resolved.message || 'Snapshot resolution failed.', { transportStatus: resolved.status || null });
  const snapshot = normalizeResolvedSnapshot({
    sourceId: source.id,
    repository: resolved.repository,
    rootPath: source.rootPath || source.config?.rootPath || '',
    requestedRef: resolved.requestedRef,
    resolvedRef: resolved.resolvedRef,
    materializedCommit: resolved.materializedCommit,
    inputTarget: resolved.inputTarget,
    resolvedBy: resolved.resolvedBy
  });
  if (!snapshot) return failure('time-portal.snapshot.identity.invalid', 'Snapshot did not resolve to an exact immutable source identity.');
  return { ok: true, schema: 'tiinex.site.timePortalSnapshotResolution.v1', sourceId: source.id, snapshot };
}

function failure(code, message, extras = {}) {
  return Object.assign({ ok: false, schema: 'tiinex.site.timePortalSnapshotResolution.v1', code, message }, extras);
}
