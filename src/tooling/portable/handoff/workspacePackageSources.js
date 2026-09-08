import { parseArtifactMarkdown } from '../../../artifacts/artifact.parse.js';
import { auditPortableRecord } from '../audit/audit.capability.js';
import { normalizeRepositoryIdentity, parseWorkspaceEntrypoints } from './workspaceSourceIdentity.js';
import { sha256Hex, utf8Bytes } from '../../../export/package.bytes.js';

export const PORTABLE_WORKSPACE_PACKAGE_SOURCES_SCHEMA_ID = 'tiinex.portable.workspace-package-sources.v1';

export function projectQualifiedWorkspacePackageSources(input = {}) {
  const records = normalizeRecords(input);
  const findings = [];
  const candidates = [];
  const repositories = normalizeRepositories(input.repositories || input.localRepositories || []);
  for (const record of records) {
    let parsed;
    try { parsed = parseArtifactMarkdown(record.markdown); } catch { continue; }
    if (String(parsed.envelope?.current?.schema?.id || '') !== 'tiinex.workspace.v1') continue;
    const audit = auditPortableRecord({ ...record, title: parsed.title || '', schemaId: 'tiinex.workspace.v1', currentSchemaId: 'tiinex.workspace.v1', parent: parsed.envelope?.parent || null });
    if (audit.status !== 'readable' || audit.qualification?.exact !== true || (audit.findings || []).some((item) => item.severity === 'error')) {
      findings.push(finding('warning', 'portable.workspace-package-source.unqualified', 'A local Workspace artifact was ignored because exact shared audit did not qualify it.', { path: record.path }));
      continue;
    }
    const entrypoints = parseWorkspaceEntrypoints(record.markdown);
    const repositorySources = entrypoints.filter((item) => normalizeRepositoryIdentity(item.repository));
    const localDirectorySources = entrypoints.filter((item) => String(item.sourceKind || '').trim().toLowerCase() === 'local-directory' && !normalizeRepositoryIdentity(item.repository));
    const identities = [...new Set(repositorySources.map((item) => normalizeRepositoryIdentity(item.repository)).filter(Boolean))];
    let source = null;
    let repositoryIdentity = '';
    let localMatches = [];
    if (identities.length === 1) {
      repositoryIdentity = identities[0];
      source = repositorySources.find((item) => normalizeRepositoryIdentity(item.repository) === repositoryIdentity) || repositorySources[0];
      localMatches = repositories.filter((item) => item.repositoryIdentity === repositoryIdentity);
      if (repositories.length && localMatches.length !== 1) {
        findings.push(finding('warning', localMatches.length ? 'portable.workspace-package-source.local-repository-ambiguous' : 'portable.workspace-package-source.local-repository-unmatched', 'A qualified Workspace package source was not exposed because explicit local Git facts did not produce exactly one repository-identity match.', { path: record.path, repositoryIdentity, matchCount: localMatches.length }));
        continue;
      }
    } else if (identities.length > 1) {
      findings.push(finding('warning', 'portable.workspace-package-source.repository-ambiguous', 'A qualified Workspace package source must not expose multiple repository identities for one package snapshot.', { path: record.path, count: identities.length }));
      continue;
    } else if (localDirectorySources.length === 1) {
      source = localDirectorySources[0];
      localMatches = repositories.length === 1 ? repositories : [];
    } else {
      findings.push(finding('warning', localDirectorySources.length ? 'portable.workspace-package-source.local-directory-ambiguous' : 'portable.workspace-package-source.source-missing', 'A qualified Workspace package source must expose exactly one repository-backed snapshot or one explicit local-directory snapshot.', { path: record.path, repositoryCount: identities.length, localDirectoryCount: localDirectorySources.length }));
      continue;
    }
    const workspaceTargetPath = norm(record.path || record.id || '');
    candidates.push({
      baseWorkspaceId: semanticWorkspaceArtifactId(workspaceTargetPath),
      workspaceTargetPath,
      title: String(parsed.title || ''),
      qualification: 'qualified-exact',
      repository: String(source?.repository || ''),
      repositoryIdentity,
      ref: String(source?.ref || ''),
      rootPath: String(source?.rootPath || '.'),
      sourceKind: String(source?.sourceKind || ''),
      localRepository: localMatches.length === 1 ? localMatches[0] : null
    });
  }
  const qualifiedCandidates = disambiguateWorkspaceIds(candidates);
  return freeze({
    schema: PORTABLE_WORKSPACE_PACKAGE_SOURCES_SCHEMA_ID,
    status: 'ready',
    candidates: qualifiedCandidates,
    findings,
    operationBoundary: { sourceMutation: false, remoteWrite: false, manufacture: false },
    boundary: 'Projects exact qualified local Workspace artifacts into package-builder source candidates. A Workspace may declare one repository-backed snapshot or one explicit local-directory snapshot; workspaceId remains a stable package-local label derived from the qualified Workspace artifact identity, independently of any physical repository identity. Host Git facts are operational context only and create no semantic Workspace authority.'
  });
}

function normalizeRepositories(value = []) {
  return (Array.isArray(value) ? value : []).map((item) => freeze({
    id: String(item?.id || item?.root || ''),
    root: String(item?.root || ''),
    repository: String(item?.repository || ''),
    repositoryIdentity: normalizeRepositoryIdentity(item?.repository || item?.repositoryIdentity || ''),
    branch: String(item?.branch || ''),
    clean: item?.clean === true
  })).filter((item) => item.repositoryIdentity);
}
function semanticWorkspaceArtifactId(workspaceTargetPath = '') {
  const basename = norm(workspaceTargetPath).split('/').filter(Boolean).at(-1) || 'workspace.workspace.md';
  const raw = basename.replace(/\.workspace\.md$/i, '').replace(/^tiinex-/i, '') || 'workspace';
  const token = raw.toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '');
  return token || 'workspace';
}
function disambiguateWorkspaceIds(candidates = []) {
  const counts = new Map();
  for (const candidate of candidates) counts.set(candidate.baseWorkspaceId, (counts.get(candidate.baseWorkspaceId) || 0) + 1);
  return candidates.map((candidate) => {
    const collided = (counts.get(candidate.baseWorkspaceId) || 0) > 1;
    const suffix = collided ? sha256Hex(utf8Bytes(candidate.workspaceTargetPath)).slice(0, 8) : '';
    const workspaceId = collided ? `${candidate.baseWorkspaceId}--${suffix}` : candidate.baseWorkspaceId;
    const { baseWorkspaceId, ...rest } = candidate;
    return freeze({ workspaceId, ...rest });
  });
}
function normalizeRecords(input = {}) {
  if (Array.isArray(input.records)) return input.records;
  return (Array.isArray(input.files) ? input.files : []).filter((item) => typeof item?.content === 'string').map((item) => ({ id: String(item.path || ''), path: String(item.path || ''), markdown: String(item.content || ''), sourceMode: item.sourceMode || '' }));
}
function norm(value = '') { return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '').replace(/^\/+|\/+$/g, ''); }
function finding(severity, code, message, context = {}) { return freeze({ severity, code, message, context }); }
function freeze(value) { if (Array.isArray(value)) return Object.freeze(value.map(freeze)); if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value; return Object.freeze(Object.fromEntries(Object.entries(value).map(([key, item]) => [key, freeze(item)]))); }
