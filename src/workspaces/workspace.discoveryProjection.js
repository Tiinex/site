export function projectWorkspaceCandidateRoles(records = [], workspaceCandidates = [], options = {}) {
  const normalizePath = typeof options.normalizePath === 'function' ? options.normalizePath : defaultNormalizePath;
  const sourceRecords = Array.isArray(records) ? records : [];
  const sourceCandidates = Array.isArray(workspaceCandidates) ? workspaceCandidates : [];
  if (!sourceRecords.length || !sourceCandidates.length) return Object.freeze({ records: sourceRecords, workspaceCandidates: sourceCandidates, groupedWorkspaceCandidates: Object.freeze([]) });
  const groupsByRecordId = new Map();
  const groupedCandidateIds = new Set();

  for (const candidate of sourceCandidates) {
    const record = sourceRecords.find((item) => workspaceCandidateMatchesRecord(candidate, item, normalizePath));
    if (!record) continue;
    const key = String(record?.id || record?.path || '');
    if (!key) continue;
    const existing = groupsByRecordId.get(key) || [];
    existing.push(candidate);
    groupsByRecordId.set(key, existing);
    groupedCandidateIds.add(workspaceCandidateProjectionKey(candidate));
  }

  if (!groupedCandidateIds.size) return Object.freeze({ records: sourceRecords, workspaceCandidates: sourceCandidates, groupedWorkspaceCandidates: Object.freeze([]) });

  const projectedRecords = sourceRecords.map((record) => {
    const roles = groupsByRecordId.get(String(record?.id || record?.path || '')) || [];
    if (!roles.length) return record;
    return Object.freeze(Object.assign({}, record, {
      workspaceCandidateRoles: Object.freeze(roles.map((candidate) => Object.freeze(Object.assign({}, candidate, {
        role: 'workspace-candidate',
        projection: 'grouped-with-record'
      }))))
    }));
  });
  const remainingCandidates = sourceCandidates.filter((candidate) => !groupedCandidateIds.has(workspaceCandidateProjectionKey(candidate)));
  const groupedWorkspaceCandidates = sourceCandidates.filter((candidate) => groupedCandidateIds.has(workspaceCandidateProjectionKey(candidate)));
  return Object.freeze({
    records: Object.freeze(projectedRecords),
    workspaceCandidates: Object.freeze(remainingCandidates),
    groupedWorkspaceCandidates: Object.freeze(groupedWorkspaceCandidates)
  });
}

export function workspaceCandidateMatchesRecord(candidate = {}, record = {}, normalizePath = defaultNormalizePath) {
  const sourceRecordId = String(candidate?.sourceRecordId || '').trim();
  const recordId = String(record?.id || '').trim();
  if (sourceRecordId && recordId && sourceRecordId === recordId) return true;
  const candidateId = String(candidate?.id || '').trim();
  if (candidateId && recordId && candidateId === `workspace-record:${recordId}`) return true;
  const recordKeysSet = new Set(recordWorkspaceProjectionKeys(record, normalizePath));
  for (const key of workspaceCandidateProjectionKeys(candidate, normalizePath)) if (recordKeysSet.has(key)) return true;
  return false;
}

function workspaceCandidateProjectionKey(candidate = {}) {
  return String(candidate?.id || candidate?.path || candidate?.sourceRecordId || '').trim();
}

function workspaceCandidateProjectionKeys(candidate = {}, normalizePath = defaultNormalizePath) {
  return projectionKeys([
    candidate.path,
    candidate.sourcePath,
    candidate.sourceRecordId,
    candidate.sourceTarget?.sourceArtifactPath,
    candidate.sourceTarget?.path,
    candidate.materialReconciliation?.sourcePath,
    candidate.materialReconciliation?.localPath
  ], normalizePath);
}

function recordWorkspaceProjectionKeys(record = {}, normalizePath = defaultNormalizePath) {
  return projectionKeys([
    record.id,
    record.path,
    record.sourcePath,
    record.sourceTarget?.sourceArtifactPath,
    record.sourceTarget?.path,
    record.materialReconciliation?.sourcePath,
    record.materialReconciliation?.localPath
  ], normalizePath);
}

function projectionKeys(values = [], normalizePath = defaultNormalizePath) {
  const keys = [];
  for (const value of values) {
    const raw = String(value || '').trim();
    if (!raw) continue;
    keys.push(raw);
    const normalized = normalizePath(raw);
    if (normalized) keys.push(normalized);
  }
  return Array.from(new Set(keys));
}

function defaultNormalizePath(value = '') {
  return String(value || '').trim().replace(/\\/g, '/').replace(/[#?].*$/, '').replace(/^\/+/, '');
}
