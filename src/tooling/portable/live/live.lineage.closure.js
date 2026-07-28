import { resolveLineage } from '../../../lineage/lineage.resolve.js';

export function buildPortableLiveLineageClosure(material = {}, selected = []) {
  const records = (material.records || []).filter((record) => record.path && record.markdown && (record.hasContinuityContext || record.schemaId || String(record.kind || '').startsWith('tiinex.')));
  const lineage = resolveLineage(records, { depth: 'portable-live-lineage-export' });
  const nodeById = new Map((lineage.nodes || []).map((node) => [node.id, node]));
  const nodeByPath = new Map((lineage.nodes || []).map((node) => [String(node.path || ''), node]));
  const selectedLoaded = collectLoadedParents(selected, lineage, nodeById, nodeByPath);
  const context = [...selectedLoaded]
    .map((id) => nodeById.get(id))
    .filter(Boolean)
    .map((node) => Object.freeze({
      id: node.id,
      path: node.path,
      schemaId: node.schemaId,
      markdown: String(node.record?.markdown || ''),
      trace: String(node.trace || ''),
      parentSchemaId: String(node.parentSchemaId || ''),
      sourceMode: String(node.sourceMode || ''),
      boundary: String(node.boundary || '')
    }))
    .sort((a, b) => a.path.localeCompare(b.path));
  const edges = collectEdges(selected, lineage, selectedLoaded, nodeById, nodeByPath);
  return Object.freeze({
    schema: 'tiinex.portable.lineage-closure.v1',
    context: Object.freeze(context),
    edges: Object.freeze(uniqueEdges(edges)),
    boundary: 'Minimum known Parent closure for live artifacts. Exact loaded Parent bytes are preserved as unchanged context.'
  });
}

function collectLoadedParents(selected, lineage, nodeById, nodeByPath) {
  const selectedLoaded = new Set();
  const queue = selected.filter((entry) => entry.parentRef.startsWith('loaded:')).map((entry) => entry.parentRef.slice(7));
  while (queue.length) {
    const ref = queue.shift();
    const node = nodeByPath.get(ref) || nodeById.get(ref);
    if (!node || selectedLoaded.has(node.id)) continue;
    selectedLoaded.add(node.id);
    for (const edge of lineage.edges || []) if (edge.kind === 'parent' && edge.to === node.id && edge.from) queue.push(edge.from);
  }
  return selectedLoaded;
}

function collectEdges(selected, lineage, selectedLoaded, nodeById, nodeByPath) {
  const selectedById = new Map(selected.map((entry) => [entry.id, entry]));
  const edges = [];
  for (const edge of lineage.edges || []) {
    if (edge.kind !== 'parent' || !selectedLoaded.has(edge.from) || !selectedLoaded.has(edge.to)) continue;
    const parent = nodeById.get(edge.from);
    const child = nodeById.get(edge.to);
    if (parent?.path && child?.path) edges.push({ childPath: child.path, parentPath: parent.path, parentKind: 'loaded-context' });
  }
  for (const entry of selected) {
    if (entry.parentRef.startsWith('live:')) {
      const parent = selectedById.get(entry.parentRef.slice(5));
      if (parent) edges.push({ childPath: entry.path, parentPath: parent.path, parentKind: 'created-live' });
    } else if (entry.parentRef.startsWith('loaded:')) {
      const ref = entry.parentRef.slice(7);
      const parent = nodeByPath.get(ref) || nodeById.get(ref);
      if (parent?.path) edges.push({ childPath: entry.path, parentPath: parent.path, parentKind: 'loaded-context' });
    }
  }
  return edges;
}

function uniqueEdges(edges) {
  const map = new Map();
  for (const edge of edges) map.set(`${edge.childPath}\0${edge.parentPath}`, Object.freeze(edge));
  return [...map.values()].sort((a, b) => `${a.childPath}\0${a.parentPath}`.localeCompare(`${b.childPath}\0${b.parentPath}`));
}
