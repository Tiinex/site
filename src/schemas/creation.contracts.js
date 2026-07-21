import { parseArtifactMarkdown } from '../artifacts/artifact.parse.js';
import { rootValidate } from './root.validate.js';
import { resolveSchemaCapabilities, CapabilityStatus } from './capability.registry.js';
import { schemaRegistry } from './registry.js';

export const ARTIFACT_CREATION_CONTRACT_SCHEMA_ID = 'tiinex.artifact.creation.contract.v1';
export const ARTIFACT_CREATION_RESULT_VALIDATION_SCHEMA_ID = 'tiinex.artifact.creation.result.validation.v1';
export const ROOT_SCHEMA_ID = 'tiinex.root.v1';

export function listCreatableArtifactSchemas(registry = schemaRegistry) {
  const modules = Array.isArray(registry.modules) ? registry.modules : [];
  return modules
    .filter((module) => module?.kind === 'concrete' && module?.role === 'core-artifact')
    .map((module) => buildArtifactCreationContract({ schemaId: module.id, module }));
}

export function buildArtifactCreationContract(input = {}, options = {}) {
  const schemaId = String(input.schemaId || input.id || input.module?.id || '').trim();
  const resolution = resolveSchemaCapabilities({ schemaId });
  const descriptor = input.module ? describeModuleThroughResolution(input.module) : resolution.descriptor;
  const createCapability = descriptor?.actions?.create;
  const fallbackUsed = Boolean(resolution.fallbackUsed && !input.module);
  const isCreatable = createCapability?.status === CapabilityStatus.implemented && !fallbackUsed;
  const transitionType = String(input.transitionType || options.transitionType || 'create-artifact').trim();
  const findings = [];

  if (!schemaId) findings.push(error('creation.schema.required', 'Creation contract requires a target schema id.'));
  if (fallbackUsed) findings.push(error('creation.schema.fallback-blocked', `Cannot create ${schemaId || 'unknown schema'} through Root fallback; choose an implemented schema module.`));
  if (createCapability?.status !== CapabilityStatus.implemented) findings.push(error('creation.capability.missing', `${schemaId || 'target schema'} does not declare an implemented create capability.`));
  if (!descriptor?.binding?.schemaId) findings.push(error('creation.binding.schemaId.missing', `${schemaId || 'target schema'} is missing schema binding.`));

  const status = findings.some((finding) => finding.severity === 'error') ? 'blocked' : 'ready';
  return Object.freeze({
    schema: ARTIFACT_CREATION_CONTRACT_SCHEMA_ID,
    id: stableContractId(schemaId, transitionType),
    status,
    transitionType,
    target: Object.freeze({
      schemaId,
      moduleId: descriptor?.moduleId || '',
      label: descriptor?.label || labelFromSchemaId(schemaId),
      role: descriptor?.role || '',
      parentSchemaId: descriptor?.parentSchemaId || ROOT_SCHEMA_ID,
      fallbackUsed,
      binding: Object.freeze({
        schemaId: descriptor?.binding?.schemaId || '',
        checksum: descriptor?.binding?.checksum || '',
        sourcePath: descriptor?.binding?.sourcePath || '',
        sourceRepository: descriptor?.binding?.sourceRepository || '',
        sourceCommit: descriptor?.binding?.sourceCommit || ''
      })
    }),
    resultBoundary: Object.freeze({
      mode: 'browser-local-draft',
      sourceMutation: 'none',
      remoteWrite: false,
      mayInheritParentSource: false,
      allowedSourceModePrefix: 'local-'
    }),
    requiredEnvelope: Object.freeze({
      envelopeSchemaId: ROOT_SCHEMA_ID,
      parentFields: Object.freeze(['Parent Schema', 'Trace', 'Boundary']),
      parentOrigin: 'required-when-parent-path-known',
      currentFields: Object.freeze(['Current Schema', 'Created At', 'Summary', 'Status', 'Why']),
      integrityFooter: 'required'
    }),
    capabilities: Object.freeze({
      create: createCapability?.status || CapabilityStatus.unavailable,
      fallback: descriptor?.actions?.fallback?.status || CapabilityStatus.unavailable,
      validate: descriptor?.actions?.validate?.status || CapabilityStatus.unavailable,
      present: descriptor?.actions?.present?.status || CapabilityStatus.unavailable
    }),
    findings: Object.freeze(findings)
  });
}

export function createArtifactDraftMarkdown(contract = {}, input = {}) {
  const parentRecord = input.parentRecord || {};
  const currentSchemaId = String(input.currentSchemaId || contract.target?.schemaId || '').trim();
  const createdAt = String(input.createdAt || new Date().toISOString()).trim();
  const title = normalizeTitle(input.title || `${contract.target?.label || labelFromSchemaId(currentSchemaId)} Draft`);
  const summary = normalizeSummary(input.summary || `${contract.target?.label || labelFromSchemaId(currentSchemaId)} draft created in Tiinex.`);
  const status = String(input.status || 'draft/local').trim();
  const why = normalizeSummary(input.why || 'Created as a browser-local draft. No source provenance is inferred.');
  const bodyMarkdown = String(input.bodyMarkdown || defaultBodyMarkdown({ title, label: contract.target?.label, summary })).trim();

  return [
    '# Continuity Context',
    '',
    `- Envelope Schema: [${ROOT_SCHEMA_ID}](${ROOT_SCHEMA_ID}.schema.md)`,
    '- Parent',
    `  - Parent Schema: [${parentSchemaForRecord(parentRecord)}](${parentSchemaForRecord(parentRecord)}.schema.md)`,
    `  - Created At: ${parentRecord.createdAt || 'unknown'}`,
    `  - Trace: ${parentRecord.id ? `record:${parentRecord.id}` : 'record:unassigned'}`,
    parentRecord.path ? `  - Origin: ${parentRecord.path}` : '',
    `  - Boundary: ${boundaryForRecord(parentRecord)}`,
    '- Current',
    `  - Current Schema: [${currentSchemaId}](${currentSchemaId}.schema.md)`,
    `  - Created At: ${createdAt}`,
    `  - Summary: ${summary}`,
    `  - Status: ${status}`,
    `  - Why: ${why}`,
    '',
    '---',
    '',
    bodyMarkdown,
    '',
    '# Continuity Integrity',
    '',
    '- Draft Local Integrity',
    '  - Method: browser-local-draft',
    '  - Value: pending-publication-or-export'
  ].filter(Boolean).join('\n');
}

export function validateArtifactCreationContract(contract = {}) {
  const findings = [];
  if (contract.schema !== ARTIFACT_CREATION_CONTRACT_SCHEMA_ID) findings.push(error('creation.contract.schema.invalid', 'Creation contract schema id is invalid.'));
  if (!contract.target?.schemaId) findings.push(error('creation.contract.target.missing', 'Creation contract target schema is missing.'));
  if (contract.status !== 'ready') findings.push(...(contract.findings || [error('creation.contract.not-ready', 'Creation contract is not ready.')]));
  if (contract.resultBoundary?.remoteWrite !== false) findings.push(error('creation.contract.remoteWrite.invalid', 'Artifact creation contract must not perform remote writes.'));
  if (contract.resultBoundary?.mayInheritParentSource !== false) findings.push(error('creation.contract.source.inherit.invalid', 'Draft creation must not inherit parent source objects.'));
  return makeValidation('tiinex.artifact.creation.contract.validation.v1', findings, {
    targetSchemaId: contract.target?.schemaId || '',
    contractId: contract.id || ''
  });
}

export function validateArtifactCreationResult(draft = {}, parentRecord = {}, options = {}) {
  const contract = options.contract || draft.creationContract || buildArtifactCreationContract({ schemaId: draft.kind || draft.targetSchemaId || '' });
  const parsed = parseArtifactMarkdown(draft.markdown || '');
  const findings = [];
  findings.push(...validateArtifactCreationContract(contract).findings);
  for (const finding of rootValidate(parsed)) findings.push(normalizeFinding(finding));

  const currentSchemaId = parsed.envelope?.current?.schema?.id || '';
  const expectedSchemaId = contract.target?.schemaId || draft.kind || '';
  const parent = parsed.envelope?.parent || {};
  const expectedTrace = parentRecord?.id ? `record:${parentRecord.id}` : '';

  if (expectedSchemaId && currentSchemaId !== expectedSchemaId) findings.push(error('creation.current.schema.mismatch', `Creation result Current Schema must be ${expectedSchemaId}.`));
  if (expectedTrace && parent.trace !== expectedTrace) findings.push(error('creation.parent.trace.mismatch', `Creation result Parent Trace must preserve ${expectedTrace}.`));
  if (!parent.boundary) findings.push(error('creation.parent.boundary.required', 'Creation result must preserve parent boundary.'));
  if (parentRecord?.path && !parent.origin) findings.push(warning('creation.parent.origin.missing', 'Parent path exists but creation result Origin is missing.'));
  if (parentRecord?.path && parent.origin && !originMatchesPath(parent.origin, parentRecord.path)) findings.push(warning('creation.parent.origin.unexpected', 'Creation result Origin does not end with the parent canonical path.'));
  if (draft.status !== 'local') findings.push(error('creation.result.status.not-local', 'Creation result must stay local until explicit publication/export.'));
  if (!String(draft.sourceMode || '').startsWith('local-')) findings.push(error('creation.result.sourceMode.not-local', 'Creation result must use a browser-local sourceMode.'));
  if (draft.source?.adapterId) findings.push(error('creation.result.source.inherited', 'Creation result must not inherit source object from its parent.'));
  if (!parsed.hasIntegrity) findings.push(error('creation.integrity.required', 'Creation result must include Continuity Integrity.'));

  return makeValidation(ARTIFACT_CREATION_RESULT_VALIDATION_SCHEMA_ID, findings, {
    targetSchemaId: expectedSchemaId,
    currentSchemaId,
    parentTrace: parent.trace || '',
    parentOrigin: parent.origin || '',
    parentBoundary: parent.boundary || '',
    contractId: contract.id || ''
  });
}

function describeModuleThroughResolution(module = {}) {
  return {
    moduleId: module.id || '',
    label: module.label || module.id || '',
    role: module.role || '',
    parentSchemaId: module.parentSchemaId || ROOT_SCHEMA_ID,
    binding: {
      schemaId: module.binding?.schemaId || module.id || '',
      checksum: module.binding?.checksum?.value || module.binding?.checksum || '',
      sourcePath: module.binding?.sourcePath || '',
      sourceRepository: module.binding?.sourceRepository || '',
      sourceCommit: module.binding?.sourceCommit || ''
    },
    actions: {
      create: { status: module.capabilities?.canCreateArtifact === true ? CapabilityStatus.implemented : CapabilityStatus.unavailable },
      fallback: { status: module.capabilities?.canRenderFallback === true ? CapabilityStatus.implemented : CapabilityStatus.fallback },
      validate: { status: typeof module.validate === 'function' ? CapabilityStatus.implemented : CapabilityStatus.unavailable },
      present: { status: typeof module.present === 'function' ? CapabilityStatus.implemented : CapabilityStatus.unavailable }
    }
  };
}

function makeValidation(schema, findings = [], parsed = {}) {
  const counts = countFindings(findings);
  return Object.freeze({ schema, ok: counts.errors === 0, status: counts.errors ? 'invalid' : counts.warnings ? 'degraded' : 'valid', counts, parsed: Object.freeze(parsed), findings: Object.freeze(findings) });
}

function countFindings(findings = []) {
  return findings.reduce((counts, finding) => {
    if (finding.severity === 'error') counts.errors += 1;
    else if (finding.severity === 'warning') counts.warnings += 1;
    else counts.info += 1;
    return counts;
  }, { errors: 0, warnings: 0, info: 0 });
}

function defaultBodyMarkdown({ title, label, summary }) {
  return [`# ${title}`, '', `## ${label || 'Artifact'} Draft`, '', summary].join('\n');
}

function stableContractId(schemaId, transitionType) { return `creation:${transitionType || 'create'}:${schemaId || 'unknown'}`; }
function normalizeTitle(value) { return String(value || '').replace(/\s+/g, ' ').trim().slice(0, 96) || 'Untitled draft'; }
function normalizeSummary(value) { return String(value || '').replace(/\s+/g, ' ').trim().slice(0, 280) || 'Draft created in Tiinex.'; }
function parentSchemaForRecord(record = {}) { return record.kind && String(record.kind).includes('.') ? String(record.kind) : ROOT_SCHEMA_ID; }
function labelFromSchemaId(id = '') { const tail = String(id || '').split('.').filter(Boolean).slice(-2, -1)[0] || String(id || 'artifact'); return tail.charAt(0).toUpperCase() + tail.slice(1); }
function boundaryForRecord(record = {}) {
  const source = record.source || {};
  if (source.adapterId === 'github') return 'source-backed github material';
  if (source.adapterId === 'local' || source.kind === 'local-session' || record.sourceMode?.startsWith?.('local')) return 'browser-local session material; no GitHub provenance inferred';
  return 'explicit record boundary';
}
function originMatchesPath(origin = '', path = '') { return normalizePath(origin).endsWith(normalizePath(path)); }
function normalizePath(value = '') { return String(value || '').replace(/^https?:\/\/github\.com\/[^/]+\/[^/]+\/blob\/[^/]+\//, '').replace(/^https?:\/\/raw\.githubusercontent\.com\/[^/]+\/[^/]+\/[^/]+\//, '').replace(/^\/+/, '').replace(/\\/g, '/'); }
function normalizeFinding(finding = {}) { return { severity: finding.severity || 'info', code: finding.code || 'creation.finding', message: finding.message || '', source: finding.source || ARTIFACT_CREATION_CONTRACT_SCHEMA_ID }; }
function finding(severity, code, message) { return { severity, code, message, source: ARTIFACT_CREATION_CONTRACT_SCHEMA_ID }; }
function error(code, message) { return finding('error', code, message); }
function warning(code, message) { return finding('warning', code, message); }
