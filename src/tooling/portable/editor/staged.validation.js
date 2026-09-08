import path from 'node:path';
import { parseArtifactMarkdown } from '../../../artifacts/artifact.parse.js';
import { projectPortableEditorAssistance } from './editor.assistance.js';
import { auditPortableRecord } from '../audit/audit.capability.js';

export const PORTABLE_STAGED_VALIDATION_SCHEMA_ID = 'tiinex.portable.staged-validation.v1';

export function projectPortableStagedValidation(input = {}) {
  const records = normalizeRecords(input);
  const byPath = new Map(records.map((record) => [norm(record.path), record]).filter(([recordPath]) => recordPath));
  const stagedPaths = unique((input.stagedPaths || input.paths || []).map(norm).filter(Boolean));
  const stagedTiinexPaths = [];
  const ignoredStagedPaths = [];

  for (const stagedPath of stagedPaths) {
    const record = byPath.get(stagedPath);
    if (record && isTiinexArtifact(record.markdown)) stagedTiinexPaths.push(stagedPath);
    else ignoredStagedPaths.push(stagedPath);
  }

  const closure = new Set(stagedTiinexPaths);
  const queue = [...stagedTiinexPaths];
  while (queue.length) {
    const currentPath = queue.shift();
    const record = byPath.get(currentPath);
    const parentPath = record ? localParentPath(currentPath, record.markdown) : '';
    if (!parentPath || closure.has(parentPath) || !byPath.has(parentPath)) continue;
    closure.add(parentPath);
    queue.push(parentPath);
  }

  const validationRecords = records.filter((record) => closure.has(norm(record.path)) || /\.schema\.md$/i.test(norm(record.path)));
  const documents = [];
  const findings = [];
  for (const focusPath of [...closure].sort()) {
    const scope = stagedTiinexPaths.includes(focusPath) ? 'staged' : 'required-closure';
    const record = byPath.get(focusPath);
    let document;
    if (/\.schema\.md$/i.test(focusPath) && record) {
      const audit = auditPortableRecord(record);
      document = {
        path: focusPath,
        schemaId: audit.schemaId || '',
        validator: { state: audit.qualification?.exact === true ? 'qualified-exact-schema-definition' : 'unqualified-schema-definition' },
        diagnostics: (audit.findings || []).filter((item) => item.severity !== 'info').map((item) => ({ ...item, line: null, locationState: 'unresolved', locationBasis: 'schema-definition-audit' }))
      };
    } else {
      const projected = projectPortableEditorAssistance({ records: validationRecords, focusPath });
      document = projected.documents?.[0];
    }
    if (!document) {
      findings.push(finding('error', 'portable.staged-validation.document.unprojected', 'Shared validation could not project a staged or required-closure Tiinex artifact.', { path: focusPath, scope }));
      continue;
    }
    const diagnostics = (document.diagnostics || []).map((diagnostic) => freeze({ ...diagnostic, path: focusPath, scope }));
    documents.push(freeze({ path: focusPath, scope, schemaId: document.schemaId || '', validator: document.validator || null, diagnostics }));
    for (const diagnostic of diagnostics) findings.push(finding(diagnostic.severity || 'warning', diagnostic.code || 'portable.staged-validation.diagnostic', diagnostic.message || 'Shared validation finding.', { path: focusPath, scope, line: diagnostic.line ?? null, locationState: diagnostic.locationState || 'unresolved', locationBasis: diagnostic.locationBasis || '' }));
  }

  const blockingFindings = findings.filter((item) => item.severity === 'error' || item.severity === 'warning');
  const state = stagedTiinexPaths.length === 0 ? 'no-staged-tiinex' : blockingFindings.length ? 'blocked' : 'clean';
  return freeze({
    schema: PORTABLE_STAGED_VALIDATION_SCHEMA_ID,
    status: state === 'blocked' ? 'blocked' : 'ready',
    state,
    stagedPaths,
    stagedTiinexPaths,
    ignoredStagedPaths,
    closurePaths: [...closure].sort(),
    documents,
    findings,
    blockingFindingCount: blockingFindings.length,
    operationBoundary: { sourceMutation: false, remoteWrite: false, gitMutation: false },
    boundary: 'Validates only explicit staged Tiinex artifacts plus their required loaded local Parent closure. Unrelated non-staged defects are outside the gate; non-staged material may participate only as required validation authority or Parent closure.'
  });
}

function normalizeRecords(input = {}) {
  if (Array.isArray(input.records)) return input.records.map((record) => freeze({ ...record, path: norm(record.path || record.id || ''), markdown: String(record.markdown || record.content || '') }));
  return (Array.isArray(input.files) ? input.files : []).filter((item) => typeof item?.content === 'string').map((item) => freeze({ id: norm(item.path || ''), path: norm(item.path || ''), markdown: String(item.content || ''), sourceMode: item.sourceMode || '' }));
}
function isTiinexArtifact(markdown = '') {
  try { return Boolean(String(parseArtifactMarkdown(markdown)?.envelope?.current?.schema?.id || '').trim()); }
  catch { return false; }
}
function localParentPath(childPath = '', markdown = '') {
  try {
    const trace = String(parseArtifactMarkdown(markdown)?.envelope?.parent?.trace || '').trim();
    if (!trace || /^(?:https?:|github:|raw:)/i.test(trace)) return '';
    return norm(path.posix.join(path.posix.dirname(norm(childPath)), trace.replace(/\\/g, '/')));
  } catch { return ''; }
}
function unique(values = []) { return [...new Set(values)]; }
function norm(value = '') { return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '').replace(/^\/+|\/+$/g, ''); }
function finding(severity, code, message, context = {}) { return freeze({ severity, code, message, context }); }
function freeze(value) { if (Array.isArray(value)) return Object.freeze(value.map(freeze)); if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value; return Object.freeze(Object.fromEntries(Object.entries(value).map(([key, item]) => [key, freeze(item)]))); }
