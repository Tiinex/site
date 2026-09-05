import React, { useEffect, useRef, useState } from 'react';
import { PlaythingsMultiverse } from './PlaythingsMultiverse.jsx';
import { preparePlaythingsSnapshotAsync } from './playthings.prepare.client.js';
import './playthings.css';

export function PlaythingsVerseLoader({ workspaces = [], ...props }) {
  const [snapshot, setSnapshot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState({ value: 2, label: 'Opening Playthings Verse' });
  const [error, setError] = useState('');
  const generationRef = useRef(0);

  useEffect(() => {
    const generation = generationRef.current + 1;
    generationRef.current = generation;
    let cancelled = false;
    setLoading(true);
    setError('');
    setProgress((current) => snapshot ? current : { value: 2, label: 'Opening Playthings Verse' });

    // Effects run after the shell has committed. One more frame guarantees the
    // loading surface is paintable before even cooperative input packing begins.
    const start = async () => {
      await paintOpportunity();
      try {
        const next = await preparePlaythingsSnapshotAsync(workspaces, (nextProgress) => {
          if (!cancelled && generationRef.current === generation) setProgress(normalizeProgress(nextProgress));
        });
        if (cancelled || generationRef.current !== generation) return;
        setSnapshot(next);
        setProgress({ value: 100, label: 'Entering Playthings' });
        setLoading(false);
      } catch (caught) {
        if (cancelled || generationRef.current !== generation) return;
        setError(String(caught?.message || caught || 'Playthings preparation failed'));
        setLoading(false);
      }
    };
    void start();
    return () => { cancelled = true; };
  }, [workspaces]);

  if (!snapshot) return <PlaythingsLoadingScreen progress={progress} error={error} />;
  return <div className="tx-playthings-loader-host">
    <PlaythingsMultiverse {...props} workspaces={workspaces} preparedSnapshot={snapshot} />
    {loading ? <div className="tx-playthings-background-loading" role="status" aria-live="polite"><span>{progress.label}</span><ProgressBar value={progress.value} compact /></div> : null}
  </div>;
}

function PlaythingsLoadingScreen({ progress, error = '' }) {
  const value = Math.max(0, Math.min(100, Number(progress?.value || 0)));
  return <section className="tx-playthings tx-playthings-loading" aria-label="Opening Playthings Verse">
    <div className="tx-playthings-loading-world">
      <div className="tx-playthings-loading-gate" aria-hidden="true"><span>◇</span><i /><b>✦</b></div>
      <div className="tx-playthings-loading-card">
        <small>PLAYTHINGS · SHARED EARTH</small>
        <h2>{error ? 'The gate could not open' : 'Opening the Verse…'}</h2>
        <p>{error || progress?.label || 'Preparing loaded Tiinex history without blocking the Viewer.'}</p>
        {!error ? <ProgressBar value={value} /> : null}
        {!error ? <footer><span>{Math.round(value)}%</span><span>projection work runs away from the UI thread</span></footer> : null}
      </div>
    </div>
  </section>;
}

function ProgressBar({ value = 0, compact = false }) {
  const normalized = Math.max(0, Math.min(100, Number(value || 0)));
  return <div className={`tx-playthings-progress ${compact ? 'is-compact' : ''}`} role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={Math.round(normalized)}>
    <span style={{ width: `${normalized}%` }} />
  </div>;
}

function normalizeProgress(progress = {}) {
  return { value: Math.max(2, Math.min(100, Number(progress.value || 0))), label: String(progress.label || 'Preparing Playthings') };
}

function paintOpportunity() {
  if (typeof requestAnimationFrame === 'function') return new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 0)));
  return new Promise((resolve) => setTimeout(resolve, 0));
}
