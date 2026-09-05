import path from 'node:path';
import { resolveLineage } from '../../../lineage/lineage.resolve.js';
import { inferRecordMaterialRole, isDiscoveryWorkLeafEligible, MaterialRole } from '../../../workspaces/workspace.materialRole.js';
import { auditPortableRecord } from '../audit/audit.capability.js';
import { normalizePortableInput } from '../input/portable.input.js';
import { portableFinding, summarizePortableFindings } from '../findings.js';

export const PORTABLE_REDUCTION_PREFLIGHT_SCHEMA_ID = 'tiinex.portable.reduction-preflight.v1';

const INELIGIBLE_LIFECYCLE_TOKENS = Object.freeze(['active', 'unresolved', 'disputed', 'unaccepted', 'unlanded', 'pending', 'blocked', 'in-progress', 'in progress']);
const FIXTURE_RE = /(^|\/)(?:fixtures?|test-fixtures?|__fixtures__)(\/|$)|\.fixture\./i;
const GITHUB_IMMUTABLE_BLOB_RE = /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/([0-9a-f]{40})\/(.+)$/i;

export function preflightPortableReduction(input = {}, options = {}) {
  const material = normalizePortableInput(input.materials || input);
  const records = material.records || [];
  const findings = [...(material.findings || [])];
  const lineage = resolveLineage(records, { depth: options.depth || 'portable-reduction-preflight' });
  findings.push(...(lineage.findings || []));
  const graph = reductionGraph(lineage, records);
  const inventory = buildInventory(records, graph);
  const candidates = explicitCandidatePaths(input);
  const reductionRecord = resolveUniqueRecord(records, input.reductionArtifactPath || input.reductionArtifact || input.reduction || '');
  const reductionAudit = reductionRecord ? auditPortableRecord(reductionRecord) : null;
  const reductionQualification = qualifyReductionRecord(reductionRecord, reductionAudit, records);
  const entries = reductionRecord ? parseReductionEntries(reductionRecord.markdown || '') : [];
  const immutableSources = normalizeImmutableSources(input.immutableSources || input.sources || []);
  const assessments = candidates.map((candidatePath) => assessCandidate({
    candidatePath,
    records,
    graph,
    entries,
    reductionRecord,
    reductionQualification,
    immutableSources
  }));

  if (!candidates.length) findings.push(portableFinding('info', 'portable.reduction-preflight.candidates.none', 'No explicit disappearing-leaf candidates were supplied; result is inventory-only and cannot authorize destructive apply.'));
  if (!reductionRecord) findings.push(portableFinding('error', 'portable.reduction-preflight.reduction.required', 'An explicit pre-delete Reduction artifact is required before any destructive reduction can qualify.', { ref: String(input.reductionArtifactPath || input.reductionArtifact || input.reduction || '') }));
  else if (!reductionQualification.qualified) findings.push(portableFinding('error', 'portable.reduction-preflight.reduction.unqualified', 'The supplied Reduction artifact is not an exact, readable tiinex.reduction.v1 artifact.', { ref: reductionRecord.path || reductionRecord.id || '' }));
  for (const assessment of assessments) findings.push(...assessment.findings);

  const destructiveEligible = candidates.length > 0
    && reductionQualification.qualified
    && assessments.length === candidates.length
    && assessments.every((assessment) => assessment.destructiveEligible);
  const summary = Object.freeze({
    records: records.length,
    semanticLeaves: inventory.counts.semanticLeaves,
    explicitCandidates: candidates.length,
    candidateQualified: assessments.filter((item) => item.destructiveEligible).length,
    candidateBlocked: assessments.filter((item) => !item.destructiveEligible).length,
    reductionEntries: entries.length
  });
  const status = destructiveEligible ? 'preflight-qualified' : candidates.length ? 'blocked' : 'inventory-only';

  return Object.freeze({
    schema: PORTABLE_REDUCTION_PREFLIGHT_SCHEMA_ID,
    status,
    destructiveEligible,
    inventory,
    reduction: Object.freeze({
      requestedPath: String(input.reductionArtifactPath || input.reductionArtifact || input.reduction || ''),
      record: reductionRecord ? Object.freeze({ id: reductionRecord.id || '', path: reductionRecord.path || '', schemaId: reductionRecord.schemaId || '' }) : null,
      qualification: reductionQualification,
      audit: reductionAudit,
      entries: Object.freeze(entries)
    }),
    candidates: Object.freeze(assessments),
    summary,
    findingSummary: summarizePortableFindings(findings),
    findings: Object.freeze(findings),
    boundary: Object.freeze({
      adapterNeutral: true,
      sharedConsumers: Object.freeze(['Viewer', 'CLI', 'LLM', 'VS Code']),
      planningOnly: true,
      sourceMutation: false,
      remoteWrite: false,
      destructiveApplyImplemented: false,
      broadCandidateEvidenceIsAuthority: false,
      explicitCandidateIdentityRequired: true,
      qualifiedPreDeleteReductionRequired: true,
      immutableLeafRecoveryRequired: true,
      parentSpanProofRequired: true,
      crossRepositorySpanMayRequireExternalPinnedSnapshotEvidence: true,
      canonicalReductionSchemaAuthorityChanged: false,
      destructiveEligibilityMeaning: 'preflight evidence only; an external/apply capability must still enforce deletion authorization, repository state, approvals, and commit/publish gates'
    })
  });
}

function buildInventory(records = [], graph = {}) {
  const items = records.map((record) => {
    const role = inferRecordMaterialRole(record);
    const semanticLeaf = isDiscoveryWorkLeafEligible(record) && !graph.childrenById.has(record.id || record.path || '');
    const lifecycle = String(record.lifecycleStatus || record.status || '');
    const lifecycleBlockers = lifecycleBlockersFor(record);
    return Object.freeze({
      id: String(record.id || ''),
      path: String(record.path || ''),
      schemaId: String(record.schemaId || ''),
      materialRole: role,
      semanticLeaf,
      lifecycle,
      fixture: isFixtureRecord(record),
      eligibility: semanticLeaf && !lifecycleBlockers.length && !isFixtureRecord(record) ? 'candidate-evidence-only' : 'not-eligible-as-disappearing-semantic-leaf',
      blockers: Object.freeze([
        ...(role !== MaterialRole.leaf ? [`material-role:${role}`] : []),
        ...(isDiscoveryWorkLeafEligible(record) && graph.childrenById.has(record.id || record.path || '') ? ['not-lineage-leaf'] : []),
        ...lifecycleBlockers,
        ...(isFixtureRecord(record) ? ['fixture-or-test-dependency'] : [])
      ])
    });
  });
  return Object.freeze({
    items: Object.freeze(items),
    counts: Object.freeze({
      total: items.length,
      semanticLeaves: items.filter((item) => item.semanticLeaf).length,
      leafRole: items.filter((item) => item.materialRole === MaterialRole.leaf).length,
      schemaDefinition: items.filter((item) => item.materialRole === MaterialRole.schemaDefinition).length,
      supporting: items.filter((item) => item.materialRole === MaterialRole.supporting).length,
      workspaceArtifact: items.filter((item) => item.materialRole === MaterialRole.workspaceArtifact).length,
      unknown: items.filter((item) => item.materialRole === MaterialRole.unknown).length
    }),
    boundary: 'Inventory classifies loaded material only. Broad role/leaf classification is evidence, not deletion authority; each disappearing leaf still requires explicit candidate identity and Reduction entry qualification.'
  });
}

function assessCandidate({ candidatePath, records, graph, entries, reductionRecord, reductionQualification, immutableSources }) {
  const findings = [];
  const resolution = resolveUniqueRecordWithState(records, candidatePath);
  const record = resolution.record;
  const blockers = [];
  if (!record) blockers.push(resolution.state === 'ambiguous' ? 'candidate-path-ambiguous' : 'candidate-not-loaded');
  const role = record ? inferRecordMaterialRole(record) : MaterialRole.unknown;
  const candidateId = record?.id || record?.path || '';
  const semanticLeaf = Boolean(record && isDiscoveryWorkLeafEligible(record) && !graph.childrenById.has(candidateId));
  if (record && role !== MaterialRole.leaf) blockers.push(`material-role:${role}`);
  if (record && isDiscoveryWorkLeafEligible(record) && graph.childrenById.has(candidateId)) blockers.push('not-lineage-leaf');
  if (record && !isDiscoveryWorkLeafEligible(record)) blockers.push('not-semantic-work-leaf');
  if (record) blockers.push(...lifecycleBlockersFor(record));
  if (record && isFixtureRecord(record)) blockers.push('fixture-or-test-dependency');
  if (!reductionRecord) blockers.push('qualified-pre-delete-reduction-required');
  else if (!reductionQualification.qualified) blockers.push('qualified-pre-delete-reduction-required');

  const matchingEntries = record ? entries.filter((entry) => candidateMatchesEntry(record, entry)) : [];
  if (record && matchingEntries.length === 0) blockers.push('reduction-entry-missing');
  if (matchingEntries.length > 1) blockers.push('reduction-entry-ambiguous');
  const entry = matchingEntries.length === 1 ? matchingEntries[0] : null;
  if (entry && !entry.disposition) blockers.push('disposition-required');
  if (entry && !entry.reason) blockers.push('reason-required');
  if (entry && !entry.collapseToPath) blockers.push('collapse-boundary-required');

  const explicitSource = immutableSourceFor(record, candidatePath, immutableSources);
  const immutableSource = qualifyImmutableSource(entry?.leafTarget || '', explicitSource);
  if (!immutableSource.qualified) blockers.push(immutableSource.blocker);

  const collapseResolution = entry?.collapseToPath ? resolveUniqueRecordWithState(records, entry.collapseToPath) : { state: 'missing', record: null };
  if (entry?.collapseToPath && collapseResolution.state === 'ambiguous') blockers.push('collapse-boundary-ambiguous');
  if (entry?.collapseToPath && !collapseResolution.record) blockers.push('collapse-boundary-not-loaded');
  if (entry?.collapseToPath && reductionQualification.parentPath && !sameResolvedPath(entry.collapseToPath, reductionQualification.parentPath)) blockers.push('reduction-placement-collapse-mismatch');
  const parentSpan = record && collapseResolution.record
    ? proveParentSpan(record, collapseResolution.record, graph)
    : Object.freeze({ state: immutableSource.qualified ? 'external-proof-required' : 'unproved', qualified: false, path: Object.freeze([]), repositories: Object.freeze([]), crossRepository: false, blocker: 'parent-span-unproved' });
  if (record && entry?.collapseToPath && !parentSpan.qualified) blockers.push(parentSpan.blocker || 'parent-span-unproved');

  const uniqueBlockers = Object.freeze([...new Set(blockers.filter(Boolean))]);
  for (const blocker of uniqueBlockers) findings.push(portableFinding('error', `portable.reduction-preflight.${safeCode(blocker)}`, `Reduction candidate ${candidatePath} is blocked: ${blocker}.`, { ref: record?.path || candidatePath }));
  return Object.freeze({
    requestedPath: candidatePath,
    record: record ? Object.freeze({ id: record.id || '', path: record.path || '', schemaId: record.schemaId || '', lifecycleStatus: record.lifecycleStatus || '', materialRole: role }) : null,
    resolution: resolution.state,
    semanticLeaf,
    reductionEntry: entry,
    immutableSource,
    collapseBoundary: Object.freeze({ requestedPath: entry?.collapseToPath || '', state: collapseResolution.state, record: collapseResolution.record ? Object.freeze({ id: collapseResolution.record.id || '', path: collapseResolution.record.path || '' }) : null }),
    parentSpan,
    destructiveEligible: uniqueBlockers.length === 0,
    blockers: uniqueBlockers,
    findings: Object.freeze(findings)
  });
}

function reductionGraph(lineage = {}, records = []) {
  const childrenById = new Map();
  const parentsByChild = new Map();
  const edgeStatusByChild = new Map();
  for (const edge of lineage.edges || []) {
    if (edge.kind !== 'parent') continue;
    const list = childrenById.get(edge.from) || [];
    list.push(edge.to);
    childrenById.set(edge.from, list);
    const parents = parentsByChild.get(edge.to) || [];
    parents.push(edge.from);
    parentsByChild.set(edge.to, parents);
    const statuses = edgeStatusByChild.get(edge.to) || [];
    statuses.push(String(edge.status || ''));
    edgeStatusByChild.set(edge.to, statuses);
  }
  const recordById = new Map(records.map((record) => [record.id || record.path || '', record]));
  return { childrenById, parentsByChild, edgeStatusByChild, recordById };
}

function proveParentSpan(leaf, boundary, graph) {
  const leafId = leaf.id || leaf.path || '';
  const boundaryId = boundary.id || boundary.path || '';
  const queue = [{ id: leafId, path: [leafId] }];
  const visited = new Set();
  let ambiguitySeen = false;
  while (queue.length) {
    const current = queue.shift();
    if (!current || visited.has(current.id)) continue;
    visited.add(current.id);
    if (current.id === boundaryId) {
      const repositories = [...new Set(current.path.map((id) => String(graph.recordById.get(id)?.source?.repository || graph.recordById.get(id)?.source?.repo || '')).filter(Boolean))];
      return Object.freeze({ state: 'loaded-qualified', qualified: true, path: Object.freeze(current.path), repositories: Object.freeze(repositories), crossRepository: repositories.length > 1, blocker: '' });
    }
    const parents = graph.parentsByChild.get(current.id) || [];
    const statuses = graph.edgeStatusByChild.get(current.id) || [];
    if (parents.length > 1) ambiguitySeen = true;
    for (let index = 0; index < parents.length; index += 1) {
      if (statuses[index] && statuses[index] !== 'verified') continue;
      queue.push({ id: parents[index], path: [...current.path, parents[index]] });
    }
  }
  return Object.freeze({
    state: ambiguitySeen ? 'ambiguous-or-external-proof-required' : 'external-proof-required',
    qualified: false,
    path: Object.freeze([]),
    repositories: Object.freeze([]),
    crossRepository: false,
    blocker: ambiguitySeen ? 'parent-span-ambiguous' : 'parent-span-external-proof-required'
  });
}

function qualifyReductionRecord(record, audit, records = []) {
  if (!record || !audit) return Object.freeze({ qualified: false, state: 'missing', parentPath: '', parent: null, reasons: Object.freeze(['reduction-artifact-missing']) });
  const reasons = [];
  if (String(record.schemaId || '') !== 'tiinex.reduction.v1') reasons.push(`schema:${record.schemaId || 'missing'}`);
  if (audit.qualification?.exact !== true || audit.qualification?.moduleExact !== true) reasons.push('non-exact-schema-validation');
  if (audit.status !== 'readable') reasons.push(`audit-status:${audit.status || 'unknown'}`);
  if ((audit.findings || []).some((finding) => finding.severity === 'error')) reasons.push('audit-error');
  const parentPath = normalizePath(record.trace || '');
  const parentResolution = parentPath ? resolveUniqueRecordWithState(records, parentPath) : { state: 'missing', record: null };
  if (!parentPath) reasons.push('reduction-parent-required');
  else if (parentResolution.state === 'ambiguous') reasons.push('reduction-parent-ambiguous');
  else if (!parentResolution.record) reasons.push('reduction-parent-not-loaded');
  else {
    const parentAudit = auditPortableRecord(parentResolution.record);
    if (!isDiscoveryWorkLeafEligible(parentResolution.record)) reasons.push('reduction-parent-not-semantic-work-artifact');
    if (parentAudit.qualification?.exact !== true || parentAudit.status !== 'readable' || (parentAudit.findings || []).some((finding) => finding.severity === 'error')) reasons.push('reduction-parent-unqualified');
  }
  return Object.freeze({
    qualified: reasons.length === 0,
    state: reasons.length ? 'blocked' : 'qualified',
    parentPath,
    parent: parentResolution.record ? Object.freeze({ id: parentResolution.record.id || '', path: parentResolution.record.path || '', schemaId: parentResolution.record.schemaId || '' }) : null,
    reasons: Object.freeze(reasons)
  });
}

function parseReductionEntries(markdown = '') {
  const source = String(markdown || '');
  const section = source.match(/###\s+Reduced Leaves\s*\/\s*Expansion Boundary\s*\n([\s\S]*?)(?=\n##\s|\n#\s|$)/i)?.[1] || '';
  if (!section) return [];
  const starts = [...section.matchAll(/^\s*-\s+\*\*(.+?)\*\*\s*$/gm)];
  const entries = [];
  for (let index = 0; index < starts.length; index += 1) {
    const start = starts[index].index ?? 0;
    const end = index + 1 < starts.length ? starts[index + 1].index ?? section.length : section.length;
    const block = section.slice(start, end);
    const leaf = parseLabeledLink(block, 'Leaf');
    const collapse = parseLabeledLink(block, 'Collapse To');
    entries.push(Object.freeze({
      title: String(starts[index][1] || '').trim(),
      leafLabel: leaf.label,
      leafTarget: leaf.target,
      leafPath: linkPath(leaf.target || leaf.label),
      collapseToLabel: collapse.label,
      collapseToTarget: collapse.target,
      collapseToPath: linkPath(collapse.target || collapse.label),
      disposition: labeledCodeOrText(block, 'Disposition'),
      reason: labeledText(block, 'Why'),
      scope: labeledText(block, 'Expansion Span') || labeledText(block, 'Scope')
    }));
  }
  return entries;
}

function parseLabeledLink(block, label) {
  const match = block.match(new RegExp(`^\\s*-\\s+${escapeRegExp(label)}:\\s+\\[([^\\]]+)\\]\\(([^)]+)\\)\\s*$`, 'im'));
  return Object.freeze({ label: String(match?.[1] || '').trim(), target: String(match?.[2] || '').trim() });
}
function labeledCodeOrText(block, label) { const value = labeledText(block, label); return value.replace(/^`|`$/g, '').trim(); }
function labeledText(block, label) { return String(block.match(new RegExp(`^\\s*-\\s+${escapeRegExp(label)}:\\s+(.+?)\\s*$`, 'im'))?.[1] || '').trim(); }

function qualifyImmutableSource(target = '', explicit = null) {
  if (explicit?.qualified) return explicit;
  const value = String(target || '').trim();
  const github = value.match(GITHUB_IMMUTABLE_BLOB_RE);
  if (github) return Object.freeze({ qualified: true, state: 'immutable-permalink', provider: 'github', repository: `${github[1]}/${github[2]}`, commit: github[3].toLowerCase(), path: github[4], permalink: value, blocker: '' });
  if (!value) return Object.freeze({ qualified: false, state: 'missing', provider: '', repository: '', commit: '', path: '', permalink: '', blocker: 'immutable-leaf-source-required' });
  return Object.freeze({ qualified: false, state: 'unqualified-reference', provider: '', repository: '', commit: '', path: linkPath(value), permalink: value, blocker: 'immutable-leaf-source-unqualified' });
}

function normalizeImmutableSources(value) {
  const list = Array.isArray(value) ? value : value && typeof value === 'object' ? Object.entries(value).map(([candidatePath, source]) => ({ candidatePath, ...(source || {}) })) : [];
  return list.map((source) => {
    const commit = String(source.commit || source.sha || '').trim();
    const sourcePath = normalizePath(source.path || source.sourcePath || '');
    const permalink = String(source.permalink || source.url || '').trim();
    const qualified = source.immutable === true && /^[0-9a-f]{40}$/i.test(commit) && Boolean(sourcePath || permalink);
    return Object.freeze({
      candidatePath: normalizePath(source.candidatePath || source.candidate || source.leaf || sourcePath),
      qualified,
      state: qualified ? 'explicit-immutable-source' : 'explicit-source-unqualified',
      provider: String(source.provider || 'explicit'),
      repository: String(source.repository || source.repo || ''),
      commit: commit.toLowerCase(),
      path: sourcePath,
      permalink,
      blocker: qualified ? '' : 'explicit-immutable-source-unqualified'
    });
  });
}

function immutableSourceFor(record, candidatePath, sources) {
  const keys = new Set([normalizePath(candidatePath), normalizePath(record?.path || ''), path.basename(normalizePath(record?.path || ''))].filter(Boolean));
  return sources.find((source) => keys.has(source.candidatePath) || keys.has(path.basename(source.candidatePath || ''))) || null;
}

function explicitCandidatePaths(input = {}) {
  const values = input.candidatePaths || input.candidates || input.candidate || [];
  const list = Array.isArray(values) ? values : String(values || '').split(',');
  return Object.freeze([...new Set(list.map(normalizePath).filter(Boolean))]);
}

function resolveUniqueRecord(records, requestedPath) { return resolveUniqueRecordWithState(records, requestedPath).record; }
function resolveUniqueRecordWithState(records, requestedPath) {
  const wanted = normalizePath(requestedPath);
  if (!wanted) return { state: 'missing', record: null };
  const exact = records.filter((record) => normalizePath(record.path) === wanted || normalizePath(record.id) === wanted);
  if (exact.length === 1) return { state: 'exact', record: exact[0] };
  if (exact.length > 1) return { state: 'ambiguous', record: null };
  const suffix = records.filter((record) => normalizePath(record.path).endsWith(`/${wanted}`) || path.basename(normalizePath(record.path)) === path.basename(wanted));
  if (suffix.length === 1) return { state: 'suffix', record: suffix[0] };
  return { state: suffix.length > 1 ? 'ambiguous' : 'missing', record: null };
}

function candidateMatchesEntry(record, entry) {
  const recordPath = normalizePath(record.path || '');
  const entryPath = normalizePath(entry.leafPath || '');
  return Boolean(entryPath && (recordPath === entryPath || recordPath.endsWith(`/${entryPath}`) || path.basename(recordPath) === path.basename(entryPath)));
}

function lifecycleBlockersFor(record = {}) {
  const value = `${record.lifecycleStatus || ''} ${record.currentStatus || ''}`.toLowerCase();
  return INELIGIBLE_LIFECYCLE_TOKENS.filter((token) => value.includes(token)).map((token) => `lifecycle-ineligible:${token.replace(/\s+/g, '-')}`);
}
function isFixtureRecord(record = {}) { return record.fixture === true || record.requiredFixture === true || FIXTURE_RE.test(normalizePath(record.path || '')); }
function linkPath(value = '') {
  const text = String(value || '').trim();
  const github = text.match(GITHUB_IMMUTABLE_BLOB_RE);
  if (github) return normalizePath(github[4]);
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(text)) {
    try { return normalizePath(new URL(text).pathname); } catch { return ''; }
  }
  return normalizePath(text.split('#')[0].split('?')[0]);
}
function sameResolvedPath(a = '', b = '') { const left = normalizePath(a); const right = normalizePath(b); return left === right || left.endsWith(`/${right}`) || right.endsWith(`/${left}`) || path.basename(left) === path.basename(right); }
function normalizePath(value = '') { return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '').replace(/^\/+|\/+$/g, ''); }
function safeCode(value = '') { return String(value || 'blocked').toLowerCase().replace(/[^a-z0-9.-]+/g, '-').replace(/^-+|-+$/g, ''); }
function escapeRegExp(value = '') { return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
