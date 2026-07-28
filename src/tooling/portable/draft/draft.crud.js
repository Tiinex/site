import { parseArtifactMarkdown } from '../../../artifacts/artifact.parse.js';
import { portableFinding, summarizePortableFindings } from '../findings.js';
import { validatePortableDraft } from './draft.operations.js';

export const PORTABLE_DRAFT_UPDATE_SCHEMA_ID = 'tiinex.portable.draft-update.v1';
export const PORTABLE_DRAFT_DELETE_SCHEMA_ID = 'tiinex.portable.draft-delete.v1';

export function updatePortableLocalDraft(input = {}, options = {}) {
  const current = normalizeDraft(input.draft || input.currentDraft || {});
  const replacementMarkdown = String(input.replacementMarkdown || input.markdown || '').trim();
  const allowInvalid = input.allowInvalid === true || options.allowInvalid === true;
  const allowSchemaChange = input.allowSchemaChange === true || options.allowSchemaChange === true;
  const allowContinuityChange = input.allowContinuityChange === true || options.allowContinuityChange === true;
  const findings = [];

  validateLocalDraftBoundary(current, findings, 'update');
  if (!replacementMarkdown) findings.push(portableFinding('error', 'portable.draft-update.replacement.required', 'Updating a local draft requires complete replacement Markdown. Use schema guidance first; partial hidden patch semantics are not inferred.'));
  if (findings.some((entry) => entry.severity === 'error')) return updateResult('blocked', null, null, findings);

  const before = parseArtifactMarkdown(current.markdown);
  const after = safeParse(replacementMarkdown, findings);
  if (!after) return updateResult('blocked', null, null, findings);
  const beforeIdentity = artifactIdentity(before);
  const afterIdentity = artifactIdentity(after);
  if (!afterIdentity.schemaId) findings.push(portableFinding('error', 'portable.draft-update.schema.required', 'Replacement Markdown must declare Current Schema.'));
  if (!allowSchemaChange && beforeIdentity.schemaId !== afterIdentity.schemaId) findings.push(portableFinding('error', 'portable.draft-update.schema-change.blocked', 'Local draft update cannot silently change Current Schema. Create a new draft or explicitly allow a schema migration.', { before: beforeIdentity.schemaId, after: afterIdentity.schemaId }));
  if (!allowContinuityChange && !sameContinuity(beforeIdentity, afterIdentity)) findings.push(portableFinding('error', 'portable.draft-update.continuity-change.blocked', 'Local draft update cannot silently change Parent, Trace, or Origin. Create a new lineage child or explicitly allow a continuity repair.', { before: beforeIdentity.parent, after: afterIdentity.parent }));

  const validation = validatePortableDraft({
    ...input,
    id: current.id,
    path: current.path,
    schemaId: afterIdentity.schemaId || current.schemaId || beforeIdentity.schemaId,
    markdown: replacementMarkdown,
    sourceMode: 'local-portable-draft',
    source: null
  }, options);
  findings.push(...(validation.findings || []));
  const hasErrors = findings.some((entry) => entry.severity === 'error');
  if (hasErrors && !allowInvalid) return updateResult('blocked', null, validation, findings);

  const updatedAt = String(input.updatedAt || options.updatedAt || new Date().toISOString());
  const revision = Math.max(0, Number(current.revision || 0)) + 1;
  const draft = Object.freeze({
    ...current,
    schemaId: afterIdentity.schemaId || current.schemaId || beforeIdentity.schemaId,
    markdown: replacementMarkdown,
    sourceMode: 'local-portable-draft',
    source: null,
    lifecycleStatus: validation.findingSummary?.counts?.error ? 'incomplete' : 'draft',
    revision,
    updatedAt
  });
  const status = validation.status === 'clean' ? 'updated-clean' : validation.status === 'degraded' ? 'updated-degraded' : 'updated-invalid';
  return updateResult(status, draft, validation, findings, {
    previous: Object.freeze({ id: current.id, path: current.path, schemaId: beforeIdentity.schemaId, revision: current.revision || 0 }),
    qualification: Object.freeze({
      localOnly: true,
      sourceMutation: false,
      remoteWrite: false,
      schemaChangeAllowed: allowSchemaChange,
      continuityChangeAllowed: allowContinuityChange,
      completeReplacementRequired: true
    })
  });
}

export function deletePortableLocalDraft(input = {}, options = {}) {
  const current = normalizeDraft(input.draft || input.currentDraft || input);
  const findings = [];
  validateLocalDraftBoundary(current, findings, 'delete');
  const expected = String(input.confirmId || input.confirm || options.confirmId || '').trim();
  const actual = String(current.id || current.path || '').trim();
  if (!expected) findings.push(portableFinding('error', 'portable.draft-delete.confirmation.required', 'Deleting local draft state requires an explicit confirmation id or path.'));
  else if (expected !== actual && expected !== current.path) findings.push(portableFinding('error', 'portable.draft-delete.confirmation.mismatch', 'Deletion confirmation does not match the local draft id or path.', { expected, actual, path: current.path }));
  if (findings.some((entry) => entry.severity === 'error')) return deleteResult('blocked', null, findings);

  const deletion = Object.freeze({
    schema: PORTABLE_DRAFT_DELETE_SCHEMA_ID,
    status: 'deleted-local',
    id: actual,
    path: current.path,
    schemaId: current.schemaId || safeParse(current.markdown)?.envelope?.current?.schema?.id || '',
    reason: String(input.reason || options.reason || 'Explicit local draft removal.').trim(),
    deletedAt: String(input.deletedAt || options.deletedAt || new Date().toISOString()),
    retainedContent: false,
    boundary: Object.freeze({
      localStateOnly: true,
      sourceMutation: false,
      remoteWrite: false,
      filesystemWritePerformed: false,
      callerMustApplyRemovalToItsOwnExplicitLocalState: true
    })
  });
  return deleteResult('deleted-local', deletion, findings);
}

function validateLocalDraftBoundary(draft, findings, action) {
  if (!draft.markdown) findings.push(portableFinding('error', `portable.draft-${action}.markdown.required`, `${capitalize(action)} requires local draft Markdown.`));
  if (!String(draft.sourceMode || '').startsWith('local-')) findings.push(portableFinding('error', `portable.draft-${action}.source-mode.invalid`, `${capitalize(action)} is allowed only for explicitly local draft state.`, { sourceMode: draft.sourceMode }));
  if (draft.source) findings.push(portableFinding('error', `portable.draft-${action}.source-object.blocked`, `${capitalize(action)} must not mutate or inherit a source adapter object.`));
}

function artifactIdentity(parsed = {}) {
  const parent = parsed.envelope?.parent || {};
  return Object.freeze({
    schemaId: String(parsed.envelope?.current?.schema?.id || ''),
    parent: Object.freeze({
      schemaId: String(parent.schema?.id || ''),
      trace: String(parent.trace || ''),
      origin: String(parent.origin || '')
    })
  });
}

function sameContinuity(before, after) {
  return before.parent.schemaId === after.parent.schemaId
    && before.parent.trace === after.parent.trace
    && before.parent.origin === after.parent.origin;
}

function safeParse(markdown, findings = null) {
  try { return parseArtifactMarkdown(String(markdown || '')); }
  catch (error) {
    findings?.push(portableFinding('error', 'portable.draft-update.markdown.invalid', 'Replacement Markdown could not be parsed as a Tiinex artifact.', { detail: String(error?.message || error) }));
    return null;
  }
}

function normalizeDraft(draft = {}) {
  return Object.freeze({
    id: String(draft.id || draft.path || ''),
    path: normalizePath(draft.path || draft.id || 'draft.md'),
    schemaId: String(draft.schemaId || draft.kind || ''),
    markdown: String(draft.markdown || ''),
    status: String(draft.status || 'local'),
    lifecycleStatus: String(draft.lifecycleStatus || 'draft'),
    sourceMode: String(draft.sourceMode || 'local-portable-draft'),
    source: draft.source || null,
    creationMode: String(draft.creationMode || ''),
    createdAt: String(draft.createdAt || ''),
    revision: Math.max(0, Number(draft.revision || 0) || 0)
  });
}

function updateResult(status, draft, validation, findings, extra = {}) {
  const normalized = Object.freeze([...findings]);
  return Object.freeze({
    schema: PORTABLE_DRAFT_UPDATE_SCHEMA_ID,
    status,
    draft,
    validation,
    ...extra,
    findings: normalized,
    findingSummary: summarizePortableFindings(normalized)
  });
}

function deleteResult(status, deletion, findings) {
  const normalized = Object.freeze([...findings]);
  return Object.freeze({
    schema: PORTABLE_DRAFT_DELETE_SCHEMA_ID,
    status,
    deletion,
    findings: normalized,
    findingSummary: summarizePortableFindings(normalized)
  });
}

function normalizePath(value = '') {
  const path = String(value || '').replace(/\\/g, '/').replace(/^\/+/, '').replace(/\.\.(?:\/|$)/g, '').trim();
  return path.toLowerCase().endsWith('.md') ? path : `${path || 'draft'}.md`;
}

function capitalize(value = '') { return value.charAt(0).toUpperCase() + value.slice(1); }
