export const PLAYTHINGS_FIND_SCHEMA = 'tiinex.playthings.find-projection.experimental.v1';

export function isPlaythingsLocalArtifact(artifact = {}) {
  const mode = String(artifact?.sourceMode || '').trim().toLowerCase();
  return mode === 'local-transition-canonical'
    || mode === 'local-transition'
    || mode === 'local-draft'
    || mode === 'manual-file'
    || mode === 'manual-files';
}

export function playthingsArtifactLocator(model = {}, artifactKey = '') {
  const key = String(artifactKey || '');
  const artifact = (model.artifacts || []).find((entry) => entry.key === key) || null;
  if (!artifact) return Object.freeze({ schema: PLAYTHINGS_FIND_SCHEMA, state: 'missing', artifact: null, actor: null, kind: 'missing' });
  if (artifact.isSchemaArtifact) return Object.freeze({ schema: PLAYTHINGS_FIND_SCHEMA, state: 'resolved', artifact, actor: null, kind: 'blueprint' });
  const structure = (model.structures || []).find?.((entry) => entry.artifactKey === key) || null;
  if (structure) return Object.freeze({ schema: PLAYTHINGS_FIND_SCHEMA, state: 'resolved', artifact, actor: null, structure, kind: 'place' });
  const actors = model.actors || [];
  const liveActor = actors.find((actor) => actor.headKey === key) || null;
  if (liveActor) return Object.freeze({ schema: PLAYTHINGS_FIND_SCHEMA, state: 'resolved', artifact, actor: liveActor, kind: 'living-leaf' });
  const historicalActor = actors.find((actor) => Array.isArray(actor.ancestry) && actor.ancestry.includes(key)) || null;
  if (historicalActor) return Object.freeze({ schema: PLAYTHINGS_FIND_SCHEMA, state: 'resolved', artifact, actor: historicalActor, kind: 'lineage-history' });
  return Object.freeze({ schema: PLAYTHINGS_FIND_SCHEMA, state: 'resolved', artifact, actor: null, kind: 'observed-scene' });
}

export function searchablePlaythingsArtifacts(model = {}, query = '', limit = 12) {
  const needle = String(query || '').trim().toLowerCase();
  const artifacts = (model.artifacts || []).filter((artifact) => {
    if (!needle) return isPlaythingsLocalArtifact(artifact);
    return [artifact.title, artifact.summary, artifact.path, artifact.schemaId, artifact.repo]
      .some((value) => String(value || '').toLowerCase().includes(needle));
  });
  return artifacts
    .slice()
    .sort((left, right) => Number(isPlaythingsLocalArtifact(right)) - Number(isPlaythingsLocalArtifact(left)) || sortableDate(right.createdAt) - sortableDate(left.createdAt) || String(left.title || '').localeCompare(String(right.title || '')))
    .slice(0, Math.max(1, Number(limit || 12)));
}

export function playthingsArtifactFindLabel(model = {}, artifact = {}) {
  const actors = model.actors || [];
  if (artifact.isSchemaArtifact) return 'Blueprint';
  const live = actors.find((actor) => actor.headKey === artifact.key);
  if (live) return 'Living leaf';
  const historical = actors.find((actor) => Array.isArray(actor.ancestry) && actor.ancestry.includes(artifact.key));
  if (historical) return `History → ${historical.label || 'current leaf'}`;
  if (artifact.persistenceKind === 'structure') return 'World place';
  return 'Observed scene';
}

function sortableDate(value) {
  const raw = String(value || '').trim();
  if (!raw) return 0;
  const stamp = Date.parse(raw.includes('T') ? raw : `${raw.replace(' ', 'T')}Z`);
  return Number.isFinite(stamp) ? stamp : 0;
}
