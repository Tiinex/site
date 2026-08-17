import { parseArtifactMarkdown } from '../artifacts/artifact.parse.js';
import { canDiscardLocalDraft, canEditLocalDraft, artifactSchemaId } from '../artifacts/artifact.localDraft.js';
import { resolveSchemaModule } from '../schemas/resolver.js';
import { durableLocalMutationDecision, DurableLocalMutationOperation } from './durableLocalMutationPolicy.js';

export const LOCAL_DRAFT_MUTATION_COMMAND_SCHEMA_ID = 'tiinex.local-draft.mutation-command.v1';

export function runLocalDraftUpdateCommand({ lifecycle, state = {}, workspaceId = '', recordId = '', candidate = {}, persistenceOwnership = null } = {}) {
  const authority = durableLocalMutationDecision(persistenceOwnership, DurableLocalMutationOperation.localDraftCreate);
  if (!authority.ok) return refusal(authority.error, state, authority.notice, authority);
  const context = recordContext(state, workspaceId, recordId);
  if (!context.ok) return refusal(context.error, state, context.notice);
  const original = context.record;
  if (!canEditLocalDraft(original)) return refusal('record.edit.refused', state, 'Only supported browser-local drafts can be edited.');
  if (!lifecycle?.addWorkspaceRecord) return refusal('lifecycle.missing', state, 'Could not update local draft.');
  const markdown = String(candidate?.markdown || '').trim();
  if (!markdown) return refusal('record.edit.markdown.required', state, 'Edited draft Markdown is required.');

  let before, after;
  try { before = parseArtifactMarkdown(original.markdown || ''); after = parseArtifactMarkdown(markdown); }
  catch (_) { return refusal('record.edit.markdown.invalid', state, 'Edited draft Markdown could not be parsed.'); }

  const invariantError = validateStableEditIdentity(original, candidate, before, after);
  if (invariantError) return refusal(invariantError.code, state, invariantError.notice);
  if (!String(after.envelope?.current?.summary || '').trim()) return refusal('record.edit.summary.required', state, 'Task Summary cannot be empty during local draft edit.');
  const schemaId = artifactSchemaId(original);
  const resolution = resolveSchemaModule({ schemaId });
  if (resolution.fallbackUsed || typeof resolution.module?.validate !== 'function') return refusal('record.edit.validator.unavailable', state, `No exact validator is available for ${schemaId || 'this draft'}.`);
  const findings = resolution.module.validate(after) || [];
  const errors = findings.filter((finding) => finding?.severity === 'error');
  if (errors.length) return { ok: false, error: 'record.edit.validation.failed', state, notice: 'Edited draft does not satisfy its schema.', findings };

  const sanitized = buildEditedLocalDraftRecord(original, after, markdown, schemaId);
  const result = lifecycle.addWorkspaceRecord(state, context.workspace.id, sanitized);
  if (!result?.ok) return refusal(result?.error || 'record.edit.commit.failed', state, 'Could not update local draft.');
  if (String(result.record?.id || '') !== String(original.id || '') || String(result.record?.path || '') !== String(original.path || '')) return refusal('record.edit.identity.commit-drift', state, 'Local draft identity changed during update.');
  return { ok: true, schema: LOCAL_DRAFT_MUTATION_COMMAND_SCHEMA_ID, state: result.state, workspace: result.workspace, record: result.record, findings, notice: `Updated local draft ${result.record?.title || original.title || 'artifact'}.` };
}

export function runLocalDraftDiscardCommand({ lifecycle, state = {}, workspaceId = '', recordId = '', persistenceOwnership = null } = {}) {
  const authority = durableLocalMutationDecision(persistenceOwnership, DurableLocalMutationOperation.localDraftDelete);
  if (!authority.ok) return refusal(authority.error, state, authority.notice, authority);
  const context = recordContext(state, workspaceId, recordId);
  if (!context.ok) return refusal(context.error, state, context.notice);
  if (!canDiscardLocalDraft(context.record)) return refusal('record.remove.refused', state, 'Only browser-local drafts can be discarded.');
  if (!lifecycle?.removeWorkspaceRecord) return refusal('lifecycle.missing', state, 'Could not discard local draft.');
  const result = lifecycle.removeWorkspaceRecord(state, context.workspace.id, context.record.id);
  if (!result?.ok) return refusal(result?.error || 'record.remove.failed', state, 'Could not discard local draft.');
  return { ok: true, schema: LOCAL_DRAFT_MUTATION_COMMAND_SCHEMA_ID, state: result.state, workspace: result.workspace, record: result.record, notice: `Removed local draft ${result.record?.title || result.record?.path || 'artifact'} from this browser session.` };
}

function buildEditedLocalDraftRecord(original = {}, parsed = {}, markdown = '', schemaId = '') {
  return Object.assign({}, original, {
    id: original.id,
    path: original.path,
    schemaId: original.schemaId || schemaId,
    kind: original.kind || schemaId,
    createdAt: original.createdAt,
    sourceMode: original.sourceMode,
    source: original.source,
    markdown,
    title: parsed.title,
    summary: parsed.envelope?.current?.summary ?? ''
  });
}

function validateStableEditIdentity(original = {}, candidate = {}, before = {}, after = {}) {
  const checks = [
    ['record.edit.id.changed', candidate.id, original.id, 'Record identity cannot change during local draft edit.'],
    ['record.edit.path.changed', candidate.path, original.path, 'Draft path cannot change during local draft edit.'],
    ['record.edit.schema.changed', candidate.schemaId || candidate.kind, artifactSchemaId(original), 'Current Schema cannot change during local draft edit.'],
    ['record.edit.current-schema.changed', after.envelope?.current?.schema?.id, before.envelope?.current?.schema?.id, 'Current Schema cannot change during local draft edit.'],
    ['record.edit.created-at.changed', after.envelope?.current?.createdAt, before.envelope?.current?.createdAt, 'Original Created At must remain stable during local draft edit.'],
    ['record.edit.parent-schema.changed', after.envelope?.parent?.schema?.id, before.envelope?.parent?.schema?.id, 'Parent Schema cannot change during local draft edit.'],
    ['record.edit.parent-trace.changed', after.envelope?.parent?.trace, before.envelope?.parent?.trace, 'Parent Trace cannot change during local draft edit.'],
    ['record.edit.parent-origin.changed', after.envelope?.parent?.origin, before.envelope?.parent?.origin, 'Parent Origin cannot change during local draft edit.'],
    ['record.edit.parent-boundary.changed', after.envelope?.parent?.boundary, before.envelope?.parent?.boundary, 'Parent Boundary cannot change during local draft edit.']
  ];
  for (const [code, actual, expected, notice] of checks) {
    if (actual !== undefined && String(actual || '') !== String(expected || '')) return { code, notice };
  }
  const beforeShell = losslessEditShell(before.markdown || original.markdown || '');
  const afterShell = losslessEditShell(after.markdown || candidate.markdown || '');
  if (afterShell !== beforeShell) {
    return { code: 'record.edit.continuity-shell.changed', notice: 'Continuity, provenance, status, schema locators, and integrity declarations cannot change during local Task edit.' };
  }
  return null;
}

function losslessEditShell(markdown = '') {
  const sections = rawArtifactSections(markdown);
  return [
    maskEditableCurrentSummary(sections.envelope),
    '---TIINEX-INTEGRITY---',
    normalizeProtectedSection(sections.integrity)
  ].join('\n');
}

function rawArtifactSections(markdown = '') {
  const text = normalizeMarkdownLineEndings(markdown).trim();
  const boundary = /^---\s*$/m.exec(text);
  const envelope = boundary ? text.slice(0, boundary.index) : text;
  if (!boundary) return { envelope: normalizeProtectedSection(envelope), integrity: '' };
  const remainder = text.slice(boundary.index + boundary[0].length).replace(/^\n/, '');
  const integrityIndex = remainder.search(/^# Continuity Integrity\s*$/m);
  return {
    envelope: normalizeProtectedSection(envelope),
    integrity: integrityIndex === -1 ? '' : normalizeProtectedSection(remainder.slice(integrityIndex))
  };
}

function maskEditableCurrentSummary(envelope = '') {
  const lines = normalizeMarkdownLineEndings(envelope).split('\n');
  const currentStart = lines.findIndex((line) => /^-\s+Current\s*$/.test(line));
  if (currentStart === -1) return normalizeProtectedSection(envelope);
  let currentEnd = lines.length;
  for (let index = currentStart + 1; index < lines.length; index += 1) {
    if (/^-\s+\S/.test(lines[index])) { currentEnd = index; break; }
  }
  for (let index = currentStart + 1; index < currentEnd; index += 1) {
    const summary = lines[index].match(/^(\s+)-\s*Summary:\s*(.*)$/);
    if (!summary) continue;
    lines[index] = `${summary[1]}- Summary: __TIINEX_EDITABLE_CURRENT_SUMMARY__`;
    break;
  }
  return normalizeProtectedSection(lines.join('\n'));
}

function normalizeProtectedSection(value = '') {
  return normalizeMarkdownLineEndings(value).split('\n').map((line) => line.replace(/[ \t]+$/g, '')).join('\n').trim();
}

function normalizeMarkdownLineEndings(value = '') { return String(value || '').replace(/\r\n?/g, '\n'); }

function recordContext(state = {}, workspaceId = '', recordId = '') {
  const targetId = String(workspaceId || state?.activeWorkspaceId || '');
  const workspace = (state?.workspaces || []).find((item) => String(item?.id || '') === targetId);
  if (!workspace) return { ok: false, error: 'workspace.not.found', notice: 'Workspace was not found.' };
  const cleanId = String(recordId || '').trim();
  const record = (workspace.records || []).find((item) => String(item?.id || '') === cleanId);
  if (!record) return { ok: false, error: 'record.not.found', notice: 'Local draft was not found.' };
  return { ok: true, workspace, record };
}

function refusal(error, state, notice, authority = null) { return { ok: false, error, state, notice, authority }; }
