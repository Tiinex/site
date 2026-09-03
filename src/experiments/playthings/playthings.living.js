export const PLAYTHINGS_LIVING_SCHEMA = 'tiinex.playthings.living-projection.experimental.v1';

/**
 * Presentation-only living lineage projection.
 *
 * Tiinex Parent edges remain untouched in the semantic model. Schema documents
 * stay observable history/blueprints, but they never become living Playthings
 * and never terminate a living actor merely by being the latest semantic child.
 * When a non-schema artifact continues through one or more schema documents,
 * the physical Plaything presentation may continue from the nearest earlier
 * non-schema ancestor without rewriting or inventing Parent.
 */
export function buildPlaythingsLivingProjection(artifactsInput = [], edgesInput = []) {
  const artifacts = Array.isArray(artifactsInput) ? artifactsInput : [];
  const artifactByKey = new Map(artifacts.map((artifact) => [String(artifact?.key || ''), artifact]));
  const semanticParentByChild = new Map((edgesInput || [])
    .filter((edge) => edge?.kind === 'parent' && artifactByKey.has(String(edge.from || '')) && artifactByKey.has(String(edge.to || '')))
    .map((edge) => [String(edge.to || ''), String(edge.from || '')]));

  const livingKeys = artifacts.filter(isLivingPlaythingsArtifact).map((artifact) => String(artifact.key || '')).filter(Boolean);
  const parentByChild = new Map();
  const childrenByParent = new Map();

  for (const childKey of livingKeys) {
    const parentKey = nearestLivingAncestorKey(childKey, artifactByKey, semanticParentByChild);
    if (!parentKey) continue;
    parentByChild.set(childKey, parentKey);
    if (!childrenByParent.has(parentKey)) childrenByParent.set(parentKey, []);
    childrenByParent.get(parentKey).push(childKey);
  }
  for (const children of childrenByParent.values()) children.sort();

  const parentKeys = new Set(parentByChild.values());
  const leaves = livingKeys.filter((key) => !parentKeys.has(key));
  const roots = livingKeys.filter((key) => !parentByChild.has(key));

  return Object.freeze({
    schema: PLAYTHINGS_LIVING_SCHEMA,
    artifactByKey,
    semanticParentByChild,
    parentByChild,
    childrenByParent,
    livingKeys: Object.freeze(livingKeys.slice()),
    leaves: Object.freeze(leaves.slice()),
    roots: Object.freeze(roots.slice()),
    semanticAuthority: 'none'
  });
}

export function isLivingPlaythingsArtifact(artifact = {}) {
  return Boolean(artifact?.key) && artifact?.isSchemaArtifact !== true;
}

export function nearestLivingAncestorKey(childKey = '', artifactByKey = new Map(), semanticParentByChild = new Map()) {
  let cursor = semanticParentByChild.get(String(childKey || '')) || '';
  const seen = new Set();
  while (cursor && !seen.has(cursor)) {
    seen.add(cursor);
    const artifact = artifactByKey.get(cursor);
    if (isLivingPlaythingsArtifact(artifact)) return cursor;
    cursor = semanticParentByChild.get(cursor) || '';
  }
  return '';
}

export function nearestLivingAncestorForArtifact(artifactKey = '', artifactsInput = [], edgesInput = []) {
  const projection = buildPlaythingsLivingProjection(artifactsInput, edgesInput);
  return nearestLivingAncestorKey(artifactKey, projection.artifactByKey, projection.semanticParentByChild);
}
