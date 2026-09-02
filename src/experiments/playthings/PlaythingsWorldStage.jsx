import React, { useMemo, useState } from 'react';
import { usePlaythingsCamera } from './playthings.camera.react.js';
import { generatePlaythingsWorld, playthingsRestingAssignment, playthingsTerrainMarks, playthingsVisibleWorldBounds } from './playthings.world.js';
import { planPlaythingsEventMotion, samplePlaythingsEventMotion } from './playthings.motion.js';
import { playthingsShirtColor, playthingsVariant } from './playthings.seed.js';
import { playthingsLeafIdleState } from './playthings.clock.js';
import { InteractionSpark, PixelOrganizationPlace, PixelPlaything, PixelWorkspacePlace, PlaythingsSceneArtwork, TerrainMark } from './playthings.artwork.jsx';

export function PlaythingsWorldStage({ model, fullModel = model, activeEvent, playing = false, eventToken = 0, eventCount = 1, playheadMs = NaN, followPlaything = false, onFollowPlaythingChange, onEventComplete, onOpenRecord, toolsEnabled = false, unlockedSkillIds = [], onResolveTransitions = null, onActivateTransition = null }) {
  const world = useMemo(() => generatePlaythingsWorld(fullModel), [fullModel]);
  const terrain = useMemo(() => playthingsTerrainMarks(world.width, world.height), [world.width, world.height]);
  const followLocked = Boolean(followPlaything && playing && activeEvent);
  const camera = usePlaythingsCamera(world.width, world.height, { locked: followLocked });
  const [hoveredHead, setHoveredHead] = useState('');
  const artifactByKey = useMemo(() => new Map((fullModel.artifacts || []).map((artifact) => [artifact.key, artifact])), [fullModel.artifacts]);
  const actorByKey = useMemo(() => new Map((model.actors || []).map((actor) => [actor.headKey, actor])), [model.actors]);
  const visibleKeys = useMemo(() => new Set((model.artifacts || []).map((artifact) => artifact.key)), [model.artifacts]);
  const activeProjection = activeEvent ? world.eventProjection.get(activeEvent.id) || null : null;
  const hoveredActor = hoveredHead ? actorByKey.get(hoveredHead) || null : null;
  const unlockedSkills = useMemo(() => new Set(unlockedSkillIds || []), [unlockedSkillIds]);
  const hiddenSourceKey = activeEvent?.kind === 'advance' && activeProjection?.arrivalReason !== 'organization-receiver' ? activeProjection.sourceKey : '';
  const actorStates = useMemo(() => {
    const map = new Map();
    for (const actor of model.actors || []) {
      const artifact = artifactByKey.get(actor.headKey);
      const point = world.actorPositions.get(actor.headKey);
      if (!artifact || !point) continue;
      map.set(actor.headKey, playthingsRestingAssignment(world, artifact, point, playheadMs));
    }
    return map;
  }, [model.actors, artifactByKey, world, playheadMs]);
  const restingByStructure = useMemo(() => {
    const map = new Map();
    for (const [headKey, state] of actorStates) {
      if (state.state !== 'resting' || !state.structure) continue;
      if (!map.has(state.structure.artifactKey)) map.set(state.structure.artifactKey, []);
      map.get(state.structure.artifactKey).push(headKey);
    }
    return map;
  }, [actorStates]);
  const visibleActorKeys = useMemo(() => (model.actors || []).map((actor) => actor.headKey).filter((headKey) => headKey !== hiddenSourceKey && !(actorStates.get(headKey)?.state === 'resting' && actorStates.get(headKey)?.structure)), [model.actors, hiddenSourceKey, actorStates]);
  const fitBounds = useMemo(() => playthingsVisibleWorldBounds(world, visibleKeys, visibleActorKeys, activeProjection), [world, visibleKeys, visibleActorKeys, activeProjection]);

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

      {hoveredActor ? <LineageTesseract actor={hoveredActor} world={world} artifactByKey={artifactByKey} /> : null}

      <g className="tx-playthings-structures">
        {world.structures.filter((structure) => visibleKeys.has(structure.artifactKey)).map((structure) => {
          const artifact = artifactByKey.get(structure.artifactKey);
          if (!artifact) return null;
          const restingKeys = restingByStructure.get(structure.artifactKey) || [];
          return <PersistentStructure key={structure.artifactKey} structure={structure} artifact={artifact} restingCount={restingKeys.length} onOpen={() => onOpenRecord?.(artifact.recordId, artifact.workspaceId)} />;
        })}
      </g>

      <g className="tx-playthings-living-leaves">
        {(model.actors || []).map((actor) => {
          const artifact = artifactByKey.get(actor.headKey);
          const point = world.actorPositions.get(actor.headKey);
          const idle = actorStates.get(actor.headKey) || playthingsLeafIdleState(artifact?.createdAt, playheadMs);
          if (!artifact || !point || actor.headKey === hiddenSourceKey || (idle.state === 'resting' && idle.structure)) return null;
          const transitionOptions = toolsEnabled && typeof onResolveTransitions === 'function'
            ? (onResolveTransitions(artifact.recordId, artifact.workspaceId) || []).filter((action) => unlockedSkills.has(transitionSchemaId(action)))
            : [];
          return <LivingPlaything key={actor.id || actor.headKey} actor={actor} artifact={artifact} point={point} idle={idle} highlighted={hoveredHead === actor.headKey} onHover={setHoveredHead} onOpen={() => onOpenRecord?.(artifact.recordId, artifact.workspaceId)} transitionOptions={transitionOptions} onActivateTransition={(action) => onActivateTransition?.(artifact.recordId, artifact.workspaceId, action)} />;
        })}
      </g>

      {activeProjection && activeEvent?.artifactKey ? <ActiveEventSequence
        key={`${activeEvent.id}:${eventToken}`}
        event={activeEvent}
        projection={activeProjection}
        artifact={artifactByKey.get(activeEvent.artifactKey)}
        eventCount={eventCount}
        playing={playing}
        onSample={motionSample}
        onComplete={onEventComplete}
      /> : null}
    </svg>
    <div className="tx-playthings-camera-controls">
      <button type="button" className={`tx-playthings-follow-toggle ${followPlaything ? 'is-on' : ''}`} onClick={() => onFollowPlaythingChange?.(!followPlaything)} aria-pressed={followPlaything}>{followPlaything ? 'Follow: ON' : 'Follow'}</button>
      <button type="button" className="tx-playthings-camera-reset" onClick={() => camera.fit(fitBounds)}>Fit world</button>
      <span className="tx-playthings-camera-help">{followLocked ? 'camera locked · wheel zoom' : 'WASD · drag · wheel'}</span>
    </div>
  </div>;
}

function PersistentStructure({ structure, artifact, restingCount = 0, onOpen }) {
  return <g className={`tx-playthings-persistent-structure is-${structure.kind}`} transform={`translate(${structure.point.x} ${structure.point.y})`} tabIndex="0" role="button" onPointerDown={(event) => event.stopPropagation()} onClick={(event) => { event.stopPropagation(); onOpen?.(); }} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onOpen?.(); } }}>
    <title>{`${artifact.title}\n${artifact.schemaId}\nBuilt by observed lineage history\n${restingCount ? `${restingCount} resting Playthings\n` : ''}Presentation only`}</title>
    <ellipse className="tx-playthings-structure-shadow" cx="0" cy="22" rx="31" ry="7" />
    {structure.kind === 'organization' ? <PixelOrganizationPlace depth={structure.organizationDepth} /> : null}
    {structure.kind === 'workspace' ? <PixelWorkspacePlace clusterSize={structure.clusterSize} /> : null}
    {restingCount > 0 ? <g className="tx-playthings-resting-badge" transform="translate(28 -28)"><rect x="-10" y="-8" width="20" height="16" /><text x="0" y="4">z×{restingCount}</text></g> : null}
  </g>;
}

function LivingPlaything({ actor, artifact, point, idle, highlighted, onHover, onOpen, transitionOptions = [], onActivateTransition }) {
  const seed = actor.presentationSeed || artifact.presentationSeed || actor.id || artifact.key;
  return <g className={`tx-playthings-actor idle-${idle.state} ${highlighted ? 'is-tesseract-focus' : ''}`} transform={`translate(${point.x} ${point.y})`} tabIndex="0" role="button" aria-label={`${artifact.title}, living lineage leaf`} onPointerDown={(event) => event.stopPropagation()} onMouseEnter={() => onHover(actor.headKey)} onMouseLeave={() => onHover('')} onFocus={() => onHover(actor.headKey)} onBlur={() => onHover('')} onClick={(event) => { event.stopPropagation(); onOpen?.(); }} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onOpen?.(); } }}>
    <title>{`${artifact.title}\n${artifact.schemaId}\n${artifact.repo}\n${actor.generations || 0} generations\n${idle.state === 'normal' ? 'active leaf' : `${idle.state} · ${idle.days.toFixed(1)} relative days`}\nCurrent lineage leaf`}</title>
    <ellipse className="tx-playthings-actor-shadow" cx="0" cy="14" rx="10" ry="3" />
    <PixelPlaything role={artifact.visualKind} branchDepth={actor.branchDepth || 0} variant={playthingsVariant(seed)} shirtColor={playthingsShirtColor(seed)} idleState={idle.state} />
    {idle.state === 'resting' && !idle.structure ? <g className="tx-playthings-sleep-mark"><text x="13" y="-14">z</text><text x="19" y="-20">z</text></g> : null}
    {highlighted && transitionOptions.length ? <PlaythingTransitionMenu actions={transitionOptions} onActivate={onActivateTransition} /> : null}
  </g>;
}

function PlaythingTransitionMenu({ actions = [], onActivate }) {
  const shown = actions.slice(0, 5);
  const width = 116, row = 22, height = 12 + shown.length * row;
  return <g className="tx-playthings-transition-menu" transform="translate(22 -30)" onPointerDown={(event) => event.stopPropagation()} onClick={(event) => event.stopPropagation()} aria-label="Unlocked valid transitions">
    <rect className="tx-playthings-transition-menu-bg" x="0" y="0" width={width} height={height} rx="3" />
    {shown.map((action, index) => {
      const schemaId = transitionSchemaId(action), label = String(action?.authoring?.schemaLabel || action?.label || schemaId || 'Transition');
      return <g key={action.id || action.definitionKey || `${schemaId}:${index}`} className="tx-playthings-transition-menu-action" transform={`translate(5 ${7 + index * row})`} tabIndex="0" role="button" aria-label={label} onClick={(event) => { event.stopPropagation(); onActivate?.(action); }} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); event.stopPropagation(); onActivate?.(action); } }}>
        <rect x="0" y="0" width={width - 10} height={row - 4} rx="2" />
        <text x="6" y="13">＋ {compactTransitionLabel(label)}</text>
      </g>;
    })}
  </g>;
}

function transitionSchemaId(action = {}) { return String(action?.authoring?.schemaId || action?.targetSchemaId || '').trim(); }
function compactTransitionLabel(value = '') { const text = String(value || '').trim(); return text.length > 17 ? `${text.slice(0, 16)}…` : text; }

function ActiveEventSequence({ event, projection, artifact, eventCount, playing, onSample, onComplete }) {
  const motion = useMemo(() => planPlaythingsEventMotion(event, projection, { eventCount }), [event, projection, eventCount]);
  const [sample, setSample] = useState(() => samplePlaythingsEventMotion(motion, 0));
  React.useEffect(() => { setSample(samplePlaythingsEventMotion(motion, 0)); }, [motion]);
  React.useEffect(() => {
    if (!playing) return undefined;
    let frameId = 0, last = null, elapsed = sample.elapsedMs || 0, done = false;
    const tick = (now) => {
      if (last == null) last = now;
      const delta = Math.min(50, Math.max(0, now - last)); last = now;
      elapsed = Math.min(motion.totalMs, elapsed + delta);
      const next = samplePlaythingsEventMotion(motion, elapsed);
      setSample(next); onSample?.(next);
      if (next.done) { if (!done) { done = true; onComplete?.(); } return; }
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
    {sample.dustOpacity > 0 ? <g className="tx-playthings-motion-dust" transform={`translate(${sample.position.x} ${sample.position.y + 13})`} opacity={sample.dustOpacity} aria-hidden="true"><rect x="-12" y="0" width="4" height="2" /><rect x="7" y="-2" width="3" height="2" /></g> : null}
    <g className="tx-playthings-traveller" transform={`translate(${sample.position.x} ${sample.position.y})`}>
      <ellipse className="tx-playthings-actor-shadow" cx="0" cy="14" rx="10" ry="3" />
      <g className="tx-playthings-live-sprite-transform" transform={`translate(0 ${sample.bob}) scale(${sample.scaleX} ${sample.scaleY}) skewX(${sample.lean * 18})`}>
        <PixelPlaything role={artifact.visualKind} branchDepth={event.kind === 'split' ? 1 : 0} variant={playthingsVariant(seed)} shirtColor={playthingsShirtColor(seed)} />
      </g>
    </g>
  </g>;
}

function LineageTesseract({ actor, world, artifactByKey }) {
  const keys = Array.isArray(actor.ancestry) ? actor.ancestry : [];
  const points = keys.map((key) => ({ key, point: world.actorPositions.get(key) || world.scenePositions.get(key), artifact: artifactByKey.get(key) })).filter((entry) => entry.point && entry.artifact);
  if (points.length < 2) return null;
  const path = points.map((entry, index) => `${index ? 'L' : 'M'} ${entry.point.x} ${entry.point.y}`).join(' ');
  const seed = actor.presentationSeed || actor.id || actor.headKey;
  return <g className="tx-playthings-tesseract" aria-hidden="true"><path className="tx-playthings-tesseract-line" d={path} />{points.slice(0, -1).map((entry, index) => <g key={entry.key} className="tx-playthings-tesseract-echo" transform={`translate(${entry.point.x} ${entry.point.y})`}><PixelPlaything role={entry.artifact.visualKind} variant={playthingsVariant(seed)} shirtColor={playthingsShirtColor(seed)} ghost /><circle r={18 + Math.min(10, index)} /></g>)}</g>;
}

function sceneVerb(kind) {
  if (kind === 'work' || kind === 'build' || kind === 'build-workspace') return 'WORKING';
  if (kind === 'receive' || kind === 'pass') return 'RECEIVING';
  if (kind === 'observe' || kind === 'read') return 'OBSERVING';
  if (kind === 'blueprint') return 'STUDYING BLUEPRINT';
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
