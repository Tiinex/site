import { defineSurface } from './contracts.js';
const surfaces = [
  defineSurface({ id: 'feed', kind: 'card', label: 'Feed', purpose: 'Scan current artifact set' }),
  defineSurface({ id: 'tree', kind: 'tree', label: 'Tree', purpose: 'Navigate parent/child structure' }),
  defineSurface({ id: 'detail', kind: 'detail', label: 'Detail', purpose: 'Read one artifact deeply' }),
  defineSurface({ id: 'lineage', kind: 'graph', label: 'Lineage', purpose: 'Trace lineage edges' }),
  defineSurface({ id: 'audit', kind: 'audit-report', label: 'Audit', purpose: 'Display audit report' }),
  defineSurface({ id: 'preview', kind: 'detail', label: 'Preview', purpose: 'Preview material or assets' }),
  defineSurface({ id: 'share', kind: 'card', label: 'Share', purpose: 'Summarize for sharing/export' }),
  defineSurface({ id: 'create', kind: 'form', label: 'Create', purpose: 'Create artifacts through schema forms' }),
  defineSurface({ id: 'edit', kind: 'form', label: 'Edit', purpose: 'Edit draft artifacts' }),
  defineSurface({ id: 'display-options', kind: 'checklist', label: 'Display Options', purpose: 'Control filters and reader density' }),
  defineSurface({ id: 'source-settings', kind: 'checklist', label: 'Source Settings', purpose: 'Control source mode and boundaries' })
];
export const surfaceRegistry = Object.freeze({ surfaces });
export function surfaceLabels() { return surfaces; }
