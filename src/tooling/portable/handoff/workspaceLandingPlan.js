import { inspectRecipientFacingV2Topology } from './recipientV2.inspect.js';
import { parseWorkspaceEntrypoints, normalizeRepositoryIdentity } from './workspaceSourceIdentity.js';

export const PORTABLE_WORKSPACE_LANDING_PLAN_SCHEMA_ID = 'tiinex.portable.workspace-landing-plan.v1';

export function projectPortableWorkspaceLandingPlan(input = {}) {
  const inspection = inspectRecipientFacingV2Topology(input.bundle || input.package || input);
  const findings = [];
  if (String(inspection.status || '') !== 'valid') {
    findings.push(finding('error', 'portable.workspace-landing.package-unqualified', 'Workspace landing planning requires one independently qualified recipient Handoff package.'));
    return result('blocked', inspection, [], findings, input);
  }
  const repositories = normalizeRepositories(input.repositories || []);
  const selections = normalizeSelections(input.selections || {});
  const requestedIds = new Set([...(input.workspaceIds || input.selectedWorkspaceIds || [])].map(normalizeId).filter(Boolean));
  const providerById = new Map((inspection.workspaceByteProvider?.workspaces || []).map((provider) => [normalizeId(provider.id), provider]));
  const plans = [];
  for (const workspace of inspection.workspaces || []) {
    const id = normalizeId(workspace.workspaceId);
    if (requestedIds.size && !requestedIds.has(id)) continue;
    plans.push(planWorkspace({ workspace, provider: providerById.get(id), repositories, selectionId: selections[id] || '', explicit: requestedIds.size > 0 }, findings));
  }
  if (requestedIds.size) {
    for (const id of requestedIds) if (!plans.some((item) => item.workspaceId === id)) findings.push(finding('error', 'portable.workspace-landing.workspace-unresolved', 'An explicitly requested Workspace is not present in the qualified carrier.', { workspaceId: id }));
  }
  const affected = plans.filter((item) => item.state === 'ready');
  const blocking = findings.some((item) => item.severity === 'error');
  if (!affected.length) findings.push(finding('error', 'portable.workspace-landing.no-qualified-targets', 'No qualified local repository target is ready for landing.'));
  return result(blocking || !affected.length ? 'blocked' : 'ready', inspection, plans, findings, input);
}

function planWorkspace({ workspace = {}, provider = null, repositories = [], selectionId = '', explicit = false } = {}, findings = []) {
  const workspaceId = normalizeId(workspace.workspaceId);
  const base = {
    workspaceId,
    title: String(workspace.title || workspaceId),
    coverage: String(workspace.coverage || ''),
    archivePackagePath: String(workspace.workspaceArchivePath || provider?.archive?.packagePath || ''),
    archiveBytes: Number(provider?.archive?.bytes || 0),
    archiveSha256: String(provider?.archive?.digest?.value || ''),
    workspaceArtifactInnerPath: String(workspace.sourceWorkspaceTargetInnerPath || '')
  };
  if (!provider || provider.state !== 'qualified' || provider.mode !== 'archive') {
    if (explicit) findings.push(finding('error', 'portable.workspace-landing.workspace-provider-unqualified', 'Requested Workspace lacks a qualified archive byte provider.', { workspaceId }));
    return freeze({ ...base, state: 'unavailable', source: null, repository: null, reasons: ['workspace-provider-unqualified'] });
  }
  const target = (provider.entries || []).find((entry) => String(entry.path || '') === base.workspaceArtifactInnerPath);
  if (!target?.data) {
    if (explicit) findings.push(finding('error', 'portable.workspace-landing.workspace-target-unavailable', 'Requested Workspace durable source artifact bytes are unavailable.', { workspaceId }));
    return freeze({ ...base, state: 'unavailable', source: null, repository: null, reasons: ['workspace-target-unavailable'] });
  }
  let markdown = '';
  try { markdown = new TextDecoder('utf-8', { fatal: true }).decode(byteView(target.data)); }
  catch {
    findings.push(finding('error', 'portable.workspace-landing.workspace-target-nontext', 'Qualified Workspace target could not be decoded as UTF-8 Markdown.', { workspaceId }));
    return freeze({ ...base, state: 'unavailable', source: null, repository: null, reasons: ['workspace-target-nontext'] });
  }
  const sources = parseWorkspaceEntrypoints(markdown);
  const repoSources = sources.filter((source) => normalizeRepositoryIdentity(source.repository));
  const sourceIdentities = [...new Set(repoSources.map((source) => normalizeRepositoryIdentity(source.repository)))];
  if (sourceIdentities.length !== 1) {
    if (explicit) findings.push(finding('error', sourceIdentities.length ? 'portable.workspace-landing.workspace-repository-ambiguous' : 'portable.workspace-landing.workspace-repository-missing', 'Requested Workspace must expose exactly one explicit repository identity before it can target a local Git repository.', { workspaceId, count: sourceIdentities.length }));
    return freeze({ ...base, state: 'not-targetable', source: repoSources[0] || null, repository: null, reasons: [sourceIdentities.length ? 'workspace-repository-ambiguous' : 'workspace-repository-missing'] });
  }
  const source = repoSources.find((item) => normalizeRepositoryIdentity(item.repository) === sourceIdentities[0]) || repoSources[0];
  const matches = repositories.filter((repo) => repo.repositoryIdentity === sourceIdentities[0]);
  let selected = selectionId ? repositories.find((repo) => repo.id === selectionId) || null : matches.length === 1 ? matches[0] : null;
  if (selectionId && (!selected || selected.repositoryIdentity !== sourceIdentities[0])) {
    findings.push(finding('error', 'portable.workspace-landing.selection-identity-mismatch', 'Explicit local repository selection does not match the qualified Workspace repository identity.', { workspaceId, selectionId, repository: source.repository }));
    selected = null;
  }
  if (!selected) {
    if (matches.length > 1) findings.push(finding('error', 'portable.workspace-landing.local-repository-ambiguous', 'Multiple local repositories match the same qualified Workspace repository identity; explicit selection is required.', { workspaceId, repository: source.repository, count: matches.length }));
    else if (explicit || selectionId) findings.push(finding('error', 'portable.workspace-landing.local-repository-unmatched', 'Requested Workspace has no matching local Git repository.', { workspaceId, repository: source.repository }));
    return freeze({ ...base, state: matches.length > 1 ? 'ambiguous' : 'unmatched', source, repository: null, candidateRepositoryIds: matches.map((item) => item.id), reasons: [matches.length > 1 ? 'local-repository-ambiguous' : 'local-repository-unmatched'] });
  }
  const reasons = [];
  if (selected.clean !== true) {
    reasons.push(selected.clean === false ? 'dirty-worktree' : 'clean-state-unresolved');
    findings.push(finding('error', selected.clean === false ? 'portable.workspace-landing.local-repository-dirty' : 'portable.workspace-landing.local-repository-clean-state-unresolved', 'Landing requires a clean target worktree except ignored local material.', { workspaceId, repositoryId: selected.id }));
  }
  const declaredRef = String(source.ref || '').trim();
  const branch = String(selected.branch || '').trim();
  if (declaredRef && branch && declaredRef !== branch) {
    reasons.push('ref-branch-mismatch');
    findings.push(finding('error', 'portable.workspace-landing.ref-branch-mismatch', 'Local repository branch differs from the qualified Workspace source ref safety constraint.', { workspaceId, repositoryId: selected.id, declaredRef, branch }));
  }
  return freeze({
    ...base,
    state: reasons.length ? 'blocked' : 'ready',
    source,
    repository: freeze({ id: selected.id, root: selected.root, repository: selected.repository, repositoryIdentity: selected.repositoryIdentity, branch, clean: selected.clean }),
    reasons
  });
}

function result(status, inspection, workspaces, findings, input) {
  const affected = workspaces.filter((item) => item.state === 'ready');
  const untouched = workspaces.filter((item) => item.state !== 'ready');
  return freeze({
    schema: PORTABLE_WORKSPACE_LANDING_PLAN_SCHEMA_ID,
    status,
    packageQualification: String(inspection.status || 'invalid'),
    selectionMode: (input.workspaceIds || input.selectedWorkspaceIds || []).length ? 'explicit-workspace-set' : 'qualified-repository-match-discovery',
    workspaces: freeze(workspaces),
    affected: freeze(affected),
    unaffected: freeze(untouched),
    confirmation: freeze({
      required: affected.length > 0,
      repositoryCount: affected.length,
      repositoryRoots: freeze(affected.map((item) => String(item.repository?.root || '')).filter(Boolean)),
      statement: affected.length ? `Replace qualified non-ignored Workspace source in ${affected.length} local Git repositor${affected.length === 1 ? 'y' : 'ies'}; preserve .git and unrelated ignored local material; do not commit or push.` : '',
      authority: 'explicit-human-host-confirmation-only'
    }),
    operationBoundary: freeze({ sourceMutation: false, remoteWrite: false, commit: false, push: false, acceptance: false }),
    findings: freeze(findings),
    boundary: 'Planning-only projection from one qualified Handoff package plus explicit local Git repository facts. Repository/ref matching is an operational safety constraint, not semantic authority. The plan does not extract, write, commit, push, accept, or complete any Workspace.'
  });
}

function normalizeRepositories(value = []) {
  const list = Array.isArray(value) ? value : value?.repositories || [];
  return freeze(list.map((item, index) => {
    const repository = String(item?.repository || item?.remote || item?.remoteUrl || '').trim();
    return freeze({
      id: String(item?.id || `repo-${index + 1}`),
      root: String(item?.root || item?.path || ''),
      repository,
      repositoryIdentity: normalizeRepositoryIdentity(repository),
      branch: String(item?.branch || ''),
      clean: item?.clean === true ? true : item?.clean === false ? false : null
    });
  }));
}
function normalizeSelections(value = {}) {
  const source = value?.selections && typeof value.selections === 'object' ? value.selections : value;
  return Object.fromEntries(Object.entries(source || {}).map(([key, selected]) => [normalizeId(key), String(selected || '')]).filter(([key, selected]) => key && selected));
}
function normalizeId(value = '') { return String(value || '').trim().toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^-+|-+$/g, ''); }
function byteView(value) { if (value instanceof Uint8Array) return value; if (ArrayBuffer.isView(value)) return new Uint8Array(value.buffer, value.byteOffset, value.byteLength); if (value instanceof ArrayBuffer) return new Uint8Array(value); throw new Error('portable.workspace-landing.bytes-unavailable'); }
function finding(severity, code, message, context = {}) { return freeze({ severity, code, message, context: freeze({ ...context }) }); }
function freeze(value) { if (Array.isArray(value)) return Object.freeze(value.map((item) => freeze(item))); if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value; return Object.freeze(Object.fromEntries(Object.entries(value).map(([key, item]) => [key, freeze(item)]))); }
