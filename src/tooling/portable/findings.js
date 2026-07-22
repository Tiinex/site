export const PORTABLE_FINDING_SOURCE = 'tiinex.portable.tooling.v1';

export function portableFinding(severity, code, message, extra = {}) {
  return Object.freeze({
    severity: normalizeSeverity(severity),
    code: String(code || 'portable.finding'),
    message: String(message || 'Portable tooling finding.'),
    source: String(extra.source || PORTABLE_FINDING_SOURCE),
    ...serializableExtra(extra)
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
    const key = [finding.severity, finding.code, finding.ref || '', finding.nodeId || '', finding.target || '', finding.message].join(':');
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
    if (key === 'severity' || key === 'code' || key === 'message' || key === 'source') continue;
    if (typeof value === 'function' || typeof value === 'undefined') continue;
    out[key] = value;
  }
  return out;
}
