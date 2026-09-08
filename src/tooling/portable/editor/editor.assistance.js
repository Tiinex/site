import { auditPortableRecord } from '../audit/audit.capability.js';
import { C14N_V2_METHOD_ID, canonicalC14nV2SelfState, sealC14nV2Self } from '../../../integrity/integrity.c14nV2.js';
import { sha256Hex } from '../../../export/package.bytes.js';
import { integrityMethodReferenceAuthorityForCreation } from '../../../integrity/integrity.methodReference.js';
import { inspectPortableLineageIntegrity } from '../lineage/lineage.integrity.plan.js';
import { portableFinding } from '../findings.js';

export const PORTABLE_EDITOR_ASSISTANCE_SCHEMA_ID = 'tiinex.portable.editor-assistance.v1';

export function projectPortableEditorAssistance(input = {}) {
  const records = normalizeRecords(input);
  const focusPath = norm(input.focusPath || input.focus || '');
  const selectedRecords = focusPath ? records.filter((record) => norm(record.path || record.id || '') === focusPath) : records;
  const lineageInspection = inspectPortableLineageIntegrity({ records });
  const documents = selectedRecords.map((record) => projectDocument(record, records, lineageInspection));
  const diagnostics = documents.flatMap((item) => item.diagnostics);
  return freeze({
    schema: PORTABLE_EDITOR_ASSISTANCE_SCHEMA_ID,
    status: diagnostics.some((item) => item.severity === 'error') ? 'invalid' : diagnostics.some((item) => item.severity === 'warning') ? 'degraded' : 'clean',
    documents,
    operationBoundary: { sourceMutation: false, remoteWrite: false, automaticRepair: false },
    boundary: 'Adapter-neutral projection of exact shared audit/validator findings plus only deterministic byte replacements. Presentation adapters must not invent finding severity, validator choice, source line, or repair content.'
  });
}

function projectDocument(record = {}, records = [], lineageInspection = null) {
  const audit = auditPortableRecord(record, { requireExactSchemaAuthority: true });
  const markdown = String(record.markdown || '');
  const recordPath = norm(record.path || record.id || '');
  const lineageFindings = findingsForPath(lineageInspection?.findings || [], recordPath);
  const referenceFindings = schemaReferenceCompositionFindings(audit, recordPath);
  const sharedFindings = [...(audit.findings || []), ...lineageFindings, ...referenceFindings];
  const diagnostics = sharedFindings
    .filter((item) => item.severity === 'error' || item.severity === 'warning')
    .map((finding) => projectDiagnostic(finding, markdown));
  const actions = [];
  const integrityRepair = deterministicIntegrityHygieneRepair(markdown, audit.findings || []);
  const repairQualification = integrityRepair.state === 'ready'
    ? qualifyReplacementAgainstSharedGuardrails(record, records, integrityRepair.markdown)
    : { state: 'unavailable' };
  if (integrityRepair.state === 'ready' && integrityRepair.markdown !== markdown && repairQualification.state === 'qualified') actions.push(freeze({
    id: 'refresh-primary-self-integrity',
    title: integrityRepair.methodReferenceChanged ? 'Refresh Tiinex integrity references and self seal' : 'Refresh Tiinex c14n-v2 self integrity',
    kind: 'replace-document',
    qualification: 'deterministic-shared-core',
    sourceSha256: sha256Hex(new TextEncoder().encode(markdown)),
    replacementMarkdown: integrityRepair.markdown,
    diagnosticCodes: integrityRepair.diagnosticCodes,
    boundary: integrityRepair.methodReferenceChanged
      ? 'Rebinds only unqualified c14n-v2 footer method links to the shared qualified maintained target and reseals the existing primary self Value; the replacement is exposed only after the same shared audit and lineage guardrails re-qualify the focused artifact and every loaded digest-bound descendant.'
      : 'Refreshes only the existing primary c14n-v2 self Value through the shared integrity algorithm; the replacement is exposed only after the same shared audit and lineage guardrails re-qualify the focused artifact and every loaded digest-bound descendant.'
  }));
  const validationAuthority = audit.schemaValidationAuthority || null;
  return freeze({
    path: String(record.path || record.id || ''),
    schemaId: String(audit.schemaId || ''),
    validator: {
      state: audit.qualification?.exact && validationAuthority?.state === 'qualified' ? 'qualified-exact' : 'degraded',
      requestedSchema: String(audit.qualification?.requestedSchema || audit.schemaId || ''),
      resolvedThrough: String(audit.qualification?.resolvedThrough || ''),
      fallbackUsed: Boolean(audit.qualification?.fallback?.used),
      authorityState: String(validationAuthority?.state || 'unavailable'),
      authorityBasis: String(validationAuthority?.currentReference?.basis || ''),
      authorityFindings: [...(validationAuthority?.findings || [])]
    },
    diagnostics,
    actions
  });
}

function schemaReferenceCompositionFindings(audit = {}, recordPath = '') {
  const envelope = audit?.parsed?.envelope || {};
  const references = [
    { field: 'Envelope Schema', value: envelope.envelopeSchema || {} },
    { field: 'Current Schema', value: envelope.current?.schema || {} },
    { field: 'Parent Schema', value: envelope.parent?.schema || {} }
  ].filter((entry) => String(entry.value?.id || '').trim());
  const exactPublishedStyle = references.some((entry) => entry.value?.form === 'markdown-link' && /^https:\/\/github\.com\/[^/]+\/[^/]+\/blob\/[0-9a-f]{40}\//i.test(String(entry.value?.target || '')));
  if (!exactPublishedStyle) return [];
  const findings = [];
  for (const entry of references) {
    if (entry.value?.form !== 'plain-schema-id') continue;
    const schemaId = String(entry.value?.id || '').trim();
    findings.push(portableFinding('warning', 'portable.editor.schema-reference.canonical-target-available', `${entry.field} uses only a schema id while the same artifact otherwise uses exact immutable schema locators. This mixed representation requires explicit qualification instead of being treated as clean.`, {
      ref: recordPath,
      params: { field: entry.field, schemaId },
      fixability: 'manual-or-holistic-repair-required'
    }));
  }
  return findings;
}

function findingsForPath(findings = [], path = '') {
  const wanted = norm(path);
  return (findings || []).filter((finding) => norm(finding?.evidencePath || finding?.ref || '') === wanted);
}

function qualifyReplacementAgainstSharedGuardrails(record = {}, records = [], replacementMarkdown = '') {
  const focusPath = norm(record.path || record.id || '');
  if (!focusPath || !replacementMarkdown) return freeze({ state: 'unavailable', reason: 'replacement-or-focus-unavailable' });
  const replacedRecords = records.map((item) => norm(item.path || item.id || '') === focusPath ? { ...item, markdown: replacementMarkdown } : item);
  const replacementRecord = replacedRecords.find((item) => norm(item.path || item.id || '') === focusPath);
  if (!replacementRecord) return freeze({ state: 'unavailable', reason: 'focused-record-unavailable' });
  const replacementAudit = auditPortableRecord(replacementRecord, { requireExactSchemaAuthority: true });
  const auditBlockers = [...(replacementAudit.findings || []), ...schemaReferenceCompositionFindings(replacementAudit, focusPath)].filter((item) => item.severity === 'error' || item.severity === 'warning');
  if (auditBlockers.length) return freeze({ state: 'blocked', reason: 'replacement-shared-audit-not-clean', blockerCodes: auditBlockers.map((item) => String(item.code || '')) });

  const before = inspectPortableLineageIntegrity({ records });
  const after = inspectPortableLineageIntegrity({ records: replacedRecords });
  const beforeFocus = (before.artifacts || []).find((item) => norm(item.path || '') === focusPath);
  const affectedPaths = new Set([focusPath, ...((beforeFocus?.downstreamDescendants || []).map((item) => norm(item.path || '')).filter(Boolean))]);
  const lineageBlockers = (after.artifacts || []).filter((item) => affectedPaths.has(norm(item.path || '')) && item.state !== 'healthy');
  if (lineageBlockers.length) return freeze({ state: 'blocked', reason: 'replacement-shared-lineage-not-clean', blockers: lineageBlockers.map((item) => ({ path: item.path, state: item.state })) });
  return freeze({ state: 'qualified', affectedPaths: [...affectedPaths] });
}

function projectDiagnostic(finding = {}, markdown = '') {
  const located = locateFindingLine(finding, markdown);
  return freeze({
    severity: String(finding.severity || 'warning'),
    code: String(finding.code || 'tiinex.validation.finding'),
    message: String(finding.message || 'Tiinex validation finding.'),
    fixability: String(finding.fixability || 'unknown'),
    line: located.line,
    locationState: located.state,
    locationBasis: located.basis
  });
}

export function locateFindingLine(finding = {}, markdown = '') {
  const lines = String(markdown || '').replace(/\r\n?/g, '\n').split('\n');
  const params = finding.params || finding;
  const field = String(params.field || '').trim();
  const section = String(params.section || '').trim();
  const heading = String(params.heading || '').replace(/^#{1,6}\s+/, '').trim();
  const group = String(params.group || '').trim();
  if (field) {
    const index = lines.findIndex((line) => new RegExp(`^\\s*-\\s+${escapeRegExp(field)}\\s*:`).test(line));
    if (index >= 0) return freeze({ state: 'deterministic', line: index + 1, basis: `field:${field}` });
  }
  for (const owner of [section, heading, group].filter(Boolean)) {
    const sectionIndex = lines.findIndex((line) => new RegExp(`^#{2,6}\\s+${escapeRegExp(owner)}\\s*$`, 'i').test(line));
    if (sectionIndex >= 0) return freeze({ state: section || heading ? 'deterministic' : 'deterministic-anchor', line: sectionIndex + 1, basis: `${section || heading ? 'section' : 'owning-section'}:${owner}` });
    const envelopeIndex = lines.findIndex((line) => new RegExp(`^\\s*-\\s+${escapeRegExp(owner)}(?:\\s*:.*)?\\s*$`, 'i').test(line));
    if (envelopeIndex >= 0) return freeze({ state: 'deterministic-anchor', line: envelopeIndex + 1, basis: `envelope-owner:${owner}` });
  }
  const code = String(finding.code || '');
  if (code.includes('schema.') || code.endsWith('.schema.mismatch') || code === 'audit.schema-authority.unqualified') {
    const index = lines.findIndex((line) => /^\s*-\s+Current Schema\s*:/.test(line));
    if (index >= 0) return freeze({ state: 'deterministic', line: index + 1, basis: 'current-schema-field' });
  }
  if (code === 'integrity.method-reference.unqualified') {
    const headingIndex = lines.findIndex((line) => line.trim() === '# Continuity Integrity');
    const methodIndex = lines.findIndex((line, index) => index > headingIndex && /^\s*-\s+\[sha256-base64url-c14n-v2\]\([^)]+\)\s*$/.test(line));
    if (methodIndex >= 0) return freeze({ state: 'deterministic', line: methodIndex + 1, basis: 'continuity-integrity-method-reference' });
  }
  if (code.includes('integrity') || /integrity|checksum|digest/i.test(String(finding.message || ''))) {
    const headingIndex = lines.findIndex((line) => line.trim() === '# Continuity Integrity');
    if (headingIndex >= 0) {
      const index = lines.findIndex((line, i) => i > headingIndex && /^\s+-\s+Value\s*:/.test(line));
      if (index >= 0) return freeze({ state: 'deterministic', line: index + 1, basis: 'continuity-integrity-value' });
      return freeze({ state: 'deterministic-anchor', line: headingIndex + 1, basis: 'continuity-integrity-heading' });
    }
  }
  if (/^(portable\.contract\.|root\.|integrity\.)/i.test(code) && (/missing|required|incomplete/i.test(code) || /\bmissing\b|\brequired\b/i.test(String(finding.message || '')))) {
    const bodyHeading = lines.findIndex((line) => /^#\s+\S/.test(line) && !/^#\s+Continuity (?:Context|Integrity)\s*$/.test(line));
    if (bodyHeading >= 0) return freeze({ state: 'deterministic-anchor', line: bodyHeading + 1, basis: section ? `body-heading-for-missing-section:${section}` : field ? `body-heading-for-missing-field:${field}` : 'body-heading-for-missing-required-content' });
    const contextHeading = lines.findIndex((line) => line.trim() === '# Continuity Context');
    if (contextHeading >= 0) return freeze({ state: 'deterministic-anchor', line: contextHeading + 1, basis: 'continuity-context-for-missing-required-content' });
  }
  if (/\.body\.|body/i.test(code) || /\bbody\b/i.test(String(finding.message || ''))) {
    const bodyHeading = lines.findIndex((line) => /^#\s+\S/.test(line) && !/^#\s+Continuity (?:Context|Integrity)\s*$/.test(line));
    if (bodyHeading >= 0) return freeze({ state: 'deterministic-anchor', line: bodyHeading + 1, basis: 'body-heading-for-body-finding' });
  }
  return freeze({ state: 'unresolved', line: null, basis: 'shared-finding-has-no-deterministic-line-evidence' });
}

function deterministicIntegrityHygieneRepair(markdown = '', findings = []) {
  const source = String(markdown || '');
  const codes = new Set((findings || []).map((item) => String(item?.code || '')));
  const authority = integrityMethodReferenceAuthorityForCreation(C14N_V2_METHOD_ID);
  const preferredTarget = authority?.resolutionState === 'qualified' ? String(authority?.preferredTarget || '') : '';
  const exactTargets = new Set((authority?.exactTargets || []).map((item) => String(item || '')));
  let methodReferenceChanged = false;
  let repaired = source;
  if (codes.has('integrity.method-reference.unqualified') && preferredTarget) {
    const lines = source.replace(/\r\n?/g, '\n').split('\n');
    const heading = lines.findIndex((line) => line.trim() === '# Continuity Integrity');
    if (heading >= 0) {
      for (let index = heading + 1; index < lines.length; index += 1) {
        if (/^#\s+/.test(lines[index])) break;
        const match = lines[index].match(/^(\s*-\s+)\[sha256-base64url-c14n-v2\]\(([^)]+)\)(\s*)$/);
        if (!match || exactTargets.has(match[2])) continue;
        lines[index] = `${match[1]}[${C14N_V2_METHOD_ID}](${preferredTarget})${match[3]}`;
        methodReferenceChanged = true;
      }
      if (methodReferenceChanged) repaired = lines.join('\n');
    }
  }

  const integrity = canonicalC14nV2SelfState(repaired);
  const requiresSeal = methodReferenceChanged || integrity.state === 'mismatch' || integrity.state === 'prepared';
  if (!requiresSeal) return freeze({ state: 'unavailable', markdown: source, methodReferenceChanged: false, diagnosticCodes: [] });
  const sealed = sealC14nV2Self(repaired);
  if (sealed.state !== 'sealed') return freeze({ state: 'unavailable', markdown: source, methodReferenceChanged, diagnosticCodes: [] });
  const diagnosticCodes = [
    ...(methodReferenceChanged ? ['integrity.method-reference.unqualified'] : []),
    'integrity.c14n-v2.mismatch',
    'integrity.c14n-v2.ambiguous'
  ];
  return freeze({ state: 'ready', markdown: sealed.markdown, methodReferenceChanged, diagnosticCodes: [...new Set(diagnosticCodes)] });
}

function norm(value = '') { return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '').replace(/^\/+|\/+$/g, ''); }
function escapeRegExp(value = '') { return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function freeze(value) { if (Array.isArray(value)) return Object.freeze(value.map(freeze)); if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value; return Object.freeze(Object.fromEntries(Object.entries(value).map(([key, item]) => [key, freeze(item)]))); }

function normalizeRecords(input = {}) {
  if (Array.isArray(input.records)) return input.records;
  return (Array.isArray(input.files) ? input.files : []).filter((item) => typeof item?.content === 'string').map((item) => Object.freeze({ id: String(item.path || ''), path: String(item.path || ''), markdown: String(item.content || ''), sourceMode: item.sourceMode || '' }));
}
