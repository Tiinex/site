import { parseArtifactMarkdown } from '../../../artifacts/artifact.parse.js';
import { auditPortableRecord } from '../audit/audit.capability.js';
import { portableRuntimeValidationAuthorityForRecord } from '../schema/qualifiedLocalRoot.runtime.js';

export const PORTABLE_HANDOFF_ENDPOINT_PROJECTION_SCHEMA_ID = 'tiinex.portable.handoff-endpoint-projection.v1';

export function projectQualifiedHandoffEndpoints(input = {}) {
  const workspaceId = token(input.workspaceId || input.workspace || 'workspace') || 'workspace';
  const records = normalizeRecords(input);
  const candidates = [];
  const findings = [];
  for (const record of records) {
    const path = norm(record.path || record.id || '');
    if (!path || !/\.md$/i.test(path)) continue;
    let parsed;
    try { parsed = parseArtifactMarkdown(record.markdown || ''); } catch { continue; }
    const schemaId = String(parsed.envelope?.current?.schema?.id || record.schemaId || '').trim();
    if (!schemaId) continue;
    const audit = auditPortableRecord({ ...record, schemaId, currentSchemaId: schemaId, title: parsed.title || record.title || '' }, { requireExactSchemaAuthority: true });
    if (audit.status !== 'readable' || audit.qualification?.exact !== true || (audit.findings || []).some((item) => item.severity === 'error')) continue;
    const authority = portableRuntimeValidationAuthorityForRecord({ ...record, schemaId, currentSchemaId: schemaId });
    if (authority.state !== 'qualified') continue;
    const lineage = Array.isArray(authority.compiledContract?.lineage) ? authority.compiledContract.lineage.map(String) : [];
    const kind = lineage.includes('tiinex.party.role.v1') || schemaId === 'tiinex.party.role.v1'
      ? 'role'
      : lineage.includes('tiinex.party.v1') || schemaId === 'tiinex.party.v1' || schemaId.startsWith('tiinex.party.')
        ? 'party'
        : '';
    if (!kind) continue;
    const target = `${workspaceId}::${path}`;
    candidates.push(freeze({
      id: target,
      target,
      reference: target,
      kind,
      label: String(parsed.title || record.title || path),
      workspaceId,
      artifactPath: path,
      schemaId,
      qualification: 'qualified-exact'
    }));
  }
  candidates.sort((a, b) => a.kind.localeCompare(b.kind) || a.label.localeCompare(b.label) || a.target.localeCompare(b.target));
  return freeze({
    schema: PORTABLE_HANDOFF_ENDPOINT_PROJECTION_SCHEMA_ID,
    status: 'ready',
    workspaceId,
    candidates,
    findings,
    operationBoundary: { sourceMutation: false, remoteWrite: false, identityInference: false },
    boundary: 'Projects only exactly qualified Role/Party artifact choices. target/reference preserves explicit Workspace artifact identity as workspaceId::artifact-path; holder labels, transport identity, chronology, filenames, and repository basenames never infer endpoint identity.'
  });
}

function normalizeRecords(input = {}) {
  if (Array.isArray(input.records)) return input.records;
  return (Array.isArray(input.files) ? input.files : []).filter((item) => typeof item?.content === 'string').map((item) => ({ id: String(item.path || ''), path: String(item.path || ''), markdown: String(item.content || ''), sourceMode: item.sourceMode || '' }));
}
function norm(value = '') { return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '').replace(/^\/+|\/+$/g, ''); }
function token(value = '') { return String(value || '').trim().toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^-+|-+$/g, ''); }
function freeze(value) { if (Array.isArray(value)) return Object.freeze(value.map(freeze)); if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value; return Object.freeze(Object.fromEntries(Object.entries(value).map(([key, item]) => [key, freeze(item)]))); }
