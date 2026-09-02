export function projectVisiblePlaythingsModel(model = {}, verseIds, artifactKeys, portalKeys) {
  const visibleVerses = verseIds instanceof Set ? verseIds : new Set((model.verses || []).map((verse) => verse.id));
  const visible = artifactKeys instanceof Set ? artifactKeys : new Set();
  const portals = portalKeys instanceof Set ? portalKeys : new Set();

  const artifacts = (model.artifacts || []).filter((artifact) => visible.has(artifact.key));
  const artifactSet = new Set(artifacts.map((artifact) => artifact.key));
  const edges = (model.edges || []).filter((edge) => artifactSet.has(edge.from) && artifactSet.has(edge.to));
  const parentKeys = new Set(edges.filter((edge) => edge.kind === 'parent').map((edge) => edge.from));
  const parentByChild = new Map(edges.filter((edge) => edge.kind === 'parent').map((edge) => [edge.to, edge.from]));
  const childrenByParent = new Map();
  for (const edge of edges.filter((edge) => edge.kind === 'parent')) {
    if (!childrenByParent.has(edge.from)) childrenByParent.set(edge.from, []);
    childrenByParent.get(edge.from).push(edge.to);
  }

  const actors = artifacts.filter((artifact) => !parentKeys.has(artifact.key)).map((artifact) => {
    const ancestry = ancestryFor(artifact.key, parentByChild);
    const branchDepth = ancestry.filter((key) => (childrenByParent.get(key) || []).length > 1).length;
    return Object.freeze({
      id: `lineage:${artifact.key}`,
      headKey: artifact.key,
      verseId: artifact.verseId || '',
      repo: artifact.repo || '',
      label: artifact.title || artifact.path || artifact.key,
      schemaId: artifact.schemaId || '',
      visualKind: artifact.visualKind || 'relic',
      presentationSeed: (artifacts.find((candidate) => candidate.key === ancestry[0]) || artifact).presentationSeed || ancestry[0] || artifact.key,
      ancestry: Object.freeze(ancestry),
      generations: Math.max(0, ancestry.length - 1),
      branchDepth
    });
  });

  const verses = (model.verses || []).filter((verse) => visibleVerses.has(verse.id)).map((verse) => {
    const verseArtifacts = artifacts.filter((artifact) => artifact.verseId === verse.id);
    const verseKeys = new Set(verseArtifacts.map((artifact) => artifact.key));
    const verseEdges = edges.filter((edge) => verseKeys.has(edge.from) && verseKeys.has(edge.to));
    const verseActors = actors.filter((actor) => verseKeys.has(actor.headKey));
    return Object.assign({}, verse, {
      artifacts: verseArtifacts,
      edges: verseEdges,
      actors: verseActors,
      loadedObservedCount: Number(verse.observedCount || 0),
      observedCount: verseArtifacts.length,
      resolvedCount: verseArtifacts.length
    });
  });

  const visiblePortals = (model.portals || []).filter((edge) => portals.has(edge.key) && artifactSet.has(edge.from) && artifactSet.has(edge.to));
  return Object.freeze({
    schema: model.schema,
    fingerprint: model.fingerprint,
    verses,
    artifacts,
    edges,
    actors,
    portals: visiblePortals,
    unresolved: model.unresolved || [],
    unboundArtifacts: model.unboundArtifacts || [],
    observedCount: artifacts.length
  });
}

function ancestryFor(headKey, parentByChild) {
  const ancestry = [];
  const seen = new Set();
  let cursor = headKey;
  while (cursor && !seen.has(cursor)) {
    seen.add(cursor);
    ancestry.push(cursor);
    cursor = parentByChild.get(cursor) || '';
  }
  return ancestry.reverse();
}
