import React, { useMemo, useState } from 'react';
import { isPlaythingsLocalArtifact, playthingsArtifactFindLabel, searchablePlaythingsArtifacts } from './playthings.find.js';

export function PlaythingsArtifactFinder({ model, enabled = true, onLocate }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const results = useMemo(() => searchablePlaythingsArtifacts(model, query, 14), [model, query]);
  const localCount = useMemo(() => (model.artifacts || []).filter(isPlaythingsLocalArtifact).length, [model.artifacts]);
  if (!enabled) return null;
  return <div className="tx-playthings-finder" onPointerDown={(event) => event.stopPropagation()} onClick={(event) => event.stopPropagation()}>
    <button type="button" className={`tx-playthings-finder-toggle ${open ? 'is-open' : ''}`} onClick={() => setOpen((value) => !value)} aria-expanded={open}>Find {localCount ? <b>{localCount} local</b> : null}</button>
    {open ? <section className="tx-playthings-finder-panel" aria-label="Find observed artifacts">
      <div className="tx-playthings-finder-head"><div><strong>FIND ARTIFACT</strong><small>Local artifacts first · resolves to living leaf or lineage history</small></div><button type="button" onClick={() => setOpen(false)}>×</button></div>
      <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="title, schema, path, repo…" autoFocus aria-label="Find Playthings artifact" />
      <div className="tx-playthings-finder-results">
        {results.length ? results.map((artifact) => <button type="button" key={artifact.key} onClick={() => { onLocate?.(artifact.key); setOpen(false); }}>
          <span className="identity"><strong>{artifact.title || artifact.path || 'Artifact'}</strong><small>{artifact.schemaId}</small></span>
          <span className="where">{isPlaythingsLocalArtifact(artifact) ? <b>LOCAL</b> : null}<small>{playthingsArtifactFindLabel(model, artifact)}</small></span>
        </button>) : <p>No observed artifact matches this search.</p>}
      </div>
    </section> : null}
  </div>;
}
