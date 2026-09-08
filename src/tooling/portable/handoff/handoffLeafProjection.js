import path from 'node:path';
import { auditPortableRecord } from '../audit/audit.capability.js';
import { parseArtifactMarkdown } from '../../../artifacts/artifact.parse.js';

export const PORTABLE_HANDOFF_LEAF_PROJECTION_SCHEMA_ID = 'tiinex.portable.handoff-leaf-projection.v1';

export function projectQualifiedHandoffLeaves(input = {}) {
  const records = normalizeRecords(input);
  const qualified = records.map((record) => ({ record, audit: auditPortableRecord(record) }))
    .filter(({ audit }) => audit.schemaId === 'tiinex.handoff.v1' && audit.status === 'readable' && audit.qualification?.exact === true && !(audit.findings || []).some((item) => item.severity === 'error'));
  const byPath = new Map(records.map((record) => [norm(record.path || record.id || ''), record]).filter(([key]) => key));
  const handoffPaths = new Set(qualified.map(({ record }) => norm(record.path || record.id || '')).filter(Boolean));
  const ancestorHandoffs = new Set();
  for (const { record } of qualified) {
    let current = record;
    const visited = new Set();
    for (let depth = 0; depth < 256; depth += 1) {
      const currentPath = norm(current?.path || current?.id || '');
      if (!currentPath || visited.has(currentPath)) break;
      visited.add(currentPath);
      const parentPath = resolveParentPath(currentPath, current?.parent?.trace || current?.parentTrace || '');
      if (!parentPath) break;
      if (handoffPaths.has(parentPath)) ancestorHandoffs.add(parentPath);
      current = byPath.get(parentPath);
      if (!current) break;
    }
  }
  const candidates = qualified.map(({ record, audit }) => projectCandidate(record, audit, !ancestorHandoffs.has(norm(record.path || record.id || ''))));
  const leaves = candidates.filter((item) => item.leaf === true);
  return freeze({
    schema: PORTABLE_HANDOFF_LEAF_PROJECTION_SCHEMA_ID,
    status: 'ready',
    candidates,
    leaves,
    pointerless: {
      selectionLabel: 'No Handoff pointer',
      packageRole: 'recipient-facing-workspace-carrier',
      semanticState: 'qualified-canonical-docs',
      manufactureState: 'ready',
      blockerCode: '',
      consequence: 'Workspace transport only — no Handoff semantics.'
    },
    operationBoundary: { sourceMutation: false, remoteWrite: false, manufacture: false },
    boundary: 'Qualified Handoff leaf projection is derived from exact shared Handoff validation plus declared Parent continuity only. Package selection does not create From/To, transfer, acceptance, completion, or Role authority.'
  });
}

function projectCandidate(record = {}, audit = {}, leaf = false) {
  const markdown = String(record.markdown || '');
  return freeze({
    path: norm(record.path || record.id || ''),
    title: String(record.title || audit.title || ''),
    schemaId: 'tiinex.handoff.v1',
    leaf,
    qualification: 'qualified-exact',
    from: fieldInSection(markdown, 'Handoff Parties', 'From'),
    to: fieldInSection(markdown, 'Handoff Parties', 'To'),
    purpose: fieldInSection(markdown, 'Handoff Parties', 'Purpose')
  });
}

function fieldInSection(markdown = '', heading = '', field = '') {
  const lines = String(markdown || '').replace(/\r\n?/g, '\n').split('\n');
  const start = lines.findIndex((line) => new RegExp(`^##\\s+${escapeRegExp(heading)}\\s*$`, 'i').test(line));
  if (start < 0) return '';
  for (let i = start + 1; i < lines.length; i += 1) {
    if (/^##\s+/.test(lines[i])) break;
    const match = lines[i].match(new RegExp(`^\\s*-\\s+${escapeRegExp(field)}\\s*:\\s*(.*)$`, 'i'));
    if (match) return match[1].trim();
  }
  return '';
}
function resolveParentPath(childPath = '', trace = '') {
  const target = String(trace || '').trim();
  if (!target || /^(?:https?:|github:|raw:)/i.test(target)) return '';
  return norm(path.posix.join(path.posix.dirname(norm(childPath)), target.replace(/\\/g, '/')));
}
function norm(value = '') { return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '').replace(/^\/+|\/+$/g, ''); }
function escapeRegExp(value = '') { return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function freeze(value) { if (Array.isArray(value)) return Object.freeze(value.map(freeze)); if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value; return Object.freeze(Object.fromEntries(Object.entries(value).map(([key, item]) => [key, freeze(item)]))); }

function normalizeRecords(input = {}) {
  if (Array.isArray(input.records)) return input.records;
  return (Array.isArray(input.files) ? input.files : []).filter((item) => typeof item?.content === 'string').map((item) => {
    const record = { id: String(item.path || ''), path: String(item.path || ''), markdown: String(item.content || ''), sourceMode: item.sourceMode || '' };
    try {
      const parsed = parseArtifactMarkdown(record.markdown);
      return Object.freeze({ ...record, title: parsed.title || '', parent: parsed.envelope?.parent || null });
    } catch { return Object.freeze(record); }
  });
}
