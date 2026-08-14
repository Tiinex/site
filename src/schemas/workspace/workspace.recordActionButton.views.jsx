import React from 'react';
import { RecordActionKind } from '../../actions/record.actions.js';
import { isTransitionAction } from '../../transitions/transition.presentation.js';
import { Icon } from '../../ui/primitives/Icon.jsx';
import { actionClassName, actionLabel } from './workspace.viewFormatting.js';

export function RecordActionButton({ action, record, workspaceActionModel = null, onOpenRecord, onFocusRecordLineage, onShareRecord, onRecordAction }) {
  const label = workspaceRecordActionLabel(action, workspaceActionModel);
  const title = workspaceRecordActionTitle(action, workspaceActionModel, label);
  const className = actionClassName(action);
  if (action.href) {
    return <a className={className} href={action.href} target="_blank" rel="noopener noreferrer" title={title} aria-label={title}><Icon name={action.icon} /><strong>{label}</strong></a>;
  }
  return (
    <button type="button" className={className} title={title} aria-label={title} onClick={() => {
      if (action.id === RecordActionKind.open) return onOpenRecord?.(record.id);
      if (action.id === RecordActionKind.lineage) return onFocusRecordLineage?.(record.id);
      if (action.id === RecordActionKind.share) return onShareRecord?.(record);
      if (isTransitionAction(action)) return onRecordAction?.(record, action);
      return onRecordAction?.(record, action);
    }}><Icon name={action.icon} /><strong>{label}</strong></button>
  );
}

function workspaceRecordActionLabel(action = {}, workspaceActionModel = null) {
  if (workspaceActionModel && action.id === RecordActionKind.workspaceOpen) return workspaceActionModel.open.label;
  if (workspaceActionModel && action.id === RecordActionKind.workspaceMerge) return workspaceActionModel.merge.label;
  return actionLabel(action);
}

function workspaceRecordActionTitle(action = {}, workspaceActionModel = null, fallback = '') {
  if (workspaceActionModel && action.id === RecordActionKind.workspaceOpen) return workspaceActionModel.open.title;
  if (workspaceActionModel && action.id === RecordActionKind.workspaceMerge) return workspaceActionModel.merge.title;
  return fallback || actionLabel(action);
}
