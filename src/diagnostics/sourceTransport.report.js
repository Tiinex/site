export const SOURCE_TRANSPORT_REPORT_SCHEMA_ID = 'tiinex.sourceTransport.report.v1';

export function buildSourceTransportReport(workspace = {}, input = {}) {
  const sources = Array.isArray(input.sources) ? input.sources : (Array.isArray(workspace.sources) ? workspace.sources : []);
  const importResults = Array.isArray(input.importResults) ? input.importResults : (Array.isArray(workspace.importResults) ? workspace.importResults : []);
  const adapterResults = Array.isArray(input.adapterResults) ? input.adapterResults : [];
  const rawEvents = [
    ...sources.flatMap((source) => sourceRegistrationEvents(source)),
    ...importResults.flatMap((result, index) => eventsFromResult(result, { resultKind: 'workspace-import-result', resultIndex: index })),
    ...adapterResults.flatMap((result, index) => eventsFromResult(result, { resultKind: 'adapter-result', resultIndex: index }))
  ];
  const events = dedupeEvents(rawEvents.map(normalizeTransportEvent).filter(Boolean));
  const errors = events.filter((event) => event.severity === 'error').length;
  const warnings = events.filter((event) => event.severity === 'warning').length;
  const degraded = events.filter((event) => event.status === 'degraded').length;
  const blocked = events.filter((event) => event.status === 'blocked').length;
  const rateLimited = events.filter((event) => event.classification === 'rate-limited-or-forbidden').length;
  const unavailable = events.filter((event) => event.classification === 'unavailable' || event.classification === 'network-error').length;
  const notFound = events.filter((event) => event.classification === 'not-found').length;
  const retryable = events.filter((event) => event.retryable === true).length;
  const rawDiagnostics = importResults.concat(adapterResults).map((result) => result?.diagnostics || {});
  const requestCount = rawDiagnostics.reduce((sum, diagnostics) => sum + numberField(diagnostics, ['requests', 'requestCount', 'fetchRequests', 'fileRefs', 'explicitFileRefs', 'discoveredFileRefs']), 0);
  const cacheHits = rawDiagnostics.reduce((sum, diagnostics) => sum + numberField(diagnostics, ['cacheHits', 'cacheHitCount']), 0);
  const cacheMisses = rawDiagnostics.reduce((sum, diagnostics) => sum + numberField(diagnostics, ['cacheMisses', 'cacheMissCount']), 0);

  return Object.freeze({
    schema: SOURCE_TRANSPORT_REPORT_SCHEMA_ID,
    workspaceId: workspace.id || '',
    status: errors || blocked ? 'blocked' : warnings || degraded || rateLimited || unavailable || notFound ? 'degraded' : 'clean',
    boundary: 'Transport diagnostics are observation-only. They may classify source availability, rate limits, cache hints, and retryability, but must not infer provenance or trigger hidden fetches.',
    counts: Object.freeze({
      sources: sources.length,
      importResults: importResults.length,
      adapterResults: adapterResults.length,
      events: events.length,
      requests: requestCount,
      cacheHits,
      cacheMisses,
      rateLimited,
      unavailable,
      notFound,
      retryable,
      errors,
      warnings
    }),
    events: Object.freeze(events),
    nextActions: Object.freeze(nextActionsFor(events))
  });
}

export function normalizeTransportEvent(input = {}) {
  if (!input) return null;
  const code = String(input.code || input.error || input.type || input.message || 'transport.event').trim();
  const message = String(input.message || input.error || code || 'Transport event').trim();
  const statusCode = Number(input.status || input.httpStatus || parseStatus(message) || 0) || 0;
  const classification = classifyTransportIssue(Object.assign({}, input, { code, message, status: statusCode || input.status }));
  const severity = normalizeSeverity(input.severity, classification);
  return Object.freeze({
    schema: 'tiinex.sourceTransport.event.v1',
    sourceId: input.sourceId || input.source?.id || '',
    adapterId: input.adapterId || input.source?.adapterId || input.diagnostics?.adapterId || '',
    resultKind: input.resultKind || '',
    resultIndex: Number.isFinite(Number(input.resultIndex)) ? Number(input.resultIndex) : null,
    severity,
    status: severity === 'error' ? 'blocked' : classification === 'clean' ? 'clean' : 'degraded',
    code,
    message,
    classification,
    retryable: retryableFor(classification, statusCode),
    statusCode,
    url: input.url || input.diagnostics?.url || input.diagnostics?.treeUrl || '',
    ref: input.ref || input.path || '',
    cache: normalizeCache(input)
  });
}

export function classifyTransportIssue(input = {}) {
  const code = String(input.code || input.error || '').toLowerCase();
  const message = String(input.message || input.error || '').toLowerCase();
  const status = Number(input.status || input.statusCode || parseStatus(message) || 0) || 0;
  if (!code && !message && !status) return 'clean';
  if (status === 403 || code.includes('rate-limit') || code.includes('forbidden') || message.includes('rate limit') || message.includes('forbidden')) return 'rate-limited-or-forbidden';
  if (status === 404 || code.includes('not-found') || message.includes('not found')) return 'not-found';
  if (status === 401 || status === 422 || code.includes('permission') || code.includes('auth')) return 'permission-or-auth';
  if (status >= 500 || code.includes('network') || code.includes('fetch') || message.includes('failed to fetch') || message.includes('network')) return 'network-error';
  if (code.includes('unavailable') || message.includes('unavailable') || code.includes('deferred')) return 'unavailable';
  if (code.includes('cache')) return 'cache';
  if (code.includes('source.github.ref.unpinned') || code.includes('ref.unpinned')) return 'unpinned-source';
  if (code.includes('blocked')) return 'blocked';
  return status >= 400 ? 'transport-error' : 'degraded';
}

function eventsFromResult(result = {}, context = {}) {
  const diagnostics = result?.diagnostics || {};
  const events = [];
  const base = {
    sourceId: result.sourceId || diagnostics.sourceId || '',
    adapterId: result.adapterId || diagnostics.adapterId || '',
    resultKind: context.resultKind || '',
    resultIndex: context.resultIndex,
    diagnostics
  };
  for (const warning of Array.isArray(result.warnings) ? result.warnings : []) {
    events.push(Object.assign({}, base, warning, { severity: warning.severity || 'warning' }));
  }
  for (const error of Array.isArray(result.errors) ? result.errors : []) {
    events.push(Object.assign({}, base, error, { severity: error.severity || 'error' }));
  }
  if (Array.isArray(diagnostics.transportEvents)) {
    for (const event of diagnostics.transportEvents) events.push(Object.assign({}, base, event));
  }
  if (diagnostics.discoveryUnavailable) {
    events.push(Object.assign({}, base, {
      severity: 'warning',
      code: 'transport.discovery.unavailable',
      message: diagnostics.discoveryError || 'Source discovery unavailable.',
      url: diagnostics.treeUrl || ''
    }));
  }
  return events;
}

function sourceRegistrationEvents(source = {}) {
  const adapterId = String(source.adapterId || '').trim();
  if (!adapterId || adapterId === 'local') return [];
  if (adapterId === 'github') {
    const events = [];
    if (!String(source.ref || source.resolvedRef || source.config?.ref || '').trim()) {
      events.push({ sourceId: source.id || '', adapterId, severity: 'warning', code: 'source.github.ref.unpinned', message: 'GitHub source has no pinned/resolved ref; source transport and re-ingest remain degraded.' });
    }
    return events;
  }
  return [{ sourceId: source.id || '', adapterId, severity: 'info', code: 'source.transport.explicit-adapter', message: `Source uses explicit ${adapterId} transport boundary.` }];
}

function normalizeSeverity(severity, classification) {
  const raw = String(severity || '').toLowerCase();
  if (raw === 'error' || raw === 'warning' || raw === 'info') return raw;
  if (classification === 'blocked' || classification === 'permission-or-auth' || classification === 'transport-error') return 'error';
  if (classification === 'clean') return 'info';
  return 'warning';
}

function retryableFor(classification, statusCode) {
  if (classification === 'rate-limited-or-forbidden') return true;
  if (classification === 'network-error') return true;
  if (statusCode >= 500) return true;
  return false;
}

function normalizeCache(input = {}) {
  const cacheState = input.cacheState || input.diagnostics?.cacheState || '';
  const cacheHit = input.cacheHit === true || input.diagnostics?.cacheHit === true;
  if (!cacheState && !cacheHit) return Object.freeze({ state: 'unknown', hit: false });
  return Object.freeze({ state: cacheState || (cacheHit ? 'hit' : 'unknown'), hit: cacheHit });
}

function parseStatus(value = '') {
  const match = String(value || '').match(/\b(40[134]|404|429|5\d\d)\b/);
  return match ? Number(match[1]) : 0;
}

function numberField(diagnostics = {}, keys = []) {
  for (const key of keys) {
    const value = Number(diagnostics?.[key] || 0);
    if (Number.isFinite(value) && value > 0) return value;
  }
  return 0;
}

function dedupeEvents(events = []) {
  const seen = new Set();
  const out = [];
  for (const event of events) {
    const key = [event.adapterId, event.sourceId, event.code, event.ref, event.url, event.statusCode].join('|');
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(event);
  }
  return out;
}

function nextActionsFor(events = []) {
  const actions = [];
  if (events.some((event) => event.classification === 'rate-limited-or-forbidden')) actions.push('Retry later, reduce discovery scope, or use explicit file refs/raw URLs.');
  if (events.some((event) => event.classification === 'not-found')) actions.push('Verify repo/ref/path or replace with an explicit reachable target.');
  if (events.some((event) => event.classification === 'unpinned-source')) actions.push('Pin or resolve source refs before publish/re-ingest/export review.');
  if (events.some((event) => event.classification === 'network-error')) actions.push('Keep loaded local/session material; retry network transport when available.');
  return actions;
}
