import { externalWebArtifactUrl } from '../sources/source.explicitTargets.js';
import { validateTransitionDraft } from './transition.validate.js';
import { parseArtifactMarkdown } from '../artifacts/artifact.parse.js';
import { buildArtifactCreationContract, createArtifactDraftMarkdown, validateArtifactCreationResult } from '../schemas/creation.contracts.js';

export const RECORD_TRANSITION_CONTRACT_ID = 'tiinex.record.transitions.v1';
export const RECORD_TRANSITION_RESULT_SCHEMA_ID = 'tiinex.record.transition.result.v1';
export const ROOT_SCHEMA_ID = 'tiinex.root.v1';

export function listContinuationTargets(schemaRegistry = {}) {
  const modules = Array.isArray(schemaRegistry.modules) ? schemaRegistry.modules : [];
  return modules
    .filter((module) => module && module.kind === 'concrete' && module.role === 'core-artifact' && module.id === 'tiinex.task.v1')
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
  const targetId = String(target.id || input.targetSchemaId || 'tiinex.task.v1').trim();
  const targetLabel = String(target.label || labelFromSchemaId(targetId)).trim();
  const parentTitle = String(parentRecord.title || 'artifact').trim();
  const title = normalizeTitle(input.title || `Continue · ${parentTitle}`, parentTitle);
  const summary = normalizeSummary(input.summary || `Continuation leaf drafted from ${parentTitle}.`);
  const pathTitle = input.title ? title : parentTitle;
  const allocation = allocateContinuationPath({ parentRecord, targetId, targetLabel, title: pathTitle }, options);
  const path = allocation.path;
  const createdAt = nowIso(options);
  const creationContract = buildArtifactCreationContract({ schemaId: targetId, transitionType: 'continue-from-record' });
  const markdown = createContinuationMarkdown({ parentRecord, targetId, targetLabel, title, summary, createdAt, creationContract });
  const envelopeMetadata = draftEnvelopeMetadata(markdown, targetId);
  const draft = {
    schema: RECORD_TRANSITION_RESULT_SCHEMA_ID,
    schemaId: targetId,
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
    ...envelopeMetadata,
    transition: {
      schema: RECORD_TRANSITION_RESULT_SCHEMA_ID,
      contract: RECORD_TRANSITION_CONTRACT_ID,
      type: 'continue-from-record',
      intent: String(input.intent || target.intent || 'continue'),
      definitionId: String(input.transitionDefinitionId || target.transitionDefinitionId || target.contract || ''),
      parentRecordId: parentRecord.id || '',
      parentPath: parentRecord.path || '',
      parentBoundary: boundaryForRecord(parentRecord),
      targetSchemaId: targetId,
      createdAt,
      creationContractId: creationContract.id,
      pathPolicy: allocation.policy
    }
  };
  draft.creationValidation = validateArtifactCreationResult(draft, parentRecord, { contract: creationContract });
  draft.validation = validateTransitionDraft(draft, parentRecord);
  return draft;
}


export function ensureUniqueTransitionPath(draft = {}, existingRecords = []) {
  const currentPath = String(draft.path || '').trim();
  if (!currentPath) return Object.assign({}, draft);
  const occupied = existingTransitionPaths({ existingRecords });
  let nextPath = currentPath;
  const policy = draft.transition?.pathPolicy || null;
  if (occupied.has(canonicalLocalPath(currentPath)) && policy?.kind === 'same-parent-directory') nextPath = pathFromPolicy(policy, occupied);
  else nextPath = uniqueTransitionPath(currentPath, occupied);
  if (nextPath === currentPath) return Object.assign({}, draft);
  const nextTransition = draft.transition ? Object.assign({}, draft.transition) : draft.transition;
  return Object.assign({}, draft, { path: nextPath, id: '', transition: nextTransition });
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
  const envelopeMetadata = draftEnvelopeMetadata(markdown, 'tiinex.evidence.v1');
  const draft = {
    schema: RECORD_TRANSITION_RESULT_SCHEMA_ID,
    schemaId: 'tiinex.evidence.v1',
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
    ...envelopeMetadata,
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




export function allocateRootArtifactPath({ targetId = '', targetLabel = '', title = '' } = {}, options = {}) {
  const occupied = existingTransitionPaths(options);
  const explicitPath = canonicalLocalPath(options.path || options.draftPath || '');
  if (explicitPath) return { path: uniqueTransitionPath(explicitPath, occupied), policy: pathPolicyForExplicit(explicitPath) };
  const labelSlug = slugify(title || targetLabel || labelFromSchemaId(targetId) || 'artifact');
  const targetSlug = slugify(targetLabel || labelFromSchemaId(targetId) || 'artifact');
  const basePath = `.topics/${labelSlug}--${targetSlug}.trace.md`;
  return {
    path: uniqueTransitionPath(basePath, occupied),
    policy: {
      schema: 'tiinex.transition.path-policy.v1',
      kind: 'standalone-root',
      parentDirectory: '.topics',
      labelSlug,
      targetSlug,
      extension: '.trace.md'
    }
  };
}

export function allocateContinuationPath({ parentRecord = {}, targetId = '', targetLabel = '', title = '' } = {}, options = {}) {
  const occupied = existingTransitionPaths(options);
  const explicitPath = canonicalLocalPath(options.path || options.draftPath || '');
  if (explicitPath) return { path: uniqueTransitionPath(explicitPath, occupied), policy: pathPolicyForExplicit(explicitPath) };
  const parentPath = externalWebArtifactUrl(parentRecord) ? '' : canonicalLocalPath(parentRecord.path || parentRecord.sourcePath || parentRecord.sourceTarget?.sourceArtifactPath || '');
  const parentDir = parentDirectory(parentPath) || '.topics';
  const parentPrefix = lineagePrefixFromPath(parentPath);
  const labelSlug = slugify(title || parentRecord.title || targetLabel || 'continuation');
  const targetSlug = slugify(targetLabel || labelFromSchemaId(targetId) || 'leaf');
  const extension = '.trace.md';
  const policy = {
    schema: 'tiinex.transition.path-policy.v1',
    kind: 'same-parent-directory',
    parentDirectory: parentDir,
    parentPath,
    parentLineagePrefix: parentPrefix,
    labelSlug,
    targetSlug,
    extension
  };
  return { path: pathFromPolicy(policy, occupied), policy };
}

function pathFromPolicy(policy = {}, occupied = new Set()) {
  const dir = canonicalLocalPath(policy.parentDirectory || '.topics') || '.topics';
  const extension = String(policy.extension || '.trace.md').startsWith('.') ? String(policy.extension || '.trace.md') : `.${policy.extension}`;
  const labelSlug = slugify(policy.labelSlug || 'continuation');
  const targetSlug = slugify(policy.targetSlug || 'leaf');
  const parentPrefix = String(policy.parentLineagePrefix || '').trim();
  if (parentPrefix) {
    const childPrefix = nextChildLineagePrefix(parentPrefix, dir, occupied);
    return `${dir}/${childPrefix}-${labelSlug}.${extension.replace(/^\./, '')}`;
  }
  return uniqueTransitionPath(`${dir}/${labelSlug}--${targetSlug}${extension}`, occupied);
}

function pathPolicyForExplicit(path = '') {
  const canonical = canonicalLocalPath(path);
  return {
    schema: 'tiinex.transition.path-policy.v1',
    kind: 'explicit-path',
    parentDirectory: parentDirectory(canonical) || '',
    explicitPath: canonical
  };
}

function parentDirectory(path = '') {
  const raw = String(path || '').trim();
  if (/^https?:\/\//i.test(raw)) return '';
  const canonical = canonicalLocalPath(raw);
  if (!canonical) return '';
  const index = canonical.lastIndexOf('/');
  return index > -1 ? canonical.slice(0, index) || '.' : '';
}

function lineagePrefixFromPath(path = '') {
  const name = basenameWithoutKnownMarkdownExtension(path);
  if (!name) return '';
  const recoveredComment = name.match(/^comment-(\d{3})(?:-|$)/i);
  if (recoveredComment) return recoveredComment[1];
  const numeric = name.match(/^(\d+(?:-\d+)*)(?:-|$)/);
  if (numeric && !/^20\d{2}$/.test(numeric[1])) return numeric[1];
  return '';
}

function nextChildLineagePrefix(parentPrefix = '', dir = '', occupied = new Set()) {
  const prefix = String(parentPrefix || '').trim();
  const width = childOrdinalWidth(prefix);
  const numbers = [];
  for (const path of occupied || []) {
    const canonical = canonicalLocalPath(path);
    if (parentDirectory(canonical) !== dir) continue;
    const name = basenameWithoutKnownMarkdownExtension(canonical);
    const escaped = prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const match = name.match(new RegExp(`^${escaped}-(\\d+)(?:-|$)`));
    if (!match || !isChildOrdinalSegment(prefix, match[1])) continue;
    numbers.push(Number(match[1]));
  }
  const next = numbers.length ? Math.max(...numbers) + 1 : 1;
  return `${prefix}-${String(next).padStart(width, '0')}`;
}

function isChildOrdinalSegment(prefix = '', value = '') {
  const raw = String(value || '').trim();
  if (!/^\d+$/.test(raw)) return false;
  return true;
}

function childOrdinalWidth(prefix = '') {
  const parts = String(prefix || '').split('-').filter(Boolean);
  if (parts.length >= 2 && parts.every((part) => /^\d{2}$/.test(part))) return 2;
  return 1;
}

function basenameWithoutKnownMarkdownExtension(path = '') {
  const canonical = canonicalLocalPath(path);
  const base = canonical.split('/').filter(Boolean).pop() || '';
  return base.replace(/\.trace\.md$/i, '').replace(/\.workspace\.md$/i, '').replace(/\.md$/i, '');
}

function draftEnvelopeMetadata(markdown = '', fallbackSchemaId = '') {
  const parsed = parseArtifactMarkdown(markdown);
  const parent = parsed.envelope?.parent || {};
  const current = parsed.envelope?.current || {};
  return {
    schemaId: current.schema?.id || fallbackSchemaId || '',
    parentSchemaId: parent.schema?.id || '',
    trace: parent.trace || '',
    traceLabel: parent.traceLabel || '',
    origin: parent.origin || '',
    boundary: parent.boundary || '',
    createdAt: current.createdAt || '',
    currentCreatedAt: current.createdAt || '',
    currentStatus: current.status || '',
    currentWhy: current.why || ''
  };
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
      '## Next Step',
      '',
      '- Review and refine this task draft before export/publication.',
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
  const schemaId = String(record.schemaId || record.currentSchemaId || '').trim();
  return schemaId || ROOT_SCHEMA_ID;
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

function existingTransitionPaths(options = {}) {
  const inputs = [];
  if (Array.isArray(options.existingRecords)) inputs.push(...options.existingRecords);
  if (Array.isArray(options.workspaceRecords)) inputs.push(...options.workspaceRecords);
  if (Array.isArray(options.existingPaths)) inputs.push(...options.existingPaths.map((path) => ({ path })));
  return new Set(inputs.map((item) => canonicalLocalPath(typeof item === 'string' ? item : item?.path || '')).filter(Boolean));
}

function uniqueTransitionPath(basePath = '', occupied = new Set()) {
  const canonical = canonicalLocalPath(basePath || 'continuations/continuation.md') || 'continuations/continuation.md';
  if (!occupied.has(canonical)) return canonical;
  const compound = canonical.match(/^(.*?)(\.trace\.md|\.workspace\.md|\.schema\.md|\.md)$/i);
  const stem = compound ? compound[1] : (canonical.lastIndexOf('.') > -1 ? canonical.slice(0, canonical.lastIndexOf('.')) : canonical);
  const ext = compound ? compound[2] : (canonical.lastIndexOf('.') > -1 ? canonical.slice(canonical.lastIndexOf('.')) : '');
  for (let index = 2; index < 10000; index += 1) {
    const candidate = `${stem}-${index}${ext}`;
    if (!occupied.has(candidate)) return candidate;
  }
  return `${stem}-${Date.now().toString(36)}${ext}`;
}

function canonicalLocalPath(value = '') {
  const raw = String(value || '').trim().replace(/\\/g, '/').replace(/\/+/g, '/');
  if (!raw) return '';
  const parts = [];
  for (const part of raw.split('/')) {
    if (!part || part === '.') continue;
    if (part === '..') {
      parts.pop();
      continue;
    }
    parts.push(part);
  }
  return parts.join('/');
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
