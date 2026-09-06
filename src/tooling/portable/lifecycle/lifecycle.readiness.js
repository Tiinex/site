import { portableFinding, summarizePortableFindings } from '../findings.js';
import { prepareLifecycleMaterial, resolveFactRecord } from './lifecycle.material.js';
import { nextLifecycleAction } from './lifecycle.action.js';

export const PORTABLE_LIFECYCLE_READINESS_SCHEMA_ID = 'tiinex.portable.lifecycle-readiness.v1';
const VALID_REP_STATES = new Set(['resolved', 'active', 'blocked', 'unresolved']);
const VALID_RETEST = new Set(['passed', 'failed']);
const MAX_FACTS = 96;

export function projectPortableLifecycleReadiness(input = {}, options = {}) {
  const material = prepareLifecycleMaterial(input, options);
  const facts = normalizedFacts(input);
  const missingEvidence = [];
  const ambiguities = [];
  const blockers = [];
  const task = material.controllingTask;

  if (task.state !== 'qualified') missingEvidence.push(issue('controlling-task-unqualified', 'The exact controlling Task and its completion/acceptance criteria must qualify before readiness can be projected.'));
  if (material.obligationsOmitted) ambiguities.push(issue('obligation-set-over-bounded-limit', `${material.obligationsOmitted} required work obligation(s) exceed the bounded evaluator limit.`));
  if (material.lineageIssues.length) ambiguities.push(...material.lineageIssues.map((item) => issue(item.code, `Relevant Parent lineage remains ${item.status || 'unresolved'} for ${item.nodeId || item.target || 'work evidence'}.`)));

  const authority = criteriaAuthority(facts.authority);
  if (authority.state !== 'qualified') missingEvidence.push(issue('criteria-authority-unresolved', 'The authority that owns the controlling criteria is not explicitly qualified.'));

  const representativeProjection = projectRepresentatives(material, facts.representatives, missingEvidence, ambiguities, blockers);
  const blockerProjection = projectBlockers(material, facts.blockers, ambiguities, blockers);
  const inputProjection = projectRetestInputs(facts.retestInputs, missingEvidence, ambiguities, blockers);
  const retest = projectRetest(material, facts.retests, authority);
  if (retest.state === 'unresolved') ambiguities.push(...retest.ambiguities);
  const closure = projectClosure(material, facts.closures, authority, retest);
  if (closure.state === 'unresolved') ambiguities.push(...closure.ambiguities);

  const readiness = readinessProjection({ material, retest, closure, missingEvidence, ambiguities, blockers });
  const nextAction = nextLifecycleAction({ readiness, retest, closure, blockers, missingEvidence, ambiguities, controllingTask: task.record });
  const findings = Object.freeze([
    ...(material.findings || []),
    ...missingEvidence.map((item) => portableFinding('warning', `portable.lifecycle.${item.code}`, item.detail, { ref: task.record?.path || task.requested || '' })),
    ...ambiguities.map((item) => portableFinding('warning', `portable.lifecycle.${item.code}`, item.detail, { ref: task.record?.path || task.requested || '' }))
  ]);

  return Object.freeze({
    schema: PORTABLE_LIFECYCLE_READINESS_SCHEMA_ID,
    status: closure.state === 'closed' || (task.state === 'qualified' && readiness.state !== 'unresolved' && retest.state !== 'unresolved' && closure.state !== 'unresolved') ? 'qualified-projection' : 'unresolved',
    controllingTask: Object.freeze({ state: task.state, requested: task.requested, record: task.record, criteria: task.criteria }),
    readiness,
    retest,
    closure,
    currentRepresentatives: representativeProjection.current,
    blockers: Object.freeze(blockers),
    missingEvidence: Object.freeze(missingEvidence),
    ambiguities: Object.freeze(ambiguities),
    authorityBasis: authority,
    nextAction,
    findingSummary: summarizePortableFindings(findings),
    findings,
    boundary: Object.freeze({
      adapterNeutral: true,
      sharedConsumers: Object.freeze(['CLI', 'LLM', 'Viewer', 'VS Code']),
      projectionOnly: true,
      canonicalArtifactTruthPersisted: false,
      canonicalSchemaVocabularyChanged: false,
      parentMeaning: 'direct Task continuity only where exact qualified Task-to-Task Parent evidence exists',
      semanticFacts: 'representative/currentness/blocker/re-test/closure/authority facts must arrive as explicit upstream-qualified normalized evidence; free prose and lexical lifecycle tokens are not interpreted as authority',
      reductionMeaning: 'Reduction may satisfy only representative/re-test-input availability within explicit normalized carry-forward/loss facts; Reduction existence is never completion proof',
      destructiveReduction: false,
      remoteWrite: false,
      sourceMutation: false
    })
  });
}

function projectRepresentatives(material, values, missingEvidence, ambiguities, blockers) {
  const current = [];
  const byObligation = new Map();
  for (const raw of values.slice(0, MAX_FACTS)) {
    const obligation = matchObligation(material.obligations, raw.obligation || raw.task || '');
    if (!obligation) { ambiguities.push(issue('representative-obligation-unresolved', `Representative fact targets unknown obligation ${raw.obligation || raw.task || '(empty)'}.`)); continue; }
    const recordResolution = resolveFactRecord(material, raw.representative || raw.path || obligation.task.path);
    const semanticQualified = String(raw.qualification || raw.semanticState || '') === 'qualified' && nonEmptyBasis(raw.basis);
    const state = VALID_REP_STATES.has(String(raw.state || '')) ? String(raw.state) : 'unresolved';
    const currentness = String(raw.currentness || 'unresolved');
    const exactQualified = Boolean(recordResolution.record && recordResolution.qualification.state === 'qualified' && semanticQualified);
    const projection = Object.freeze({
      obligation: obligation.task,
      representative: recordResolution.record ? identity(recordResolution.record) : Object.freeze({ id: '', path: String(raw.representative || raw.path || '') }),
      state,
      currentness,
      qualification: exactQualified ? 'qualified' : 'unresolved',
      retestInputState: String(raw.retestInputState || raw.inputState || 'unresolved'),
      reduction: reductionBoundary(recordResolution.record, raw),
      basis: compactBasis(raw.basis)
    });
    const list = byObligation.get(obligation.id) || [];
    list.push(projection);
    byObligation.set(obligation.id, list);
  }

  for (const obligation of material.obligations) {
    if (obligation.state !== 'qualified') { ambiguities.push(issue('work-obligation-unqualified', `Required work obligation ${obligation.task?.path || obligation.id} is not qualified.`)); continue; }
    const facts = byObligation.get(obligation.id) || [];
    const currentFacts = facts.filter((item) => item.currentness === 'current');
    const qualifiedCurrent = currentFacts.filter((item) => item.qualification === 'qualified');
    if (!facts.length) { missingEvidence.push(issue('current-representative-missing', `No explicit current representative assessment exists for required work ${obligation.task.path}.`)); continue; }
    if (currentFacts.some((item) => item.qualification !== 'qualified')) { ambiguities.push(issue('current-representative-unqualified', `An apparent current representative for ${obligation.task.path} is not qualified.`)); continue; }
    if (qualifiedCurrent.length !== 1) { ambiguities.push(issue('current-representative-ambiguous', `${obligation.task.path} has ${qualifiedCurrent.length} qualified current representatives; exactly one is required.`)); continue; }
    const rep = qualifiedCurrent[0];
    current.push(rep);
    if (rep.state === 'active' || rep.state === 'blocked') blockers.push(blocker('required-work-current', rep.representative.path || obligation.task.path, rep.state, rep.basis));
    else if (rep.state === 'unresolved') ambiguities.push(issue('current-representative-state-unresolved', `Current representative ${rep.representative.path} has unresolved work state.`));
    if (rep.state === 'resolved') assessRepresentativeInput(rep, blockers, ambiguities);
  }
  return Object.freeze({ current: Object.freeze(current), assessedObligations: byObligation.size });
}

function assessRepresentativeInput(rep, blockers, ambiguities) {
  if (rep.reduction.isReduction) {
    if (rep.reduction.lossState === 'material') blockers.push(blocker('reduction-material-loss', rep.representative.path, 'known-missing-required-input', rep.basis));
    else if (rep.reduction.lossState !== 'none') ambiguities.push(issue('reduction-loss-unresolved', `Reduction representative ${rep.representative.path} has unresolved material loss for re-test inputs.`));
  }
  if (rep.retestInputState === 'missing') blockers.push(blocker('representative-retest-input-missing', rep.representative.path, 'known-missing-required-input', rep.basis));
  else if (rep.retestInputState !== 'available') ambiguities.push(issue('representative-retest-input-unresolved', `Re-test input availability is unresolved for ${rep.representative.path}.`));
}

function projectBlockers(material, values, ambiguities, blockers) {
  const projected = [];
  for (const raw of values.slice(0, MAX_FACTS)) {
    const state = String(raw.state || 'unresolved');
    const qualification = String(raw.qualification || raw.semanticState || '');
    const currentness = String(raw.currentness || 'unresolved');
    if (currentness === 'historical') continue;
    if (qualification !== 'qualified' || !nonEmptyBasis(raw.basis) || currentness !== 'current') {
      ambiguities.push(issue('blocker-currentness-unresolved', `Apparent blocker ${raw.id || raw.label || '(unnamed)'} is not both qualified and current.`));
      continue;
    }
    const item = blocker(String(raw.kind || 'declared-blocker'), String(raw.target || raw.id || ''), state, raw.basis);
    projected.push(item);
    if (['blocking', 'active', 'disputed', 'incomplete'].includes(state)) blockers.push(item);
    else if (!['resolved', 'clear'].includes(state)) ambiguities.push(issue('blocker-state-unresolved', `Qualified current blocker fact ${raw.id || raw.label || '(unnamed)'} has unresolved state ${state}.`));
  }
  return Object.freeze({ items: Object.freeze(projected) });
}

function projectRetestInputs(values, missingEvidence, ambiguities, blockers) {
  const projected = [];
  for (const raw of values.slice(0, MAX_FACTS)) {
    const qualification = String(raw.qualification || raw.semanticState || '');
    const state = String(raw.state || 'unresolved');
    if (qualification !== 'qualified' || !nonEmptyBasis(raw.basis)) { ambiguities.push(issue('retest-input-unqualified', `Required re-test input ${raw.id || raw.label || '(unnamed)'} is not qualified.`)); continue; }
    const item = Object.freeze({ id: String(raw.id || raw.label || ''), state, basis: compactBasis(raw.basis) });
    projected.push(item);
    if (state === 'missing') blockers.push(blocker('required-retest-input-missing', item.id, 'known-missing-required-input', item.basis));
    else if (state !== 'available') ambiguities.push(issue('retest-input-state-unresolved', `Required re-test input ${item.id || '(unnamed)'} has unresolved availability.`));
  }
  return Object.freeze({ items: Object.freeze(projected), declared: values.length, missing: missingEvidence.length });
}

function projectRetest(material, values, authority) {
  const apparent = values.slice(0, MAX_FACTS).filter((raw) => String(raw.currentness || 'current') !== 'historical');
  if (!apparent.length) return retestResult('not-observed', [], [], [], null);
  const qualified = [];
  const ambiguities = [];
  for (const raw of apparent) {
    const record = resolveFactRecord(material, raw.artifact || raw.path || '');
    const state = String(raw.state || raw.outcome || '');
    const exactTarget = matchesTask(material.controllingTask.record, raw.target || raw.scope || '');
    const valid = Boolean(record.record && record.qualification.state === 'qualified' && VALID_RETEST.has(state) && String(raw.qualification || raw.semanticState || '') === 'qualified' && String(raw.currentness || '') === 'current' && nonEmptyBasis(raw.basis) && exactTarget && String(raw.criteriaCoverage || '') === 'complete' && String(raw.methodState || raw.methodQualification || '') === 'qualified' && authorityMatches(authority, raw));
    if (!valid) {
      ambiguities.push(issue('retest-outcome-unqualified', `Apparent re-test outcome ${raw.artifact || raw.path || '(unresolved artifact)'} cannot qualify exact target, criteria coverage, method, currentness, or authority.`));
      continue;
    }
    qualified.push(Object.freeze({ state, artifact: identity(record.record), authorityRole: String(raw.authorityRole || ''), authorityBasis: compactBasis(raw.authorityBasis || raw.basis), basis: compactBasis(raw.basis) }));
  }
  const states = new Set(qualified.map((item) => item.state));
  if (ambiguities.length || qualified.length !== 1 || states.size !== 1) return retestResult('unresolved', qualified, apparent, ambiguities.length ? ambiguities : [issue('retest-outcome-ambiguous', `${qualified.length} qualified current re-test outcomes are present.`)], authority);
  return retestResult(qualified[0].state, qualified, apparent, [], authority);
}

function projectClosure(material, values, authority, retest) {
  const apparent = values.slice(0, MAX_FACTS).filter((raw) => String(raw.currentness || 'current') !== 'historical');
  if (!apparent.length) return closureResult('open', [], [], [], null);
  const qualified = [];
  const ambiguities = [];
  for (const raw of apparent) {
    const record = resolveFactRecord(material, raw.artifact || raw.path || '');
    const targetOk = matchesTask(material.controllingTask.record, raw.target || raw.scope || '');
    const explicitClosed = String(raw.state || '') === 'closed' && raw.explicit !== false;
    const authorityOk = authorityMatches(authority, raw);
    const passOk = closurePassBasis(raw, retest, material, authority);
    const valid = Boolean(record.record && record.qualification.state === 'qualified' && String(raw.qualification || raw.semanticState || '') === 'qualified' && String(raw.currentness || '') === 'current' && nonEmptyBasis(raw.basis) && targetOk && explicitClosed && authorityOk && passOk);
    if (!valid) { ambiguities.push(issue('closure-disposition-unqualified', `Apparent closure ${raw.artifact || raw.path || '(unresolved artifact)'} cannot qualify exact target, explicit closure, pass basis, currentness, or authority.`)); continue; }
    qualified.push(Object.freeze({ artifact: identity(record.record), authorityRole: String(raw.authorityRole || ''), passBasis: compactBasis(raw.passBasis || raw.incorporatedPass), basis: compactBasis(raw.basis) }));
  }
  if (ambiguities.length || qualified.length !== 1) return closureResult('unresolved', qualified, apparent, ambiguities.length ? ambiguities : [issue('closure-disposition-ambiguous', `${qualified.length} qualified current closures are present.`)], authority);
  return closureResult('closed', qualified, apparent, [], authority);
}

function closurePassBasis(raw, retest, material, authority) {
  const referenced = String(raw.passBasisArtifact || raw.retestArtifact || '').trim();
  if (retest.state === 'passed' && (!referenced || retest.basis.some((item) => item.artifact.path === referenced || item.artifact.id === referenced))) return true;
  const incorporated = raw.incorporatedPass;
  if (!incorporated || typeof incorporated !== 'object') return false;
  const state = String(incorporated.state || incorporated.outcome || '');
  const record = resolveFactRecord(material, incorporated.artifact || raw.artifact || raw.path || '');
  return Boolean(record.record && record.qualification.state === 'qualified' && state === 'passed' && String(incorporated.qualification || '') === 'qualified' && matchesTask(material.controllingTask.record, incorporated.target || raw.target || '') && String(incorporated.criteriaCoverage || '') === 'complete' && String(incorporated.methodState || '') === 'qualified' && authorityMatches(authority, incorporated));
}

function readinessProjection({ material, retest, closure, missingEvidence, ambiguities, blockers }) {
  if (closure.state === 'closed') return readinessResult('not-applicable', ['qualified explicit closure already governs the exact controlling Task'], blockers, missingEvidence, ambiguities, material);
  if (missingEvidence.length || ambiguities.length || closure.state === 'unresolved' || retest.state === 'unresolved') return readinessResult('unresolved', ['required qualification/currentness/authority evidence is unresolved'], blockers, missingEvidence, ambiguities, material);
  if (retest.state === 'failed') return readinessResult('not-ready-for-retest', ['current authoritative re-test failed and has not been explicitly superseded by a newer qualified cycle'], blockers, missingEvidence, ambiguities, material);
  if (blockers.length) return readinessResult('not-ready-for-retest', ['qualified current blocking prerequisite remains'], blockers, missingEvidence, ambiguities, material);
  return readinessResult('ready-for-retest', ['all declared required work representatives and re-test inputs are qualified/current enough and no qualified current blocker remains'], blockers, missingEvidence, ambiguities, material);
}

function normalizedFacts(input) {
  const facts = input.facts && typeof input.facts === 'object' ? input.facts : input;
  return Object.freeze({
    authority: facts.authority || {},
    representatives: bounded(facts.representatives),
    blockers: bounded(facts.blockers),
    retestInputs: bounded(facts.retestInputs || facts.inputs),
    retests: bounded(facts.retests || facts.outcomes),
    closures: bounded(facts.closures)
  });
}

function criteriaAuthority(value = {}) {
  const owner = value.criteriaOwner || value.owner || value;
  const role = String(owner.role || owner.roleLabel || '').trim();
  const state = String(owner.state || owner.qualification || 'unresolved');
  const qualified = state === 'qualified' && Boolean(role) && nonEmptyBasis(owner.basis);
  return Object.freeze({ state: qualified ? 'qualified' : 'unresolved', role, basis: compactBasis(owner.basis), boundary: 'Explicit upstream-qualified governing authority only; authorship, holder identity, human presence, and report existence are not authority.' });
}

function authorityMatches(authority, raw = {}) { return authority.state === 'qualified' && String(raw.authorityState || raw.authorityQualification || 'qualified') === 'qualified' && String(raw.authorityRole || '').trim() === authority.role && nonEmptyBasis(raw.authorityBasis || raw.basis); }
function matchesTask(task, target) { const wanted = String(target || '').replace(/\\/g, '/').replace(/^\.\//, ''); return Boolean(task && wanted && [task.path, task.id].some((value) => value === wanted || String(value || '').endsWith(`/${wanted}`) || wanted.endsWith(`/${value}`))); }
function matchObligation(obligations, requested) { const wanted = String(requested || '').replace(/\\/g, '/').replace(/^\.\//, ''); return obligations.find((item) => [item.id, item.task?.id, item.task?.path].some((value) => value === wanted || (wanted && String(value || '').endsWith(`/${wanted}`)))); }
function reductionBoundary(record, raw) { const isReduction = String(record?.schemaId || '') === 'tiinex.reduction.v1'; return Object.freeze({ isReduction, carryForwardState: isReduction ? String(raw.carryForwardState || 'unresolved') : 'not-applicable', lossState: isReduction ? String(raw.lossState || 'unresolved') : 'not-applicable', validationState: isReduction ? String(raw.validationState || 'unresolved') : 'not-applicable', completionProof: false }); }
function retestResult(state, qualified, apparent, ambiguities, authority) { return Object.freeze({ state, basis: Object.freeze(qualified), apparentCount: apparent.length, ambiguities: Object.freeze(ambiguities), authorityBasis: authority?.state === 'qualified' ? authority : null, boundary: 'Outcome requires exact qualified target/coverage/method/currentness and matching governing authority; report existence/authorship alone is evidence only.' }); }
function closureResult(state, qualified, apparent, ambiguities, authority) { return Object.freeze({ state, basis: Object.freeze(qualified), apparentCount: apparent.length, ambiguities: Object.freeze(ambiguities), authorityBasis: state === 'closed' && authority?.state === 'qualified' ? authority : null, boundary: 'Closed requires explicit qualified governing disposition plus authoritative pass basis; convergence, cleanup, status, or pass alone do not close.' }); }
function readinessResult(state, reasons, blockers, missingEvidence, ambiguities, material) { return Object.freeze({ state, basis: Object.freeze({ controllingTask: material.controllingTask.record, criteria: material.controllingTask.criteria.basis, obligationCount: material.obligations.length, lineage: material.boundary.automaticWorkScope }), reasons: Object.freeze(reasons), blockers: Object.freeze([...blockers]), missingEvidence: Object.freeze([...missingEvidence]), ambiguities: Object.freeze([...ambiguities]) }); }
function blocker(code, target, state, basis) { return Object.freeze({ code, target: String(target || ''), state: String(state || ''), basis: compactBasis(basis) }); }
function issue(code, detail) { return Object.freeze({ code: String(code || 'unresolved'), detail: String(detail || '') }); }
function identity(record = {}) { return Object.freeze({ id: String(record.id || record.path || ''), path: String(record.path || ''), title: String(record.title || ''), schemaId: String(record.schemaId || '') }); }
function bounded(value) { return Object.freeze((Array.isArray(value) ? value : []).slice(0, MAX_FACTS)); }
function nonEmptyBasis(value) { return Array.isArray(value) ? value.length > 0 : typeof value === 'string' ? Boolean(value.trim()) : Boolean(value && typeof value === 'object' && Object.keys(value).length); }
function compactBasis(value) { if (Array.isArray(value)) return Object.freeze(value.slice(0, 8).map((item) => typeof item === 'string' ? item.slice(0, 240) : Object.freeze({ ...item }))); if (typeof value === 'string') return value.slice(0, 720); if (value && typeof value === 'object') return Object.freeze({ ...value }); return null; }
