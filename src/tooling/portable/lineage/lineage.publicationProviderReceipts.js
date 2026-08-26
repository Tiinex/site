import {
  PORTABLE_HOST_ACTION_ACCEPTANCE_SCHEMA_ID,
  acceptPortableHostActionReceipt
} from '../host/tool.bindings.js';
import { portableFinding } from '../findings.js';
import { sha256Hex, utf8Bytes } from '../../../export/package.bytes.js';

export function normalizePublicationProviderReceipts(input = {}) {
  const findings = [];
  const references = [];
  const observations = [];

  for (const item of receiptInputs(input)) {
    const plan = item?.plan || item?.hostActionPlan || null;
    const receipt = item?.receipt || item?.hostReceipt || null;
    if (!plan || !receipt) {
      findings.push(portableFinding('error', 'portable.lineage.publication-provider.receipt-pair.required', 'Publication provider receipt input requires both the original host action plan and its receipt.'));
      references.push(Object.freeze({ actionId: String(plan?.actionId || receipt?.actionId || ''), status: 'rejected', reason: 'publication-provider-receipt-pair-required' }));
      continue;
    }
    addAcceptance(acceptPortableHostActionReceipt({ plan, receipt }), observations, references, findings, 'receipt');
  }

  for (const acceptance of acceptanceInputs(input)) addAcceptance(acceptance, observations, references, findings, 'acceptance');

  if (Array.isArray(input.providerResponses) && input.providerResponses.length) {
    findings.push(portableFinding('warning', 'portable.lineage.publication-provider.responses-unaccepted', 'Direct providerResponses are not publication qualification authority; supply an accepted publication provider host receipt or acceptance.'));
  }

  return Object.freeze({
    observations: Object.freeze(observations),
    references: Object.freeze(references),
    findings: Object.freeze(findings),
    summary: Object.freeze({
      acceptedReceipts: observations.length,
      acceptedFiles: observations.reduce((sum, entry) => sum + entry.files.length, 0),
      rejectedReceipts: references.filter((entry) => entry.status !== 'accepted').length
    }),
    boundary: Object.freeze({
      acceptedAction: 'repository-read',
      directProviderResponsesAreNotAuthority: true,
      localRecordEvidenceIsDescriptiveOnly: true,
      returnedProviderContentMustBeRehashedByLineageTooling: true
    })
  });
}

export function qualifiedPublicationCandidatesForParent(providerEvidence = {}, parentRecord = {}) {
  const markdown = String(parentRecord?.markdown || '');
  if (!markdown) return Object.freeze([]);
  const expectedBytes = utf8Bytes(markdown);
  const expectedSha256 = sha256Hex(expectedBytes);
  const candidates = new Map();
  for (const observation of providerEvidence.observations || []) {
    for (const file of observation.files || []) {
      const source = file.source || {};
      const repository = String(source.repository || '').trim();
      const commit = String(source.commit || '').trim().toLowerCase();
      const sourcePath = normalizePath(source.path || file.path || '');
      if (!repository || !/^[0-9a-f]{40}$/.test(commit) || !sourcePath || typeof file.content !== 'string') continue;
      const bytes = utf8Bytes(file.content);
      const sha256 = sha256Hex(bytes);
      if (bytes.byteLength !== expectedBytes.byteLength || sha256.toLowerCase() !== expectedSha256.toLowerCase()) continue;
      const locator = `https://github.com/${repository}/blob/${commit}/${sourcePath}`;
      candidates.set(locator, Object.freeze({
        state: 'qualified',
        locator,
        actionId: String(observation.actionId || ''),
        providerId: String(file.providerId || ''),
        source: Object.freeze({ repository, commit, path: sourcePath }),
        materialIdentity: Object.freeze({ state: 'qualified', sha256, bytes: bytes.byteLength })
      }));
    }
  }
  return Object.freeze([...candidates.values()].sort((a, b) => a.locator.localeCompare(b.locator)));
}

function addAcceptance(acceptance = {}, observations, references, findings, sourceKind) {
  const actionId = String(acceptance?.actionId || '');
  if (acceptance?.schema !== PORTABLE_HOST_ACTION_ACCEPTANCE_SCHEMA_ID) {
    reject(actionId, 'publication-provider-acceptance-schema-invalid', references, findings, 'portable.lineage.publication-provider.acceptance-schema.invalid', 'Publication provider evidence must use the portable host-action acceptance contract.');
    return;
  }
  if (acceptance.status !== 'accepted') {
    reject(actionId, 'publication-provider-receipt-rejected', references, findings, 'portable.lineage.publication-provider.acceptance-rejected', 'Rejected host/provider receipt material cannot qualify publication.');
    return;
  }
  if (String(acceptance.action || '') !== 'repository-read') {
    reject(actionId, 'publication-provider-action-mismatch', references, findings, 'portable.lineage.publication-provider.action.invalid', 'Publication qualification accepts only an explicit repository-read host action receipt.', { action: String(acceptance.action || '') });
    return;
  }

  const providerResponses = Array.isArray(acceptance.providerResponses) ? acceptance.providerResponses : [];
  const files = [];
  for (const response of providerResponses) {
    for (const file of Array.isArray(response?.files) ? response.files : []) {
      if (file?.sourceMode !== 'portable-host-repository' || !file?.source?.repository || file?.source?.remoteFetch !== true || typeof file?.content !== 'string') continue;
      files.push(Object.freeze({
        providerId: String(response.providerId || ''),
        path: normalizePath(file.path || ''),
        content: file.content,
        source: Object.freeze({
          repository: String(file.source.repository || ''),
          ref: String(file.source.ref || ''),
          commit: String(file.source.commit || ''),
          path: normalizePath(file.source.path || file.path || ''),
          authority: String(file.source.authority || ''),
          remoteFetch: true
        })
      }));
    }
  }
  if (!files.length) {
    reject(actionId, 'publication-provider-repository-material-missing', references, findings, 'portable.lineage.publication-provider.repository-material.missing', 'Accepted publication provider evidence did not contain repository-read UTF-8 material.');
    return;
  }

  references.push(Object.freeze({ actionId, status: 'accepted', reason: '' }));
  observations.push(Object.freeze({ actionId, action: 'repository-read', sourceKind, files: Object.freeze(files) }));
}

function reject(actionId, reason, references, findings, code, message, detail = {}) {
  references.push(Object.freeze({ actionId, status: 'rejected', reason }));
  findings.push(portableFinding('error', code, message, { actionId, ...detail }));
}

function receiptInputs(input = {}) {
  const out = [];
  if (input.publicationProviderReceipt) out.push(input.publicationProviderReceipt);
  if (Array.isArray(input.publicationProviderReceipts)) out.push(...input.publicationProviderReceipts);
  return out.filter(Boolean);
}

function acceptanceInputs(input = {}) {
  const out = [];
  if (input.publicationProviderAcceptance) out.push(input.publicationProviderAcceptance);
  if (Array.isArray(input.publicationProviderAcceptances)) out.push(...input.publicationProviderAcceptances);
  return out.filter(Boolean);
}

function normalizePath(value = '') { return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '').replace(/\/{2,}/g, '/'); }
