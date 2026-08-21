import { projectPackageSourceReference } from './package.sourceReference.js';
import { schemaIdForRecord } from '../schemas/schema.identity.js';

export const EXPORT_WORKSPACE_CONTEXT_SCHEMA_ID = 'tiinex.export.package.workspace-context.v1';

export function buildExportWorkspaceContext(workspace = {}, input = {}) {
  const records = Array.isArray(input.records) ? input.records : (Array.isArray(workspace.records) ? workspace.records : []);
  const assets = Array.isArray(input.assets) ? input.assets : (Array.isArray(workspace.assets) ? workspace.assets : []);
  const workspaceArtifacts = records.filter(isWorkspaceArtifactRecord).map(workspaceArtifactDescriptor);
  const workspaceImport = sanitizeWorkspaceImport(workspace.workspaceImport || {});
  const localWorkspaceMarkdown = localOwnedWorkspaceMarkdown(workspace, workspaceImport);
  const sources = (Array.isArray(workspace.sources) ? workspace.sources : []).map(sourceDescriptor);
  const sourceOrder = (Array.isArray(workspace.sourceOrder) ? workspace.sourceOrder : []).map(String);
  const memberBindings = (Array.isArray(workspace.workspaceMemberBindings) ? workspace.workspaceMemberBindings : []).map(sanitizeMemberBinding).filter(Boolean);
  const materialMembership = Object.freeze({
    recordIds: Object.freeze(records.map((record) => String(record.id || record.path || '')).filter(Boolean)),
    assetIds: Object.freeze(assets.map((asset) => String(asset.id || asset.path || '')).filter(Boolean)),
    workspaceArtifactIds: Object.freeze(workspaceArtifacts.map((artifact) => artifact.id).filter(Boolean))
  });
  const markdownPackagePath = localWorkspaceMarkdown ? 'context/workspace.workspace.md' : '';
  return deepFreeze({
    schema: EXPORT_WORKSPACE_CONTEXT_SCHEMA_ID,
    id: String(workspace.id || ''),
    name: String(workspace.name || workspace.title || 'Workspace'),
    title: String(workspace.title || workspace.name || 'Workspace'),
    createdAt: String(workspace.createdAt || ''),
    kind: String(workspace.kind || 'workspace'),
    mode: String(workspace.mode || 'feed'),
    workspaceImport,
    workspaceMarkdown: Object.freeze({
      ownership: localWorkspaceMarkdown ? 'owned-local' : (workspace.workspaceMarkdown ? 'reference-only-or-unqualified' : 'absent'),
      available: Boolean(localWorkspaceMarkdown),
      packagePath: markdownPackagePath,
      bytes: new TextEncoder().encode(localWorkspaceMarkdown).byteLength
    }),
    sources: Object.freeze(sources),
    sourceOrder: Object.freeze(sourceOrder),
    workspaceArtifacts: Object.freeze(workspaceArtifacts),
    workspaceMemberBindings: Object.freeze(memberBindings),
    materialMembership,
    boundary: 'Canonical workspace context projection for handoff/re-ingest. It preserves workspace/source configuration truth without turning source references into local leaves or making directory placement semantic identity.'
  });
}

export function workspaceContextOwnedMarkdown(workspace = {}) {
  const workspaceImport = sanitizeWorkspaceImport(workspace.workspaceImport || {});
  return localOwnedWorkspaceMarkdown(workspace, workspaceImport);
}

function localOwnedWorkspaceMarkdown(workspace = {}, workspaceImport = {}) {
  const markdown = String(workspace.workspaceMarkdown || '');
  if (!markdown) return '';
  const mode = String(workspaceImport.sourceMode || workspace.sourceMode || '').trim().toLowerCase();
  const boundary = String(workspaceImport.boundary || workspace.source?.boundary || '').trim().toLowerCase();
  const localOwned = mode.startsWith('local') || mode.startsWith('manual') || mode.startsWith('package-import') || boundary.includes('browser-local') || workspaceImport.localDraft === true;
  return localOwned ? markdown : '';
}

function isWorkspaceArtifactRecord(record = {}) {
  return Boolean(record.workspaceArtifactRole?.openEligible || record.workspaceArtifactRole?.mergeEligible)
    || schemaIdForRecord(record) === 'tiinex.workspace.v1'
    || /\.workspace\.md$/i.test(String(record.sourceTarget?.sourceArtifactPath || record.path || ''));
}

function workspaceArtifactDescriptor(record = {}) {
  const sourceTarget = projectPackageSourceReference(record);
  return deepFreeze({
    id: String(record.id || record.path || ''),
    title: String(record.title || record.path || 'Workspace artifact'),
    path: String(record.path || ''),
    schemaId: schemaIdForRecord(record),
    sourceMode: String(record.sourceMode || ''),
    sourceReference: sourceTarget,
    openEligible: record.workspaceArtifactRole?.openEligible !== false,
    mergeEligible: record.workspaceArtifactRole?.mergeEligible !== false
  });
}

function sourceDescriptor(source = {}) {
  const projection = projectPackageSourceReference({ source, sourceTarget: {} }, { unavailable: false });
  return deepFreeze({
    id: String(source.id || ''),
    label: String(source.label || ''),
    adapterId: String(source.adapterId || ''),
    sourceKind: String(source.sourceKind || source.kind || ''),
    repo: String(source.repo || source.config?.repo || ''),
    ref: String(source.ref || source.config?.ref || ''),
    requestedRef: String(source.requestedRef ?? source.config?.requestedRef ?? ''),
    materializedCommit: String(source.materializedCommit || ''),
    rootPath: String(source.rootPath || source.config?.rootPath || ''),
    boundary: String(source.boundary || ''),
    repoDiscovery: Boolean(source.repoDiscovery),
    issueDiscovery: Boolean(source.issueDiscovery),
    issueUrls: String(source.issueUrls || source.config?.issueUrls || ''),
    explicitFileRefs: Object.freeze(Array.isArray(source.explicitFileRefs) ? source.explicitFileRefs.map(String) : []),
    exactReference: projection
  });
}

function sanitizeWorkspaceImport(value = {}) {
  return deepFreeze({
    schema: String(value.schema || 'tiinex.workspace.import.v1'),
    path: String(value.path || ''),
    sourceMode: String(value.sourceMode || ''),
    boundary: String(value.boundary || ''),
    openedFromWorkspaceId: String(value.openedFromWorkspaceId || ''),
    contextReferenceId: String(value.contextReferenceId || ''),
    localDraft: value.localDraft === true
  });
}

function sanitizeMemberBinding(binding = {}) {
  const descriptor = binding.descriptorTarget || {};
  const identity = binding.memberIdentity || {};
  if (!descriptor.externalTarget || !identity.key) return null;
  return deepFreeze({
    schema: String(binding.schema || 'tiinex.workspace.memberBinding.v1'),
    descriptorTarget: {
      schema: String(descriptor.schema || 'tiinex.publicTarget.v1'),
      adapterId: String(descriptor.adapterId || ''),
      targetKind: String(descriptor.targetKind || 'workspace'),
      externalTarget: String(descriptor.externalTarget || ''),
      repository: String(descriptor.repository || ''),
      ref: String(descriptor.ref || ''),
      path: String(descriptor.path || '')
    },
    memberIdentity: {
      schema: String(identity.schema || 'tiinex.workspace.memberIdentity.v1'),
      kind: String(identity.kind || 'semantic'),
      key: String(identity.key || ''),
      name: String(identity.name || ''),
      label: String(identity.label || ''),
      sourceKind: String(identity.sourceKind || ''),
      sourceSignature: String(identity.sourceSignature || '')
    }
  });
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer) return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}
