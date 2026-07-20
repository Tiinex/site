export const RECORD_TRANSITION_CONTRACT_ID = 'tiinex.record.transitions.v1';
export const RECORD_TRANSITION_RESULT_SCHEMA_ID = 'tiinex.record.transition.result.v1';

export function listContinuationTargets(schemaRegistry = {}) {
  const modules = Array.isArray(schemaRegistry.modules) ? schemaRegistry.modules : [];
  return modules
    .filter((module) => module && module.kind === 'concrete' && module.role === 'core-artifact')
    .map((module) => ({
      id: module.id,
      label: module.label || labelFromSchemaId(module.id),
      summary: module.summary || 'Schema-backed Tiinex leaf.',
      parentSchemaId: module.parentSchemaId || '',
      contract: RECORD_TRANSITION_CONTRACT_ID
    }));
}

export function createContinuationDraft(parentRecord = {}, target = {}, input = {}) {
  const targetId = String(target.id || input.targetSchemaId || 'tiinex.topic.v1').trim();
  const targetLabel = String(target.label || labelFromSchemaId(targetId)).trim();
  const parentTitle = String(parentRecord.title || 'artifact').trim();
  const title = normalizeTitle(input.title || `Continue · ${parentTitle}`, parentTitle);
  const summary = normalizeSummary(input.summary || `Continuation leaf drafted from ${parentTitle}.`);
  const path = `continuations/${slugify(parentTitle)}--${slugify(targetLabel)}.md`;
  const markdown = createContinuationMarkdown({ parentRecord, targetId, targetLabel, title, summary });
  return {
    schema: RECORD_TRANSITION_RESULT_SCHEMA_ID,
    title,
    summary,
    kind: targetId,
    status: 'local',
    path,
    markdown,
    sourceMode: 'local-transition',
    hasContinuityContext: true,
    transition: {
      schema: RECORD_TRANSITION_RESULT_SCHEMA_ID,
      contract: RECORD_TRANSITION_CONTRACT_ID,
      type: 'continue-from-record',
      parentRecordId: parentRecord.id || '',
      parentPath: parentRecord.path || '',
      parentBoundary: boundaryForRecord(parentRecord),
      targetSchemaId: targetId
    }
  };
}

export function createReferenceDraft(parentRecord = {}, input = {}) {
  const parentTitle = String(parentRecord.title || 'artifact').trim();
  const title = normalizeTitle(input.title || `Reference · ${parentTitle}`, parentTitle);
  const summary = normalizeSummary(input.summary || `Reference leaf preserving ${parentTitle}.`);
  const path = `references/${slugify(parentTitle)}.md`;
  const markdown = [
    '# Continuity Context',
    '',
    '- Parent',
    `  - Record ID: ${parentRecord.id || 'unassigned'}`,
    `  - Title: ${parentTitle}`,
    parentRecord.path ? `  - Path: ${parentRecord.path}` : '',
    `  - Boundary: ${boundaryForRecord(parentRecord)}`,
    '- Current',
    '  - Current Schema: [tiinex.evidence.v1](tiinex.evidence.v1)',
    `  - Summary: ${summary}`,
    '  - Status: draft/local',
    '',
    '---',
    '',
    `# ${title}`,
    '',
    '## Reference',
    '',
    parentRecord.summary || 'No summary available.',
    '',
    parentRecord.markdown ? '## Source Excerpt\n\n```markdown\n' + truncate(parentRecord.markdown, 1800) + '\n```' : ''
  ].filter(Boolean).join('\n');
  return {
    schema: RECORD_TRANSITION_RESULT_SCHEMA_ID,
    title,
    summary,
    kind: 'tiinex.evidence.v1',
    status: 'local',
    path,
    markdown,
    sourceMode: 'local-reference',
    hasContinuityContext: true,
    transition: {
      schema: RECORD_TRANSITION_RESULT_SCHEMA_ID,
      contract: RECORD_TRANSITION_CONTRACT_ID,
      type: 'reference-record',
      parentRecordId: parentRecord.id || '',
      parentPath: parentRecord.path || '',
      parentBoundary: boundaryForRecord(parentRecord),
      targetSchemaId: 'tiinex.evidence.v1'
    }
  };
}

function createContinuationMarkdown({ parentRecord, targetId, targetLabel, title, summary }) {
  return [
    '# Continuity Context',
    '',
    '- Parent',
    `  - Record ID: ${parentRecord.id || 'unassigned'}`,
    `  - Title: ${parentRecord.title || 'Untitled artifact'}`,
    parentRecord.path ? `  - Path: ${parentRecord.path}` : '',
    `  - Boundary: ${boundaryForRecord(parentRecord)}`,
    '- Current',
    `  - Current Schema: [${targetId}](${targetId})`,
    `  - Summary: ${summary}`,
    '  - Status: draft/local',
    '  - Why: Created as a browser-local continuation draft. No source provenance is inferred.',
    '',
    '---',
    '',
    `# ${title}`,
    '',
    `## ${targetLabel} draft`,
    '',
    summary,
    '',
    '## Source boundary',
    '',
    `- ${boundaryForRecord(parentRecord)}`,
    parentRecord.path ? `- Parent path: ${parentRecord.path}` : '',
    parentRecord.source?.label ? `- Parent source: ${parentRecord.source.label}` : '',
    '',
    '## Source excerpt',
    '',
    truncate(String(parentRecord.markdown || parentRecord.summary || '').trim(), 1800) || '_No embedded source material was available._'
  ].filter(Boolean).join('\n');
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
