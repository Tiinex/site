import { packageFileBytes, sha256Hex, utf8Bytes } from '../../../export/package.bytes.js';
import {
  HANDOFF_WORKSPACE_ARCHIVE_BINDING_SCHEMA_ID,
  HANDOFF_WORKSPACE_ARCHIVE_CODEC,
  HANDOFF_WORKSPACE_ARCHIVE_PROVIDER_KIND,
  HANDOFF_WORKSPACE_INNER_PATH_NORMALIZATION,
  normalizeHandoffWorkspaceInnerPath
} from './workspaceByteProvider.js';

export function buildWorkspaceArchiveBinding({ workspace = {}, qualified = {}, archiveFile = {}, targetFile = {}, coverage = '' } = {}) {
  const materialization = coverage === 'bounded' || String(workspace.materialization || '') === 'bounded' ? 'bounded' : 'complete';
  const evidence = materialization === 'bounded' ? (workspace.scopeEvidence || {}) : (workspace.completenessEvidence || {});
  const entries = (qualified.entries || []).map((entry) => Object.freeze({ path: entry.path, bytes: entry.bytes, sha256: entry.sha256, referenceTarget: entry.referenceTarget }));
  const entriesFingerprint = sha256Hex(utf8Bytes(stableJson(entries)));
  const totalBytes = entries.reduce((sum, entry) => sum + Number(entry.bytes || 0), 0);
  return deepFreeze({
    schema: HANDOFF_WORKSPACE_ARCHIVE_BINDING_SCHEMA_ID,
    version: 1,
    workspaceId: String(workspace.id || ''),
    transportCorrelationKey: String(workspace.transportCorrelationKey || ''),
    workspaceTarget: Object.freeze({
      packagePath: String(targetFile.path || ''),
      innerPath: String(qualified.target?.path || ''),
      bytes: Number(targetFile.bytes || 0),
      sha256: String(targetFile.sha256 || ''),
      schema: 'tiinex.workspace.v1',
      selfIntegrity: Object.freeze({ state: String(qualified.target?.selfIntegrity?.state || ''), value: String(qualified.target?.selfIntegrity?.value || '') }),
      locatorAuthority: false
    }),
    coverage: materialization,
    representation: Object.freeze({
      kind: materialization === 'bounded' ? 'bounded-workspace-snapshot' : 'complete-workspace-snapshot',
      packagePath: String(archiveFile.path || ''),
      mediaType: 'application/zip',
      codec: HANDOFF_WORKSPACE_ARCHIVE_CODEC,
      bytes: Number(archiveFile.bytes || 0),
      digest: Object.freeze({ method: 'sha256', value: String(archiveFile.sha256 || ''), target: 'archive-bytes-as-carried' }),
      deterministic: true,
      locatorAuthority: false
    }),
    entryMap: Object.freeze({ normalization: HANDOFF_WORKSPACE_INNER_PATH_NORMALIZATION, count: entries.length, entries: Object.freeze(entries) }),
    completeness: materialization === 'complete' ? Object.freeze({ state: 'qualified', basis: 'exact-qualified-workspace-completeness-evidence-plus-complete-archive-entry-set', entryCount: entries.length, totalBytes, entriesFingerprint }) : Object.freeze({}),
    scope: materialization === 'bounded' ? Object.freeze({ ...evidence, state: 'qualified', entryCount: entries.length, totalBytes, entriesFingerprint }) : Object.freeze({}),
    selection: Object.freeze({ rule: materialization === 'bounded' ? 'explicit-binding-per-bounded-scope' : 'exactly-one-binding-per-workspace', representationArtifactAuthority: 'explicit-recipient-workspace-representation-link' }),
    provider: Object.freeze({ kind: HANDOFF_WORKSPACE_ARCHIVE_PROVIDER_KIND, state: 'ready', addressing: 'qualified-workspace-id-plus-normalized-inner-path', fallback: 'none', materialization }),
    authority: Object.freeze({ workspaceIdentity: 'exact-workspace-target-byte-identity', archiveIdentity: 'exact-archive-byte-digest', pathAuthority: false, adjacencyAuthority: false, orderingAuthority: false, priorProvenanceAuthority: false })
  });
}

export function detachedParentCandidates(materialized = [], byPath = new Map()) {
  const out = [];
  const seen = new Set();
  for (const material of materialized || []) {
    const packagePath = String(material.packagePath || '');
    const workspacePath = normalizedOrEmpty(material.provenance?.path || material.originalPath || material.path || '');
    if (!packagePath || !workspacePath) continue;
    const files = byPath.get(packagePath) || [];
    if (files.length !== 1) continue;
    const data = packageFileBytes(files[0]);
    const sha256 = sha256Hex(data);
    const key = `${workspacePath}\u0000${sha256}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(Object.freeze({ path: workspacePath, data, bytes: data.byteLength, sha256 }));
  }
  return Object.freeze(out);
}

function normalizedOrEmpty(value = '') { const normalized = normalizeHandoffWorkspaceInnerPath(value); return normalized.state === 'qualified' ? normalized.path : ''; }
function stableJson(value) { return JSON.stringify(sortJson(value)); }
function sortJson(value) { if (Array.isArray(value)) return value.map(sortJson); if (!value || typeof value !== 'object') return value; return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortJson(value[key])])); }
function deepFreeze(value) { if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value; if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer) return value; for (const child of Object.values(value)) deepFreeze(child); return Object.freeze(value); }
