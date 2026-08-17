import '../sources/source.identity.js';
import { normalizeExplicitFileRefs } from '../sources/source.explicitTargets.js';

export function makeConfiguredSource(input = {}, options = {}, runtime = {}) {
  const repo = String(input.repository || input.repo || '').trim();
  const label = String(input.label || repo || 'Source').trim();
  const rootPath = String(input.rootPath || input.config?.rootPath || '.topics').trim() || '.topics';
  const ref = String(input.ref || input.config?.ref || '').trim();
  const requestedRef = Object.prototype.hasOwnProperty.call(input, 'requestedRef') ? String(input.requestedRef || '').trim() : String(input.config?.requestedRef ?? ref).trim();
  const materializedCommit = exactCommit(input.materializedCommit || input.config?.materializedCommit);
  const issueUrls = input.issueUrls || input.config?.issueUrls || '';
  const explicitFileRefs = normalizeExplicitFileRefs(input.explicitFileRefs ?? input.fileRefs ?? input.config?.explicitFileRefs ?? input.config?.fileRefs ?? []);
  const requestedSurfaces = input.requestedSurfaces ? Object.assign({}, input.requestedSurfaces) : {
    repoFiles: { requested: Boolean(input.repoDiscovery) },
    explicitFiles: { requested: Boolean(explicitFileRefs.length), requestedCount: explicitFileRefs.length },
    issueSnapshots: { requested: Boolean(input.issueDiscovery || issueUrls) }
  };
  return {
    id: configuredSourceIdForWorkspace(Object.assign({}, input, { repo, ref, rootPath }), runtime.existingSources, options),
    kind: input.kind || runtime.configuredSourceKind || 'github-tree', adapterId: input.adapterId || runtime.githubAdapterId || 'github', sourceKind: input.sourceKind || runtime.githubRepoSourceKind || 'github.repo',
    label, repo, ref, requestedRef, materializedCommit, rootPath, config: { repo, ref, requestedRef, rootPath, issueUrls, explicitFileRefs: explicitFileRefs.slice() }, count: Number(input.count || 0),
    boundary: 'explicit source boundary; no material is trusted until loaded', transportLabel: input.transportLabel || options.transportLabel || 'Source Pages mirror', transportRefreshTier: input.transportRefreshTier || input.preferredTransportTier || '',
    transportPlan: input.transportPlan ? Object.assign({}, input.transportPlan) : undefined, transportOutcome: input.transportOutcome ? Object.assign({}, input.transportOutcome) : undefined,
    governanceBoundary: input.governanceBoundary ? Object.assign({}, input.governanceBoundary) : undefined, transportTiers: input.transportTiers ? Object.assign({}, input.transportTiers) : undefined,
    repoDiscovery: Boolean(input.repoDiscovery), issueDiscovery: Boolean(input.issueDiscovery), issueUrls, explicitFileRefs,
    workspaceMatch: input.workspaceMatch || input.config?.workspaceMatch || '', appConfigPlan: input.appConfigPlan || input.config?.appConfigPlan || '', openBehavior: input.openBehavior || input.config?.openBehavior || '', preferredDisplay: input.preferredDisplay || input.config?.preferredDisplay || '',
    requestedSurfaces, surfaces: Object.assign({}, input.surfaces || input.surfaceState || {}), discoveryState: runtime.normalizeSourceDiscoveryState ? runtime.normalizeSourceDiscoveryState(input.discoveryState, 'deferred') : (input.discoveryState || 'deferred'),
    closeable: input.closeable !== false, loadable: input.loadable !== false
  };
}

function exactCommit(value = '') { const commit = String(value || '').trim(); return /^[0-9a-f]{40}$/i.test(commit) ? commit : ''; }

export function configuredSourceIdForWorkspace(input = {}, existingSources = [], options = {}) {
  const sources = Array.isArray(existingSources) ? existingSources : [];
  const requestedId = String(input.id || '').trim();
  const authoritativeRefinement = options?.sourceIdentityPolicy === 'refine-existing'
    ? sources.find((source) => String(source?.id || '') === requestedId)
    : null;
  if (authoritativeRefinement?.id) return authoritativeRefinement.id;
  const boundaryKey = globalThis.TiinexSourceIdentity?.configuredSourceBoundaryKey?.(input) || '';
  const sameBoundary = boundaryKey
    ? sources.find((source) => globalThis.TiinexSourceIdentity?.configuredSourceBoundaryKey?.(source) === boundaryKey)
    : null;
  if (sameBoundary?.id) return sameBoundary.id;

  const generated = input.id || globalThis.TiinexSourceIdentity?.makeConfiguredSourceId?.(input) || `github:${String(input.repository || input.repo || 'source').trim().toLowerCase()}`;
  const collision = sources.find((source) => String(source?.id || '') === generated);
  if (!collision) return generated;

  const suffix = stableBoundarySuffix(boundaryKey || JSON.stringify(input));
  let candidate = `${generated}--boundary-${suffix}`;
  let serial = 2;
  while (sources.some((source) => String(source?.id || '') === candidate)) {
    candidate = `${generated}--boundary-${suffix}-${serial}`;
    serial += 1;
  }
  return candidate;
}

function stableBoundarySuffix(value = '') {
  let hash = 2166136261;
  for (const char of String(value || '')) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}
