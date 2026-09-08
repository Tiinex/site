import { parseArtifactMarkdown } from '../../../artifacts/artifact.parse.js';
import { auditPortableRecord } from '../audit/audit.capability.js';

export const PORTABLE_AUTHORING_PARENT_SCHEMA_ID = 'tiinex.portable.authoring-parent.v1';

export function projectPortableAuthoringParent(input = {}) {
  const records = normalizeRecords(input);
  if (records.length !== 1) return freeze({ schema: PORTABLE_AUTHORING_PARENT_SCHEMA_ID, status: 'blocked', parentRecord: null, findings: [{ severity: 'error', code: 'portable.authoring-parent.exactly-one-required', message: 'Authoring Parent projection requires exactly one local text artifact.' }], operationBoundary: boundary() });
  const record = records[0];
  let parsed;
  try { parsed = parseArtifactMarkdown(record.markdown); }
  catch { return freeze({ schema: PORTABLE_AUTHORING_PARENT_SCHEMA_ID, status: 'blocked', parentRecord: null, findings: [{ severity: 'error', code: 'portable.authoring-parent.parse-failed', message: 'Selected Parent bytes are not a readable Tiinex artifact.' }], operationBoundary: boundary() }); }
  const audit = auditPortableRecord({ ...record, title: parsed.title, schemaId: parsed.envelope?.current?.schema?.id, currentSchemaId: parsed.envelope?.current?.schema?.id, parent: parsed.envelope?.parent });
  if (audit.status !== 'readable' || audit.qualification?.exact !== true || (audit.findings || []).some((item) => item.severity === 'error')) return freeze({ schema: PORTABLE_AUTHORING_PARENT_SCHEMA_ID, status: 'blocked', parentRecord: null, findings: [{ severity: 'error', code: 'portable.authoring-parent.unqualified', message: 'Selected Parent must pass exact shared audit before it can be used for native authoring.' }], operationBoundary: boundary() });
  const schemaId = String(parsed.envelope?.current?.schema?.id || audit.schemaId || '');
  const schemaTarget = String(parsed.envelope?.current?.schema?.target || '');
  const createdAt = String(parsed.envelope?.current?.createdAt || audit.artifact?.createdAt || '');
  return freeze({
    schema: PORTABLE_AUTHORING_PARENT_SCHEMA_ID,
    status: 'ready',
    parentRecord: {
      id: String(record.path || record.id || ''), path: String(record.path || record.id || ''), schemaId, currentSchemaId: schemaId, currentCreatedAt: createdAt,
      markdown: record.markdown, sourceMode: String(record.sourceMode || 'portable-node-local'),
      schemaReferenceAuthority: { schemaId, preferredTarget: schemaTarget, exactTargets: schemaTarget ? [schemaTarget] : [], resolutionState: 'unresolved', evidence: { basis: 'declared-current-schema-reference-only' } }
    },
    findings: [],
    operationBoundary: boundary(),
    boundary: 'Projects exact supplied Parent bytes and declared current schema locator into shared draft-authoring input. A declared schema locator remains unresolved and is not upgraded to publication or canonical reference authority.'
  });
}

function normalizeRecords(input = {}) {
  if (Array.isArray(input.records)) return input.records;
  return (Array.isArray(input.files) ? input.files : []).filter((item) => typeof item?.content === 'string').map((item) => ({ id: String(item.path || ''), path: String(item.path || ''), markdown: String(item.content || ''), sourceMode: item.sourceMode || '' }));
}
function boundary() { return { sourceMutation: false, remoteWrite: false, authoring: false }; }
function freeze(value) { if (Array.isArray(value)) return Object.freeze(value.map(freeze)); if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value; return Object.freeze(Object.fromEntries(Object.entries(value).map(([key, item]) => [key, freeze(item)]))); }
