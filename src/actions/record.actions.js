export const RECORD_ACTIONS_CONTRACT_ID = 'tiinex.record.actions.v1';
export const RECORD_ACTION_RESULT_SCHEMA_ID = 'tiinex.record.action.result.v1';

export const RecordActionKind = Object.freeze({
  open: 'record.open',
  lineage: 'record.lineage',
  markdown: 'record.markdown',
  continue: 'record.continue',
  reference: 'record.reference',
  source: 'record.source',
  share: 'record.share'
});

export function presentRecordActions(record = {}) {
  const sourceHref = sourceHrefForRecord(record);
  const hasText = Boolean(String(record.markdown || record.summary || record.title || '').trim());
  const actions = [
    {
      id: RecordActionKind.open,
      label: 'Open details',
      icon: 'open',
      enabled: true,
      contract: RECORD_ACTIONS_CONTRACT_ID
    },
    {
      id: RecordActionKind.markdown,
      label: 'Show markdown',
      icon: 'open',
      enabled: true,
      contract: RECORD_ACTIONS_CONTRACT_ID
    },
    {
      id: RecordActionKind.continue,
      label: 'Continue',
      icon: 'continue',
      enabled: hasText,
      contract: RECORD_ACTIONS_CONTRACT_ID,
      produces: RECORD_ACTION_RESULT_SCHEMA_ID
    },
    {
      id: RecordActionKind.reference,
      label: 'Preserve evidence',
      icon: 'reference',
      enabled: true,
      contract: RECORD_ACTIONS_CONTRACT_ID,
      produces: RECORD_ACTION_RESULT_SCHEMA_ID
    }
  ];
  if (sourceHref) {
    actions.push({
      id: RecordActionKind.source,
      label: 'Source',
      icon: 'source',
      enabled: true,
      href: sourceHref,
      contract: RECORD_ACTIONS_CONTRACT_ID
    });
  }
  actions.push({
    id: RecordActionKind.share,
    label: 'Share session',
    icon: 'shareNodes',
    enabled: true,
    contract: RECORD_ACTIONS_CONTRACT_ID
  });
  return Object.freeze(actions);
}

export function sourceHrefForRecord(record = {}) {
  const source = record.source || {};
  const adapterId = String(source.adapterId || '').trim();
  const repo = String(source.repo || source.config?.repo || '').trim();
  const ref = String(source.ref || source.config?.ref || source.resolvedRef || source.commit || '').trim();
  const path = String(record.path || '').trim();
  if (adapterId !== 'github' || !repo || !ref || !path) return '';
  const cleanPath = path.replace(/^\/+/, '');
  if (!cleanPath) return '';
  return `https://github.com/${repo}/blob/${ref}/${cleanPath}`;
}

export function actionIsRenderable(action = {}) {
  return Boolean(action && action.enabled !== false && (action.id === RecordActionKind.open || action.id === RecordActionKind.markdown || action.id === RecordActionKind.lineage || action.id === RecordActionKind.share || action.id === RecordActionKind.continue || action.id === RecordActionKind.reference || action.href));
}

export function createRecordActionResult(record = {}, actionId = '') {
  const action = String(actionId || '').trim();
  if (action === RecordActionKind.continue) return createContinueResult(record);
  if (action === RecordActionKind.reference) return createEvidencePreservationResult(record);
  return null;
}

function createContinueResult(record = {}) {
  return Object.freeze({
    schema: RECORD_ACTION_RESULT_SCHEMA_ID,
    actionId: RecordActionKind.continue,
    title: `Continue from ${record.title || 'artifact'}`,
    intent: 'continue-artifact',
    sourceBoundary: boundaryForRecord(record),
    text: continuationCapsule(record)
  });
}

function createEvidencePreservationResult(record = {}) {
  return Object.freeze({
    schema: RECORD_ACTION_RESULT_SCHEMA_ID,
    actionId: RecordActionKind.reference,
    title: `Preserve evidence from ${record.title || 'artifact'}`,
    intent: 'preserve-evidence-from-selected-record',
    sourceBoundary: boundaryForRecord(record),
    text: evidencePreservationCapsule(record)
  });
}

function boundaryForRecord(record = {}) {
  const source = record.source || {};
  if (source.adapterId === 'github') return 'source-backed github material';
  if (source.adapterId === 'local' || source.kind === 'local-session') return 'browser-local session material; no GitHub provenance inferred';
  return 'explicit record boundary';
}

function evidencePreservationCapsule(record = {}) {
  const lines = [
    '# Tiinex Evidence Preservation',
    '',
    `Title: ${record.title || 'Untitled artifact'}`,
    `Record ID: ${record.id || 'unassigned'}`,
    `Kind: ${record.kind || 'artifact'}`,
    `Boundary: ${boundaryForRecord(record)}`,
    '',
    'Semantics: preserves the selected record as bounded evidence. This is not the PoC cross-artifact Reference relation.'
  ];
  if (record.path) lines.push(`Path: ${record.path}`);
  if (record.source?.label) lines.push(`Source: ${record.source.label}`);
  if (record.summary) lines.push('', 'Summary:', record.summary);
  return lines.join('\n');
}

function continuationCapsule(record = {}) {
  const body = String(record.markdown || record.summary || '').trim();
  const excerpt = body.length > 1800 ? `${body.slice(0, 1800)}\n…` : body;
  return [
    '# Tiinex Continuation Capsule',
    '',
    `Continue from: ${record.title || 'Untitled artifact'}`,
    `Boundary: ${boundaryForRecord(record)}`,
    record.path ? `Path: ${record.path}` : '',
    '',
    'Material:',
    excerpt || '(No embedded material text.)'
  ].filter(Boolean).join('\n');
}
