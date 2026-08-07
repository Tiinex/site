import { resolveSchemaCapabilities, CapabilityStatus } from '../schemas/capability.registry.js';
import { deleteActionLabelForRecord, isRemovableLocalRecord } from '../workspaces/workspace.authority.js';

export const RECORD_ACTIONS_CONTRACT_ID = 'tiinex.record.actions.v1';
export const RECORD_ACTION_RESULT_SCHEMA_ID = 'tiinex.record.action.result.v1';

export const RecordActionKind = Object.freeze({
  open: 'record.open',
  lineage: 'record.lineage',
  markdown: 'record.markdown',
  continue: 'record.continue',
  reference: 'record.reference',
  source: 'record.source',
  share: 'record.share',
  workspaceOpen: 'record.workspace.open',
  workspaceMerge: 'record.workspace.merge',
  deleteLocal: 'record.local.delete'
});

export function presentRecordActions(record = {}, options = {}) {
  const sourceHref = sourceHrefForRecord(record);
  const hasMaterialText = Boolean(String(record.markdown || record.summary || record.title || '').trim());
  const availability = actionAvailabilityForRecord(record, options);
  const actions = [
    {
      id: RecordActionKind.open,
      label: 'Open details',
      icon: 'open',
      enabled: true,
      contract: RECORD_ACTIONS_CONTRACT_ID,
      capabilityStatus: 'implemented'
    },
    {
      id: RecordActionKind.markdown,
      label: 'Show markdown',
      icon: 'markdown',
      enabled: true,
      contract: RECORD_ACTIONS_CONTRACT_ID,
      capabilityStatus: 'implemented'
    }
  ];
  if (availability.continue.enabled && hasMaterialText) {
    actions.push({
      id: RecordActionKind.continue,
      label: 'Continue',
      icon: 'continue',
      enabled: true,
      contract: RECORD_ACTIONS_CONTRACT_ID,
      produces: RECORD_ACTION_RESULT_SCHEMA_ID,
      capabilityStatus: availability.continue.status,
      capabilityReason: availability.continue.reason
    });
  }
  if (availability.reference.enabled) {
    actions.push({
      id: RecordActionKind.reference,
      label: 'Preserve evidence',
      icon: 'reference',
      enabled: true,
      contract: RECORD_ACTIONS_CONTRACT_ID,
      produces: RECORD_ACTION_RESULT_SCHEMA_ID,
      capabilityStatus: availability.reference.status,
      capabilityReason: availability.reference.reason
    });
  }
  if (sourceHref) {
    actions.push({
      id: RecordActionKind.source,
      label: 'Open source',
      icon: 'source',
      enabled: true,
      href: sourceHref,
      contract: RECORD_ACTIONS_CONTRACT_ID,
      capabilityStatus: 'implemented'
    });
  }
  if (isRemovableLocalDraftRecord(record)) {
    actions.push({
      id: RecordActionKind.deleteLocal,
      label: deleteActionLabelForRecord(record),
      icon: 'delete',
      enabled: true,
      contract: RECORD_ACTIONS_CONTRACT_ID,
      capabilityStatus: 'implemented',
      capabilityReason: 'Only browser-local draft/session material is removed; source material is not mutated.'
    });
  }
  if (isWorkspaceRecord(record)) {
    actions.push(
      {
        id: RecordActionKind.workspaceOpen,
        label: 'Open',
        icon: 'workspace',
        enabled: true,
        contract: RECORD_ACTIONS_CONTRACT_ID,
        capabilityStatus: 'implemented',
        capabilityReason: '.workspace.md can become the active workspace context'
      },
      {
        id: RecordActionKind.workspaceMerge,
        label: 'Merge',
        icon: 'continue',
        enabled: true,
        contract: RECORD_ACTIONS_CONTRACT_ID,
        capabilityStatus: 'implemented',
        capabilityReason: '.workspace.md can be merged as workspace context without closing current work'
      }
    );
  }
  actions.push({
    id: RecordActionKind.share,
    label: 'Share session',
    icon: 'shareNodes',
    enabled: true,
    contract: RECORD_ACTIONS_CONTRACT_ID,
    capabilityStatus: 'implemented'
  });
  return Object.freeze(actions);
}

export function actionAvailabilityForRecord(record = {}, options = {}) {
  const schemaId = recordSchemaId(record);
  const resolution = resolveSchemaCapabilities({ schemaId });
  const fallbackUsed = Boolean(resolution.fallbackUsed || resolution.descriptor?.resolution?.fallbackUsed);
  const actions = resolution.descriptor?.actions || {};
  return Object.freeze({
    schemaId,
    moduleId: resolution.descriptor?.moduleId || '',
    fallbackUsed,
    continue: actionAvailability(actions.continue, { fallbackUsed, action: RecordActionKind.continue }),
    reference: actionAvailability(actions.reference, { fallbackUsed, action: RecordActionKind.reference })
  });
}

function actionAvailability(capability = {}, { fallbackUsed = false, action = '' } = {}) {
  const status = capability?.status || CapabilityStatus.unavailable;
  const implemented = status === CapabilityStatus.implemented && !fallbackUsed;
  return Object.freeze({
    action,
    enabled: implemented,
    status,
    reason: fallbackUsed ? 'root fallback does not expose schema-specific create transitions' : (capability?.reason || 'schema action unavailable')
  });
}

export function isRemovableLocalDraftRecord(record = {}) {
  return Boolean(record?.id && isRemovableLocalRecord(record));
}

export function isWorkspaceRecord(record = {}) {
  const path = String(record.path || record.sourcePath || record.sourceTarget?.sourceArtifactPath || record.name || '').trim().toLowerCase();
  const schema = String(record.schemaId || record.currentSchemaId || record.kind || '').trim().toLowerCase();
  return /(?:^|\/)[^/]+\.workspace\.md$/i.test(path) || schema === 'tiinex.workspace.v1' || schema.includes('workspace');
}

function recordSchemaId(record = {}) {
  return String(record.schemaId || record.currentSchemaId || record.kind || '').trim();
}

export function sourceHrefForRecord(record = {}) {
  const source = record.source || {};
  const adapterId = String(source.adapterId || '').trim();
  if (adapterId !== 'github') return '';
  const sourceUrl = firstGithubBrowseHref(
    record.sourceTarget?.browseUrl,
    record.sourceTarget?.sourceUrl,
    record.sourceTarget?.rawUrl,
    record.snapshot?.sourceUrl,
    record.snapshot?.rawUrl,
    record.snapshot?.target?.canonicalUrl,
    record.recoveredFromUrl,
    record.browseUrl,
    record.sourceUrl,
    record.rawUrl
  );
  if (sourceUrl) return sourceUrl;
  const socialHref = firstGithubSocialHref(record.sourceTarget?.inputTarget, record.snapshot?.target?.canonicalUrl);
  if (socialHref) return socialHref;
  const repo = String(source.repo || source.config?.repo || '').trim();
  const ref = String(source.ref || source.config?.ref || source.resolvedRef || source.commit || record.sourceTarget?.ref || record.snapshot?.target?.ref || '').trim();
  const path = firstNonEmpty(record.sourceTarget?.sourceArtifactPath, record.snapshot?.sourceArtifactPath, record.sourcePath, record.path);
  if (!repo || !ref || !path) return '';
  const cleanPath = githubRepoPathFromUrl(path) || String(path || '').trim().replace(/^\/+/, '');
  if (!cleanPath || isGithubSocialUrl(path) || isSyntheticIssuePath(cleanPath)) return '';
  return `https://github.com/${repo}/blob/${ref}/${cleanPath}`;
}

function firstNonEmpty(...items) { return items.map((item) => String(item || '').trim()).find(Boolean) || ''; }
function firstGithubBrowseHref(...items) {
  for (const item of items) {
    const href = githubBrowseHrefFromUrl(item);
    if (href) return href;
  }
  return '';
}
function firstGithubSocialHref(...items) { return items.map((item) => String(item || '').trim()).find(isGithubSocialUrl) || ''; }
function isGithubSocialUrl(value = '') {
  try {
    const url = new URL(String(value || '').trim());
    const parts = url.pathname.split('/').filter(Boolean);
    return (url.hostname === 'github.com' || url.hostname.endsWith('.github.com')) && parts.length >= 4 && (parts[2] === 'issues' || parts[2] === 'discussions' || parts[2] === 'pull');
  } catch (_) { return false; }
}
function githubBrowseHrefFromUrl(value = '') {
  const raw = String(value || '').trim();
  if (!/^https:\/\//i.test(raw)) return '';
  try {
    const url = new URL(raw);
    const parts = url.pathname.split('/').filter(Boolean);
    if (isGithubSocialUrl(raw)) return raw;
    if ((url.hostname === 'github.com' || url.hostname.endsWith('.github.com')) && parts.length >= 5 && parts[2] === 'blob') return raw;
    if (url.hostname === 'raw.githubusercontent.com' && parts.length >= 4) {
      const [owner, repo, ref, ...pathParts] = parts;
      if (owner && repo && ref && pathParts.length) return `https://github.com/${owner}/${repo}/blob/${ref}/${pathParts.join('/')}`;
    }
  } catch (_) {}
  return raw;
}
function githubRepoPathFromUrl(value = '') {
  try {
    const url = new URL(String(value || '').trim());
    const parts = url.pathname.split('/').filter(Boolean);
    if (url.hostname === 'raw.githubusercontent.com' && parts.length >= 4) return parts.slice(3).join('/');
    if ((url.hostname === 'github.com' || url.hostname.endsWith('.github.com')) && parts.length >= 5 && parts[2] === 'blob') return parts.slice(4).join('/');
  } catch (_) {}
  return '';
}
function isSyntheticIssuePath(value = '') {
  const clean = String(value || '').replace(/^\/+/, '');
  return clean.startsWith('.topics/.github issue sidecars/') || /^\.topics\/\.github\/[^/]+\/[^/]+\/(?:\.issues|\.discussions|\.pulls)\//i.test(clean);
}

export function actionIsRenderable(action = {}) {
  const id = String(action?.id || '');
  return Boolean(action && action.enabled !== false && (id.startsWith('record.transition:') || action.id === RecordActionKind.open || action.id === RecordActionKind.markdown || action.id === RecordActionKind.lineage || action.id === RecordActionKind.share || action.id === RecordActionKind.continue || action.id === RecordActionKind.reference || action.id === RecordActionKind.workspaceOpen || action.id === RecordActionKind.workspaceMerge || action.id === RecordActionKind.deleteLocal || action.href));
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
