import { buildPublicationPreflight } from './publication.preflight.js';
import { isSourceBacked } from '../diagnostics/sourceBoundary.report.js';
import { projectPackageSourceReference } from '../export/package.sourceReference.js';
import { sha256Hex, utf8Bytes } from '../export/package.bytes.js';
import { normalizePublicationDestination, projectExecutedPublicationTarget, publicationDestinationFindings, publicationTargetQualified } from './publication.targetContract.js';

export const PUBLICATION_PLAN_SCHEMA_ID = 'tiinex.publication.plan.v1';
export const PUBLICATION_RESULT_SCHEMA_ID = 'tiinex.publication.result.v1';
export const PUBLICATION_RECEIPT_SCHEMA_ID = 'tiinex.publication.receipt.v1';

export function buildPublicationPlan(workspace = {}, input = {}) {
  const records = Array.isArray(input.records) ? input.records : (Array.isArray(workspace.records) ? workspace.records : []);
  const preflight = input.preflight || buildPublicationPreflight(workspace, { records, assets: input.assets || workspace.assets || [] });
  const record = input.record || findRecord(records, input.recordId || input.path || '');
  const findings = [];
  if (!record) findings.push(finding('error', 'publication.plan.input.missing', 'Publication plan requires one exact local-owned input record.'));
  if (record && isSourceBacked(record.source || {})) findings.push(finding('error', 'publication.plan.input.source-backed', 'Source-backed material is reference-only and cannot become a mutable local publication payload without an explicit derived local draft.', { recordId: record.id || '' }));
  const candidate = record ? (preflight.publishableLocalDrafts || []).find((item) => item.id === record.id || item.path === record.path) : null;
  if (record && !candidate) findings.push(finding('error', 'publication.plan.input.not-preflight-qualified', 'Local input is not qualified by current publication preflight.', { recordId: record.id || '', path: record.path || '' }));

  const destination = normalizePublicationDestination(input.destination || {});
  const mutationPolicy = String(input.mutationPolicy || '').trim();
  if (!mutationPolicy) findings.push(finding('error', 'publication.plan.mutation-policy.missing', 'Publication plan requires an explicit mutation policy; host execution must not infer create/update/replace behavior.'));
  findings.push(...publicationDestinationFindings(destination, mutationPolicy));
  const markdown = String(record?.markdown || '');
  const payloadBytes = utf8Bytes(markdown);
  const payload = deepFreeze({
    mediaType: 'text/markdown',
    bytes: payloadBytes.byteLength,
    sha256: sha256Hex(payloadBytes),
    representation: 'exact-local-markdown',
    content: markdown
  });
  const localInput = deepFreeze({
    id: String(record?.id || ''),
    title: String(record?.title || ''),
    path: String(record?.path || ''),
    schemaId: String(record?.schemaId || record?.kind || ''),
    sourceMode: String(record?.sourceMode || ''),
    ownership: record && !isSourceBacked(record.source || {}) ? 'owned-local' : 'not-owned-local',
    sourceUnchangedGuarantee: true
  });
  const verification = deepFreeze({
    required: true,
    requirement: 'provider-read-after-write-exact-representation',
    expectedPayloadSha256: payload.sha256,
    boundary: 'Host adapter must return exact post-write source identity and verification evidence; a transport success alone is not a durable source binding.'
  });
  const errors = findings.filter((item) => item.severity === 'error').length;
  const status = errors ? 'blocked' : 'ready';
  const identitySeed = {
    localInput: { id: localInput.id, path: localInput.path },
    destination,
    mutationPolicy,
    payload: { bytes: payload.bytes, sha256: payload.sha256 },
    verification: { required: verification.required, requirement: verification.requirement }
  };
  const planSha256 = sha256Hex(utf8Bytes(stableJson(identitySeed)));
  return deepFreeze({
    schema: PUBLICATION_PLAN_SCHEMA_ID,
    planId: `publication-plan:${planSha256.slice(0, 24)}`,
    status,
    boundary: 'Platform-neutral publication plan only. It performs no remote write, credential lookup, UI confirmation, local-source mutation, or automatic provenance assignment.',
    workspaceId: String(workspace.id || ''),
    localInput,
    destination,
    mutationPolicy,
    outboundPayload: payload,
    verification,
    guarantees: [
      'The local draft identity remains distinct from the publication operation and remote target identity.',
      'The local input/source state is not mutated by this plan.',
      'A successful host write without exact post-write verification does not create a durable source binding.'
    ],
    planSha256,
    findings
  });
}

export function buildPublicationResult(plan = {}, execution = {}) {
  const findings = [...(plan.findings || [])];
  if (plan.status !== 'ready') findings.push(finding('error', 'publication.result.plan-not-ready', 'Publication result cannot qualify success from a blocked publication plan.'));
  const executionState = normalizeExecutionState(execution.state || execution.status || '');
  if (!executionState) findings.push(finding('error', 'publication.result.execution-state.invalid', 'Publication result requires explicit success, failure, or partial execution state.'));
  const verificationState = normalizeVerificationState(execution.verification?.status || execution.verificationStatus || '');
  const targetProjection = projectExecutedPublicationTarget(plan, execution);
  const exactTarget = targetProjection.target;
  if (verificationState === 'verified') findings.push(...(targetProjection.findings || []));
  const hostWriteSucceeded = executionState === 'success' || executionState === 'partial';
  if (hostWriteSucceeded && verificationState !== 'verified') findings.push(finding('warning', 'publication.result.verification.incomplete', 'Host write is not durably source-qualified until exact post-write verification succeeds.'));
  if (executionState === 'success' && verificationState !== 'verified') findings.push(finding('error', 'publication.result.success-without-verification', 'Publication success cannot be claimed without required exact post-write verification.'));
  if (verificationState === 'verified' && !publicationTargetQualified(exactTarget)) findings.push(finding('error', 'publication.result.verified-target.incomplete', 'Verification claims success but exact publication target identity is incomplete for the declared target surface.'));
  if (verificationState === 'verified' && !String(execution.verifiedPayloadSha256 || '').trim()) findings.push(finding('error', 'publication.result.payload-verification.missing', 'Exact verification requires the verified remote payload SHA-256; target existence alone is insufficient.'));
  if (verificationState === 'verified' && execution.verifiedPayloadSha256 && execution.verifiedPayloadSha256 !== plan.outboundPayload?.sha256) findings.push(finding('error', 'publication.result.payload-verification.mismatch', 'Verified remote payload digest differs from the exact planned outbound payload.'));
  const verificationEvidence = deepFreeze({
    source: 'supplied-host-observation',
    method: String(execution.verification?.method || execution.verificationMethod || (verificationState === 'verified' ? 'exact-payload-sha256-observation' : '')).trim(),
    observedAt: String(execution.verification?.observedAt || execution.verifiedAt || execution.observedAt || '').trim(),
    observedTarget: exactTarget,
    payloadSha256: String(execution.verifiedPayloadSha256 || '').trim(),
    providerReceiptId: String(execution.providerReceiptId || exactTarget?.providerReceiptId || '').trim(),
    note: String(execution.verification?.note || execution.verificationNote || '').trim()
  });

  const errors = findings.filter((item) => item.severity === 'error').length;
  const warnings = findings.filter((item) => item.severity === 'warning').length;
  const qualifiedSuccess = !errors && executionState === 'success' && verificationState === 'verified' && publicationTargetQualified(exactTarget);
  const status = qualifiedSuccess ? 'success' : (executionState === 'failure' || errors ? 'failure' : 'partial');
  const sourceBinding = qualifiedSuccess ? deepFreeze({
    schema: 'tiinex.publication.source-binding.v1',
    localInputId: String(plan.localInput?.id || ''),
    publicationPlanId: String(plan.planId || ''),
    remoteTarget: exactTarget,
    payloadSha256: String(plan.outboundPayload?.sha256 || ''),
    targetKind: String(exactTarget?.targetKind || ''),
    mutability: String(exactTarget?.mutability || ''),
    verificationEvidence,
    verified: true,
    boundary: 'Post-publication source binding records the new exact remote representation without mutating or re-identifying the local draft.'
  }) : null;
  const resultIdentity = {
    planId: plan.planId || '',
    status,
    executionState,
    verificationState,
    remoteTarget: exactTarget,
    payloadSha256: plan.outboundPayload?.sha256 || ''
  };
  const resultSha256 = sha256Hex(utf8Bytes(stableJson(resultIdentity)));
  const receipt = deepFreeze({
    schema: PUBLICATION_RECEIPT_SCHEMA_ID,
    receiptId: `publication-receipt:${resultSha256.slice(0, 24)}`,
    planId: String(plan.planId || ''),
    planSha256: String(plan.planSha256 || ''),
    status,
    executionState,
    verificationState,
    localInputId: String(plan.localInput?.id || ''),
    inputSourceUnchanged: true,
    outboundPayloadSha256: String(plan.outboundPayload?.sha256 || ''),
    verifiedPayloadSha256: String(execution.verifiedPayloadSha256 || ''),
    verificationEvidence,
    remoteTarget: exactTarget,
    sourceBinding,
    remoteWritePerformed: hostWriteSucceeded,
    boundary: 'Receipt describes supplied host execution evidence only. This shared contract does not perform the host write and does not turn the local draft into the remote source artifact.'
  });

  return deepFreeze({
    schema: PUBLICATION_RESULT_SCHEMA_ID,
    resultId: `publication-result:${resultSha256.slice(0, 24)}`,
    status,
    boundary: 'Platform-neutral publication result over explicitly supplied adapter execution evidence; no remote execution occurs in this module.',
    planId: String(plan.planId || ''),
    executionState,
    verification: {
      required: Boolean(plan.verification?.required),
      status: verificationState || 'not-run',
      expectedPayloadSha256: String(plan.outboundPayload?.sha256 || ''),
      verifiedPayloadSha256: String(execution.verifiedPayloadSha256 || ''),
      evidence: verificationEvidence
    },
    localInput: plan.localInput || null,
    remoteTarget: exactTarget,
    sourceBinding,
    receipt,
    counts: { errors, warnings, findings: findings.length },
    findings
  });
}

function findRecord(records = [], key = '') {
  const clean = String(key || '').trim();
  return records.find((record) => record === key || String(record.id || '') === clean || String(record.path || '') === clean) || null;
}
function normalizeExecutionState(value = '') {
  const clean = String(value || '').trim().toLowerCase();
  return ['success', 'failure', 'partial'].includes(clean) ? clean : '';
}
function normalizeVerificationState(value = '') {
  const clean = String(value || '').trim().toLowerCase();
  return ['verified', 'failed', 'not-run', 'unavailable'].includes(clean) ? clean : '';
}
function stableJson(value) { return JSON.stringify(sortJson(value)); }
function sortJson(value) {
  if (Array.isArray(value)) return value.map(sortJson);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortJson(value[key])]));
}
function finding(severity, code, message, extra = {}) { return Object.freeze({ severity, code, message, ...extra }); }
function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer) return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}
