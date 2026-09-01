import { packageFileByteView, packageFileBytes, sha256Hex, utf8Bytes } from '../../../export/package.bytes.js';
import { normalizeHandoffWorkspaceInnerPath } from './workspaceByteProvider.js';
import { qualifyHandoffWorkspaceTarget } from './workspaceTargetConformance.js';

export function qualifyWorkspaceForArchive(workspace = {}, byPath = new Map(), targetDeclarations = [], parentCandidates = []) {
  const findings = [];
  const workspaceId = String(workspace.id || '');
  if (!workspaceId) findings.push(finding('error', 'portable.handoff-v2.workspace.id.unresolved', 'Archive-backed workspace binding requires an exact carrier workspace id.'));
  const coverage = workspaceCoverage(workspace);
  const evidence = workspaceEvidence(workspace, coverage);
  if (!coverage || String(workspace.qualification || '') !== 'qualified' || String(workspace.correlationStatus || '') !== 'qualified' || String(evidence.state || '') !== 'qualified') findings.push(finding('error', 'portable.handoff-v2.workspace.coverage.unqualified', 'Archive-backed workspace representation requires explicit qualified complete or bounded entry-set evidence.', { workspaceId, coverage }));
  if (targetDeclarations.length !== 1) {
    findings.push(finding('error', targetDeclarations.length > 1 ? 'portable.handoff-v2.workspace-target.ambiguous' : 'portable.handoff-v2.workspace-target.missing', targetDeclarations.length > 1 ? 'More than one explicit Workspace target was declared for the carrier workspace id; v2 refuses ambiguous semantic binding.' : 'No explicit exact Workspace artifact target was declared for the carrier workspace id; v2 refuses filename/content scanning or transport-only semantic Workspace identity.', { workspaceId, targetCount: targetDeclarations.length }));
    return blocked(workspaceId, findings);
  }
  const targetNormalized = normalizeHandoffWorkspaceInnerPath(targetDeclarations[0].path || '');
  if (targetNormalized.state !== 'qualified') {
    findings.push(finding('error', `portable.handoff-v2.${targetNormalized.reason || 'workspace-target-path-unsafe'}`, 'Explicit Workspace target locator is not a safe normalized workspace-relative path.', { workspaceId, path: targetDeclarations[0].path || '' }));
    return blocked(workspaceId, findings);
  }
  if (!/\.workspace\.md$/i.test(targetNormalized.path)) {
    findings.push(finding('error', 'portable.handoff-v2.workspace-target.path-contract-mismatch', 'Explicit Workspace target must identify a .workspace.md artifact under the tiinex.workspace.v1 artifact contract; schema-material filenames do not qualify as Workspace instances.', { workspaceId, path: targetNormalized.path }));
    return blocked(workspaceId, findings);
  }

  const entries = qualifyWorkspaceEntries(workspace, byPath, workspaceId, findings);
  const evidenceFingerprint = sha256Hex(utf8Bytes(stableJson(entries.map(projectEntryIdentity))));
  if (String(evidence.entriesFingerprint || '') !== evidenceFingerprint || Number(evidence.entryCount || -1) !== entries.length || Number(evidence.totalBytes || -1) !== entries.reduce((sum, entry) => sum + entry.bytes, 0)) findings.push(finding('error', `portable.handoff-v2.workspace.${coverage}-evidence.stale`, 'Workspace coverage evidence does not exactly cover the archive entry set.', { workspaceId, coverage }));

  const targetEntry = entries.find((entry) => entry.path === targetNormalized.path) || null;
  if (!targetEntry) findings.push(finding('error', 'portable.handoff-v2.workspace-target.unresolvable', 'Explicit Workspace target is not present exactly once in the qualified Workspace Representation entry set.', { workspaceId, path: targetNormalized.path }));
  const targetQualification = targetEntry ? qualifyHandoffWorkspaceTarget({ targetPath: targetNormalized.path, targetData: targetEntry.data, entries, parentCandidates }) : null;
  if (targetQualification?.state !== 'qualified') {
    for (const reason of targetQualification?.reasons || ['workspace-target-artifact-conformance-unqualified']) findings.push(workspaceTargetFinding(reason, workspaceId, targetNormalized.path));
  }
  const target = targetEntry && targetQualification?.state === 'qualified'
    ? Object.freeze({ ...targetEntry, selfIntegrity: targetQualification.selfIntegrity, conformance: targetQualification.conformance })
    : null;
  return deepFreeze({ status: findings.some((item) => item.severity === 'error') ? 'blocked' : 'qualified', workspaceId, entries: Object.freeze(entries), target, findings: Object.freeze(findings) });
}


export function qualifyDirectWorkspaceForArchive(workspace = {}, rawWorkspace = null, targetDeclarations = [], parentCandidates = []) {
  const findings = [];
  const workspaceId = String(workspace.id || '');
  if (!workspaceId) findings.push(finding('error', 'portable.handoff-v2.workspace.id.unresolved', 'Archive-backed workspace binding requires an exact carrier workspace id.'));
  if (!rawWorkspace || typeof rawWorkspace !== 'object') {
    findings.push(finding('error', 'portable.handoff-v2.workspace-direct-source.unavailable', 'Direct archive-backed manufacture requires the exact already-qualified workspace materialization bytes correlated to this closure workspace.', { workspaceId }));
    return blocked(workspaceId, findings);
  }
  const coverage = workspaceCoverage(workspace);
  const evidence = workspaceEvidence(workspace, coverage);
  if (!coverage || String(workspace.qualification || '') !== 'qualified' || String(workspace.correlationStatus || '') !== 'qualified' || String(evidence.state || '') !== 'qualified') {
    findings.push(finding('error', 'portable.handoff-v2.workspace.coverage.unqualified', 'Archive-backed workspace representation requires explicit qualified complete or bounded entry-set evidence.', { workspaceId, coverage }));
  }
  if (targetDeclarations.length !== 1) {
    findings.push(finding('error', targetDeclarations.length > 1 ? 'portable.handoff-v2.workspace-target.ambiguous' : 'portable.handoff-v2.workspace-target.missing', targetDeclarations.length > 1 ? 'More than one explicit Workspace target was declared for the carrier workspace id; v2 refuses ambiguous semantic binding.' : 'No explicit exact Workspace artifact target was declared for the carrier workspace id; v2 refuses filename/content scanning or transport-only semantic Workspace identity.', { workspaceId, targetCount: targetDeclarations.length }));
    return blocked(workspaceId, findings);
  }
  const targetNormalized = normalizeHandoffWorkspaceInnerPath(targetDeclarations[0].path || '');
  if (targetNormalized.state !== 'qualified') {
    findings.push(finding('error', `portable.handoff-v2.${targetNormalized.reason || 'workspace-target-path-unsafe'}`, 'Explicit Workspace target locator is not a safe normalized workspace-relative path.', { workspaceId, path: targetDeclarations[0].path || '' }));
    return blocked(workspaceId, findings);
  }
  if (!/\.workspace\.md$/i.test(targetNormalized.path)) {
    findings.push(finding('error', 'portable.handoff-v2.workspace-target.path-contract-mismatch', 'Explicit Workspace target must identify a .workspace.md artifact under the tiinex.workspace.v1 artifact contract; schema-material filenames do not qualify as Workspace instances.', { workspaceId, path: targetNormalized.path }));
    return blocked(workspaceId, findings);
  }

  const rawEvidence = workspaceEvidence(rawWorkspace, coverage);
  const declaredEvidence = evidence;
  const evidenceMatches = workspaceCoverage(rawWorkspace) === coverage
    && String(rawEvidence.state || '') === 'qualified'
    && String(rawEvidence.entriesFingerprint || '') === String(declaredEvidence.entriesFingerprint || '')
    && Number(rawEvidence.entryCount ?? -1) === Number(declaredEvidence.entryCount ?? -2)
    && Number(rawEvidence.totalBytes ?? -1) === Number(declaredEvidence.totalBytes ?? -2);
  if (!evidenceMatches) findings.push(finding('error', 'portable.handoff-v2.workspace-direct-source.coverage-evidence-mismatch', 'Direct Workspace source does not carry the same qualified complete-or-bounded evidence as the correlated closure Workspace.', { workspaceId, coverage }));

  const declaredByPath = new Map();
  for (const declared of workspace.includedEntries || []) {
    const normalized = normalizeHandoffWorkspaceInnerPath(declared.path || '');
    if (normalized.state !== 'qualified') {
      findings.push(finding('error', `portable.handoff-v2.${normalized.reason || 'workspace-inner-path-unsafe'}`, 'Qualified Workspace Representation declaration contains an unsafe path.', { workspaceId, path: declared.path || '' }));
      continue;
    }
    if (declaredByPath.has(normalized.path)) {
      findings.push(finding('error', 'portable.handoff-v2.workspace-inner-path-duplicate', 'Qualified Workspace Representation declaration contains duplicate normalized inner paths.', { workspaceId, path: normalized.path }));
      continue;
    }
    declaredByPath.set(normalized.path, Object.freeze({ ...declared, path: normalized.path }));
  }

  const rawByPath = new Map();
  for (const raw of rawWorkspace.entries || []) {
    const normalized = normalizeHandoffWorkspaceInnerPath(raw.path || '');
    if (normalized.state !== 'qualified') {
      findings.push(finding('error', `portable.handoff-v2.${normalized.reason || 'workspace-inner-path-unsafe'}`, 'Direct workspace source contains an unsafe path that cannot enter an archive-backed provider.', { workspaceId, path: raw.path || '' }));
      continue;
    }
    if (rawByPath.has(normalized.path)) {
      findings.push(finding('error', 'portable.handoff-v2.workspace-inner-path-duplicate', 'Direct workspace source contains duplicate normalized inner paths.', { workspaceId, path: normalized.path }));
      continue;
    }
    const data = packageFileByteView(raw);
    const bytes = data.byteLength;
    const declaredBytes = Number(raw.bytes ?? -1);
    const sha256 = String(raw.sha256 || '');
    if (declaredBytes !== bytes || !/^[0-9a-f]{64}$/i.test(sha256)) {
      findings.push(finding('error', 'portable.handoff-v2.workspace-direct-source.identity-unqualified', 'Direct Workspace source entry lacks the exact prequalified byte identity produced by Workspace enumeration.', { workspaceId, path: normalized.path }));
    }
    rawByPath.set(normalized.path, Object.freeze({ path: normalized.path, data, bytes, sha256, referenceTarget: String(raw.referenceTarget || '') }));
  }

  const entries = [];
  for (const [declaredPath, declared] of declaredByPath) {
    const raw = rawByPath.get(declaredPath);
    if (!raw) {
      findings.push(finding('error', 'portable.handoff-v2.workspace-direct-source.entry-missing', 'Qualified Workspace Representation declaration is missing from the direct source byte set.', { workspaceId, path: declaredPath }));
      continue;
    }
    if (Number(declared.bytes || 0) !== raw.bytes || String(declared.sha256 || '') !== raw.sha256) {
      findings.push(finding('error', 'portable.handoff-v2.workspace-direct-source.identity-mismatch', 'Direct workspace source prequalified byte identity diverges from the qualified complete-workspace declaration.', { workspaceId, path: declaredPath }));
    }
    entries.push(Object.freeze({ path: declaredPath, packagePath: '', bytes: raw.bytes, sha256: raw.sha256, referenceTarget: String(declared.referenceTarget || ''), data: raw.data }));
  }
  for (const rawPath of rawByPath.keys()) {
    if (!declaredByPath.has(rawPath)) findings.push(finding('error', 'portable.handoff-v2.workspace-direct-source.entry-extra', 'Direct workspace source contains bytes outside the qualified complete-workspace declaration.', { workspaceId, path: rawPath }));
  }
  entries.sort((a, b) => a.path.localeCompare(b.path));

  const evidenceFingerprint = sha256Hex(utf8Bytes(stableJson(entries.map(projectEntryIdentity))));
  const totalBytes = entries.reduce((sum, entry) => sum + entry.bytes, 0);
  if (String(declaredEvidence.entriesFingerprint || '') !== evidenceFingerprint || Number(declaredEvidence.entryCount ?? -1) !== entries.length || Number(declaredEvidence.totalBytes ?? -1) !== totalBytes) {
    findings.push(finding('error', `portable.handoff-v2.workspace.${coverage}-evidence.stale`, 'Workspace coverage evidence does not exactly cover the direct archive entry identity set.', { workspaceId, coverage }));
  }

  const targetEntry = entries.find((entry) => entry.path === targetNormalized.path) || null;
  if (!targetEntry) findings.push(finding('error', 'portable.handoff-v2.workspace-target.unresolvable', 'Explicit Workspace target is not present exactly once in the qualified Workspace Representation entry set.', { workspaceId, path: targetNormalized.path }));
  const targetQualification = targetEntry ? qualifyHandoffWorkspaceTarget({ targetPath: targetNormalized.path, targetData: targetEntry.data, entries, parentCandidates }) : null;
  if (targetQualification?.state !== 'qualified') {
    for (const reason of targetQualification?.reasons || ['workspace-target-artifact-conformance-unqualified']) findings.push(workspaceTargetFinding(reason, workspaceId, targetNormalized.path));
  }
  const target = targetEntry && targetQualification?.state === 'qualified'
    ? Object.freeze({ ...targetEntry, selfIntegrity: targetQualification.selfIntegrity, conformance: targetQualification.conformance })
    : null;
  return deepFreeze({ status: findings.some((item) => item.severity === 'error') ? 'blocked' : 'qualified', workspaceId, entries: Object.freeze(entries), target, findings: Object.freeze(findings) });
}

function workspaceCoverage(workspace = {}) {
  const value = String(workspace.materialization || workspace.state || '');
  return value === 'complete' || value === 'bounded' ? value : '';
}
function workspaceEvidence(workspace = {}, coverage = workspaceCoverage(workspace)) {
  return coverage === 'bounded' ? (workspace.scopeEvidence || {}) : coverage === 'complete' ? (workspace.completenessEvidence || {}) : {};
}

function safeToken(value = '') { return String(value || '').trim().replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 100) || 'workspace'; }

export function indexWorkspaceTargetDeclarations(value = []) {
  const map = new Map();
  const items = Array.isArray(value) ? value : (value && typeof value === 'object' ? Object.entries(value).map(([workspaceId, path]) => ({ workspaceId, path: typeof path === 'string' ? path : path?.path })) : []);
  for (const item of items) {
    const workspaceId = String(item?.workspaceId || item?.workspace || item?.id || '').trim();
    const path = String(item?.path || item?.workspaceTargetPath || item?.workspaceArtifactPath || '').trim();
    if (!workspaceId || !path) continue;
    const list = map.get(workspaceId) || [];
    list.push(Object.freeze({ workspaceId, path }));
    map.set(workspaceId, list);
  }
  return map;
}

export function mapArchiveRequirements(requirements = {}, materialized = [], bindingByWorkspace = new Map()) {
  const carrierByRequirement = new Map(materialized.map((entry) => [String(entry.requirementId || ''), entry]));
  const mapOne = (item) => {
    const carrier = carrierByRequirement.get(String(item.requirementId || ''));
    if (!carrier || carrier.carrierKind !== 'workspace-archive-entry') return item;
    const binding = bindingByWorkspace.get(carrier.workspaceId);
    return deepFreeze({ ...item, materializedPackagePath: String(binding?.representation?.packagePath || ''), materializedCarrier: Object.freeze({ kind: 'workspace-archive-entry', workspaceId: carrier.workspaceId, workspaceRelativePath: carrier.workspaceRelativePath, archivePackagePath: String(binding?.representation?.packagePath || '') }) });
  };
  return Object.freeze({
    required: Object.freeze((requirements.required || []).map(mapOne)),
    reference: Object.freeze((requirements.reference || []).map(mapOne)),
    endpointRoles: Object.freeze((requirements.endpointRoles || []).map(mapOne)),
    participantRoles: Object.freeze((requirements.participantRoles || []).map(mapOne)),
    dependencies: Object.freeze((requirements.dependencies || []).map(mapOne))
  });
}

function qualifyWorkspaceEntries(workspace, byPath, workspaceId, findings) {
  const entries = [];
  const seen = new Set();
  for (const declared of workspace.includedEntries || []) {
    const normalized = normalizeHandoffWorkspaceInnerPath(declared.path || '');
    if (normalized.state !== 'qualified') { findings.push(finding('error', `portable.handoff-v2.${normalized.reason || 'workspace-inner-path-unsafe'}`, 'Workspace contains an unsafe path that cannot enter an archive-backed provider.', { workspaceId, path: declared.path || '' })); continue; }
    if (seen.has(normalized.path)) { findings.push(finding('error', 'portable.handoff-v2.workspace-inner-path-duplicate', 'Workspace contains duplicate normalized inner paths.', { workspaceId, path: normalized.path })); continue; }
    seen.add(normalized.path);
    const packagePath = String(declared.packagePath || '');
    const matches = byPath.get(packagePath) || [];
    const file = matches.length === 1 ? matches[0] : null;
    if (!file) { findings.push(finding('error', 'portable.handoff-v2.workspace-entry.unresolvable', 'Qualified v1 workspace entry is not uniquely resolvable to exact package bytes.', { workspaceId, path: normalized.path, packagePath })); continue; }
    const data = packageFileBytes(file);
    const sha256 = sha256Hex(data);
    if (Number(declared.bytes || 0) !== data.byteLength || String(declared.sha256 || '') !== sha256) findings.push(finding('error', 'portable.handoff-v2.workspace-entry.identity-mismatch', 'Workspace entry byte identity diverges from the v1 closure declaration.', { workspaceId, path: normalized.path }));
    entries.push(Object.freeze({ path: normalized.path, packagePath, bytes: data.byteLength, sha256, referenceTarget: String(declared.referenceTarget || ''), data }));
  }
  return entries.sort((a, b) => a.path.localeCompare(b.path));
}

function projectEntryIdentity(entry) { return { path: entry.path, bytes: entry.bytes, sha256: entry.sha256, referenceTarget: entry.referenceTarget }; }
function workspaceTargetFinding(reason, workspaceId, path) {
  const code = `portable.handoff-v2.${String(reason || 'workspace-target-artifact-conformance-unqualified')}`;
  const messages = {
    'workspace-target-schema-unqualified': 'Explicit Workspace target does not qualify as tiinex.workspace.v1 under exact registered schema authority.',
    'workspace-target-self-integrity-unverified': 'Explicit Workspace target does not have verified primary c14n-v2 self integrity.',
    'workspace-target-self-integrity-mismatch': 'Explicit Workspace target primary c14n-v2 self integrity does not match its exact bytes.',
    'workspace-target-parent-continuity-unqualified': 'Explicit Workspace target declares Parent but its Parent-target continuity cannot be independently verified.',
    'workspace-target-artifact-conformance-unqualified': 'Explicit Workspace target fails Root/registered-schema/integrity artifact conformance.'
  };
  return finding('error', code, messages[reason] || messages['workspace-target-artifact-conformance-unqualified'], { workspaceId, path });
}
function blocked(workspaceId, findings) { return deepFreeze({ status: 'blocked', workspaceId, entries: Object.freeze([]), target: null, findings: Object.freeze(findings) }); }
function stableJson(value) { return JSON.stringify(sortJson(value)); }
function sortJson(value) { if (Array.isArray(value)) return value.map(sortJson); if (!value || typeof value !== 'object') return value; return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortJson(value[key])])); }
function finding(severity, code, message, extra = {}) { return Object.freeze({ severity, code, message, ...extra }); }
function deepFreeze(value) { if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value; if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer) return value; for (const child of Object.values(value)) deepFreeze(child); return Object.freeze(value); }
