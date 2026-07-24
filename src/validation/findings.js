import { resolveSchemaModule } from '../schemas/resolver.js';

export const FINDING_ENVELOPE_SCHEMA_ID = 'tiinex.validation.finding.v1';

export function normalizeFinding(finding = {}, options = {}) {
  const code = String(finding.code || options.code || 'validation.finding').trim();
  const source = String(finding.source || options.source || sourceFromCode(code)).trim();
  const registryEntry = resolveFindingDefinition(code, { source, schemaId: options.schemaId });
  const severity = String(finding.severity || registryEntry?.severity || options.severity || 'info').trim();
  const messageKey = String(finding.messageKey || registryEntry?.messageKey || code).trim();
  const fixability = finding.fixability || registryEntry?.fixability || (registryEntry?.safeFix === true ? 'safe' : registryEntry?.safeFix === false ? 'none' : 'unknown');
  return Object.freeze({
    schema: FINDING_ENVELOPE_SCHEMA_ID,
    severity,
    code,
    messageKey,
    message: String(finding.message || registryEntry?.fallbackMessage || fallbackMessageFor(code)).trim(),
    source,
    fixability,
    params: Object.freeze(Object.assign({}, registryEntry?.params || {}, finding.params || options.params || {})),
    evidencePath: finding.evidencePath || finding.path || '',
    qualification: finding.qualification || options.qualification || ''
  });
}

export function normalizeFindings(findings = [], options = {}) {
  const list = Array.isArray(findings) ? findings : Array.isArray(findings?.findings) ? findings.findings : [];
  return list.map((finding) => normalizeFinding(finding, options));
}

export function resolveFindingDefinition(code = '', options = {}) {
  const source = String(options.source || sourceFromCode(code) || '').trim();
  const candidates = [];
  if (options.schemaId) candidates.push(options.schemaId);
  if (source && source.startsWith('tiinex.')) candidates.push(source);
  const codePrefix = schemaIdFromFindingCode(code);
  if (codePrefix) candidates.push(codePrefix);
  for (const schemaId of [...new Set(candidates.filter(Boolean))]) {
    const resolution = resolveSchemaModule({ schemaId });
    const findings = resolution.module?.findings;
    const exact = findDefinition(findings, code);
    if (exact) return exact;
  }
  const root = resolveSchemaModule({ schemaId: 'tiinex.root.v1' }).module?.findings;
  return findDefinition(root, code) || null;
}

function findDefinition(findings = {}, code = '') {
  if (!findings) return null;
  if (findings.codes && findings.codes[code]) return findings.codes[code];
  if (findings[code]) return findings[code];
  return null;
}

function schemaIdFromFindingCode(code = '') {
  const text = String(code || '');
  const parts = text.split('.');
  if (parts[0] === 'tiinex' && parts.length >= 4) return parts.slice(0, 4).join('.');
  return '';
}

function sourceFromCode(code = '') {
  const text = String(code || '');
  if (text.startsWith('root.')) return 'tiinex.root.v1';
  if (text.startsWith('topic.')) return 'tiinex.topic.v1';
  if (text.startsWith('evidence.')) return 'tiinex.evidence.v1';
  if (text.startsWith('preservation.')) return 'tiinex.preservation.v1';
  if (text.startsWith('workspace.')) return 'tiinex.workspace.v1';
  if (text.startsWith('integrity.')) return 'tiinex.integrity.validation.v1';
  if (text.startsWith('audit.')) return 'tiinex.audit.v1';
  return 'tiinex.validation.v1';
}

function fallbackMessageFor(code = '') {
  return code ? `Validation finding: ${code}` : 'Validation finding.';
}
