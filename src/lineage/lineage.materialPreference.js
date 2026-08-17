export function preferredLineageMaterialCandidates(nodes = [], method = '') {
  const unique = uniqueNodes(nodes || []);
  if (unique.length <= 1) return unique;
  const text = String(method || '');
  const publicationIdentity = text.includes('provenance') || text.includes('issue-local') || text.includes('github-comment') || text.includes('github-issue');
  if (!publicationIdentity) return unique;
  const embedded = unique.filter((node) => isEmbeddedRecoveredArtifact(node));
  return embedded.length ? embedded : unique;
}
function isEmbeddedRecoveredArtifact(node = {}) {
  const record = node.record || {};
  const mode = String(record.sourceMode || node.sourceMode || '').toLowerCase();
  const kind = String(record.recoveryKind || record.sourceTarget?.targetKind || record.snapshot?.sourceKind || '').toLowerCase();
  return Boolean(record.snapshot?.embedded || mode.includes('embedded-artifact') || kind.includes('embedded') || kind.includes('recovered'));
}
function uniqueNodes(nodes = []) {
  const seen = new Set();
  const out = [];
  for (const node of Array.isArray(nodes) ? nodes : []) {
    const key = node?.id || node?.path || JSON.stringify(node || {});
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(node);
  }
  return out;
}
