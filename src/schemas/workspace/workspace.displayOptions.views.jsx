import React, { useState } from 'react';
import { Button } from '../../ui/primitives/Button.jsx';
import { Modal } from '../../ui/primitives/Modal.jsx';
import { materialRoleLabel } from '../../workspaces/workspace.materialRole.js';
import { normalizeWorkspaceDisplayOptions } from '../../workspaces/workspace.displayOptions.js';
import { normalizeTimePortalView } from '../../workspaces/workspace.timePortal.js';

export function DisplayOptionsDialog({ options, counts = {}, scope = 'discovery', timePortal = null, onResolveTimePortal, onReturnLatest, onSubmit, onDismiss }) {
  const [draft, setDraft] = useState(normalizeWorkspaceDisplayOptions(options));
  const normalizedTimePortal = normalizeTimePortalView(timePortal);
  const [timeDraft, setTimeDraft] = useState({ begin: normalizedTimePortal?.begin || '', end: normalizedTimePortal?.end || '' });
  const schemaChoices = Array.isArray(counts.schemaChoices) ? counts.schemaChoices : [];
  const artifactChoices = Array.isArray(counts.artifactChoices) ? counts.artifactChoices : [];
  const sourceChoices = Array.isArray(counts.sourceChoices) ? counts.sourceChoices : [];
  const lineageScope = String(scope || 'discovery') === 'lineage';
  function setFlag(key, value) {
    setDraft((current) => Object.assign({}, current, { [key]: Boolean(value) }));
  }
  function setValue(key, value) {
    setDraft((current) => Object.assign({}, current, { [key]: String(value || 'all') || 'all' }));
  }
  function submit(event) {
    event.preventDefault();
    onSubmit?.(normalizeWorkspaceDisplayOptions(draft));
  }
  return (
    <Modal title="Display options" onDismiss={onDismiss} initialFocus={lineageScope ? 'displaySchemaFilter' : 'displayLeavesOnly'} className="tx-dialog-display-options">
      <form className="tx-form tx-display-options-form tx-display-options-parity-form" onSubmit={submit} data-form="display-options-form">
        <p className="tx-muted">{lineageScope ? 'Lineage filters apply to the loaded lineage only. Leaves-only and material membership controls are Discovery-only.' : 'Presentation only. Source, audit, lineage, and export truth stay intact even when material is filtered from Feed/Tree.'}</p>
        <div className="tx-display-filter-grid" aria-label="Artifact filters">
          <label className="tx-select-field">
            <span>Schema</span>
            <select id="displaySchemaFilter" value={draft.schemaFilter} onChange={(event) => setValue('schemaFilter', event.target.value)}>
              <option value="all">All schemas</option>
              {schemaChoices.map(([value, count]) => <option key={value} value={value}>{compactSchemaOption(value)} · {count}</option>)}
            </select>
          </label>
          <label className="tx-select-field">
            <span>Artifact role</span>
            <select value={draft.artifactFilter} onChange={(event) => setValue('artifactFilter', event.target.value)}>
              <option value="all">All roles</option>
              {artifactChoices.map(([value, count]) => <option key={value} value={value}>{artifactFilterLabel(value)} · {count}</option>)}
            </select>
          </label>
          <label className="tx-select-field">
            <span>Source boundary</span>
            <select value={draft.sourceFilter} onChange={(event) => setValue('sourceFilter', event.target.value)}>
              <option value="all">All boundaries</option>
              {sourceChoices.map(([value, count]) => <option key={value} value={value}>{sourceFilterLabel(value)} · {count}</option>)}
            </select>
          </label>
        </div>
        {!lineageScope ? (
          <label className="tx-display-option-row tx-display-option-primary">
            <span><strong>Leaves only</strong><small>{Number(counts.leaves || 0)} terminal work {Number(counts.leaves || 0) === 1 ? 'leaf' : 'leaves'} · hides loaded parents, schema/type definitions, support files, and body-missing source shells</small></span>
            <input id="displayLeavesOnly" type="checkbox" checked={draft.leavesOnly} onChange={(event) => setFlag('leavesOnly', event.target.checked)} />
          </label>
        ) : null}
        <label className="tx-display-option-row">
          <span><strong>Mismatches only</strong><small>{Number(counts.mismatches || 0)} record{Number(counts.mismatches || 0) === 1 ? '' : 's'} currently carry mismatch-level audit status</small></span>
          <input id="displayMismatchesOnly" type="checkbox" checked={draft.mismatchesOnly} onChange={(event) => setFlag('mismatchesOnly', event.target.checked)} />
        </label>
        {!lineageScope ? (
          <section className="tx-display-time-portal" aria-label="Time Portal">
            <h3>Time Portal</h3>
            <p className="tx-muted">Source-grounded historical review. Begin/End expresses intent only; no date is converted into a commit.</p>
            <div className="tx-display-filter-grid">
              <label className="tx-field"><span>Begin</span><input type="datetime-local" value={timeDraft.begin} onChange={(event) => setTimeDraft((current) => Object.assign({}, current, { begin: event.target.value }))} /></label>
              <label className="tx-field"><span>End / as-of intent</span><input type="datetime-local" value={timeDraft.end} onChange={(event) => setTimeDraft((current) => Object.assign({}, current, { end: event.target.value }))} /></label>
            </div>
            <div className="tx-dialog-actions tx-time-portal-inline-actions">
              {normalizedTimePortal ? <Button type="button" variant="ghost" onClick={onReturnLatest}>Return to latest</Button> : null}
              <Button type="button" variant="ghost" onClick={() => onResolveTimePortal?.(timeDraft)}>Resolve source snapshot</Button>
            </div>
          </section>
        ) : null}
        {!lineageScope ? (
          <>
            <label className="tx-display-option-row">
              <span><strong>Supporting docs</strong><small>{Number(counts.supportingMarkdown || 0)} supporting doc{Number(counts.supportingMarkdown || 0) === 1 ? '' : 's'} · preserved but hidden by default</small></span>
              <input id="displaySupportingMarkdown" type="checkbox" checked={draft.showSupportingMarkdown} onChange={(event) => setFlag('showSupportingMarkdown', event.target.checked)} />
            </label>
            <label className="tx-display-option-row">
              <span><strong>Workspace artifacts</strong><small>{Number(counts.workspaceArtifacts || 0)} artifact{Number(counts.workspaceArtifacts || 0) === 1 ? '' : 's'} · Open/Merge remain artifact capabilities</small></span>
              <input type="checkbox" checked={draft.showWorkspaceArtifacts} onChange={(event) => setFlag('showWorkspaceArtifacts', event.target.checked)} />
            </label>
            <label className="tx-display-option-row">
              <span><strong>Assets</strong><small>{Number(counts.assets || 0)} asset{Number(counts.assets || 0) === 1 ? '' : 's'} · hidden by default, never fake leaves</small></span>
              <input type="checkbox" checked={draft.showAssets} onChange={(event) => setFlag('showAssets', event.target.checked)} />
            </label>
          </>
        ) : null}
        <div className="tx-dialog-actions">
          <Button type="button" variant="ghost" onClick={onDismiss}>Cancel</Button>
          <Button type="submit" variant="primary" icon="check">Apply</Button>
        </div>
      </form>
    </Modal>
  );
}

function compactSchemaOption(value = '') {
  return String(value || 'artifact').replace(/^tiinex\./, '').replace(/\.v\d+$/, '');
}

function artifactFilterLabel(value = '') {
  return materialRoleLabel(value);
}

function sourceFilterLabel(value = '') {
  if (value === 'source-backed') return 'Source-backed';
  if (value === 'local') return 'Local/session';
  return value || 'Source boundary';
}
