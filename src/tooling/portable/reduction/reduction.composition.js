import { portableFinding } from '../findings.js';
import {
  PORTABLE_REDUCTION_COMPOSITION_SCHEMA_ID,
  identity,
  linkPath,
  locatorForRecord,
  locatorFromValue,
  markdownLinks,
  normalizePath,
  qualifyRecord,
  qualifyReductionRecord,
  resolveUniqueRecord,
  safeCode,
  sectionText,
  sha256Text,
  stableJson
} from './reduction.shared.js';

const MAX_COMPOSITION_NODES = 128;

export function projectReductionComposition(input = {}, material = {}) {
  const records = material.records || [];
  const requestedPath = normalizePath(input.reductionArtifactPath || input.reductionArtifact || input.reduction || '');
  const rootResolution = resolveUniqueRecord(records, requestedPath);
  const root = rootResolution.record;
  const findings = [];
  const blockers = [];
  const missingEvidence = [];
  const ambiguities = [];
  const nodes = new Map();
  const hops = [];
  const sourceReferences = normalizeSourceReferences(input.compositionSources || input.sourceReferences || input.reductionSources || []);
  const immutableSources = normalizeList(input.immutableSources || input.sources || []);
  const lossFacts = normalizeList(input.lossFacts || input.loss || []);

  if (!root) missingEvidence.push(issue(rootResolution.state === 'ambiguous' ? 'reduction-artifact-ambiguous' : 'reduction-artifact-missing', requestedPath || '(empty)'));
  else if (String(root.schemaId || '') !== 'tiinex.reduction.v1') blockers.push(issue('reduction-schema-mismatch', String(root.schemaId || 'missing')));

  const rootQualification = root ? qualifyReductionRecord(root, records) : null;
  if (root && !rootQualification.qualified) missingEvidence.push(issue('reduction-unqualified', rootQualification.reasons.join(', ')));

  if (root && rootQualification.qualified) visitReduction(root, [], 0);

  const orderedNodes = [...nodes.values()].sort((a, b) => a.path.localeCompare(b.path));
  const orderedHops = [...hops].sort((a, b) => `${a.from}|${a.to}`.localeCompare(`${b.from}|${b.to}`));
  const inheritedLoss = inheritedLossProjection(root?.path || requestedPath, orderedNodes, orderedHops);
  const rootLoss = root ? lossProjectionFor(root, lossFacts) : null;
  const knownLoss = [rootLoss, ...inheritedLoss].filter((item) => item && item.state === 'known-irrecoverable');
  const unresolvedLoss = [rootLoss, ...inheritedLoss].filter((item) => item && item.state === 'unresolved');
  const terminalSources = orderedNodes.filter((node) => node.kind !== 'reduction' && !orderedHops.some((hop) => hop.from === node.path));
  const unrecoverableTerminal = terminalSources.filter((node) => node.recovery?.qualified !== true);

  if (unrecoverableTerminal.length) missingEvidence.push(issue('immutable-source-recovery-unresolved', unrecoverableTerminal.map((item) => item.path).join(', ')));
  if (unresolvedLoss.length) ambiguities.push(issue('reduction-loss-unresolved', unresolvedLoss.map((item) => item.target).join(', ')));
  if (nodes.size >= MAX_COMPOSITION_NODES) ambiguities.push(issue('composition-node-limit-reached', String(MAX_COMPOSITION_NODES)));

  const state = blockers.length ? 'blocked'
    : missingEvidence.length || ambiguities.length ? 'unresolved'
      : knownLoss.length ? 'qualified-with-known-loss'
        : rootQualification?.qualified ? 'qualified' : 'unresolved';
  const expansionState = blockers.length ? 'blocked'
    : missingEvidence.length || ambiguities.length ? 'unresolved'
      : knownLoss.length ? 'known-loss'
        : rootQualification?.qualified ? 'qualified-navigation' : 'unresolved';

  for (const item of blockers) findings.push(portableFinding('error', `portable.reduction-composition.${safeCode(item.code)}`, item.detail, { ref: requestedPath }));
  for (const item of missingEvidence) findings.push(portableFinding('warning', `portable.reduction-composition.${safeCode(item.code)}`, item.detail, { ref: requestedPath }));
  for (const item of ambiguities) findings.push(portableFinding('warning', `portable.reduction-composition.${safeCode(item.code)}`, item.detail, { ref: requestedPath }));

  const projection = Object.freeze({
    schema: PORTABLE_REDUCTION_COMPOSITION_SCHEMA_ID,
    state,
    currentReduction: root ? Object.freeze({ ...identity(root), digest: sha256Text(root.markdown || ''), qualification: rootQualification }) : null,
    immediateSources: Object.freeze(orderedHops.filter((hop) => hop.from === normalizePath(root?.path || requestedPath))),
    hops: Object.freeze(orderedHops),
    nodes: Object.freeze(orderedNodes),
    carryForward: root ? Object.freeze({ local: sectionText(root.markdown || '', 'Carry-Forward State'), basis: 'exact-qualified-reduction-body-section' }) : null,
    lossAndUncertainty: Object.freeze({ local: rootLoss, inherited: Object.freeze(inheritedLoss), knownIrrecoverable: Object.freeze(knownLoss), unresolved: Object.freeze(unresolvedLoss) }),
    expansion: Object.freeze({
      state: expansionState,
      terminalSources: Object.freeze(terminalSources.map((item) => Object.freeze({ path: item.path, recovery: item.recovery }))),
      knownLoss: Object.freeze(knownLoss),
      ambiguities: Object.freeze(ambiguities),
      missingEvidence: Object.freeze(missingEvidence),
      boundary: 'Deterministic navigation follows explicit qualified Source Context/source-reference edges. It never reconstructs omitted bytes from a Reduction alone.'
    }),
    qualificationBasis: Object.freeze({ reduction: rootQualification, sourceEdges: 'explicit Source Context links or explicit qualified sourceReferences only', sourceQualification: 'each loaded source is independently audited; downstream qualification never repairs an upstream source' }),
    blockers: Object.freeze(blockers),
    missingEvidence: Object.freeze(missingEvidence),
    ambiguities: Object.freeze(ambiguities),
    fingerprint: sha256Text(stableJson({ root: root ? sha256Text(root.markdown || '') : '', hops: orderedHops.map((hop) => ({ from: hop.from, to: hop.to, relationQualification: hop.relationQualification })), nodes: orderedNodes.map((node) => ({ path: node.path, digest: node.digest, qualification: node.qualification?.state, recovery: node.recovery })) })),
    boundary: Object.freeze({
      adapterNeutral: true,
      ordinaryReductionAuthorityOnly: true,
      sourceMutation: false,
      destructiveApplyAuthorized: false,
      taskCompletionAuthority: false,
      releaseReadinessAuthority: false,
      placementIsNotSourceAuthority: true,
      downstreamValidationRepairsUpstream: false
    })
  });
  return Object.freeze({ ...projection, findings: Object.freeze(findings) });

  function visitReduction(record, stack, depth) {
    const recordPath = normalizePath(record.path || '');
    if (depth >= MAX_COMPOSITION_NODES) return;
    if (stack.includes(recordPath)) { ambiguities.push(issue('reduction-source-cycle', [...stack, recordPath].join(' -> '))); return; }
    const qualification = qualifyReductionRecord(record, records);
    const loss = lossProjectionFor(record, lossFacts);
    const recovery = locatorForRecord(record, immutableSources);
    putNode(record, 'reduction', qualification, recovery, loss);
    if (!qualification.qualified) { missingEvidence.push(issue('upstream-reduction-unqualified', `${recordPath}: ${qualification.reasons.join(', ')}`)); return; }
    const references = sourceReferencesFor(record, sourceReferences);
    for (const reference of references) {
      const targetPath = normalizePath(reference.path || linkPath(reference.target || ''));
      const resolution = resolveUniqueRecord(records, targetPath);
      if (resolution.state === 'ambiguous') { ambiguities.push(issue('immediate-source-ambiguous', `${recordPath} -> ${targetPath}`)); continue; }
      if (!resolution.record) {
        const locator = locatorFromValue(reference.target || reference.locator || reference);
        if (!locator.qualified) { missingEvidence.push(issue('immediate-source-missing', `${recordPath} -> ${targetPath || reference.target || '(empty)'}`)); continue; }
        const externalPath = normalizePath(locator.path);
        putExternalNode(externalPath, locator, reference);
        hops.push(hop(recordPath, externalPath, reference, 'material', 'qualified-external-immutable'));
        continue;
      }
      const source = resolution.record;
      const sourcePath = normalizePath(source.path || '');
      const relationQualification = reference.qualification === 'unresolved' ? 'unresolved' : 'qualified';
      if (relationQualification !== 'qualified') { ambiguities.push(issue('source-edge-unqualified', `${recordPath} -> ${sourcePath}`)); continue; }
      const isReduction = String(source.schemaId || '') === 'tiinex.reduction.v1';
      const qualificationResult = isReduction ? qualifyReductionRecord(source, records) : qualifyRecord(source);
      const locator = locatorForRecord(source, immutableSources);
      const sourceLoss = isReduction ? lossProjectionFor(source, lossFacts) : null;
      putNode(source, isReduction ? 'reduction' : 'material', qualificationResult, locator, sourceLoss);
      hops.push(hop(recordPath, sourcePath, reference, isReduction ? 'reduction' : 'material', qualificationResult.qualified ? 'qualified' : 'unresolved'));
      if (!qualificationResult.qualified) {
        missingEvidence.push(issue(isReduction ? 'upstream-reduction-unqualified' : 'immediate-source-unqualified', `${sourcePath}: ${(qualificationResult.reasons || []).join(', ')}`));
        continue;
      }
      if (isReduction) visitReduction(source, [...stack, recordPath], depth + 1);
    }
  }

  function putNode(record, kind, qualification, recovery, loss) {
    const recordPath = normalizePath(record.path || '');
    if (!recordPath || nodes.has(recordPath)) return;
    nodes.set(recordPath, Object.freeze({
      ...identity(record),
      path: recordPath,
      kind,
      digest: sha256Text(record.markdown || ''),
      qualification,
      recovery,
      carryForward: kind === 'reduction' ? sectionText(record.markdown || '', 'Carry-Forward State') : '',
      lossAndUncertainty: kind === 'reduction' ? Object.freeze({ declared: sectionText(record.markdown || '', 'Loss And Uncertainty'), fact: loss }) : null
    }));
  }
  function putExternalNode(externalPath, locator, reference) {
    if (nodes.has(externalPath)) return;
    nodes.set(externalPath, Object.freeze({ id: externalPath, path: externalPath, title: reference.label || externalPath, schemaId: '', kind: 'material', digest: locator.digest || '', qualification: Object.freeze({ state: 'qualified', qualified: true, reasons: Object.freeze([]) }), recovery: locator, carryForward: '', lossAndUncertainty: null }));
  }
}

function sourceReferencesFor(record = {}, explicit = []) {
  const recordPath = normalizePath(record.path || '');
  const supplied = explicit.filter((item) => sameKey(item.from || item.reduction || item.currentReduction || '', recordPath));
  const fromMarkdown = markdownLinks(sectionText(record.markdown || '', 'Source Context')).map((link) => Object.freeze({ ...link, from: recordPath, qualification: 'qualified', basis: 'explicit-qualified-reduction-source-context-link' }));
  const merged = [...supplied, ...fromMarkdown];
  const seen = new Set();
  return merged.filter((item) => {
    const key = `${normalizePath(item.path || linkPath(item.target || ''))}|${String(item.target || '')}`;
    if (!key || seen.has(key)) return false;
    seen.add(key); return true;
  });
}

function normalizeSourceReferences(value) {
  return normalizeList(value).map((item) => typeof item === 'string'
    ? Object.freeze({ from: '', target: item, path: linkPath(item), qualification: 'unresolved', basis: '' })
    : Object.freeze({
      from: normalizePath(item.from || item.reduction || item.currentReduction || ''),
      target: String(item.target || item.source || item.reference || item.path || ''),
      path: normalizePath(item.path || linkPath(item.target || item.source || item.reference || '')),
      label: String(item.label || ''),
      qualification: String(item.qualification || item.semanticState || 'qualified'),
      basis: item.basis || '',
      locator: item.locator || null
    }));
}

function lossProjectionFor(record = {}, facts = []) {
  const target = normalizePath(record.path || '');
  const matches = facts.filter((item) => sameKey(item.target || item.reduction || item.path || '', target));
  const declared = sectionText(record.markdown || '', 'Loss And Uncertainty');
  if (matches.length !== 1) return Object.freeze({ target, state: matches.length > 1 ? 'unresolved' : 'declared-unclassified', qualification: matches.length > 1 ? 'unresolved' : 'declared-only', detail: declared, basis: matches.length > 1 ? 'multiple normalized loss facts' : 'exact Reduction Loss And Uncertainty body retained without lexical interpretation' });
  const fact = matches[0];
  const state = String(fact.state || fact.lossState || 'unresolved');
  const qualified = String(fact.qualification || fact.semanticState || '') === 'qualified' && nonEmptyBasis(fact.basis);
  return Object.freeze({ target, state: qualified ? state : 'unresolved', qualification: qualified ? 'qualified' : 'unresolved', detail: String(fact.detail || declared), basis: fact.basis || '' });
}

function inheritedLossProjection(rootPath, nodes, hops) {
  const descendants = new Set();
  const queue = [normalizePath(rootPath)];
  while (queue.length) {
    const current = queue.shift();
    for (const hop of hops.filter((item) => item.from === current)) {
      if (descendants.has(hop.to)) continue;
      descendants.add(hop.to); queue.push(hop.to);
    }
  }
  return nodes.filter((node) => descendants.has(node.path) && node.kind === 'reduction' && node.lossAndUncertainty?.fact).map((node) => node.lossAndUncertainty.fact);
}

function hop(from, to, reference, kind, sourceQualification) {
  return Object.freeze({
    from: normalizePath(from), to: normalizePath(to), sourceKind: kind,
    relationQualification: String(reference.qualification || 'qualified') === 'qualified' ? 'qualified' : 'unresolved',
    sourceQualification,
    basis: reference.basis || 'explicit qualified Source Context link',
    target: String(reference.target || reference.path || '')
  });
}

function issue(code, detail) { return Object.freeze({ code: String(code), detail: String(detail || '') }); }
function normalizeList(value) { return Array.isArray(value) ? value : value && typeof value === 'object' ? Object.entries(value).map(([target, item]) => typeof item === 'object' && item !== null ? ({ target, ...item }) : ({ target, state: item })) : []; }
function sameKey(a, b) { const left = normalizePath(a); const right = normalizePath(b); return Boolean(left && right && (left === right || left.endsWith(`/${right}`) || right.endsWith(`/${left}`))); }
function nonEmptyBasis(value) { return Array.isArray(value) ? value.length > 0 : typeof value === 'string' ? Boolean(value.trim()) : Boolean(value && typeof value === 'object' && Object.keys(value).length); }
