export function compactNode(node = {}) {
  if (!node) return null;
  return Object.freeze({
    id: node.id,
    slug: node.slug,
    kind: node.kind || 'artifact',
    status: node.status || 'included',
    title: node.title || node.id,
    path: node.path || '',
    schemaId: node.schemaId || '',
    sourceMode: node.sourceMode || '',
    boundary: node.boundary || '',
    summary: node.summary || '',
    currentCreatedAt: node.currentCreatedAt || '',
    lifecycleStatus: node.lifecycleStatus || '',
    hasContinuityContext: Boolean(node.hasContinuityContext),
    hasIntegrity: Boolean(node.hasIntegrity)
  });
}

export function hasExplicitMetadata(markdown = '', labels = []) {
  const text = String(markdown || '').toLowerCase();
  return labels.some((label) => new RegExp(`(^|[\\n#*_ -])${escapeRegExp(label.toLowerCase())}([\\s:#*_ -]|$)`).test(text));
}

export function compareLatest(nodeById) {
  return (a, b) => {
    const an = nodeById.get(a) || {};
    const bn = nodeById.get(b) || {};
    const at = Number(an.liveTouch?.latestTurnSequence || 0);
    const bt = Number(bn.liveTouch?.latestTurnSequence || 0);
    if (bt !== at) return bt - at;
    const ad = Date.parse(an.currentCreatedAt || '') || 0;
    const bd = Date.parse(bn.currentCreatedAt || '') || 0;
    if (bd !== ad) return bd - ad;
    return compareNodeOrder(nodeById)(a, b);
  };
}

export function compareNodeOrder(nodeById) {
  return (a, b) => {
    const an = typeof a === 'string' ? nodeById.get(a) || { id: a } : a;
    const bn = typeof b === 'string' ? nodeById.get(b) || { id: b } : b;
    return String(an.path || an.title || an.id).localeCompare(String(bn.path || bn.title || bn.id));
  };
}

export function compareEdges(a = {}, b = {}) {
  return [a.relation, a.from || '', a.to || '', a.status || ''].join('|').localeCompare([b.relation, b.from || '', b.to || '', b.status || ''].join('|'));
}

export function normalizeList(value = []) { return (Array.isArray(value) ? value : String(value || '').split(',')).map((entry) => String(entry || '').trim()).filter(Boolean); }
export function positiveInteger(value, fallback) { const number = Number.parseInt(value, 10); return Number.isFinite(number) && number > 0 ? number : fallback; }
export function truncate(value = '', max = 220) { const text = String(value || '').replace(/\s+/g, ' ').trim(); return text.length <= max ? text : `${text.slice(0, max - 1)}…`; }
export function slugFromPath(value = '') { const last = String(value || '').split('/').filter(Boolean).pop() || String(value || ''); return last.toLowerCase().replace(/\.trace\.md$/i, '').replace(/\.(md|markdown)$/i, ''); }
export function compareIds(a, b) { return String(a).localeCompare(String(b)); }

function escapeRegExp(value = '') { return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
