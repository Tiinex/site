import { normalizeExplicitFileRefs } from '../sources/source.explicitTargets.js';

export function makeConfiguredSource(input = {}, options = {}, runtime = {}) {
  const repo = String(input.repository || input.repo || '').trim();
  const label = String(input.label || repo || 'Source').trim();
  const rootPath = String(input.rootPath || input.config?.rootPath || '.topics').trim() || '.topics';
  const ref = String(input.ref || input.config?.ref || '').trim();
  const issueUrls = input.issueUrls || input.config?.issueUrls || '';
  const explicitFileRefs = normalizeExplicitFileRefs(input.explicitFileRefs ?? input.fileRefs ?? input.config?.explicitFileRefs ?? input.config?.fileRefs ?? []);
  const requestedSurfaces = input.requestedSurfaces ? Object.assign({}, input.requestedSurfaces) : {
    repoFiles: { requested: Boolean(input.repoDiscovery) },
    explicitFiles: { requested: Boolean(explicitFileRefs.length), requestedCount: explicitFileRefs.length },
    issueSnapshots: { requested: Boolean(input.issueDiscovery || issueUrls) }
  };
  return {
    id: input.id || globalThis.TiinexSourceIdentity?.makeConfiguredSourceId?.({ repo, ref, rootPath }) || `github:${repo.toLowerCase() || 'source'}`,
    kind: input.kind || runtime.configuredSourceKind || 'github-tree', adapterId: input.adapterId || runtime.githubAdapterId || 'github', sourceKind: input.sourceKind || runtime.githubRepoSourceKind || 'github.repo',
    label, repo, ref, rootPath, config: { repo, ref, rootPath, issueUrls, explicitFileRefs: explicitFileRefs.slice() }, count: Number(input.count || 0),
    boundary: 'explicit source boundary; no material is trusted until loaded', transportLabel: input.transportLabel || options.transportLabel || 'Source Pages mirror', transportRefreshTier: input.transportRefreshTier || input.preferredTransportTier || '',
    transportPlan: input.transportPlan ? Object.assign({}, input.transportPlan) : undefined, transportOutcome: input.transportOutcome ? Object.assign({}, input.transportOutcome) : undefined,
    governanceBoundary: input.governanceBoundary ? Object.assign({}, input.governanceBoundary) : undefined, transportTiers: input.transportTiers ? Object.assign({}, input.transportTiers) : undefined,
    repoDiscovery: Boolean(input.repoDiscovery), issueDiscovery: Boolean(input.issueDiscovery), issueUrls, explicitFileRefs,
    workspaceMatch: input.workspaceMatch || input.config?.workspaceMatch || '', appConfigPlan: input.appConfigPlan || input.config?.appConfigPlan || '', openBehavior: input.openBehavior || input.config?.openBehavior || '', preferredDisplay: input.preferredDisplay || input.config?.preferredDisplay || '',
    requestedSurfaces, surfaces: Object.assign({}, input.surfaces || input.surfaceState || {}), discoveryState: runtime.normalizeSourceDiscoveryState ? runtime.normalizeSourceDiscoveryState(input.discoveryState, 'deferred') : (input.discoveryState || 'deferred'),
    closeable: input.closeable !== false, loadable: input.loadable !== false
  };
}
