import { parseArtifactMarkdown } from '../../../artifacts/artifact.parse.js';
import { allocateContinuationPath, allocateRootArtifactPath } from '../../../transitions/record.transitions.js';
import { auditPortableRecord } from '../audit/audit.capability.js';

export const PORTABLE_HANDOFF_AUTHORING_PLAN_SCHEMA_ID = 'tiinex.portable.handoff-authoring-plan.v1';

export function projectPortableHandoffAuthoringPlan(input = {}) {
  const records = normalizeRecords(input);
  const title = String(input.title || '').trim();
  const parentPath = norm(input.parentPath || input.parent || '');
  if (!title) return blocked('portable.handoff-authoring.title-required', 'Handoff authoring path projection requires one title.');
  if (!parentPath) {
    const allocation = allocateRootArtifactPath({ targetId: 'tiinex.handoff.v1', targetLabel: 'Handoff', title }, { workspaceRecords: records });
    return ready({ mode: 'root', parentPath: '', path: allocation.path, pathPolicy: allocation.policy });
  }
  const parent = records.find((item) => norm(item.path || item.id || '') === parentPath);
  if (!parent) return blocked('portable.handoff-authoring.parent-unresolved', 'Selected authoring Parent is not present in the qualified local source material.', { parentPath });
  let parsed;
  try { parsed = parseArtifactMarkdown(parent.markdown); } catch { return blocked('portable.handoff-authoring.parent-parse-failed', 'Selected authoring Parent is not a readable Tiinex artifact.', { parentPath }); }
  const audit = auditPortableRecord({ ...parent, title: parsed.title || '', schemaId: parsed.envelope?.current?.schema?.id, currentSchemaId: parsed.envelope?.current?.schema?.id, parent: parsed.envelope?.parent || null });
  if (audit.status !== 'readable' || audit.qualification?.exact !== true || (audit.findings || []).some((item) => item.severity === 'error')) return blocked('portable.handoff-authoring.parent-unqualified', 'Selected authoring Parent must pass exact shared audit before child path allocation.', { parentPath });
  const parentRecord = { ...parent, title: parsed.title || '', path: parentPath, id: parentPath };
  const allocation = allocateContinuationPath({ parentRecord, targetId: 'tiinex.handoff.v1', targetLabel: 'Handoff', title }, { workspaceRecords: records });
  return ready({ mode: 'continuation', parentPath, path: allocation.path, pathPolicy: allocation.policy });
}

function ready(value) { return freeze({ schema: PORTABLE_HANDOFF_AUTHORING_PLAN_SCHEMA_ID, status: 'ready', ...value, findings: [], operationBoundary: boundary(), boundary: 'Shared path allocation only. It does not create the Handoff, select From/To, transfer responsibility, or grant Parent authority beyond the exact audited local Parent supplied by the caller.' }); }
function blocked(code, message, context = {}) { return freeze({ schema: PORTABLE_HANDOFF_AUTHORING_PLAN_SCHEMA_ID, status: 'blocked', mode: '', parentPath: '', path: '', pathPolicy: null, findings: [{ severity: 'error', code, message, context }], operationBoundary: boundary() }); }
function boundary() { return { sourceMutation: false, remoteWrite: false, authoring: false }; }
function normalizeRecords(input = {}) {
  if (Array.isArray(input.records)) return input.records;
  return (Array.isArray(input.files) ? input.files : []).filter((item) => typeof item?.content === 'string').map((item) => ({ id: String(item.path || ''), path: String(item.path || ''), markdown: String(item.content || ''), sourceMode: item.sourceMode || '' }));
}
function norm(value = '') { return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '').replace(/^\/+|\/+$/g, ''); }
function freeze(value) { if (Array.isArray(value)) return Object.freeze(value.map(freeze)); if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value; return Object.freeze(Object.fromEntries(Object.entries(value).map(([key, item]) => [key, freeze(item)]))); }
