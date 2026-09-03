import React from 'react';
import { PixelPlaything } from './playthings.artwork.jsx';
import { playthingsShirtColor, playthingsVariant } from './playthings.seed.js';

export function PlaythingsLocationDialog({ structure = null, artifact = null, residents = [], onClose, onSelectResident, onOpenLineage, onOpenRecord }) {
  if (!structure || !artifact) return null;
  return <div className="tx-playthings-location-dialog-backdrop" role="presentation" onPointerDown={(event) => { if (event.target === event.currentTarget) onClose?.(); }} onWheel={(event) => event.stopPropagation()}>
    <section className="tx-playthings-location-dialog" role="dialog" aria-modal="true" aria-label={`Inside ${artifact.title || 'location'}`} onPointerDown={(event) => event.stopPropagation()}>
      <header><div><small>LOCATION · RESTING INVENTORY</small><strong>{artifact.title || 'Location'}</strong><span>{residents.length} resting Plaything{residents.length === 1 ? '' : 's'} · presentation only</span></div><button type="button" onClick={onClose} aria-label="Close location">×</button></header>
      <div className="tx-playthings-location-room">
        {residents.length ? residents.map(({ actor, leafArtifact, idle }) => {
          const seed = actor.presentationSeed || leafArtifact.presentationSeed || actor.id;
          return <article key={actor.id} className="tx-playthings-resident-slot">
            <div className="bed" aria-hidden="true"><span className="pillow" /><svg viewBox="-24 -28 48 58" shapeRendering="crispEdges"><g transform="translate(0 2) scale(.92)"><PixelPlaything role={leafArtifact.visualKind} roleIdentity={actor.roleIdentity || leafArtifact.roleIdentity || ''} branchDepth={actor.branchDepth || 0} variant={playthingsVariant(seed)} shirtColor={playthingsShirtColor(seed)} idleState="resting" /></g></svg><span className="zzz">zZ</span></div>
            <div className="copy"><strong>{leafArtifact.title || actor.label || 'Resting Plaything'}</strong><small>{actor.roleLabel || leafArtifact.schemaId || 'living leaf'}</small><span>{Number(idle?.days || 0).toFixed(1)} relative idle days</span></div>
            <div className="actions"><button type="button" onClick={() => { onSelectResident?.(actor, leafArtifact); onClose?.(); }}>Select</button><button type="button" onClick={() => onOpenLineage?.(leafArtifact)}>Lineage Verse</button><button type="button" onClick={() => onOpenRecord?.(leafArtifact.recordId, leafArtifact.workspaceId)}>Detail</button></div>
          </article>;
        }) : <div className="tx-playthings-location-empty"><span>⌂</span><strong>Nobody is resting here right now.</strong><p>The building is a world place, not a semantic membership container.</p></div>}
      </div>
      <footer><span>Residents are compressed living leaves assigned to this already-built habitat.</span><button type="button" onClick={() => onOpenRecord?.(artifact.recordId, artifact.workspaceId)}>Place Detail</button></footer>
    </section>
  </div>;
}
