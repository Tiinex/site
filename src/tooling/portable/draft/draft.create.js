import { createArtifactDraftMarkdown, buildArtifactCreationContract } from '../../../schemas/creation.contracts.js';
import { portableFinding, summarizePortableFindings } from '../findings.js';
import { findSchemaMaterial } from '../input/portable.input.js';
import { buildPortableSchemaGuide, planPortableArtifact } from '../schema/schema.guide.js';
import { parsePortableSchemaDocument } from '../schema/schema.contract.js';
import { validatePortableDraft } from './draft.operations.js';

export const PORTABLE_DRAFT_CREATION_SCHEMA_ID = 'tiinex.portable.draft-creation.v1';
export const PORTABLE_STAGED_ARTIFACT_SCHEMA_ID = 'tiinex.portable.staged-artifact.v1';

export function createPortableLocalDraft(input = {}, options = {}) {
  const schemaId = String(input.schemaId || options.schemaId || '').trim();
  const allowIncomplete = input.allowIncomplete === true || options.allowIncomplete === true;
  const values = normalizeValues(input.values || input.inputs || {});
  const planResult = planPortableArtifact({ ...input, schemaId, values }, options);
  const guideResult = buildPortableSchemaGuide({ ...input, schemaId, task: 'create', detail: input.detail || options.detail || 'standard' }, options);
  const findings = [...(planResult.findings || []), ...(guideResult.findings || [])];
  const schemaMaterial = findSchemaMaterial(schemaId, input.materials || input);
  const document = schemaMaterial?.markdown ? parsePortableSchemaDocument(schemaMaterial.markdown) : null;
  const exactContract = buildArtifactCreationContract({ schemaId, transitionType: input.transitionType || options.transitionType || 'create-artifact' });

  if (!schemaId) findings.push(portableFinding('error', 'portable.draft-create.schema.required', 'Local draft creation requires a target schema id.'));
  if (!schemaMaterial && exactContract.status !== 'ready') findings.push(portableFinding('error', 'portable.draft-create.schema-material.required', 'Readable child schema material or exact creation tooling is required; schema meaning will not be guessed.', { schemaId }));
  if (planResult.plan.missingInputs.length && !allowIncomplete) {
    findings.push(portableFinding('error', 'portable.draft-create.inputs.blocked', 'Draft creation is blocked until required authoring inputs are supplied or allowIncomplete is explicitly enabled.', {
      schemaId,
      missingInputs: planResult.plan.missingInputs
    }));
  }
  if (findings.some((finding) => finding.severity === 'error')) {
    const summary = summarizePortableFindings(findings);
    return Object.freeze({
      schema: PORTABLE_DRAFT_CREATION_SCHEMA_ID,
      status: 'blocked',
      schemaId,
      draft: null,
      plan: planResult.plan,
      guide: guideResult.guide,
      qualification: creationQualification({ schemaId, exactContract, schemaMaterial, validation: null, allowIncomplete, blocked: true }),
      findings: Object.freeze(findings),
      findingSummary: summary
    });
  }

  const title = cleanSingleLine(input.title || values.Title || values.title || `${schemaLabel(schemaId)} Draft`, 120);
  const summary = cleanSingleLine(input.summary || values.Summary || values.summary || `${schemaLabel(schemaId)} local draft.`, 360);
  const createdAt = String(input.createdAt || options.createdAt || new Date().toISOString());
  const bodyMarkdown = String(input.bodyMarkdown || renderBody({
    title,
    plan: planResult.plan,
    document,
    values,
    sections: input.sections || {},
    allowIncomplete
  })).trim();
  const parentRecord = normalizeParent(input.parentRecord || input.parent || {});
  const markdown = exactContract.status === 'ready'
    ? createArtifactDraftMarkdown(exactContract, {
      parentRecord,
      currentSchemaId: schemaId,
      createdAt,
      title,
      summary,
      status: input.currentStatus || 'draft/local',
      why: input.why || 'Created as an explicit portable local draft. No source provenance is inferred.',
      bodyMarkdown
    })
    : renderGenericDraft({
      schemaId,
      title,
      summary,
      createdAt,
      why: input.why,
      currentStatus: input.currentStatus,
      parentRecord,
      bodyMarkdown
    });
  const path = normalizeDraftPath(input.path || `drafts/${slug(title)}.md`);
  const draft = Object.freeze({
    id: String(input.id || path),
    path,
    schemaId,
    markdown,
    status: 'local',
    lifecycleStatus: 'draft',
    sourceMode: 'local-portable-draft',
    source: null,
    creationMode: exactContract.status === 'ready' ? 'exact-site-creation-contract' : 'readable-schema-llm-writer',
    createdAt
  });
  const validation = validatePortableDraft({ ...input, ...draft, files: mergeSchemaFiles(input, schemaMaterial) }, options);
  findings.push(...(validation.findings || []).filter((finding) => !findings.some((existing) => existing.code === finding.code && existing.message === finding.message)));
  const status = validation.status === 'clean' ? 'created-clean' : validation.status === 'degraded' ? 'created-degraded' : allowIncomplete ? 'created-incomplete' : 'created-invalid';
  const summaryResult = summarizePortableFindings(findings);
  return Object.freeze({
    schema: PORTABLE_DRAFT_CREATION_SCHEMA_ID,
    status,
    schemaId,
    draft,
    plan: planResult.plan,
    guide: guideResult.guide,
    validation,
    qualification: creationQualification({ schemaId, exactContract, schemaMaterial, validation, allowIncomplete, blocked: false }),
    findings: Object.freeze(findings),
    findingSummary: summaryResult
  });
}

export function stagePortableDraft(input = {}, options = {}) {
  const draft = normalizeDraftInput(input.draft || input);
  const allowInvalid = input.allowInvalid === true || options.allowInvalid === true;
  const validation = input.validation?.schema === 'tiinex.portable.draft-validation.v1'
    ? input.validation
    : validatePortableDraft({ ...input, ...draft }, options);
  const findings = [...(validation.findings || [])];
  if (!draft.markdown) findings.push(portableFinding('error', 'portable.stage-draft.markdown.required', 'Staging requires a local draft with Markdown content.'));
  if (!String(draft.sourceMode || '').startsWith('local-')) findings.push(portableFinding('error', 'portable.stage-draft.source-mode.invalid', 'Only local draft material may be staged through portable tooling.', { sourceMode: draft.sourceMode }));
  if (draft.source) findings.push(portableFinding('error', 'portable.stage-draft.source-object.blocked', 'A portable staged draft must not inherit a source adapter object.'));
  if (validation.findingSummary?.counts?.error && !allowInvalid) findings.push(portableFinding('error', 'portable.stage-draft.validation.blocked', 'Draft staging is blocked while validation errors remain. Set allowInvalid only for an explicitly incomplete local checkpoint.'));
  const blocked = findings.some((finding) => finding.severity === 'error');
  const stagedArtifact = blocked ? null : Object.freeze({
    schema: PORTABLE_STAGED_ARTIFACT_SCHEMA_ID,
    id: draft.id || draft.path,
    path: draft.path,
    schemaId: draft.schemaId || validation.declaredSchema || validation.requestedSchema,
    markdown: draft.markdown,
    state: 'staged-local',
    lifecycleStatus: validation.findingSummary?.counts?.error ? 'incomplete' : 'draft',
    sourceMode: 'local-portable-staged',
    source: null,
    stagedAt: String(input.stagedAt || options.stagedAt || new Date().toISOString()),
    qualification: Object.freeze({
      validationStatus: validation.status,
      exactRuntimeValidation: Boolean(validation.qualification?.exactRuntimeValidation),
      contractDrivenStructuralValidation: Boolean(validation.qualification?.contractDrivenStructuralValidation),
      exportReady: validation.status === 'clean' && Boolean(validation.qualification?.exactRuntimeValidation),
      limitations: Object.freeze(validation.qualification?.limitations || [])
    })
  });
  const findingSummary = summarizePortableFindings(findings);
  return Object.freeze({
    schema: 'tiinex.portable.stage-result.v1',
    status: blocked ? 'blocked' : 'staged',
    stagedArtifact,
    validation,
    findings: Object.freeze(findings),
    findingSummary
  });
}

function renderBody({ title, plan, document, values, sections, allowIncomplete }) {
  const lines = [`# ${title}`];
  const usedFields = new Set();
  const sectionMap = normalizeSections(sections);
  const contractGroups = new Map((document?.validation?.groups || []).map((group) => [normalizeKey(group.name), group]));
  const requiredSections = (plan.structure || []).map((item) => item.section).filter((section) => !isEnvelopeSection(section));

  for (const sectionName of requiredSections) {
    lines.push('', `## ${sectionName}`, '');
    const explicit = sectionMap.get(normalizeKey(sectionName));
    if (typeof explicit === 'string') lines.push(explicit.trim());
    else {
      const fields = fieldsForGroup(contractGroups.get(normalizeKey(sectionName)));
      const rendered = [];
      if (!fields.length) {
        const sectionValue = valueFor(values, sectionName);
        if (sectionValue !== undefined) {
          rendered.push(formatFieldValue(sectionValue));
          usedFields.add(normalizeKey(sectionName));
        }
      }
      for (const field of fields) {
        const value = valueFor(values, field);
        if (value !== undefined) {
          rendered.push(`- ${field}: ${formatFieldValue(value)}`);
          usedFields.add(normalizeKey(field));
        } else if (allowIncomplete) rendered.push(`- ${field}: TODO`);
      }
      if (explicit && typeof explicit === 'object') {
        for (const [field, value] of Object.entries(explicit)) {
          rendered.push(`- ${field}: ${formatFieldValue(value)}`);
          usedFields.add(normalizeKey(field));
        }
      }
      lines.push(...(rendered.length ? rendered : [allowIncomplete ? '- TODO: complete this required section.' : '']));
    }
  }

  for (const [sectionName, content] of sectionMap.entries()) {
    if (requiredSections.some((required) => normalizeKey(required) === sectionName)) continue;
    lines.push('', `## ${displayKey(sectionName)}`, '');
    if (typeof content === 'string') lines.push(content.trim());
    else for (const [field, value] of Object.entries(content || {})) lines.push(`- ${field}: ${formatFieldValue(value)}`);
  }

  const unassigned = Object.entries(values).filter(([field]) => !['title', 'summary'].includes(normalizeKey(field)) && !usedFields.has(normalizeKey(field)));
  if (unassigned.length) {
    lines.push('', '## Additional Declared Inputs', '');
    for (const [field, value] of unassigned) lines.push(`- ${field}: ${formatFieldValue(value)}`);
  }
  return lines.filter((line, index, all) => line !== '' || all[index - 1] !== '').join('\n').trim();
}

function renderGenericDraft({ schemaId, title, summary, createdAt, why, currentStatus, parentRecord, bodyMarkdown }) {
  const lines = [
    '# Continuity Context',
    '',
    '- Envelope Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)'
  ];
  if (parentRecord.id || parentRecord.path || parentRecord.schemaId) {
    lines.push(
      '- Parent',
      `  - Parent Schema: [${parentRecord.schemaId || 'tiinex.root.v1'}](${parentRecord.schemaId || 'tiinex.root.v1'}.schema.md)`,
      `  - Created At: ${parentRecord.createdAt || 'unknown'}`,
      `  - Trace: ${parentRecord.id ? `record:${parentRecord.id}` : parentRecord.trace || 'record:unassigned'}`,
      ...(parentRecord.path ? [`  - Origin: ${parentRecord.path}`] : []),
      `  - Boundary: ${parentRecord.boundary || 'portable local material; no source provenance inferred'}`
    );
  }
  lines.push(
    '- Current',
    `  - Current Schema: [${schemaId}](${schemaId}.schema.md)`,
    `  - Created At: ${createdAt}`,
    `  - Summary: ${summary}`,
    `  - Status: ${currentStatus || 'draft/local'}`,
    `  - Why: ${cleanSingleLine(why || 'Created from explicitly supplied readable schema material as a portable local draft.', 360)}`,
    '',
    '---',
    '',
    bodyMarkdown,
    '',
    '# Continuity Integrity',
    '',
    '- Draft Local Integrity',
    '  - Method: portable-readable-schema-draft',
    '  - Value: pending-validation-and-explicit-export'
  );
  return lines.join('\n');
}

function creationQualification({ exactContract, schemaMaterial, validation, allowIncomplete, blocked }) {
  return Object.freeze({
    blocked,
    exactCreateTooling: exactContract.status === 'ready',
    readableChildSchema: Boolean(schemaMaterial),
    creationMode: exactContract.status === 'ready' ? 'exact-site-creation-contract' : schemaMaterial ? 'llm-writer-from-readable-schema' : 'unavailable',
    exactRuntimeValidation: Boolean(validation?.qualification?.exactRuntimeValidation),
    contractDrivenStructuralValidation: Boolean(validation?.qualification?.contractDrivenStructuralValidation),
    incompleteDraftAllowed: allowIncomplete,
    remoteWrite: false,
    sourceMutation: false,
    limitations: Object.freeze([
      ...(exactContract.status === 'ready' ? [] : ['Exact child creation renderer is unavailable; the draft was rendered from readable schema structure and remains partially qualified.']),
      ...(validation?.qualification?.limitations || []),
      ...(allowIncomplete ? ['Incomplete placeholders may remain and must not be treated as a qualified artifact.'] : [])
    ])
  });
}

function mergeSchemaFiles(input, schemaMaterial) {
  const files = [...(Array.isArray(input.files) ? input.files : [])];
  if (schemaMaterial && !files.some((file) => file.path === schemaMaterial.path && String(file.content || file.markdown || '') === schemaMaterial.markdown)) {
    files.push({ path: schemaMaterial.path, content: schemaMaterial.markdown });
  }
  return files;
}

function normalizeParent(parent = {}) {
  return Object.freeze({
    id: String(parent.id || ''),
    path: String(parent.path || ''),
    kind: String(parent.kind || parent.schemaId || ''),
    schemaId: String(parent.schemaId || parent.kind || ''),
    createdAt: String(parent.createdAt || ''),
    trace: String(parent.trace || ''),
    boundary: String(parent.boundary || parent.source?.boundary || ''),
    sourceMode: String(parent.sourceMode || ''),
    source: parent.source || null
  });
}

function normalizeDraftInput(draft = {}) {
  return Object.freeze({
    id: String(draft.id || draft.path || ''),
    path: normalizeDraftPath(draft.path || 'draft.md'),
    schemaId: String(draft.schemaId || draft.kind || ''),
    markdown: String(draft.markdown || ''),
    sourceMode: String(draft.sourceMode || 'local-portable-draft'),
    source: draft.source || null
  });
}

function normalizeValues(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).filter(([, fieldValue]) => fieldValue !== undefined && fieldValue !== null && fieldValue !== ''));
}

function normalizeSections(value) {
  const map = new Map();
  if (!value || typeof value !== 'object') return map;
  for (const [name, content] of Object.entries(value)) map.set(normalizeKey(name), content);
  return map;
}

function fieldsForGroup(group = {}) {
  const names = new Set(['required fields', 'required entries']);
  const fields = [];
  for (const category of group?.categories || []) {
    if (!names.has(normalizeKey(category.name))) continue;
    for (const item of category.items || []) fields.push(cleanContractToken(item));
  }
  return [...new Set(fields.filter(Boolean))];
}

function valueFor(values, field) {
  const wanted = normalizeKey(field);
  for (const [name, value] of Object.entries(values)) if (normalizeKey(name) === wanted) return value;
  return undefined;
}

function cleanContractToken(value = '') {
  return String(value || '').replace(/`/g, '').replace(/\s+—.*$/, '').replace(/\s+-\s+.*$/, '').replace(/\.$/, '').trim();
}

function isEnvelopeSection(section = '') {
  const key = normalizeKey(section);
  return key === 'continuity context' || key === 'continuity integrity';
}

function formatFieldValue(value) {
  if (Array.isArray(value)) return value.join('; ');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value).replace(/\r?\n/g, ' ').trim();
}

function normalizeDraftPath(value = '') {
  const path = String(value || '').replace(/\\/g, '/').replace(/^\/+/, '').replace(/\.\.(?:\/|$)/g, '').trim();
  return path.toLowerCase().endsWith('.md') ? path : `${path || 'draft'}.md`;
}

function schemaLabel(schemaId = '') {
  const parts = String(schemaId || 'artifact').split('.').filter(Boolean);
  const value = parts.length >= 3 ? parts[parts.length - 2] : parts.at(-1) || 'artifact';
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function cleanSingleLine(value, max) { return String(value || '').replace(/\s+/g, ' ').trim().slice(0, max); }
function slug(value = '') { return String(value || 'artifact').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'artifact'; }
function normalizeKey(value = '') { return String(value || '').toLowerCase().replace(/[`*_#]/g, '').replace(/[^a-z0-9]+/g, ' ').trim(); }
function displayKey(value = '') { return String(value || '').split(' ').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' '); }
