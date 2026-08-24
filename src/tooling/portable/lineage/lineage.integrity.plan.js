import { parseArtifactMarkdown } from '../../../artifacts/artifact.parse.js';
import { canonicalC14nV2SelfState, validatedC14nV2PrimarySelfDigest, verifyC14nV2TargetSelfDigest } from '../../../integrity/integrity.c14nV2.js';
import { C14N_V2_METHOD_ID } from '../../../integrity/integrity.methodReference.js';
import { resolveLineage } from '../../../lineage/lineage.resolve.js';
import { normalizePortableInput } from '../input/portable.input.js';
import { portableFinding, summarizePortableFindings } from '../findings.js';
import { classifyPortablePublicationOrigin } from './lineage.publicationQualification.js';
import { normalizePublicationProviderReceipts } from './lineage.publicationProviderReceipts.js';

export const PORTABLE_LINEAGE_INTEGRITY_INSPECTION_SCHEMA_ID = 'tiinex.portable.lineage-integrity-inspection.v1';
export const PORTABLE_LINEAGE_INTEGRITY_PLAN_MODE = 'lineage-integrity-inspection';

export function inspectPortableLineageIntegrity(input = {}, options = {}) {
  const material = normalizePortableInput(input.materials || input);
  const publicationProviderEvidence = normalizePublicationProviderReceipts(input);
  const records = (material.records || []).filter((record) => record?.path && typeof record.markdown === 'string' && record.markdown);
  const lineage = resolveLineage(records, { depth: options.depth || 'portable-lineage-integrity-inspection' });
  const nodeById = new Map((lineage.nodes || []).map((node) => [String(node.id || ''), node]));
  const parentEdgesByChild = indexParentEdges(lineage.edges || []);
  const descendantsByParent = indexDescendants(lineage.edges || [], nodeById);
  const findings = [...(material.findings || []), ...(publicationProviderEvidence.findings || [])];
  const artifacts = [];

  for (const node of lineage.nodes || []) {
    const record = node.record || {};
    const inspection = inspectOneArtifact({ node, record, lineage, parentEdgesByChild, nodeById, descendantsByParent, publicationProviderEvidence });
    artifacts.push(inspection);
    findings.push(...inspectionFindings(inspection));
  }

  const repairPlan = buildLineageIntegrityRepairPlan(artifacts, findings);
  return Object.freeze({
    schema: PORTABLE_LINEAGE_INTEGRITY_INSPECTION_SCHEMA_ID,
    status: inspectionStatus(artifacts),
    artifacts: Object.freeze(artifacts),
    repairPlan,
    publicationProviderEvidence: Object.freeze({ summary: publicationProviderEvidence.summary, boundary: publicationProviderEvidence.boundary }),
    lineage: Object.freeze({
      schema: lineage.schema,
      stats: Object.freeze({ ...(lineage.stats || {}) }),
      findings: Object.freeze([...(lineage.findings || [])])
    }),
    boundary: Object.freeze({
      readOnly: true,
      sourceMutation: false,
      remoteWrite: false,
      automaticRepair: false,
      inferenceFromChronologyFilenameOrLayout: false,
      parentAuthority: 'declared Parent Trace/Origin plus exact loaded resolution only',
      publicationQualification: 'declared locator and record-local evidence are descriptive only; qualified state requires accepted repository-read provider bytes bound to the exact locator and loaded Parent material'
    }),
    compatibility: Object.freeze({
      consumer: 'Tooling 022 and later repair consumers',
      note: 'publicationOrigin.state=qualified requires accepted repository-read provider material whose returned bytes bind the declared locator to the loaded Parent. Record-local evidence and commit-pinned URL shape are not mutation authority.'
    }),
    findings: Object.freeze(findings),
    findingSummary: summarizePortableFindings(findings)
  });
}

export function buildLineageIntegrityRepairPlan(artifacts = [], findings = []) {
  const steps = artifacts.map((artifact, index) => repairStepForArtifact(artifact, index + 1));
  const blocked = steps.some((step) => step.approval.disposition === 'blocked');
  const review = steps.some((step) => step.approval.disposition === 'requires-explicit-approval');
  const proposed = steps.some((step) => step.approval.disposition === 'proposed');
  return Object.freeze({
    schema: 'tiinex.portable.repair-plan.v1',
    mode: PORTABLE_LINEAGE_INTEGRITY_PLAN_MODE,
    status: blocked ? 'blocked' : review ? 'review-required' : proposed ? 'proposed' : 'clean',
    steps: Object.freeze(steps),
    boundary: Object.freeze({
      automaticRewrite: false,
      preserveUnknownSections: true,
      preserveSourceAndContinuity: true,
      claimExactQualificationAfterRepair: false,
      readOnlyInspection: true,
      bodyMutationAuthorized: false,
      publicationMutationAuthorized: false,
      descendantRefreshAutomatic: false
    }),
    findingSummary: summarizePortableFindings(findings)
  });
}

function inspectOneArtifact({ node, record, lineage, parentEdgesByChild, nodeById, descendantsByParent, publicationProviderEvidence }) {
  const path = String(record.path || node.path || '');
  const id = String(record.id || node.id || path);
  let parsed;
  try { parsed = parseArtifactMarkdown(record.markdown || ''); }
  catch (error) {
    return freezeInspection({
      id, path, schemaId: String(record.schemaId || ''), title: String(record.title || path),
      state: 'unsupported', reasons: [`parse-failed:${error?.message || 'unknown'}`],
      parentAvailability: state('unsupported', 'artifact-parse-failed'),
      parentPrimarySelf: state('unsupported', 'artifact-parse-failed'),
      childSelf: state('unsupported', 'artifact-parse-failed'),
      parentTarget: state('unsupported', 'artifact-parse-failed'),
      publicationOrigin: state('unsupported', 'artifact-parse-failed'),
      exactParent: emptyParent(), downstreamDescendants: descendantsFor(id, descendantsByParent),
      repairCandidate: emptyRepairCandidate()
    });
  }

  const parentEnvelope = parsed.envelope?.parent || {};
  const hasParent = Boolean(parentEnvelope.schema?.id || parentEnvelope.trace || parentEnvelope.originEntries?.length || parentEnvelope.origin);
  const childSelfRaw = canonicalC14nV2SelfState(record.markdown || '');
  const childSelf = normalizeSelfState(childSelfRaw);
  if (!hasParent) {
    return freezeInspection({
      id, path, schemaId: String(record.schemaId || parsed.envelope?.current?.schema?.id || ''), title: String(record.title || parsed.title || path),
      state: childSelf.state === 'verified' ? 'healthy' : childSelf.state === 'mismatch' ? 'child-self-mismatch' : 'child-self-unavailable',
      reasons: childSelf.state === 'verified' ? [] : [childSelf.reason],
      parentAvailability: state('root', 'no-declared-parent'),
      parentPrimarySelf: state('not-applicable', 'root-artifact'),
      childSelf,
      parentTarget: state('not-applicable', 'root-artifact'),
      publicationOrigin: state('not-applicable', 'root-artifact'),
      exactParent: emptyParent(), downstreamDescendants: descendantsFor(id, descendantsByParent),
      repairCandidate: emptyRepairCandidate()
    });
  }

  const parentResolution = resolveParentForNode(node, lineage, parentEdgesByChild, nodeById);
  const exactParentNode = parentResolution.node;
  const exactParentRecord = exactParentNode?.record || null;
  const parentSelfRaw = exactParentRecord ? validatedC14nV2PrimarySelfDigest(exactParentRecord.markdown || '') : null;
  const parentPrimarySelf = exactParentRecord ? normalizeParentSelfState(parentSelfRaw) : state('unavailable', parentResolution.reason || 'parent-unavailable');
  const publicationOrigin = classifyPortablePublicationOrigin(parentEnvelope, record, exactParentRecord, publicationProviderEvidence);
  const expectedIntegrityTarget = exactIntegrityTarget(parentEnvelope, publicationOrigin);
  const targetInspection = inspectParentTarget(parsed, exactParentRecord, expectedIntegrityTarget);
  const exactParent = Object.freeze({
    id: String(exactParentRecord?.id || exactParentNode?.id || ''),
    path: String(exactParentRecord?.path || exactParentNode?.path || ''),
    trace: String(parentEnvelope.trace || ''),
    expectedIntegrityTarget,
    publicationLocator: String(publicationOrigin.locator || '')
  });
  const reasons = [];
  const primaryState = choosePrimaryState({ parentResolution, parentPrimarySelf, childSelf, targetInspection, publicationOrigin }, reasons);
  const repairCandidate = Object.freeze({
    kind: targetInspection.state === 'missing' ? 'backfill' : targetInspection.state === 'mismatch' ? 'mismatch-review' : 'none',
    oldTargetDigest: String(targetInspection.declaredValue || ''),
    candidateTargetDigest: parentPrimarySelf.state === 'verified' ? String(parentPrimarySelf.value || '') : '',
    expectedTarget: expectedIntegrityTarget,
    publicationLocator: String(publicationOrigin.locator || '')
  });
  return freezeInspection({
    id, path, schemaId: String(record.schemaId || parsed.envelope?.current?.schema?.id || ''), title: String(record.title || parsed.title || path),
    state: primaryState, reasons,
    parentAvailability: parentResolution.state,
    parentPrimarySelf,
    childSelf,
    parentTarget: targetInspection,
    publicationOrigin,
    exactParent,
    downstreamDescendants: descendantsFor(id, descendantsByParent),
    repairCandidate
  });
}

function resolveParentForNode(node, lineage, parentEdgesByChild, nodeById) {
  const nodeId = String(node.id || '');
  const ambiguity = (lineage.findings || []).find((finding) => finding.nodeId === nodeId && finding.code === 'lineage.target.ambiguous');
  if (ambiguity) return { state: state('ambiguous', 'declared-parent-ambiguous'), reason: 'declared-parent-ambiguous', node: null };
  const edges = parentEdgesByChild.get(nodeId) || [];
  const exact = edges.filter((edge) => edge.from && edge.status !== 'missing');
  if (exact.length === 1) return { state: state('resolved', exact[0].status || 'resolved'), reason: '', node: nodeById.get(String(exact[0].from || '')) || null };
  if (exact.length > 1) return { state: state('ambiguous', 'multiple-parent-edges'), reason: 'multiple-parent-edges', node: null };
  const missing = edges.find((edge) => edge.status === 'missing');
  return { state: state('unresolved', missing ? 'declared-parent-not-loaded' : 'declared-parent-unresolved'), reason: missing ? 'declared-parent-not-loaded' : 'declared-parent-unresolved', node: null };
}

function exactIntegrityTarget(parentEnvelope = {}, publicationOrigin = {}) {
  if (publicationOrigin.locator) return String(publicationOrigin.locator);
  return String(parentEnvelope.trace || '');
}

function inspectParentTarget(parsed = {}, parentRecord = null, expectedTarget = '') {
  const entries = (parsed.integrity?.entries || []).filter((entry) => entry?.method === C14N_V2_METHOD_ID && String(entry?.towards || '') !== 'self');
  if (!entries.length) return targetState('missing', 'parent-target-entry-missing', '', expectedTarget, '');
  if (entries.length !== 1) return targetState('ambiguous', 'multiple-parent-target-entries', '', expectedTarget, '');
  const entry = entries[0];
  const declaredTarget = String(entry.towards || '');
  const declaredValue = String(entry.value || '');
  if (!expectedTarget) return targetState('unsupported', 'expected-parent-target-unavailable', declaredValue, expectedTarget, declaredTarget);
  if (declaredTarget !== expectedTarget) return targetState('mismatch', 'parent-target-locator-mismatch', declaredValue, expectedTarget, declaredTarget);
  if (!parentRecord) return targetState('unavailable', 'resolved-parent-bytes-unavailable', declaredValue, expectedTarget, declaredTarget);
  const verification = verifyC14nV2TargetSelfDigest({ value: declaredValue, targetMarkdown: parentRecord.markdown || '' });
  if (verification.state === 'verified') return targetState('verified', '', declaredValue, expectedTarget, declaredTarget, verification.targetValue);
  if (verification.state === 'mismatch') return targetState('mismatch', verification.reason || 'target-self-digest-mismatch', declaredValue, expectedTarget, declaredTarget, verification.targetValue);
  if (verification.state === 'target-self-mismatch') return targetState('parent-self-mismatch', verification.reason || 'parent-self-mismatch', declaredValue, expectedTarget, declaredTarget, verification.targetValue);
  return targetState(verification.state || 'unavailable', verification.reason || verification.state || 'unavailable', declaredValue, expectedTarget, declaredTarget, verification.targetValue);
}

function choosePrimaryState({ parentResolution, parentPrimarySelf, childSelf, targetInspection, publicationOrigin }, reasons) {
  const consider = (condition, value, reason) => {
    if (!condition) return '';
    if (reason) reasons.push(reason);
    return value;
  };
  return consider(parentResolution.state.state === 'ambiguous', 'parent-ambiguous', parentResolution.state.reason)
    || consider(parentResolution.state.state !== 'resolved', 'parent-unresolved', parentResolution.state.reason)
    || consider(parentPrimarySelf.state === 'mismatch', 'parent-self-mismatch', parentPrimarySelf.reason)
    || consider(parentPrimarySelf.state !== 'verified', 'parent-self-unavailable', parentPrimarySelf.reason)
    || consider(childSelf.state === 'mismatch', 'child-self-mismatch', childSelf.reason)
    || consider(childSelf.state !== 'verified', 'child-self-unavailable', childSelf.reason)
    || consider(targetInspection.state === 'missing', 'parent-target-missing', targetInspection.reason)
    || consider(targetInspection.state === 'mismatch', 'parent-target-mismatch', targetInspection.reason)
    || consider(targetInspection.state !== 'verified', targetInspection.state === 'ambiguous' ? 'parent-target-ambiguous' : 'unsupported', targetInspection.reason)
    || consider(publicationOrigin.state === 'contradictory', 'publication-origin-contradictory', publicationOrigin.reason)
    || consider(publicationOrigin.state === 'stale', 'publication-origin-stale', publicationOrigin.reason)
    || consider(publicationOrigin.state === 'unresolved', 'publication-origin-unresolved', publicationOrigin.reason)
    || consider(publicationOrigin.state === 'missing', 'publication-origin-missing', publicationOrigin.reason)
    || 'healthy';
}

function repairStepForArtifact(artifact, order) {
  const blockers = [];
  let action = 'no-change';
  let disposition = 'no-change';
  let priority = 'optional';
  const willChangeSelf = ['parent-target-missing', 'parent-target-mismatch'].includes(artifact.state);

  if (artifact.state === 'parent-target-missing') {
    action = 'backfill-parent-target-v2';
    disposition = 'proposed';
    priority = 'important';
    if (artifact.parentAvailability.state !== 'resolved') blockers.push(`parent-${artifact.parentAvailability.state}`);
    if (artifact.parentPrimarySelf.state !== 'verified') blockers.push(`parent-self-${artifact.parentPrimarySelf.state}`);
    if (artifact.childSelf.state !== 'verified') blockers.push(`child-self-${artifact.childSelf.state}`);
    if (artifact.publicationOrigin.state !== 'qualified') blockers.push(`publication-origin-${artifact.publicationOrigin.state}`);
    if (!artifact.exactParent.expectedIntegrityTarget) blockers.push('parent-target-locator-unavailable');
    if (blockers.length) disposition = 'blocked';
  } else if (artifact.state === 'parent-target-mismatch') {
    action = 'review-parent-target-mismatch';
    disposition = 'requires-explicit-approval';
    priority = 'blocking';
    blockers.push('existing-target-mismatch-is-not-refresh-authority');
    if (artifact.parentPrimarySelf.state !== 'verified') blockers.push(`parent-self-${artifact.parentPrimarySelf.state}`);
    if (artifact.publicationOrigin.state !== 'qualified') blockers.push(`publication-origin-${artifact.publicationOrigin.state}`);
  } else if (artifact.state !== 'healthy') {
    action = 'resolve-lineage-integrity-blocker';
    disposition = 'blocked';
    priority = 'blocking';
    blockers.push(...artifact.reasons);
    if (artifact.publicationOrigin.state && !['qualified', 'not-applicable'].includes(artifact.publicationOrigin.state)) blockers.push(`publication-origin-${artifact.publicationOrigin.state}`);
  }

  const descendants = willChangeSelf ? artifact.downstreamDescendants : [];
  return Object.freeze({
    order,
    priority,
    category: 'lineage-integrity',
    action,
    artifact: Object.freeze({ id: artifact.id, path: artifact.path, schemaId: artifact.schemaId }),
    currentState: artifact.state,
    exactParentTarget: Object.freeze({ ...artifact.exactParent }),
    oldTargetDigest: artifact.repairCandidate.oldTargetDigest,
    candidateTargetDigest: artifact.repairCandidate.candidateTargetDigest,
    publicationLocator: artifact.repairCandidate.publicationLocator,
    expectedMutation: Object.freeze({
      headerFields: Object.freeze([]),
      footerChanges: Object.freeze(willChangeSelf ? ['Parent-target c14n-v2 entry', 'primary self c14n-v2 Value after fixed sibling entry'] : []),
      bodyMutation: false,
      sourceMutation: false,
      publicationMutation: false
    }),
    descendantImpact: Object.freeze(descendants),
    approval: Object.freeze({
      required: disposition === 'proposed' || disposition === 'requires-explicit-approval',
      disposition,
      blockers: Object.freeze(unique(blockers.filter(Boolean)))
    }),
    reasons: Object.freeze([...artifact.reasons])
  });
}

function inspectionFindings(artifact) {
  if (artifact.state === 'healthy') return [];
  const severity = ['parent-target-mismatch', 'parent-self-mismatch', 'child-self-mismatch', 'parent-ambiguous'].includes(artifact.state) ? 'error' : 'warning';
  return [portableFinding(severity, `portable.lineage-integrity.${artifact.state}`, `Lineage integrity inspection classified ${artifact.path || artifact.id} as ${artifact.state}.`, {
    ref: artifact.path || artifact.id,
    reason: artifact.reasons.join(', ')
  })];
}

function indexParentEdges(edges = []) {
  const map = new Map();
  for (const edge of edges) {
    if (edge.kind !== 'parent') continue;
    const key = String(edge.to || '');
    const list = map.get(key) || [];
    list.push(edge);
    map.set(key, list);
  }
  return map;
}

function indexDescendants(edges = [], nodeById = new Map()) {
  const children = new Map();
  for (const edge of edges) {
    if (edge.kind !== 'parent' || !edge.from || !edge.to || edge.status === 'missing') continue;
    const key = String(edge.from || '');
    const list = children.get(key) || [];
    list.push(String(edge.to || ''));
    children.set(key, list);
  }
  const result = new Map();
  for (const parentId of nodeById.keys()) {
    const seen = new Set([parentId]);
    const queue = (children.get(parentId) || []).map((id) => ({ id, depth: 1 }));
    const descendants = [];
    while (queue.length) {
      queue.sort((a, b) => a.depth - b.depth || nodePath(a.id, nodeById).localeCompare(nodePath(b.id, nodeById)));
      const current = queue.shift();
      if (!current || seen.has(current.id)) continue;
      seen.add(current.id);
      const node = nodeById.get(current.id);
      descendants.push(Object.freeze({ id: current.id, path: String(node?.path || ''), depth: current.depth, reason: 'descendant-binds-to-artifact-self-digest' }));
      for (const child of children.get(current.id) || []) queue.push({ id: child, depth: current.depth + 1 });
    }
    result.set(parentId, Object.freeze(descendants));
  }
  return result;
}

function descendantsFor(id, map) { return Object.freeze([...(map.get(String(id || '')) || [])]); }
function nodePath(id, nodeById) { return String(nodeById.get(String(id || ''))?.path || id || ''); }
function inspectionStatus(artifacts = []) {
  if (artifacts.every((artifact) => artifact.state === 'healthy')) return 'healthy';
  if (artifacts.some((artifact) => ['parent-target-mismatch', 'parent-self-mismatch', 'child-self-mismatch', 'parent-ambiguous'].includes(artifact.state))) return 'attention-required';
  return 'repair-planning-available';
}
function normalizeSelfState(value = {}) {
  return Object.freeze({ state: value.state === 'prepared' ? 'unavailable' : value.state || 'unavailable', reason: value.reason || (value.state === 'prepared' ? 'self-value-missing' : value.state || 'unavailable'), value: value.declaredValue || '', computedValue: value.computedValue || '' });
}
function normalizeParentSelfState(value = {}) {
  return Object.freeze({ state: value.state || 'unavailable', reason: value.reason || '', value: value.value || '', declaredValue: value.declaredValue || '', computedValue: value.computedValue || '' });
}
function state(value, reason = '') { return Object.freeze({ state: value, reason }); }
function targetState(value, reason = '', declaredValue = '', expectedTarget = '', declaredTarget = '', targetValue = '') { return Object.freeze({ state: value, reason, declaredValue, expectedTarget, declaredTarget, targetValue }); }
function emptyParent() { return Object.freeze({ id: '', path: '', trace: '', expectedIntegrityTarget: '', publicationLocator: '' }); }
function emptyRepairCandidate() { return Object.freeze({ kind: 'none', oldTargetDigest: '', candidateTargetDigest: '', expectedTarget: '', publicationLocator: '' }); }
function freezeInspection(value) { return Object.freeze({ ...value, reasons: Object.freeze([...(value.reasons || [])]) }); }
function unique(values = []) { return [...new Set(values.map(String).filter(Boolean))]; }
