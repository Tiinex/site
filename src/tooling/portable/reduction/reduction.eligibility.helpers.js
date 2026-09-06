import { inferRecordMaterialRole, isDiscoveryWorkLeafEligible, MaterialRole } from '../../../workspaces/workspace.materialRole.js';
import {
  PORTABLE_REDUCTION_DESTRUCTIVE_CONTRACT, identity,
  locatorForRecord, locatorFromValue, normalizePath, resolveUniqueRecord, samePath, sha256Text, stableJson
} from './reduction.shared.js';

const FIXTURE_RE = /(^|\/)(?:fixtures?|test-fixtures?|__fixtures__)(\/|$)|\.fixture\./i;
const SHA256_RE = /^[0-9a-f]{64}$/i;
const GIT_COMMIT_RE = /^[0-9a-f]{40}$/i;
const CLEAR_CURRENTNESS = new Set(['closed', 'resolved', 'historical-closed', 'superseded-resolved']);
const OPERATIVE_CURRENTNESS = new Set(['operative', 'open', 'active', 'blocked', 'incomplete', 'disputed']);

export function assessCandidateIdentity(candidate, records, immutableSources, snapshots) {
  const resolution = resolveUniqueRecord(records, candidate.path);
  const record = resolution.record;
  const classification = classifyCandidate(candidate, record);
  let repository = candidate.repository;
  let workspace = candidate.workspace;
  let locator = record ? locatorForRecord(record, immutableSources) : locatorFromValue(candidate.immutableSource || {});
  if (!locator.qualified && record && candidate.repository) {
    const snapshot = snapshots.find((item) => item.qualified && item.repository === candidate.repository && (!candidate.workspace || item.workspace === candidate.workspace));
    if (snapshot?.commit) locator = locatorFromValue({ repository: candidate.repository, commit: snapshot.commit, workspace: candidate.workspace, path: record.path, immutable: true, basis: 'candidate identity plus exact bound snapshot' });
  }
  if (!repository && locator.qualified) repository = locator.repository;
  if (!workspace && locator.qualified) workspace = locator.workspace;
  const actualDigest = record ? sha256Text(record.markdown || '') : '';
  const expectedDigest = String(candidate.expectedDigest || '').replace(/^sha256:/, '').toLowerCase();
  const preimage = !expectedDigest ? Object.freeze({ state: 'not-supplied', expectedDigest: '', actualDigest })
    : !record ? Object.freeze({ state: 'unresolved', expectedDigest, actualDigest: '' })
      : expectedDigest === actualDigest ? Object.freeze({ state: 'matched', expectedDigest, actualDigest })
        : Object.freeze({ state: 'mismatch', expectedDigest, actualDigest });
  return Object.freeze({ ...candidate, repository, workspace, identityState: resolution.state, record: record ? identity(record) : null, classification, immutableLocator: locator, preimage });
}

function classifyCandidate(candidate, record) {
  const explicitKind = String(candidate.classification || candidate.kind || '').toLowerCase();
  const explicitQualified = String(candidate.classificationQualification || candidate.qualification || '') === 'qualified' && nonEmptyBasis(candidate.classificationBasis || candidate.basis);
  const fixture = candidate.fixture === true || candidate.fixtureRequired === true || FIXTURE_RE.test(candidate.path);
  const inferredSemantic = Boolean(record && isDiscoveryWorkLeafEligible(record));
  if (explicitKind) {
    if (!explicitQualified) return Object.freeze({ state: 'unresolved', kind: explicitKind, basis: 'explicit classification is not qualified' });
    if (record && explicitKind === 'semantic' && !inferredSemantic) return Object.freeze({ state: 'unresolved', kind: explicitKind, basis: 'explicit semantic classification conflicts with loaded material role' });
    if (record && explicitKind === 'fixture' && !fixture) return Object.freeze({ state: 'unresolved', kind: explicitKind, basis: 'explicit fixture classification conflicts with loaded material' });
    return Object.freeze({ state: 'qualified', kind: explicitKind === 'transport' ? 'transport' : explicitKind === 'fixture' ? 'fixture' : explicitKind === 'semantic' ? 'semantic' : 'nonsemantic', basis: candidate.classificationBasis || candidate.basis });
  }
  if (fixture) return Object.freeze({ state: 'qualified', kind: 'fixture', basis: 'declared fixture flag/path classification' });
  if (inferredSemantic) return Object.freeze({ state: 'qualified', kind: 'semantic', basis: 'loaded qualified semantic-work material role' });
  if (record) {
    const role = inferRecordMaterialRole(record);
    if ([MaterialRole.schemaDefinition, MaterialRole.supporting, MaterialRole.workspaceArtifact].includes(role)) return Object.freeze({ state: 'qualified', kind: 'nonsemantic', basis: `loaded material role:${role}` });
  }
  return Object.freeze({ state: 'unresolved', kind: 'unknown', basis: 'semantic/transport/fixture classification is unresolved' });
}

export function parentGraph(records, lineage, proofs) {
  const byId = new Map(records.map((record) => [String(record.id || record.path || ''), record]));
  const parentsByChild = new Map();
  for (const edge of lineage.edges || []) {
    if (edge.kind !== 'parent' || edge.status !== 'verified' || !edge.from || !edge.to) continue;
    const parent = byId.get(String(edge.from)); const child = byId.get(String(edge.to));
    if (!parent || !child) continue;
    addParentEdge(parentsByChild, normalizePath(child.path), Object.freeze({ child: normalizePath(child.path), parent: normalizePath(parent.path), state: 'qualified', basis: 'verified loaded declared Parent edge', source: 'loaded-lineage' }));
  }
  for (const proof of proofs) if (proof.qualified) addParentEdge(parentsByChild, proof.child, Object.freeze({ child: proof.child, parent: proof.parent, state: 'qualified', basis: proof.basis, source: 'explicit-qualified-parent-proof' }));
  return Object.freeze({ parentsByChild });
}

function addParentEdge(map, child, edge) { const list = map.get(child) || []; list.push(edge); map.set(child, list); }
export function hasDisappearingChild(record, graph, disappearingPaths) {
  const parentPath = normalizePath(record.path || '');
  for (const [child, edges] of graph.parentsByChild.entries()) if (disappearingPaths.has(child) && edges.some((edge) => samePath(edge.parent, parentPath))) return true;
  return false;
}

export function proveParentClosure({ leaf, boundaryPath, graph, disappearingPaths, records, sourceLocators, endpointProofs, snapshots }) {
  const start = normalizePath(leaf.path || ''); const boundary = normalizePath(boundaryPath || '');
  if (!boundary) return unresolvedProof('historical-closure-endpoint-required');
  if (disappearingPaths.has(boundary)) return blockedProof('closure-endpoint-does-not-survive');
  const pathItems = [start]; const seen = new Set([start]); let current = start;
  while (!samePath(current, boundary)) {
    const edges = (graph.parentsByChild.get(current) || []).filter((edge) => edge.state === 'qualified');
    const distinct = uniqueBy(edges, (edge) => normalizePath(edge.parent));
    if (!distinct.length) return unresolvedProof('parent-hop-missing-or-unqualified', pathItems);
    if (distinct.length > 1) return ambiguousProof('parent-hop-ambiguous', pathItems);
    const parent = normalizePath(distinct[0].parent);
    if (!parent || seen.has(parent)) return ambiguousProof('parent-closure-cycle-or-ambiguity', pathItems);
    pathItems.push(parent); seen.add(parent);
    if (!samePath(parent, boundary) && !disappearingPaths.has(parent)) return blockedProof('closure-endpoint-not-nearest-surviving-boundary', pathItems);
    current = parent;
    if (pathItems.length > 128) return ambiguousProof('parent-closure-limit-reached', pathItems);
  }
  const locatorItems = [];
  for (const itemPath of pathItems) {
    const record = resolveUniqueRecord(records, itemPath).record;
    let locator = record ? locatorForRecord(record, sourceLocators) : locatorForExternal(itemPath, sourceLocators, endpointProofs);
    if (!locator.qualified) return unresolvedProof('parent-hop-immutable-source-unresolved', pathItems);
    const snapshotMatches = snapshots.filter((snapshot) => snapshot.qualified && snapshotMatchesScope(snapshot, locator));
    if (!snapshotMatches.length) return unresolvedProof('parent-hop-snapshot-unresolved', pathItems);
    if (snapshotMatches.length > 1) return ambiguousProof('parent-hop-snapshot-ambiguous', pathItems);
    if (snapshotMatches[0].commit && locator.commit && snapshotMatches[0].commit !== locator.commit) return unresolvedProof('parent-hop-snapshot-ref-mismatch', pathItems);
    locatorItems.push(locator);
  }
  const repositories = [...new Set(locatorItems.map((item) => item.repository).filter(Boolean))];
  return Object.freeze({ state: 'qualified', qualified: true, code: '', path: Object.freeze(pathItems), locators: Object.freeze(locatorItems), repositories: Object.freeze(repositories), crossRepository: repositories.length > 1, nearestSurvivingBoundary: boundary });
}

function locatorForExternal(itemPath, sources, endpoints) {
  const source = sources.find((item) => samePath(item.path || item.target || '', itemPath));
  if (source) return locatorFromValue(source);
  const endpoint = endpoints.find((item) => samePath(item.path || item.target || '', itemPath));
  return endpoint ? locatorFromValue(endpoint.locator || endpoint) : locatorFromValue({});
}
function unresolvedProof(code, pathItems = []) { return Object.freeze({ state: 'unresolved', qualified: false, code, path: Object.freeze([...pathItems]), locators: Object.freeze([]), repositories: Object.freeze([]), crossRepository: false }); }
function ambiguousProof(code, pathItems = []) { return Object.freeze({ state: 'ambiguous', qualified: false, code, path: Object.freeze([...pathItems]), locators: Object.freeze([]), repositories: Object.freeze([]), crossRepository: false }); }
function blockedProof(code, pathItems = []) { return Object.freeze({ state: 'blocked', qualified: false, code, path: Object.freeze([...pathItems]), locators: Object.freeze([]), repositories: Object.freeze([]), crossRepository: false }); }

export function assessCurrentness(candidate, facts, records, disappearingPaths, blockers, missingEvidence, ambiguities) {
  const target = normalizePath(candidate.currentnessTarget || candidate.path || candidate.record?.path || '');
  const matches = facts.filter((fact) => samePath(fact.target || fact.path || fact.obligation || '', target));
  if (!matches.length) { missingEvidence.push(issue('currentness-evidence-missing', target)); return; }
  if (matches.length > 1) { ambiguities.push(issue('currentness-evidence-ambiguous', target)); return; }
  const fact = matches[0];
  const qualified = String(fact.qualification || fact.semanticState || '') === 'qualified' && String(fact.currentness || '') === 'current' && nonEmptyBasis(fact.basis);
  if (!qualified) { ambiguities.push(issue('currentness-evidence-unqualified', target)); return; }
  const state = String(fact.state || fact.operativeState || '').toLowerCase();
  if (CLEAR_CURRENTNESS.has(state)) return;
  if (OPERATIVE_CURRENTNESS.has(state)) {
    const reissue = normalizeReissue(fact.reissue || fact.retainedReissue || {});
    if (!reissue.qualified) { blockers.push(issue('operative-obligation-disappearing', target)); return; }
    const surviving = resolveUniqueRecord(records, reissue.survivingArtifact).record;
    if (!surviving || disappearingPaths.has(normalizePath(surviving.path))) { blockers.push(issue('operative-obligation-reissue-not-surviving', target)); return; }
    return;
  }
  ambiguities.push(issue('currentness-state-unresolved', target));
}

export function assessSurvivingDependencies(records, graph, disappearingPaths, currentnessFacts, blockers, ambiguities) {
  for (const record of records) {
    const recordPath = normalizePath(record.path || '');
    if (disappearingPaths.has(recordPath) || !isDiscoveryWorkLeafEligible(record)) continue;
    const parents = graph.parentsByChild.get(recordPath) || [];
    const disappearingParents = parents.filter((edge) => disappearingPaths.has(normalizePath(edge.parent)));
    if (!disappearingParents.length) continue;
    const fact = currentnessFacts.find((item) => samePath(item.target || item.path || '', recordPath));
    const reissue = normalizeReissue(fact?.reissue || {});
    if (!reissue.qualified) blockers.push(issue('surviving-material-parent-depends-on-disappearing-material', recordPath));
    else if (!nonEmptyBasis(reissue.basis)) ambiguities.push(issue('surviving-material-reissue-basis-unresolved', recordPath));
  }
}

export function currentnessReissueFor(target, facts) { const fact = facts.find((item) => samePath(item.target || item.path || '', target)); return normalizeReissue(fact?.reissue || {}); }
function normalizeReissue(value = {}) {
  const qualified = String(value.qualification || value.semanticState || '') === 'qualified' && nonEmptyBasis(value.basis) && Boolean(value.survivingArtifact || value.target) && Boolean(value.mapping || value.obligationMapping);
  return Object.freeze({ qualified, state: qualified ? 'qualified' : 'unresolved', survivingArtifact: normalizePath(value.survivingArtifact || value.target || ''), mapping: String(value.mapping || value.obligationMapping || ''), basis: value.basis || '' });
}

export function immutableLocatorForLeaf(record, entry, sources) {
  const fromEntry = locatorFromValue(entry.leafTarget || '');
  if (fromEntry.qualified && samePath(fromEntry.path, record.path)) return fromEntry;
  return locatorForRecord(record, sources);
}

export function proofSnapshotScopes(candidates, leafProofs) {
  const scopes = [];
  for (const candidate of candidates) if (candidate.immutableLocator?.qualified) scopes.push(candidate.immutableLocator);
  for (const proof of leafProofs) for (const locator of proof.parentSpan?.locators || []) scopes.push(locator);
  return uniqueBy(scopes.filter((item) => item.repository || item.workspace), (item) => `${item.repository}|${item.workspace}|${item.commit}`);
}
export function snapshotMatchesScope(snapshot, scope) { return Boolean((scope.repository && snapshot.repository === scope.repository) || (scope.workspace && snapshot.workspace === scope.workspace)); }
export function scopeLabel(scope) { return `${scope.repository || '(no-repository)'}${scope.workspace ? `/${scope.workspace}` : ''}${scope.commit ? `@${scope.commit}` : ''}`; }

export function normalizeCandidateSet(value) {
  const list = Array.isArray(value) ? value : typeof value === 'string' ? value.split(',') : value && typeof value === 'object' ? Object.entries(value).map(([candidatePath, item]) => typeof item === 'object' && item !== null ? ({ candidatePath, ...item }) : ({ candidatePath, action: item })) : [];
  return Object.freeze(list.map((item) => typeof item === 'string'
    ? Object.freeze({ path: normalizePath(item), action: 'delete', repository: '', workspace: '', expectedDigest: '', classification: '', classificationQualification: '', classificationBasis: '', basis: '', fixture: false, fixtureRequired: false, currentnessTarget: '', immutableSource: null })
    : Object.freeze({
      path: normalizePath(item.path || item.candidatePath || item.candidate || item.artifact || ''),
      action: String(item.action || item.destructiveAction || 'delete').toLowerCase(),
      repository: String(item.repository || item.repo || ''),
      workspace: String(item.workspace || item.workspaceId || ''),
      expectedDigest: String(item.expectedDigest || item.preimageDigest || item.sha256 || ''),
      classification: String(item.classification || item.kind || ''),
      classificationQualification: String(item.classificationQualification || item.qualification || ''),
      classificationBasis: item.classificationBasis || item.basis || '',
      basis: item.basis || '',
      fixture: item.fixture === true,
      fixtureRequired: item.fixtureRequired === true,
      currentnessTarget: normalizePath(item.currentnessTarget || item.obligation || ''),
      immutableSource: item.immutableSource || item.locator || null
    })).filter((item) => item.path));
}

export function normalizeSnapshots(value) {
  return Object.freeze(normalizeList(value).map((item) => {
    const repository = String(item.repository || item.repo || '');
    const workspace = String(item.workspace || item.workspaceId || '');
    const commit = String(item.commit || item.sha || item.ref || '').toLowerCase();
    const manifestDigest = String(item.manifestDigest || item.contentDigest || item.sha256 || '').replace(/^sha256:/, '').toLowerCase();
    const localState = item.localState === true || item.uncommitted === true;
    const qualified = Boolean((repository && GIT_COMMIT_RE.test(commit) || workspace && SHA256_RE.test(manifestDigest)) && (!localState || SHA256_RE.test(manifestDigest)) && String(item.qualification || item.semanticState || 'qualified') === 'qualified');
    return Object.freeze({ repository, workspace, commit, manifestDigest, localState, qualified, state: qualified ? 'qualified' : 'unresolved', basis: item.basis || '' });
  }));
}

export function normalizeParentProofs(value) {
  return Object.freeze(normalizeList(value).map((item) => {
    const childLocator = locatorFromValue(item.childLocator || item.childSource || {});
    const parentLocator = locatorFromValue(item.parentLocator || item.parentSource || {});
    const child = normalizePath(item.child || childLocator.path || '');
    const parent = normalizePath(item.parent || parentLocator.path || '');
    const qualified = String(item.kind || 'parent') === 'parent' && String(item.qualification || item.semanticState || '') === 'qualified' && nonEmptyBasis(item.basis) && child && parent && childLocator.qualified && parentLocator.qualified;
    return Object.freeze({ child, parent, childLocator, parentLocator, qualified, basis: item.basis || '' });
  }));
}

export function normalizeContract(value) {
  const raw = typeof value === 'string' ? { id: value, version: 1 } : value || {};
  const id = String(raw.id || PORTABLE_REDUCTION_DESTRUCTIVE_CONTRACT.id);
  const version = Number(raw.version || PORTABLE_REDUCTION_DESTRUCTIVE_CONTRACT.version);
  const qualified = id === PORTABLE_REDUCTION_DESTRUCTIVE_CONTRACT.id && version === PORTABLE_REDUCTION_DESTRUCTIVE_CONTRACT.version;
  return Object.freeze({ id, version, qualified, bound: Object.freeze({ id, version, implementation: 'shared-portable-tooling', canonicalSchemaAuthorityChanged: false }) });
}

export function fixtureRetired(candidate, values) {
  const matches = normalizeList(values).filter((item) => samePath(item.target || item.path || '', candidate.path));
  return matches.length === 1 && String(matches[0].qualification || matches[0].semanticState || '') === 'qualified' && String(matches[0].state || '') === 'retired' && nonEmptyBasis(matches[0].basis);
}

export function boundCandidate(candidate) { return Object.freeze({ path: candidate.path, action: candidate.action, repository: candidate.repository || candidate.immutableLocator?.repository || '', workspace: candidate.workspace || candidate.immutableLocator?.workspace || '', expectedDigest: String(candidate.expectedDigest || '').replace(/^sha256:/, '').toLowerCase(), classification: candidate.classification.kind, currentnessTarget: candidate.currentnessTarget || candidate.path }); }
export function boundSnapshot(snapshot) { return Object.freeze({ repository: snapshot.repository, workspace: snapshot.workspace, commit: snapshot.commit, manifestDigest: snapshot.manifestDigest, localState: snapshot.localState, qualified: snapshot.qualified }); }
export function boundCurrentnessFact(fact) { return Object.freeze({ target: normalizePath(fact.target || fact.path || fact.obligation || ''), state: String(fact.state || fact.operativeState || ''), currentness: String(fact.currentness || ''), qualification: String(fact.qualification || fact.semanticState || ''), basis: compactBasis(fact.basis), reissue: normalizeReissue(fact.reissue || {}) }); }
export function boundParentProof(proof) { return Object.freeze({ child: proof.child, parent: proof.parent, qualified: proof.qualified, childLocator: boundLocator(proof.childLocator), parentLocator: boundLocator(proof.parentLocator) }); }
export function boundLocator(locator) { const value = locatorFromValue(locator); return Object.freeze({ repository: value.repository, commit: value.commit, workspace: value.workspace, path: value.path, digest: value.digest, qualified: value.qualified }); }
export function priorReceiptFingerprint(value = {}) { return String(value?.receipt?.inputFingerprint || value?.inputFingerprint || value?.boundInputFingerprint || ''); }

export function projectPostApply(value, candidateSetDigest) {
  if (!value) return Object.freeze({ state: 'not-requested', expectedCandidateSetDigest: candidateSetDigest, actualCandidateSetDigest: '', sourceMutation: false, boundary: 'Simulation only; no source mutation is performed.' });
  const actual = normalizeCandidateSet(value.actualCandidateSet || value.candidateSet || value.actualCandidates || []);
  const actualDigest = sha256Text(stableJson(actual.map((item) => ({ path: item.path, action: item.action, repository: item.repository, workspace: item.workspace, expectedDigest: String(item.expectedDigest || '').replace(/^sha256:/, '').toLowerCase(), classification: item.classification }))));
  return Object.freeze({ state: actualDigest === candidateSetDigest ? 'matched' : 'mismatch', expectedCandidateSetDigest: candidateSetDigest, actualCandidateSetDigest: actualDigest, sourceMutation: false, boundary: 'Separately simulated post-apply comparison only. It cannot repair a missing pre-delete qualification and performs no mutation.' });
}

export function sharedClosureMaterial(proofs) {
  const items = new Map();
  for (const proof of proofs) for (let index = 1; index < (proof.parentSpan?.path || []).length; index += 1) {
    const itemPath = normalizePath(proof.parentSpan.path[index]);
    if (!items.has(itemPath)) items.set(itemPath, Object.freeze({ path: itemPath, reachableFrom: [] }));
    items.get(itemPath).reachableFrom.push(normalizePath(proof.leaf.path));
  }
  return [...items.values()].map((item) => Object.freeze({ path: item.path, reachableFrom: Object.freeze([...new Set(item.reachableFrom)].sort()) })).sort((a, b) => a.path.localeCompare(b.path));
}

export function normalizeList(value) { return Array.isArray(value) ? value : value && typeof value === 'object' ? Object.entries(value).map(([target, item]) => typeof item === 'object' && item !== null ? ({ target, ...item }) : ({ target, state: item })) : []; }
function nonEmptyBasis(value) { return Array.isArray(value) ? value.length > 0 : typeof value === 'string' ? Boolean(value.trim()) : Boolean(value && typeof value === 'object' && Object.keys(value).length); }
function compactBasis(value) { return typeof value === 'string' ? value.slice(0, 720) : Array.isArray(value) ? value.slice(0, 8) : value && typeof value === 'object' ? value : null; }
function uniqueBy(values, keyFn) { const seen = new Set(); return values.filter((value) => { const key = keyFn(value); if (seen.has(key)) return false; seen.add(key); return true; }); }
export function uniqueIssues(values) { return uniqueBy(values, (item) => `${item.code}|${item.detail}`); }
export function issue(code, detail) { return Object.freeze({ code: String(code), detail: String(detail || '') }); }
