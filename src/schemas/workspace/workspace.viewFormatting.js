import { RecordActionKind } from '../../actions/record.actions.js';

export function compactPath(path = '') {
  const value = String(path || '').trim();
  if (value.length <= 44) return value;
  const parts = value.split('/').filter(Boolean);
  if (parts.length <= 2) return `…${value.slice(-41)}`;
  return `${parts[0]}/…/${parts.slice(-2).join('/')}`;
}

export function compactRecordDate(record = {}) {
  const raw = record.currentCreatedAt || record.createdAt || record.date || '';
  const text = String(raw || '').trim();
  if (!text) return '';
  const match = text.match(/\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : text.slice(0, 10);
}

export function recordSchemaBadge(record = {}) {
  const schema = record.schemaId || record.currentSchemaId || record.kind || '';
  const text = String(schema || '').trim();
  if (!text) return 'artifact';
  return text.replace(/^tiinex\./, '').replace(/\.v\d+$/, '');
}

export function recordSourceBadge(record = {}) {
  const source = record.source || {};
  if (source.label) return source.label;
  if (source.repo) return source.repo;
  if (source.adapterId && source.adapterId !== 'local') return source.adapterId;
  return 'Local';
}

export function recordLifecycleBadge(record = {}) {
  const values = [record.lifecycleStatus, record.currentStatus, record.status, record.envelope?.current?.status];
  const text = values.map((value) => String(value || '').trim()).find(Boolean) || '';
  if (!text) return '';
  const clean = text.toLowerCase();
  if (clean === 'schema ok' || clean === 'local') return '';
  return text;
}

export function actionClassName(action = {}) {
  const id = action.id;
  const labeled = id === RecordActionKind.continue || id === RecordActionKind.reference;
  const side = id === RecordActionKind.continue || id === RecordActionKind.reference ? 'tx-action-right' : 'tx-action-left';
  return ['tx-button', 'tx-button-ghost', 'tx-legacy-action', labeled ? 'tx-labeled-action' : '', side].filter(Boolean).join(' ');
}

export function actionLabel(action = {}) {
  if (action.id === RecordActionKind.open) return 'Open details';
  if (action.id === RecordActionKind.markdown) return 'Show markdown';
  if (action.id === RecordActionKind.lineage) return 'Anchor';
  return action.label;
}

export function validationStateLabel(value = '') {
  const state = String(value || '').trim();
  if (state === 'exact-schema-validated') return 'schema validation ran';
  if (state === 'root-validated') return 'root validation ran';
  if (state === 'root-only-child-validator-unavailable') return 'root only · validator unavailable';
  if (state === 'not-run-body-unavailable') return 'not run · body missing';
  if (state === 'not-applicable-supporting') return 'not applicable';
  if (state === 'validation-unknown') return 'validation unknown';
  return state || 'validation unknown';
}

export function validatorLabel(childValidator = '', coverage = '') {
  const child = String(childValidator || '').trim();
  const cov = String(coverage || '').trim();
  if (child === 'run') return 'exact child validator ran';
  if (child === 'unavailable') return 'child validator unavailable';
  if (child === 'skipped') return 'skipped until body loads';
  if (child === 'not-applicable') return cov === 'root-exact' ? 'Root validator only' : 'not applicable';
  return child || cov || 'validator unknown';
}

export function readStateLabel(value = '') {
  const state = String(value || '').trim();
  if (state === 'schema-owned') return 'schema-owned';
  if (state === 'root-readable') return 'root-readable';
  if (state === 'root-fallback') return 'root fallback';
  if (state === 'unavailable-body') return 'body unavailable';
  if (state === 'unknown-schema') return 'unknown schema';
  return state || 'read state unknown';
}

export function schemaCoverageLabel(value = '') {
  const state = String(value || '').trim();
  if (state === 'exact-companion') return 'exact companion';
  if (state === 'unknown-schema') return 'unknown schema';
  if (state === 'missing-schema') return 'missing schema';
  return state || 'schema unknown';
}
