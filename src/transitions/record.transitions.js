import { validateTransitionDraft } from './transition.validate.js';
import { buildArtifactCreationContract, createArtifactDraftMarkdown, validateArtifactCreationResult } from '../schemas/creation.contracts.js';

export const RECORD_TRANSITION_CONTRACT_ID = 'tiinex.record.transitions.v1';
export const RECORD_TRANSITION_RESULT_SCHEMA_ID = 'tiinex.record.transition.result.v1';
export const ROOT_SCHEMA_ID = 'tiinex.root.v1';

export function listContinuationTargets(schemaRegistry = {}) {
  const modules = Array.isArray(schemaRegistry.modules) ? schemaRegistry.modules : [];
  return modules
    .filter((module) => module && module.kind === 'concrete' && module.role === 'core-artifact' && module.id === 'tiinex.topic.v1')
    .map((module) => ({
      id: module.id,
      label: module.label || labelFromSchemaId(module.id),
      summary: module.summary || 'Schema-backed Tiinex leaf.',
      parentSchemaId: module.parentSchemaId || '',
      contract: RECORD_TRANSITION_CONTRACT_ID,
      creationContract: `creation:continue-from-record:${module.id}`,
      creationStatus: 'implemented',
      boundary: 'Only schema-honest Topic continuation is exposed until additional schema create renderers are implemented.'
    }));
}

export function createContinuationDraft(parentRecord = {}, target = {}, input = {}, options = {}) {
  const targetId = String(target.id || input.targetSchemaId || 'tiinex.topic.v1').trim();
  const targetLabel = String(target.label || labelFromSchemaId(targetId)).trim();
  const parentTitle = String(parentRecord.title || 'artifact').trim();
  const title = normalizeTitle(input.title || `Continue · ${parentTitle}`, parentTitle);
  const summary = normalizeSummary(input.summary || `Continuation leaf drafted from ${parentTitle}.`);
  const path = `continuations/${slugify(parentTitle)}--${slugify(targetLabel)}.md`;
  const createdAt = nowIso(options);
  const creationContract = buildArtifactCreationContract({ schemaId: targetId, transitionType: 'continue-from-record' });
  const markdown = createContinuationMarkdown({ parentRecord, targetId, targetLabel, title, summary, createdAt, creationContract });
  const draft = {
    schema: RECORD_TRANSITION_RESULT_SCHEMA_ID,
    title,
    summary,
    kind: targetId,
    status: 'local',
    path,
    markdown,
    sourceMode: 'local-transition',
    hasContinuityContext: true,
    hasIntegrity: true,
    creationContract,
    transition: {
      schema: RECORD_TRANSITION_RESULT_SCHEMA_ID,
      contract: RECORD_TRANSITION_CONTRACT_ID,
      type: 'continue-from-record',
      parentRecordId: parentRecord.id || '',
      parentPath: parentRecord.path || '',
      parentBoundary: boundaryForRecord(parentRecord),
      targetSchemaId: targetId,
      createdAt,
      creationContractId: creationContract.id
    }
  };
  draft.creationValidation = validateArtifactCreationResult(draft, parentRecord, { contract: creationContract });
  draft.validation = validateTransitionDraft(draft, parentRecord);
  return draft;
}

export function createReferenceDraft(parentRecord = {}, input = {}, options = {}) {
  const parentTitle = String(parentRecord.title || 'artifact').trim();
  const title = normalizeTitle(input.title || `Reference · ${parentTitle}`, parentTitle);
  const summary = normalizeSummary(input.summary || `Reference leaf preserving ${parentTitle}.`);
  const path = `references/${slugify(parentTitle)}.md`;
  const createdAt = nowIso(options);
  const creationContract = buildArtifactCreationContract({ schemaId: 'tiinex.evidence.v1', transitionType: 'reference-record' });
  const markdown = createArtifactDraftMarkdown(creationContract, {
    parentRecord,
    title,
    summary,
    createdAt,
    status: 'draft/local',
    why: 'Created as a browser-local reference draft from an existing Tiinex record.',
    bodyMarkdown: createEvidenceReferenceBody({ parentRecord, title, summary })
  });
  const draft = {
    schema: RECORD_TRANSITION_RESULT_SCHEMA_ID,
    title,
    summary,
    kind: 'tiinex.evidence.v1',
    status: 'local',
    path,
    markdown,
    sourceMode: 'local-reference',
    hasContinuityContext: true,
    hasIntegrity: true,
    creationContract,
    transition: {
      schema: RECORD_TRANSITION_RESULT_SCHEMA_ID,
      contract: RECORD_TRANSITION_CONTRACT_ID,
      type: 'reference-record',
      parentRecordId: parentRecord.id || '',
      parentPath: parentRecord.path || '',
      parentBoundary: boundaryForRecord(parentRecord),
      targetSchemaId: 'tiinex.evidence.v1',
      createdAt,
      creationContractId: creationContract.id
    }
  };
  draft.creationValidation = validateArtifactCreationResult(draft, parentRecord, { contract: creationContract });
  draft.validation = validateTransitionDraft(draft, parentRecord);
  return draft;
}


function createEvidenceReferenceBody({ parentRecord = {}, title = 'Reference', summary = '' }) {
  const boundary = boundaryForRecord(parentRecord);
  const sourceLabel = parentRecord.source?.label || parentRecord.source?.repo || parentRecord.source?.id || '';
  const excerpt = truncate(String(parentRecord.markdown || parentRecord.summary || '').trim(), 1800) || '_No embedded source material was available._';
  return [
    `# ${title}`,
    '',
    '## Reference',
    '',
    'This browser-local Evidence draft preserves the selected record as bounded reference material.',
    '',
    '## Supported Claim Or Question',
    '',
    summary || `Preserves ${parentRecord.title || 'the selected artifact'} as supporting material for later review or continuation.`,
    '',
    '## Provenance',
    '',
    `- Parent Trace: ${parentRecord.id ? `record:${parentRecord.id}` : 'record:unassigned'}`,
    parentRecord.path ? `- Parent path: ${parentRecord.path}` : '',
    sourceLabel ? `- Parent source: ${sourceLabel}` : '',
    `- Boundary: ${boundary}`,
    '',
    '## Evidence Material',
    '',
    '```markdown',
    excerpt,
    '```',
    '',
    '## Preservation And Fidelity',
    '',
    '- Method: browser-local reference draft from loaded material.',
    '- Fidelity: excerpted material is bounded to the currently loaded record; remote parents are not fetched or completed silently.',
    '- Mutation: no source mutation; no publication occurred.',
    '',
    '## Interpretation Limits',
    '',
    '- This Evidence draft preserves material for review; it does not validate, endorse, attest, or make the supported claim true.',
    '- Missing parent, source, or remote material must remain explicit until loaded or resolved through a separate audit/lineage traversal.'
  ].filter(Boolean).join('\n');
}

function createContinuationMarkdown({ parentRecord, targetId, targetLabel, title, summary, createdAt, creationContract }) {
  return createArtifactDraftMarkdown(creationContract, {
    parentRecord,
    currentSchemaId: targetId,
    title,
    summary,
    createdAt,
    status: 'draft/local',
    why: 'Created as a browser-local continuation draft. No source provenance is inferred.',
    bodyMarkdown: [
      `# ${title}`,
      '',
      `## ${targetLabel} Draft`,
      '',
      summary,
      '',
      '## Source Boundary',
      '',
      `- ${boundaryForRecord(parentRecord)}`,
      parentRecord.path ? `- Parent path: ${parentRecord.path}` : '',
      parentRecord.source?.label ? `- Parent source: ${parentRecord.source.label}` : '',
      '',
      '## Source Excerpt',
      '',
      truncate(String(parentRecord.markdown || parentRecord.summary || '').trim(), 1800) || '_No embedded source material was available._'
    ].filter(Boolean).join('\n')
  });
}

function createRootEnvelope({ parentRecord, currentSchemaId, createdAt, summary, status, why }) {
  const parentSchemaId = parentSchemaForRecord(parentRecord);
  return [
    '# Continuity Context',
    '',
    `- Envelope Schema: [${ROOT_SCHEMA_ID}](${ROOT_SCHEMA_ID}.schema.md)`,
    '- Parent',
    `  - Parent Schema: [${parentSchemaId}](${parentSchemaId}.schema.md)`,
    `  - Created At: ${parentRecord.createdAt || 'unknown'}`,
    `  - Trace: ${parentRecord.id ? `record:${parentRecord.id}` : 'record:unassigned'}`,
    parentRecord.path ? `  - Origin: ${parentRecord.path}` : '',
    `  - Boundary: ${boundaryForRecord(parentRecord)}`,
    '- Current',
    `  - Current Schema: [${currentSchemaId}](${currentSchemaId}.schema.md)`,
    `  - Created At: ${createdAt}`,
    `  - Summary: ${summary}`,
    `  - Status: ${status}`,
    `  - Why: ${why}`
  ].filter(Boolean).join('\n');
}

function createDraftIntegrity() {
  return [
    '# Continuity Integrity',
    '',
    '- Draft Local Integrity',
    '  - Method: browser-local-draft',
    '  - Value: pending-publication-or-export'
  ].join('\n');
}

function parentSchemaForRecord(record = {}) {
  return record.kind && String(record.kind).includes('.') ? String(record.kind) : ROOT_SCHEMA_ID;
}

function boundaryForRecord(record = {}) {
  const source = record.source || {};
  if (source.adapterId === 'github') return 'source-backed github material';
  if (source.adapterId === 'local' || source.kind === 'local-session' || record.sourceMode?.startsWith?.('local')) return 'browser-local session material; no GitHub provenance inferred';
  return 'explicit record boundary';
}

function normalizeTitle(value, fallback = 'artifact') {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  return text.slice(0, 96) || `Continue · ${fallback}`.slice(0, 96);
}

function normalizeSummary(value) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, 280) || 'Continuation drafted in Tiinex.';
}

function labelFromSchemaId(id = '') {
  const tail = String(id || '').split('.').filter(Boolean).slice(-2, -1)[0] || String(id || 'leaf');
  return tail.charAt(0).toUpperCase() + tail.slice(1);
}

function slugify(value = '') {
  return String(value || 'artifact').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 64) || 'artifact';
}

function truncate(value = '', limit = 1800) {
  const text = String(value || '').trim();
  return text.length > limit ? `${text.slice(0, limit)}\n…` : text;
}

function nowIso(options = {}) {
  if (typeof options.clock === 'function') return options.clock();
  return new Date().toISOString();
}
