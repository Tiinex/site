import { buildPlaythingsLivingProjection } from './playthings.living.js';
import { lineageActorForHead } from './playthings.role.js';

export function projectVisiblePlaythingsModel(model = {}, verseIds, artifactKeys, portalKeys) {
  const visibleVerses = verseIds instanceof Set ? verseIds : new Set((model.verses || []).map((verse) => verse.id));
  const visible = artifactKeys instanceof Set ? artifactKeys : new Set();
  const portals = portalKeys instanceof Set ? portalKeys : new Set();

  const artifacts = (model.artifacts || []).filter((artifact) => visible.has(artifact.key));
  const artifactSet = new Set(artifacts.map((artifact) => artifact.key));
  const edges = (model.edges || []).filter((edge) => artifactSet.has(edge.from) && artifactSet.has(edge.to));
  const artifactByKey = new Map(artifacts.map((artifact) => [artifact.key, artifact]));
  const living = buildPlaythingsLivingProjection(artifacts, edges);
  const actors = living.leaves.map((headKey) => lineageActorForHead(headKey, artifactByKey, living.parentByChild, living.childrenByParent));

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
