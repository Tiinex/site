import { normalizeFinding as normalizeSharedFinding } from '../../validation/findings.js';

export const PORTABLE_FINDING_SOURCE = 'tiinex.portable.tooling.v1';
export const PORTABLE_FINDING_ENVELOPE_SCHEMA_ID = 'tiinex.validation.finding.v1';

export function portableFinding(severity, code, message, extra = {}) {
  const metadata = serializableExtra(extra);
  const normalized = normalizeSharedFinding({
    severity: normalizeSeverity(severity),
    code: String(code || 'portable.finding'),
    messageKey: String(extra.messageKey || code || 'portable.finding'),
    message: String(message || 'Portable tooling finding.'),
    source: String(extra.source || PORTABLE_FINDING_SOURCE),
    fixability: extra.fixability,
    params: extra.params,
    evidencePath: extra.evidencePath || extra.ref || '',
    qualification: extra.qualification || ''
  }, { schemaId: extra.schemaId || '' });
  return Object.freeze({
    ...normalized,
    ...metadata,
    schema: PORTABLE_FINDING_ENVELOPE_SCHEMA_ID
  });
}

export function normalizePortableFinding(finding = {}, fallback = {}) {
  return portableFinding(
    finding.severity || fallback.severity || 'info',
    finding.code || fallback.code || 'portable.finding',
    finding.message || fallback.message || 'Portable tooling finding.',
    { ...fallback, ...finding }
  );
}

export function dedupePortableFindings(findings = []) {
  const seen = new Set();
  const out = [];
  for (const raw of Array.isArray(findings) ? findings : []) {
    const finding = normalizePortableFinding(raw);
    const key = [
      finding.code,
      finding.source || '',
      finding.evidencePath || finding.ref || '',
      finding.nodeId || '',
      finding.target || '',
      stableParams(finding.params)
    ].join(':');
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(finding);
  }
  return Object.freeze(out);
}

export function summarizePortableFindings(findings = []) {
  const normalized = dedupePortableFindings(findings);
  const counts = { error: 0, warning: 0, info: 0 };
  for (const finding of normalized) counts[normalizeSeverity(finding.severity)] += 1;
  return Object.freeze({
    status: counts.error ? 'invalid' : counts.warning ? 'degraded' : 'clean',
    counts: Object.freeze({ ...counts, total: normalized.length })
  });
}

function normalizeSeverity(value = '') {
  const severity = String(value || '').toLowerCase();
  if (severity === 'error' || severity === 'warning') return severity;
  return 'info';
}

function serializableExtra(extra = {}) {
  const out = {};
  for (const [key, value] of Object.entries(extra || {})) {
    if (['schema', 'severity', 'code', 'messageKey', 'message', 'source', 'fixability', 'params', 'evidencePath', 'qualification'].includes(key)) continue;
    if (typeof value === 'function' || typeof value === 'undefined') continue;
    out[key] = value;
  }
  return out;
}

function stableParams(value = {}) {
  if (!value || typeof value !== 'object') return '';
  return JSON.stringify(sortValue(value));
}

function sortValue(value) {
  if (Array.isArray(value)) return value.map(sortValue);
  if (!value || typeof value !== 'object') return value;
  const out = {};
  for (const key of Object.keys(value).sort()) out[key] = sortValue(value[key]);
  return out;
}
