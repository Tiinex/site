function nodeLabel(node = {}) {
  const schema = node.schemaId ? ` [${node.schemaId}]` : '';
  const path = node.path ? ` (${node.path})` : '';
  return `${node.title || node.id}${schema}${path}`;
}

function compareNodeOrder(nodeById) {
  return (a, b) => {
    const an = typeof a === 'string' ? nodeById.get(a) || { id: a } : a;
    const bn = typeof b === 'string' ? nodeById.get(b) || { id: b } : b;
    return String(an.path || an.title || an.id).localeCompare(String(bn.path || bn.title || bn.id));
  };
}

function escapeMermaid(value = '') { return String(value).replace(/["<>]/g, ''); }
function escapeDot(value = '') { return String(value).replace(/\\/g, '\\\\').replace(/"/g, '\"'); }
function mermaidId(value = '') { return `n_${String(value || '').replace(/[^A-Za-z0-9_]/g, '_')}`; }

export function renderTextMap(model, graph, scope, findings, manifest = {}) {
  const lines = [];
  lines.push('Tiinex lineage print');
  lines.push(`Scope: ${scope}`);
  lines.push(`Artifacts: ${model.nodes.length} | Selected: ${graph.nodes.length} | Roots: ${model.roots.length} | Leaves: ${model.leaves.length} | Parent edges: ${model.parentEdges.length}`);
  if (model.live.processedTurnCount) lines.push(`Live receipts: processed turns ${model.live.processedTurnCount}, artifact-change turns ${model.live.artifactChangeTurnCount}, prepare turns ${model.live.preparedTurnCount}`);
  const warningCount = findings.filter((finding) => finding.severity === 'warning' || finding.severity === 'error').length;
  lines.push(`Findings: ${findings.length}${warningCount ? ` (${warningCount} warning/error)` : ''}`);
  lines.push('');
  lines.push('Tree');
  const printed = new Set();
  const selected = new Set(graph.nodes.map((node) => node.id));
  const roots = graph.nodes.filter((node) => !model.parentByChild.has(node.id) || !selected.has(model.parentByChild.get(node.id))).map((node) => node.id).sort(compareNodeOrder(model.nodeById));
  for (const root of roots) printSubtree(lines, model, selected, root, '', printed);
  for (const node of graph.nodes) {
    if (printed.has(node.id)) continue;
    lines.push(`└─ ${nodeLabel(node)}`);
    printed.add(node.id);
  }
  if (!graph.nodes.length) lines.push('└─ (no selected loaded artifacts)');
  const hidden = graph.edges.filter((edge) => edge.status === 'hidden-intermediate' || edge.status === 'missing-parent' || edge.status === 'known-but-excluded');
  if (hidden.length) {
    lines.push('');
    lines.push('Lineage gaps / scoped edges');
    for (const edge of hidden) lines.push(`- ${edge.status}: ${edge.from || '(missing)'} → ${edge.to || '(missing)'}${edge.hiddenCount ? ` (${edge.hiddenCount} hidden)` : ''}`);
  }
  if (findings.length) {
    lines.push('');
    lines.push('Findings');
    for (const finding of findings) lines.push(`- ${finding.severity}: ${finding.code}`);
  }
  return lines.join('\n');
}

function printSubtree(lines, model, selected, id, prefix, printed) {
  const node = model.nodeById.get(id);
  if (!node || printed.has(id) || !selected.has(id)) return;
  const selectedChildren = (model.childrenByParent.get(id) || []).filter((child) => selected.has(child)).sort(compareNodeOrder(model.nodeById));
  const connector = prefix ? '└─ ' : '└─ ';
  lines.push(`${prefix}${connector}${nodeLabel(node)}`);
  printed.add(id);
  selectedChildren.forEach((child, index) => {
    const nextPrefix = `${prefix}${index === selectedChildren.length - 1 ? '   ' : '│  '}`;
    printSubtree(lines, model, selected, child, nextPrefix, printed);
  });
}

export function renderMermaid(graph = {}) {
  const lines = ['graph TD'];
  for (const node of graph.nodes || []) lines.push(`  ${mermaidId(node.id)}["${escapeMermaid(node.title || node.id)}"]`);
  for (const edge of graph.edges || []) {
    if (!edge.from || !edge.to) continue;
    const arrow = edge.status === 'hidden-intermediate' ? '-. hidden .->' : '-->';
    lines.push(`  ${mermaidId(edge.from)} ${arrow} ${mermaidId(edge.to)}`);
  }
  return lines.join('\n');
}

export function renderDot(graph = {}) {
  const lines = ['digraph tiinex_lineage {', '  rankdir=TB;'];
  for (const node of graph.nodes || []) lines.push(`  "${escapeDot(node.id)}" [label="${escapeDot(node.title || node.id)}"];`);
  for (const edge of graph.edges || []) {
    if (!edge.from || !edge.to) continue;
    const style = edge.status === 'hidden-intermediate' ? ' [style=dashed,label="hidden"]' : '';
    lines.push(`  "${escapeDot(edge.from)}" -> "${escapeDot(edge.to)}"${style};`);
  }
  lines.push('}');
  return lines.join('\n');
}

