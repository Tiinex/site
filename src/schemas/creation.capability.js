import { parseArtifactMarkdown } from '../artifacts/artifact.parse.js';
import { qualifiedCreationAuthorityFromSchemaSource } from './schema.source.js';
import { canonicalC14nV2SelfState } from '../integrity/integrity.c14nV2.js';
import { validatePortableContractInstance } from '../tooling/portable/schema/contract.validate.js';
import { qualifyRootCreationRepresentation } from './creation.representation.js';
import { canonicalRootCreatedAt } from './creation.rootMetadata.js';
import { snapshotOrdinaryCreationExecutionInput } from './creation.executionSnapshot.js';
import { qualifyCreationSchemaReferences, schemaReferenceAuthoritiesForCreation } from './creation.schemaReferences.js';

export const ARTIFACT_CREATION_AUTHORITY_SECTION = 'Artifact Creation Contract';
const executionQualificationCache = new WeakMap();

export function defineArtifactCreationCapability(binding = {}, implementation = null) {
  void binding; // compatibility input only; binding is not semantic proof.
  return Object.freeze({
    implementation: implementation ? Object.freeze({
      status: implementation.status || 'implemented',
      renderer: Object.freeze({ ...(implementation.renderer || {}) }),
      execute: typeof implementation.execute === 'function' ? implementation.execute : null,
      qualifyRequiredShape: typeof implementation.qualifyRequiredShape === 'function' ? implementation.qualifyRequiredShape : null,
      transitionTypes: Object.freeze([...(implementation.transitionTypes || [])].map((value) => String(value || '').trim()).filter(Boolean))
    }) : null
  });
}

export function qualifyArtifactCreationCapability(module = {}, transitionType = '') {
  const capability = module?.artifactCreation || null;
  const schemaId = String(module?.id || '').trim();
  const authority = qualifiedCreationAuthorityFromSchemaSource(module);
  const implementation = capability?.implementation || null;
  const supportedTransitions = new Set(implementation?.transitionTypes || []);
  const transition = String(transitionType || 'create-artifact').trim();
  const callable = Boolean(
    implementation?.status === 'implemented'
    && typeof implementation?.execute === 'function'
    && (supportedTransitions.has('*') || supportedTransitions.has(transition))
  );
  const execution = callable && authority.state === 'qualified'
    ? executionQualification(module, authority, implementation, transition)
    : Object.freeze({ state: 'unavailable', qualificationScope: 'representative-preflight', reason: !callable ? 'execution-owner-unavailable' : 'semantic-authority-unavailable', findings: Object.freeze([]) });
  const implementationReady = callable && (transition !== 'create-artifact' || execution.state === 'qualified');
  return Object.freeze({
    schemaId,
    transitionType: transition,
    authority,
    implementation: Object.freeze({
      state: implementationReady ? 'implemented' : 'unavailable',
      status: implementation?.status || 'unavailable',
      renderer: Object.freeze({ ...(implementation?.renderer || {}) }),
      executableOwner: implementationReady ? (transition === 'create-artifact' ? 'representative-preflight-qualified-execution' : 'callable') : 'unavailable',
      executionQualification: execution,
      transitionTypes: Object.freeze([...(implementation?.transitionTypes || [])])
    }),
    ready: authority.state === 'qualified' && implementationReady
  });
}

export function executeArtifactCreationCapability(module = {}, transitionType = 'create-artifact', contract = {}, input = {}) {
  const qualification = qualifyArtifactCreationCapability(module, transitionType);
  const implementation = module?.artifactCreation?.implementation || null;
  if (!qualification.ready || typeof implementation?.execute !== 'function') return Object.freeze({ state: 'unavailable', reason: 'creation-capability-not-ready', markdown: '', qualification: executionQualificationSummary(qualification, null) });
  try {
    const rootCreation = String(transitionType || 'create-artifact') === 'create-artifact';
    let snapshot = null;
    if (rootCreation) {
      try { snapshot = snapshotOrdinaryCreationExecutionInput(contract, input); }
      catch (error) {
        const message = String(error?.message || error || 'creation-execution-snapshot-failed');
        const metadataFailure = Object.freeze({ state: 'failed', findings: Object.freeze([message]), createdAt: Object.freeze({ expected: '', observed: '' }) });
        return Object.freeze({ state: 'unavailable', reason: message, markdown: '', error, qualification: executionQualificationSummary(qualification, { executionMetadataQualification: metadataFailure }) });
      }
    }
    const executionInput = rootCreation ? snapshot.implementationInput : input;
    const result = implementation.execute(contract, executionInput);
    const markdown = executionMarkdown(result);
    if (!markdown) return Object.freeze({ state: 'unavailable', reason: 'creation-execution-empty', markdown: '', result, qualification: executionQualificationSummary(qualification, null) });
    if (!rootCreation) return Object.freeze({ state: 'rendered', reason: '', markdown, result, qualification: executionQualificationSummary(qualification, null) });
    const concrete = qualifyOrdinaryCreationExecutionResult(module, qualification.authority, contract, snapshot.authority, markdown);
    const summary = executionQualificationSummary(qualification, concrete);
    if (concrete.state !== 'qualified') return Object.freeze({ state: 'unavailable', reason: 'creation-concrete-execution-unqualified', markdown: '', result, qualification: summary, findings: concrete.findings });
    return Object.freeze({ state: 'rendered', reason: '', markdown, result, qualification: summary });
  } catch (error) {
    return Object.freeze({ state: 'unavailable', reason: String(error?.message || error || 'creation-execution-failed'), markdown: '', error, qualification: executionQualificationSummary(qualification, null) });
  }
}

function executionQualification(module, authority, implementation, transition) {
  if (transition !== 'create-artifact') return Object.freeze({ state: 'qualified', qualificationScope: 'transition-callable', reason: '', findings: Object.freeze([]) });
  let perModule = executionQualificationCache.get(module);
  if (!perModule) { perModule = new Map(); executionQualificationCache.set(module, perModule); }
  const cacheKey = `${transition}\u0000${authority.checksum || ''}`;
  if (perModule.has(cacheKey)) return perModule.get(cacheKey);
  const result = probeOrdinaryCreationExecution(module, authority, implementation);
  perModule.set(cacheKey, result);
  return result;
}

function probeOrdinaryCreationExecution(module = {}, authority = {}, implementation = {}) {
  const creation = authority?.compiledContract?.creation || {};
  const schemaId = String(module?.id || authority?.schemaId || '').trim();
  const inputBindings = Object.freeze([...(creation.inputBindings || [])]);
  const requiredInputs = Object.freeze([...(creation.requiredInputs || [])]);
  const contract = Object.freeze({
    transitionType: 'create-artifact',
    target: Object.freeze({ schemaId, label: String(module?.label || schemaId || 'Artifact') }),
    schemaReferences: schemaReferenceAuthoritiesForCreation(module),
    creation: Object.freeze({
      requiredInputs,
      optionalInputs: Object.freeze([...(creation.optionalInputs || [])]),
      requiredSections: Object.freeze([...(creation.requiredSections || [])]),
      toolingConfigurationFields: Object.freeze([...(creation.toolingConfigurationFields || [])]),
      inputBindings,
      requiredShape: Object.freeze([...(creation.requiredShape || [])])
    })
  });
  const unsupported = requiredInputs.filter((name) => {
    const binding = inputBindings.find((item) => String(item?.input || '') === String(name || ''));
    return !binding || !['section-body', 'root-current-summary-body-title'].includes(String(binding.kind || ''));
  });
  if (unsupported.length) return Object.freeze({ state: 'unavailable', qualificationScope: 'representative-preflight', reason: 'required-input-binding-unavailable', findings: Object.freeze(unsupported.map((name) => `No exact qualified representation binding exists for required creation input: ${name}.`)), inputFidelity: 'representative-failed' });

  const values = Object.freeze(Object.fromEntries(requiredInputs.map((name, index) => [name, `TIINEX_CREATE_INPUT_${index + 1}_${sentinelToken(name)}`])));
  const rawInput = Object.freeze({ values, createdAt: '2026-08-20T00:00:00.000Z' });
  const snapshot = snapshotOrdinaryCreationExecutionInput(contract, rawInput);
  let output;
  try { output = implementation.execute(contract, snapshot.implementationInput); }
  catch (error) { return Object.freeze({ state: 'unavailable', qualificationScope: 'representative-preflight', reason: 'execution-threw', findings: Object.freeze([String(error?.message || error || 'execution-threw')]), inputFidelity: 'representative-failed' }); }
  const markdown = executionMarkdown(output);
  if (!markdown) return Object.freeze({ state: 'unavailable', qualificationScope: 'representative-preflight', reason: 'execution-empty', findings: Object.freeze(['Creation execution owner returned no Markdown.']), inputFidelity: 'representative-failed' });
  const concrete = qualifyOrdinaryCreationExecutionResult(module, authority, contract, snapshot.authority, markdown);
  return Object.freeze({
    state: concrete.state,
    qualificationScope: 'representative-preflight',
    reason: concrete.state === 'qualified' ? '' : 'representative-execution-qualification-failed',
    findings: concrete.findings,
    observedSchemaId: concrete.observedSchemaId,
    observedSections: concrete.observedSections,
    observedInputBindings: inputBindings,
    inputFidelity: concrete.inputBindingQualification.state === 'qualified' ? 'representative-qualified' : 'representative-failed',
    executionMetadataFidelity: concrete.executionMetadataQualification.state,
    portableContractQualification: concrete.portableContractQualification.state,
    requiredShapeQualification: concrete.requiredShapeQualification.state,
    integrityQualification: concrete.integrityQualification.state
  });
}

function qualifyOrdinaryCreationExecutionResult(module = {}, authority = {}, contract = {}, input = {}, markdown = '') {
  let parsed;
  try { parsed = parseArtifactMarkdown(markdown); }
  catch (error) {
    const message = String(error?.message || error || 'creation-execution-unparseable');
    const failed = Object.freeze({ state: 'failed', findings: Object.freeze([message]) });
    return Object.freeze({ state: 'unavailable', findings: Object.freeze([message]), inputBindingQualification: failed, executionMetadataQualification: failed, representationQualification: failed, schemaReferenceQualification: failed, requiredShapeQualification: failed, portableContractQualification: failed, integrityQualification: Object.freeze({ state: 'unavailable', findings: Object.freeze([message]) }), observedSchemaId: '', observedSections: Object.freeze([]) });
  }
  const creation = contract?.creation || authority?.compiledContract?.creation || {};
  const schemaId = String(contract?.target?.schemaId || module?.id || authority?.schemaId || '').trim();
  const requiredInputs = Object.freeze([...(creation.requiredInputs || [])]);
  const inputBindings = Object.freeze([...(creation.inputBindings || [])]);
  const values = creationValues(input);
  const representationQualification = qualifyRootCreationRepresentation(markdown, { creation });
  const schemaReferenceQualification = qualifyCreationSchemaReferences(markdown, contract);
  const inputFindings = [...(representationQualification.findings || [])];
  const metadataFindings = [];
  if (String(parsed?.envelope?.current?.schema?.id || '') !== schemaId) inputFindings.push(`Current Schema must be ${schemaId}.`);
  if (parsedParentHasAnyValue(parsed?.envelope?.parent || {})) inputFindings.push('Standalone create execution invented Continuity Parent truth.');
  for (const name of requiredInputs) {
    const binding = inputBindings.find((item) => String(item?.input || '') === String(name || ''));
    if (!binding || !['section-body', 'root-current-summary-body-title'].includes(String(binding.kind || ''))) { inputFindings.push(`No exact qualified representation binding exists for required creation input: ${name}.`); continue; }
    if (!Object.prototype.hasOwnProperty.call(values, name)) { inputFindings.push(`Required creation input is missing under exact declared identity: ${name}.`); continue; }
    const expected = String(values[name]);
    if (binding.kind === 'root-current-summary-body-title') {
      if (String(parsed?.envelope?.current?.summary || '') !== expected) inputFindings.push(`Required input ${name} was not preserved exactly in Current Summary.`);
      if (String(parsed?.body?.title || '') !== expected) inputFindings.push(`Required input ${name} was not preserved exactly in the body title.`);
    } else if (binding.kind === 'section-body') {
      const occurrences = representationQualification.observed?.sectionBodies?.[binding.section] || [];
      const observed = occurrences.length === 1 ? occurrences[0] : undefined;
      if (observed !== expected) inputFindings.push(`Required input ${name} was not preserved exactly in unique section ${binding.section}.`);
    }
  }
  const createdAt = representationQualification.observed?.createdAt || [];
  let expectedCreatedAt = '';
  try { expectedCreatedAt = canonicalRootCreatedAt(input.createdAt); }
  catch (error) { metadataFindings.push(`Concrete creation Created At is not representable: ${String(error?.message || error || 'creation-created-at-unrepresentable')}.`); }
  if (createdAt.length === 1) {
    const observedCreatedAt = String(createdAt[0] || '');
    if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(observedCreatedAt)) metadataFindings.push('Created At is not in canonical Root YYYY-MM-DD hh:mm:ss representation.');
    if (expectedCreatedAt && observedCreatedAt !== expectedCreatedAt) metadataFindings.push(`Created At did not preserve the concrete execution instant; expected ${expectedCreatedAt}.`);
  }
  const requiredShapeQualification = qualifyRequiredShapeCoverage(module?.artifactCreation?.implementation || {}, creation, input, markdown, representationQualification);
  const portableFindings = [];
  const portableValidationContract = authority?.compiledContract?.validationContract || module?.schemaSource?.qualify?.()?.compiledContract?.validationContract || null;
  if (!portableValidationContract) portableFindings.push('Portable Root + target structural validation projection is unavailable.');
  else {
    try {
      const exactValidation = validatePortableContractInstance({ markdown, compiledContract: portableValidationContract });
      if (exactValidation.status !== 'valid') {
        portableFindings.push(`Portable Root + target structural validation is ${exactValidation.status}.`);
        for (const finding of exactValidation.findings || []) if (finding?.severity === 'error') portableFindings.push(String(finding?.message || finding?.code || 'portable-contract-validation-error'));
      }
    } catch (error) { portableFindings.push(String(error?.message || error || 'portable-contract-validation-failed')); }
  }
  const integrity = canonicalC14nV2SelfState(markdown);
  const integrityFindings = integrity.state === 'verified' ? [] : [`Creation result self-integrity is not verified: ${integrity.reason || integrity.state}.`];
  const inputBindingQualification = Object.freeze({ state: inputFindings.length ? 'failed' : 'qualified', findings: Object.freeze(inputFindings) });
  const executionMetadataQualification = Object.freeze({ state: metadataFindings.length ? 'failed' : 'qualified', findings: Object.freeze(metadataFindings), createdAt: Object.freeze({ expected: expectedCreatedAt, observed: createdAt.length === 1 ? String(createdAt[0] || '') : '' }) });
  const portableContractQualification = Object.freeze({ state: portableFindings.length ? 'failed' : 'qualified', coverage: 'portable-structural', findings: Object.freeze(portableFindings) });
  const integrityQualification = Object.freeze({ state: integrity.state, findings: Object.freeze(integrityFindings) });
  const findings = Object.freeze([...inputFindings, ...(schemaReferenceQualification.findings || []), ...metadataFindings, ...(requiredShapeQualification.findings || []), ...portableFindings, ...integrityFindings]);
  return Object.freeze({
    state: findings.length ? 'unavailable' : 'qualified',
    findings,
    inputBindingQualification,
    executionMetadataQualification,
    representationQualification,
    schemaReferenceQualification,
    requiredShapeQualification,
    portableContractQualification,
    integrityQualification,
    observedSchemaId: String(parsed?.envelope?.current?.schema?.id || ''),
    observedSections: Object.freeze([...(parsed?.body?.sections || [])])
  });
}

function executionQualificationSummary(qualification = {}, concrete = null) {
  const representative = qualification?.implementation?.executionQualification || Object.freeze({ state: 'unavailable', qualificationScope: 'representative-preflight', findings: Object.freeze([]) });
  return Object.freeze({
    representativeImplementation: representative,
    concreteInvocationInputBinding: concrete?.inputBindingQualification || Object.freeze({ state: 'not-run', findings: Object.freeze([]) }),
    executionMetadataFidelity: concrete?.executionMetadataQualification || Object.freeze({ state: 'not-run', findings: Object.freeze([]), createdAt: Object.freeze({ expected: '', observed: '' }) }),
    representationMultiplicity: concrete?.representationQualification || Object.freeze({ state: 'not-run', findings: Object.freeze([]) }),
    schemaReferenceAuthority: concrete?.schemaReferenceQualification || Object.freeze({ state: 'not-run', findings: Object.freeze([]) }),
    requiredShapeCoverage: concrete?.requiredShapeQualification || Object.freeze({ state: 'not-run', findings: Object.freeze([]) }),
    portableRootTargetValidation: concrete?.portableContractQualification || Object.freeze({ state: 'not-run', coverage: 'portable-structural', findings: Object.freeze([]) }),
    integrity: concrete?.integrityQualification || Object.freeze({ state: 'not-run', findings: Object.freeze([]) })
  });
}


function qualifyRequiredShapeCoverage(implementation = {}, creation = {}, input = {}, markdown = '', representationQualification = {}) {
  const items = Object.freeze([...(creation.requiredShape || [])]);
  const residualItems = Object.freeze(items.filter((item) => String(item?.primitive?.kind || 'residual') === 'residual'));
  const genericItems = Object.freeze(items.filter((item) => String(item?.primitive?.kind || 'residual') !== 'residual'));
  const findings = [];
  if (representationQualification.state !== 'qualified') findings.push('Generic Required Shape representation is ambiguous or incomplete.');
  let residualResult = Object.freeze({ state: residualItems.length ? 'unavailable' : 'qualified', coveredItemIds: Object.freeze([]), findings: Object.freeze(residualItems.length ? ['Residual Artifact Creation Required Shape authority has no schema-owned qualifier.'] : []) });
  if (residualItems.length && typeof implementation?.qualifyRequiredShape === 'function') {
    try { residualResult = implementation.qualifyRequiredShape({ markdown, residualItems, input, creation }) || residualResult; }
    catch (error) { residualResult = Object.freeze({ state: 'unavailable', coveredItemIds: Object.freeze([]), findings: Object.freeze([String(error?.message || error || 'schema-owned Required Shape qualification failed')]) }); }
  }
  const covered = new Set(residualResult?.coveredItemIds || []);
  for (const item of residualItems) if (!covered.has(item.id)) findings.push(`Residual Artifact Creation Required Shape item is not qualified: ${item.id}.`);
  findings.push(...(residualResult?.findings || []));
  const qualified = representationQualification.state === 'qualified' && findings.length === 0 && residualResult.state === 'qualified';
  return Object.freeze({ state: qualified ? 'qualified' : 'unavailable', coverage: qualified ? 'complete-declared-required-shape' : 'incomplete-declared-required-shape', genericItemIds: Object.freeze(genericItems.map((item) => item.id)), residualItemIds: Object.freeze(residualItems.map((item) => item.id)), coveredResidualItemIds: Object.freeze([...covered]), findings: Object.freeze(findings) });
}

function creationValues(input = {}) {
  const explicit = input.values && typeof input.values === 'object' && !Array.isArray(input.values) ? input.values : {};
  const alternate = input.inputs && typeof input.inputs === 'object' && !Array.isArray(input.inputs) ? input.inputs : {};
  return Object.freeze({ ...alternate, ...explicit });
}
function parsedParentHasAnyValue(parent = {}) { return Boolean(parent?.schema?.id || parent?.trace || parent?.origin || parent?.boundary || parent?.createdAt); }
function sentinelToken(value = '') { return String(value || '').toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'INPUT'; }
function executionMarkdown(result) { if (typeof result === 'string') return result; return typeof result?.markdown === 'string' ? result.markdown : ''; }
