import { authorizeSourceTransport } from '../../sources/transport.policy.js';
import { buildGithubTransportPlan, normalizeGithubTransportTier } from '../../sources/github/github.transport.js';
import { DEFAULT_ISSUE_SNAPSHOT_MAX_COMMENTS, discoverGithubIssueSnapshotTargets, materializeGithubIssueSnapshotFixtures, materializeGithubIssueSnapshots, parseGithubIssueSnapshotTargets } from './github.issueSnapshot.js';
import { discoverGithubIssueSnapshotTargetsViaHostedMirror, materializeGithubIssueSnapshotsViaHostedMirror } from './github.issueMirror.js';
import { directIssueDiscoveryUnavailable, issueApiFetchForTier, issueDirectFetchForTier, issueMirrorFetchForTier, materializeDirectIssueTargets } from './github.issueTransport.js';

const ISSUE_TRANSPORT_FALLBACKS = Object.freeze({
  default: Object.freeze(['cache', 'mirror', 'proxy', 'direct']),
  cache: Object.freeze(['cache', 'mirror', 'proxy', 'direct']),
  mirror: Object.freeze(['mirror', 'proxy', 'direct']),
  proxy: Object.freeze(['proxy']),
  direct: Object.freeze(['direct'])
});

export async function materializeGithubIssueSurface(source = {}, input = {}, options = {}) {
  const adapterId = options.adapterId || 'github';
  const sourceId = source?.id || '';
  const fetchImpl = options.fetchImpl;
  const policyInput = options.transportPolicy || null;
  const warnings = [];
  const errors = [];
  const diagnostics = { transportEvents: [] };
  const requestedTier = requestedIssueTransportTier(options);
  const issueTiers = issueTransportFallbackTiers(requestedTier, options);
  const sourceFetchImpl = options.sourceFetchImpl || (typeof fetch !== 'undefined' ? fetch : null);
  const surface = { attempted: true, requested: true, requestedCount: 0, discovered: 0, loaded: 0, failed: 0, records: [] };
  let result = { records: [], warnings: [], errors: [], counts: { targets: 0, records: 0, warnings: 0, errors: 0 } };
  const explicitParsed = parseGithubIssueSnapshotTargets(input.issueUrls || []);
  let parsed = explicitParsed;
  progress(options, { phase: 'issue-snapshots', percent: 32, label: input.issueDiscovery ? 'Discovering bounded GitHub issue snapshots' : 'Loading explicit GitHub issue targets' });

  if (input.issueDiscovery) {
    const auth = policyInput ? authorizeSourceTransport({ kind: 'github.issue-discovery', sourceId, adapterId, requestedRequests: Number(options.maxIssues || 25) + 1 }, policyInput) : null;
    if (auth && !auth.allowed) {
      diagnostics.transportPolicy = auth;
      Object.assign(surface, explicitParsed.counts.targets ? { discoveryUnavailable: true } : { skipped: true, unavailable: true });
      for (const issue of auth.findings || []) {
        const warning = { code: issue.code, severity: issue.severity || 'warning', surface: 'issueSnapshots', message: issue.message, sourceId, adapterId, retryable: issue.retryable === true };
        warnings.push(warning);
        diagnostics.transportEvents.push(Object.assign({ resultKind: 'issue-discovery-policy' }, warning));
      }
    } else {
      const discovered = await discoverIssueTargetsForTiers(source, Object.assign({}, options, { fetchImpl, sourceFetchImpl }), issueTiers, diagnostics);
      warnings.push(...(discovered.warnings || []).map((warning) => Object.assign({ surface: 'issueSnapshots' }, warning)));
      errors.push(...(discovered.errors || []).map((error) => Object.assign({ surface: 'issueSnapshots' }, error)));
      const unionTargets = uniqueIssueTargets((discovered.targets || []).concat(explicitParsed.targets || []));
      parsed = { targets: unionTargets, errors: explicitParsed.errors || [], counts: { targets: unionTargets.length, errors: Number(explicitParsed.counts?.errors || 0) } };
      diagnostics.issueSnapshotDiscovery = { status: discovered.status, url: discovered.url || '', discovered: discovered.counts?.discovered || 0, explicitTargets: Number(explicitParsed.counts?.targets || 0), unionTargets: unionTargets.length, transportTier: discovered.transportTier || '' };
      surface.discovered = Number(discovered.counts?.discovered || 0);
    }
  }

  diagnostics.issueSnapshotTargets = parsed.counts.targets;
  Object.assign(surface, { requestedCount: parsed.counts.targets, targets: parsed.counts.targets });
  if (parsed.errors.length) errors.push(...parsed.errors.map((entry) => Object.assign({ surface: 'issueSnapshots', ref: entry.ref }, entry)));

  const maxComments = Math.max(0, Math.min(100, Number(options.maxComments ?? DEFAULT_ISSUE_SNAPSHOT_MAX_COMMENTS)));
  const materializationAuth = policyInput && parsed.counts.targets && !surface.skipped
    ? authorizeSourceTransport({ kind: 'github.issue-snapshot-load', sourceId, adapterId, requestedRequests: Number(parsed.counts.targets || 0) * (maxComments > 0 ? 2 : 1) }, policyInput)
    : null;
  if (materializationAuth && !materializationAuth.allowed) {
    diagnostics.transportPolicy = materializationAuth;
    Object.assign(surface, { skipped: true, unavailable: true });
    for (const issue of materializationAuth.findings || []) {
      const warning = { code: issue.code, severity: issue.severity || 'warning', surface: 'issueSnapshots', message: issue.message, sourceId, adapterId, retryable: issue.retryable === true };
      warnings.push(warning);
      diagnostics.transportEvents.push(Object.assign({ resultKind: 'issue-snapshot-load-policy' }, warning));
    }
  } else if (options.issueSnapshotFixtures && parsed.counts.targets && input.issueUrls && !input.issueDiscovery) result = materializeGithubIssueSnapshotFixtures(input.issueUrls || [], options.issueSnapshotFixtures);
  else if (parsed.counts.targets) result = await materializeIssueTargetsForTiers(parsed.targets, source, Object.assign({}, options, { fetchImpl, sourceFetchImpl, maxComments }), issueTiers, diagnostics);
  else if (!surface.skipped) {
    warnings.push({ code: 'github.issue.discovery.no-targets', severity: 'warning', surface: 'issueSnapshots', requested: true, attempted: true, unavailable: true, targetCount: 0, message: 'Issue snapshot discovery was selected, but no issue targets were discovered or provided.' });
    Object.assign(surface, { unavailable: true, skipped: true });
  }

  warnings.push(...(result.warnings || []).map((warning) => Object.assign({ surface: 'issueSnapshots' }, warning)));
  errors.push(...(result.errors || []).map((error) => Object.assign({ surface: 'issueSnapshots' }, error)));
  diagnostics.issueSnapshotRecords = result.records.length;
  diagnostics.issueSnapshotTargetResults = Array.isArray(result.targetResults) ? result.targetResults : [];
  diagnostics.issueSnapshotMaterialization = {
    targets: Number(result.counts?.targets || 0),
    records: Number(result.records?.length || 0),
    loadedTargets: Number(result.counts?.loadedTargets || 0),
    failedTargets: Number(result.counts?.failedTargets || 0),
    deferredTargets: Number(result.counts?.deferredTargets || 0),
    warnings: Number(result.counts?.warnings || 0),
    errors: Number(result.counts?.errors || 0)
  };
  Object.assign(surface, {
    loaded: result.records.length,
    loadedTargets: Number(result.counts?.loadedTargets || 0),
    failed: Number(result.counts?.failedTargets ?? Math.max(0, Number(result.counts?.targets || 0) - Number(result.records.length || 0))),
    deferred: Number(result.counts?.deferredTargets || 0),
    records: result.records.map((record) => record.id).filter(Boolean),
    transportTier: result.transportTier || '',
    attemptedTiers: issueTiers.slice()
  });
  if (!result.records.length && parsed.counts.targets && !surface.skipped) surface.unavailable = true;
  for (const record of result.records || []) record.sourceTarget = Object.assign({ schema: 'tiinex.source.material.target.v1', surface: 'issueSnapshots', targetKind: 'github-issue-snapshot', loaded: true }, record.sourceTarget || {});
  return { records: result.records || [], warnings, errors, diagnostics, surface, counts: result.counts || {} };
}



function uniqueIssueTargets(targets = []) {
  const seen = new Set();
  const out = [];
  for (const target of Array.isArray(targets) ? targets : []) {
    const key = String(target?.canonicalUrl || target?.issueCanonicalUrl || target?.input || '').trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key); out.push(target);
  }
  return out;
}

function issueTransportFallbackTiers(tier = '', options = {}) {
  const normalized = normalizeGithubTransportTier(tier);
  const tiers = Array.from(normalized ? (ISSUE_TRANSPORT_FALLBACKS[normalized] || [normalized]) : ISSUE_TRANSPORT_FALLBACKS.default);
  if (options.allowCache === false && normalized !== 'cache') return tiers.filter((candidate) => candidate !== 'cache');
  return tiers;
}

async function discoverIssueTargetsForTiers(source = {}, options = {}, tiers = [''], diagnostics = {}) {
  let last = null;
  for (let index = 0; index < tiers.length; index += 1) {
    const tier = tiers[index];
    const discovered = tier === 'cache'
      ? await discoverGithubIssueSnapshotTargetsViaHostedMirror(source, Object.assign({}, options, { fetchImpl: issueMirrorFetchForTier(source, tier, options.sourceFetchImpl, diagnostics), cacheMode: 'cache-only', transportTier: 'cache', onTransportEvent: pushIssueTransportEvent(diagnostics, source, tier) }))
      : tier === 'mirror'
        ? await discoverGithubIssueSnapshotTargetsViaHostedMirror(source, Object.assign({}, options, { fetchImpl: issueMirrorFetchForTier(source, tier, options.sourceFetchImpl, diagnostics), cacheMode: 'refresh', transportTier: 'mirror', onTransportEvent: pushIssueTransportEvent(diagnostics, source, tier) }))
      : tier === 'proxy'
        ? await discoverGithubIssueSnapshotTargets(source, Object.assign({}, options, { fetchImpl: issueApiFetchForTier(source, tier, options.sourceFetchImpl, diagnostics, options) }))
        : directIssueDiscoveryUnavailable(source, diagnostics);
    last = Object.assign({ transportTier: tier }, discovered || {});
    if (Array.isArray(last.targets) && last.targets.length) return last;
    if (last.status === 'ready' && tier !== 'mirror') return last;
    const nextTier = tiers[index + 1] || '';
    if (nextTier) emitIssueFallback(diagnostics, source, tier, nextTier, 'discovery');
  }
  return last || { schema: 'tiinex.github.issueSnapshot.discovery.v1', status: 'unavailable', targets: [], warnings: [], errors: [], counts: { discovered: 0, targets: 0, warnings: 0, errors: 0 }, transportTier: '' };
}

async function materializeIssueTargetsForTiers(targets = [], source = {}, options = {}, tiers = [''], diagnostics = {}) {
  let last = null;
  for (let index = 0; index < tiers.length; index += 1) {
    const tier = tiers[index];
    const result = tier === 'cache'
      ? await materializeGithubIssueSnapshotsViaHostedMirror(targets, Object.assign({}, options, { fetchImpl: issueMirrorFetchForTier(source, tier, options.sourceFetchImpl, diagnostics), cacheMode: 'cache-only', transportTier: 'cache', onTransportEvent: pushIssueTransportEvent(diagnostics, source, tier) }))
      : tier === 'mirror'
        ? await materializeGithubIssueSnapshotsViaHostedMirror(targets, Object.assign({}, options, { fetchImpl: issueMirrorFetchForTier(source, tier, options.sourceFetchImpl, diagnostics), cacheMode: 'refresh', transportTier: 'mirror', onTransportEvent: pushIssueTransportEvent(diagnostics, source, tier) }))
      : tier === 'proxy'
        ? await materializeGithubIssueSnapshots(targets, Object.assign({}, options, { fetchImpl: issueApiFetchForTier(source, tier, options.sourceFetchImpl, diagnostics, options), maxComments: options.maxComments }))
        : await materializeDirectIssueTargets(targets, source, Object.assign({}, options, { fetchImpl: issueDirectFetchForTier(source, options.sourceFetchImpl, diagnostics) }), diagnostics);
    last = Object.assign({ transportTier: tier }, result || {});
    if (Array.isArray(last.records) && last.records.length) return last;
    const nextTier = tiers[index + 1] || '';
    if (nextTier) emitIssueFallback(diagnostics, source, tier, nextTier, 'materialization');
    else return last;
  }
  return last || { records: [], warnings: [], errors: [], counts: { targets: 0, records: 0, warnings: 0, errors: 0 }, targetResults: [] };
}

function emitIssueFallback(diagnostics = {}, source = {}, fromTier = '', toTier = '', phase = '') {
  diagnostics.transportEvents?.push?.({
    adapterId: 'github',
    sourceId: source?.id || '',
    repo: source?.repo || source?.repository || '',
    tier: fromTier,
    resource: 'api-json',
    code: 'github.issue.transport.surface-fallback',
    severity: 'info',
    phase,
    message: `Issue snapshots skipped ${fromTier} and tried ${toTier} because the selected transport did not materialize this surface.`
  });
}

function requestedIssueTransportTier(options = {}) {
  const fromOrder = options.transportOrderExact === true && Array.isArray(options.preferredTransports) ? options.preferredTransports[0] : '';
  return normalizeGithubTransportTier(options.transportRefreshTier || options.transportPolicy?.requestedTier || fromOrder || '');
}

function pushIssueTransportEvent(diagnostics = {}, source = {}, tier = '') {
  return (event = {}) => diagnostics.transportEvents?.push?.(Object.assign({ adapterId: 'github', sourceId: source?.id || '', repo: source?.repo || source?.repository || '', tier: tier || event.tier || '', resource: 'api-json' }, event));
}

function progress(options = {}, event = {}) {
  if (typeof options.onProgress === 'function') options.onProgress(event);
}
