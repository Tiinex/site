import { dedupePortableFindings, summarizePortableFindings } from './findings.js';

const PORTABLE_RESULT_SCHEMA_ID = 'tiinex.portable.operation.result.v1';

export function portableOperationResult(operation, payload = {}) {
  const findings = dedupePortableFindings(payload.findings || []);
  return Object.freeze({
    schema: PORTABLE_RESULT_SCHEMA_ID,
    operation,
    ...payload,
    findings,
    findingSummary: summarizePortableFindings(findings)
  });
}

export function normalizePortableSchemaIds(value) {
  const values = Array.isArray(value) ? value : [value];
  return [...new Set(values.map((item) => String(item || '').trim()).filter(Boolean))];
}

export function normalizePortableDepth(value, fallback = 16) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(1, Math.min(64, parsed));
}
