import { AdapterAvailability, makeAdapterDefinition, makeAdapterResult } from '../adapter.contracts.js';
import { loadGithubFilesForSource } from '../../sources/github/github.loader.js';
import { materializeGithubIssueSurface } from './github.issueSurface.js';
import { authorizeSourceTransport } from '../../sources/transport.policy.js';
import { collectSourceAssetReferences } from '../../sources/source.assetReferences.js';
import { createGithubTransportFetch, normalizeGithubTransportTier } from '../../sources/github/github.transport.js';
import { summarizeTransportOutcome, summarizeTransportTiers } from './github.transportDiagnostics.js';
import { writeGithubRepoDiscoveryCache } from './github.repoMirror.js';
import { preMaterializeGithubRepoFiles, requestedRepoTransportTier } from './github.repoSurface.js';
import { discoverGithubMarkdownRefs, resolveGithubSourceRef } from './github.repoDiscovery.js';
import { buildGovernanceBoundaryForSource, governanceFindingForBoundary } from '../../governance/governance.boundary.js';
export { discoverGithubMarkdownRefs, resolveGithubSourceRef } from './github.repoDiscovery.js';

export const GITHUB_ADAPTER_ID = 'github';
export function createGithubAdapter() {
  return makeAdapterDefinition({
    id: GITHUB_ADAPTER_ID,
    label: 'GitHub',
    availability: AdapterAvailability.available,
    sourceKinds: ['github.repo', 'github.file', 'github.issue-snapshot'],
    capabilities: {
      registerSource: true,
      materialize: true,
      discover: true,
      resolveAsset: true,
      openExternal: true,
      requiresBridge: false
    },
    configShape: {
      repo: 'owner/name',
      ref: 'branch | tag | commit | empty means resolve public default branch',
      rootPath: 'one or more repo-relative root paths',
      fileRefs: 'explicit Markdown paths or raw/blob URLs'
    },
    boundary: 'explicit GitHub source boundary; public tree/raw/blob file reads only in browser viewer',
    notes: ['Repo tree discovery is public/read-only and bounded. Issue/discussion snapshots require explicit targets and are materialized only from supplied fixtures or a future reader slice.']
  });
}


function reportProgress(options = {}, progress = {}) {
  if (typeof options.onProgress === 'function') options.onProgress(progress);
}

function uniqueFileTargets(items = []) {
  const seen = new Set();
  const out = [];
  for (const item of items) {
    const ref = String(item?.ref || '').trim();
    if (!ref) continue;
    const key = ref.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(Object.assign({}, item));
  }
  return out;
}

function fileTarget(ref, surface, index, targetKind = 'github-markdown') {
  if (ref && typeof ref === 'object') return { ref: String(ref.ref || ref.path || ref.url || '').trim(), surface: ref.surface || surface, targetKind: ref.targetKind || targetKind, inputTarget: ref.inputTarget || ref.ref || ref.path || ref.url || '', targetIndex: Number.isFinite(Number(ref.targetIndex)) ? Number(ref.targetIndex) : index };
  const clean = String(ref || '').trim();
  return { ref: clean, surface, targetKind, inputTarget: clean, targetIndex: index };
}

function makeSurfaceState(requested = false, extra = {}) {
  return Object.assign({
    requested: Boolean(requested),
    attempted: false,
    requestedCount: 0,
    discovered: 0,
    loaded: 0,
    failed: 0,
    deferred: false,
    skipped: false,
    unavailable: false,
    records: []
  }, extra || {});
}

function makeSourcePlan(source = {}, input = {}, explicitRefs = []) {
  const issueRequested = Boolean(input.issueDiscovery || input.issueUrls);
  const repoRequested = Boolean(input.repoDiscovery);
  const explicitRequested = Boolean(explicitRefs.length);
  return {
    schema: 'tiinex.github.source.plan.v1',
    sourceId: source?.id || '',
    repo: source?.repo || source?.repository || '',
    ref: source?.ref || '',
    rootPath: source?.rootPath || '',
    surfaces: {
      boundary: makeSurfaceState(true, { attempted: true }),
      repoFiles: makeSurfaceState(repoRequested),
      explicitFiles: makeSurfaceState(explicitRequested, { requestedCount: explicitRefs.length }),
      issueSnapshots: makeSurfaceState(issueRequested)
    }
  };
}

function cloneSourcePlan(plan = {}) {
  return JSON.parse(JSON.stringify(plan || {}));
}

function markSurface(plan, name, patch = {}) {
  if (!plan.surfaces) plan.surfaces = {};
  if (!plan.surfaces[name]) plan.surfaces[name] = makeSurfaceState(false);
  Object.assign(plan.surfaces[name], patch || {});
  return plan.surfaces[name];
}

function summarizeSurfaceCountsFromTargets(result = {}) {
  const counts = {};
  const ensure = (surface) => {
    const name = surface || 'unknown';
    counts[name] ||= { loaded: 0, failed: 0, records: [], transportTiers: [] };
    return counts[name];
  };
  const bump = (surface, key, amount = 1) => {
    const item = ensure(surface);
    item[key] = Number(item[key] || 0) + amount;
  };
  for (const record of result.records || []) {
    const target = record.sourceTarget || {};
    const item = ensure(target.surface || 'unknown');
    item.loaded = Number(item.loaded || 0) + 1;
    if (record.id) item.records.push(record.id);
    const tier = normalizeGithubTransportTier(target.transportTier || '');
    if (tier && !item.transportTiers.includes(tier)) item.transportTiers.push(tier);
  }
  for (const error of result.errors || []) bump(error.surface || 'unknown', 'failed', 1);
  return counts;
}




function githubDiscoveryWarning(error) {
  const status = error?.status || null;
  const base = status ? `GitHub API ${status}` : 'GitHub API';
  let message = `${base} prevented repo discovery. Registering the source is still safe; use explicit file refs/raw URLs or try discovery later.`;
  let code = 'github.repo.discovery.unavailable';
  if (Number(status) === 403) {
    code = 'github.repo.discovery.rate-limited-or-forbidden';
    message = 'GitHub repo discovery is unavailable right now (API 403/rate-limit). Source was registered; add explicit file refs/raw URLs or try later.';
  } else if (Number(status) === 404) {
    code = 'github.repo.discovery.not-found';
    message = 'GitHub repo discovery did not find that repo/ref. Source was registered; verify repo/ref or use explicit raw/blob URLs.';
  }
  return { code, severity: 'warning', message, status, url: error?.url || '' };
}

export async function materializeGithubSource(source, input = {}, options = {}) {
  const explicitRefs = Array.isArray(input.fileRefs) ? input.fileRefs : [];
  const explicitTargets = explicitRefs.map((ref, index) => fileTarget(ref, 'explicitFiles', index, 'explicit-markdown'));
  let fileTargets = explicitTargets.slice();
  let resolvedRef = String(source?.ref || '').trim();
  const transportRuntime = createGithubTransportFetch(source, options);
  const transportFetchImpl = transportRuntime.fetch;
  const sourcePlan = makeSourcePlan(source, input, explicitRefs);
  const diagnostics = {
    sourcePlan: cloneSourcePlan(sourcePlan),
    transport: transportRuntime.plan.label,
    transportPlan: transportRuntime.plan,
    explicitFileRefs: explicitRefs.length,
    discoveredFileRefs: 0,
    transportEvents: [],
    recordAttribution: [],
    surfaces: cloneSourcePlan(sourcePlan).surfaces
  };
  const warnings = [];
  const errors = [];
  let preloadedRepoResult = { records: [], warnings: [], errors: [], counts: {}, diagnostics: { transportEvents: [] } };
  let repoDiscoveryHandledBySurfaceTransport = false;

  const policyInput = options.transportPolicy || (Number(options.maxRequestsPerOperation || options.maxRequestsPerSource || options.maxRequests || 0) > 0 || options.offline || options.cooldownUntil ? options : null);

  if (explicitTargets.length) markSurface(sourcePlan, 'explicitFiles', { attempted: true, requestedCount: explicitTargets.length });

  if (input.repoDiscovery) {
    markSurface(sourcePlan, 'repoFiles', { attempted: true });
    const discoveryAuthorization = policyInput ? authorizeSourceTransport({ kind: 'github.repo-discovery', sourceId: source?.id || '', adapterId: GITHUB_ADAPTER_ID, requestedRequests: 2 }, policyInput) : null;
    if (discoveryAuthorization && !discoveryAuthorization.allowed) {
      diagnostics.transportPolicy = discoveryAuthorization;
      diagnostics.discoveryUnavailable = true;
      diagnostics.discoveryBlockedByPolicy = true;
      markSurface(sourcePlan, 'repoFiles', { skipped: true, unavailable: true });
      for (const issue of discoveryAuthorization.findings || []) {
        const warning = { code: issue.code, severity: issue.severity || 'warning', surface: 'repoFiles', message: issue.message, sourceId: issue.sourceId || source?.id || '', adapterId: GITHUB_ADAPTER_ID, retryable: issue.retryable === true };
        warnings.push(warning);
        diagnostics.transportEvents.push(Object.assign({ resultKind: 'repo-discovery-policy' }, warning));
      }
    } else {
      preloadedRepoResult = await preMaterializeGithubRepoFiles(source, options);
      diagnostics.transportEvents.push(...(preloadedRepoResult.diagnostics?.transportEvents || []));
      warnings.push(...(preloadedRepoResult.warnings || []).map((warning) => Object.assign({ surface: 'repoFiles' }, warning)));
      errors.push(...(preloadedRepoResult.errors || []).map((error) => Object.assign({ surface: 'repoFiles' }, error)));
      if (preloadedRepoResult.records?.length) {
        repoDiscoveryHandledBySurfaceTransport = true;
        resolvedRef = preloadedRepoResult.ref || resolvedRef;
        diagnostics.discoveredFileRefs = Number(preloadedRepoResult.counts?.discovered || preloadedRepoResult.records.length || 0);
        if (preloadedRepoResult.governanceBoundary) diagnostics.governanceBoundary = preloadedRepoResult.governanceBoundary;
        markSurface(sourcePlan, 'repoFiles', { discovered: diagnostics.discoveredFileRefs, requestedCount: diagnostics.discoveredFileRefs, loaded: preloadedRepoResult.records.length, records: preloadedRepoResult.records.map((record) => record.id).filter(Boolean), transportTier: preloadedRepoResult.transportTier || '', transportTiers: [preloadedRepoResult.transportTier || ''].filter(Boolean) });
        reportProgress(options, { phase: 'repo-discovery', percent: 34, total: preloadedRepoResult.records.length, label: `Loaded ${preloadedRepoResult.records.length} repo file${preloadedRepoResult.records.length === 1 ? '' : 's'} from ${preloadedRepoResult.transportTier || 'surface'} transport` });
      } else if (options.transportOrderExact === true && requestedRepoTransportTier(options) && requestedRepoTransportTier(options) !== 'direct') {
        repoDiscoveryHandledBySurfaceTransport = true;
        markSurface(sourcePlan, 'repoFiles', { failed: 1, unavailable: true, transportTier: preloadedRepoResult.transportTier || requestedRepoTransportTier(options), transportTiers: [preloadedRepoResult.transportTier || requestedRepoTransportTier(options)].filter(Boolean) });
      }
      if (!repoDiscoveryHandledBySurfaceTransport) try {
        reportProgress(options, { phase: 'repo-discovery', percent: 18, label: 'Resolving GitHub ref and scanning repo tree' });
        const discovered = await discoverGithubMarkdownRefs(source, Object.assign({}, options, { fetchImpl: transportFetchImpl }));
        const discoveredTargets = discovered.refs.map((ref, index) => fileTarget(ref, 'repoFiles', index, 'repo-markdown'));
        fileTargets = fileTargets.concat(discoveredTargets);
        resolvedRef = discovered.ref || resolvedRef;
        diagnostics.discoveredFileRefs = discovered.refs.length;
        markSurface(sourcePlan, 'repoFiles', { discovered: discovered.refs.length, requestedCount: discovered.refs.length });
        reportProgress(options, { phase: 'repo-discovery', percent: 34, total: discovered.refs.length, label: `Found ${discovered.refs.length} Markdown file${discovered.refs.length === 1 ? '' : 's'} under source roots` });
        diagnostics.treeUrl = discovered.treeUrl;
        diagnostics.resolvedBy = discovered.resolvedBy;
        if (discovered.governanceBoundary) diagnostics.governanceBoundary = discovered.governanceBoundary;
        warnings.push(...(discovered.warnings || []).map((warning) => Object.assign({ surface: 'repoFiles' }, warning)));
      } catch (error) {
        const warning = Object.assign({ surface: 'repoFiles' }, githubDiscoveryWarning(error));
        warnings.push(warning);
        diagnostics.transportEvents.push(Object.assign({ adapterId: GITHUB_ADAPTER_ID, sourceId: source?.id || '', resultKind: 'repo-discovery' }, warning));
        diagnostics.discoveryUnavailable = true;
        diagnostics.discoveryError = String(error && error.message ? error.message : error);
        markSurface(sourcePlan, 'repoFiles', { failed: 1, unavailable: true });
      }
    }
  }

  let issueSnapshotResult = { records: [], warnings: [], errors: [], counts: { targets: 0, records: 0, warnings: 0, errors: 0 } };
  if (input.issueDiscovery || input.issueUrls) {
    try {
      const issueSurface = await materializeGithubIssueSurface(source, input, Object.assign({}, options, { fetchImpl: transportFetchImpl, sourceFetchImpl: options.fetchImpl || (typeof fetch !== 'undefined' ? fetch : null), transportPlan: transportRuntime.plan, transportPolicy: policyInput, adapterId: GITHUB_ADAPTER_ID }));
      issueSnapshotResult = issueSurface;
      warnings.push(...(issueSurface.warnings || []));
      errors.push(...(issueSurface.errors || []));
      diagnostics.transportEvents.push(...(issueSurface.diagnostics?.transportEvents || []));
      Object.assign(diagnostics, issueSurface.diagnostics || {});
      markSurface(sourcePlan, 'issueSnapshots', issueSurface.surface || {});
    } catch (error) {
      const warning = nonFatalIssueSurfaceWarning(error, source);
      warnings.push(warning);
      diagnostics.issueSnapshotException = {
        schema: 'tiinex.github.issueSnapshot.exception.v1',
        message: warning.message,
        error: error?.message || String(error || '')
      };
      diagnostics.transportEvents.push(Object.assign({ resultKind: 'issue-surface-exception' }, warning));
      markSurface(sourcePlan, 'issueSnapshots', {
        attempted: true,
        requested: true,
        failed: 1,
        unavailable: true,
        error: warning.message
      });
    }
  }

  const uniqueTargets = uniqueFileTargets(fileTargets);
  if (uniqueTargets.length && !resolvedRef) {
    try {
      const resolved = await resolveGithubSourceRef(source, { fetchImpl: transportFetchImpl });
      resolvedRef = String(resolved.ref || '').trim();
      diagnostics.resolvedBy = resolved.resolvedBy || diagnostics.resolvedBy || 'github.repo.default_branch';
    } catch (error) {
      const warning = Object.assign({ surface: 'explicitFiles' }, githubDiscoveryWarning(error));
      warnings.push(warning);
      diagnostics.transportEvents.push(Object.assign({ adapterId: GITHUB_ADAPTER_ID, sourceId: source?.id || '', resultKind: 'ref-resolution' }, warning));
    }
  }
  const sourceForLoad = Object.assign({}, source, { ref: resolvedRef });
  if (uniqueTargets.length) reportProgress(options, { phase: 'raw-file-load', percent: 38, loaded: 0, total: uniqueTargets.length, label: `Starting GitHub Markdown load 0/${uniqueTargets.length}` });
  const authorization = policyInput ? authorizeSourceTransport({ kind: 'github.raw-file-load', sourceId: source?.id || '', adapterId: GITHUB_ADAPTER_ID, requestedRequests: uniqueTargets.length }, policyInput) : null;
  let result = { records: [], errors: [], okCount: 0, failCount: 0, diagnostics: { requests: 0, transportEvents: [] } };
  if (authorization && !authorization.allowed) {
    diagnostics.transportPolicy = authorization;
    for (const issue of authorization.findings || []) {
      warnings.push({ code: issue.code, severity: issue.severity || 'warning', surface: 'transport', message: issue.message, sourceId: issue.sourceId || source?.id || '', adapterId: GITHUB_ADAPTER_ID, retryable: issue.retryable === true });
      diagnostics.transportEvents.push({ code: issue.code, severity: issue.severity || 'warning', message: issue.message, sourceId: issue.sourceId || source?.id || '', adapterId: GITHUB_ADAPTER_ID, resultKind: 'transport-policy', retryable: issue.retryable === true });
    }
    for (const target of uniqueTargets) markSurface(sourcePlan, target.surface, { skipped: true, unavailable: true });
  } else {
    result = uniqueTargets.length ? await loadGithubFilesForSource(sourceForLoad, uniqueTargets, Object.assign({}, options, { fetchImpl: transportFetchImpl })) : result;
  }
  if (preloadedRepoResult.records?.length) {
    result = {
      records: (preloadedRepoResult.records || []).concat(result.records || []),
      errors: (preloadedRepoResult.errors || []).concat(result.errors || []),
      okCount: Number(preloadedRepoResult.records?.length || 0) + Number(result.okCount || 0),
      failCount: Number(preloadedRepoResult.errors?.length || 0) + Number(result.failCount || 0),
      diagnostics: {
        requests: Number(result.diagnostics?.requests || 0),
        transportEvents: (preloadedRepoResult.diagnostics?.transportEvents || []).concat(result.diagnostics?.transportEvents || [])
      }
    };
  }
  if (result.records?.length) {
    const repoRefs = result.records.filter((record) => record.sourceTarget?.surface === 'repoFiles').map((record) => record.sourceTarget?.sourceArtifactPath || record.sourceTarget?.inputTarget || '').filter(Boolean);
    await writeGithubRepoDiscoveryCache(sourceForLoad, repoRefs, options);
  }
  if (uniqueTargets.length || issueSnapshotResult.records?.length) reportProgress(options, { phase: 'source-promote', percent: 94, loaded: (result.okCount || 0) + (issueSnapshotResult.records?.length || 0), total: uniqueTargets.length + (issueSnapshotResult.counts?.targets || 0), label: `Promoting ${(result.okCount || 0) + (issueSnapshotResult.records?.length || 0)} source-backed records` });

  const surfaceCounts = summarizeSurfaceCountsFromTargets(result);
  for (const [surfaceName, counts] of Object.entries(surfaceCounts)) {
    const surface = markSurface(sourcePlan, surfaceName, { attempted: true });
    surface.loaded = Number(counts.loaded || 0);
    surface.failed = Number(counts.failed || 0);
    surface.records = counts.records || [];
    surface.transportTiers = Array.isArray(counts.transportTiers) ? counts.transportTiers.slice() : [];
  }

  diagnostics.requests = Number(result.diagnostics?.requests || 0);
  diagnostics.transportEvents = diagnostics.transportEvents.concat(transportRuntime.events || [], result.diagnostics?.transportEvents || []);
  diagnostics.transportTiers = summarizeTransportTiers(diagnostics.transportEvents);
  diagnostics.transportOutcome = summarizeTransportOutcome(diagnostics.transportEvents, transportRuntime.plan, options);
  const records = result.records.concat(issueSnapshotResult.records || []);
  if (!diagnostics.governanceBoundary) diagnostics.governanceBoundary = buildGovernanceBoundaryForSource(sourceForLoad, { records, rootChecked: false, discoveredFrom: 'loaded-source-material' });
  const governanceFinding = governanceFindingForBoundary(diagnostics.governanceBoundary);
  if (governanceFinding) warnings.push(Object.assign({ surface: 'governance' }, governanceFinding));
  diagnostics.recordAttribution = records.map((record) => ({
    recordId: record.id || '',
    path: record.path || '',
    surface: record.sourceTarget?.surface || 'unknown',
    targetKind: record.sourceTarget?.targetKind || '',
    inputTarget: record.sourceTarget?.inputTarget || '',
    transportTier: record.sourceTarget?.transportTier || ''
  }));
  diagnostics.sourcePlan = cloneSourcePlan(sourcePlan);
  diagnostics.surfaces = cloneSourcePlan(sourcePlan).surfaces;

  const assetReferenceDiscovery = collectSourceAssetReferences(records, { source: sourceForLoad });
  if (assetReferenceDiscovery.counts.total) {
    diagnostics.assetReferences = {
      schema: assetReferenceDiscovery.schema,
      counts: assetReferenceDiscovery.counts,
      references: assetReferenceDiscovery.references.slice(0, 25)
    };
    if (assetReferenceDiscovery.counts['referenced-unloaded']) warnings.push({ code: 'github.asset.referenced-unloaded', surface: 'assets', severity: 'info', message: `${assetReferenceDiscovery.counts['referenced-unloaded']} source asset reference(s) were found in Markdown but not fetched in this slice.` });
    if (assetReferenceDiscovery.counts.blocked) warnings.push({ code: 'github.asset.reference.blocked', surface: 'assets', severity: 'warning', message: `${assetReferenceDiscovery.counts.blocked} source asset reference(s) resolve outside the configured root boundary and were not fetched.` });
  }
  return makeAdapterResult({
    adapterId: GITHUB_ADAPTER_ID,
    sourceId: source?.id || '',
    records,
    errors: errors.concat(result.errors || []),
    warnings,
    okCount: (result.okCount || 0) + (issueSnapshotResult.records?.length || 0),
    failCount: errors.length + (result.failCount || 0),
    diagnostics: Object.assign(diagnostics, {
      fileRefs: uniqueTargets.length,
      resolvedRef
    })
  });
}


function nonFatalIssueSurfaceWarning(error, source = {}) {
  const message = error?.message || String(error || 'Issue snapshot reader failed');
  return {
    code: 'github.issue.surface.exception',
    severity: 'warning',
    surface: 'issueSnapshots',
    sourceId: source?.id || '',
    adapterId: GITHUB_ADAPTER_ID,
    retryable: true,
    message: `Issue snapshot discovery failed without invalidating the registered source boundary. Retry later or use explicit issue URLs. (${message})`
  };
}

export async function materializeGithubFiles(source, fileRefs = [], options = {}) {
  return materializeGithubSource(source, { fileRefs, repoDiscovery: false }, options);
}
