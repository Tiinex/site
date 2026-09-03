import React, { useMemo, useRef, useState } from 'react';
import { usePlaythingsCamera } from './playthings.camera.react.js';
import { generatePlaythingsWorld, playthingsRestingAssignment, playthingsTerrainMarks, playthingsVisibleRoads, playthingsVisibleWorldBounds } from './playthings.world.js';
import { planPlaythingsEventMotion, pointOnPolyline, samplePlaythingsEventMotion } from './playthings.motion.js';
import { playthingsShirtColor, playthingsVariant } from './playthings.seed.js';
import { playthingsLeafIdleState } from './playthings.clock.js';
import { isPlaythingsLocalArtifact } from './playthings.find.js';
import { InteractionSpark, PixelOrganizationPlace, PixelPlaything, PixelWorkspacePlace, PlaythingsSceneArtwork, TerrainMark } from './playthings.artwork.jsx';

export function PlaythingsWorldStage({ model, fullModel = model, activeEvent, playing = false, eventToken = 0, eventCount = 1, playheadMs = NaN, followPlaything = false, onFollowPlaythingChange, onEventComplete, onOpenRecord, onOpenLineage, toolsEnabled = false, unlockedSkillIds = [], onResolveTransitions = null, onActivateTransition = null, focusRequest = null }) {
  const world = useMemo(() => generatePlaythingsWorld(fullModel), [fullModel]);
  const terrain = useMemo(() => playthingsTerrainMarks(world.width, world.height), [world.width, world.height]);
  const followLocked = Boolean(followPlaything && playing && activeEvent);
  const camera = usePlaythingsCamera(world.width, world.height, { locked: followLocked });
  const [hoveredHead, setHoveredHead] = useState('');
  const [selection, setSelection] = useState(null);
  React.useEffect(() => { const close = (event) => { if (event.key === 'Escape') setSelection(null); }; window.addEventListener('keydown', close); return () => window.removeEventListener('keydown', close); }, []);
  const artifactByKey = useMemo(() => new Map((fullModel.artifacts || []).map((artifact) => [artifact.key, artifact])), [fullModel.artifacts]);
  const actorByKey = useMemo(() => new Map((model.actors || []).map((actor) => [actor.headKey, actor])), [model.actors]);
  const actorById = useMemo(() => new Map((model.actors || []).map((actor) => [actor.id, actor])), [model.actors]);
  const visibleKeys = useMemo(() => new Set((model.artifacts || []).map((artifact) => artifact.key)), [model.artifacts]);
  const activeProjection = activeEvent ? world.eventProjection.get(activeEvent.id) || null : null;
  const activeRestingMigrations = activeEvent ? world.restingMigrationsByEvent?.get(activeEvent.id) || [] : [];
  const migratingKeys = useMemo(() => new Set(activeRestingMigrations.map((migration) => migration.headKey)), [activeRestingMigrations]);
  const hoveredActor = hoveredHead ? actorByKey.get(hoveredHead) || null : null;
  const selectedActor = selection?.kind === 'actor' ? actorById.get(selection.id) || null : null;
  const selectedArtifactKey = String(selection?.artifactKey || selectedActor?.headKey || '');
  const selectedArtifact = selectedArtifactKey ? artifactByKey.get(selectedArtifactKey) || null : null;
  const selectedStructure = selection?.kind === 'structure' ? world.structuresByArtifact?.get(selection.artifactKey) || null : null;
  const historyActor = selectedActor || hoveredActor;
  const unlockedSkills = useMemo(() => new Set(unlockedSkillIds || []), [unlockedSkillIds]);
  // Transition qualification is intentionally lazy. With large carried workspaces
  // resolving every living leaf on every render turns a hover affordance into an
  // O(population × transition-qualification) render cost. Only the focused leaf
  // asks Tiinex for currently valid transitions.
  const hoveredTransitionOptions = useMemo(() => {
    const interactionHead = selectedActor?.headKey || hoveredHead;
    if (!toolsEnabled || !interactionHead || typeof onResolveTransitions !== 'function') return [];
    const actor = actorByKey.get(interactionHead);
    const artifact = actor ? artifactByKey.get(actor.headKey) : null;
    if (!artifact) return [];
    return (onResolveTransitions(artifact.recordId, artifact.workspaceId) || [])
      .filter((action) => unlockedSkills.has(transitionSchemaId(action)));
  }, [toolsEnabled, hoveredHead, selectedActor?.headKey, onResolveTransitions, actorByKey, artifactByKey, unlockedSkills]);
  const hiddenSourceKey = activeEvent?.kind === 'advance' && activeProjection?.arrivalReason !== 'organization-receiver' ? activeProjection.sourceKey : '';
  const actorStates = useMemo(() => {
    const map = new Map();
    for (const actor of model.actors || []) {
      const artifact = artifactByKey.get(actor.headKey);
      const point = world.actorPositions.get(actor.headKey);
      if (!artifact || !point) continue;
      map.set(actor.headKey, playthingsRestingAssignment(world, artifact, point, playheadMs, visibleKeys));
    }
    return map;
  }, [model.actors, artifactByKey, world, playheadMs, visibleKeys]);
  const restingByStructure = useMemo(() => {
    const map = new Map();
    for (const [headKey, state] of actorStates) {
      if (state.state !== 'resting' || !state.structure || migratingKeys.has(headKey)) continue;
      if (!map.has(state.structure.artifactKey)) map.set(state.structure.artifactKey, []);
      map.get(state.structure.artifactKey).push(headKey);
    }
    return map;
  }, [actorStates, migratingKeys]);
  const visibleActorKeys = useMemo(() => (model.actors || []).map((actor) => actor.headKey).filter((headKey) => headKey !== hiddenSourceKey && !migratingKeys.has(headKey) && !(actorStates.get(headKey)?.state === 'resting' && actorStates.get(headKey)?.structure)), [model.actors, hiddenSourceKey, migratingKeys, actorStates]);
  const visibleRoads = useMemo(() => playthingsVisibleRoads(world, visibleKeys), [world, visibleKeys]);
  const fitBounds = useMemo(() => playthingsVisibleWorldBounds(world, visibleKeys, visibleActorKeys, activeProjection), [world, visibleKeys, visibleActorKeys, activeProjection]);

  React.useEffect(() => {
    const key = String(focusRequest?.artifactKey || '');
    if (!key || !visibleKeys.has(key)) return;
    const structure = world.structuresByArtifact?.get(key) || null;
    const actor = (model.actors || []).find((candidate) => candidate.headKey === key || candidate.ancestry?.includes(key)) || null;
    if (actor) {
      setSelection({ kind: 'actor', id: actor.id, artifactKey: key });
      const point = world.scenePositions.get(key) || world.actorPositions.get(actor.headKey);
      if (point) camera.follow(point);
      return;
    }
    if (structure) {
      setSelection({ kind: 'structure', artifactKey: key });
      camera.follow(structure.point);
      return;
    }
    const point = world.scenePositions.get(key);
    if (point) { setSelection({ kind: 'artifact', artifactKey: key }); camera.follow(point); }
  }, [focusRequest?.token, model.artifacts?.length]);

  function motionSample(sample) {
    if (followLocked) camera.follow(sample.position);
  }

  return <div ref={camera.setViewport} className={`tx-playthings-stage-wrap ${followLocked ? 'is-follow-locked' : ''}`} {...camera.handlers}>
    <svg className="tx-playthings-stage" viewBox={camera.viewBox} preserveAspectRatio="xMidYMid meet" role="img" aria-label="Playthings shared world" shapeRendering="crispEdges">
      <defs>
        <filter id="playthings-world-glow" x="-90%" y="-90%" width="280%" height="280%"><feGaussianBlur stdDeviation="3.5" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>
      <rect className="tx-playthings-earth" x="0" y="0" width={world.width} height={world.height} />
      <g className="tx-playthings-terrain-layer" aria-hidden="true">{terrain.map((mark, index) => <TerrainMark key={index} {...mark} />)}</g>
      <g className="tx-playthings-road-layer" aria-hidden="true">{visibleRoads.map((road) => <g key={road.key}><path className={`tx-playthings-road-underlay is-${road.kind}`} d={`M ${road.a.x} ${road.a.y} L ${road.b.x} ${road.b.y}`} /><path className={`tx-playthings-road-core is-${road.kind}`} d={`M ${road.a.x} ${road.a.y} L ${road.b.x} ${road.b.y}`} /></g>)}</g>

      {historyActor ? <LineageTesseract actor={historyActor} world={world} artifactByKey={artifactByKey} pinned={Boolean(selectedActor)} selectedArtifactKey={selectedArtifactKey} /> : null}

      <g className="tx-playthings-structures">
        {world.structures.filter((structure) => visibleKeys.has(structure.artifactKey)).map((structure) => {
          const artifact = artifactByKey.get(structure.artifactKey);
          if (!artifact) return null;
          const restingKeys = restingByStructure.get(structure.artifactKey) || [];
          return <PersistentStructure key={structure.artifactKey} structure={structure} artifact={artifact} restingCount={restingKeys.length} selected={selection?.kind === 'structure' && selection.artifactKey === structure.artifactKey} onSelect={() => setSelection((current) => current?.kind === 'structure' && current.artifactKey === structure.artifactKey ? null : { kind: 'structure', artifactKey: structure.artifactKey })} />;
        })}
      </g>

      <g className="tx-playthings-living-leaves">
        {(model.actors || []).map((actor) => {
          const artifact = artifactByKey.get(actor.headKey);
          const point = world.actorPositions.get(actor.headKey);
          const idle = actorStates.get(actor.headKey) || playthingsLeafIdleState(artifact?.createdAt, playheadMs);
          if (!artifact || !point) return null;
          const suppressed = actor.headKey === hiddenSourceKey || migratingKeys.has(actor.headKey) || (idle.state === 'resting' && idle.structure);
          const isSelected = selection?.kind === 'actor' && selection.id === actor.id;
          const transitionOptions = (isSelected || hoveredHead === actor.headKey) ? hoveredTransitionOptions : [];
          const localArtifacts = (actor.ancestry || []).map((key) => artifactByKey.get(key)).filter(isPlaythingsLocalArtifact);
          return <LivingPlaything key={actor.id || actor.headKey} actor={actor} artifact={artifact} point={point} idle={idle} suppressed={suppressed} selected={isSelected} localCount={localArtifacts.length} highlighted={hoveredHead === actor.headKey || isSelected} onHover={setHoveredHead} onSelect={() => setSelection((current) => current?.kind === 'actor' && current.id === actor.id ? null : { kind: 'actor', id: actor.id, artifactKey: actor.headKey })} transitionOptions={transitionOptions} onActivateTransition={(action) => onActivateTransition?.(artifact.recordId, artifact.workspaceId, action)} />;
        })}
      </g>

      {activeProjection && activeEvent?.artifactKey ? <ActiveEventSequence
        key={`${activeEvent.id}:${eventToken}`}
        event={activeEvent}
        projection={activeProjection}
        artifact={artifactByKey.get(activeEvent.artifactKey)}
        roleIdentity={artifactByKey.get(activeEvent.artifactKey)?.roleIdentity || actorByKey.get(activeProjection.sourceKey)?.roleIdentity || artifactByKey.get(activeProjection.sourceKey)?.roleIdentity || ''}
        eventCount={eventCount}
        playing={playing}
        restingMigrations={activeRestingMigrations}
        actorByKey={actorByKey}
        artifactByKey={artifactByKey}
        onSample={motionSample}
        onComplete={onEventComplete}
      /> : null}
      {selection ? <WorldSelectionMenu
        actor={selectedActor ? { ...selectedActor, menuPoint: world.scenePositions.get(selectedArtifactKey) || world.actorPositions.get(selectedActor.headKey) || null } : null}
        structure={selectedStructure}
        artifact={selectedArtifact || (selectedStructure ? artifactByKey.get(selectedStructure.artifactKey) : null)}
        transitionOptions={selectedActor ? hoveredTransitionOptions : []}
        onOpenRecord={onOpenRecord}
        onOpenLineage={onOpenLineage}
        artifactPoint={selectedArtifactKey ? world.scenePositions.get(selectedArtifactKey) || null : null}
        onCenter={(point) => camera.follow(point)}
        onActivateTransition={onActivateTransition}
        onClose={() => setSelection(null)}
      /> : null}
    </svg>
    <div className="tx-playthings-camera-controls" onPointerDown={(event) => event.stopPropagation()} onClick={(event) => event.stopPropagation()}>
      <button type="button" className={`tx-playthings-follow-toggle ${followPlaything ? 'is-on' : ''}`} onClick={() => onFollowPlaythingChange?.(!followPlaything)} aria-pressed={followPlaything}>{followPlaything ? 'Follow: ON' : 'Follow'}</button>
      <button type="button" className="tx-playthings-camera-reset" onClick={() => camera.fit(fitBounds)}>Fit world</button>
      <span className="tx-playthings-camera-help">{followLocked ? 'camera locked · wheel zoom' : 'WASD · drag · wheel'}</span>
    </div>
  </div>;
}

function PersistentStructure({ structure, artifact, restingCount = 0, selected = false, onSelect }) {
  return <g className={`tx-playthings-persistent-structure is-${structure.kind} ${selected ? 'is-selected' : ''}`} transform={`translate(${structure.point.x} ${structure.point.y})`} tabIndex="0" role="button" onPointerDown={(event) => event.stopPropagation()} onClick={(event) => { event.stopPropagation(); onSelect?.(); }} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onSelect?.(); } }}>
    <title>{`${artifact.title}\n${artifact.schemaId}\nBuilt by observed lineage history\n${restingCount ? `${restingCount} resting Playthings\n` : ''}Click for actions · Presentation only`}</title>
    <ellipse className="tx-playthings-structure-shadow" cx="0" cy="22" rx="31" ry="7" />
    {structure.kind === 'organization' ? <PixelOrganizationPlace depth={structure.organizationDepth} /> : null}
    {structure.kind === 'workspace' ? <PixelWorkspacePlace clusterSize={structure.clusterSize} /> : null}
    {restingCount > 0 ? <g className="tx-playthings-resting-badge" transform="translate(28 -28)"><rect x="-10" y="-8" width="20" height="16" /><text x="0" y="4">z×{restingCount}</text></g> : null}
  </g>;
}

function LivingPlaything({ actor, artifact, point, idle, suppressed = false, selected = false, localCount = 0, highlighted, onHover, onSelect, transitionOptions = [], onActivateTransition }) {
  const seed = actor.presentationSeed || artifact.presentationSeed || actor.id || artifact.key;
  return <g className={`tx-playthings-actor idle-${idle.state} ${highlighted ? 'is-tesseract-focus' : ''} ${selected ? 'is-selected' : ''} ${suppressed ? 'is-continuity-suppressed' : ''}`} transform={`translate(${point.x} ${point.y})`} visibility={suppressed ? 'hidden' : undefined} tabIndex={suppressed ? -1 : 0} role="button" aria-hidden={suppressed ? 'true' : undefined} aria-label={`${artifact.title}, living lineage leaf`} onPointerDown={(event) => event.stopPropagation()} onMouseEnter={() => !suppressed && onHover(actor.headKey)} onMouseLeave={() => onHover('')} onFocus={() => !suppressed && onHover(actor.headKey)} onBlur={() => onHover('')} onClick={(event) => { event.stopPropagation(); if (!suppressed) onSelect?.(); }} onKeyDown={(event) => { if (!suppressed && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); onSelect?.(); } }}>
    <title>{`${artifact.title}\n${artifact.schemaId}\n${artifact.repo}\n${actor.generations || 0} generations\n${actor.roleLabel ? `role livery: ${actor.roleLabel}\n` : ''}${idle.state === 'normal' ? 'active leaf' : `${idle.state} · ${idle.days.toFixed(1)} relative days`}\nClick for lineage/actions`}</title>
    <ellipse className="tx-playthings-actor-shadow" cx="0" cy="14" rx="10" ry="3" />
    <PixelPlaything role={artifact.visualKind} roleIdentity={actor.roleIdentity || artifact.roleIdentity || ''} branchDepth={actor.branchDepth || 0} variant={playthingsVariant(seed)} shirtColor={playthingsShirtColor(seed)} idleState={idle.state} />
    {idle.state === 'resting' && !idle.structure ? <g className="tx-playthings-sleep-mark"><text x="13" y="-14">z</text><text x="19" y="-20">z</text></g> : null}
    {localCount > 0 ? <g className="tx-playthings-local-beacon" transform="translate(12 -19)"><path d="M 0 -5 L 5 0 L 0 5 L -5 0 Z" /><text x="0" y="2">L</text></g> : null}
    {selected ? <circle className="tx-playthings-selection-ring" r="19" /> : null}
  </g>;
}

function WorldSelectionMenu({ actor, structure, artifact, artifactPoint = null, transitionOptions = [], onOpenRecord, onOpenLineage, onCenter, onActivateTransition, onClose }) {
  if (!artifact) return null;
  const point = actor ? null : structure?.point || artifactPoint || null;
  const anchor = actor ? null : point;
  // Actor position is resolved from the currently visible head in the caller's world map;
  // structure points are already stable world coordinates. For actors, use a lightweight
  // menu offset supplied through the artifact presentation position below.
  const menuPoint = anchor || structure?.point || { x: 0, y: 0 };
  // When an actor is selected the caller attaches its current point for menu placement.
  const resolved = actor?.menuPoint || menuPoint;
  const rows = [
    { id: 'lineage', label: 'LINEAGE VERSE', run: () => onOpenLineage?.(artifact.recordId, artifact.workspaceId) },
    { id: 'detail', label: 'ARTIFACT DETAIL', run: () => onOpenRecord?.(artifact.recordId, artifact.workspaceId) },
    { id: 'center', label: 'CENTER CAMERA', run: () => onCenter?.(resolved) }
  ];
  const transitions = transitionOptions.slice(0, 4);
  const width = 154, rowHeight = 20, height = 30 + rows.length * rowHeight + (transitions.length ? 9 + transitions.length * rowHeight : 0);
  return <g className="tx-playthings-selection-menu" transform={`translate(${resolved.x + 24} ${resolved.y - 44})`} onPointerDown={(event) => event.stopPropagation()} onClick={(event) => event.stopPropagation()}>
    <rect className="panel" x="0" y="0" width={width} height={height} rx="3" />
    <text className="title" x="8" y="13">{compactTransitionLabel(artifact.title || 'PLAYTHING')}</text>
    <text className="close" x={width - 12} y="13" role="button" tabIndex="0" onClick={() => onClose?.()}>×</text>
    {rows.map((item, index) => <g key={item.id} className="action" transform={`translate(7 ${21 + index * rowHeight})`} role="button" tabIndex="0" onClick={item.run} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); item.run(); } }}><rect x="0" y="0" width={width - 14} height={16} rx="2" /><text x="6" y="11">{item.label}</text></g>)}
    {transitions.length ? <g transform={`translate(7 ${24 + rows.length * rowHeight})`}><text className="section" x="0" y="8">VALID + UNLOCKED</text>{transitions.map((action, index) => <g key={action.id || action.definitionKey || index} className="action transition" transform={`translate(0 ${12 + index * rowHeight})`} role="button" tabIndex="0" onClick={() => onActivateTransition?.(artifact.recordId, artifact.workspaceId, action)}><rect x="0" y="0" width={width - 14} height={16} rx="2" /><text x="6" y="11">＋ {compactTransitionLabel(action?.authoring?.schemaLabel || action?.label || transitionSchemaId(action))}</text></g>)}</g> : null}
  </g>;
}

function transitionSchemaId(action = {}) { return String(action?.authoring?.schemaId || action?.targetSchemaId || '').trim(); }
function compactTransitionLabel(value = '') { const text = String(value || '').trim(); return text.length > 17 ? `${text.slice(0, 16)}…` : text; }

function ActiveEventSequence({ event, projection, artifact, roleIdentity = '', eventCount, playing, restingMigrations = [], actorByKey, artifactByKey, onSample, onComplete }) {
  const baseMotion = useMemo(() => planPlaythingsEventMotion(event, projection, { eventCount }), [event, projection, eventCount]);
  const lifecycleDuration = useMemo(() => Math.max(0, ...restingMigrations.map((migration) => Number(migration.durationMs || 0))), [restingMigrations]);
  const motion = useMemo(() => Object.freeze({ ...baseMotion, totalMs: Math.max(baseMotion.totalMs, lifecycleDuration) }), [baseMotion, lifecycleDuration]);
  const [sample, setSample] = useState(() => samplePlaythingsEventMotion(motion, 0));
  const onSampleRef = useRef(onSample);
  const onCompleteRef = useRef(onComplete);
  React.useEffect(() => { onSampleRef.current = onSample; }, [onSample]);
  React.useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);
  React.useEffect(() => { setSample(samplePlaythingsEventMotion(motion, 0)); }, [motion]);
  React.useEffect(() => {
    if (!playing) return undefined;
    let frameId = 0, last = null, elapsed = sample.elapsedMs || 0, done = false;
    const tick = (now) => {
      if (last == null) last = now;
      const delta = Math.min(50, Math.max(0, now - last)); last = now;
      elapsed = Math.min(motion.totalMs, elapsed + delta);
      const next = samplePlaythingsEventMotion(motion, elapsed);
      setSample(next); onSampleRef.current?.(next);
      if (next.done) { if (!done) { done = true; onCompleteRef.current?.(); } return; }
      frameId = window.requestAnimationFrame(tick);
    };
    frameId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frameId);
  }, [playing, motion]);

  if (!artifact) return null;
  const seed = projection.visualSeed || artifact.presentationSeed || artifact.key;
  const structure = projection.structure;
  const scenePoint = projection.scenePoint || projection.actorPoint || { x: 0, y: 0 };
  const splitPoint = projection.sourcePoint || projection.branchPoint || scenePoint;
  return <g className={`tx-playthings-active-sequence is-${event.kind} arrival-${projection.arrivalReason || event.kind}`}>
    {event.kind === 'split' && sample.splitFlash > 0 ? <g className="tx-playthings-split-flash" transform={`translate(${splitPoint.x} ${splitPoint.y}) scale(${0.5 + sample.splitFlash * 0.9}) rotate(${sample.splitFlash * 80})`} opacity={sample.splitFlash}><rect x="-15" y="-15" width="30" height="30" /></g> : null}
    {structure && sample.structureProgress > 0 ? <g className={`tx-playthings-persistent-structure is-${structure.kind} is-building-live`} transform={`translate(${structure.point.x} ${structure.point.y})`} opacity="1" aria-hidden="true">
      <ellipse className="tx-playthings-structure-shadow" cx="0" cy="22" rx="31" ry="7" />
      <g className="tx-playthings-live-build-art" transform={`scale(${0.72 + sample.structureProgress * 0.28} ${Math.max(0.04, sample.structureProgress)})`}>
        {structure.kind === 'organization' ? <PixelOrganizationPlace depth={structure.organizationDepth} /> : null}
        {structure.kind === 'workspace' ? <PixelWorkspacePlace clusterSize={structure.clusterSize} /> : null}
      </g>
      <g className="tx-playthings-build-sparks-live"><rect x="-35" y="-30" width="4" height="4" /><rect x="30" y="-17" width="3" height="3" /><rect x="12" y="-40" width="3" height="3" /></g>
    </g> : null}
    {!projection.persistent && sample.sceneOpacity > 0 ? <g className={`tx-playthings-active-scene interaction-${artifact.interactionKind || 'inspect'}`} transform={`translate(${scenePoint.x} ${scenePoint.y}) scale(${0.82 + sample.sceneOpacity * 0.18})`} opacity={sample.sceneOpacity} aria-hidden="true">
      <PlaythingsSceneArtwork interactionKind={artifact.interactionKind} /><InteractionSpark kind={artifact.interactionKind} /><text x="0" y="31">{sceneVerb(artifact.interactionKind)}</text>
    </g> : null}
    <g className="tx-playthings-event-focus" transform={`translate(${artifact.isSchemaArtifact ? scenePoint.x : sample.position.x} ${artifact.isSchemaArtifact ? scenePoint.y : sample.position.y})`} opacity={Math.max(0.18, 1 - sample.progress * 0.7)} aria-hidden="true"><circle r="18" /><circle className="outer" r="25" /></g>
    {!artifact.isSchemaArtifact && sample.dustOpacity > 0 ? <g className="tx-playthings-motion-dust" transform={`translate(${sample.position.x} ${sample.position.y + 13})`} opacity={sample.dustOpacity} aria-hidden="true"><rect x="-12" y="0" width="4" height="2" /><rect x="7" y="-2" width="3" height="2" /></g> : null}
    {restingMigrations.length ? <RestingMigrationLayer migrations={restingMigrations} elapsedMs={sample.elapsedMs} actorByKey={actorByKey} artifactByKey={artifactByKey} /> : null}
    {!artifact.isSchemaArtifact ? <g className="tx-playthings-traveller" transform={`translate(${sample.position.x} ${sample.position.y})`}>
      <ellipse className="tx-playthings-actor-shadow" cx="0" cy="14" rx="10" ry="3" />
      <g className="tx-playthings-live-sprite-transform" transform={`translate(0 ${sample.bob}) scale(${sample.scaleX} ${sample.scaleY}) skewX(${sample.lean * 18})`}>
        <PixelPlaything role={artifact.visualKind} roleIdentity={roleIdentity || artifact.roleIdentity || ''} branchDepth={event.kind === 'split' ? 1 : 0} variant={playthingsVariant(seed)} shirtColor={playthingsShirtColor(seed)} />
      </g>
    </g> : null}
  </g>;
}


function RestingMigrationLayer({ migrations = [], elapsedMs = 0, actorByKey, artifactByKey }) {
  return <g className="tx-playthings-resting-migrations" aria-hidden="true">
    {migrations.map((migration) => {
      const actor = actorByKey?.get(migration.headKey);
      const artifact = artifactByKey?.get(migration.artifactKey);
      if (!actor || !artifact) return null;
      const duration = Math.max(1, Number(migration.durationMs || 1));
      const progress = Math.max(0, Math.min(1, Number(elapsedMs || 0) / duration));
      const eased = progress * progress * (3 - 2 * progress);
      const position = pointOnPolyline(migration.motionPoints || [migration.from, migration.to], eased);
      const walk = progress < 1 ? Math.sin((Number(elapsedMs || 0) / 115) * Math.PI * 2) : 0;
      const seed = actor.presentationSeed || artifact.presentationSeed || actor.id || artifact.key;
      return <g key={migration.headKey} className="tx-playthings-resting-migrant" transform={`translate(${position.x} ${position.y})`}>
        <ellipse className="tx-playthings-actor-shadow" cx="0" cy="14" rx="10" ry="3" />
        <g transform={`translate(0 ${progress < 1 ? -Math.abs(walk) * 2 : 0})`}>
          <PixelPlaything role={artifact.visualKind} roleIdentity={actor.roleIdentity || artifact.roleIdentity || ''} branchDepth={actor.branchDepth || 0} variant={playthingsVariant(seed)} shirtColor={playthingsShirtColor(seed)} idleState={progress > .82 ? 'resting' : 'long-idle'} />
        </g>
        {progress > .86 ? <g className="tx-playthings-sleep-mark"><text x="13" y="-14">z</text></g> : null}
      </g>;
    })}
  </g>;
}

function LineageTesseract({ actor, world, artifactByKey, pinned = false, selectedArtifactKey = '' }) {
  const keys = Array.isArray(actor.ancestry) ? actor.ancestry : [];
  const points = keys.map((key) => ({ key, point: world.actorPositions.get(key) || world.scenePositions.get(key), artifact: artifactByKey.get(key) })).filter((entry) => entry.point && entry.artifact);
  if (points.length < 2) return null;
  const path = points.map((entry, index) => `${index ? 'L' : 'M'} ${entry.point.x} ${entry.point.y}`).join(' ');
  const seed = actor.presentationSeed || actor.id || actor.headKey;
  return <g className={`tx-playthings-tesseract ${pinned ? 'is-pinned' : ''}`} aria-hidden="true"><path className="tx-playthings-tesseract-line" d={path} />{points.map((entry, index) => {
    const current = index === points.length - 1;
    const exact = entry.key === selectedArtifactKey;
    if (current && !exact) return null;
    return <g key={entry.key} className={`tx-playthings-tesseract-echo ${exact ? 'is-exact-artifact' : ''}`} transform={`translate(${entry.point.x} ${entry.point.y})`}>{entry.artifact.isSchemaArtifact ? <PlaythingsSceneArtwork interactionKind="blueprint" /> : <PixelPlaything role={entry.artifact.visualKind} roleIdentity={entry.artifact.roleIdentity || ''} variant={playthingsVariant(seed)} shirtColor={playthingsShirtColor(seed)} ghost={!exact} />}<circle r={18 + Math.min(10, index)} />{exact ? <text className="exact-label" x="0" y="-27">THIS ARTIFACT</text> : null}</g>;
  })}</g>;
}

function sceneVerb(kind) {
  if (kind === 'work' || kind === 'build' || kind === 'build-workspace') return 'WORKING';
  if (kind === 'receive' || kind === 'pass') return 'RECEIVING';
  if (kind === 'observe' || kind === 'read') return 'OBSERVING';
  if (kind === 'blueprint') return 'BLUEPRINT OBSERVED';
  if (kind === 'signal') return 'CALLING';
  if (kind === 'feedback') return 'FEEDBACK';
  if (kind === 'interpret') return 'INTERPRETING';
  if (kind === 'notice') return 'NOTICING';
  if (kind === 'arrange') return 'ARRANGING';
  if (kind === 'decide') return 'DECIDING';
  if (kind === 'connect') return 'CONNECTING';
  if (kind === 'preserve') return 'PRESERVING';
  if (kind === 'attest') return 'HANDLING EVIDENCE';
  return 'INTERACTING';
}
