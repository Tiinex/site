import { authorizeSourceTransport } from '../../sources/transport.policy.js';
import { discoverGithubIssueSnapshotTargets, materializeGithubIssueSnapshotFixtures, materializeGithubIssueSnapshots, parseGithubIssueSnapshotTargets } from './github.issueSnapshot.js';

export async function materializeGithubIssueSurface(source = {}, input = {}, options = {}) {
  const adapterId = options.adapterId || 'github';
  const sourceId = source?.id || '';
  const fetchImpl = options.fetchImpl;
  const policyInput = options.transportPolicy || null;
  const warnings = [];
  const errors = [];
  const diagnostics = { transportEvents: [] };
  const surface = { attempted: true, requested: true, requestedCount: 0, discovered: 0, loaded: 0, failed: 0, records: [] };
  let result = { records: [], warnings: [], errors: [], counts: { targets: 0, records: 0, warnings: 0, errors: 0 } };
  let parsed = parseGithubIssueSnapshotTargets(input.issueUrls || []);
  progress(options, { phase: 'issue-snapshots', percent: 32, label: 'Discovering bounded GitHub issue snapshots' });

  if (!parsed.counts.targets && input.issueDiscovery) {
    const auth = policyInput ? authorizeSourceTransport({ kind: 'github.issue-discovery', sourceId, adapterId, requestedRequests: Number(options.maxIssues || 25) + 1 }, policyInput) : null;
    if (auth && !auth.allowed) {
      diagnostics.transportPolicy = auth;
      Object.assign(surface, { skipped: true, unavailable: true });
      for (const issue of auth.findings || []) {
        const warning = { code: issue.code, severity: issue.severity || 'warning', surface: 'issueSnapshots', message: issue.message, sourceId, adapterId, retryable: issue.retryable === true };
        warnings.push(warning);
        diagnostics.transportEvents.push(Object.assign({ resultKind: 'issue-discovery-policy' }, warning));
      }
    } else {
      const discovered = await discoverGithubIssueSnapshotTargets(source, Object.assign({}, options, { fetchImpl }));
      warnings.push(...(discovered.warnings || []).map((warning) => Object.assign({ surface: 'issueSnapshots' }, warning)));
      errors.push(...(discovered.errors || []).map((error) => Object.assign({ surface: 'issueSnapshots' }, error)));
      parsed = { targets: discovered.targets || [], errors: [], counts: { targets: discovered.targets?.length || 0, errors: 0 } };
      diagnostics.issueSnapshotDiscovery = { status: discovered.status, url: discovered.url || '', discovered: discovered.counts?.discovered || 0 };
      surface.discovered = parsed.counts.targets;
    }
  }

  diagnostics.issueSnapshotTargets = parsed.counts.targets;
  Object.assign(surface, { requestedCount: parsed.counts.targets, targets: parsed.counts.targets });
  if (parsed.errors.length) errors.push(...parsed.errors.map((entry) => Object.assign({ surface: 'issueSnapshots', ref: entry.ref }, entry)));

  const maxComments = Math.max(0, Math.min(100, Number(options.maxComments ?? 6)));
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
  } else if (options.issueSnapshotFixtures && parsed.counts.targets && input.issueUrls) result = materializeGithubIssueSnapshotFixtures(input.issueUrls || [], options.issueSnapshotFixtures);
  else if (parsed.counts.targets) result = await materializeGithubIssueSnapshots(parsed.targets, Object.assign({}, options, { fetchImpl, maxComments }));
  else if (!surface.skipped) {
    warnings.push({ code: 'github.issue.discovery.no-targets', severity: 'warning', surface: 'issueSnapshots', requested: true, attempted: true, unavailable: true, targetCount: 0, message: 'Issue snapshot discovery was selected, but no issue targets were discovered or provided.' });
    Object.assign(surface, { unavailable: true, skipped: true });
  }

  warnings.push(...(result.warnings || []).map((warning) => Object.assign({ surface: 'issueSnapshots' }, warning)));
  errors.push(...(result.errors || []).map((error) => Object.assign({ surface: 'issueSnapshots' }, error)));
  diagnostics.issueSnapshotRecords = result.records.length;
  Object.assign(surface, { loaded: result.records.length, failed: Math.max(0, Number(result.counts?.targets || 0) - Number(result.records.length || 0)), records: result.records.map((record) => record.id).filter(Boolean) });
  if (!result.records.length && parsed.counts.targets && !surface.skipped) surface.unavailable = true;
  for (const record of result.records || []) record.sourceTarget = Object.assign({ schema: 'tiinex.source.material.target.v1', surface: 'issueSnapshots', targetKind: 'github-issue-snapshot', loaded: true }, record.sourceTarget || {});
  return { records: result.records || [], warnings, errors, diagnostics, surface, counts: result.counts || {} };
}

function progress(options = {}, event = {}) {
  if (typeof options.onProgress === 'function') options.onProgress(event);
}
