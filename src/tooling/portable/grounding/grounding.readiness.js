import { resolveLineage } from '../../../lineage/lineage.resolve.js';
import { normalizePortableInput } from '../input/portable.input.js';
import { projectPortableOperatingOverview } from '../overview/operatingOverview.js';
import { summarizePortableFindings } from '../findings.js';
import { directedLineageCone, isRoutedHandoffBundle, materializeQualifiedWorkspaceSnapshot, normalizeSelectors, projectBlockers, projectRelevantTopology, projectRequiredContext, relevantLineageIssues, resolveRequiredContextRecords, resolveSelectedRouteRecords } from './grounding.readiness.support.js';
import { groundPortableColdConsumer } from '../handoff/coldStartQualification.grounding.js';
import { createColdStartMaterialContext, projectGroundedContinuation } from '../handoff/coldStartQualification.materials.js';
import { auditHandoffPackageContextCarriage } from '../handoff/contextAudit.js';
import { acceptedRecoveryMaterial, projectColdStartContinuity } from './grounding.continuity.js';

export const PORTABLE_GROUNDING_READINESS_SCHEMA_ID = 'tiinex.portable.grounding-readiness.v1';

const MAX_ITEMS = 12;

export function projectPortableGroundingReadiness(input = {}, options = {}) {
  const bundle = input.bundle || input.package || input;
  const handoffMode = isRoutedHandoffBundle(bundle);
  if (!handoffMode) {
    const material = normalizePortableInput(input.materials || input);
    return composeGroundingReadiness({
      mode: 'loaded-material',
      authority: null,
      continuation: null,
      contextAudit: null,
      material,
      requiredContext: [],
      findings: [...(material.findings || [])]
    });
  }

  const route = String(input.route || input.routeId || input.routePath || '').trim();
  const materialContext = createColdStartMaterialContext();
  const grounding = groundPortableColdConsumer({
    ...input,
    bundle,
    package: bundle,
    ingressKind: 'routed-handoff-package',
    route,
    toolingAvailable: true
  }, { ...options, coldStartMaterialContext: materialContext });
  const continuation = projectGroundedContinuation({
    bundle,
    route,
    grounding,
    qualification: { status: 'not-assessed-by-ground' },
    packageSourcePath: String(input.packageSourcePath || '')
  }, materialContext);
  const contextAudit = auditHandoffPackageContextCarriage({ bundle });
  const snapshot = materializeQualifiedWorkspaceSnapshot(bundle, contextAudit, {
    includeLegacyTopics: Boolean(input.includeLegacyTopics || options.includeLegacyTopics)
  });
  const recoveryMaterial = acceptedRecoveryMaterial(input.recoveryAcceptance || input.recovery || input.recoveredMaterial || {});
  const material = normalizePortableInput({
    files: [...snapshot.files, ...recoveryMaterial.files],
    findings: [...snapshot.findings, ...recoveryMaterial.findings]
  });
  return composeGroundingReadiness({
    mode: 'routed-handoff-package',
    authority: grounding,
    continuation,
    contextAudit,
    material,
    requiredContext: continuation.requiredContext || [],
    requiredContextSelectors: normalizeSelectors(input.includeRequiredContext || options.includeRequiredContext),
    includeCurrentWork: Boolean(input.includeCurrentWork || options.includeCurrentWork),
    findings: [
      ...(grounding.findings || []),
      ...(contextAudit.findings || []),
      ...(snapshot.findings || []),
      ...(material.findings || [])
    ]
  });
}

export function composeGroundingReadiness({ mode = 'loaded-material', authority = null, continuation = null, contextAudit = null, material = {}, requiredContext = [], requiredContextSelectors = [], includeCurrentWork = false, findings = [] } = {}) {
  const records = Array.isArray(material.records) ? material.records : [];
  const lineage = resolveLineage(records, { depth: 'portable-grounding-readiness' });
  const requiredRecordResolution = resolveRequiredContextRecords(requiredContext, records);
  const requiredContextProjection = projectRequiredContext(requiredContext, requiredContextSelectors);
  const handoffMode = mode === 'routed-handoff-package';
  const routeRecordIds = resolveSelectedRouteRecords(authority, records);
  const relevantIds = handoffMode
    ? directedLineageCone(lineage, routeRecordIds)
    : new Set((lineage.nodes || []).map((node) => node.id));
  const relevantRecords = records.filter((record) => relevantIds.has(record.id));
  const overview = projectPortableOperatingOverview({ records: relevantRecords });
  const topology = projectRelevantTopology(lineage, relevantIds, overview.frontierCandidates || [], routeRecordIds);
  const lineageIssues = relevantLineageIssues(lineage, relevantIds);
  const routeBlockingLineageIssues = relevantLineageIssues(lineage, routeRecordIds);
  const continuity = projectColdStartContinuity({ mode, lineage, routeRecordIds, authority, material });
  const combinedFindings = dedupeFindings([
    ...findings,
    ...filterFindingsForIds(lineage.findings || [], relevantIds),
    ...(overview.findings || [])
  ]);

  const missingEvidence = [];
  const reasons = [];
  const known = [];
  const inferred = [];
  const unresolved = [];
  const humanOnly = [];

  if (handoffMode) {
    const route = authority?.selectedRoute || null;
    const roleState = String(authority?.role?.state || 'unresolved');
    if (!route || String(authority?.status || '') === 'blocked') missing(missingEvidence, unresolved, 'authority-route-unqualified', 'The selected Handoff route is not qualified for this grounding result.');
    else known.push(evidence('qualified-handoff-route', 'qualified', route.id || route.pointerPath || 'selected-route'));
    if (roleState === 'qualified' || roleState === 'not-applicable') known.push(evidence('recipient-role-boundary', roleState, authority?.role?.endpoint?.label || 'recipient'));
    else if (roleState === 'blocked') missing(missingEvidence, unresolved, 'recipient-role-blocked', 'The Handoff recipient Role boundary is blocked or contradictory.');
    else missing(missingEvidence, unresolved, 'recipient-role-unresolved', 'The Handoff recipient Role boundary is not qualified for act-ready grounding.');

    const required = Array.isArray(requiredContext) ? requiredContext : [];
    const unresolvedRequired = required.filter((entry) => entry.state !== 'qualified');
    if (unresolvedRequired.length) missing(missingEvidence, unresolved, 'required-context-unqualified', `${unresolvedRequired.length} declared Required Context item(s) are not exact-qualified.`);
    else known.push(evidence('required-context-closure', 'qualified', `${required.length} item(s)`));
    if (String(continuation?.state || '') !== 'ready') missing(missingEvidence, unresolved, 'continuation-not-ready', 'The grounded continuation is not ready for substantive work.');
    if (String(contextAudit?.status || '') !== 'ready' || String(contextAudit?.coverage?.state || '') !== 'qualified') missing(missingEvidence, unresolved, 'workspace-snapshot-coverage-unqualified', 'Complete carried Workspace snapshot coverage is not qualified.');
    else known.push(evidence('workspace-snapshot-coverage', 'qualified', `${contextAudit.workspaceMaterializations?.length || 0} workspace(s)`));
    for (const item of requiredRecordResolution.missing) missing(missingEvidence, unresolved, 'required-context-not-in-snapshot', item);
    if (!routeRecordIds.size) missing(missingEvidence, unresolved, 'selected-route-not-in-snapshot', 'The qualified selected Handoff route was not found at its exact carried Workspace path.');
  } else {
    unresolved.push(evidence('bounded-handoff-authority', 'not-supplied', 'loaded material only'));
    reasons.push(reason('discussion-only-without-handoff', 'Loaded material can support bounded discussion, but no Handoff authority/Required Context closure was supplied for act-ready grounding.'));
  }

  if (!records.length) missing(missingEvidence, unresolved, 'no-artifact-records', 'No readable Tiinex artifact records were loaded for grounding.');
  else known.push(evidence('loaded-artifact-records', 'known', `${records.length} record(s)`));

  inferred.push(evidence('relevant-lineage-scope', 'bounded-inference', handoffMode ? 'directed declared-Parent cone around the exact selected Handoff route within complete carried Workspace snapshots' : 'all loaded records'));
  inferred.push(evidence('lineage-leaf-role', 'bounded-inference', 'derived only from declared Parent edges in the shared resolver'));

  if (handoffMode) {
    if (routeBlockingLineageIssues.length) {
      missing(missingEvidence, unresolved, 'selected-route-lineage-unresolved', `${routeBlockingLineageIssues.length} Parent-lineage ambiguity/missing/integrity issue(s) affect the selected Handoff route itself.`);
    } else if (topology.routeLeaves.length) {
      known.push(evidence('selected-route-parent-lineage-leaf', 'resolved', `${topology.routeLeaves.length} selected-route leaf/leaves`));
    } else {
      missing(missingEvidence, unresolved, 'selected-route-lineage-leaf-missing', 'The selected Handoff route is not a resolved Parent-lineage leaf in the complete carried Workspace snapshots.');
    }
    if (lineageIssues.length > routeBlockingLineageIssues.length) unresolved.push(evidence('upstream-lineage-diagnostics', continuity.state === 'qualified' ? 'degraded-nonblocking' : 'blocking-for-cold-start-continuity', `${lineageIssues.length - routeBlockingLineageIssues.length} upstream Parent-lineage issue(s) remain outside the selected-route edge boundary.`));
  } else if (lineageIssues.length) {
    missing(missingEvidence, unresolved, 'loaded-lineage-unresolved', `${lineageIssues.length} loaded Parent-lineage ambiguity/missing/integrity issue(s) remain.`);
  } else if (topology.leaves.length) {
    known.push(evidence('loaded-parent-lineage-leaves', 'resolved', `${topology.leaves.length} loaded leaf/leaves`));
  } else {
    missing(missingEvidence, unresolved, 'loaded-lineage-leaf-missing', 'No resolved Parent-lineage leaf is available in the loaded material.');
  }

  if (handoffMode) {
    if (continuity.state === 'qualified') known.push(evidence('cold-start-root-continuity', 'qualified', `${continuity.proof.qualifiedRoots.length} qualified semantic root(s); ${continuity.proof.ancestorRecordsChecked} ancestor record(s) checked without projecting ancestor bodies.`));
    else missing(missingEvidence, unresolved, 'cold-start-root-continuity-unproven', `Cold-start continuity to a qualified semantic root is unproven; ${continuity.blockingIssues.length} blocking Parent/root issue(s) remain.`);
  }

  if (topology.currentTasks.length) known.push(evidence('declared-current-work', 'qualified-candidates', `${topology.currentTasks.length} Task candidate(s) on the selected route lineage`));
  else unresolved.push(evidence('declared-current-work', 'unresolved', 'no exact-qualified nonterminal Task candidate on the selected route lineage'));

  if (topology.currentFrontier.length) known.push(evidence('declared-current-frontier', 'resolved', `${topology.currentFrontier.length} nearest current Task anchor(s) to the selected route leaf`));
  else reasons.push(reason('current-frontier-not-resolved', 'Authority grounding is not act-ready until declared current-work evidence is resolved on the selected Handoff route lineage.'));

  const blockers = projectBlockers(overview.blockerSignals || [], topology.currentTaskIds);
  const currentWorkProjection = projectCurrentWork(topology, records, includeCurrentWork);
  if (continuity.losses?.items?.length) unresolved.push(evidence('non-critical-material-loss', 'degraded-nonblocking', `${continuity.losses.items.length} unavailable non-lineage asset/reference item(s) remain visible without blocking unrelated work.`));
  const externalHumanGates = Array.isArray(authority?.humanOnlyGates) ? authority.humanOnlyGates : [];
  for (const gate of externalHumanGates) humanOnly.push(evidence('human-only-gate', 'declared', String(gate?.label || gate || 'human gate')));

  let state = 'grounded-to-act';
  if (missingEvidence.length) state = 'insufficient-grounding';
  else if (!handoffMode || !topology.currentFrontier.length || humanOnly.length) state = 'grounded-to-discuss';
  if (state === 'grounded-to-act') reasons.push(reason('bounded-act-ready', 'Selected Handoff authority, Required Context, carried Workspace coverage, cold-start continuity to a qualified semantic root, the selected-route Parent-lineage leaf, and declared current-work frontier evidence are all resolved enough for the next bounded action.'));

  return Object.freeze({
    schema: PORTABLE_GROUNDING_READINESS_SCHEMA_ID,
    status: state === 'insufficient-grounding' ? 'blocked' : 'ready',
    readiness: Object.freeze({
      state,
      reasons: Object.freeze(reasons.slice(0, MAX_ITEMS)),
      missingEvidence: Object.freeze(missingEvidence.slice(0, MAX_ITEMS)),
      nextAction: nextActionFor(state, topology, continuity)
    }),
    authority: projectAuthority(authority, mode),
    coverage: Object.freeze({
      mode,
      loadedRecords: records.length,
      relevantRecords: relevantIds.size,
      requiredContext: Object.freeze({
        declared: requiredContext.length,
        matchedInWorkspaceSnapshots: requiredRecordResolution.ids.size,
        missingFromWorkspaceSnapshots: requiredRecordResolution.missing.length,
        items: requiredContextProjection.items,
        itemsOmitted: requiredContextProjection.itemsOmitted,
        bodiesProjected: requiredContextProjection.bodiesProjected,
        bodiesAvailable: requiredContextProjection.bodiesAvailable,
        requestedSelectors: requiredContextProjection.requestedSelectors,
        unmatchedSelectors: requiredContextProjection.unmatchedSelectors
      }),
      workspaceSnapshots: contextAudit ? Object.freeze({
        state: String(contextAudit.coverage?.state || contextAudit.status || 'unresolved'),
        qualified: String(contextAudit.status || '') === 'ready',
        count: contextAudit.workspaceMaterializations?.length || 0
      }) : Object.freeze({ state: 'not-supplied', qualified: false, count: 0 })
    }),
    lineage: Object.freeze({
      state: handoffMode ? (routeBlockingLineageIssues.length ? 'unresolved' : topology.routeLeaves.length ? (lineageIssues.length ? 'resolved-with-upstream-degradation' : 'resolved') : 'missing-leaf') : (lineageIssues.length ? 'unresolved' : topology.leaves.length ? 'resolved' : 'missing-leaf'),
      basis: 'declared-parent-only',
      filenameDimensionsUsed: false,
      carrierDimensionsUsed: false,
      roots: Object.freeze(topology.roots.slice(0, MAX_ITEMS)),
      rootsOmitted: Math.max(0, topology.roots.length - MAX_ITEMS),
      leaves: Object.freeze(topology.leaves.slice(0, MAX_ITEMS)),
      leavesOmitted: Math.max(0, topology.leaves.length - MAX_ITEMS),
      selectedRouteLeaves: Object.freeze(topology.routeLeaves.slice(0, MAX_ITEMS)),
      selectedRouteLeavesOmitted: Math.max(0, topology.routeLeaves.length - MAX_ITEMS),
      blockingIssues: Object.freeze(routeBlockingLineageIssues.slice(0, MAX_ITEMS)),
      blockingIssuesOmitted: Math.max(0, routeBlockingLineageIssues.length - MAX_ITEMS),
      diagnosticIssues: Object.freeze(lineageIssues.slice(0, MAX_ITEMS)),
      diagnosticIssuesOmitted: Math.max(0, lineageIssues.length - MAX_ITEMS),
      boundary: 'Leaf/root roles are derived only from loaded declared Parent edges produced by the shared lineage resolver. Filename numbering, carrier dimensions, directory depth, branch names, and Task lifecycle labels are never substituted for Parent topology.'
    }),
    continuity,
    currentWork: Object.freeze({
      state: topology.currentFrontier.length ? 'current-frontier-resolved' : topology.currentTasks.length ? 'current-candidates-without-frontier' : 'unresolved',
      frontier: currentWorkProjection.frontier,
      frontierOmitted: Math.max(0, topology.currentFrontier.length - MAX_ITEMS),
      candidates: Object.freeze(topology.currentTasks.slice(0, MAX_ITEMS)),
      candidatesOmitted: Math.max(0, topology.currentTasks.length - MAX_ITEMS),
      blockers: Object.freeze(blockers.slice(0, MAX_ITEMS)),
      blockersOmitted: Math.max(0, blockers.length - MAX_ITEMS),
      bodiesProjected: currentWorkProjection.bodiesProjected,
      bodiesAvailable: currentWorkProjection.bodiesAvailable,
      bodyProjectionRequested: Boolean(includeCurrentWork),
      lifecycleIsLineagePosition: false,
      lineageLeafMeansWorkflowFrontier: false
    }),
    evidence: Object.freeze({
      known: Object.freeze(known.slice(0, MAX_ITEMS)),
      inferred: Object.freeze(inferred.slice(0, MAX_ITEMS)),
      unresolved: Object.freeze(unresolved.slice(0, MAX_ITEMS)),
      humanOnly: Object.freeze(humanOnly.slice(0, MAX_ITEMS))
    }),
    findingSummary: summarizePortableFindings(combinedFindings),
    actionableFindings: Object.freeze(combinedFindings.filter((item) => item.severity === 'error' || item.severity === 'warning').slice(0, MAX_ITEMS)),
    actionableFindingsOmitted: Math.max(0, combinedFindings.filter((item) => item.severity === 'error' || item.severity === 'warning').length - MAX_ITEMS),
    deeper: Object.freeze({
      requiredContextBodies: handoffMode ? 'Re-run the same ground command with --include-required-context <requirement-id,name|all> only when exact qualified body text is needed.' : 'not-applicable',
      currentWorkBody: handoffMode ? 'Re-run the same ground command with --include-current-work when the exact current Task body is needed; --continue <workspace-dir> includes it automatically.' : 'not-applicable',
      lineage: 'Use resolve-lineage/search-lineage only when the bounded selected-route leaf/current-work pointers above are insufficient.',
      coldStartQualification: handoffMode ? 'Use qualify-cold-start only when cold-start process qualification/evidence is itself required; ground does not claim pre-takeover host observations.' : 'not-applicable'
    }),
    boundary: 'Decision-oriented grounding projection only. Handoff/Role/Task/Parent artifacts retain authority; this projection composes their loaded evidence and fails visible rather than inventing missing currentness or lineage.'
  });
}

function projectCurrentWork(topology = {}, records = [], includeCurrentWork = false) {
  const recordById = new Map((records || []).map((record) => [String(record.id || ''), record]));
  const frontier = (topology.currentFrontier || []).slice(0, MAX_ITEMS).map((item) => {
    const record = recordById.get(String(item.id || ''));
    const available = Boolean(record && typeof record.markdown === 'string' && record.markdown.length > 0);
    return Object.freeze({
      ...item,
      contentProjected: Boolean(includeCurrentWork && available),
      ...(includeCurrentWork && available ? { content: record.markdown } : {})
    });
  });
  const bodiesAvailable = (topology.currentFrontier || []).filter((item) => {
    const record = recordById.get(String(item.id || ''));
    return Boolean(record && typeof record.markdown === 'string' && record.markdown.length > 0);
  }).length;
  return Object.freeze({
    frontier: Object.freeze(frontier),
    bodiesProjected: frontier.filter((item) => item.contentProjected).length,
    bodiesAvailable
  });
}

function projectAuthority(authority, mode) {
  if (!authority || mode !== 'routed-handoff-package') return Object.freeze({ state: 'not-supplied', route: null, handoff: null, role: null, operationBoundary: null });
  const mutationBoundary = authority.mutationBoundary || null;
  return Object.freeze({
    state: String(authority.status || ''),
    route: authority.selectedRoute ? Object.freeze({ id: authority.selectedRoute.id || '', pointerPath: authority.selectedRoute.pointerPath || '', workspaceId: authority.selectedRoute.workspaceId || '' }) : null,
    handoff: authority.handoff ? Object.freeze({ purpose: authority.handoff.purpose || '', from: authority.handoff.from || '', to: authority.handoff.to || '', completionExpectation: authority.handoff.completionExpectation || null }) : null,
    role: authority.role ? Object.freeze({ state: authority.role.state || '', label: authority.role.endpoint?.label || '', kind: authority.role.endpoint?.kind || '' }) : null,
    operationBoundary: mutationBoundary ? Object.freeze({
      ...mutationBoundary,
      scope: 'current-grounding-operation-only',
      semanticAuthority: 'Handoff/Task/Role artifacts govern downstream work authority; this operation boundary neither grants nor revokes source-edit authority.',
      boundary: 'Describes the non-mutating behavior and host-safety limits of the current Tooling grounding operation only. It must not be interpreted as a prohibition on separately authorized downstream Workspace work.'
    }) : null
  });
}

function nextActionFor(state, topology, continuity = {}) {
  if (state === 'grounded-to-act') return Object.freeze({ kind: 'continue-bounded-handoff-work', target: topology.currentFrontier[0]?.path || '', basis: 'qualified authority + required context + cold-start root continuity + selected-route Parent leaf + declared current-work frontier' });
  if (state === 'grounded-to-discuss') return Object.freeze({ kind: topology.currentFrontier.length ? 'obtain-bounded-action-authority-or-human-gate' : 'resolve-current-work-frontier', target: topology.currentTasks[0]?.path || '', basis: 'discussion-ready but act-readiness condition is unresolved' });
  if (continuity?.state === 'unproven') return Object.freeze({
    kind: continuity.recovery?.state === 'host-action-available' ? 'recover-required-parent-with-host-action' : 'request-exact-required-parent-material',
    target: continuity.recovery?.target || '',
    basis: 'cold-start continuity to a qualified semantic root is required before substantive work',
    recovery: continuity.recovery || null
  });
  return Object.freeze({ kind: 'resolve-missing-grounding-evidence', target: '', basis: 'one or more blocking authority/context/lineage conditions remain' });
}

function nodeSummary(node = {}) { return Object.freeze({ id: node.id || '', path: node.path || '', title: node.title || '', schemaId: node.schemaId || '', trace: node.trace || '' }); }
function evidence(code, state, detail) { return Object.freeze({ code, state, detail: compactText(detail, 280) }); }
function reason(code, message) { return Object.freeze({ code, message }); }
function missing(list, unresolved, code, message) { const item = reason(code, message); list.push(item); unresolved.push(evidence(code, 'unresolved', message)); }
function finding(severity, code, message, params = {}) { return Object.freeze({ severity, code, message, source: PORTABLE_GROUNDING_READINESS_SCHEMA_ID, params }); }
function compactText(value = '', limit = 240) { const text = String(value || '').replace(/\s+/g, ' ').trim(); return text.length > limit ? `${text.slice(0, Math.max(0, limit - 1))}…` : text; }
function filterFindingsForIds(items = [], ids = new Set()) { return items.filter((item) => !item?.nodeId || ids.has(item.nodeId)); }
function dedupeFindings(items = []) { return dedupeBy(items, (item) => `${item.severity || ''}:${item.code || ''}:${item.nodeId || ''}:${item.target || ''}:${item.message || ''}`); }
function dedupeBy(items = [], keyFn) { const map = new Map(); for (const item of items) { const key = keyFn(item); if (!map.has(key)) map.set(key, item); } return Object.freeze([...map.values()]); }
