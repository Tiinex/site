export const PLAYTHINGS_TIMELINE_SCHEMA = 'tiinex.playthings.timeline.experimental.v1';

export function planPlaythingsHistory(model = {}) {
  const artifacts = Array.isArray(model.artifacts) ? model.artifacts : [];
  const byKey = new Map(artifacts.map((artifact) => [artifact.key, artifact]));
  const parentEdges = (model.edges || []).filter((edge) => edge.kind === 'parent' && byKey.has(edge.from) && byKey.has(edge.to));
  const parentByChild = new Map(parentEdges.map((edge) => [edge.to, edge.from]));
  const childrenByParent = new Map();
  for (const edge of parentEdges) {
    if (!childrenByParent.has(edge.from)) childrenByParent.set(edge.from, []);
    childrenByParent.get(edge.from).push(edge.to);
  }
  for (const children of childrenByParent.values()) children.sort();

  const orderedArtifacts = topologicalChronologicalOrder(artifacts, parentByChild);
  const portalEdges = (model.portals || []).filter((edge) => byKey.has(edge.from) && byKey.has(edge.to));
  const pendingPortals = new Map(portalEdges.map((edge) => [edge.key, edge]));
  const visibleArtifactKeys = new Set();
  const seenChildren = new Map();
  const events = [];

  for (const artifact of orderedArtifacts) {
    const parentKey = parentByChild.get(artifact.key) || '';
    const siblingIndex = parentKey ? Number(seenChildren.get(parentKey) || 0) : 0;
    const kind = !parentKey ? 'spawn' : siblingIndex > 0 ? 'split' : 'advance';
    visibleArtifactKeys.add(artifact.key);
    if (parentKey) seenChildren.set(parentKey, siblingIndex + 1);
    events.push(Object.freeze({
      id: `artifact:${artifact.key}`,
      kind,
      artifactKey: artifact.key,
      parentKey,
      verseId: artifact.verseId,
      at: artifact.createdAt || '',
      label: artifact.title || artifact.path || artifact.key,
      interactionKind: artifact.interactionKind || 'inspect',
      stationKind: artifact.visualKind || 'relic'
    }));

    const newlyResolvedPortals = Array.from(pendingPortals.values())
      .filter((edge) => visibleArtifactKeys.has(edge.from) && visibleArtifactKeys.has(edge.to))
      .sort((a, b) => String(a.key).localeCompare(String(b.key)));
    for (const edge of newlyResolvedPortals) {
      events.push(Object.freeze({
        id: `portal:${edge.key}`,
        kind: 'portal',
        edgeKey: edge.key,
        from: edge.from,
        to: edge.to,
        fromVerseId: edge.fromVerseId,
        toVerseId: edge.toVerseId,
        at: artifact.createdAt || '',
        label: `${repoLabel(edge.fromVerseId)} ↔ ${repoLabel(edge.toVerseId)}`
      }));
      pendingPortals.delete(edge.key);
    }
  }

  return Object.freeze({
    schema: PLAYTHINGS_TIMELINE_SCHEMA,
    modelFingerprint: model.fingerprint || '',
    verseIds: Object.freeze((model.verses || []).map((verse) => verse.id)),
    events: Object.freeze(events),
    artifactEventCount: orderedArtifacts.length,
    portalEventCount: events.length - orderedArtifacts.length
  });
}

export function playthingsProjectionAtCursor(history = {}, cursorInput = 0) {
  const events = Array.isArray(history.events) ? history.events : [];
  const cursor = clampCursor(cursorInput, events.length);
  const artifactKeys = new Set();
  const portalKeys = new Set();
  for (let index = 0; index < cursor; index += 1) {
    const event = events[index];
    if (event?.artifactKey) artifactKeys.add(event.artifactKey);
    if (event?.edgeKey) portalKeys.add(event.edgeKey);
  }
  return Object.freeze({
    cursor,
    artifactKeys,
    portalKeys,
    verseIds: new Set(history.verseIds || []),
    activeEvent: cursor > 0 ? events[cursor - 1] || null : null,
    atNow: cursor >= events.length
  });
}

export function playthingsObservationFromModel(model = {}) {
  return Object.freeze({
    schema: 'tiinex.playthings.observation-cache.v1',
    verseIds: Object.freeze((model.verses || []).map((verse) => verse.id).sort()),
    artifactKeys: Object.freeze((model.artifacts || []).map((artifact) => artifact.key).sort()),
    portalKeys: Object.freeze((model.portals || []).map((edge) => edge.key).sort()),
    edgeKeys: Object.freeze((model.edges || []).map((edge) => edge.key).sort()),
    modelFingerprint: model.fingerprint || '',
    observedAt: new Date().toISOString(),
    semanticAuthority: 'none'
  });
}

export function resolvePlaythingsObservationCursor(observation = null, history = {}, model = {}) {
  if (!observation || observation.schema !== 'tiinex.playthings.observation-cache.v1') return Object.freeze({ valid: false, cursor: 0, reason: 'missing-observation' });
  const currentArtifacts = new Set((model.artifacts || []).map((artifact) => artifact.key));
  const observedArtifacts = new Set(observation.artifactKeys || []);
  if ([...observedArtifacts].some((key) => !currentArtifacts.has(key))) return Object.freeze({ valid: false, cursor: 0, reason: 'artifact-disappeared' });

  const currentPortals = new Set((model.portals || []).map((edge) => edge.key));
  const observedPortals = new Set(observation.portalKeys || []);
  if ([...observedPortals].some((key) => !currentPortals.has(key))) return Object.freeze({ valid: false, cursor: 0, reason: 'portal-disappeared' });

  const currentRelevantEdges = (model.edges || [])
    .filter((edge) => observedArtifacts.has(edge.from) && observedArtifacts.has(edge.to))
    .map((edge) => edge.key)
    .sort();
  const previousEdges = (observation.edgeKeys || []).slice().sort();
  if (!sameStrings(currentRelevantEdges, previousEdges)) return Object.freeze({ valid: false, cursor: 0, reason: 'lineage-re-resolved' });

  const events = Array.isArray(history.events) ? history.events : [];
  let cursor = 0;
  let missingSeen = false;
  for (let index = 0; index < events.length; index += 1) {
    const event = events[index];
    const observed = event?.artifactKey ? observedArtifacts.has(event.artifactKey) : event?.edgeKey ? observedPortals.has(event.edgeKey) : false;
    if (!observed) { missingSeen = true; continue; }
    if (missingSeen) return Object.freeze({ valid: false, cursor: 0, reason: 'retroactive-order-change' });
    cursor = index + 1;
  }
  return Object.freeze({ valid: true, cursor, reason: cursor >= events.length ? 'already-at-now' : 'delta-ready' });
}

function topologicalChronologicalOrder(artifacts, parentByChild) {
  const pending = new Map((artifacts || []).map((artifact) => [artifact.key, artifact]));
  const ordered = [];
  while (pending.size) {
    const ready = Array.from(pending.values()).filter((artifact) => {
      const parentKey = parentByChild.get(artifact.key) || '';
      return !parentKey || !pending.has(parentKey);
    }).sort(compareArtifacts);
    // A malformed/cyclic loaded graph must not hang playback. Preserve deterministic
    // presentation order while lineage findings remain owned by the resolver/model.
    const batch = ready.length ? ready : Array.from(pending.values()).sort(compareArtifacts).slice(0, 1);
    for (const artifact of batch) { ordered.push(artifact); pending.delete(artifact.key); }
  }
  return ordered;
}

function compareArtifacts(left = {}, right = {}) {
  const leftTime = sortableDate(left.createdAt);
  const rightTime = sortableDate(right.createdAt);
  if (leftTime !== rightTime) return leftTime - rightTime;
  return String(left.key || '').localeCompare(String(right.key || ''));
}
function sortableDate(value) {
  const raw = String(value || '').trim();
  if (!raw) return Number.MAX_SAFE_INTEGER;
  const stamp = Date.parse(raw.includes('T') ? raw : raw.replace(' ', 'T') + 'Z');
  return Number.isFinite(stamp) ? stamp : Number.MAX_SAFE_INTEGER;
}
function clampCursor(value, length) { return Math.max(0, Math.min(Number(length || 0), Math.round(Number(value || 0)))); }
function sameStrings(left, right) { return left.length === right.length && left.every((value, index) => value === right[index]); }
function repoLabel(verseId) { return String(verseId || '').replace(/^repo:/, ''); }
