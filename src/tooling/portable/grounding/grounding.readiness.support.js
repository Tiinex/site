import { packageFileBytes } from '../../../export/package.bytes.js';
import { inspectStoredWorkspaceArchive } from '../handoff/workspaceByteProvider.js';
import { RECIPIENT_V2_READ_PATH } from '../handoff/recipientV2.topology.js';
import { decodeUtf8, findFile } from '../handoff/coldStartQualification.shared.js';

const CURRENT_TASK_SCHEMA = 'tiinex.task.v1';
const MAX_ITEMS = 12;
const BLOCKING_LINEAGE_CODES = new Set([
  'lineage.target.ambiguous',
  'lineage.parent.integrityMismatch',
  'lineage.parent.selfReference',
  'lineage.parent.exactTargetNotLoaded',
  'lineage.target.outOfBoundary',
  'lineage.parent.boundaryBlocked'
]);

export function isRoutedHandoffBundle(bundle = {}) {
  return Array.isArray(bundle?.files) && bundle.files.some((file) => String(file.path || '') === RECIPIENT_V2_READ_PATH);
}

export function materializeQualifiedWorkspaceSnapshot(bundle, contextAudit, options = {}) {
  const files = [];
  const findings = [];
  for (const workspace of contextAudit?.workspaceMaterializations || []) {
    const workspaceId = String(workspace.workspaceId || '').trim();
    const archivePath = String(workspace.archivePackagePath || '').trim();
    const archiveFile = findFile(bundle, archivePath);
    if (!workspaceId || !archivePath || !archiveFile) {
      findings.push(finding('error', 'portable.grounding.workspace-snapshot.unavailable', 'A qualified Workspace snapshot archive could not be resolved from the carrier.', { workspaceId, archivePath }));
      continue;
    }
    const archive = inspectStoredWorkspaceArchive(packageFileBytes(archiveFile), { ownedBytes: true });
    if (archive.state !== 'qualified') {
      findings.push(finding('error', 'portable.grounding.workspace-snapshot.invalid', 'A carried Workspace snapshot archive is not qualified readable material.', { workspaceId, archivePath }));
      continue;
    }
    for (const entry of archive.entries || []) {
      const innerPath = String(entry.path || '').replace(/\\/g, '/');
      if (!isGroundingArtifactPath(innerPath)) continue;
      if (!options.includeLegacyTopics && /(?:^|\/)\.topics\/development(?:\/|$)/.test(innerPath)) continue;
      const content = decodeUtf8(entry.data || new Uint8Array());
      if (!content) continue;
      files.push(Object.freeze({
        path: `${workspaceId}/${innerPath}`,
        content,
        size: Number(entry.size || (entry.data?.byteLength || 0)),
        sourceMode: 'portable-handoff-workspace-snapshot'
      }));
    }
  }
  return Object.freeze({ files: Object.freeze(files), findings: Object.freeze(findings) });
}

export function projectRequiredContext(requiredContext = [], selectors = []) {
  const requested = normalizeSelectors(selectors);
  const selected = (entry) => requested.includes('all') || requested.some((selector) => requiredContextMatches(entry, selector));
  const availableBodies = requiredContext.filter((entry) => typeof entry?.content === 'string' && entry.content.length > 0).length;
  const items = requiredContext.slice(0, MAX_ITEMS).map((entry) => {
    const contentProjected = selected(entry) && typeof entry?.content === 'string';
    return Object.freeze({
      requirementId: entry.requirementId || '',
      name: entry.name || '',
      state: entry.state || '',
      workspaceId: entry.workspaceId || '',
      innerPath: entry.innerPath || entry.workspaceRelativePath || '',
      referenceTarget: entry.referenceTarget || '',
      bytes: Number(entry.bytes || entry.actualBytes || 0),
      sha256: entry.sha256 || entry.actualSha256 || '',
      contentProjected,
      ...(contentProjected ? { content: entry.content } : {})
    });
  });
  const unmatched = requested.filter((selector) => selector !== 'all' && !requiredContext.some((entry) => requiredContextMatches(entry, selector)));
  return Object.freeze({
    items: Object.freeze(items),
    itemsOmitted: Math.max(0, requiredContext.length - items.length),
    bodiesProjected: items.filter((item) => item.contentProjected).length,
    bodiesAvailable: availableBodies,
    requestedSelectors: Object.freeze(requested),
    unmatchedSelectors: Object.freeze(unmatched)
  });
}

export function normalizeSelectors(value) {
  if (!value) return Object.freeze([]);
  if (Array.isArray(value)) return Object.freeze(value.map((item) => String(item || '').trim().toLowerCase()).filter(Boolean));
  if (value === true) return Object.freeze(['all']);
  return Object.freeze(String(value).split(',').map((item) => item.trim().toLowerCase()).filter(Boolean));
}

export function resolveRequiredContextRecords(requiredContext = [], records = []) {
  const byPath = new Map(records.map((record) => [String(record.path || ''), record]));
  const ids = new Set();
  const missing = [];
  let matched = 0;
  for (const entry of requiredContext || []) {
    if (entry.state !== 'qualified') continue;
    const workspaceId = String(entry.workspaceId || '').trim();
    const innerPath = String(entry.innerPath || entry.workspaceRelativePath || '').replace(/^\/+/, '').replace(/\\/g, '/');
    if (!workspaceId || !innerPath) continue;
    const expectedPath = `${workspaceId}/${innerPath}`;
    const record = byPath.get(expectedPath);
    if (record) { ids.add(record.id); matched += 1; continue; }
    if (isExactHydratedWorkspaceContext(entry)) { matched += 1; continue; }
    missing.push(`${entry.requirementId || entry.name || expectedPath}: exact qualified context was not found at ${expectedPath} inside the complete carried Workspace snapshots.`);
  }
  return Object.freeze({ ids, matched, missing: Object.freeze(missing) });
}

function isExactHydratedWorkspaceContext(entry = {}) {
  if (String(entry.providerMode || '') !== 'archive') return false;
  if (!['hydrated-text', 'qualified-locator-only'].includes(String(entry.contentState || ''))) return false;
  const expectedBytes = Number(entry.bytes || 0);
  const actualBytes = Number(entry.actualBytes || 0);
  const expectedSha = String(entry.sha256 || '').trim().toLowerCase();
  const actualSha = String(entry.actualSha256 || '').trim().toLowerCase();
  return expectedBytes > 0 && expectedBytes === actualBytes && /^[0-9a-f]{64}$/.test(expectedSha) && expectedSha === actualSha;
}

export function resolveSelectedRouteRecords(authority = {}, records = []) {
  const route = authority?.selectedRoute || {};
  const workspaceId = String(route.workspaceId || '').trim();
  const innerPath = String(route.workspaceRelativeHandoffPath || '').replace(/^\/+/, '').replace(/\\/g, '/');
  if (!workspaceId || !innerPath) return new Set();
  const expectedPath = `${workspaceId}/${innerPath}`;
  return new Set(records.filter((record) => record.path === expectedPath).map((record) => record.id));
}

export function directedLineageCone(lineage = {}, startIds = new Set()) {
  const all = new Set((lineage.nodes || []).map((node) => node.id));
  if (!startIds.size) return new Set();
  const parents = new Map();
  const children = new Map();
  for (const edge of lineage.edges || []) {
    if (edge.kind !== 'parent' || !edge.from || !edge.to || edge.status === 'missing' || edge.status === 'mismatch') continue;
    add(parents, edge.to, edge.from);
    add(children, edge.from, edge.to);
  }
  const starts = [...startIds].filter((id) => all.has(id));
  const out = new Set(starts);
  const walk = (adjacent) => {
    const queue = [...starts];
    const seen = new Set(starts);
    while (queue.length) {
      const id = queue.shift();
      for (const next of adjacent.get(id) || []) {
        if (seen.has(next)) continue;
        seen.add(next);
        out.add(next);
        queue.push(next);
      }
    }
  };
  walk(parents);
  walk(children);
  return out;
}

export function projectRelevantTopology(lineage = {}, relevantIds = new Set(), frontierCandidates = [], routeRecordIds = new Set()) {
  const nodeById = new Map((lineage.nodes || []).map((node) => [node.id, node]));
  const parentIncoming = new Map();
  const parentOutgoing = new Map();
  for (const edge of lineage.edges || []) {
    if (edge.kind !== 'parent' || !edge.to) continue;
    if (edge.from) add(parentOutgoing, edge.from, edge);
    add(parentIncoming, edge.to, edge);
  }
  const roots = [];
  const leaves = [];
  for (const id of relevantIds) {
    const node = nodeById.get(id);
    if (!node) continue;
    const incomingResolved = (parentIncoming.get(id) || []).some((edge) => edge.from && edge.status !== 'missing' && edge.status !== 'mismatch');
    const outgoingResolved = (parentOutgoing.get(id) || []).some((edge) => edge.to && edge.status !== 'missing' && edge.status !== 'mismatch');
    const summary = nodeSummary(node);
    if (!incomingResolved) roots.push(summary);
    if (!outgoingResolved) leaves.push(summary);
  }
  const currentTasks = (frontierCandidates || [])
    .filter((item) => relevantIds.has(item.id) && item.schemaId === CURRENT_TASK_SCHEMA)
    .map((item) => Object.freeze({ id: item.id, path: item.path, title: item.title, declaredStatus: item.declaredStatus, objective: compactText(item.objective, 240) }));
  const currentTaskIds = new Set(currentTasks.map((item) => item.id));
  const routeLeaves = leaves.filter((item) => routeRecordIds.has(item.id));
  const distance = ancestorDistanceFromRoute(lineage, routeRecordIds, relevantIds);
  const rankedCurrent = currentTasks.filter((item) => distance.has(item.id)).sort((a, b) => distance.get(a.id) - distance.get(b.id));
  const nearestDistance = rankedCurrent.length ? distance.get(rankedCurrent[0].id) : Number.POSITIVE_INFINITY;
  const currentFrontier = rankedCurrent.filter((item) => distance.get(item.id) === nearestDistance);
  return Object.freeze({ roots, leaves, routeLeaves, currentTasks, currentTaskIds, currentFrontier });
}

export function relevantLineageIssues(lineage = {}, relevantIds = new Set()) {
  const issues = [];
  for (const findingEntry of lineage.findings || []) {
    if (!BLOCKING_LINEAGE_CODES.has(String(findingEntry.code || ''))) continue;
    if (findingEntry.nodeId && !relevantIds.has(findingEntry.nodeId)) continue;
    issues.push(Object.freeze({ code: findingEntry.code, severity: findingEntry.severity, nodeId: findingEntry.nodeId || '', target: findingEntry.target || '', message: findingEntry.message || '' }));
  }
  for (const edge of lineage.edges || []) {
    if (edge.kind !== 'parent' || !relevantIds.has(edge.to)) continue;
    if (!['probable', 'missing', 'mismatch'].includes(String(edge.status || ''))) continue;
    issues.push(Object.freeze({ code: `lineage.parent.${edge.status}`, severity: edge.status === 'mismatch' ? 'error' : 'warning', nodeId: edge.to, target: edge.target || '', message: `Relevant Parent edge remains ${edge.status}.` }));
  }
  return dedupeBy(issues, (item) => `${item.code}:${item.nodeId}:${item.target}`);
}

export function projectBlockers(blockers = [], currentTaskIds = new Set()) {
  return blockers.filter((item) => currentTaskIds.has(item.id)).map((item) => Object.freeze({ kind: item.kind, id: item.id, path: item.path, title: item.title, text: compactText(item.text, 240), basis: item.basis }));
}

function ancestorDistanceFromRoute(lineage = {}, routeRecordIds = new Set(), relevantIds = new Set()) {
  const parents = new Map();
  for (const edge of lineage.edges || []) {
    if (edge.kind !== 'parent' || !edge.from || !edge.to || edge.status === 'missing' || edge.status === 'mismatch') continue;
    if (!relevantIds.has(edge.from) || !relevantIds.has(edge.to)) continue;
    add(parents, edge.to, edge.from);
  }
  const distance = new Map();
  const queue = [];
  for (const id of routeRecordIds) { distance.set(id, 0); queue.push(id); }
  while (queue.length) {
    const id = queue.shift();
    const nextDistance = distance.get(id) + 1;
    for (const parentId of parents.get(id) || []) {
      if (distance.has(parentId) && distance.get(parentId) <= nextDistance) continue;
      distance.set(parentId, nextDistance);
      queue.push(parentId);
    }
  }
  return distance;
}

function isGroundingArtifactPath(value = '') {
  const path = String(value || '').toLowerCase();
  return path.endsWith('.trace.md') || path.endsWith('.workspace.md');
}
function requiredContextMatches(entry = {}, selector = '') {
  const wanted = String(selector || '').trim().toLowerCase();
  return [entry.requirementId, entry.name, entry.referenceTarget, entry.innerPath].some((value) => String(value || '').toLowerCase() === wanted);
}
function nodeSummary(node = {}) { return Object.freeze({ id: node.id || '', path: node.path || '', title: node.title || '', schemaId: node.schemaId || '', trace: node.trace || '' }); }
function finding(severity, code, message, params = {}) { return Object.freeze({ severity, code, message, source: 'tiinex.portable.grounding-readiness.v1', params }); }
function add(map, key, value) { if (!map.has(key)) map.set(key, []); map.get(key).push(value); }
function compactText(value = '', limit = 240) { const text = String(value || '').replace(/\s+/g, ' ').trim(); return text.length > limit ? `${text.slice(0, Math.max(0, limit - 1))}…` : text; }
function dedupeBy(items = [], keyFn) { const map = new Map(); for (const item of items) { const key = keyFn(item); if (!map.has(key)) map.set(key, item); } return Object.freeze([...map.values()]); }
