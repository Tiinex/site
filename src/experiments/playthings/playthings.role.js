export function artifactRoleLabel(record = {}) {
  const direct = String(record?.currentAuthors || record?.authors || '').trim();
  if (direct) return direct;
  const markdown = String(record?.markdown || '');
  const raw = markdown.match(/^\s*-\s*Authors:\s*(.+?)\s*$/mi)?.[1]?.trim() || '';
  const link = raw.match(/^\[([^\]]+)\]\([^)]+\)$/);
  return (link?.[1] || raw).replace(/[*_`]/g, '').trim();
}

export function normalizeRoleIdentity(value = '') { return String(value || '').trim().toLowerCase().replace(/\s+/g, ' '); }

export function lineageActorForHead(headKey, artifactByKey, parentByChild, childrenByParent) {
  const ancestry = [];
  let cursor = headKey;
  const seen = new Set();
  while (cursor && !seen.has(cursor)) { seen.add(cursor); ancestry.push(cursor); cursor = parentByChild.get(cursor) || ''; }
  ancestry.reverse();
  const head = artifactByKey.get(headKey) || {};
  const branchPoints = ancestry.filter((key) => (childrenByParent.get(key) || []).length > 1);
  const roleArtifact = ancestry.slice().reverse().map((key) => artifactByKey.get(key)).find((artifact) => artifact?.roleIdentity) || null;
  const actorId = stableLineageActorId(ancestry, childrenByParent);
  return Object.freeze({
    id: actorId, headKey, verseId: head.verseId || '', repo: head.repo || '', label: head.title || head.path || headKey,
    schemaId: head.schemaId || '', visualKind: head.visualKind || 'relic', roleIdentity: roleArtifact?.roleIdentity || '', roleLabel: roleArtifact?.roleLabel || '',
    presentationSeed: (artifactByKey.get(ancestry[0]) || head).presentationSeed || ancestry[0] || headKey, ancestry: Object.freeze(ancestry),
    generations: Math.max(0, ancestry.length - 1), branchDepth: branchPoints.length
  });
}

export function stableLineageActorId(ancestry = [], childrenByParent = new Map()) {
  const keys = Array.isArray(ancestry) ? ancestry.filter(Boolean) : [];
  if (!keys.length) return 'lineage:unknown';
  const anchors = [keys[0]];
  for (let index = 1; index < keys.length; index += 1) {
    const parentKey = keys[index - 1];
    const siblings = childrenByParent.get(parentKey) || [];
    if (siblings.length > 1 && siblings[0] !== keys[index]) anchors.push(keys[index]);
  }
  return `lineage:${anchors.join('>')}`;
}
