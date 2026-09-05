import { normalizePortableInput } from '../input/portable.input.js';
import { discoverPortableHostCapabilities } from '../host/host.capabilities.js';
import { inspectPortableLineageIntegrity } from './lineage.integrity.plan.js';
import { normalizePublicationProviderReceipts, qualifiedPublicationCandidatesForParent } from './lineage.publicationProviderReceipts.js';
import { approvalState, findingClassFor, humanExplanation, mutationProjection, opportunityState, safeActionsFor, severityFor, trustImpactFor } from './lineage.integrity.projection.human.js';

export const PORTABLE_LINEAGE_INTEGRITY_REPAIR_PROJECTION_SCHEMA_ID = 'tiinex.portable.lineage-integrity-repair-projection.v1';

const REVIEW_STATES = new Set(['parent-target-mismatch', 'parent-self-mismatch', 'child-self-mismatch', 'parent-ambiguous', 'parent-target-ambiguous']);
const PUBLICATION_CANDIDATE_STATES = new Set(['missing', 'stale', 'unresolved']);

export function buildPortableLineageIntegrityRepairProjection(input = {}, options = {}) {
  const material = normalizePortableInput(input.materials || input);
  const intake = classifyProjectionIntake(material, input);
  const records = projectionRecords(material.records || [], intake);
  const providerInput = publicationEvidenceInput(input);
  const inspection = validInspection(input.inspection) ? input.inspection : inspectPortableLineageIntegrity({ records, ...providerInput }, options);
  const providerEvidence = normalizePublicationProviderReceipts(providerInput);
  const preparedRepairPlan = prepareProjectionRepairPlan(inspection, records, providerEvidence);
  const application = normalizeApplication(input);
  const approvals = normalizeApprovals(input.approvals || input.artifactApprovals || input.dispositions || []);
  const host = projectionHostBoundary(input, options);
  const recordsByPath = new Map(records.map((record) => [normalizePath(record.path), record]));
  const receiptByPath = new Map((application?.receipts || []).map((receipt) => [projectionPath(receipt?.artifact?.path || '', intake), receipt]));
  const stepsByPath = new Map((preparedRepairPlan.steps || []).map((step) => [normalizePath(step?.artifact?.path), step]));
  const opportunities = (inspection.artifacts || []).map((artifact) => projectOpportunity({
    artifact,
    step: stepsByPath.get(normalizePath(artifact.path)) || null,
    receipt: receiptByPath.get(normalizePath(artifact.path)) || null,
    approval: approvals.get(normalizePath(artifact.path)) || null,
    record: recordsByPath.get(normalizePath(artifact.path || '')) || null,
    parentRecord: recordsByPath.get(normalizePath(artifact.exactParent?.path || '')) || null,
    intake,
    host
  }));

  const status = projectionStatus(opportunities);
  const repairGroups = buildRepairGroups(opportunities, inspection.findings || []);
  return Object.freeze({
    schema: PORTABLE_LINEAGE_INTEGRITY_REPAIR_PROJECTION_SCHEMA_ID,
    status,
    intake,
    opportunities: Object.freeze(opportunities),
    summary: summarizeOpportunities(opportunities),
    repairGroups,
    preparedRepairPlan,
    application: applicationSummary(application),
    host,
    boundary: Object.freeze({
      adapterNeutral: true,
      sharedConsumers: Object.freeze(['Viewer', 'VS Code', 'CLI', 'LLM']),
      packageCarriageAuthorizesRepair: false,
      inspectionAndPlanningReadOnly: true,
      applyProducesLocalResultOnly: true,
      localOwnedMaterialRequiredForApply: true,
      bodyMutationAuthorized: false,
      sourceMutation: false,
      publicationMutation: false,
      remoteWrite: false,
      remotePublicationImplemented: false,
      machineEvidenceSeparateFromHumanExplanation: true,
      integrityAuthority: 'Tooling 020 inspection/plan plus Tooling 021 application and accepted provider/semantic evidence only',
      continuityCreationConformance: 'Tooling 019 prospective creation baseline; Tooling 020/021 existing-lineage repair; package-wide graph-recovery conformance retained by 001-38'
    }),
    findings: Object.freeze([...(inspection.findings || []), ...(providerEvidence.findings || [])])
  });
}

function prepareProjectionRepairPlan(inspection = {}, records = [], providerEvidence = {}) {
  const original = inspection.repairPlan || { schema: 'tiinex.portable.repair-plan.v1', mode: 'lineage-integrity-inspection', steps: [], boundary: { automaticRewrite: false } };
  const artifactByPath = new Map((inspection.artifacts || []).map((artifact) => [normalizePath(artifact.path), artifact]));
  const recordByPath = new Map(records.map((record) => [normalizePath(record.path), record]));
  const steps = (original.steps || []).map((step) => {
    const artifact = artifactByPath.get(normalizePath(step?.artifact?.path));
    if (!artifact || REVIEW_STATES.has(artifact.state)) return step;
    const publication = artifact.publicationOrigin || {};
    if (!PUBLICATION_CANDIDATE_STATES.has(publication.state)) return step;
    if (artifact.parentAvailability?.state !== 'resolved' || artifact.parentPrimarySelf?.state !== 'verified' || artifact.childSelf?.state !== 'verified') return step;
    const parentRecord = recordByPath.get(normalizePath(artifact.exactParent?.path || ''));
    const candidates = qualifiedPublicationCandidatesForParent(providerEvidence, parentRecord);
    if (candidates.length !== 1) return step;
    const candidate = candidates[0];
    const footerChanges = artifact.parentTarget?.state === 'missing'
      ? ['Parent-target c14n-v2 entry', 'primary self c14n-v2 Value after fixed sibling entry']
      : ['Parent-target locator', 'primary self c14n-v2 Value after fixed sibling entry'];
    return Object.freeze({
      ...step,
      priority: 'important',
      action: 'update-parent-origin-permalink',
      candidateParentOrigin: candidate.locator,
      candidateTargetDigest: String(artifact.parentPrimarySelf?.value || ''),
      publicationLocator: candidate.locator,
      expectedMutation: Object.freeze({
        headerFields: Object.freeze(['Parent.Origin.browse+git']),
        footerChanges: Object.freeze(footerChanges),
        bodyMutation: false,
        sourceMutation: false,
        publicationMutation: false
      }),
      approval: Object.freeze({ required: true, disposition: 'proposed', blockers: Object.freeze([]) }),
      projectionEvidence: Object.freeze({
        kind: 'qualified-exact-publication-candidate',
        locator: candidate.locator,
        receiptReference: candidate.actionId,
        materialIdentity: candidate.materialIdentity
      })
    });
  });
  const blocked = steps.some((step) => step.approval?.disposition === 'blocked');
  const review = steps.some((step) => step.approval?.disposition === 'requires-explicit-approval');
  const proposed = steps.some((step) => step.approval?.disposition === 'proposed');
  return Object.freeze({
    ...original,
    status: blocked ? 'blocked' : review ? 'review-required' : proposed ? 'proposed' : 'clean',
    steps: Object.freeze(steps),
    boundary: Object.freeze({ ...(original.boundary || {}), automaticRewrite: false, humanProjectionPrepared: true, packageCarriageAuthorizesRepair: false })
  });
}

function projectOpportunity({ artifact = {}, step = null, receipt = null, approval = null, record = null, parentRecord = null, intake = {}, host = {} }) {
  const permalink = step?.action === 'update-parent-origin-permalink' && Boolean(step?.projectionEvidence);
  const localResultReady = receipt && ['changed', 'no-op'].includes(String(receipt.status || ''));
  const state = localResultReady ? 'local-result-ready' : opportunityState(artifact, step);
  const findingClass = findingClassFor(artifact, step, receipt);
  const severity = severityFor(artifact, state);
  const human = humanExplanation({ artifact, step, state, permalink, receipt });
  const decision = Object.freeze({
    required: Boolean(step?.approval?.required) && !localResultReady,
    state: localResultReady ? 'satisfied-by-local-result' : approvalState(approval, step),
    blockers: Object.freeze([...(step?.approval?.blockers || [])]),
    semanticAuthorityRequired: step?.action === 'review-parent-target-mismatch',
    publicationQualificationRequired: step?.action === 'update-parent-origin-permalink'
  });
  return Object.freeze({
    state,
    findingClass,
    severity,
    trustImpact: trustImpactFor(artifact, state),
    artifact: Object.freeze({ id: String(artifact.id || ''), path: normalizePath(artifact.path || ''), title: String(artifact.title || artifact.path || ''), schemaId: String(artifact.schemaId || ''), repository: String(record?.source?.repository || record?.source?.repo || ''), sourceMode: String(record?.sourceMode || record?.source?.adapterId || '') }),
    parentTarget: Object.freeze({
      id: String(artifact.exactParent?.id || ''),
      path: normalizePath(artifact.exactParent?.path || ''),
      trace: String(artifact.exactParent?.trace || ''),
      expectedLocator: permalink ? String(step.candidateParentOrigin || '') : String(artifact.exactParent?.expectedIntegrityTarget || ''),
      currentLocator: String(artifact.parentTarget?.declaredTarget || ''),
      oldDigest: String(artifact.parentTarget?.declaredValue || ''),
      candidateDigest: String(step?.candidateTargetDigest || artifact.repairCandidate?.candidateTargetDigest || '')
    }),
    publicationLocator: Object.freeze({
      state: permalink ? 'qualified-repair-available' : String(artifact.publicationOrigin?.state || 'not-applicable'),
      current: String(artifact.publicationOrigin?.locator || ''),
      candidate: String(step?.candidateParentOrigin || ''),
      evidenceState: permalink ? 'qualified' : String(artifact.publicationOrigin?.evidenceState || ''),
      fabricated: false
    }),
    proposedMutation: mutationProjection(step),
    cascadeImpact: Object.freeze({ count: (step?.descendantImpact || []).length, descendants: Object.freeze([...(step?.descendantImpact || [])]) }),
    decision,
    safeActions: safeActionsFor({ state, step, decision, intake, host, localResultReady }),
    human,
    machineEvidence: Object.freeze({
      inspectionState: String(artifact.state || ''),
      reasons: Object.freeze([...(artifact.reasons || [])]),
      parentAvailability: artifact.parentAvailability || null,
      parentPrimarySelf: artifact.parentPrimarySelf || null,
      childSelf: artifact.childSelf || null,
      parentTarget: artifact.parentTarget || null,
      publicationOrigin: artifact.publicationOrigin || null,
      planAction: String(step?.action || 'no-change'),
      planDisposition: String(step?.approval?.disposition || 'no-change'),
      projectionEvidence: step?.projectionEvidence || null,
      parentMaterialAvailable: Boolean(parentRecord?.markdown),
      receipt: receipt ? receiptEvidence(receipt) : null
    })
  });
}


function buildRepairGroups(opportunities = [], findings = []) {
  const findingByPath = new Map();
  for (const finding of findings || []) {
    const path = normalizePath(finding?.artifactBoundary?.path || finding?.evidencePath || finding?.ref || finding?.path || '');
    if (!path) continue;
    const list = findingByPath.get(path) || [];
    list.push(finding);
    findingByPath.set(path, list);
  }
  const groups = new Map();
  for (const opportunity of opportunities || []) {
    const repository = String(opportunity?.artifact?.repository || '').trim() || 'local-workspace';
    const action = String(opportunity?.machineEvidence?.planAction || 'no-change');
    const key = `${repository}::${action}`;
    if (!groups.has(key)) groups.set(key, { repository, action, artifacts: [] });
    const path = normalizePath(opportunity?.artifact?.path || '');
    const artifactFindings = findingByPath.get(path) || [];
    groups.get(key).artifacts.push(Object.freeze({
      path,
      id: String(opportunity?.artifact?.id || ''),
      state: String(opportunity?.state || ''),
      severity: String(opportunity?.severity || ''),
      findingCodes: Object.freeze([...new Set(artifactFindings.map((finding) => String(finding.code || '')).filter(Boolean))].sort()),
      cascadeImpact: opportunity?.cascadeImpact || Object.freeze({ count: 0, descendants: Object.freeze([]) })
    }));
  }
  return Object.freeze([...groups.values()].sort((a, b) => `${a.repository}:${a.action}`.localeCompare(`${b.repository}:${b.action}`)).map((group, index) => Object.freeze({
    id: `repair-group-${index + 1}`,
    repository: group.repository,
    action: group.action,
    artifactCount: group.artifacts.length,
    cascadeDescendantCount: group.artifacts.reduce((sum, artifact) => sum + Number(artifact.cascadeImpact?.count || 0), 0),
    artifacts: Object.freeze(group.artifacts),
    boundary: 'Batch/repository grouping is a projection only. Per-artifact findings, approvals, cascade impact, and receipts remain authoritative for apply; grouping never authorizes mutation.'
  })));
}

function classifyProjectionIntake(material = {}, input = {}) {
  const paths = [...(material.files || []).map((file) => file.path), ...(material.records || []).map((record) => record.path)].map(normalizePath);
  const workspaceIds = [...new Set(paths.map((path) => path.match(/^handoff\.workspaces\/([^/]+)\//)?.[1]).filter(Boolean))].sort();
  const packageDetected = workspaceIds.length > 0 || paths.some((path) => path.startsWith('tiinex.package/'));
  const requestedWorkspace = String(input.workspaceId || input.workspace?.id || '').trim();
  const selectedWorkspaceId = requestedWorkspace && workspaceIds.includes(requestedWorkspace) ? requestedWorkspace : workspaceIds.length === 1 ? workspaceIds[0] : '';
  const ordinaryLocal = !packageDetected && (material.records || []).every((record) => isLocalOwnedSourceMode(record.sourceMode));
  const localOwned = input.localOwned === true || input.ownership?.localOwned === true || ordinaryLocal;
  return Object.freeze({
    kind: packageDetected ? 'handoff-package' : 'workspace-or-source',
    workspaceIds: Object.freeze(workspaceIds),
    selectedWorkspaceId,
    localOwned,
    repairAuthorization: localOwned ? 'local-owned-material' : 'not-authorized-by-intake',
    packageCarriageAuthorizesRepair: false
  });
}

function projectionRecords(records = [], intake = {}) {
  if (intake.kind !== 'handoff-package' || !intake.selectedWorkspaceId) {
    return Object.freeze(records.map((record) => {
      const path = normalizePath(record.path);
      return Object.freeze({ ...record, sourceId: String(record.id || ''), id: path, path });
    }));
  }
  const prefix = `handoff.workspaces/${intake.selectedWorkspaceId}/`;
  return Object.freeze(records
    .filter((record) => normalizePath(record.path).startsWith(prefix))
    .map((record) => {
      const packagePath = normalizePath(record.path);
      const path = packagePath.slice(prefix.length);
      return Object.freeze({ ...record, sourceId: String(record.id || ''), id: path, packagePath, path });
    }));
}

function projectionHostBoundary(input = {}, options = {}) {
  const supplied = input.hostDiscovery?.profile ? input.hostDiscovery : discoverPortableHostCapabilities(input.host || input, options.host || options);
  const capabilities = supplied.profile?.capabilities || {};
  const remoteAvailable = capabilities.mutation?.remoteWriteAvailable === true;
  const remoteAuthorized = capabilities.mutation?.remoteWriteAuthorized === true;
  return Object.freeze({
    local: Object.freeze({
      localResult: 'available',
      filesystemWrite: capabilities.mutation?.filesystemWrite === true ? 'available' : 'host-dependent',
      exportChangeset: 'serializable-local-result'
    }),
    remotePublication: Object.freeze({
      state: !remoteAvailable ? 'capability-unavailable' : !remoteAuthorized ? 'authorization-required' : 'authorized-host-adapter-required',
      capabilityAvailable: remoteAvailable,
      explicitlyAuthorized: remoteAuthorized,
      implementedByProjection: false,
      credentialCollection: false,
      automaticPush: false
    })
  });
}

function normalizeApprovals(value) {
  const out = new Map();
  if (Array.isArray(value)) for (const item of value) { const path = normalizePath(item?.path || item?.artifact?.path || ''); if (path) out.set(path, item); }
  else if (value && typeof value === 'object') for (const [key, item] of Object.entries(value)) { const path = normalizePath(item?.path || key); if (path) out.set(path, item); }
  return out;
}

function normalizeApplication(input = {}) {
  const candidates = [input.application, input.repairApplication, input.applyResult, input.operationResult];
  for (const candidate of candidates) {
    const value = candidate?.application || candidate;
    if (value?.schema === 'tiinex.portable.lineage-integrity-repair-application.v1') return value;
  }
  return null;
}

function applicationSummary(application = null) {
  if (!application) return null;
  return Object.freeze({
    schema: application.schema,
    status: String(application.status || ''),
    changedPaths: Object.freeze([...(application.changeset?.changedPaths || [])].map(normalizePath)),
    sourceMutation: application.changeset?.sourceMutation === true,
    remoteWrite: application.changeset?.remoteWrite === true,
    publicationMutation: application.changeset?.publicationMutation === true,
    receiptCount: (application.receipts || []).length
  });
}

function receiptEvidence(receipt = {}) {
  return Object.freeze({
    status: String(receipt.status || ''),
    repairClass: String(receipt.repairClass || ''),
    oldParentTarget: receipt.oldParentTarget || null,
    newParentTarget: receipt.newParentTarget || null,
    oldSelfDigest: String(receipt.oldSelfDigest || ''),
    newSelfDigest: String(receipt.newSelfDigest || ''),
    mutationSurface: Object.freeze([...(receipt.mutationSurface || [])]),
    bodyPreservationCheck: String(receipt.bodyPreservationCheck || ''),
    remainingBlockers: Object.freeze([...(receipt.remainingBlockers || [])])
  });
}

function publicationEvidenceInput(input = {}) {
  return Object.freeze({
    ...(input.publicationProviderReceipt ? { publicationProviderReceipt: input.publicationProviderReceipt } : {}),
    ...(Array.isArray(input.publicationProviderReceipts) ? { publicationProviderReceipts: input.publicationProviderReceipts } : {}),
    ...(input.publicationProviderAcceptance ? { publicationProviderAcceptance: input.publicationProviderAcceptance } : {}),
    ...(Array.isArray(input.publicationProviderAcceptances) ? { publicationProviderAcceptances: input.publicationProviderAcceptances } : {}),
    ...(Array.isArray(input.providerResponses) ? { providerResponses: input.providerResponses } : {})
  });
}

function summarizeOpportunities(opportunities = []) {
  const counts = { healthy: 0, repairAvailable: 0, reviewRequired: 0, blocked: 0, localResultReady: 0 };
  for (const item of opportunities) {
    if (item.state === 'healthy') counts.healthy += 1;
    else if (item.state === 'repair-available') counts.repairAvailable += 1;
    else if (item.state === 'review-required') counts.reviewRequired += 1;
    else if (item.state === 'local-result-ready') counts.localResultReady += 1;
    else counts.blocked += 1;
  }
  return Object.freeze({ total: opportunities.length, ...counts });
}

function projectionStatus(opportunities = []) {
  if (opportunities.some((item) => item.state === 'review-required')) return 'review-required';
  if (opportunities.some((item) => item.state === 'blocked')) return 'attention-required';
  if (opportunities.some((item) => item.state === 'local-result-ready')) return 'local-result-ready';
  if (opportunities.some((item) => item.state === 'repair-available')) return 'repair-available';
  return 'healthy';
}

function validInspection(value) { return value?.schema === 'tiinex.portable.lineage-integrity-inspection.v1' && Array.isArray(value.artifacts) && value.repairPlan?.schema === 'tiinex.portable.repair-plan.v1'; }
function isLocalOwnedSourceMode(value = '') { return ['portable-local', 'portable-node-local', 'local', 'local-session', 'workspace-local'].includes(String(value || '')); }
function projectionPath(value = '', intake = {}) { const path = normalizePath(value); const prefix = intake.selectedWorkspaceId ? `handoff.workspaces/${intake.selectedWorkspaceId}/` : ''; return prefix && path.startsWith(prefix) ? path.slice(prefix.length) : path; }
function normalizePath(value = '') { return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '').replace(/^\/+|\/+$/g, ''); }
