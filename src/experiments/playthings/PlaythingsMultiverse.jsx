import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  planPlaythingsDelta,
  projectPlaythingsMultiverse
} from './playthings.model.js';
import './playthings.css';

const PLAYBACK_MS = 760;
const LANDMARK_KINDS = new Set(['castle', 'observatory', 'gate', 'monolith', 'beacon', 'harbor', 'bridge-marker']);

export function PlaythingsMultiverse({ workspaces = [], onRefresh = null, onOpenRecord = null, onExit = null }) {
  const incomingModel = useMemo(() => projectPlaythingsMultiverse(workspaces), [workspaces]);
  const [baseline, setBaseline] = useState(() => incomingModel);
  const [target, setTarget] = useState(() => incomingModel);
  const [phase, setPhase] = useState('settled');
  const [events, setEvents] = useState([]);
  const [eventIndex, setEventIndex] = useState(-1);
  const [visibleVerseIds, setVisibleVerseIds] = useState(() => new Set(incomingModel.verses.map((verse) => verse.id)));
  const [visibleArtifactKeys, setVisibleArtifactKeys] = useState(() => new Set(incomingModel.artifacts.map((artifact) => artifact.key)));
  const [visiblePortalKeys, setVisiblePortalKeys] = useState(() => new Set(incomingModel.portals.map((edge) => edge.key)));
  const targetRef = useRef(target);
  const baselineRef = useRef(baseline);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => { targetRef.current = target; }, [target]);
  useEffect(() => { baselineRef.current = baseline; }, [baseline]);

  useEffect(() => {
    if (phase !== 'playing') return undefined;
    if (!events.length) {
      settlePlayback(targetRef.current);
      return undefined;
    }
    const nextIndex = eventIndex + 1;
    if (nextIndex >= events.length) {
      const timer = window.setTimeout(() => settlePlayback(targetRef.current), prefersReducedMotion ? 0 : Math.round(PLAYBACK_MS * 0.55));
      return () => window.clearTimeout(timer);
    }
    const timer = window.setTimeout(() => {
      const event = events[nextIndex];
      if (event.kind === 'realm') setVisibleVerseIds((current) => withSetItem(current, event.verseId));
      else if (event.kind === 'portal') setVisiblePortalKeys((current) => withSetItem(current, event.edgeKey));
      else if (event.artifactKey) setVisibleArtifactKeys((current) => withSetItem(current, event.artifactKey));
      setEventIndex(nextIndex);
    }, prefersReducedMotion ? 0 : PLAYBACK_MS);
    return () => window.clearTimeout(timer);
  }, [phase, events, eventIndex, prefersReducedMotion]);

  async function refresh() {
    if (phase !== 'settled' || typeof onRefresh !== 'function') return;
    setPhase('refreshing');
    setEvents([]);
    setEventIndex(-1);
    try {
      const result = await onRefresh();
      const nextWorkspaces = Array.isArray(result?.workspaces) ? result.workspaces : workspaces;
      const nextModel = projectPlaythingsMultiverse(nextWorkspaces);
      const delta = planPlaythingsDelta(baselineRef.current, nextModel);
      setTarget(nextModel);
      targetRef.current = nextModel;
      if (!delta.changed) {
        settlePlayback(nextModel);
        return;
      }
      setVisibleVerseIds(new Set((baselineRef.current.verses || []).map((verse) => verse.id)));
      setVisibleArtifactKeys(new Set((baselineRef.current.artifacts || []).map((artifact) => artifact.key)));
      setVisiblePortalKeys(new Set((baselineRef.current.portals || []).map((edge) => edge.key)));
      setEvents(delta.events);
      setEventIndex(-1);
      setPhase('playing');
    } catch (_) {
      setPhase('settled');
    }
  }

  function settlePlayback(model) {
    const next = model || targetRef.current || incomingModel;
    setBaseline(next);
    baselineRef.current = next;
    setTarget(next);
    targetRef.current = next;
    setVisibleVerseIds(new Set((next.verses || []).map((verse) => verse.id)));
    setVisibleArtifactKeys(new Set((next.artifacts || []).map((artifact) => artifact.key)));
    setVisiblePortalKeys(new Set((next.portals || []).map((edge) => edge.key)));
    setEvents([]);
    setEventIndex(-1);
    setPhase('settled');
  }

  const displayModel = phase === 'settled' && baseline.fingerprint !== incomingModel.fingerprint ? baseline : target;
  const visibleModel = visibleProjection(displayModel, visibleVerseIds, visibleArtifactKeys, visiblePortalKeys);
  const activeEvent = eventIndex >= 0 ? events[eventIndex] : null;
  const timeline = phase === 'playing' ? `${Math.max(0, eventIndex + 1)} / ${events.length}` : 'Now';
  const canRefresh = typeof onRefresh === 'function' && phase === 'settled';

  return (
    <section className="tx-playthings" data-playthings-phase={phase} aria-label="Playthings experimental multiverse">
      <header className="tx-playthings-header">
        <div className="tx-playthings-title-block">
          <p className="tx-playthings-eyebrow">Observation deck · read-only multiverse</p>
          <h1>Playthings</h1>
          <p>Each repository is a realm. Each living sprite is a lineage at its current head. Refresh only animates what Tiinex has newly observed.</p>
        </div>
        <div className="tx-playthings-actions">
          <button type="button" className="tx-playthings-button" onClick={refresh} disabled={!canRefresh}>{phase === 'refreshing' ? 'Reading worlds…' : phase === 'playing' ? 'Time is moving…' : 'Refresh worlds'}</button>
          <button type="button" className="tx-playthings-button tx-playthings-button-muted" onClick={onExit}>Return to Tiinex</button>
        </div>
      </header>

      <div className="tx-playthings-hud" role="status" aria-live="polite">
        <span><b>{visibleModel.verses.length}</b><small>realms</small></span>
        <span><b>{visibleModel.actors.length}</b><small>living lineages</small></span>
        <span><b>{visibleModel.observedCount}</b><small>loaded records</small></span>
        <span><b>{visibleModel.portals.length}</b><small>world gates</small></span>
        <span className="tx-playthings-now"><i />{phase === 'refreshing' ? 'Reading' : phase === 'playing' ? `Replaying ${timeline}` : 'NOW · STILL'}</span>
      </div>

      {activeEvent ? <div className={`tx-playthings-event is-${activeEvent.kind}`}><span>{eventGlyph(activeEvent.kind)}</span><div><strong>{eventLabel(activeEvent.kind)}</strong><small>{activeEvent.label}</small></div></div> : null}

      {visibleModel.verses.length ? (
        <PlaythingsStage model={visibleModel} activeEvent={activeEvent} onOpenRecord={onOpenRecord} />
      ) : (
        <div className="tx-playthings-empty"><strong>No realm can be resolved yet.</strong><span>Load a repository ZIP into a configured workspace. Playthings will use an unambiguous workspace → repository affinity as projection-only provenance.</span></div>
      )}

      <footer className="tx-playthings-boundary">
        <span>Read-only</span>
        <span>Parent lineage is the movement grammar</span>
        <span>{displayModel.inferredArtifactCount ? `${displayModel.inferredArtifactCount} ZIP/local artifacts bound through workspace repository affinity` : 'Source repository identity carried directly'}</span>
        <span>{displayModel.unboundArtifacts.length ? `${displayModel.unboundArtifacts.length} artifacts remain deliberately unbound` : 'No ambiguous repository affinity'}</span>
        <span>{displayModel.unresolved.length ? `${displayModel.unresolved.length} unresolved lineage findings preserved` : 'No unresolved loaded lineage finding'}</span>
      </footer>
    </section>
  );
}

function PlaythingsStage({ model, activeEvent, onOpenRecord }) {
  const layout = verseLayout(model.verses);
  const byVerseId = new Map(model.verses.map((verse) => [verse.id, verse]));
  const portalGroups = groupPortalEdges(model.portals);
  return (
    <div className="tx-playthings-stage-wrap">
      <svg className="tx-playthings-stage" viewBox={`0 0 ${layout.width} ${layout.height}`} role="img" aria-label="Playthings repository multiverse" shapeRendering="crispEdges">
        <defs>
          <pattern id="playthings-stars" width="71" height="53" patternUnits="userSpaceOnUse">
            <rect x="7" y="9" width="2" height="2" className="tx-playthings-star" />
            <rect x="41" y="31" width="1" height="1" className="tx-playthings-star is-faint" />
            <rect x="63" y="17" width="2" height="1" className="tx-playthings-star is-faint" />
          </pattern>
          <pattern id="playthings-scan" width="4" height="4" patternUnits="userSpaceOnUse"><path d="M 0 3.5 H 4" className="tx-playthings-scan-line" /></pattern>
          <pattern id="playthings-ground-grid" width="18" height="18" patternUnits="userSpaceOnUse"><path d="M 18 0 H 0 V 18" className="tx-playthings-ground-grid-line" /></pattern>
          <filter id="playthings-glow" x="-70%" y="-70%" width="240%" height="240%"><feGaussianBlur stdDeviation="4" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>
        <rect className="tx-playthings-space" x="0" y="0" width={layout.width} height={layout.height} />
        <rect x="0" y="0" width={layout.width} height={layout.height} fill="url(#playthings-stars)" />
        <VoidConstellation width={layout.width} height={layout.height} />
        {portalGroups.map((group) => {
          const fromBox = layout.byVerse.get(group.fromVerseId);
          const toBox = layout.byVerse.get(group.toVerseId);
          if (!fromBox || !toBox) return null;
          const from = boundaryPoint(fromBox, toBox);
          const to = boundaryPoint(toBox, fromBox);
          const active = group.edges.some((edge) => activeEvent?.kind === 'portal' && activeEvent.edgeKey === edge.key);
          const bend = Math.max(58, Math.min(170, Math.abs(to.x - from.x) * 0.22 + Math.abs(to.y - from.y) * 0.14));
          const midX = (from.x + to.x) / 2;
          const path = `M ${from.x} ${from.y} C ${midX - bend} ${from.y}, ${midX + bend} ${to.y}, ${to.x} ${to.y}`;
          const fromVerse = byVerseId.get(group.fromVerseId);
          const toVerse = byVerseId.get(group.toVerseId);
          return <PortalBridge key={group.key} path={path} from={from} to={to} active={active} count={group.edges.length} label={`${fromVerse?.repo || group.fromVerseId} ↔ ${toVerse?.repo || group.toVerseId}`} />;
        })}
        {model.verses.map((verse) => <VerseWorld key={verse.id} verse={verse} box={layout.byVerse.get(verse.id)} activeEvent={activeEvent} onOpenRecord={onOpenRecord} />)}
        <rect x="0" y="0" width={layout.width} height={layout.height} fill="url(#playthings-scan)" className="tx-playthings-scan" />
      </svg>
    </div>
  );
}

function VerseWorld({ verse, box, activeEvent, onOpenRecord }) {
  if (!box) return null;
  const world = buildVerseWorldLayout(verse, box);
  const actorByHead = new Map((verse.actors || []).map((actor) => [actor.headKey, actor]));
  const structuralHeads = new Set((verse.actors || []).filter((actor) => isStructuralKind(actor.visualKind)).map((actor) => actor.headKey));
  const inhabitantActors = (verse.actors || []).filter((actor) => !structuralHeads.has(actor.headKey));
  const activeArtifact = activeEvent?.artifactKey ? verse.artifacts.find((artifact) => artifact.key === activeEvent.artifactKey) : null;
  const activeParent = activeEvent?.parentKey ? verse.artifacts.find((artifact) => artifact.key === activeEvent.parentKey) : null;
  const activeFrom = activeParent ? world.positions.get(activeParent.key) : null;
  const activeTo = activeArtifact ? world.positions.get(activeArtifact.key) : null;
  const realmClass = `is-${verse.realm?.id || 'wilds'}`;
  const realmActive = activeEvent?.kind === 'realm' && activeEvent.verseId === verse.id;
  return (
    <g className={`tx-playthings-verse ${realmClass} ${realmActive ? 'is-new-realm' : ''}`} data-repo={verse.repo}>
      <PixelRealmIsland box={box} realm={verse.realm} seed={verse.id} />
      <RealmScenery box={box} realm={verse.realm} seed={verse.id} />
      <RealmBanner verse={verse} box={box} />
      {(verse.actors || []).map((actor) => <LineageMemoryTrail key={`memory:${actor.id}`} actor={actor} positions={world.positions} />)}
      {world.landmarks.map((artifact) => <Landmark key={artifact.key} artifact={artifact} point={world.positions.get(artifact.key)} active={activeEvent?.artifactKey === artifact.key} head={actorByHead.has(artifact.key)} onOpen={() => onOpenRecord?.(artifact.recordId, artifact.workspaceId)} />)}
      {activeFrom && activeTo ? <path className={`tx-playthings-event-path is-${activeEvent?.kind || 'advance'}`} d={steppedPath(activeFrom, activeTo)} /> : null}
      {inhabitantActors.map((actor) => {
        const artifact = verse.artifacts.find((candidate) => candidate.key === actor.headKey);
        const point = world.positions.get(actor.headKey);
        if (!artifact || !point) return null;
        return <LineagePlaything key={actor.id || actor.headKey} artifact={artifact} actor={actor} x={point.x} y={point.y} active={activeEvent?.artifactKey === actor.headKey} onOpen={() => onOpenRecord?.(artifact.recordId, artifact.workspaceId)} />;
      })}
      {!verse.actors.length && Number(verse.observedCount || 0) > 0 ? <UnresolvedRealmPopulation verse={verse} box={box} /> : null}
    </g>
  );
}

function PixelRealmIsland({ box, realm, seed }) {
  const left = box.x + 14, right = box.x + box.w - 14, top = box.y + 60, bottom = box.y + box.h - 32;
  const lip = 16 + (hashSmall(seed) % 12);
  const notch = 32 + (hashSmall(`${seed}:notch`) % 52);
  const topPath = `M ${left + 26} ${top} H ${right - notch} L ${right} ${top + 22} V ${bottom - 22} L ${right - 26} ${bottom} H ${left + notch} L ${left} ${bottom - 22} V ${top + 22} Z`;
  const underPath = `M ${left + 12} ${bottom - 8} L ${right - 12} ${bottom - 8} L ${right - 62} ${bottom + lip + 30} L ${left + 78} ${bottom + lip + 42} Z`;
  return <g className="tx-playthings-island-shell">
    <path className="tx-playthings-island-under" d={underPath} />
    <path className="tx-playthings-island-rim" d={topPath} />
    <path className="tx-playthings-island-ground" d={topPath} />
    <path className="tx-playthings-island-grid" d={topPath} fill="url(#playthings-ground-grid)" />
    <TerrainDecor box={box} realm={realm} seed={seed} />
  </g>;
}

function RealmScenery({ box, realm, seed }) {
  const cx = box.x + box.w / 2;
  const top = box.y + 92;
  const districtY = box.y + box.h - 76;
  return <g className="tx-playthings-scenery" aria-hidden="true">
    <path className="tx-playthings-ground-road" d={`M ${cx} ${top + 34} V ${districtY} M ${box.x + 86} ${districtY} H ${box.x + box.w - 86}`} />
    {realm?.id === 'citadel' ? <CitadelHeart x={cx} y={top + 12} /> : null}
    {realm?.id === 'archive' ? <ArchiveHeart x={cx} y={top + 15} /> : null}
    {realm?.id === 'signal-city' ? <SignalHeart x={cx} y={top + 16} /> : null}
    {!['citadel', 'archive', 'signal-city'].includes(realm?.id) ? <FrontierHeart x={cx} y={top + 14} /> : null}
    <DistrictMarkers box={box} realm={realm} seed={seed} />
  </g>;
}

function TerrainDecor({ box, realm, seed }) {
  const edgePoints = [
    [0.10, 0.40], [0.16, 0.73], [0.30, 0.87], [0.70, 0.87], [0.84, 0.72], [0.90, 0.39]
  ].map(([px, py], index) => ({ x: box.x + box.w * px + ((hashSmall(`${seed}:edge:${index}`) % 7) - 3), y: box.y + box.h * py }));
  return <g className="tx-playthings-terrain">
    {edgePoints.map((point, index) => realm?.id === 'signal-city'
      ? <PixelTower key={index} x={point.x} y={point.y} size={index % 3} />
      : realm?.id === 'citadel'
        ? <PixelCrag key={index} x={point.x} y={point.y} />
        : realm?.id === 'archive'
          ? <PixelTree key={index} x={point.x} y={point.y} />
          : <PixelCrystal key={index} x={point.x} y={point.y} />)}
  </g>;
}

function RealmBanner({ verse, box }) {
  const loaded = Number(verse.observedCount || verse.artifacts.length || 0);
  const resolved = Number(verse.resolvedCount || verse.artifacts.length || 0);
  return <g className="tx-playthings-realm-banner">
    <rect x={box.x + 22} y={box.y + 18} width={Math.min(318, box.w - 110)} height="48" />
    <text className="tx-playthings-realm-glyph" x={box.x + 34} y={box.y + 48}>{verse.realm?.glyph || '◇'}</text>
    <text className="tx-playthings-repo" x={box.x + 58} y={box.y + 37}>{verse.repo}</text>
    <text className="tx-playthings-repo-meta" x={box.x + 58} y={box.y + 55}>{`${verse.realm?.label || 'Realm'} · ${verse.actors.length} lineages · ${resolved}/${loaded} lineage-readable`}</text>
  </g>;
}

function LineagePlaything({ artifact, actor, x, y, active, onOpen }) {
  const variant = hashSmall(actor.id || artifact.key) % 4;
  return <g className={`tx-playthings-actor ${active ? 'is-new' : ''}`} transform={`translate(${x} ${y})`} tabIndex="0" role="button" aria-label={`${artifact.title}, living lineage head`} onClick={onOpen} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onOpen?.(); } }}>
    <title>{`${artifact.title}\n${artifact.schemaId}\n${artifact.path}\n${actor.generations || 0} generations`}</title>
    <ellipse className="tx-playthings-actor-shadow" cx="0" cy="14" rx="10" ry="3" />
    <PixelPlaything role={artifact.visualKind} branchDepth={actor.branchDepth || 0} variant={variant} />
    <path className="tx-playthings-head-marker" d="M -9 18 H 9 M -5 21 H 5" />
  </g>;
}

function Landmark({ artifact, point, active, head = false, onOpen }) {
  if (!point) return null;
  return <g className={`tx-playthings-landmark tx-playthings-${artifact.visualKind} ${head ? 'is-head' : 'is-history'} ${active ? 'is-new' : ''}`} transform={`translate(${point.x} ${point.y})`} tabIndex="0" role="button" onClick={onOpen} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onOpen?.(); } }}>
    <title>{`${artifact.title}\n${artifact.schemaId}\n${artifact.path}${head ? '\nCurrent lineage head' : '\nHistorical landmark'}`}</title>
    {head ? <rect className="tx-playthings-landmark-head" x="-18" y="-20" width="36" height="34" /> : null}
    <PixelLandmark kind={artifact.visualKind} />
  </g>;
}

function LineageMemoryTrail({ actor, positions }) {
  const head = positions.get(actor.headKey);
  if (!head || !Array.isArray(actor.ancestry) || actor.ancestry.length < 2) return null;
  const keys = actor.ancestry.slice(Math.max(0, actor.ancestry.length - 4), -1);
  const points = keys.map((key) => positions.get(key)).filter(Boolean);
  if (!points.length) return null;
  const d = [...points, head].map((point, index) => `${index ? 'L' : 'M'} ${Math.round(point.x)} ${Math.round(point.y)}`).join(' ');
  return <g className="tx-playthings-memory-trail" aria-hidden="true">
    <path d={d} />
    {points.map((point, index) => <rect key={`${actor.id}:${index}`} x={point.x - 2} y={point.y - 2} width="4" height="4" transform={`rotate(45 ${point.x} ${point.y})`} />)}
  </g>;
}

function UnresolvedRealmPopulation({ verse, box }) {
  return <g className="tx-playthings-unresolved-population" aria-label={`${verse.repo} loaded but no lineage heads resolved`}>
    <rect x={box.x + box.w / 2 - 90} y={box.y + box.h - 78} width="180" height="34" />
    <text x={box.x + box.w / 2} y={box.y + box.h - 58}>MATERIAL OBSERVED · LINEAGE QUIET</text>
  </g>;
}

function PortalBridge({ path, from, to, active, count, label }) {
  const mx = (from.x + to.x) / 2;
  const my = (from.y + to.y) / 2;
  return <g className={`tx-playthings-portal-link ${active ? 'is-new' : ''}`}>
    <path className="tx-playthings-portal-shadow" d={path} />
    <path className="tx-playthings-portal-road" d={path} />
    <PixelPortal x={from.x} y={from.y} flip={false} />
    <PixelPortal x={to.x} y={to.y} flip />
    {count > 1 ? <g className="tx-playthings-portal-count" transform={`translate(${mx} ${my})`}><rect x="-15" y="-9" width="30" height="18" /><text x="0" y="4">×{count}</text></g> : null}
    <title>{`${label}${count > 1 ? ` · ${count} resolved Parent crossings` : ''}`}</title>
  </g>;
}

function PixelPlaything({ role = 'relic', branchDepth = 0, variant = 0 }) {
  if (variant === 1) return <g className={`tx-playthings-sprite role-${role} variant-antenna`}>
    <rect className="body" x="-7" y="-8" width="14" height="17" /><rect className="face" x="-5" y="-5" width="10" height="7" />
    <rect className="eye" x="-3" y="-3" width="2" height="2" /><rect className="eye" x="2" y="-3" width="2" height="2" />
    <rect className="limb" x="-11" y="-2" width="4" height="7" /><rect className="limb" x="7" y="-2" width="4" height="7" /><rect className="antenna" x="-1" y="-14" width="2" height="6" /><rect className="accent" x="-3" y="-16" width="6" height="3" />
    <RoleSigil role={role} />{branchDepth > 0 ? <rect className="branch-crown" x="-5" y="-20" width="10" height="2" /> : null}
  </g>;
  if (variant === 2) return <g className={`tx-playthings-sprite role-${role} variant-stout`}>
    <rect className="body" x="-10" y="-6" width="20" height="14" /><rect className="face" x="-7" y="-4" width="14" height="7" />
    <rect className="eye" x="-5" y="-2" width="3" height="2" /><rect className="eye" x="3" y="-2" width="3" height="2" /><rect className="foot" x="-9" y="8" width="6" height="4" /><rect className="foot" x="3" y="8" width="6" height="4" />
    <rect className="accent" x="-12" y="-8" width="5" height="4" /><rect className="accent" x="7" y="-8" width="5" height="4" /><RoleSigil role={role} />{branchDepth > 0 ? <rect className="branch-crown" x="-2" y="-11" width="4" height="3" /> : null}
  </g>;
  if (variant === 3) return <g className={`tx-playthings-sprite role-${role} variant-tall`}>
    <rect className="body" x="-6" y="-11" width="12" height="20" /><rect className="face" x="-5" y="-7" width="10" height="8" />
    <rect className="eye" x="-3" y="-5" width="2" height="3" /><rect className="eye" x="2" y="-5" width="2" height="3" /><rect className="foot" x="-7" y="9" width="5" height="4" /><rect className="foot" x="2" y="9" width="5" height="4" />
    <rect className="accent" x="-8" y="-14" width="5" height="4" /><rect className="accent" x="3" y="-14" width="5" height="4" /><RoleSigil role={role} />{branchDepth > 0 ? <rect className="branch-crown" x="-4" y="-18" width="8" height="2" /> : null}
  </g>;
  return <g className={`tx-playthings-sprite role-${role} variant-block`}>
    <rect className="body" x="-8" y="-8" width="16" height="17" /><rect className="face" x="-6" y="-5" width="12" height="8" />
    <rect className="eye" x="-4" y="-3" width="2" height="2" /><rect className="eye" x="3" y="-3" width="2" height="2" /><rect className="foot" x="-7" y="9" width="5" height="4" /><rect className="foot" x="3" y="9" width="5" height="4" />
    <rect className="accent" x="-10" y="-11" width="5" height="5" /><rect className="accent" x="5" y="-11" width="5" height="5" /><RoleSigil role={role} />{branchDepth > 0 ? <rect className="branch-crown" x="-2" y="-15" width="4" height="3" /> : null}
  </g>;
}

function RoleSigil({ role }) {
  if (role === 'gate') return <path className="sigil" d="M -3 2 V -2 H 3 V 2" />;
  if (role === 'beacon') return <path className="sigil" d="M 0 -1 V 3 M -3 0 H 3" />;
  if (role === 'monolith') return <rect className="sigil-fill" x="-2" y="-1" width="4" height="4" />;
  if (role === 'observatory') return <path className="sigil" d="M -3 2 L 3 -2 M 1 -3 H 4 V 0" />;
  if (role === 'harbor') return <path className="sigil" d="M -3 2 H 3 M 0 -2 V 2" />;
  if (role === 'castle') return <path className="sigil" d="M -3 2 V -2 H -1 V 0 H 1 V -2 H 3 V 2" />;
  return <rect className="sigil-fill" x="-1" y="0" width="2" height="2" />;
}

function PixelLandmark({ kind }) {
  if (kind === 'castle') return <PixelKeep />;
  if (kind === 'observatory') return <PixelObservatory />;
  if (kind === 'gate') return <PixelGate />;
  if (kind === 'monolith') return <PixelMonolith />;
  if (kind === 'beacon') return <PixelBeacon />;
  if (kind === 'harbor') return <PixelHarbor />;
  if (kind === 'bridge-marker') return <PixelBridgeMarker />;
  return <PixelRelic />;
}

function PixelKeep() { return <><rect className="solid" x="-11" y="-6" width="22" height="15" /><rect className="solid" x="-14" y="-12" width="6" height="21" /><rect className="solid" x="8" y="-12" width="6" height="21" /><rect className="solid" x="-4" y="-15" width="8" height="9" /><rect className="void" x="-3" y="2" width="6" height="7" /></>; }
function PixelObservatory() { return <><rect className="solid" x="-10" y="0" width="20" height="9" /><rect className="solid" x="-5" y="-6" width="10" height="6" /><path className="stroke" d="M -1 -7 L 10 -14 M 8 -15 L 13 -10" /></>; }
function PixelGate() { return <><rect className="solid" x="-11" y="-12" width="5" height="21" /><rect className="solid" x="6" y="-12" width="5" height="21" /><rect className="solid" x="-11" y="-12" width="22" height="5" /><rect className="void" x="-5" y="-6" width="10" height="15" /></>; }
function PixelMonolith() { return <><rect className="solid" x="-7" y="-14" width="14" height="23" /><rect className="detail" x="-3" y="-9" width="6" height="2" /><rect className="detail" x="-3" y="-4" width="6" height="2" /></>; }
function PixelBeacon() { return <><rect className="solid" x="-5" y="1" width="10" height="8" /><path className="stroke" d="M 0 1 V -12 M -8 -8 L -4 -5 M 8 -8 L 4 -5" /><rect className="light" x="-2" y="-15" width="4" height="4" /></>; }
function PixelHarbor() { return <><path className="stroke" d="M -12 7 H 12 M -8 3 H 8 M 0 3 V -11" /><rect className="solid" x="-6" y="-13" width="12" height="4" /></>; }
function PixelBridgeMarker() { return <><rect className="solid" x="-11" y="2" width="22" height="5" /><rect className="solid" x="-8" y="-5" width="4" height="7" /><rect className="solid" x="4" y="-5" width="4" height="7" /></>; }
function PixelRelic() { return <><rect className="solid" x="-7" y="-7" width="14" height="14" transform="rotate(45)" /><rect className="detail" x="-2" y="-2" width="4" height="4" /></>; }
function PixelPortal({ x, y, flip }) { return <g className="tx-playthings-portal" transform={`translate(${x} ${y}) scale(${flip ? -1 : 1} 1)`}><rect x="-9" y="-15" width="5" height="29" /><rect x="4" y="-15" width="5" height="29" /><rect x="-9" y="-15" width="18" height="5" /><rect className="void" x="-3" y="-9" width="7" height="23" /></g>; }
function PixelTree({ x, y }) { return <g className="tree" transform={`translate(${x} ${y})`}><rect x="-2" y="2" width="4" height="8" /><rect x="-7" y="-6" width="14" height="8" /><rect x="-5" y="-10" width="10" height="5" /></g>; }
function PixelTower({ x, y, size = 0 }) { const h = 10 + size * 4; return <g className="tower" transform={`translate(${x} ${y})`}><rect x="-4" y={-h} width="8" height={h + 6} /><rect className="window" x="-1" y={-h + 3} width="2" height="2" /></g>; }
function PixelCrag({ x, y }) { return <g className="crag" transform={`translate(${x} ${y})`}><path d="M -7 7 L -2 -8 L 3 -2 L 7 7 Z" /></g>; }
function PixelCrystal({ x, y }) { return <g className="crystal" transform={`translate(${x} ${y})`}><path d="M 0 -8 L 5 0 L 1 8 L -5 1 Z" /></g>; }

function CitadelHeart({ x, y }) { return <g className="tx-playthings-heart is-citadel" transform={`translate(${x} ${y})`}><rect x="-22" y="-9" width="44" height="25" /><rect x="-29" y="-18" width="11" height="34" /><rect x="18" y="-18" width="11" height="34" /><rect x="-8" y="-23" width="16" height="14" /><rect className="void" x="-5" y="5" width="10" height="11" /><path d="M -35 19 H 35" /></g>; }
function ArchiveHeart({ x, y }) { return <g className="tx-playthings-heart is-archive" transform={`translate(${x} ${y})`}><rect className="trunk" x="-5" y="-4" width="10" height="29" /><rect x="-21" y="-17" width="42" height="13" /><rect x="-15" y="-27" width="30" height="12" /><rect x="-7" y="-35" width="14" height="10" /><rect className="rune" x="-2" y="4" width="4" height="4" /></g>; }
function SignalHeart({ x, y }) { return <g className="tx-playthings-heart is-signal" transform={`translate(${x} ${y})`}><rect x="-17" y="2" width="34" height="17" /><rect x="-10" y="-14" width="20" height="16" /><rect x="-4" y="-31" width="8" height="17" /><rect className="hot" x="-2" y="-38" width="4" height="7" /><path d="M -22 19 H 22 M -24 12 H -17 M 17 12 H 24" /></g>; }
function FrontierHeart({ x, y }) { return <g className="tx-playthings-heart is-frontier" transform={`translate(${x} ${y})`}><rect x="-16" y="-12" width="32" height="28" /><rect className="void" x="-5" y="2" width="10" height="14" /><rect className="hot" x="-3" y="-18" width="6" height="6" /></g>; }
function DistrictMarkers({ box, realm, seed }) {
  const marks = [[0.20,0.44],[0.50,0.43],[0.80,0.44],[0.29,0.77],[0.71,0.77]];
  return <g className="tx-playthings-district-markers">{marks.map(([px,py], index) => <g key={index} transform={`translate(${box.x + box.w * px} ${box.y + box.h * py})`}><rect x="-8" y="-2" width="16" height="4" /><rect className="hot" x={index % 2 ? 4 : -6} y="-5" width="3" height="3" /></g>)}</g>;
}

function VoidConstellation({ width, height }) {
  return <g className="tx-playthings-constellation"><path d={`M ${width * 0.12} ${height * 0.17} L ${width * 0.27} ${height * 0.09} L ${width * 0.39} ${height * 0.18}`} /><path d={`M ${width * 0.72} ${height * 0.12} L ${width * 0.86} ${height * 0.22} L ${width * 0.78} ${height * 0.31}`} /><rect x={width * 0.27 - 2} y={height * 0.09 - 2} width="4" height="4" /><rect x={width * 0.86 - 2} y={height * 0.22 - 2} width="4" height="4" /></g>;
}

function visibleProjection(model, verseIds, artifactKeys, portalKeys) {
  const visibleVerses = verseIds instanceof Set ? verseIds : new Set();
  const visible = artifactKeys instanceof Set ? artifactKeys : new Set();
  const portals = portalKeys instanceof Set ? portalKeys : new Set();
  const verses = (model.verses || []).filter((verse) => visibleVerses.has(verse.id)).map((verse) => {
    const artifacts = verse.artifacts.filter((artifact) => visible.has(artifact.key));
    const keys = new Set(artifacts.map((artifact) => artifact.key));
    const edges = verse.edges.filter((edge) => keys.has(edge.from) && keys.has(edge.to));
    const parents = new Set(edges.map((edge) => edge.from));
    const fullActors = new Map((verse.actors || []).map((actor) => [actor.headKey, actor]));
    const actors = artifacts.filter((artifact) => !parents.has(artifact.key)).map((artifact) => fullActors.get(artifact.key) || ({ id: `lineage:${artifact.key}`, headKey: artifact.key, label: artifact.title, visualKind: artifact.visualKind, generations: 0, branchDepth: 0, ancestry: [artifact.key] }));
    return Object.assign({}, verse, { artifacts, edges, actors });
  });
  const visibleArtifacts = verses.flatMap((verse) => verse.artifacts);
  const visibleArtifactSet = new Set(visibleArtifacts.map((artifact) => artifact.key));
  const visiblePortals = (model.portals || []).filter((edge) => portals.has(edge.key) && visibleVerses.has(edge.fromVerseId) && visibleVerses.has(edge.toVerseId) && visibleArtifactSet.has(edge.from) && visibleArtifactSet.has(edge.to));
  return { verses, artifacts: visibleArtifacts, actors: verses.flatMap((verse) => verse.actors), portals: visiblePortals, observedCount: verses.reduce((sum, verse) => sum + Number(verse.observedCount || verse.artifacts.length || 0), 0) };
}

function verseLayout(verses = []) {
  const count = Math.max(1, verses.length);
  const w = 650, h = 440, gapX = 150, gapY = 150, margin = 64;
  const byVerse = new Map();
  if (count === 1) {
    byVerse.set(verses[0].id, { x: margin + 170, y: margin + 55, w, h });
    return { byVerse, width: 2 * margin + w + 340, height: 2 * margin + h + 120 };
  }
  if (count === 2) {
    verses.forEach((verse, index) => byVerse.set(verse.id, { x: margin + index * (w + gapX), y: margin + 70, w, h }));
    return { byVerse, width: 2 * margin + 2 * w + gapX, height: 2 * margin + h + 150 };
  }
  if (count === 3) {
    const archive = verses.find((verse) => verse.realm?.id === 'archive') || verses[0];
    const citadel = verses.find((verse) => verse.realm?.id === 'citadel') || verses.find((verse) => verse.id !== archive.id) || verses[1];
    const signal = verses.find((verse) => verse.realm?.id === 'signal-city') || verses.find((verse) => ![archive.id, citadel.id].includes(verse.id)) || verses[2];
    byVerse.set(archive.id, { x: margin + (w + gapX) / 2, y: margin, w, h });
    byVerse.set(citadel.id, { x: margin, y: margin + h + gapY, w, h });
    byVerse.set(signal.id, { x: margin + w + gapX, y: margin + h + gapY, w, h });
    for (const verse of verses) if (!byVerse.has(verse.id)) byVerse.set(verse.id, { x: margin + (w + gapX) / 2, y: margin, w, h });
    return { byVerse, width: 2 * margin + 2 * w + gapX, height: 2 * margin + 2 * h + gapY + 60 };
  }
  const columns = Math.ceil(Math.sqrt(count));
  const rows = Math.ceil(count / columns);
  verses.forEach((verse, index) => {
    const column = index % columns; const row = Math.floor(index / columns);
    byVerse.set(verse.id, { x: margin + column * (w + gapX), y: margin + row * (h + gapY), w, h });
  });
  return { byVerse, width: 2 * margin + columns * w + Math.max(0, columns - 1) * gapX, height: 2 * margin + rows * h + Math.max(0, rows - 1) * gapY + 60 };
}

function buildVerseWorldLayout(verse, box) {
  const positions = new Map();
  const districts = districtRects(box);
  const groups = new Map();
  for (const actor of verse.actors || []) {
    const district = districtForActor(actor);
    if (!groups.has(district)) groups.set(district, []);
    groups.get(district).push(actor);
  }
  for (const [district, actors] of groups.entries()) {
    const rect = districts[district] || districts.commonsWest;
    const points = gridPoints(actors.slice().sort((a, b) => String(a.headKey).localeCompare(String(b.headKey))), rect, verse.id);
    actors.slice().sort((a, b) => String(a.headKey).localeCompare(String(b.headKey))).forEach((actor, index) => positions.set(actor.headKey, points[index]));
  }
  for (const actor of verse.actors || []) {
    const head = positions.get(actor.headKey);
    if (!head) continue;
    const ancestry = Array.isArray(actor.ancestry) ? actor.ancestry : [];
    const history = ancestry.slice(0, -1);
    const direction = memoryDirection(actor.id || actor.headKey);
    history.forEach((key, index) => {
      if (positions.has(key)) return;
      const distance = Math.min(34, 8 + (history.length - index) * 5);
      positions.set(key, { x: head.x + direction.x * distance, y: head.y + direction.y * distance });
    });
  }
  const actorHeads = new Set((verse.actors || []).map((actor) => actor.headKey));
  const structuralHeads = verse.artifacts.filter((artifact) => actorHeads.has(artifact.key) && isStructuralKind(artifact.visualKind));
  const historical = selectHistoricalLandmarks(verse.artifacts.filter((artifact) => !actorHeads.has(artifact.key) && isStructuralKind(artifact.visualKind)));
  const landmarks = [...structuralHeads, ...historical];
  const landmarkGroups = new Map();
  for (const artifact of landmarks) {
    const district = districtForVisualKind(artifact.visualKind, artifact.key);
    if (!landmarkGroups.has(district)) landmarkGroups.set(district, []);
    landmarkGroups.get(district).push(artifact);
  }
  for (const [district, artifacts] of landmarkGroups.entries()) {
    const available = artifacts.filter((artifact) => !positions.has(artifact.key));
    const rect = shrinkRect(districts[district] || districts.watch, 10);
    const points = gridPoints(available.slice().sort((a, b) => a.key.localeCompare(b.key)), rect, `${verse.id}:landmark`);
    available.slice().sort((a, b) => a.key.localeCompare(b.key)).forEach((artifact, index) => positions.set(artifact.key, points[index]));
  }
  return { positions, landmarks };
}

function districtRects(box) {
  const x = box.x + 52, y = box.y + 132, w = box.w - 104, h = box.h - 188;
  return {
    crown: { x, y, w: w * .29, h: h * .42 },
    watch: { x: x + w * .34, y, w: w * .32, h: h * .42 },
    passage: { x: x + w * .71, y, w: w * .29, h: h * .42 },
    commonsWest: { x, y: y + h * .51, w: w * .48, h: h * .49 },
    commonsEast: { x: x + w * .52, y: y + h * .51, w: w * .48, h: h * .49 }
  };
}
function districtForActor(actor) { return districtForVisualKind(actor.visualKind, actor.headKey); }
function districtForVisualKind(kind, seed) {
  if (['castle', 'monolith'].includes(kind)) return 'crown';
  if (['observatory', 'beacon'].includes(kind)) return 'watch';
  if (['gate', 'bridge-marker', 'harbor'].includes(kind)) return 'passage';
  return hashSmall(seed) % 2 ? 'commonsWest' : 'commonsEast';
}
function gridPoints(items, rect, seed) {
  const count = Math.max(1, items.length);
  const ratio = Math.max(.6, rect.w / Math.max(1, rect.h));
  const columns = Math.max(1, Math.ceil(Math.sqrt(count * ratio)));
  const rows = Math.max(1, Math.ceil(count / columns));
  const cellW = rect.w / columns, cellH = rect.h / rows;
  return items.map((item, index) => {
    const column = index % columns, row = Math.floor(index / columns);
    const token = String(item.headKey || item.key || index);
    const jitterX = Math.min(5, cellW * .12) * (((hashSmall(`${seed}:${token}:x`) % 200) / 100) - 1);
    const jitterY = Math.min(4, cellH * .12) * (((hashSmall(`${seed}:${token}:y`) % 200) / 100) - 1);
    return { x: rect.x + cellW * (column + .5) + jitterX, y: rect.y + cellH * (row + .5) + jitterY };
  });
}
function memoryDirection(seed) {
  const directions = [{ x: -1, y: .25 }, { x: 1, y: .25 }, { x: -.35, y: -1 }, { x: .35, y: -1 }];
  return directions[hashSmall(seed) % directions.length];
}
function selectHistoricalLandmarks(artifacts) {
  const byKind = new Map();
  for (const artifact of artifacts) {
    if (!byKind.has(artifact.visualKind)) byKind.set(artifact.visualKind, artifact);
  }
  return Array.from(byKind.values()).slice(0, 6);
}
function isStructuralKind(kind) { return ['castle', 'observatory', 'gate', 'monolith', 'beacon', 'harbor', 'bridge-marker'].includes(String(kind || '')); }
function shrinkRect(rect, amount) { return { x: rect.x + amount, y: rect.y + amount, w: Math.max(1, rect.w - amount * 2), h: Math.max(1, rect.h - amount * 2) }; }
function groupPortalEdges(edges = []) {
  const groups = new Map();
  for (const edge of edges) {
    const ids = [edge.fromVerseId, edge.toVerseId].sort();
    const key = `${ids[0]}<->${ids[1]}`;
    if (!groups.has(key)) groups.set(key, { key, fromVerseId: ids[0], toVerseId: ids[1], edges: [] });
    groups.get(key).edges.push(edge);
  }
  return Array.from(groups.values()).sort((a, b) => a.key.localeCompare(b.key));
}
function boundaryPoint(from, toward) {
  const cx = from.x + from.w / 2, cy = from.y + from.h / 2;
  const tx = toward.x + toward.w / 2, ty = toward.y + toward.h / 2;
  const dx = tx - cx, dy = ty - cy;
  if (Math.abs(dx) >= Math.abs(dy)) return { x: dx >= 0 ? from.x + from.w - 8 : from.x + 8, y: cy + (dy / Math.max(1, Math.abs(dx))) * from.h * .18 };
  return { x: cx + (dx / Math.max(1, Math.abs(dy))) * from.w * .18, y: dy >= 0 ? from.y + from.h - 18 : from.y + 66 };
}
function steppedPath(from, to) {
  const midX = Math.round((from.x + to.x) / 2);
  return `M ${Math.round(from.x)} ${Math.round(from.y)} H ${midX} V ${Math.round(to.y)} H ${Math.round(to.x)}`;
}
function eventGlyph(kind) { return kind === 'realm' ? '▣' : kind === 'split' ? '↯' : kind === 'portal' ? '◇' : kind === 'advance' ? '→' : '+'; }
function eventLabel(kind) { return kind === 'realm' ? 'A realm entered observation' : kind === 'split' ? 'A lineage divided' : kind === 'portal' ? 'World gate resolved' : kind === 'advance' ? 'A lineage moved forward' : 'A lineage appeared'; }
function withSetItem(current, value) { const next = new Set(current instanceof Set ? current : []); next.add(value); return next; }
function hashSmall(value) { let hash = 2166136261; for (const char of String(value || '')) { hash ^= char.charCodeAt(0); hash = Math.imul(hash, 16777619); } return hash >>> 0; }

function useReducedMotion() {
  const [reduced, setReduced] = useState(() => typeof window !== 'undefined' && typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false);
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return undefined;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const listener = () => setReduced(media.matches);
    media.addEventListener?.('change', listener);
    return () => media.removeEventListener?.('change', listener);
  }, []);
  return reduced;
}
