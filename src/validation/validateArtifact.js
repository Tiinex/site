import { parseArtifactMarkdown } from '../artifacts/artifact.parse.js';
import { normalizeArtifact } from '../artifacts/artifact.normalize.js';
import { resolveSchemaModule } from '../schemas/resolver.js';
import { rootValidate, rootFallbackFinding } from '../schemas/tiinex.root.v1.validate.js';
import { validateIntegrity } from '../integrity/integrity.validate.js';
import { validatePortableContractInstance } from '../tooling/portable/schema/contract.validate.js';
import { qualifySchemaReferenceValue, schemaReferenceAuthorityFromBinding } from '../schemas/schema.reference.js';
import { normalizeFindings, normalizeFinding } from './findings.js';

export const ARTIFACT_VALIDATION_PIPELINE_ID = 'tiinex.artifact.validation.pipeline.v1';

export function validateArtifact(input = {}, options = {}) {
  const markdown = String(input.markdown || input.record?.markdown || input.parsed?.markdown || '');
  const parsed = input.parsed || parseArtifactMarkdown(markdown);
  const schemaId = parsed?.envelope?.current?.schema?.id || input.schemaId || input.record?.schemaId || input.record?.currentSchemaId || '';
  const resolution = input.resolution || resolveSchemaModule({ schemaId, checksum: input.checksum });
  const rootFindings = normalizeFindings(rootValidate(parsed), { schemaId: 'tiinex.root.v1', qualification: 'readability-root-diagnostic' });
  const machineContract = runMachineContractValidation({ markdown: markdown || parsed?.markdown || '', schemaId, resolution, validationContractOverride: input.validationContractOverride || null });
  const contractFindings = normalizeFindings(machineContract.findings, { schemaId: machineContract.schemaId || schemaId, qualification: 'machine-contract' });
  const schemaReferenceFindings = normalizeFindings(validateDeclaredSchemaReferences(parsed, input.schemaReferenceAuthorities || null), { qualification: 'schema-reference' });
  const integrityFindings = normalizeFindings(validateIntegrity(parsed, options.integrity), { schemaId: 'tiinex.root.v1', qualification: 'integrity' });
  const childValidation = runExactSchemaValidator({ parsed, schemaId, resolution });
  const childFindings = childValidation.findings;
  const fallbackFindings = fallbackFindingsFor({ schemaId, resolution, childFindings, childValidatorRan: childValidation.ran, machineContract });
  const findings = [...rootFindings, ...contractFindings, ...schemaReferenceFindings, ...integrityFindings, ...childFindings, ...fallbackFindings];
  const validation = validationTruthFor({ parsed, schemaId, resolution, childFindings, childValidatorRan: childValidation.ran, machineContract, findings });
  return Object.freeze({
    schema: ARTIFACT_VALIDATION_PIPELINE_ID,
    parsed,
    schemaId,
    resolution,
    artifact: normalizeArtifact(parsed, resolution, findings),
    findings: Object.freeze(findings),
    contractValidation: machineContract,
    validation
  });
}

function validateDeclaredSchemaReferences(parsed = {}, contextualAuthorities = null) {
  const references = [
    { role: 'Envelope Schema', value: parsed?.envelope?.envelopeSchema?.raw || '', schemaId: parsed?.envelope?.envelopeSchema?.id || '' },
    { role: 'Current Schema', value: parsed?.envelope?.current?.schema?.raw || '', schemaId: parsed?.envelope?.current?.schema?.id || '' }
  ];
  const parent = parsed?.envelope?.parent || {};
  if (parent?.schema?.id || parent?.schema?.raw) references.push({ role: 'Parent Schema', value: parent?.schema?.raw || '', schemaId: parent?.schema?.id || '' });
  const findings = [];
  for (const reference of references) {
    if (!reference.schemaId || !reference.value) continue;
    const resolved = resolveSchemaModule({ schemaId: reference.schemaId });
    if (resolved?.fallbackUsed || !resolved?.module) {
      findings.push({ severity: 'warning', code: 'schema.reference.authority.unavailable', message: `${reference.role} authority is unavailable for ${reference.schemaId}; the declared reference is preserved without target substitution.`, source: 'tiinex.schema.reference.validation.v1' });
      continue;
    }
    const sourceQualification = typeof resolved.module.schemaSource?.qualify === 'function' ? resolved.module.schemaSource.qualify() : null;
    const registeredAuthority = schemaReferenceAuthorityFromBinding(reference.schemaId, resolved.module.binding || {}, sourceQualification?.authority || null, sourceQualification);
    const contextualAuthority = contextualSchemaReferenceAuthority(contextualAuthorities, reference.role, reference.schemaId);
    const authority = contextualAuthority || registeredAuthority;
    const qualification = qualifySchemaReferenceValue(reference.value, authority);
    if (qualification.state === 'qualified') continue;
    if (qualification.schemaIdState !== 'qualified') {
      findings.push({ severity: 'error', code: 'schema.reference.identity-contradiction', message: `${reference.role}: Declared schema identifier contradicts current semantic schema identity authority. ${qualification.findings.join(' ')}`, source: 'tiinex.schema.reference.validation.v1' });
      continue;
    }
    if (qualification.observed?.form === 'markdown-link' && qualification.targetState === 'unqualified') {
      findings.push({ severity: 'info', code: 'schema.reference.locator.unresolved', message: `${reference.role}: Declared schema representation locator is preserved but is not resolved by current exact material authority. Locator resolution is separate from semantic schema identity.`, source: 'tiinex.schema.reference.validation.v1' });
      continue;
    }
    findings.push({ severity: 'error', code: 'schema.reference.unqualified', message: `${reference.role}: ${qualification.findings.join(' ')}`, source: 'tiinex.schema.reference.validation.v1' });
  }
  return findings;
}


function contextualSchemaReferenceAuthority(value = null, role = '', schemaId = '') {
  if (!value || typeof value !== 'object') return null;
  const key = role === 'Envelope Schema' ? 'envelope' : role === 'Current Schema' ? 'current' : role === 'Parent Schema' ? 'parent' : '';
  const raw = (key && value[key]) || (Array.isArray(value) ? value.find((entry) => String(entry?.role || '') === role || String(entry?.schemaId || '') === schemaId) : null);
  if (!raw || typeof raw !== 'object') return null;
  const id = String(raw.schemaId || schemaId || '').trim();
  if (!id || id !== schemaId) return null;
  const exactTargets = [...new Set([...(Array.isArray(raw.exactTargets) ? raw.exactTargets : []), raw.preferredTarget || raw.target || ''].map((item) => String(item || '')).filter(Boolean))];
  if (String(raw.resolutionState || raw.state || '') !== 'qualified') return null;
  return Object.freeze({ ...raw, schemaId: id, exactTargets: Object.freeze(exactTargets), preferredTarget: String(raw.preferredTarget || raw.target || exactTargets[0] || '') });
}

function runMachineContractValidation({ markdown = '', schemaId = '', resolution = {}, validationContractOverride = null } = {}) {
  if (resolution?.fallbackUsed) return Object.freeze({ available: false, state: 'unavailable', schemaId, lineage: Object.freeze([]), result: null, findings: Object.freeze([]), reason: 'fallback-resolution-has-no-target-contract-authority' });
  const qualification = typeof resolution?.module?.schemaSource?.qualify === 'function' ? resolution.module.schemaSource.qualify() : null;
  const compiledContract = validationContractOverride || (qualification?.state === 'qualified' ? qualification?.compiledContract?.validationContract || null : null);
  if (!compiledContract || compiledContract?.lineageQualification?.state !== 'valid') {
    return Object.freeze({
      available: false,
      state: 'unavailable',
      schemaId,
      lineage: Object.freeze([]),
      result: null,
      findings: Object.freeze([]),
      reason: qualification?.state === 'qualified' ? 'compiled-validation-contract-unavailable' : 'schema-source-unqualified'
    });
  }
  try {
    const result = validatePortableContractInstance({ markdown, compiledContract });
    return Object.freeze({
      available: true,
      state: String(result.status || 'unresolved'),
      schemaId: String(compiledContract.schemaId || schemaId),
      lineage: Object.freeze([...(compiledContract.lineage || [])]),
      result,
      findings: Object.freeze([...(result.findings || [])]),
      conditionalRequirements: Object.freeze([...(compiledContract?.validation?.conditionalRequirements || [])]),
      reason: ''
    });
  } catch (error) {
    return Object.freeze({
      available: true,
      state: 'unresolved',
      schemaId: String(compiledContract.schemaId || schemaId),
      lineage: Object.freeze([...(compiledContract.lineage || [])]),
      result: null,
      findings: Object.freeze([{ severity: 'warning', code: 'audit.machine-contract.validation.failed', message: String(error?.message || error || 'Compiled contract validation failed.'), source: 'tiinex.audit.v1' }]),
      reason: 'compiled-validation-failed'
    });
  }
}

function runExactSchemaValidator({ parsed, schemaId, resolution }) {
  const moduleId = resolution?.module?.id || '';
  const validator = resolution?.module?.validate;
  const exactRoot = !resolution?.fallbackUsed && (moduleId === 'tiinex.root.v1' || schemaId === 'tiinex.root.v1');
  if (exactRoot || resolution?.fallbackUsed || typeof validator !== 'function') return { ran: false, findings: [] };
  return { ran: true, findings: normalizeFindings(validator(parsed), { schemaId: moduleId || schemaId, qualification: 'schema-specific' }) };
}

function fallbackFindingsFor({ schemaId, resolution, childFindings = [], childValidatorRan = false, machineContract = null }) {
  const moduleId = resolution?.module?.id || '';
  const exactRoot = !resolution?.fallbackUsed && (moduleId === 'tiinex.root.v1' || schemaId === 'tiinex.root.v1');
  if (resolution?.fallbackUsed) return [normalizeFinding(rootFallbackFinding(schemaId), { schemaId: 'tiinex.root.v1', qualification: 'fallback' }), normalizeFinding({ severity: 'warning', code: 'audit.validator.unavailable', message: `${schemaId || 'schema'} has no exact schema-specific validator; Root v1 validation was run instead.`, source: 'tiinex.audit.v1', qualification: 'validator-unavailable' })];
  if (!exactRoot && !childValidatorRan && !machineContract?.available) return [normalizeFinding({ severity: 'warning', code: 'audit.validator.unavailable', message: `${moduleId || schemaId || 'schema'} has no schema-specific validator and no qualified compiled machine contract; Root v1 validation was run instead.`, source: 'tiinex.audit.v1', qualification: 'validator-unavailable' })];
  return [];
}

export function validationTruthFor({ parsed = null, schemaId = '', resolution = {}, childFindings = [], childValidatorRan = childFindings.length > 0, machineContract = null, findings = [], availability = { available: true }, supporting = false } = {}) {
  const moduleId = resolution?.module?.id || '';
  const schemaVersion = versionFromSchemaId(schemaId || moduleId);
  const rootValidationVersion = 'tiinex.root.v1';
  const integrityMethodVersions = integrityVersionsFor(parsed);
  const proof = validationProofLevels({ parsed, machineContract, findings });
  if (!availability?.available) return { state: 'not-run-body-unavailable', coverage: 'body-unavailable', rootValidator: 'not-run', childValidator: 'skipped', rootValidationVersion, childValidationVersion: schemaVersion, integrityMethodVersions, ...proof };
  if (supporting) return { state: 'not-applicable-supporting', coverage: 'supporting-material', rootValidator: 'not-applicable', childValidator: 'not-applicable', rootValidationVersion, childValidationVersion: '', integrityMethodVersions, ...proof };
  const fallbackUsed = Boolean(resolution?.fallbackUsed);
  const exactRoot = !fallbackUsed && (moduleId === 'tiinex.root.v1' || schemaId === 'tiinex.root.v1');
  const exactChildValidatorRan = !fallbackUsed && childValidatorRan && moduleId && moduleId !== 'tiinex.root.v1';
  const childValidatorUnavailable = Boolean(schemaId) && !exactRoot && !exactChildValidatorRan;
  if (exactChildValidatorRan) return { state: 'exact-schema-validated', coverage: machineContract?.available ? 'compiled-machine-contract+schema-companion' : 'schema-companion-without-compiled-contract', rootValidator: 'diagnostic', childValidator: 'run', rootValidationVersion, childValidationVersion: schemaVersion || moduleId, integrityMethodVersions, ...proof };
  if (exactRoot) return { state: 'root-validated', coverage: machineContract?.available ? 'compiled-machine-contract' : 'root-readability-diagnostic', rootValidator: 'diagnostic', childValidator: 'not-applicable', rootValidationVersion, childValidationVersion: '', integrityMethodVersions, ...proof };
  if (!fallbackUsed && !exactRoot && machineContract?.available && !exactChildValidatorRan) return { state: 'compiled-schema-validated', coverage: 'compiled-machine-contract', rootValidator: 'diagnostic', childValidator: 'compiled-contract', rootValidationVersion, childValidationVersion: schemaVersion || moduleId, integrityMethodVersions, ...proof };
  if (childValidatorUnavailable) return { state: 'root-only-child-validator-unavailable', coverage: fallbackUsed ? 'root-fallback' : 'root-only', rootValidator: 'diagnostic', childValidator: 'unavailable', rootValidationVersion, childValidationVersion: schemaVersion || schemaId, integrityMethodVersions, ...proof };
  return { state: 'validation-unknown', coverage: machineContract?.available ? 'compiled-machine-contract' : 'unknown', rootValidator: parsed ? 'diagnostic' : 'not-run', childValidator: 'unknown', rootValidationVersion, childValidationVersion: schemaVersion, integrityMethodVersions, ...proof };
}

function validationProofLevels({ parsed = null, machineContract = null, findings = [] } = {}) {
  const parent = parsed?.envelope?.parent || {};
  const parentDeclared = Boolean(parent?.schema?.id || parent?.trace || parent?.origin || parent?.createdAt || parent?.originEntries?.length);
  const localContinuityReadable = parentDeclared ? Boolean(parent?.schema?.id && parent?.trace && (parent?.origin || parent?.originEntries?.length)) : true;
  const semanticState = machineContract?.available ? String(machineContract.state || 'unresolved') : 'unavailable';
  const integrityState = findings.some((finding) => finding.code === 'integrity.c14n-v2.mismatch' || finding.code === 'integrity.c14n-v2.ambiguous' || finding.code === 'integrity.method-reference.unqualified')
    ? 'invalid-or-unverified'
    : findings.some((finding) => finding.code === 'integrity.c14n-v2.verified') ? 'verified' : parsed?.hasIntegrity ? 'declared-unverified' : 'missing';
  return Object.freeze({
    readability: Object.freeze({ state: parsed?.hasContinuityContext ? 'readable' : 'incomplete' }),
    localContinuity: Object.freeze({ state: parentDeclared ? (localContinuityReadable ? 'readable-local-continuity' : 'incomplete') : 'lineage-root' }),
    semanticContract: Object.freeze({ state: semanticState, available: Boolean(machineContract?.available), schemaId: String(machineContract?.schemaId || ''), lineage: Object.freeze([...(machineContract?.lineage || [])]) }),
    integrity: Object.freeze({ state: integrityState }),
    exactCreationProof: Object.freeze({ state: 'not-evaluated-on-reopen' }),
    exportReadiness: Object.freeze({ state: 'not-evaluated-on-reopen' })
  });
}

function versionFromSchemaId(value = '') {
  const text = String(value || '');
  const match = text.match(/\.v(\d+)(?:\.|$)/);
  return match ? `v${match[1]}` : '';
}
function integrityVersionsFor(parsed = null) {
  const methods = Array.isArray(parsed?.integrity?.methods) ? parsed.integrity.methods : [];
  return [...new Set(methods.map((method) => {
    const text = String(method || '');
    const match = text.match(/c14n-v(\d+)/i) || text.match(/-v(\d+)(?:\b|$)/i);
    return match ? `v${match[1]}` : '';
  }).filter(Boolean))];
}
