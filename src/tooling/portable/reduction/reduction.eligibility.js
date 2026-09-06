import { resolveLineage } from '../../../lineage/lineage.resolve.js';
import { portableFinding } from '../findings.js';
import {
  PORTABLE_REDUCTION_DESTRUCTIVE_CONTRACT,
  PORTABLE_REDUCTION_DESTRUCTIVE_ELIGIBILITY_SCHEMA_ID,
  identity,
  normalizePath,
  parseReductionEntries,
  qualifyReductionRecord,
  resolveUniqueRecord,
  safeCode,
  samePath,
  sha256Text,
  stableJson
} from './reduction.shared.js';
import {
  assessCandidateIdentity, assessCurrentness, assessSurvivingDependencies, boundCandidate, boundCurrentnessFact,
  boundLocator, boundParentProof, boundSnapshot, currentnessReissueFor, fixtureRetired, hasDisappearingChild,
  immutableLocatorForLeaf, issue, normalizeCandidateSet, normalizeContract, normalizeList, normalizeParentProofs,
  normalizeSnapshots, parentGraph, priorReceiptFingerprint, projectPostApply, proofSnapshotScopes, proveParentClosure,
  scopeLabel, sharedClosureMaterial, snapshotMatchesScope, uniqueIssues
} from './reduction.eligibility.helpers.js';


const DESTRUCTIVE_ACTIONS = new Set(['delete', 'remove', 'prune']);

export function projectReductionDestructiveEligibility(input = {}, material = {}, composition = null) {
  const records = material.records || [];
  const lineage = resolveLineage(records, { depth: 'portable-reduction-destructive-eligibility' });
  const findings = [...(lineage.findings || [])];
  const blockers = [];
  const missingEvidence = [];
  const ambiguities = [];
  const rawCandidates = normalizeCandidateSet(input.candidateSet || input.destructiveCandidates || input.candidates || input.candidatePaths || []);
  const snapshots = normalizeSnapshots(input.snapshots || input.workspaceSnapshots || input.repositorySnapshots || []);
  const currentnessFacts = normalizeList(input.currentnessFacts || input.lifecycleFacts || input.currentness || []);
  const immutableSources = normalizeList(input.immutableSources || input.sources || []);
  const parentProofs = normalizeParentProofs(input.parentProofs || input.parentClosureProofs || []);
  const endpointProofs = normalizeList(input.closureEndpoints || input.survivingBoundaries || []);
  const reductionPath = normalizePath(input.reductionArtifactPath || input.reductionArtifact || input.reduction || '');
  const reductionResolution = resolveUniqueRecord(records, reductionPath);
  const reductionRecord = reductionResolution.record;
  const reductionQualification = reductionRecord ? qualifyReductionRecord(reductionRecord, records) : null;
  const reductionDigest = reductionRecord ? sha256Text(reductionRecord.markdown || '') : '';
  const entries = reductionRecord ? parseReductionEntries(reductionRecord.markdown || '') : Object.freeze([]);
  const graph = parentGraph(records, lineage, parentProofs);
  const candidates = rawCandidates.map((candidate) => assessCandidateIdentity(candidate, records, immutableSources, snapshots));
  const disappearing = candidates.filter((candidate) => DESTRUCTIVE_ACTIONS.has(candidate.action));
  const semanticDisappearing = disappearing.filter((candidate) => candidate.classification.state === 'qualified' && candidate.classification.kind === 'semantic' && candidate.record);
  const semanticDisappearingPaths = new Set(semanticDisappearing.map((candidate) => normalizePath(candidate.record.path || candidate.path)));
  const leafEntrypoints = semanticDisappearing.filter((candidate) => !hasDisappearingChild(candidate.record, graph, semanticDisappearingPaths));
  const proofLocators = parentProofs.flatMap((proof) => [proof.childLocator, proof.parentLocator].filter(Boolean));
  const sourceLocators = [...immutableSources, ...proofLocators];

  if (!reductionRecord && disappearing.length) missingEvidence.push(issue('qualified-pre-delete-reduction-required', reductionPath || '(empty)'));
  else if (reductionRecord && !reductionQualification.qualified && disappearing.length) missingEvidence.push(issue('qualified-pre-delete-reduction-required', reductionQualification.reasons.join(', ')));

  for (const candidate of candidates) {
    if (candidate.identityState === 'ambiguous') ambiguities.push(issue('candidate-path-ambiguous', candidate.path));
    else if (candidate.identityState === 'missing' && candidate.classification.kind === 'semantic') missingEvidence.push(issue('candidate-semantic-material-missing', candidate.path));
    if (candidate.classification.state !== 'qualified') ambiguities.push(issue('candidate-classification-unresolved', candidate.path));
    if (candidate.preimage.state === 'mismatch') blockers.push(issue('candidate-preimage-mismatch', candidate.path));
    if (candidate.preimage.state === 'unresolved') missingEvidence.push(issue('candidate-preimage-unresolved', candidate.path));
    if (candidate.classification.kind === 'fixture' && DESTRUCTIVE_ACTIONS.has(candidate.action) && !fixtureRetired(candidate, input.fixtureRetirements || [])) blockers.push(issue('fixture-required-deletion', candidate.path));
  }

  const leafProofs = [];
  const covered = new Set();
  if (reductionRecord && reductionQualification?.qualified) {
    for (const leaf of leafEntrypoints) {
      const matches = entries.filter((entry) => samePath(entry.leafPath, leaf.record.path));
      if (matches.length === 0) { blockers.push(issue('disappearing-leaf-declaration-missing', leaf.record.path)); continue; }
      if (matches.length > 1) { ambiguities.push(issue('disappearing-leaf-declaration-ambiguous', leaf.record.path)); continue; }
      const entry = matches[0];
      covered.add(normalizePath(leaf.record.path));
      if (!entry.disposition) blockers.push(issue('disposition-required', leaf.record.path));
      if (!entry.reason) blockers.push(issue('reason-required', leaf.record.path));
      if (!entry.collapseToPath) blockers.push(issue('historical-closure-endpoint-required', leaf.record.path));
      const leafLocator = immutableLocatorForLeaf(leaf.record, entry, sourceLocators);
      if (!leafLocator.qualified) missingEvidence.push(issue('immutable-leaf-source-unresolved', leaf.record.path));
      const proof = proveParentClosure({ leaf: leaf.record, boundaryPath: entry.collapseToPath, graph, disappearingPaths: semanticDisappearingPaths, records, sourceLocators, endpointProofs, snapshots });
      leafProofs.push(Object.freeze({
        leaf: identity(leaf.record),
        immutableLocator: leafLocator,
        disposition: entry.disposition,
        reason: entry.reason,
        historicalClosureEndpoint: entry.collapseToPath,
        placementParent: reductionQualification.parentPath,
        parentSpan: proof,
        reissue: currentnessReissueFor(leaf.record.path, currentnessFacts)
      }));
      if (proof.state === 'ambiguous') ambiguities.push(issue(proof.code || 'parent-closure-ambiguous', leaf.record.path));
      else if (proof.state === 'unresolved') missingEvidence.push(issue(proof.code || 'parent-closure-unresolved', leaf.record.path));
      else if (proof.state === 'blocked') blockers.push(issue(proof.code || 'parent-closure-blocked', leaf.record.path));
      if (proof.qualified) for (const item of proof.path.slice(0, -1)) covered.add(normalizePath(item));
    }

    for (const entry of entries) {
      const matchedCandidate = candidates.find((candidate) => candidate.record && samePath(candidate.record.path, entry.leafPath));
      if (matchedCandidate && !DESTRUCTIVE_ACTIONS.has(matchedCandidate.action)) blockers.push(issue('reduction-leaf-retained-by-candidate-set', entry.leafPath));
      else if (!matchedCandidate && entry.leafPath) blockers.push(issue('reduction-leaf-not-in-destructive-set', entry.leafPath));
    }
  }

  for (const candidate of semanticDisappearing) {
    const candidatePath = normalizePath(candidate.record.path || candidate.path);
    if (!covered.has(candidatePath)) blockers.push(issue('uncovered-disappearing-semantic-artifact', candidatePath));
    assessCurrentness(candidate, currentnessFacts, records, semanticDisappearingPaths, blockers, missingEvidence, ambiguities);
  }

  assessSurvivingDependencies(records, graph, semanticDisappearingPaths, currentnessFacts, blockers, ambiguities);
  const requiredSnapshotScopes = proofSnapshotScopes(candidates, leafProofs);
  for (const scope of requiredSnapshotScopes) {
    const match = snapshots.filter((snapshot) => snapshotMatchesScope(snapshot, scope));
    if (match.length === 0) missingEvidence.push(issue('proof-snapshot-missing', scopeLabel(scope)));
    else if (match.length > 1) ambiguities.push(issue('proof-snapshot-ambiguous', scopeLabel(scope)));
    else if (!match[0].qualified) missingEvidence.push(issue('proof-snapshot-unqualified', scopeLabel(scope)));
    else if (scope.commit && match[0].commit && scope.commit !== match[0].commit) missingEvidence.push(issue('proof-snapshot-immutable-ref-mismatch', scopeLabel(scope)));
  }

  const contract = normalizeContract(input.contractIdentity || input.qualificationContract || PORTABLE_REDUCTION_DESTRUCTIVE_CONTRACT);
  if (!contract.qualified) missingEvidence.push(issue('qualification-contract-unqualified', contract.id || '(empty)'));
  const boundCandidateSet = candidates.map(boundCandidate).sort((a, b) => `${a.repository}|${a.workspace}|${a.path}|${a.action}`.localeCompare(`${b.repository}|${b.workspace}|${b.path}|${b.action}`));
  const boundSnapshots = snapshots.map(boundSnapshot).sort((a, b) => `${a.repository}|${a.workspace}|${a.commit}`.localeCompare(`${b.repository}|${b.workspace}|${b.commit}`));
  const boundCurrentness = currentnessFacts.map(boundCurrentnessFact).sort((a, b) => `${a.target}|${a.state}`.localeCompare(`${b.target}|${b.state}`));
  const candidateSetDigest = sha256Text(stableJson(boundCandidateSet));
  const boundInputs = Object.freeze({
    reduction: Object.freeze({ path: reductionPath, sha256: reductionDigest }),
    snapshots: Object.freeze(boundSnapshots),
    candidateSet: Object.freeze(boundCandidateSet),
    lifecycleCurrentnessBasis: Object.freeze(boundCurrentness),
    qualificationContract: contract.bound,
    proofMaterial: Object.freeze({
      parentProofsSha256: sha256Text(stableJson(parentProofs.map(boundParentProof))),
      immutableSourcesSha256: sha256Text(stableJson(sourceLocators.map(boundLocator))),
      compositionFingerprint: String(composition?.fingerprint || '')
    })
  });
  const inputFingerprint = sha256Text(stableJson(boundInputs));
  const priorFingerprint = priorReceiptFingerprint(input.priorReceipt || input.receipt || input.qualificationReceipt);
  if (priorFingerprint && priorFingerprint !== inputFingerprint) blockers.push(issue('receipt-input-fingerprint-mismatch', `prior=${priorFingerprint} current=${inputFingerprint}`));

  const postApply = projectPostApply(input.postApply || input.postApplyAudit || null, candidateSetDigest);
  const requested = rawCandidates.length > 0;
  const state = !requested ? 'not-requested'
    : blockers.length ? 'blocked'
      : missingEvidence.length || ambiguities.length ? 'unresolved'
        : 'eligible';
  const destructiveEligible = state === 'eligible';

  for (const item of blockers) findings.push(portableFinding('error', `portable.reduction-eligibility.${safeCode(item.code)}`, item.detail, { ref: reductionPath }));
  for (const item of missingEvidence) findings.push(portableFinding('warning', `portable.reduction-eligibility.${safeCode(item.code)}`, item.detail, { ref: reductionPath }));
  for (const item of ambiguities) findings.push(portableFinding('warning', `portable.reduction-eligibility.${safeCode(item.code)}`, item.detail, { ref: reductionPath }));
  if (requested && state === 'unresolved') findings.push(portableFinding('error', 'portable.reduction-eligibility.unresolved-fail-closed', 'Destructive eligibility is unresolved; destructive apply remains forbidden.', { ref: reductionPath }));
  if (postApply.state === 'mismatch') findings.push(portableFinding('error', 'portable.reduction-eligibility.post-apply-simulation-mismatch', 'Simulated post-apply material does not match the exact qualified candidate set.', { ref: reductionPath }));

  return Object.freeze({
    schema: PORTABLE_REDUCTION_DESTRUCTIVE_ELIGIBILITY_SCHEMA_ID,
    state,
    destructiveEligible,
    reduction: Object.freeze({ requestedPath: reductionPath, record: reductionRecord ? identity(reductionRecord) : null, qualification: reductionQualification, digest: reductionDigest, placementParent: reductionQualification?.parentPath || '' }),
    snapshots: Object.freeze(snapshots),
    candidateSet: Object.freeze(candidates),
    candidateSetDigest,
    disappearingSemanticSet: Object.freeze(semanticDisappearing.map((candidate) => identity(candidate.record))),
    leafEntrypoints: Object.freeze(leafProofs),
    sharedClosureMaterial: Object.freeze(sharedClosureMaterial(leafProofs)),
    currentnessBasis: Object.freeze(currentnessFacts),
    contract,
    blockers: Object.freeze(uniqueIssues(blockers)),
    missingEvidence: Object.freeze(uniqueIssues(missingEvidence)),
    ambiguities: Object.freeze(uniqueIssues(ambiguities)),
    receipt: Object.freeze({ schema: 'tiinex.portable.reduction-destructive-eligibility.receipt.v1', state, inputFingerprint, candidateSetDigest, boundInputs, stalePriorReceipt: Boolean(priorFingerprint && priorFingerprint !== inputFingerprint), reusableOnlyForExactBoundInputs: true }),
    postApply,
    boundary: Object.freeze({
      adapterNeutral: true,
      planningAndQualificationOnly: true,
      sourceMutation: false,
      remoteWrite: false,
      destructiveApplyImplemented: false,
      destructiveApplyAuthorized: false,
      eligibleIsNecessaryButNotSufficient: true,
      ordinaryReductionValidityDependsOnEligibility: false,
      placementParentIsHistoricalClosureEndpoint: false,
      lifecycleFactsAreEvidenceNotDeleteAuthority: true,
      candidateSetDerivedCoverageNotReductionProse: true
    }),
    findings: Object.freeze(findings)
  });
}

