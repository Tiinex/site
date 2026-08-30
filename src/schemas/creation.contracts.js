import { parseArtifactMarkdown } from '../artifacts/artifact.parse.js';
import { rootValidate } from './tiinex.root.v1.validate.js';
import { resolveSchemaCapabilities, CapabilityStatus } from './capability.registry.js';
import { schemaRegistry } from './registry.js';
import { resolveSchemaModule as resolveRegisteredSchemaModule } from './resolver.js';
import { executeArtifactCreationCapability, qualifyArtifactCreationCapability } from './creation.capability.js';
import { canonicalC14nV2SelfState, verifyC14nV2TargetSelfDigest } from '../integrity/integrity.c14nV2.js';
import { validatePortableContractInstance } from '../tooling/portable/schema/contract.validate.js';
import { projectPortableValidationContractWithQualifiedLocalRoot } from '../tooling/portable/schema/qualifiedLocalRoot.projection.js';
import { qualifyRootCreationRepresentation, qualifyContinuationCreationRepresentation } from './creation.representation.js';
import { qualifyCreationSchemaReferences, schemaReferenceAuthoritiesForCreation } from './creation.schemaReferences.js';
import { qualifySchemaReferenceValue } from './schema.reference.js';
import { C14N_V2_METHOD_ID, integrityMethodReferenceAuthorityForCreation } from '../integrity/integrity.methodReference.js';

export const ARTIFACT_CREATION_CONTRACT_SCHEMA_ID = 'tiinex.artifact.creation.contract.v1';
export const ARTIFACT_CREATION_RESULT_VALIDATION_SCHEMA_ID = 'tiinex.artifact.creation.result.validation.v1';
export const ROOT_SCHEMA_ID = 'tiinex.root.v1';

export function listCreatableArtifactSchemas(registry = schemaRegistry) {
  const modules = Array.isArray(registry.modules) ? registry.modules : [];
  return modules
    .filter((module) => module?.kind === 'concrete' && module?.role === 'core-artifact')
    .map((module) => buildArtifactCreationContract({ schemaId: module.id, module }))
    .filter((contract) => contract.status === 'ready');
}

export function buildArtifactCreationContract(input = {}, options = {}) {
  const schemaId = String(input.schemaId || input.id || input.module?.id || '').trim();
  const resolution = input.module ? { module: input.module, fallbackUsed: false, descriptor: describeModuleThroughResolution(input.module) } : resolveSchemaCapabilities({ schemaId });
  const descriptor = input.module ? resolution.descriptor : resolution.descriptor;
  const module = input.module || resolveRegisteredSchemaModule({ schemaId })?.module || null;
  const schemaReferences = schemaReferenceAuthoritiesForCreation(module, input.schemaReferences || options.schemaReferences || null);
  const integrityMethodReferences = Object.freeze({
    primarySelf: integrityMethodReferenceAuthorityForCreation(
      C14N_V2_METHOD_ID,
      Object.prototype.hasOwnProperty.call(input, 'integrityMethodReference') ? input.integrityMethodReference : options.integrityMethodReference
    )
  });
  const fallbackUsed = Boolean(resolution.fallbackUsed && !input.module);
  const transitionType = String(input.transitionType || options.transitionType || 'create-artifact').trim();
  const creationCapability = qualifyArtifactCreationCapability(module, transitionType);
  const creationAuthority = creationCapability.authority?.compiledContract?.creation || {};
  const creation = Object.freeze({
    requiredInputs: Object.freeze([...(creationAuthority.requiredInputs || [])]),
    optionalInputs: Object.freeze([...(creationAuthority.optionalInputs || [])]),
    requiredSections: Object.freeze([...(creationAuthority.requiredSections || [])]),
    toolingConfigurationFields: Object.freeze([...(creationAuthority.toolingConfigurationFields || [])]),
    inputBindings: Object.freeze([...(creationAuthority.inputBindings || [])]),
    requiredShape: Object.freeze([...(creationAuthority.requiredShape || [])])
  });
  const renderer = creationCapability.implementation?.state === 'implemented'
    ? { status: CapabilityStatus.implemented, ...(creationCapability.implementation.renderer || {}) }
    : { status: CapabilityStatus.unavailable, id: '', scope: transitionType };
  const isCreatable = creationCapability.authority?.state === 'qualified' && renderer.status === CapabilityStatus.implemented && !fallbackUsed;
  const findings = [];

  if (!schemaId) findings.push(error('creation.schema.required', 'Creation contract requires a target schema id.'));
  if (fallbackUsed) findings.push(error('creation.schema.fallback-blocked', `Cannot create ${schemaId || 'unknown schema'} through Root fallback; choose an implemented schema module.`));
  if (creationCapability.authority?.state !== 'qualified') findings.push(error('creation.authority.missing', `${schemaId || 'target schema'} does not expose an exact Artifact Creation Contract authority.`));
  if (renderer.status !== 'implemented') findings.push(error('creation.renderer.missing', `${schemaId || 'target schema'} does not have an implemented creation renderer for ${transitionType}.`));
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
    creation,
    executionQualification: creationCapability.implementation?.executionQualification || null,
    resultBoundary: Object.freeze({
      mode: 'browser-local-draft',
      sourceMutation: 'none',
      remoteWrite: false,
      mayInheritParentSource: false,
      allowedSourceModePrefix: 'local-'
    }),
    requiredEnvelope: Object.freeze({
      envelopeSchemaId: ROOT_SCHEMA_ID,
      parentMode: 'forbidden-for-root-required-when-parent-supplied',
      parentFieldsWhenPresent: Object.freeze(['Parent Schema', 'Trace', 'Origin']),
      parentOrigin: 'required-and-labelled-when-parent-present',
      currentFields: Object.freeze(['Current Schema', 'Created At', 'Summary']),
      integrityFooter: 'required'
    }),
    schemaReferences,
    integrityMethodReferences,
    capabilities: Object.freeze({
      create: isCreatable ? CapabilityStatus.implemented : CapabilityStatus.unavailable,
      semanticCreationAuthority: creationCapability.authority?.state || 'unavailable',
      createRenderer: renderer.status,
      fallback: descriptor?.actions?.fallback?.status || CapabilityStatus.unavailable,
      validate: descriptor?.actions?.validate?.status || CapabilityStatus.unavailable,
      present: descriptor?.actions?.present?.status || CapabilityStatus.unavailable
    }),
    renderer: Object.freeze(renderer),
    findings: Object.freeze(findings)
  });
}

export function renderArtifactCreationCandidateMarkdown(contract = {}, input = {}) {
  if (contract?.status !== 'ready') return '';
  const schemaId = String(contract?.target?.schemaId || '').trim();
  const transitionType = String(contract?.transitionType || 'create-artifact').trim();
  const resolution = resolveRegisteredSchemaModule({ schemaId });
  const module = resolution?.fallbackUsed ? null : resolution?.module || null;
  if (!module) return '';
  const executed = executeArtifactCreationCapability(module, transitionType, contract, input);
  return executed.state === 'rendered' ? executed.markdown : '';
}

export function createArtifactDraftMarkdown(contract = {}, input = {}) {
  const schemaId = String(contract?.target?.schemaId || '').trim();
  const markdown = renderArtifactCreationCandidateMarkdown(contract, input);
  if (!markdown) return '';
  const parentRecord = input.parentRecord || {};
  const validation = validateArtifactCreationResult({ schemaId, status: 'local', sourceMode: 'local-create', path: input.childPath || '', markdown }, parentRecord, {
    contract,
    childPath: input.childPath || '',
    ...(Object.prototype.hasOwnProperty.call(input, 'authors') ? { expectedAuthors: input.authors } : {})
  });
  return validation.ok ? markdown : '';
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
  const contract = options.contract || draft.creationContract || buildArtifactCreationContract({ schemaId: draft.schemaId || draft.targetSchemaId || '' });
  const parsed = parseArtifactMarkdown(draft.markdown || '');
  const findings = [];
  findings.push(...validateArtifactCreationContract(contract).findings);
  findings.push(...validateTargetSchema(parsed, contract));
  findings.push(...validateCreationSchemaReferences(draft.markdown || '', contract));
  findings.push(...validatePortableRootTargetCreationResult(draft.markdown || '', contract, { parentRecord }));

  const rootCreation = String(contract?.transitionType || 'create-artifact') === 'create-artifact';
  const currentSchemaId = parsed.envelope?.current?.schema?.id || '';
  const expectedSchemaId = contract.target?.schemaId || draft.schemaId || draft.targetSchemaId || '';
  const parent = parsed.envelope?.parent || {};
  const suppliedParent = parentRecordHasAnyValue(parentRecord);
  const parentExpected = !rootCreation && suppliedParent;
  const parentObserved = parsedParentHasAnyValue(parent);
  if (expectedSchemaId && currentSchemaId !== expectedSchemaId) findings.push(error('creation.current.schema.mismatch', `Creation result Current Schema must be ${expectedSchemaId}.`));
  if (options.expectedAuthors !== undefined && String(parsed.envelope?.current?.authors || '') !== String(options.expectedAuthors)) findings.push(error('creation.current.authors.mismatch', 'Creation result Current Authors must preserve the caller-supplied exact value.'));
  if (rootCreation && suppliedParent) findings.push(error('creation.parent.input.unexpected', 'Standalone/root creation must not accept a Continuity Parent input.'));
  if (!parentExpected && parentObserved) findings.push(error('creation.parent.unexpected', 'Standalone/root creation must not invent Continuity Parent truth.'));

  if (rootCreation) findings.push(...validateRootCreationRepresentation(draft.markdown || '', contract));
  else if (parentExpected) {
    const relativeReference = relativePath(dirname(options.childPath || draft.path || ''), parentRecord.path || '');
    const parentIntegrityTarget = qualifiedParentIntegrityTarget(parentRecord, relativeReference);
    const representation = qualifyContinuationCreationRepresentation(draft.markdown || '', contract, parentRecord, { relativeReference, parentIntegrityTarget });
    findings.push(...(representation.findings || []).map((message, index) => error(`creation.continuation-representation.${index + 1}`, message)));
    findings.push(...validateParentTargetIntegrity(parsed, parentRecord, parentIntegrityTarget));
    const parentSchemaAuthority = parentRecord.schemaReferenceAuthority || {};
    const parentSchemaReference = qualifySchemaReferenceValue(parent.schema?.raw || '', parentSchemaAuthority);
    for (const [index, message] of (parentSchemaReference.findings || []).entries()) findings.push(error(`creation.parent-schema-reference.${index + 1}`, message));
    if (parentSchemaAuthority.resolutionState !== 'qualified') findings.push(error('creation.parent-schema-reference.unresolved', 'Exact continuation requires the declared Parent Schema reference authority to be resolver-qualified.'));
  } else if (!rootCreation) findings.push(error('creation.parent.required', 'Continuation creation requires an exact supplied Parent authority.'));

  if (draft.status !== 'local') findings.push(error('creation.result.status.not-local', 'Creation result must stay local until explicit publication/export.'));
  if (!String(draft.sourceMode || '').startsWith('local-')) findings.push(error('creation.result.sourceMode.not-local', 'Creation result must use a browser-local sourceMode.'));
  if (draft.source?.adapterId) findings.push(error('creation.result.source.inherited', 'Creation result must not inherit source object from its parent.'));
  if (!parsed.hasIntegrity) findings.push(error('creation.integrity.required', 'Creation result must include Continuity Integrity.'));

  return makeValidation(ARTIFACT_CREATION_RESULT_VALIDATION_SCHEMA_ID, findings, {
    targetSchemaId: expectedSchemaId,
    currentSchemaId,
    parentTrace: parent.trace || '',
    parentOrigin: parent.origin || '',
    contractId: contract.id || ''
  });
}



function validateParentTargetIntegrity(parsed = {}, parentRecord = {}, expectedTarget = '') {
  const entries = (parsed?.integrity?.entries || []).filter((entry) => entry?.method === C14N_V2_METHOD_ID && String(entry?.towards || '') !== 'self');
  if (entries.length !== 1) return [];
  const entry = entries[0];
  if (!expectedTarget || String(entry.towards || '') !== String(expectedTarget)) return [];
  const result = verifyC14nV2TargetSelfDigest({ value: entry.value || '', targetMarkdown: parentRecord.markdown || '' });
  if (result.state === 'verified') return [];
  const code = result.state === 'mismatch'
    ? 'creation.integrity.parent-target.mismatch'
    : result.state === 'target-self-mismatch'
      ? 'creation.integrity.parent-self.mismatch'
      : result.state === 'ambiguous'
        ? 'creation.integrity.parent-self.ambiguous'
        : 'creation.integrity.parent-self.unavailable';
  return [error(code, `Parent-target c14n-v2 verification failed: ${result.reason || result.state}.`)];
}

function qualifiedParentIntegrityTarget(parentRecord = {}, relativeReference = '') {
  const published = parentRecord?.publishedReference || parentRecord?.browseGitReference || parentRecord?.browseGit || null;
  const target = typeof published === 'string' ? '' : String(published?.target || published?.url || '');
  const state = typeof published === 'string' ? 'unresolved' : String(published?.state || published?.resolutionState || 'unresolved');
  const recoveryMode = String(parentRecord?.recoveryMode || parentRecord?.parentRecoveryMode || '').trim() === 'external-versioned' ? 'external-versioned' : 'local-relative';
  if (recoveryMode === 'external-versioned') return state === 'qualified' && target ? target : '';
  return state === 'qualified' && target ? target : String(relativeReference || '');
}

function validateRootCreationRepresentation(markdown = '', contract = {}) {
  const qualification = qualifyRootCreationRepresentation(markdown, contract);
  return (qualification.findings || []).map((message, index) => error(`creation.representation.multiplicity.${index + 1}`, message));
}

function validateCreationSchemaReferences(markdown = '', contract = {}) {
  const qualification = qualifyCreationSchemaReferences(markdown, contract);
  return (qualification.findings || []).map((message, index) => error(`creation.schema-reference.${index + 1}`, message));
}

function validatePortableRootTargetCreationResult(markdown = '', contract = {}, options = {}) {
  const targetSchemaId = String(contract?.target?.schemaId || '').trim();
  const resolution = resolveRegisteredSchemaModule({ schemaId: targetSchemaId });
  const module = resolution?.fallbackUsed ? null : resolution?.module || null;
  const baseValidationContract = module?.schemaSource?.qualify?.()?.compiledContract?.validationContract || null;
  const runtimeProjection = projectPortableValidationContractWithQualifiedLocalRoot(baseValidationContract);
  const validationContract = runtimeProjection.state === 'qualified' ? runtimeProjection.compiledContract : null;
  const findings = [];
  if (!validationContract) return [error('creation.portable-contract.unavailable', `Portable Root + ${targetSchemaId || 'target'} structural validation projection is unavailable.`)];
  try {
    const result = validatePortableContractInstance({ markdown, compiledContract: validationContract });
    for (const item of result.findings || []) {
      if (item?.severity === 'error') findings.push(error(`creation.portable-contract.${item.code || 'invalid'}`, item.message || 'Portable contract validation failed.'));
      else if (item?.severity === 'warning') findings.push(warning(`creation.portable-contract.${item.code || 'warning'}`, item.message || 'Portable contract validation is degraded.'));
    }
    if (result.status !== 'valid' && !(result.findings || []).some((item) => item?.severity === 'error') && !findings.some((item) => item.severity === 'error')) findings.push(error('creation.portable-contract.not-valid', `Portable Root + target structural validation is ${result.status}.`));
  } catch (exception) {
    findings.push(error('creation.portable-contract.failed', String(exception?.message || exception || 'Portable contract validation failed.')));
  }
  const integrity = canonicalC14nV2SelfState(markdown);
  if (integrity.state !== 'verified') findings.push(error('creation.integrity.self.not-verified', `Created artifact self-integrity is not verified: ${integrity.reason || integrity.state}.`));
  return findings;
}

function validateTargetSchema(parsed = {}, contract = {}) {
  const targetSchemaId = contract.target?.schemaId || parsed.envelope?.current?.schema?.id || '';
  const resolution = resolveRegisteredSchemaModule({ schemaId: targetSchemaId });
  const module = resolution?.module || null;
  const findings = [];
  if (resolution?.fallbackUsed) {
    findings.push(error('creation.validator.root-fallback', `Cannot validate ${targetSchemaId || 'unknown schema'} with a target module; root fallback would be used.`));
    return findings.concat(rootValidate(parsed).map(normalizeFinding));
  }
  if (typeof module?.validate === 'function') return module.validate(parsed).map(normalizeFinding);
  if (hasQualifiedCompiledValidation(module)) return [];
  findings.push(error('creation.validator.unavailable', `${targetSchemaId || 'target schema'} has neither a schema-specific validator nor a qualified compiled validation contract.`));
  return findings.concat(rootValidate(parsed).map(normalizeFinding));
}

function hasQualifiedCompiledValidation(module = {}) {
  const qualification = typeof module?.schemaSource?.qualify === 'function' ? module.schemaSource.qualify() : null;
  return Boolean(qualification?.state === 'qualified' && qualification?.compiledContract?.validationContract?.lineageQualification?.state === 'valid');
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
      create: { status: qualifyArtifactCreationCapability(module, 'create-artifact').ready ? CapabilityStatus.implemented : CapabilityStatus.unavailable },
      fallback: { status: module.capabilities?.canRenderFallback === true ? CapabilityStatus.implemented : CapabilityStatus.fallback },
      validate: { status: typeof module.validate === 'function' || hasQualifiedCompiledValidation(module) ? CapabilityStatus.implemented : CapabilityStatus.unavailable },
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

function stableContractId(schemaId, transitionType) { return `creation:${transitionType || 'create'}:${schemaId || 'unknown'}`; }
function labelFromSchemaId(id = '') { const tail = String(id || '').split('.').filter(Boolean).slice(-2, -1)[0] || String(id || 'artifact'); return tail.charAt(0).toUpperCase() + tail.slice(1); }
function parentRecordHasAnyValue(record = {}) { return Boolean(record?.id || record?.path || record?.schemaId || record?.currentSchemaId || record?.continuationTrace || record?.publishedReference?.target || record?.schemaReferenceAuthority?.preferredTarget); }
function parsedParentHasAnyValue(parent = {}) { return Boolean(parent?.schema?.id || parent?.trace || parent?.origin || parent?.boundary || parent?.createdAt || parent?.originEntries?.length); }
function originMatchesPath(origin = '', path = '') { return normalizePath(origin).endsWith(normalizePath(path)); }
function normalizePath(value = '') { return String(value || '').replace(/^https?:\/\/github\.com\/[^/]+\/[^/]+\/blob\/[^/]+\//, '').replace(/^https?:\/\/raw\.githubusercontent\.com\/[^/]+\/[^/]+\/[^/]+\//, '').replace(/^\/+/, '').replace(/\\/g, '/'); }
function normalizeFinding(finding = {}) { return { severity: finding.severity || 'info', code: finding.code || 'creation.finding', message: finding.message || '', source: finding.source || ARTIFACT_CREATION_CONTRACT_SCHEMA_ID }; }
function finding(severity, code, message) { return { severity, code, message, source: ARTIFACT_CREATION_CONTRACT_SCHEMA_ID }; }
function error(code, message) { return finding('error', code, message); }
function warning(code, message) { return finding('warning', code, message); }

function canonicalPath(value='') { return String(value || '').replace(/\\/g,'/').replace(/^\.\//,'').replace(/^\/+|\/+$/g,''); }
function dirname(value='') { const p=canonicalPath(value); const i=p.lastIndexOf('/'); return i<0?'':p.slice(0,i); }
function relativePath(fromDir='', toPath='') { const from=canonicalPath(fromDir).split('/').filter(Boolean), to=canonicalPath(toPath).split('/').filter(Boolean); let i=0; while(i<from.length&&i<to.length&&from[i]===to[i])i++; return [...Array(from.length-i).fill('..'),...to.slice(i)].join('/') || (to.at(-1)||''); }
