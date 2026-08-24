import { sha256Hex, utf8Bytes } from '../../../export/package.bytes.js';

export function classifyPortablePublicationOrigin(parentEnvelope = {}, childRecord = {}, parentRecord = null, providerEvidence = {}) {
  const entries = Array.isArray(parentEnvelope.originEntries) ? parentEnvelope.originEntries : [];
  const relative = entries.filter((entry) => String(entry.label || '') === 'relative');
  const browse = entries.filter((entry) => String(entry.label || '') === 'browse + git');
  if (relative.length > 1 || browse.length > 1) return publicationState('contradictory', 'duplicate-parent-origin-representation', browse[0]?.target || '', { locatorState: 'contradictory', evidenceState: 'rejected' });
  if (relative.length === 1 && parentEnvelope.trace && String(relative[0].target || '') !== String(parentEnvelope.trace || '')) return publicationState('contradictory', 'relative-origin-disagrees-with-trace', browse[0]?.target || '', { locatorState: 'contradictory', evidenceState: 'rejected' });
  if (!browse.length) return publicationState('missing', 'browse-git-origin-missing', '', { locatorState: 'missing', evidenceState: 'not-applicable' });
  const locator = String(browse[0].target || '');
  if (!locator) return publicationState('unresolved', 'browse-git-origin-empty', '', { locatorState: 'empty', evidenceState: 'missing' });

  const locatorState = declaredPublicationLocatorState(locator);
  const qualification = qualifyPublicationEvidence({ locator, parentRecord, childRecord, providerEvidence });
  if (locatorState === 'mutable-or-noncanonical-github-blob') return publicationState('stale', 'mutable-or-noncanonical-github-blob', locator, { locatorState, evidenceState: qualification.state, evidence: qualification.evidence, providerRequirement: providerRequirement(locator, parentRecord, true) });
  if (qualification.state === 'qualified') return publicationState('qualified', 'accepted-provider-publication-material', locator, { locatorState, evidenceState: 'qualified', evidence: qualification.evidence, providerRequirement: providerRequirement(locator, parentRecord, false) });
  if (qualification.state === 'contradictory') return publicationState('contradictory', qualification.reason, locator, { locatorState, evidenceState: 'rejected', evidence: qualification.evidence, providerRequirement: providerRequirement(locator, parentRecord, true) });
  if (locatorState === 'commit-pinned-github-blob') return publicationState('unresolved', qualification.reason || 'publication-provider-receipt-required', locator, { locatorState, evidenceState: qualification.state, evidence: qualification.evidence, providerRequirement: providerRequirement(locator, parentRecord, true) });
  if (/^https?:\/\//i.test(locator)) return publicationState('unresolved', qualification.reason || 'publication-locator-not-independently-qualified', locator, { locatorState, evidenceState: qualification.state, evidence: qualification.evidence, providerRequirement: providerRequirement(locator, parentRecord, true) });
  return publicationState('unresolved', 'publication-locator-unsupported', locator, { locatorState, evidenceState: qualification.state, evidence: qualification.evidence, providerRequirement: providerRequirement(locator, parentRecord, true) });
}

function qualifyPublicationEvidence({ locator = '', parentRecord = null, childRecord = {}, providerEvidence = {} } = {}) {
  const recordEvidence = inspectRecordPublicationEvidence({ locator, parentRecord, childRecord });
  if (recordEvidence.state === 'contradictory') return recordEvidence;
  if (!parentRecord?.markdown) return Object.freeze({ state: 'unresolved', reason: 'publication-parent-material-unavailable', evidence: recordEvidence.evidence || null });

  const locatorIdentity = parseGithubBlobLocator(locator);
  if (!locatorIdentity) return Object.freeze({ state: recordEvidence.state, reason: recordEvidence.reason || 'publication-provider-receipt-required', evidence: recordEvidence.evidence || null });

  const eligible = eligibleProviderObservations(providerEvidence, recordEvidence.receiptReference);
  if (recordEvidence.receiptReference && !eligible.length) {
    const reference = (providerEvidence.references || []).find((entry) => entry.actionId === recordEvidence.receiptReference);
    return Object.freeze({
      state: 'unresolved',
      reason: reference?.reason || 'publication-evidence-receipt-reference-unresolved',
      evidence: recordEvidence.evidence || null
    });
  }

  const parentBytes = utf8Bytes(parentRecord.markdown || '');
  const parentSha256 = sha256Hex(parentBytes);
  for (const observation of eligible) {
    for (const file of observation.files || []) {
      const source = file.source || {};
      const repository = String(source.repository || '');
      const commit = String(source.commit || '').toLowerCase();
      const sourcePath = normalizePath(source.path || file.path || '');
      if (repository !== locatorIdentity.repository || commit !== locatorIdentity.commit || sourcePath !== locatorIdentity.path) continue;
      const providerBytes = utf8Bytes(file.content || '');
      const providerSha256 = sha256Hex(providerBytes);
      if (providerSha256.toLowerCase() !== parentSha256.toLowerCase() || providerBytes.byteLength !== parentBytes.byteLength) {
        return Object.freeze({ state: 'contradictory', reason: 'publication-provider-material-mismatch', evidence: summarizeProviderEvidence(locator, observation, file, providerSha256, providerBytes.byteLength) });
      }
      return Object.freeze({ state: 'qualified', reason: '', evidence: summarizeProviderEvidence(locator, observation, file, providerSha256, providerBytes.byteLength) });
    }
  }

  if (recordEvidence.receiptReference && eligible.length) return Object.freeze({ state: 'contradictory', reason: 'publication-provider-identity-mismatch', evidence: recordEvidence.evidence || null });
  return Object.freeze({ state: 'unresolved', reason: 'publication-provider-receipt-required', evidence: recordEvidence.evidence || null });
}

function inspectRecordPublicationEvidence({ locator = '', parentRecord = null, childRecord = {} } = {}) {
  const candidates = publicationEvidenceCandidates(parentRecord, childRecord);
  if (!candidates.length) return Object.freeze({ state: 'missing', reason: 'publication-provider-receipt-required', evidence: null, receiptReference: '' });
  for (const supplied of candidates) {
    const evidence = supplied?.evidence || supplied?.resolutionEvidence || null;
    if (!evidence || typeof evidence !== 'object') continue;
    const summary = summarizePublicationEvidence(evidence, supplied);
    const evidenceTarget = summary.target;
    const evidenceState = summary.state;
    const receiptReference = publicationEvidenceReceiptReference(evidence, supplied);
    if (evidenceTarget && evidenceTarget !== locator) return Object.freeze({ state: 'contradictory', reason: 'publication-evidence-target-mismatch', evidence: summary, receiptReference });
    if (evidenceState !== 'qualified') continue;
    if (!parentRecord?.markdown) return Object.freeze({ state: 'unresolved', reason: 'publication-parent-material-unavailable', evidence: summary, receiptReference });

    const identity = evidence.materialIdentity || evidence.material || {};
    const actualBytes = utf8Bytes(parentRecord.markdown || '');
    const actualSha256 = sha256Hex(actualBytes);
    if (String(identity.state || '') === 'qualified' && String(identity.sha256 || '')) {
      if (String(identity.sha256 || '').toLowerCase() !== actualSha256.toLowerCase()) return Object.freeze({ state: 'contradictory', reason: 'publication-evidence-material-sha256-mismatch', evidence: summary, receiptReference });
      if (identity.bytes !== undefined && Number(identity.bytes) !== actualBytes.byteLength) return Object.freeze({ state: 'contradictory', reason: 'publication-evidence-material-bytes-mismatch', evidence: summary, receiptReference });
    }

    const locatorIdentity = parseGithubBlobLocator(locator);
    const source = evidence.source || evidence.providerSource || evidence.provider || {};
    if (source && typeof source === 'object' && Object.keys(source).length && locatorIdentity) {
      const repository = String(source.repository || source.repo || '');
      const commit = String(source.commit || source.ref || '');
      const sourcePath = normalizePath(source.path || source.repositoryPath || '');
      if (repository !== locatorIdentity.repository || commit.toLowerCase() !== locatorIdentity.commit || sourcePath !== locatorIdentity.path) return Object.freeze({ state: 'contradictory', reason: 'publication-evidence-provider-identity-mismatch', evidence: summary, receiptReference });
    }
    return Object.freeze({ state: 'unresolved', reason: 'publication-provider-receipt-required', evidence: summary, receiptReference });
  }
  return Object.freeze({ state: 'unresolved', reason: 'publication-provider-receipt-required', evidence: null, receiptReference: '' });
}

function eligibleProviderObservations(providerEvidence = {}, receiptReference = '') {
  const observations = Array.isArray(providerEvidence.observations) ? providerEvidence.observations : [];
  if (!receiptReference) return observations;
  return observations.filter((entry) => String(entry.actionId || '') === receiptReference);
}

function publicationEvidenceCandidates(parentRecord = null, childRecord = {}) {
  return [
    parentRecord?.publishedReference,
    parentRecord?.publicationEvidence,
    childRecord?.parentPublishedReference,
    childRecord?.parentPublicationEvidence
  ].filter((value) => value && typeof value === 'object');
}

function publicationEvidenceReceiptReference(evidence = {}, supplied = {}) {
  return String(evidence.receiptRef || evidence.providerReceiptRef || evidence.hostActionId || evidence.actionId || supplied.receiptRef || supplied.providerReceiptRef || supplied.hostActionId || supplied.actionId || '');
}

function summarizePublicationEvidence(evidence = {}, supplied = {}) {
  const identity = evidence.materialIdentity || evidence.material || {};
  const source = evidence.source || evidence.providerSource || evidence.provider || {};
  return Object.freeze({
    target: String(evidence.target || supplied.target || supplied.url || ''),
    state: String(evidence.state || evidence.resolutionState || supplied.state || supplied.resolutionState || ''),
    kind: String(evidence.kind || ''),
    receiptReference: publicationEvidenceReceiptReference(evidence, supplied),
    source: Object.freeze({ repository: String(source.repository || source.repo || ''), commit: String(source.commit || source.ref || ''), path: normalizePath(source.path || source.repositoryPath || ''), target: String(source.target || source.url || '') }),
    materialIdentity: Object.freeze({ state: String(identity.state || ''), sha256: String(identity.sha256 || ''), bytes: identity.bytes === undefined ? null : Number(identity.bytes) })
  });
}

function summarizeProviderEvidence(locator, observation = {}, file = {}, sha256 = '', bytes = 0) {
  const source = file.source || {};
  return Object.freeze({
    target: locator,
    state: 'qualified',
    kind: 'accepted-provider-material',
    receiptReference: String(observation.actionId || ''),
    providerId: String(file.providerId || ''),
    source: Object.freeze({ repository: String(source.repository || ''), commit: String(source.commit || ''), path: normalizePath(source.path || file.path || ''), target: locator }),
    materialIdentity: Object.freeze({ state: 'qualified', sha256, bytes: Number(bytes) })
  });
}

function providerRequirement(locator = '', parentRecord = null, required = true) {
  const parsed = parseGithubBlobLocator(locator);
  const markdown = String(parentRecord?.markdown || '');
  const bytes = markdown ? utf8Bytes(markdown) : new Uint8Array();
  return Object.freeze({
    required,
    mode: 'host-mediated',
    action: parsed ? 'repositoryRead' : 'sourceRead',
    target: String(locator || ''),
    expected: Object.freeze({
      repository: parsed?.repository || '',
      commit: parsed?.commit || '',
      path: parsed?.path || '',
      materialSha256: markdown ? sha256Hex(bytes) : '',
      materialBytes: markdown ? bytes.byteLength : 0
    }),
    remoteFetchPerformed: false,
    remoteWriteAuthorized: false
  });
}

function declaredPublicationLocatorState(locator = '') {
  if (isCommitPinnedGithubBlob(locator)) return 'commit-pinned-github-blob';
  if (/^https:\/\/github\.com\/[^/]+\/[^/]+\/blob\//i.test(locator)) return 'mutable-or-noncanonical-github-blob';
  if (/^https?:\/\//i.test(locator)) return 'declared-http-locator';
  return 'unsupported-locator';
}

function parseGithubBlobLocator(value = '') {
  const match = String(value || '').match(/^https:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/([0-9a-f]{40})\/(.+)$/i);
  if (!match) return null;
  return Object.freeze({ repository: `${match[1]}/${match[2]}`, commit: match[3].toLowerCase(), path: normalizePath(match[4]) });
}

function normalizePath(value = '') { return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '').replace(/\/{2,}/g, '/'); }
function publicationState(value, reason = '', locator = '', details = {}) { return Object.freeze({ state: value, reason, locator, locatorState: String(details.locatorState || ''), evidenceState: String(details.evidenceState || ''), evidence: details.evidence || null, providerRequirement: details.providerRequirement || null }); }
function isCommitPinnedGithubBlob(value = '') { return /^https:\/\/github\.com\/[^/]+\/[^/]+\/blob\/[0-9a-f]{40}\//i.test(String(value || '')); }
