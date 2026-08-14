import { resolveLineage } from '../../../lineage/lineage.resolve.js';
import { normalizePortableInput } from '../input/portable.input.js';
import { portableFinding, summarizePortableFindings } from '../findings.js';
import { renderDot, renderMermaid, renderTextMap } from './lineage.print.render.js';
import { compactNode, compareEdges, compareIds, compareLatest, compareNodeOrder, hasExplicitMetadata, normalizeList, positiveInteger, slugFromPath, truncate } from './lineage.print.utils.js';

export const PORTABLE_LINEAGE_PRINT_SCHEMA_ID = 'tiinex.portable.lineage-print.v1';
export const PORTABLE_LINEAGE_PRINT_REQUEST_SCHEMA_ID = 'tiinex.portable.lineage-print.request.v1';

const SUPPORTED_SCOPES = Object.freeze(['all', 'leaves', 'latest-leaves', 'node-ancestors', 'node-neighborhood', 'segment', 'export-scope']);
const BOUNDARY = Object.freeze({
  projectionOnly: true,
  sourceMutation: false,
  stateMutation: false,
  remoteFetch: false,
  packageMutation: false,
  loadedOnly: true,
  rawMarkdownIncluded: false,
  notSourceTruth: true
});

export function printPortableLineage(input = {}, options = {}) {
  const scope = normalizeScope(input.scope || options.scope || 'all');
  if (!SUPPORTED_SCOPES.includes(scope)) {
    const findings = [portableFinding('error', 'lineage-print.scope.unsupported', 'Lineage print scope is not supported.', { scope, supportedScopes: SUPPORTED_SCOPES })];
    return projectionResult({ scope, findings, status: 'blocked' });
  }

  const material = normalizePortableInput(input.materials || input);
  const manifest = parseManifest(input);
  const resolved = resolveLineage(material.records || [], { depth: 'portable-lineage-print' });
  const model = buildProjectionModel(material.records || [], resolved, manifest);
  const selection = selectScope(model, {
    scope,
    focusId: input.focusArtifactId || input.focusId || input.focus || options.focusId || options.startId || '',
    fromId: input.fromArtifactId || input.fromId || input.from || '',
    toId: input.toArtifactId || input.toId || input.to || '',
    artifactIds: normalizeList(input.artifactIds || input.artifacts || options.artifactIds),
    latestLimit: positiveInteger(input.latestLimit || input.limit || options.latestLimit, 5)
  });
  const graph = buildScopedGraph(model, selection, scope);
  const findings = [
    ...(material.findings || []),
    ...normalizeLineageFindings(resolved.findings || []),
    ...(selection.findings || []),
    ...graph.findings,
    ...diagnosticFindings(model, graph, manifest)
  ];
  const allFindings = dedupeByCodeRef(findings);
  const outputFormats = new Set(normalizeList(input.outputFormats || input.formats || options.outputFormats));
  const includeMermaid = outputFormats.has('mermaid') || outputFormats.has('mmd');
  const includeDot = outputFormats.has('dot');
  const textMap = renderTextMap(model, graph, scope, allFindings, manifest);
  return projectionResult({
    scope,
    status: allFindings.some((finding) => finding.severity === 'error') ? 'partial' : 'ready',
    material,
    model,
    graph,
    textMap,
    findings: allFindings,
    exportPreview: buildExportPreview(model, graph, scope, normalizeList(input.artifactIds || input.artifacts || options.artifactIds)),
    manifestSummary: manifestSummary(manifest),
    mermaid: includeMermaid ? renderMermaid(graph) : undefined,
    dot: includeDot ? renderDot(graph) : undefined
  });
}

function projectionResult({ scope = 'all', status = 'ready', material = {}, model = emptyModel(), graph = emptyGraph(), textMap = '', findings = [], exportPreview = null, manifestSummary: manifest = null, mermaid, dot }) {
  const findingSummary = summarizePortableFindings(findings);
  return Object.freeze({
    schema: PORTABLE_LINEAGE_PRINT_SCHEMA_ID,
    status,
    scope,
    stats: Object.freeze({
      artifacts: model.records.length,
      selectedArtifacts: graph.nodes.filter((node) => node.kind === 'artifact' && node.status === 'included').length,
      roots: model.roots.length,
      leaves: model.leaves.length,
      parentEdges: model.parentEdges.length,
      missingParentEdges: model.missingParentEdges.length,
      hiddenEdges: graph.edges.filter((edge) => edge.status === 'hidden-intermediate' || edge.status === 'known-but-excluded').length,
      liveProcessedTurns: model.live.processedTurnCount,
      liveArtifactChangeTurns: model.live.artifactChangeTurnCount
    }),
    graph: Object.freeze({ nodes: Object.freeze(graph.nodes), edges: Object.freeze(graph.edges) }),
    textMap,
    latestLeaves: Object.freeze(model.latestLeaves.map((id) => compactNode(model.nodeById.get(id))).filter(Boolean)),
    roots: Object.freeze(model.roots.map((id) => compactNode(model.nodeById.get(id))).filter(Boolean)),
    leaves: Object.freeze(model.leaves.map((id) => compactNode(model.nodeById.get(id))).filter(Boolean)),
    exportPreview: exportPreview ? Object.freeze(exportPreview) : undefined,
    manifestSummary: manifest ? Object.freeze(manifest) : undefined,
    ...(mermaid ? { mermaid } : {}),
    ...(dot ? { dot } : {}),
    findings: Object.freeze(findings),
    findingSummary,
    boundary: BOUNDARY
  });
}

function buildProjectionModel(records = [], resolved = {}, manifest = {}) {
  const nodes = (resolved.nodes || []).map((node, index) => normalizeNode(node, records[index] || node.record || {}, index));
  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const edges = (resolved.edges || []).map(normalizeEdge).sort(compareEdges);
  const parentEdges = edges.filter((edge) => edge.relation === 'parent' && edge.from && edge.to && edge.status !== 'missing');
  const missingParentEdges = edges.filter((edge) => edge.relation === 'parent' && (!edge.from || edge.status === 'missing'));
  const parentByChild = new Map();
  const childrenByParent = new Map();
  for (const edge of parentEdges) {
    parentByChild.set(edge.to, edge.from);
    if (!childrenByParent.has(edge.from)) childrenByParent.set(edge.from, []);
    childrenByParent.get(edge.from).push(edge.to);
  }
  for (const children of childrenByParent.values()) children.sort(compareIds);
  const roots = nodes.filter((node) => !parentByChild.has(node.id)).map((node) => node.id).sort(compareNodeOrder(nodeById));
  const leaves = nodes.filter((node) => !(childrenByParent.get(node.id) || []).length).map((node) => node.id).sort(compareNodeOrder(nodeById));
  const live = liveStats(manifest, nodes);
  const latestLeaves = [...leaves].sort(compareLatest(nodeById, live));
  return Object.freeze({ records, nodes, nodeById, edges, parentEdges, missingParentEdges, parentByChild, childrenByParent, roots, leaves, latestLeaves, live });
}

function normalizeNode(node = {}, record = {}, index = 0) {
  const id = String(node.id || record.id || record.path || `lineage-node-${index + 1}`);
  const slug = slugFromPath(record.path || node.path || id);
  const liveTouch = { latestTurnSequence: 0, latestObservedAt: '' };
  return {
    id,
    slug,
    kind: 'artifact',
    status: 'included',
    title: String(node.title || record.title || record.path || id),
    path: String(node.path || record.path || ''),
    schemaId: String(node.schemaId || record.schemaId || record.kind || ''),
    sourceMode: String(node.sourceMode || record.sourceMode || ''),
    boundary: String(node.boundary || record.boundary || record.source?.boundary || 'Portable local material; no GitHub provenance inferred.'),
    summary: truncate(String(record.summary || node.record?.summary || ''), 220),
    currentCreatedAt: String(record.currentCreatedAt || ''),
    lifecycleStatus: String(record.lifecycleStatus || ''),
    hasContinuityContext: Boolean(record.hasContinuityContext || node.hasContinuityContext),
    hasIntegrity: Boolean(record.hasIntegrity || node.hasIntegrity),
    hasAuthorshipMetadata: hasExplicitMetadata(record.markdown, ['author', 'authors', 'contributor', 'contributors', 'authorship']),
    hasReductionMetadata: hasExplicitMetadata(record.markdown, ['reduction', 'reducer', 'reduced from', 'selection rule', 'known losses']),
    hasSourceSpanMetadata: hasExplicitMetadata(record.markdown, ['source span', 'source-span', 'source range', 'covers turns', 'source turns']),
    liveTouch
  };
}

function normalizeEdge(edge = {}) {
  return Object.freeze({
    id: String(edge.id || `${edge.kind || 'edge'}:${edge.from || 'missing'}->${edge.to || 'missing'}`),
    from: String(edge.from || ''),
    to: String(edge.to || ''),
    relation: String(edge.kind || edge.relation || 'parent'),
    status: edge.status === 'missing' ? 'missing' : String(edge.status || 'included'),
    target: String(edge.target || ''),
    source: 'declared-lineage',
    label: String(edge.label || edge.kind || 'edge')
  });
}

function selectScope(model, request = {}) {
  const findings = [];
  let selected = new Set();
  const artifactIds = resolveArtifactIds(model, request.artifactIds || []);
  if (request.scope === 'all') selected = new Set(model.nodes.map((node) => node.id));
  else if (request.scope === 'export-scope') selected = new Set(artifactIds.length ? artifactIds : model.nodes.map((node) => node.id));
  else if (request.scope === 'leaves') selected = idsWithAncestors(model, model.leaves);
  else if (request.scope === 'latest-leaves') selected = idsWithAncestors(model, model.latestLeaves.slice(0, request.latestLimit || 5));
  else if (request.scope === 'node-ancestors') {
    const focus = resolveArtifactId(model, request.focusId);
    if (!focus) findings.push(portableFinding('error', 'lineage-print.focus-missing', 'node-ancestors scope requires a loaded focus artifact id/path/slug.', { ref: request.focusId || '' }));
    selected = focus ? idsWithAncestors(model, [focus]) : new Set();
  } else if (request.scope === 'node-neighborhood') {
    const focus = resolveArtifactId(model, request.focusId);
    if (!focus) findings.push(portableFinding('error', 'lineage-print.focus-missing', 'node-neighborhood scope requires a loaded focus artifact id/path/slug.', { ref: request.focusId || '' }));
    selected = focus ? neighborhoodIds(model, focus) : new Set();
  } else if (request.scope === 'segment') {
    const from = resolveArtifactId(model, request.fromId);
    const to = resolveArtifactId(model, request.toId);
    if (!from || !to) findings.push(portableFinding('error', 'lineage-print.segment-endpoint-missing', 'segment scope requires loaded from/to artifact ids, paths, or slugs.', { from: request.fromId || '', to: request.toId || '' }));
    selected = from && to ? segmentIds(model, from, to, findings) : new Set();
  }
  return Object.freeze({ ids: selected, findings });
}

function buildScopedGraph(model, selection, scope = 'all') {
  const selected = selection.ids || new Set();
  const findings = [];
  const nodes = [...selected].map((id) => model.nodeById.get(id)).filter(Boolean).sort(compareNodeOrder(model.nodeById)).map(compactNode);
  const edgeKeys = new Set();
  const edges = [];
  function addEdge(edge) {
    const key = [edge.relation, edge.from || '', edge.to || '', edge.status || '', edge.hiddenCount || 0].join(':');
    if (edgeKeys.has(key)) return;
    edgeKeys.add(key);
    edges.push(Object.freeze(edge));
  }
  for (const edge of model.parentEdges) {
    if (selected.has(edge.from) && selected.has(edge.to)) addEdge({ ...edge, status: 'included' });
  }
  for (const id of selected) {
    const hidden = hiddenParentPathToSelectedAncestor(model, id, selected);
    if (hidden.hiddenCount > 0 && hidden.ancestorId) {
      addEdge({
        id: `parent-path:${hidden.ancestorId}->${id}`,
        from: hidden.ancestorId,
        to: id,
        relation: 'parent-path',
        status: 'hidden-intermediate',
        hiddenCount: hidden.hiddenCount,
        hiddenIds: Object.freeze(hidden.hiddenIds),
        reason: 'selection-scope',
        source: 'declared-lineage-selection'
      });
      findings.push(portableFinding('info', 'lineage-print.hidden-intermediate', 'Projection hides one or more loaded intermediate lineage nodes; no direct parent edge is implied.', { nodeId: id, ancestorId: hidden.ancestorId, hiddenCount: hidden.hiddenCount, scope }));
    } else if (hidden.hiddenCount > 0) {
      findings.push(portableFinding('info', 'lineage-print.hidden-by-scope', 'Projection omits a loaded parent because it is outside the selected scope.', { nodeId: id, hiddenCount: hidden.hiddenCount, scope }));
    }
  }
  for (const edge of model.missingParentEdges) {
    if (!selected.has(edge.to)) continue;
    addEdge({ ...edge, from: null, status: 'missing-parent', reason: 'declared-parent-not-loaded' });
    findings.push(portableFinding('warning', 'lineage-print.parent.missing', 'A selected artifact declares a parent that is not loaded.', { nodeId: edge.to, target: edge.target }));
  }
  return Object.freeze({ nodes: Object.freeze(nodes), edges: Object.freeze(edges.sort(compareEdges)), findings: Object.freeze(findings) });
}

function diagnosticFindings(model, graph, manifest = {}) {
  const findings = [];
  const live = model.live;
  if (live.processedTurnCount >= 3 && live.artifactChangeTurnCount >= 2 && model.nodes.length <= 1 && model.parentEdges.length === 0) {
    findings.push(portableFinding('warning', 'lineage-print.overcompression.possible', 'Many live turns changed artifacts, but the loaded export contains one or fewer artifacts and no child lineage.', {
      processedTurnCount: live.processedTurnCount,
      artifactChangeTurnCount: live.artifactChangeTurnCount,
      artifactCount: model.nodes.length,
      parentEdges: model.parentEdges.length
    }));
    if (!model.nodes.some((node) => node.hasReductionMetadata)) findings.push(portableFinding('info', 'lineage-print.reduction.capability-missing', 'Compression risk is present, but no explicit reduction metadata/capability is visible in the loaded artifacts.')); 
    if (!model.nodes.some((node) => node.hasSourceSpanMetadata)) findings.push(portableFinding('warning', 'lineage-print.source-span.metadata-missing', 'Compression risk is present, but no explicit source-span metadata is visible in the loaded artifacts.'));
  }
  if (model.nodes.length && !model.nodes.some((node) => node.hasAuthorshipMetadata)) findings.push(portableFinding('info', 'lineage-print.authorship.metadata-missing', 'No explicit authorship/contributor metadata was found in loaded artifact envelopes or body fields.'));
  if (manifest?.liveOperations?.boundary?.rawMarkdownIncluded === true) findings.push(portableFinding('warning', 'lineage-print.boundary.raw-markdown-reported', 'Manifest reports raw Markdown was included in live-operation boundary; projection output still omits raw Markdown.'));
  return findings;
}

function buildExportPreview(model, graph, scope, requestedIds = []) {
  const selected = graph.nodes.filter((node) => node.kind === 'artifact' && node.status === 'included');
  const requested = resolveArtifactIds(model, requestedIds);
  return Object.freeze({
    schema: 'tiinex.portable.lineage-print.export-preview.v1',
    mode: scope === 'export-scope' ? 'selected-export-scope' : 'loaded-material-summary',
    requestedArtifactIds: Object.freeze(requested),
    selectedArtifactIds: Object.freeze(selected.map((node) => node.id)),
    selectedArtifactCount: selected.length,
    loadedArtifactCount: model.nodes.length,
    packageMutation: false,
    exportReceiptCreated: false,
    rawMarkdownIncluded: false,
    obviousBlockers: Object.freeze(selected.length ? [] : ['no-selected-artifacts'])
  });
}

function manifestSummary(manifest = {}) {
  if (!manifest || !Object.keys(manifest).length) return null;
  const live = liveStats(manifest, []);
  return Object.freeze({
    schema: 'tiinex.portable.lineage-print.manifest-summary.v1',
    hasManifest: true,
    liveOperations: Object.freeze({
      processedTurnCount: live.processedTurnCount,
      preparedTurnCount: live.preparedTurnCount,
      artifactChangeTurnCount: live.artifactChangeTurnCount,
      noArtifactChangeTurnCount: live.noArtifactChangeTurnCount,
      latestTurnSequence: live.latestTurnSequence,
      latestEventSequence: live.latestEventSequence,
      providerInterleaving: manifest.liveOperations?.qualification?.providerInterleaving || manifest.liveOperations?.boundary?.providerInterleavingQualification || ''
    }),
    boundary: manifest.boundary || null,
    lineage: manifest.lineage || null
  });
}

function liveStats(manifest = {}, nodes = []) {
  const liveOperations = manifest.liveOperations || {};
  const receipts = Array.isArray(liveOperations.receipts) ? liveOperations.receipts : [];
  const updateReceipts = receipts.filter((receipt) => receipt.operation === 'update-live-lineage');
  const prepareReceipts = receipts.filter((receipt) => receipt.operation === 'prepare-live-response');
  const artifactChange = updateReceipts.filter((receipt) => receipt.decision === 'artifact-change');
  const noArtifactChange = updateReceipts.filter((receipt) => receipt.decision === 'no-artifact-change');
  const touchesBySlug = new Map();
  for (const receipt of updateReceipts) {
    for (const artifactId of Array.isArray(receipt.artifactIds) ? receipt.artifactIds : []) {
      const key = String(artifactId || '').trim();
      if (!key) continue;
      const current = touchesBySlug.get(key) || { latestTurnSequence: 0, latestObservedAt: '' };
      const turnSequence = Number(receipt.turnSequence || 0);
      if (turnSequence >= current.latestTurnSequence) touchesBySlug.set(key, { latestTurnSequence: turnSequence, latestObservedAt: receipt.observedAt || current.latestObservedAt });
    }
  }
  for (const node of nodes) {
    const touch = touchesBySlug.get(node.slug) || touchesBySlug.get(node.id) || touchesBySlug.get(slugFromPath(node.path));
    if (touch) node.liveTouch = touch;
  }
  return Object.freeze({
    processedTurnCount: Number(liveOperations.latestTurnSequence || updateReceipts.length || liveOperations.counts?.['update-live-lineage'] || 0),
    preparedTurnCount: Number(liveOperations.preparedTurnSequence || prepareReceipts.length || liveOperations.counts?.['prepare-live-response'] || 0),
    artifactChangeTurnCount: artifactChange.length,
    noArtifactChangeTurnCount: noArtifactChange.length,
    latestTurnSequence: Number(liveOperations.latestTurnSequence || 0),
    latestEventSequence: Number(liveOperations.latestEventSequence || 0)
  });
}

function parseManifest(input = {}) {
  const files = Array.isArray(input.files) ? input.files : [];
  const manifests = files.filter((file) => /(^|\/)manifest\.json$/i.test(String(file.path || file.name || '')) && typeof (file.content || file.markdown) === 'string');
  for (const file of manifests) {
    try { return JSON.parse(file.content || file.markdown || '{}'); }
    catch { /* ignore invalid manifest */ }
  }
  if (input.manifest && typeof input.manifest === 'object') return input.manifest;
  return {};
}

function normalizeLineageFindings(findings = []) {
  return findings.map((finding) => portableFinding(finding.severity || 'info', finding.code || 'lineage.finding', finding.message || 'Lineage finding.', { nodeId: finding.nodeId || '', target: finding.target || '', source: finding.source || 'tiinex.lineage.v1' }));
}

function idsWithAncestors(model, ids = []) {
  const out = new Set();
  for (const id of ids) {
    let current = id;
    while (current && !out.has(current)) {
      out.add(current);
      current = model.parentByChild.get(current) || '';
    }
  }
  return out;
}

function neighborhoodIds(model, id) {
  const out = idsWithAncestors(model, [id]);
  for (const child of model.childrenByParent.get(id) || []) out.add(child);
  const parent = model.parentByChild.get(id);
  if (parent) for (const sibling of model.childrenByParent.get(parent) || []) out.add(sibling);
  return out;
}

function segmentIds(model, from, to, findings) {
  const path = [];
  let current = to;
  while (current) {
    path.push(current);
    if (current === from) return new Set(path.reverse());
    current = model.parentByChild.get(current) || '';
  }
  findings.push(portableFinding('warning', 'lineage-print.segment.not-connected', 'No loaded parent path connects the requested segment endpoints.', { from, to }));
  return new Set([from, to]);
}

function hiddenParentPathToSelectedAncestor(model, id, selected) {
  let current = model.parentByChild.get(id) || '';
  const hiddenIds = [];
  while (current) {
    if (selected.has(current)) return { ancestorId: current, hiddenCount: hiddenIds.length, hiddenIds };
    hiddenIds.push(current);
    current = model.parentByChild.get(current) || '';
  }
  return { ancestorId: '', hiddenCount: hiddenIds.length, hiddenIds };
}

function resolveArtifactIds(model, values = []) {
  return values.map((value) => resolveArtifactId(model, value)).filter(Boolean);
}

function resolveArtifactId(model, value = '') {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (model.nodeById.has(raw)) return raw;
  const lower = raw.toLowerCase();
  const match = model.nodes.find((node) => node.path.toLowerCase() === lower || node.path.toLowerCase().endsWith(lower) || node.slug === lower || node.title.toLowerCase() === lower);
  return match?.id || '';
}

function normalizeScope(value = '') { return String(value || 'all').trim() || 'all'; }
function emptyModel() { return { records: [], nodes: [], nodeById: new Map(), edges: [], parentEdges: [], missingParentEdges: [], roots: [], leaves: [], latestLeaves: [], live: liveStats({}, []) }; }
function emptyGraph() { return { nodes: [], edges: [], findings: [] }; }
function dedupeByCodeRef(findings = []) {
  const seen = new Set();
  const out = [];
  for (const finding of findings) {
    const key = [finding.code, finding.evidencePath || finding.ref || finding.nodeId || '', finding.target || '', finding.scope || '', finding.ancestorId || ''].join(':');
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(finding);
  }
  return out;
}
