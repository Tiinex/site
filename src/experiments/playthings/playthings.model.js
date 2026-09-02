import { resolveLineage } from '../../lineage/lineage.resolve.js';
import { resolvePlaythingsPresentationCompanion } from './presentation/playthings.presentation.js';

export const PLAYTHINGS_EXPERIMENT_ID = 'tiinex.playthings.multiverse.experimental.v1';

export function playthingsExperimentRequested(locationLike = null) {
  const search = String(locationLike?.search || '');
  if (!search) return false;
  try { return new URLSearchParams(search).get('experiment') === 'playthings'; }
  catch (_) { return /(?:^|[?&])experiment=playthings(?:&|$)/.test(search); }
}

export function projectPlaythingsMultiverse(workspacesInput = []) {
  const workspaces = Array.isArray(workspacesInput) ? workspacesInput : [];
  const prepared = prepareRecords(workspaces);
  const lineage = resolveLineage(prepared.records, { depth: 'playthings-loaded-multiverse' });
  const artifacts = lineage.nodes.map((node) => artifactFromNode(node, prepared.recordContextById.get(String(node.id || '')))).filter(Boolean);
  const artifactByKey = new Map(artifacts.map((artifact) => [artifact.key, artifact]));
  const edgeRows = (lineage.edges || []).filter((edge) => edge.kind === 'parent' && edge.status !== 'missing').map((edge) => {
    const from = artifactByKey.get(String(edge.from || ''));
    const to = artifactByKey.get(String(edge.to || ''));
    if (!from || !to) return null;
    return Object.freeze({
      key: `parent:${from.key}->${to.key}`,
      kind: 'parent',
      status: edge.status || 'resolved',
      from: from.key,
      to: to.key,
      fromVerseId: from.verseId,
      toVerseId: to.verseId,
      crossVerse: from.verseId !== to.verseId,
      method: edge.method || '',
      target: edge.target || ''
    });
  }).filter(Boolean);

  const parentByChild = new Map(edgeRows.map((edge) => [edge.to, edge.from]));
  const childrenByParent = new Map();
  for (const edge of edgeRows) {
    if (!childrenByParent.has(edge.from)) childrenByParent.set(edge.from, []);
    childrenByParent.get(edge.from).push(edge.to);
  }
  for (const children of childrenByParent.values()) children.sort();

  const artifactsByVerse = groupBy(artifacts, (artifact) => artifact.verseId);
  const repoSummaries = prepared.repoSummaries || [];
  const verseIds = new Set([...artifactsByVerse.keys(), ...repoSummaries.map((summary) => verseIdForRepo(summary.repo))]);
  const verses = Array.from(verseIds)
    .map((verseId) => {
      const verseArtifacts = artifactsByVerse.get(verseId) || [];
      const summary = repoSummaries.find((entry) => verseIdForRepo(entry.repo) === verseId) || null;
      const first = verseArtifacts[0] || {};
      const repo = first.repo || summary?.repo || verseId.replace(/^repo:/, '');
      const keys = new Set(verseArtifacts.map((artifact) => artifact.key));
      const internalEdges = edgeRows.filter((edge) => keys.has(edge.from) && keys.has(edge.to));
      const roots = verseArtifacts.filter((artifact) => !parentByChild.has(artifact.key) || !keys.has(parentByChild.get(artifact.key))).map((artifact) => artifact.key);
      const leaves = verseArtifacts.filter((artifact) => !(childrenByParent.get(artifact.key) || []).some((childKey) => keys.has(childKey))).map((artifact) => artifact.key);
      const actors = leaves.map((headKey) => lineageActorForHead(headKey, artifactByKey, parentByChild, childrenByParent));
      return Object.freeze({
        id: verseId,
        repo,
        label: repo,
        realm: playthingsRealmForRepo(repo),
        workspaceIds: Object.freeze(Array.from(new Set([...(summary?.workspaceIds || []), ...verseArtifacts.map((artifact) => artifact.workspaceId)])).sort()),
        observedCount: Number(summary?.recordCount || verseArtifacts.length),
        resolvedCount: verseArtifacts.length,
        projectionBoundCount: Number(summary?.inferredCount || 0),
        artifacts: Object.freeze(verseArtifacts.slice().sort(compareArtifacts)),
        edges: Object.freeze(internalEdges),
        roots: Object.freeze(roots.sort()),
        actors: Object.freeze(actors.sort((a, b) => a.headKey.localeCompare(b.headKey)))
      });
    })
    .sort((a, b) => a.repo.localeCompare(b.repo));

  const externalEdges = edgeRows.filter((edge) => edge.crossVerse);
  const unresolved = (lineage.findings || []).filter((finding) => ['warning', 'error'].includes(String(finding.severity || '').toLowerCase()) || String(finding.code || '').includes('unresolved') || String(finding.code || '').includes('missing') || String(finding.code || '').includes('ambiguous'));
  const unboundArtifacts = prepared.unbound.map((entry) => Object.freeze({ workspaceId: entry.workspaceId, id: entry.record?.id || entry.record?.path || '', title: entry.record?.title || entry.record?.summary || entry.record?.path || 'Unbound material' }));

  const model = {
    schema: PLAYTHINGS_EXPERIMENT_ID,
    verses: Object.freeze(verses),
    artifacts: Object.freeze(artifacts.slice().sort(compareArtifacts)),
    edges: Object.freeze(edgeRows),
    portals: Object.freeze(externalEdges),
    unresolved: Object.freeze(unresolved.map((finding) => Object.freeze({ code: finding.code || '', severity: finding.severity || '', nodeId: finding.nodeId || '', target: finding.target || '', message: finding.message || '' }))),
    unboundArtifacts: Object.freeze(unboundArtifacts),
    sourceCount: prepared.sourceCount,
    inferredArtifactCount: prepared.inferredCount,
    workspaceBindings: Object.freeze(prepared.workspaceBindings),
    observedRecordCount: prepared.records.length,
    artifactCount: artifacts.length
  };
  return Object.freeze(Object.assign(model, { fingerprint: playthingsModelFingerprint(model) }));
}

export function planPlaythingsDelta(previous = null, next = null) {
  if (!previous || !next) return Object.freeze({ schema: 'tiinex.playthings.delta.v1', events: Object.freeze([]), realms: Object.freeze([]), additions: Object.freeze([]), portals: Object.freeze([]), firstObservation: true, changed: false });
  const previousVerseIds = new Set((previous.verses || []).map((verse) => verse.id));
  const realmEvents = (next.verses || []).filter((verse) => !previousVerseIds.has(verse.id)).map((verse, index) => Object.freeze({
    id: `realm:${verse.id}`,
    order: index,
    kind: 'realm',
    verseId: verse.id,
    label: verse.realm?.label || verse.repo || verse.id
  }));
  const previousKeys = new Set((previous.artifacts || []).map((artifact) => artifact.key));
  const nextByKey = new Map((next.artifacts || []).map((artifact) => [artifact.key, artifact]));
  const nextParentByChild = new Map((next.edges || []).filter((edge) => edge.kind === 'parent').map((edge) => [edge.to, edge.from]));
  const nextChildrenByParent = new Map();
  for (const edge of (next.edges || []).filter((edge) => edge.kind === 'parent')) {
    if (!nextChildrenByParent.has(edge.from)) nextChildrenByParent.set(edge.from, []);
    nextChildrenByParent.get(edge.from).push(edge.to);
  }
  const additions = (next.artifacts || []).filter((artifact) => !previousKeys.has(artifact.key));
  const ordered = topologicalArtifactAdditions(additions, nextParentByChild, nextByKey);
  const events = ordered.map((artifact, index) => {
    const parentKey = nextParentByChild.get(artifact.key) || '';
    const parentWasObserved = Boolean(parentKey && previousKeys.has(parentKey));
    const siblingCount = parentKey ? (nextChildrenByParent.get(parentKey) || []).length : 0;
    const kind = !parentKey ? 'arrive' : parentWasObserved && siblingCount > 1 ? 'split' : 'advance';
    return Object.freeze({
      id: `artifact:${artifact.key}`,
      order: realmEvents.length + index,
      kind,
      artifactKey: artifact.key,
      parentKey,
      verseId: artifact.verseId,
      at: artifact.createdAt || '',
      label: artifact.title || artifact.path || artifact.key
    });
  });

  const previousPortalKeys = new Set((previous.portals || []).map((edge) => edge.key));
  const portalEvents = (next.portals || []).filter((edge) => !previousPortalKeys.has(edge.key)).map((edge, index) => Object.freeze({
    id: `portal:${edge.key}`,
    order: realmEvents.length + events.length + index,
    kind: 'portal',
    edgeKey: edge.key,
    from: edge.from,
    to: edge.to,
    fromVerseId: edge.fromVerseId,
    toVerseId: edge.toVerseId,
    label: `${repoLabel(edge.fromVerseId)} ↔ ${repoLabel(edge.toVerseId)}`
  }));
  const allEvents = Object.freeze([...realmEvents, ...events, ...portalEvents]);
  return Object.freeze({
    schema: 'tiinex.playthings.delta.v1',
    events: allEvents,
    realms: Object.freeze(realmEvents.map((event) => event.verseId)),
    additions: Object.freeze(ordered.map((artifact) => artifact.key)),
    portals: Object.freeze(portalEvents.map((event) => event.edgeKey)),
    firstObservation: false,
    changed: allEvents.length > 0,
    fromFingerprint: previous.fingerprint || '',
    toFingerprint: next.fingerprint || ''
  });
}

export function playthingsModelFingerprint(model = {}) {
  const verses = (model.verses || []).map((verse) => `${verse.id}@${Number(verse.observedCount || 0)}`).sort();
  const artifacts = (model.artifacts || []).map((artifact) => `${artifact.key}@${artifact.createdAt || ''}`).sort();
  const edges = (model.edges || []).map((edge) => edge.key).sort();
  return hashToken(`${verses.join('|')}::${artifacts.join('|')}::${edges.join('|')}`);
}

export function visualKindForSchema(schemaId = '') {
  return resolvePlaythingsPresentationCompanion(schemaId).companion.stationKind || 'relic';
}

export function playthingsRealmForRepo(repo = '') {
  const name = String(repo || '').split('/').pop().toLowerCase();
  if (name === 'business') return Object.freeze({ id: 'citadel', label: 'Citadel of Intent', glyph: '♜' });
  if (name === 'docs') return Object.freeze({ id: 'archive', label: 'Archive Grove', glyph: '✦' });
  if (name === 'site') return Object.freeze({ id: 'signal-city', label: 'Signal City', glyph: '⌂' });
  if (name === 'agents') return Object.freeze({ id: 'guild', label: 'The Guild', glyph: '⚑' });
  if (name === 'data') return Object.freeze({ id: 'crystal-fields', label: 'Crystal Fields', glyph: '◆' });
  if (name === 'core') return Object.freeze({ id: 'forge', label: 'Core Forge', glyph: '⚒' });
  if (name === 'native') return Object.freeze({ id: 'harbor-realm', label: 'Native Harbor', glyph: '≈' });
  if (name === 'ai') return Object.freeze({ id: 'observatory-realm', label: 'Sky Observatory', glyph: '◉' });
  const variants = ['wilds', 'citadel', 'archive', 'signal-city'];
  const id = variants[hashInteger(repo) % variants.length];
  return Object.freeze({ id, label: 'Uncharted Realm', glyph: '◇' });
}

export function playthingsArtifactPosition(artifact = {}) {
  const key = String(artifact.key || artifact.path || artifact.title || 'artifact');
  const x = 10 + (hashInteger(`x:${key}`) % 80);
  const y = 22 + (hashInteger(`y:${key}`) % 66);
  return Object.freeze({ x, y });
}

export function playthingsVersePosition(verseId = '') {
  const key = String(verseId || 'verse');
  const x = 12 + (hashInteger(`verse-x:${key}`) % 76);
  const y = 10 + (hashInteger(`verse-y:${key}`) % 72);
  return Object.freeze({ x, y });
}

function prepareRecords(workspaces) {
  const records = [];
  const unbound = [];
  const recordContextById = new Map();
  const workspaceBindings = [];
  const repoSummaryByRepo = new Map();
  let sourceCount = 0;
  let inferredCount = 0;
  for (const workspace of workspaces) {
    const workspaceId = String(workspace?.id || 'workspace');
    const sources = Array.isArray(workspace?.sources) ? workspace.sources : [];
    const sourceMap = new Map(sources.map((source) => [String(source?.id || ''), source]));
    const repoSources = uniqueRepoSources(sources);
    const primary = primaryRepositoryForWorkspace(workspace, repoSources);
    sourceCount += repoSources.length;
    if (primary?.repo) workspaceBindings.push(Object.freeze({ workspaceId, repo: primary.repo, method: primary.method }));
    if (primary?.repo) ensureRepoSummary(repoSummaryByRepo, primary.repo, workspaceId);
    for (const record of Array.isArray(workspace?.records) ? workspace.records : []) {
      const sourceId = String(record?.source?.id || '');
      const source = sourceMap.get(sourceId) || record?.source || {};
      const directRepo = repoForSource(source) || repoFromRecord(record);
      const repo = directRepo || primary?.repo || '';
      if (!repo) { unbound.push({ workspaceId, record }); continue; }
      const inferred = !directRepo;
      if (inferred) inferredCount += 1;
      const summary = ensureRepoSummary(repoSummaryByRepo, repo, workspaceId);
      summary.recordCount += 1;
      if (inferred) summary.inferredCount += 1;
      const originalId = String(record?.id || record?.path || record?.sourcePath || `${repo}:${records.length}`);
      const id = `${workspaceId}::${repo}::${originalId}`;
      const projectionSource = inferred ? projectionSourceForRepo(primary?.source || {}, repo, source) : Object.assign({}, source || {}, record?.source || {});
      const clone = Object.assign({}, record, {
        id,
        source: Object.assign({}, projectionSource, { id: projectionSource.id || sourceId || source?.id || '' })
      });
      records.push(clone);
      recordContextById.set(id, {
        workspaceId,
        repo,
        sourceId,
        originalId,
        source,
        inferred,
        bindingMethod: inferred ? primary?.method || 'workspace-repository' : 'record-source'
      });
    }
  }
  const repoSummaries = Array.from(repoSummaryByRepo.values()).map((summary) => Object.freeze({
    repo: summary.repo,
    workspaceIds: Object.freeze(Array.from(summary.workspaceIds).sort()),
    recordCount: summary.recordCount,
    inferredCount: summary.inferredCount
  })).sort((a, b) => a.repo.localeCompare(b.repo));
  return { records, unbound, recordContextById, sourceCount, inferredCount, workspaceBindings, repoSummaries };
}

function ensureRepoSummary(byRepo, repo, workspaceId) {
  const normalized = normalizeRepo(repo);
  if (!normalized) return { repo: '', workspaceIds: new Set(), recordCount: 0, inferredCount: 0 };
  if (!byRepo.has(normalized)) byRepo.set(normalized, { repo: normalized, workspaceIds: new Set(), recordCount: 0, inferredCount: 0 });
  const summary = byRepo.get(normalized);
  if (workspaceId) summary.workspaceIds.add(String(workspaceId));
  return summary;
}

function uniqueRepoSources(sources = []) {
  const byRepo = new Map();
  for (const source of sources) {
    const repo = repoForSource(source);
    if (!repo) continue;
    const current = byRepo.get(repo);
    if (!current || sourceStrength(source) > sourceStrength(current)) byRepo.set(repo, source);
  }
  return Array.from(byRepo.entries()).map(([repo, source]) => ({ repo, source }));
}

function primaryRepositoryForWorkspace(workspace = {}, candidates = []) {
  if (!candidates.length) return null;
  if (candidates.length === 1) return { ...candidates[0], method: 'sole-workspace-repository' };
  const labels = [workspace?.title, workspace?.name, workspace?.id].map(normalizeLabelToken).filter(Boolean);
  const scored = candidates.map((candidate) => {
    const repoBase = normalizeLabelToken(String(candidate.repo || '').split('/').pop());
    let score = sourceStrength(candidate.source);
    if (labels.some((label) => label === repoBase)) score += 1000;
    else if (labels.some((label) => label.includes(repoBase) || repoBase.includes(label))) score += 250;
    return { ...candidate, score };
  }).sort((a, b) => b.score - a.score || a.repo.localeCompare(b.repo));
  if (!scored[0] || scored[0].score === scored[1]?.score) return null;
  if (scored[0].score < 250) return null;
  return { repo: scored[0].repo, source: scored[0].source, method: 'workspace-label-repository-match' };
}

function projectionSourceForRepo(primarySource = {}, repo = '', originalSource = {}) {
  const ref = String(primarySource?.ref || primarySource?.config?.ref || '').trim();
  return Object.assign({}, originalSource || {}, {
    id: `playthings:${normalizeRepo(repo).toLowerCase()}`,
    adapterId: 'github',
    kind: 'playthings-repository-projection',
    repo,
    repository: repo,
    ref,
    projectionOnly: true
  });
}

function sourceStrength(source = {}) {
  if (source?.primary === true || source?.role === 'primary' || source?.sourceRole === 'primary') return 100;
  const count = Number(source?.count || source?.recordCount || source?.referenceCount || 0);
  return Number.isFinite(count) ? Math.min(80, Math.max(0, count)) : 0;
}

function normalizeLabelToken(value) {
  return String(value || '').trim().toLowerCase().replace(/^tiinex[\s:/_-]*/i, '').replace(/[^a-z0-9]+/g, '');
}

function artifactFromNode(node = {}, context = null) {
  if (!context) return null;
  const record = node.record || {};
  const createdAt = String(record.currentCreatedAt || record.createdAt || record.date || '');
  const presentation = resolvePlaythingsPresentationCompanion(node.schemaId || record.schemaId || record.kind || '');
  return Object.freeze({
    key: String(node.id || ''),
    recordId: context.originalId,
    workspaceId: context.workspaceId,
    sourceId: context.sourceId,
    verseId: verseIdForRepo(context.repo),
    repo: context.repo,
    title: String(node.title || record.title || record.summary || record.path || 'Artifact'),
    summary: String(record.summary || ''),
    path: String(node.path || record.path || ''),
    schemaId: String(node.schemaId || record.schemaId || record.kind || 'unknown'),
    createdAt,
    visualKind: presentation.companion.stationKind || 'relic',
    interactionKind: presentation.companion.interactionKind || 'inspect',
    districtKind: presentation.companion.districtKind || 'commons',
    presentationResolution: presentation.resolution,
    presentationSchemaId: presentation.resolvedSchemaId,
    hasContinuityContext: Boolean(node.hasContinuityContext ?? record.hasContinuityContext),
    hasIntegrity: Boolean(node.hasIntegrity ?? record.hasIntegrity),
    sourceMode: String(node.sourceMode || record.sourceMode || ''),
    bindingMethod: context.bindingMethod || 'record-source',
    projectionBound: Boolean(context.inferred)
  });
}

function lineageActorForHead(headKey, artifactByKey, parentByChild, childrenByParent) {
  const ancestry = [];
  let cursor = headKey;
  const seen = new Set();
  while (cursor && !seen.has(cursor)) {
    seen.add(cursor);
    ancestry.push(cursor);
    cursor = parentByChild.get(cursor) || '';
  }
  ancestry.reverse();
  const head = artifactByKey.get(headKey) || {};
  const branchPoints = ancestry.filter((key) => (childrenByParent.get(key) || []).length > 1);
  return Object.freeze({
    id: `lineage:${headKey}`,
    headKey,
    verseId: head.verseId || '',
    repo: head.repo || '',
    label: head.title || head.path || headKey,
    schemaId: head.schemaId || '',
    visualKind: head.visualKind || 'relic',
    ancestry: Object.freeze(ancestry),
    generations: Math.max(0, ancestry.length - 1),
    branchDepth: branchPoints.length
  });
}

function topologicalArtifactAdditions(additions, parentByChild, nextByKey) {
  const pending = new Map(additions.map((artifact) => [artifact.key, artifact]));
  const ordered = [];
  while (pending.size) {
    const ready = Array.from(pending.values()).filter((artifact) => {
      const parentKey = parentByChild.get(artifact.key) || '';
      return !parentKey || !pending.has(parentKey);
    }).sort(compareArtifacts);
    const batch = ready.length ? ready : Array.from(pending.values()).sort(compareArtifacts).slice(0, 1);
    for (const artifact of batch) { ordered.push(artifact); pending.delete(artifact.key); }
  }
  return ordered.filter((artifact) => nextByKey.has(artifact.key));
}

function compareArtifacts(left = {}, right = {}) {
  const leftTime = sortableDate(left.createdAt);
  const rightTime = sortableDate(right.createdAt);
  if (leftTime !== rightTime) return leftTime - rightTime;
  return String(left.key || '').localeCompare(String(right.key || ''));
}

function sortableDate(value) {
  const stamp = Date.parse(String(value || '').replace(' ', 'T') + (/Z$/.test(String(value || '')) ? '' : 'Z'));
  return Number.isFinite(stamp) ? stamp : Number.MAX_SAFE_INTEGER;
}

function repoForSource(source = {}) {
  const id = String(source?.id || '').trim().toLowerCase();
  const kind = String(source?.kind || source?.adapterId || '').trim().toLowerCase();
  if (id === 'local' || kind.includes('session') || kind === 'local') return '';
  return normalizeRepo(source?.repo || source?.repository || source?.config?.repo || source?.config?.repository || '');
}

function repoFromRecord(record = {}) {
  const direct = normalizeRepo(record?.source?.repo || record?.source?.repository || record?.sourceTarget?.repository || '');
  if (direct) return direct;
  const values = [record?.sourceTarget?.inputTarget, record?.sourceTarget?.url, record?.recoveredFromUrl, record?.snapshot?.sourceUrl];
  for (const value of values) {
    const match = String(value || '').match(/github\.com\/([^/]+\/[^/#?]+)/i);
    if (match) return normalizeRepo(match[1].replace(/\.git$/i, ''));
  }
  return '';
}

function normalizeRepo(value) {
  return String(value || '').trim().replace(/^https?:\/\/github\.com\//i, '').replace(/\.git$/i, '').replace(/^\/+|\/+$/g, '');
}
function verseIdForRepo(repo) { return `repo:${normalizeRepo(repo).toLowerCase()}`; }
function repoLabel(verseId) { return String(verseId || '').replace(/^repo:/, ''); }
function groupBy(items, selector) {
  const out = new Map();
  for (const item of items || []) { const key = selector(item); if (!out.has(key)) out.set(key, []); out.get(key).push(item); }
  return out;
}
function hashInteger(value) {
  let hash = 2166136261;
  const text = String(value || '');
  for (let index = 0; index < text.length; index += 1) { hash ^= text.charCodeAt(index); hash = Math.imul(hash, 16777619); }
  return hash >>> 0;
}
function hashToken(value) { return hashInteger(value).toString(36).padStart(7, '0'); }
