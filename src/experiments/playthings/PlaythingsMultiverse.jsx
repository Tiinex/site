import React, { useEffect, useMemo, useState } from 'react';
import { projectPlaythingsMultiverse } from './playthings.model.js';
import {
  planPlaythingsHistory,
  playthingsObservationAtCursor,
  playthingsObservationFromModel,
  playthingsProjectionAtCursor,
  resolvePlaythingsObservationCursor
} from './playthings.timeline.js';
import { readPlaythingsObservation, writePlaythingsObservation } from './playthings.observation.js';
import { projectVisiblePlaythingsModel } from './playthings.visible.js';
import { PlaythingsWorldStage } from './PlaythingsWorldStage.jsx';
import { PlaythingsProgression } from './PlaythingsProgression.jsx';
import { playthingsPlayheadTime } from './playthings.clock.js';
import { readPlaythingsProfile, setPlaythingsFollow, writePlaythingsProfile } from './playthings.profile.js';
import { buildPlaythingsTechTree } from './playthings.techTree.js';
import './playthings.css';

export function PlaythingsMultiverse({ workspaces = [], onRefresh = null, onOpenRecord = null, onCreateSkill = null, onResolveTransitions = null, onActivateTransition = null }) {
  const incomingModel = useMemo(() => projectPlaythingsMultiverse(workspaces), [workspaces]);
  const [target, setTarget] = useState(() => incomingModel);
  const history = useMemo(() => planPlaythingsHistory(target), [target]);
  const prefersReducedMotion = useReducedMotion();
  const [initialStart] = useState(() => {
    const observation = readPlaythingsObservation(incomingModel);
    const initialHistory = planPlaythingsHistory(incomingModel);
    const resolution = resolvePlaythingsObservationCursor(observation, initialHistory, incomingModel);
    const cursor = resolution.valid ? resolution.cursor : 0;
    return { cursor, phase: cursor >= initialHistory.events.length || !initialHistory.events.length ? 'settled' : 'playing' };
  });
  const [cursor, setCursor] = useState(initialStart.cursor);
  const [phase, setPhase] = useState(initialStart.phase);
  const [eventArmed, setEventArmed] = useState(initialStart.phase === 'playing');
  const [eventToken, setEventToken] = useState(0);
  const [profile, setProfile] = useState(() => readPlaythingsProfile());

  useEffect(() => {
    if (phase === 'refreshing' || incomingModel.fingerprint === target.fingerprint) return;
    const currentObservation = playthingsObservationAtCursor(history, target, cursor);
    const nextHistory = planPlaythingsHistory(incomingModel);
    const resolution = resolvePlaythingsObservationCursor(currentObservation, nextHistory, incomingModel);
    setTarget(incomingModel);
    setEventToken((value) => value + 1);
    if (!resolution.valid) {
      setCursor(0);
      setEventArmed(false);
      setPhase('paused');
      return;
    }
    if (phase === 'settled' && resolution.cursor < nextHistory.events.length && prefersReducedMotion) {
      setCursor(nextHistory.events.length);
      setEventArmed(false);
      setPhase('settled');
      writePlaythingsObservation(incomingModel, playthingsObservationFromModel(incomingModel));
      return;
    }
    setCursor(resolution.cursor);
    if (phase === 'settled' && resolution.cursor < nextHistory.events.length) {
      setEventArmed(true);
      setPhase('playing');
    }
  }, [incomingModel.fingerprint]); // direct local Create appends real-Now material without rewriting the historical playhead

  useEffect(() => {
    if (!prefersReducedMotion || phase !== 'playing') return;
    setCursor(history.events.length);
    setEventArmed(false);
    setPhase('settled');
    writePlaythingsObservation(target, playthingsObservationFromModel(target));
  }, [prefersReducedMotion, phase, history.events.length, target]);

  async function refresh() {
    if (phase !== 'settled' || cursor < history.events.length || typeof onRefresh !== 'function') return;
    const previousObservation = playthingsObservationFromModel(target);
    setPhase('refreshing');
    setEventArmed(false);
    try {
      const result = await onRefresh();
      const nextWorkspaces = Array.isArray(result?.workspaces) ? result.workspaces : workspaces;
      const nextModel = projectPlaythingsMultiverse(nextWorkspaces);
      const nextHistory = planPlaythingsHistory(nextModel);
      const resolution = resolvePlaythingsObservationCursor(previousObservation, nextHistory, nextModel);
      const nextCursor = resolution.valid ? resolution.cursor : 0;
      setTarget(nextModel);
      setCursor(prefersReducedMotion ? nextHistory.events.length : nextCursor);
      setEventToken((value) => value + 1);
      if (prefersReducedMotion || nextCursor >= nextHistory.events.length) {
        setEventArmed(false);
        setPhase('settled');
        writePlaythingsObservation(nextModel, playthingsObservationFromModel(nextModel));
      } else {
        setEventArmed(true);
        setPhase('playing');
      }
    } catch (_) {
      setEventArmed(false);
      setPhase('settled');
    }
  }

  function completeActiveEvent() {
    const nextCursor = Math.min(history.events.length, cursor + 1);
    setCursor(nextCursor);
    if (nextCursor >= history.events.length) {
      setEventArmed(false);
      setPhase('settled');
      writePlaythingsObservation(target, playthingsObservationFromModel(target));
    }
  }

  function play() {
    if (cursor >= history.events.length || phase === 'refreshing') return;
    setEventArmed(true);
    setPhase('playing');
  }
  function pause() { if (phase === 'playing') setPhase('paused'); }
  function seek(nextCursor) {
    if (phase === 'refreshing') return;
    setEventArmed(false);
    setPhase('paused');
    setCursor(Math.max(0, Math.min(history.events.length, Math.round(Number(nextCursor || 0)))));
    setEventToken((value) => value + 1);
  }
  function jumpToOrigin() { seek(0); }
  function jumpToNow() {
    setCursor(history.events.length);
    setEventArmed(false);
    setEventToken((value) => value + 1);
    setPhase('settled');
    writePlaythingsObservation(target, playthingsObservationFromModel(target));
  }

  function updateProfile(nextProfile) {
    const written = writePlaythingsProfile(nextProfile);
    setProfile(written);
  }
  function setFollow(next) { updateProfile(setPlaythingsFollow(profile, next)); }

  const projection = playthingsProjectionAtCursor(history, cursor);
  const visibleModel = projectVisiblePlaythingsModel(target, projection.verseIds, projection.artifactKeys, projection.portalKeys);
  const activeEvent = eventArmed && cursor < history.events.length ? history.events[cursor] || null : null;
  const canRefresh = typeof onRefresh === 'function' && phase === 'settled' && projection.atNow;
  const currentEvent = activeEvent || (cursor > 0 ? history.events[cursor - 1] || null : null);
  const currentTime = currentEvent?.at || (cursor === 0 ? 'Origin' : 'Now');
  const playhead = playthingsPlayheadTime({ phase, atNow: projection.atNow, currentEvent });
  const toolsEnabled = phase === 'paused' || (projection.atNow && phase === 'settled');
  const techTree = useMemo(() => buildPlaythingsTechTree(target), [target]);
  const creatableSchemaIds = useMemo(() => new Set(techTree.nodes.filter((node) => node.creatable).map((node) => node.schemaId)), [techTree]);
  const unlockedSkillIds = useMemo(() => (profile.upgradedSchemaIds || []).filter((schemaId) => creatableSchemaIds.has(schemaId)), [profile.upgradedSchemaIds, creatableSchemaIds]);
  const stateLabel = phase === 'refreshing' ? 'READING' : projection.atNow && phase === 'settled' ? 'LIVE · STILL' : phase === 'playing' ? 'PLAYING' : 'PAUSED';
  const crossOriginCount = (visibleModel.edges || []).filter((edge) => edge.crossVerse).length;

  return <section className="tx-playthings" data-playthings-phase={phase} aria-label="Playthings experimental shared world">
    <div className="tx-playthings-world-shell">
      <PlaythingsWorldStage
        model={visibleModel}
        fullModel={target}
        activeEvent={activeEvent}
        playing={phase === 'playing'}
        eventToken={eventToken}
        eventCount={history.events.length}
        playheadMs={playhead.ms}
        followPlaything={profile.followPlaything}
        onFollowPlaythingChange={setFollow}
        onEventComplete={completeActiveEvent}
        onOpenRecord={onOpenRecord}
        toolsEnabled={toolsEnabled}
        unlockedSkillIds={unlockedSkillIds}
        onResolveTransitions={onResolveTransitions}
        onActivateTransition={onActivateTransition}
      />
      <div className="tx-playthings-hud" role="status" aria-live="polite">
        <span className="tx-playthings-brand"><strong>Playthings</strong><small>one shared world · read-only</small></span>
        <span><b>{visibleModel.verses.length}</b><small>origins</small></span>
        <span><b>{visibleModel.actors.length}</b><small>living leaves</small></span>
        <span><b>{visibleModel.artifacts.length}</b><small>history seen</small></span>
        <span><b>{crossOriginCount}</b><small>cross-origin parents</small></span>
        <span className="tx-playthings-now"><i />{stateLabel}</span>
        <button type="button" className="tx-playthings-hud-button" onClick={refresh} disabled={!canRefresh}>{phase === 'refreshing' ? 'Reading…' : 'Refresh'}</button>
      </div>
      {activeEvent ? <div className={`tx-playthings-event is-${activeEvent.kind}`}><span>{eventGlyph(activeEvent.kind, activeEvent)}</span><div><strong>{eventLabel(activeEvent.kind, activeEvent)}</strong><small>{activeEvent.label}</small></div></div> : null}
      <PlaythingsProgression model={target} profile={profile} enabled={toolsEnabled} onProfileChange={updateProfile} onOpenRecord={onOpenRecord} onActivateSkill={onCreateSkill} />
    </div>

    <footer className="tx-playthings-timebar" aria-label="Playthings time controls">
      <button type="button" onClick={jumpToOrigin} disabled={phase === 'refreshing'} aria-label="Go to origin">|◀</button>
      <button type="button" className="tx-playthings-play-toggle" onClick={phase === 'playing' ? pause : play} disabled={phase === 'refreshing' || (projection.atNow && phase !== 'playing')} aria-label={phase === 'playing' ? 'Pause' : 'Play'}>{phase === 'playing' ? 'Ⅱ' : '▶'}</button>
      <input type="range" min="0" max={Math.max(0, history.events.length)} step="1" value={cursor} onChange={(event) => seek(event.target.value)} disabled={phase === 'refreshing'} aria-label="Playthings history" />
      <button type="button" onClick={jumpToNow} disabled={phase === 'refreshing' || projection.atNow} aria-label="Go to now">NOW</button>
      <span className="tx-playthings-time-readout"><strong>{cursor}/{history.events.length}</strong><small>{currentTime}</small></span>
      <span className="tx-playthings-boundary-note">{playhead.mode === 'live' ? 'LIVE · new artifacts use real current time' : 'historical playhead · artifact time drives the world'} · one earth</span>
    </footer>
  </section>;
}

function eventGlyph(kind, event = {}) { if (event.interactionKind === 'blueprint') return '▧'; return kind === 'split' ? '↯' : kind === 'advance' ? '→' : '✦'; }
function eventLabel(kind, event = {}) {
  if (event.interactionKind === 'blueprint') return 'A schema blueprint was observed';
  if (event.arrivalKind === 'organization-receiver') return 'A receiver entered the handoff';
  if (kind === 'split') return 'A living branch divided';
  if (kind === 'advance') return 'A leaf moved into its next scene';
  return 'A root leaf appeared';
}
function useReducedMotion() {
  const [reduced, setReduced] = useState(() => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const media = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!media) return undefined;
    const update = () => setReduced(media.matches);
    media.addEventListener?.('change', update);
    return () => media.removeEventListener?.('change', update);
  }, []);
  return reduced;
}
