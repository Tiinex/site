import { LineageResolutionStatus } from './lineage.model.js';
import { canonicalPath, canonicalToken, provenanceTargetKeysForValue } from './lineage.targetKeys.js';

export function verifiedIntegrityMatch(match = null) {
  if (!match || match.ambiguous || match.selfReference || match.blocked) return match;
  return Object.assign({}, match, {
    status: LineageResolutionStatus.verified,
    diagnostics: [lineageDiagnostic('integrity.verified', 'Loaded parent self-integrity matches the child declaration.', { basis: 'checksum' })]
  });
}

export function withParentIntegrityStatus(match = null, expectedIntegrityValues = []) {
  if (!match || !Array.isArray(expectedIntegrityValues) || !expectedIntegrityValues.length) return match;
  if (match.ambiguous || match.selfReference || match.blocked) return match;
  if (match.status === LineageResolutionStatus.verified || match.status === LineageResolutionStatus.mismatch || match.status === LineageResolutionStatus.probable) return match;
  const expected = expectedIntegrityValues.map(canonicalIntegrityValue).filter(Boolean);
  const actual = selfIntegrityValuesForNode(match);
  if (!actual.length) {
    return Object.assign({}, match, {
      status: LineageResolutionStatus.probable,
      diagnostics: [lineageDiagnostic('integrity.unavailable', 'Declared parent found, but loaded parent has no self-integrity value to verify against.', { basis: match.method || '' })]
    });
  }
  const matched = expected.some((value) => actual.includes(value));
  if (matched) {
    return Object.assign({}, match, {
      status: LineageResolutionStatus.verified,
      diagnostics: [lineageDiagnostic('integrity.verified', 'Declared parent found and self-integrity matches the child declaration.', { basis: match.method || '' })]
    });
  }
  return Object.assign({}, match, {
    status: LineageResolutionStatus.mismatch,
    diagnostics: [lineageDiagnostic('integrity.mismatch', 'Declared parent found, but loaded parent self-integrity does not match the child declaration.', { basis: match.method || '', expected: expected.join(', '), actual: actual.join(', ') })]
  });
}

export function parentIntegrityValuesForTarget(node = {}, target = '') {
  const targetKeys = lineageTargetComparisonKeys(target);
  if (!targetKeys.length) return [];
  const entries = integrityEntriesForNode(node);
  const values = [];
  for (const entry of entries) {
    const towards = String(entry.towards || '').trim();
    if (!towards || /^self$/i.test(towards)) continue;
    const entryKeys = lineageTargetComparisonKeys(towards);
    if (!entryKeys.some((key) => targetKeys.includes(key))) continue;
    const value = canonicalIntegrityValue(entry.value);
    if (value) values.push(value);
  }
  return Array.from(new Set(values));
}

export function selfIntegrityValuesForNode(node = {}) {
  const entries = integrityEntriesForNode(node);
  return Array.from(new Set(entries
    .filter((entry) => /^self$/i.test(String(entry.towards || '').trim()))
    .map((entry) => canonicalIntegrityValue(entry.value))
    .filter(Boolean)));
}

function integrityEntriesForNode(node = {}) {
  const record = node?.record || node || {};
  const entries = Array.isArray(record.integrity?.entries) ? record.integrity.entries : [];
  if (entries.length) return entries;
  return parseIntegrityEntriesFromMarkdown(record.markdown || '');
}

function parseIntegrityEntriesFromMarkdown(markdown = '') {
  const text = String(markdown || '');
  const start = text.search(/^#\s+Continuity Integrity\s*$/im);
  if (start === -1) return [];
  const lines = text.slice(start).split('\n');
  const entries = [];
  let current = null;
  const flush = () => {
    if (!current) return;
    const method = current.fields.Method || current.label || '';
    entries.push({
      method: stripMarkdown(method),
      towards: normalizeIntegrityField(current.fields.Towards || ''),
      value: stripMarkdown(current.fields.Value || ''),
      raw: current.lines.join('\n')
    });
    current = null;
  };
  for (const line of lines) {
    const top = line.match(/^-\s+(.+?)\s*$/);
    if (top) {
      flush();
      current = { label: top[1].trim(), fields: {}, lines: [line] };
      continue;
    }
    if (!current) continue;
    current.lines.push(line);
    const field = line.match(/^\s+-\s*([A-Za-z][A-Za-z0-9 _+-]{0,40}):\s*(.+?)\s*$/);
    if (field) current.fields[field[1].trim()] = field[2].trim();
  }
  flush();
  return entries.filter((entry) => entry.method || entry.towards || entry.value);
}

function lineageTargetComparisonKeys(value = '') {
  const raw = String(value || '').trim();
  const keys = [];
  const add = (item = '') => {
    const clean = String(item || '').trim().toLowerCase();
    if (clean && !keys.includes(clean)) keys.push(clean);
  };
  add(canonicalToken(raw));
  add(canonicalPath(raw));
  for (const key of provenanceTargetKeysForValue(raw)) add(key);
  return keys.filter(Boolean);
}

export function canonicalIntegrityValue(value = '') {
  return String(value || '').trim();
}

function normalizeIntegrityField(value = '') {
  const raw = String(value || '').trim();
  const link = raw.match(/^\[([^\]]*)\]\(([^)]+)\)$/);
  if (link) return String(link[2] || link[1] || '').trim();
  return stripMarkdown(raw);
}

function stripMarkdown(value = '') {
  return String(value || '').replace(/^\[([^\]]+)\]\([^)]+\)$/, '$1').trim();
}

function lineageDiagnostic(code, message, extra = {}) {
  return Object.freeze(Object.assign({ code, message }, extra || {}));
}

