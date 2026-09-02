import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '../../ui/primitives/Button.jsx';
import { Modal } from '../../ui/primitives/Modal.jsx';
import { TextareaField, TextField } from '../../ui/primitives/Field.jsx';

export const CANONICAL_STORAGE_PLACEMENT_SELECTION_ROLE = 'storage-placement';
export const CANONICAL_CONTINUITY_PARENT_SELECTION_ROLE = 'continuity-parent';

const SHORT_FIELD_NAMES = new Set(['Summary', 'Source Role', 'Target Role', 'Interpretation Action']);

export function CanonicalAuthoringDialog({ record, action, workspaceId = '', placementTargets = [], selectionSession = null, selectionResult = null, onBeginSelection, onSelectionConsumed, onDismiss, onCreate, onBack = null }) {
  const requiredInputs = Array.isArray(action?.authoring?.requiredInputs) ? action.authoring.requiredInputs : [];
  const fixedInputs = action?.authoring?.fixedInputs || {};
  const editableInputs = requiredInputs.filter((name) => !Object.prototype.hasOwnProperty.call(fixedInputs, name));
  const initialValues = Object.fromEntries(requiredInputs.map((name) => [name, Object.prototype.hasOwnProperty.call(fixedInputs, name) ? fixedInputs[name] : '']));
  const [values, setValues] = useState(() => initialValues);
  const [error, setError] = useState('');
  const [placementFolder, setPlacementFolder] = useState('');
  const [parentReviewed, setParentReviewed] = useState(false);
  const ownerBase = useMemo(() => `authoring:${String(action?.definitionKey || action?.id || '')}:${String(workspaceId)}:${String(record?.id || 'root')}`, [action?.definitionKey, action?.id, workspaceId, record?.id]);
  useEffect(() => {
    if (!selectionResult?.ok || !String(selectionResult.ownerKey || '').startsWith(`${ownerBase}:`)) return;
    if (selectionResult.role === CANONICAL_STORAGE_PLACEMENT_SELECTION_ROLE) setPlacementFolder(String(selectionResult.candidate?.path || ''));
    if (selectionResult.role === CANONICAL_CONTINUITY_PARENT_SELECTION_ROLE) setParentReviewed(true);
    setError(''); onSelectionConsumed?.(selectionResult.sessionId);
  }, [selectionResult, ownerBase, onSelectionConsumed]);
  const required = new Set(requiredInputs);
  const schemaLabel = action?.authoring?.schemaLabel || action?.authoring?.schemaId || 'Artifact';
  function set(name, value) { setValues((current) => ({ ...current, [name]: value })); }
  async function submit(event) {
    event.preventDefault();
    const finalValues = { ...values, ...fixedInputs };
    const missing = [...required].find((name) => finalValues[name] === undefined || String(finalValues[name]).trim() === '');
    if (missing) return setError(`${missing} is required.`);
    setError('');
    const result = await onCreate?.(record, action, finalValues, { placementFolder, workspaceId });
    if (result?.ok === false) setError(result.notice || `${schemaLabel} could not be created.`);
  }
  function beginPlacementSelection() {
    const candidates = (Array.isArray(placementTargets) ? placementTargets : []).filter((item) => item?.enabled !== false);
    if (!candidates.length) return setError('No qualified same-workspace storage folder is available.');
    onBeginSelection?.({ role: CANONICAL_STORAGE_PLACEMENT_SELECTION_ROLE, ownerKey: `${ownerBase}:placement`, originWorkspaceId: workspaceId, title: 'Choose storage folder', guidance: 'Choose a same-workspace folder. This changes only browser-local storage placement; Parent, Reference and source provenance stay unchanged.', presentation: { verse: 'tree' }, candidates });
  }
  function beginParentReview() {
    if (!record?.id || !workspaceId) return setError('Continuity Parent is not available for workspace selection.');
    onBeginSelection?.({ role: CANONICAL_CONTINUITY_PARENT_SELECTION_ROLE, ownerKey: `${ownerBase}:parent`, originWorkspaceId: workspaceId, title: 'Review Continuity Parent', guidance: 'This Transition fixes the Parent. The workspace surface identifies that exact parent; selecting another artifact is not authorized.', presentation: { verse: 'feed' }, candidates: [{ kind:'record', key:`continuity-parent:${workspaceId}:${record.id}`, workspaceId, id:record.id, title:record.title || record.path || 'Parent', path:record.path || '', schemaId:record.schemaId || '', enabled:true, boundary:'Fixed by the qualified Transition; review only, not an arbitrary Parent override.' }] });
  }
  const focusInput = editableInputs[0] || requiredInputs[0] || '';
  if (selectionSession?.ok && String(selectionSession.ownerKey || '').startsWith(`${ownerBase}:`)) return null;
  return (
    <Modal title={action?.label || `Create ${schemaLabel}`} onDismiss={onDismiss} initialFocus={focusInput ? authoringInputId(focusInput) : undefined}>
      <form className="tx-form" onSubmit={submit} data-form="canonical-authoring-form">
        {requiredInputs.map((name) => {
          const id = authoringInputId(name);
          const fixed = Object.prototype.hasOwnProperty.call(fixedInputs, name);
          const common = { key: name, id, label: authoringFieldLabel(name, schemaLabel), value: fixed ? fixedInputs[name] : values[name], required: required.has(name) };
          if (fixed) return <TextField {...common} onChange={() => {}} readOnly aria-readonly="true" />;
          if (SHORT_FIELD_NAMES.has(name)) return <TextField {...common} onChange={(value) => set(name, value)} autoFocus={name === focusInput} />;
          return <TextareaField {...common} onChange={(value) => set(name, value)} rows={3} autoFocus={name === focusInput} />;
        })}
        <section className="tx-authoring-placement-controls" aria-label="Continuity and storage placement">
          {action?.continuityMode === 'parent' && record ? <div><strong>Continuity Parent</strong><p className="tx-muted">{record.title || record.path || 'Selected artifact'} · fixed by the qualified Transition.</p><Button type="button" variant="ghost" icon="lineage" onClick={beginParentReview}>{parentReviewed ? 'Review Parent again' : 'Review Parent in workspace'}</Button></div> : null}
          <div><strong>Storage placement</strong><p className="tx-muted">{placementFolder ? `Explicit same-workspace folder: ${placementFolder}` : 'Automatic canonical placement'}</p><Button type="button" variant="ghost" icon="folderOpen" onClick={beginPlacementSelection}>{placementFolder ? 'Change storage folder' : 'Choose storage folder'}</Button>{placementFolder ? <Button type="button" variant="ghost" onClick={() => setPlacementFolder('')}>Use automatic</Button> : null}</div>
        </section>
        <p className="tx-muted">{action?.continuityMode === 'root' ? `Creates one standalone browser-local ${schemaLabel} through the selected qualified canonical Transition. No Parent or source provenance is invented.` : `Creates one browser-local ${schemaLabel} through the qualified canonical Transition from ${record?.title || 'the selected artifact'}. The selected source artifact remains unchanged; no remote write is performed.`}</p>
        {error ? <p className="tx-form-error" role="alert">{error}</p> : null}
        <div className="tx-dialog-actions">
          {onBack ? <Button type="button" variant="ghost" onClick={onBack}>Back</Button> : <Button type="button" variant="ghost" onClick={onDismiss}>Cancel</Button>}
          <Button type="submit" variant="primary" icon={action?.icon || 'create'}>Create local {schemaLabel.toLowerCase()}</Button>
        </div>
      </form>
    </Modal>
  );
}

// Compatibility export for callers/tests that imported the first canonical slice by its old component name.
export const CanonicalTaskCreateDialog = CanonicalAuthoringDialog;

function authoringInputId(name = '') { return `canonicalAuthoring-${String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`; }
function authoringFieldLabel(name = '', schemaLabel = 'Artifact') { return name === 'Summary' ? `${schemaLabel} title` : name; }


export function WorkspaceCanonicalCreateDialog({ workspace, actions = [], preferredSchemaId = '', placementTargets = [], selectionSession = null, selectionResult = null, onBeginSelection, onSelectionConsumed, onDismiss, onCreate }) {
  const qualifiedActions = (Array.isArray(actions) ? actions : []).filter((action) => action?.productCapable === true && action?.enabled !== false && action?.productScope === 'workspace');
  const preferredAction = qualifiedActions.find((action) => String(action.authoring?.schemaId || action.targetSchemaId || '') === String(preferredSchemaId || '')) || null;
  const [selectedDefinitionKey, setSelectedDefinitionKey] = useState(() => preferredAction?.definitionKey || '');
  const selected = qualifiedActions.find((action) => action.definitionKey === selectedDefinitionKey) || null;
  if (selected) {
    return <CanonicalAuthoringDialog record={null} action={selected} workspaceId={workspace?.id || ''} placementTargets={placementTargets} selectionSession={selectionSession} selectionResult={selectionResult} onBeginSelection={onBeginSelection} onSelectionConsumed={onSelectionConsumed} onDismiss={onDismiss} onBack={() => setSelectedDefinitionKey('')} onCreate={onCreate} />;
  }
  return (
    <Modal title="Create artifact" onDismiss={onDismiss} className="tx-workspace-entrypoint-choice-modal">
      <div className="tx-workspace-entrypoint-choice-copy">
        <p className="tx-kicker">{workspace?.name || workspace?.title || 'Workspace'}</p>
        <p>Choose a qualified artifact type. Tiinex will ask only for the fields owned by that type's exact creation contract.</p>
      </div>
      {qualifiedActions.length ? (
        <div className="tx-workspace-entrypoint-choice-actions" role="group" aria-label="Qualified artifact types">
          {qualifiedActions.map((action) => (
            <div className="tx-workspace-entrypoint-choice-option" key={action.definitionKey}>
              <Button variant="primary" icon={action.icon || 'create'} onClick={() => setSelectedDefinitionKey(action.definitionKey)}>{action.label || action.authoring?.schemaLabel || 'Artifact'}</Button>
              <small><strong>{action.authoring?.schemaLabel || action.authoring?.schemaId || 'Artifact'}.</strong> {action.description || 'Create one browser-local artifact through this qualified canonical Transition.'}</small>
            </div>
          ))}
        </div>
      ) : <p className="tx-muted">No standalone artifact type is currently qualified for creation in this workspace.</p>}
      <div className="tx-dialog-actions">
        <Button variant="subtle" onClick={onDismiss}>Cancel</Button>
      </div>
    </Modal>
  );
}
