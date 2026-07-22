import { openPortableSession, restorePortableSession, serializePortableSession } from '../session/portable.session.js';
import { portableFinding, summarizePortableFindings } from '../findings.js';

export const PORTABLE_CHECKPOINT_SCHEMA_ID = 'tiinex.portable.checkpoint.v1';
export const PORTABLE_CHECKPOINT_VERSION = 1;

export function createPortableCheckpoint(input = {}, options = {}) {
  const snapshot = normalizeSessionSnapshot(input.session || input.snapshot || input);
  const createdAt = String(input.createdAt || options.createdAt || new Date().toISOString());
  const findings = [];
  const unresolved = snapshot.durableFindings || [];
  const staged = snapshot.stagedArtifacts || [];
  const invalidStaged = staged.filter((artifact) => artifact?.qualification?.validationStatus === 'invalid' || artifact?.qualification?.exportReady === false);
  if (unresolved.length) findings.push(portableFinding('info', 'portable.checkpoint.durable-findings.pending', 'Checkpoint contains durable findings that have not yet been materialized into artifacts.', { count: unresolved.length }));
  if (invalidStaged.length) findings.push(portableFinding('warning', 'portable.checkpoint.staged-artifacts.incomplete', 'Checkpoint contains staged artifacts that are not fully export-ready.', { count: invalidStaged.length }));
  const summary = checkpointSummary(snapshot);
  const digest = stableHash(JSON.stringify({ summary, materials: snapshot.materials, staged, unresolved, schemaCache: snapshot.schemaCache }));
  const findingSummary = summarizePortableFindings(findings);
  const status = findingSummary.counts.error ? 'blocked' : invalidStaged.length || unresolved.length ? 'degraded' : 'ready';
  return Object.freeze({
    schema: PORTABLE_CHECKPOINT_SCHEMA_ID,
    version: PORTABLE_CHECKPOINT_VERSION,
    checkpointId: `checkpoint:${digest}`,
    createdAt,
    status,
    summary,
    session: snapshot,
    integrity: Object.freeze({ method: 'portable-stable-hash-v1', value: digest, cryptographic: false }),
    boundary: Object.freeze({
      canonicalHandoffArtifact: false,
      canonicalPackageFormatLocked: false,
      hiddenChatStateIncluded: false,
      remoteFetch: false,
      remoteWrite: false,
      sourceMutation: false,
      statement: 'Portable checkpoint is an explicit recoverable session snapshot, not a canonical Tiinex handoff artifact.'
    }),
    findings: Object.freeze(findings),
    findingSummary
  });
}

export function restorePortableCheckpoint(checkpoint = {}) {
  if (checkpoint?.schema !== PORTABLE_CHECKPOINT_SCHEMA_ID) throw new Error('portable.checkpoint.schema.invalid');
  if (Number(checkpoint?.version || 0) !== PORTABLE_CHECKPOINT_VERSION) throw new Error('portable.checkpoint.version.unsupported');
  if (!checkpoint.session) throw new Error('portable.checkpoint.session.missing');
  const expectedDigest = stableHash(JSON.stringify({ summary: checkpointSummary(checkpoint.session), materials: checkpoint.session.materials, staged: checkpoint.session.stagedArtifacts || [], unresolved: checkpoint.session.durableFindings || [], schemaCache: checkpoint.session.schemaCache || [] }));
  if (checkpoint.integrity?.value && checkpoint.integrity.value !== expectedDigest) throw new Error('portable.checkpoint.integrity.mismatch');
  const restored = restorePortableSession(checkpoint.session).snapshot();
  return Object.freeze({
    schema: 'tiinex.portable.checkpoint.restore.v1',
    checkpointId: String(checkpoint.checkpointId || ''),
    status: 'restored',
    session: restored,
    boundary: checkpoint.boundary || Object.freeze({ canonicalHandoffArtifact: false, remoteWrite: false, sourceMutation: false })
  });
}

function normalizeSessionSnapshot(value = {}) {
  if (typeof value?.snapshot === 'function') return serializePortableSession(value);
  if (value?.schema === 'tiinex.portable.session.v1') {
    try { return restorePortableSession(value).snapshot(); }
    catch { return openPortableSession(value).snapshot(); }
  }
  return openPortableSession(value).snapshot();
}

function checkpointSummary(snapshot = {}) {
  return Object.freeze({
    files: snapshot.materials?.files?.length || 0,
    records: snapshot.materials?.records?.length || 0,
    assets: snapshot.materials?.assets?.length || 0,
    stagedArtifacts: snapshot.stagedArtifacts?.length || 0,
    durableFindings: snapshot.durableFindings?.length || 0,
    schemaCacheEntries: snapshot.schemaCache?.length || 0,
    currentFocus: snapshot.currentFocus || '',
    hasLastCheckpoint: Boolean(snapshot.lastCheckpoint)
  });
}

function stableHash(value = '') {
  const text = String(value || '');
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}
