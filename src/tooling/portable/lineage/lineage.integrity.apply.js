import { parseArtifactMarkdown } from '../../../artifacts/artifact.parse.js';
import { canonicalC14nV2SelfState, validatedC14nV2PrimarySelfDigest } from '../../../integrity/integrity.c14nV2.js';
import { C14N_V2_METHOD_ID } from '../../../integrity/integrity.methodReference.js';
import { resolveLineage } from '../../../lineage/lineage.resolve.js';
import { normalizePortableInput } from '../input/portable.input.js';
import { portableFinding } from '../findings.js';
import { normalizePublicationProviderReceipts } from './lineage.publicationProviderReceipts.js';
import { applyStructureAwareLineageMutation } from './lineage.integrity.apply.structure.js';
import { providerMaterialMatches, targetAuthorizedByDeclaredParent } from './lineage.integrity.apply.evidence.js';

export const PORTABLE_LINEAGE_INTEGRITY_APPLY_SCHEMA_ID = 'tiinex.portable.lineage-integrity-repair-application.v1';
export const PORTABLE_LINEAGE_INTEGRITY_RECEIPT_SCHEMA_ID = 'tiinex.portable.lineage-integrity-repair-receipt.v1';

const APPROVED = new Set(['approved', 'accepted']);
const SEMANTIC_DISPOSITIONS = new Set(['representation-only', 'harmless-representation-only', 'qualified-semantic-decision']);
const PLAN_ACTIONS = new Set(['backfill-parent-target-v2', 'review-parent-target-mismatch', 'update-parent-origin-permalink', 'no-change', 'resolve-lineage-integrity-blocker']);

export function applyPortableLineageIntegrityRepair(input = {}, options = {}) {
  const material = normalizePortableInput(input.materials || input);
  const records = (material.records || []).filter((record) => record?.path && typeof record.markdown === 'string');
  const repairPlan = input.repairPlan || input.plan || null;
  const providerEvidence = normalizePublicationProviderReceipts(input);
  const findings = [...(material.findings || []), ...(providerEvidence.findings || [])];
  const planValidation = validatePlan(repairPlan);
  if (!planValidation.ok) return resultEnvelope({ status: 'blocked', records, receipts: [blockedReceipt('', '', 'plan-validation', planValidation.reasons)], findings: findingsWith(findings, 'error', 'portable.lineage-integrity-apply.plan-invalid', planValidation.reasons.join(', ')) });

  const approvals = normalizeApprovals(input.approvals || input.artifactApprovals || input.dispositions || []);
  const recordByPath = new Map(records.map((record) => [normalizePath(record.path), Object.freeze({ ...record, path: normalizePath(record.path) })]));
  const stepByPath = new Map((repairPlan.steps || []).map((step) => [normalizePath(step?.artifact?.path), step]));
  const lineage = resolveLineage(records, { depth: options.depth || 'portable-lineage-integrity-repair-application' });
  const graph = buildParentGraph(lineage, recordByPath);
  const order = topologicalPaths(recordByPath, graph.parentByChild, graph.childrenByParent);
  const working = new Map(recordByPath);
  const changedPaths = new Set();
  const receipts = [];
  const branchStops = new Set();

  for (const path of order) {
    const record = working.get(path);
    if (!record) continue;
    const step = stepByPath.get(path) || null;
    const approval = approvals.get(path) || null;
    const parentPath = graph.parentByChild.get(path) || '';
    const parentChanged = Boolean(parentPath && changedPaths.has(parentPath));
    const parentBranchStopped = Boolean(parentPath && branchStops.has(parentPath));
    const directAction = Boolean(step && step.action && step.action !== 'no-change' && step.action !== 'resolve-lineage-integrity-blocker');

    if (parentBranchStopped) {
      branchStops.add(path);
      continue;
    }
    if (!directAction && !parentChanged) continue;

    const classification = classifyRepair({ path, record, step, approval, parentPath, parentChanged, working, providerEvidence });
    if (!classification.ok) {
      receipts.push(blockedReceipt(path, record.id || '', classification.repairClass, classification.blockers, { descendantsConsidered: descendantPaths(path, graph.childrenByParent) }));
      if (parentChanged) branchStops.add(path);
      findings.push(portableFinding('warning', 'portable.lineage-integrity-apply.blocked', `Lineage repair application blocked for ${path}.`, { ref: path, reason: classification.blockers.join(', ') }));
      continue;
    }

    const parentRecord = parentPath ? working.get(parentPath) : null;
    const applied = applyOne({ record, parentRecord, step, approval, repairClass: classification.repairClass, desiredTarget: classification.desiredTarget, parentChanged });
    receipts.push(applied.receipt);
    if (applied.status === 'blocked') {
      if (parentChanged) branchStops.add(path);
      findings.push(portableFinding('error', 'portable.lineage-integrity-apply.representation-guard', `Representation-preserving repair failed closed for ${path}.`, { ref: path, reason: applied.receipt.remainingBlockers.join(', ') }));
      continue;
    }
    if (applied.status === 'changed') {
      changedPaths.add(path);
      working.set(path, Object.freeze({ ...record, markdown: applied.markdown }));
    }
  }

  const changedRecords = [...changedPaths].map((path) => working.get(path)).filter(Boolean);
  const blocked = receipts.some((receipt) => receipt.status === 'blocked');
  const changed = changedRecords.length > 0;
  const status = blocked ? (changed ? 'partial-blocked' : 'blocked') : changed ? 'changed' : 'no-op';
  return resultEnvelope({ status, records, changedRecords, receipts, findings });
}

function classifyRepair({ path, record, step, approval, parentPath, parentChanged, working, providerEvidence }) {
  const repairClass = directRepairClass(step, parentChanged);
  const blockers = [];
  if (!approval || !APPROVED.has(String(approval.state || approval.disposition || '').toLowerCase())) blockers.push('per-artifact-approval-required');
  if (step && !PLAN_ACTIONS.has(String(step.action || ''))) blockers.push(`unsupported-plan-action:${step.action || ''}`);
  if (step?.approval?.disposition === 'blocked' && !canQualifyBlockedPlan(step, approval)) blockers.push(...(step.approval.blockers || ['plan-step-blocked']));
  if (step?.action === 'review-parent-target-mismatch') {
    if (!SEMANTIC_DISPOSITIONS.has(String(approval?.semanticDisposition || ''))) blockers.push('qualified-semantic-disposition-required');
    if (!String(approval?.semanticAuthority || '').trim()) blockers.push('semantic-authority-reference-required');
    for (const blocker of step?.approval?.blockers || []) if (!blockerSatisfied(blocker, approval)) blockers.push(blocker);
  }
  if (step?.action === 'backfill-parent-target-v2' && step?.approval?.disposition !== 'proposed') blockers.push(`backfill-plan-disposition-not-proposed:${step?.approval?.disposition || 'missing'}`);
  if (step?.action === 'update-parent-origin-permalink') {
    if (!Array.from(step?.expectedMutation?.headerFields || []).includes('Parent.Origin.browse+git')) blockers.push('plan-header-origin-update-not-authorized');
    if (!String(step?.candidateParentOrigin || '').trim()) blockers.push('plan-candidate-parent-origin-missing');
    if (approval?.publicationDisposition !== 'qualified-exact-publication') blockers.push('qualified-exact-publication-disposition-required');
  }
  if (parentChanged && !parentPath) blockers.push('cascade-parent-unresolved');
  if (parentChanged && step?.action === 'resolve-lineage-integrity-blocker') blockers.push('blocked-descendant-cannot-cascade');
  const currentSelf = canonicalC14nV2SelfState(record.markdown || '');
  if (currentSelf.state !== 'verified') blockers.push(`child-self-${currentSelf.state || 'unavailable'}`);
  const parentRecord = parentPath ? working.get(parentPath) : null;
  if ((directNeedsParent(step) || parentChanged) && !parentRecord) blockers.push('exact-parent-material-required');
  let parentSelf = null;
  if (parentRecord) {
    parentSelf = validatedC14nV2PrimarySelfDigest(parentRecord.markdown || '');
    if (parentSelf.state !== 'verified') blockers.push(`parent-self-${parentSelf.state || 'unavailable'}`);
    if (directNeedsParent(step) && !parentChanged && step?.candidateTargetDigest && parentSelf.state === 'verified' && step.candidateTargetDigest !== parentSelf.value) blockers.push('plan-candidate-parent-digest-stale');
  }
  const desiredTarget = desiredParentTarget(step, approval, record);
  if ((directNeedsParent(step) || parentChanged) && !desiredTarget) blockers.push('parent-target-locator-unavailable');
  if (directNeedsParent(step) && desiredTarget && !targetAuthorizedByDeclaredParent(record, step, approval, desiredTarget)) blockers.push('desired-parent-target-not-authorized-by-declared-parent');
  if (parentRecord && step?.action === 'backfill-parent-target-v2') {
    const evidenceTarget = String(step?.publicationLocator || step?.exactParentTarget?.publicationLocator || desiredTarget || '');
    if (!providerMaterialMatches(providerEvidence, evidenceTarget, parentRecord.markdown || '', false)) blockers.push('accepted-exact-provider-material-required');
  }
  if (parentRecord && step?.action === 'review-parent-target-mismatch') {
    const evidenceTarget = String(step?.publicationLocator || step?.exactParentTarget?.publicationLocator || '');
    const historical = approval?.targetDisposition === 'repaired-local-parent' && approval?.originDisposition === 'historical-pre-repair-origin-retained';
    if (!providerMaterialMatches(providerEvidence, evidenceTarget, parentRecord.markdown || '', historical)) blockers.push(historical ? 'accepted-historical-provider-material-required' : 'accepted-exact-provider-material-required');
  }
  if (parentRecord && step?.action === 'update-parent-origin-permalink') {
    if (!providerMaterialMatches(providerEvidence, desiredTarget, parentRecord.markdown || '', false)) blockers.push('accepted-exact-provider-material-required');
  }
  return Object.freeze({ ok: blockers.length === 0, repairClass, desiredTarget, blockers: Object.freeze(unique(blockers)) });
}

function canQualifyBlockedPlan(step, approval) {
  if (step?.action !== 'review-parent-target-mismatch') return false;
  return (step?.approval?.blockers || []).every((blocker) => blockerSatisfied(blocker, approval));
}

function blockerSatisfied(blocker, approval = {}) {
  if (blocker === 'existing-target-mismatch-is-not-refresh-authority') return SEMANTIC_DISPOSITIONS.has(String(approval.semanticDisposition || '')) && Boolean(String(approval.semanticAuthority || '').trim());
  if (blocker === 'publication-origin-stale' || blocker === 'publication-origin-contradictory') return approval.targetDisposition === 'repaired-local-parent' && approval.originDisposition === 'historical-pre-repair-origin-retained' && SEMANTIC_DISPOSITIONS.has(String(approval.semanticDisposition || ''));
  return false;
}

function directNeedsParent(step) { return ['backfill-parent-target-v2', 'review-parent-target-mismatch', 'update-parent-origin-permalink'].includes(step?.action); }
function directRepairClass(step, parentChanged) {
  if (step?.action === 'backfill-parent-target-v2') return 'missing-parent-target-backfill';
  if (step?.action === 'review-parent-target-mismatch') return 'mismatching-parent-target-refresh';
  if (step?.action === 'update-parent-origin-permalink') return 'qualified-parent-origin-update';
  return parentChanged ? 'descendant-cascade-reseal' : 'no-change';
}
function desiredParentTarget(step, approval, record) {
  if (step?.action === 'review-parent-target-mismatch' && approval?.targetDisposition === 'repaired-local-parent') return String(step?.exactParentTarget?.trace || '').trim();
  if (step?.action === 'update-parent-origin-permalink') return String(step?.candidateParentOrigin || '').trim();
  if (step?.exactParentTarget?.expectedIntegrityTarget) return String(step.exactParentTarget.expectedIntegrityTarget).trim();
  const parsed = safeParse(record?.markdown || '');
  const existing = (parsed?.integrity?.entries || []).find((entry) => entry?.method === C14N_V2_METHOD_ID && String(entry?.towards || '') !== 'self');
  return String(existing?.towards || '').trim();
}


function applyOne({ record, parentRecord, step, approval, repairClass, desiredTarget }) {
  const original = String(record.markdown || '');
  const oldParsed = safeParse(original);
  if (!oldParsed) return blockedApply(record, repairClass, ['artifact-parse-failed']);
  const oldSelf = canonicalC14nV2SelfState(original);
  if (oldSelf.state !== 'verified') return blockedApply(record, repairClass, [`child-self-${oldSelf.state || 'unavailable'}`]);
  const oldParentEntries = (oldParsed?.integrity?.entries || []).filter((entry) => entry?.method === C14N_V2_METHOD_ID && String(entry?.towards || '') !== 'self');
  const oldParentEntry = oldParentEntries.length === 1 ? oldParentEntries[0] : null;
  const oldHeaderTarget = browseGitOrigin(oldParsed);
  const parentSelf = parentRecord ? validatedC14nV2PrimarySelfDigest(parentRecord.markdown || '') : null;
  const desiredDigest = parentSelf?.state === 'verified' ? parentSelf.value : String(step?.candidateTargetDigest || '');
  if (!desiredDigest) return blockedApply(record, repairClass, ['candidate-parent-digest-unavailable']);

  const desiredHeaderTarget = step?.action === 'update-parent-origin-permalink' ? String(step.candidateParentOrigin || '') : oldHeaderTarget;
  const alreadyDesired = oldParentEntries.length === 1 && oldParentEntry && oldParentEntry.towards === desiredTarget && oldParentEntry.value === desiredDigest && oldHeaderTarget === desiredHeaderTarget;
  if (alreadyDesired) return noOpApply(record, repairClass, oldHeaderTarget, oldParentEntry, oldSelf, descendantList(step));

  const structured = applyStructureAwareLineageMutation({
    markdown: original,
    target: desiredTarget,
    digest: desiredDigest,
    parentPath: parentRecord?.path || step?.exactParentTarget?.path || '',
    parentOriginTarget: step?.action === 'update-parent-origin-permalink' && oldHeaderTarget !== desiredHeaderTarget ? desiredHeaderTarget : ''
  });
  if (!structured.ok) return blockedApply(record, repairClass, structured.blockers);
  const next = structured.markdown;
  const newParsed = safeParse(next);
  const newSelf = canonicalC14nV2SelfState(next);
  if (!newParsed || newSelf.state !== 'verified') return blockedApply(record, repairClass, [`post-repair-self-${newSelf.state || 'unavailable'}`]);
  const newParentEntry = parentIntegrityEntry(newParsed);
  if (!newParentEntry || newParentEntry.towards !== desiredTarget || newParentEntry.value !== desiredDigest) return blockedApply(record, repairClass, ['post-repair-parent-target-verification-failed']);

  const receipt = repairReceipt({
    status: next === original ? 'no-op' : 'changed', record, repairClass,
    reason: String(approval?.reason || approval?.semanticDisposition || step?.currentState || repairClass),
    oldHeaderTarget, newHeaderTarget: browseGitOrigin(newParsed),
    oldParentTarget: oldParentEntry, newParentTarget: newParentEntry,
    oldSelfDigest: oldSelf.declaredValue || '', newSelfDigest: newSelf.declaredValue || '',
    descendantsConsidered: descendantList(step), mutationSurfaces: structured.mutationSurfaces,
    bodyPreserved: structured.bodyPreserved,
    siblingFooterEntriesPreserved: structured.siblingFooterEntriesPreserved,
    remainingBlockers: []
  });
  return Object.freeze({ status: receipt.status, markdown: next, receipt });
}

function buildParentGraph(lineage, recordByPath) {
  const pathById = new Map((lineage.nodes || []).map((node) => [String(node.id || ''), normalizePath(node.path || node.record?.path || '')]));
  const parentByChild = new Map();
  const childrenByParent = new Map();
  for (const edge of lineage.edges || []) {
    if (edge.kind !== 'parent' || !edge.from || !edge.to || edge.status === 'missing') continue;
    const parent = pathById.get(String(edge.from)) || '';
    const child = pathById.get(String(edge.to)) || '';
    if (!parent || !child || !recordByPath.has(parent) || !recordByPath.has(child)) continue;
    if (parentByChild.has(child) && parentByChild.get(child) !== parent) continue;
    parentByChild.set(child, parent);
    const children = childrenByParent.get(parent) || [];
    children.push(child);
    childrenByParent.set(parent, unique(children).sort());
  }
  return Object.freeze({ parentByChild, childrenByParent });
}

function topologicalPaths(recordByPath, parentByChild, childrenByParent) {
  const indegree = new Map([...recordByPath.keys()].map((path) => [path, parentByChild.has(path) ? 1 : 0]));
  const queue = [...indegree].filter(([, degree]) => degree === 0).map(([path]) => path).sort();
  const out = [];
  while (queue.length) {
    const path = queue.shift();
    out.push(path);
    for (const child of childrenByParent.get(path) || []) {
      indegree.set(child, Math.max(0, (indegree.get(child) || 0) - 1));
      if (indegree.get(child) === 0) { queue.push(child); queue.sort(); }
    }
  }
  for (const path of [...recordByPath.keys()].sort()) if (!out.includes(path)) out.push(path);
  return out;
}

function descendantPaths(path, childrenByParent) {
  const out = [];
  const queue = [...(childrenByParent.get(path) || [])].map((child) => ({ path: child, depth: 1 }));
  const seen = new Set();
  while (queue.length) {
    const current = queue.shift();
    if (!current || seen.has(current.path)) continue;
    seen.add(current.path);
    out.push(Object.freeze({ path: current.path, depth: current.depth }));
    for (const child of childrenByParent.get(current.path) || []) queue.push({ path: child, depth: current.depth + 1 });
  }
  return Object.freeze(out);
}

function validatePlan(plan) {
  const reasons = [];
  if (!plan || typeof plan !== 'object') reasons.push('explicit-repair-plan-required');
  if (plan?.schema !== 'tiinex.portable.repair-plan.v1') reasons.push(`repair-plan-schema-unsupported:${plan?.schema || 'missing'}`);
  if (plan?.mode !== 'lineage-integrity-inspection') reasons.push(`repair-plan-mode-unsupported:${plan?.mode || 'missing'}`);
  if (!Array.isArray(plan?.steps)) reasons.push('repair-plan-steps-required');
  if (plan?.boundary?.automaticRewrite !== false) reasons.push('repair-plan-automatic-rewrite-boundary-invalid');
  return Object.freeze({ ok: reasons.length === 0, reasons: Object.freeze(reasons) });
}

function normalizeApprovals(value) {
  const out = new Map();
  if (Array.isArray(value)) {
    for (const item of value) { const path = normalizePath(item?.path || item?.artifact?.path || ''); if (path) out.set(path, Object.freeze({ ...item, path })); }
  } else if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) { const path = normalizePath(item?.path || key); if (path) out.set(path, Object.freeze({ ...(item || {}), path })); }
  }
  return out;
}

function resultEnvelope({ status, records, changedRecords = [], receipts = [], findings = [] }) {
  const frozenReceipts = Object.freeze(receipts.map((receipt) => Object.freeze(receipt)));
  const humanReceipt = frozenReceipts.map((receipt) => humanReceiptLine(receipt)).join('\n');
  return Object.freeze({
    schema: PORTABLE_LINEAGE_INTEGRITY_APPLY_SCHEMA_ID,
    status,
    changeset: Object.freeze({ schema: 'tiinex.portable.local-lineage-repair-changeset.v1', records: Object.freeze(changedRecords.map((record) => Object.freeze({ ...record }))), changedPaths: Object.freeze(changedRecords.map((record) => record.path)), sourceMutation: false, remoteWrite: false, publicationMutation: false }),
    receipts: frozenReceipts,
    humanReceipt,
    boundary: Object.freeze({ explicitRepairPlanRequired: true, perArtifactApprovalRequired: true, structureAwareEditing: true, bodyMutationAuthorized: false, sourceMutation: false, remoteWrite: false, publicationMutation: false, representationDiffFailClosed: true }),
    inputRecordCount: records.length,
    findings: Object.freeze(findings)
  });
}

function repairReceipt({ status, record, repairClass, reason, oldHeaderTarget, newHeaderTarget, oldParentTarget, newParentTarget, oldSelfDigest, newSelfDigest, descendantsConsidered, mutationSurfaces, bodyPreserved, siblingFooterEntriesPreserved, remainingBlockers }) {
  return Object.freeze({ schema: PORTABLE_LINEAGE_INTEGRITY_RECEIPT_SCHEMA_ID, status, artifact: Object.freeze({ id: String(record.id || ''), path: normalizePath(record.path || '') }), repairClass, reason, oldHeaderTargets: Object.freeze({ parentOriginBrowseGit: oldHeaderTarget || '' }), newHeaderTargets: Object.freeze({ parentOriginBrowseGit: newHeaderTarget || '' }), oldParentTarget: Object.freeze({ locator: oldParentTarget?.towards || '', digest: oldParentTarget?.value || '' }), newParentTarget: Object.freeze({ locator: newParentTarget?.towards || '', digest: newParentTarget?.value || '' }), oldSelfDigest: oldSelfDigest || '', newSelfDigest: newSelfDigest || '', descendantsConsidered: Object.freeze([...(descendantsConsidered || [])]), mutationSurface: Object.freeze([...(mutationSurfaces || [])]), bodyPreservationCheck: bodyPreserved ? 'byte-identical' : 'failed', siblingFooterPreservationCheck: siblingFooterEntriesPreserved ? 'byte-identical' : 'failed', remainingBlockers: Object.freeze([...(remainingBlockers || [])]) });
}
function blockedReceipt(path, id, repairClass, blockers, extra = {}) { return repairReceipt({ status: 'blocked', record: { path, id }, repairClass, reason: 'blocked', oldHeaderTarget: '', newHeaderTarget: '', oldParentTarget: null, newParentTarget: null, oldSelfDigest: '', newSelfDigest: '', descendantsConsidered: extra.descendantsConsidered || [], mutationSurfaces: [], bodyPreserved: true, siblingFooterEntriesPreserved: true, remainingBlockers: unique(blockers) }); }
function blockedApply(record, repairClass, blockers) { return Object.freeze({ status: 'blocked', markdown: record.markdown || '', receipt: blockedReceipt(record.path || '', record.id || '', repairClass, blockers) }); }
function noOpApply(record, repairClass, header, parentEntry, self, descendants) { return Object.freeze({ status: 'no-op', markdown: record.markdown || '', receipt: repairReceipt({ status: 'no-op', record, repairClass, reason: 'already-repaired', oldHeaderTarget: header, newHeaderTarget: header, oldParentTarget: parentEntry, newParentTarget: parentEntry, oldSelfDigest: self.declaredValue || '', newSelfDigest: self.declaredValue || '', descendantsConsidered: descendants, mutationSurfaces: [], bodyPreserved: true, siblingFooterEntriesPreserved: true, remainingBlockers: [] }) }); }
function humanReceiptLine(receipt) { const path = receipt.artifact?.path || '(plan)'; const blockers = receipt.remainingBlockers?.length ? ` blockers=${receipt.remainingBlockers.join(',')}` : ''; return `${receipt.status.toUpperCase()} ${path} ${receipt.repairClass}${blockers}`; }
function findingsWith(findings, severity, code, message) { return [...findings, portableFinding(severity, code, message, {})]; }

function parentIntegrityEntry(parsed) { return (parsed?.integrity?.entries || []).find((entry) => entry?.method === C14N_V2_METHOD_ID && String(entry?.towards || '') !== 'self') || null; }
function browseGitOrigin(parsed) { return String((parsed?.envelope?.parent?.originEntries || []).find((entry) => entry.label === 'browse + git')?.target || ''); }
function descendantList(step) { return Object.freeze([...(step?.descendantImpact || [])]); }
function safeParse(markdown) { try { return parseArtifactMarkdown(markdown); } catch { return null; } }

function normalizePath(value) { return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '').replace(/^\/+|\/+$/g, ''); }
function unique(values) { return [...new Set((values || []).map(String).filter(Boolean))]; }
