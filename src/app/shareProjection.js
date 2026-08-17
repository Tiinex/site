import {
  artifactPublicTargetFromRecord,
  buildPublicViewerTargetUrl,
  publicTargetFromRecord,
  publicTargetFromWorkspace,
  publicTargetRestoreCapability,
  PublicTargetRestoreCapability
} from './publicTarget.js';
import { workspaceHasDurableLocalMaterial } from '../workspaces/workspace.openSemantics.js';

export const SHARE_PROJECTION_SCHEMA = 'tiinex.shareProjection.v1';

export const ShareScope = Object.freeze({
  artifact: 'artifact',
  workspace: 'workspace',
  workspaceSet: 'workspace-set',
  current: 'current'
});

export const ShareTargetStatus = Object.freeze({
  available: 'available',
  exactViewOnly: 'exact-view-only',
  localOnly: 'local-only',
  unavailable: 'unavailable'
});

export const ShareAccessStatus = Object.freeze({
  unknown: 'unknown',
  accessBound: 'access-bound',
  notApplicable: 'not-applicable'
});

export function projectShareTruth({
  scope = ShareScope.current,
  state = {},
  workspace = null,
  record = null,
  publicViewerUrl = '',
  exactStateBaseUrl = '',
  routeCodec = globalThis.TiinexWorkspaceRoute,
  persistenceCodec = globalThis.TiinexWorkspacePersistence
} = {}) {
  const normalizedScope = normalizeScope(scope);
  const exactStateUrl = normalizedScope === ShareScope.current
    ? buildExactStateUrl(state, { baseUrl: exactStateBaseUrl, routeCodec, persistenceCodec })
    : '';
  const publicTarget = publicTargetForScope(normalizedScope, workspace, record);
  const restoreCapability = publicTarget ? publicTargetRestoreCapability(publicTarget) : PublicTargetRestoreCapability.invalid;
  const publicUrl = restoreCapability === PublicTargetRestoreCapability.restorable
    ? buildPublicViewerTargetUrl(publicTarget, publicViewerUrl)
    : '';
  const localMaterial = localMaterialForScope(normalizedScope, workspace, record);
  const sourceBacked = sourceBackedForScope(normalizedScope, workspace, record);
  const targetStatus = shareTargetStatus({ publicTarget, publicUrl, exactStateUrl, localMaterial, sourceBacked, restoreCapability });
  const accessStatus = shareAccessStatus({ scope: normalizedScope, publicTarget, workspace, record, restoreCapability });
  const warnings = shareWarnings({ targetStatus, publicTarget, publicUrl, exactStateUrl, localMaterial, restoreCapability });
  const allowedActions = [];
  if (publicUrl) allowedActions.push('copy-public-url');
  if (exactStateUrl) allowedActions.push('copy-exact-state-url');
  return deepFreeze({
    schema: SHARE_PROJECTION_SCHEMA,
    scope: normalizedScope,
    publicTarget,
    publicUrl,
    exactStateUrl,
    restoreCapability,
    targetStatus,
    accessStatus,
    localMaterialWarning: warnings.find((warning) => warning.code === 'share.local-material-not-carried') || null,
    warnings,
    allowedActions
  });
}

export function buildExactStateUrl(state = {}, { baseUrl = '', routeCodec = globalThis.TiinexWorkspaceRoute, persistenceCodec = globalThis.TiinexWorkspacePersistence } = {}) {
  const base = safeHttpUrl(baseUrl);
  if (!base || typeof routeCodec?.makeRouteState !== 'function' || typeof persistenceCodec?.encodeState !== 'function') return '';
  const routeState = routeCodec.makeRouteState(state || {});
  const encoded = persistenceCodec.encodeState(routeState);
  if (!encoded) return '';
  const url = new URL(base);
  url.hash = `state=${encoded}`;
  return url.href;
}

function publicTargetForScope(scope, workspace, record) {
  if (scope === ShareScope.artifact) return artifactPublicTargetFromRecord(record || {});
  if (scope === ShareScope.workspace) return publicTargetFromWorkspace(workspace || {});
  if (scope === ShareScope.workspaceSet) {
    const target = publicTargetFromRecord(record || {});
    return target?.targetKind === 'workspace' ? target : null;
  }
  return null;
}

function shareTargetStatus({ publicTarget, publicUrl, exactStateUrl, localMaterial, sourceBacked, restoreCapability }) {
  if (restoreCapability === PublicTargetRestoreCapability.restorable && publicTarget && publicUrl) return ShareTargetStatus.available;
  if (localMaterial && !publicTarget && !sourceBacked) return ShareTargetStatus.localOnly;
  if (exactStateUrl && !publicTarget) return ShareTargetStatus.exactViewOnly;
  return ShareTargetStatus.unavailable;
}

function shareAccessStatus({ scope, publicTarget, record, restoreCapability }) {
  if (!publicTarget || restoreCapability !== PublicTargetRestoreCapability.restorable) return ShareAccessStatus.notApplicable;
  if (scope === ShareScope.artifact || scope === ShareScope.workspaceSet) {
    return explicitAuthRequired(record) ? ShareAccessStatus.accessBound : ShareAccessStatus.unknown;
  }
  if (scope === ShareScope.workspace) return ShareAccessStatus.unknown;
  return ShareAccessStatus.notApplicable;
}


function shareWarnings({ targetStatus, publicTarget, publicUrl, exactStateUrl, localMaterial, restoreCapability }) {
  const warnings = [];
  if (publicTarget && restoreCapability === PublicTargetRestoreCapability.unsupported) warnings.push(warning('share.public-target-unsupported', 'This target can be described, but the current public receiver cannot reconstruct it.'));
  if (publicTarget && restoreCapability === PublicTargetRestoreCapability.restorable && !publicUrl) warnings.push(warning('share.public-viewer-unavailable', 'A reconstructive target exists, but no configured public viewer URL can encode it.'));
  if (localMaterial && publicTarget) warnings.push(warning('share.local-material-not-carried', 'Browser-local material is not carried by this public target.'));
  if (targetStatus === ShareTargetStatus.exactViewOnly && exactStateUrl) warnings.push(warning('share.exact-state-not-public-material', 'The exact state URL describes semantic browser state; it does not guarantee recipient material availability.'));
  if (targetStatus === ShareTargetStatus.localOnly) warnings.push(warning('share.local-only', 'This scope contains browser-local material without a truthful reconstructive public target.'));
  return warnings;
}

function localMaterialForScope(scope, workspace, record) {
  if (scope === ShareScope.artifact || scope === ShareScope.workspaceSet) return isLocalMaterial(record);
  if (scope === ShareScope.workspace) return workspaceHasDurableLocalMaterial(workspace || {});
  return false;
}

function sourceBackedForScope(scope, workspace, record) {
  if (scope === ShareScope.artifact || scope === ShareScope.workspaceSet) return isSourceBackedMaterial(record);
  if (scope !== ShareScope.workspace) return false;
  if ((Array.isArray(workspace?.sources) ? workspace.sources : []).some(isSourceBackedSource)) return true;
  return [...(Array.isArray(workspace?.records) ? workspace.records : []), ...(Array.isArray(workspace?.assets) ? workspace.assets : [])].some(isSourceBackedMaterial);
}

function explicitAuthRequired(record) {
  return authRequiredIn(record?.source) || authRequiredIn(record?.sourceTarget);
}

function authRequiredIn(value = null) {
  if (!value || typeof value !== 'object') return false;
  return Boolean(
    value.authRequired
    || value.config?.authRequired
    || value.transportPolicy?.authRequired
    || value.diagnostics?.transportPolicy?.authRequired
  );
}

function isLocalMaterial(value = {}) {
  const source = value?.source || {};
  const mode = String(value?.sourceMode || '').toLowerCase();
  return source.id === 'local' || source.adapterId === 'local' || source.kind === 'local' || String(source.sourceKind || '').startsWith('local.') || mode.startsWith('local');
}

function isSourceBackedMaterial(value = {}) {
  if (!value || typeof value !== 'object' || isLocalMaterial(value)) return false;
  return Boolean(value.sourceTarget?.inputTarget || value.sourceTarget?.sourceUrl || value.sourceTarget?.rawUrl || isSourceBackedSource(value.source || {}));
}

function isSourceBackedSource(source = {}) {
  if (!source || typeof source !== 'object') return false;
  if (source.id === 'local' || source.adapterId === 'local' || source.kind === 'local') return false;
  return Boolean(source.adapterId || source.sourceKind || source.repo || source.repository || source.url || source.permalink);
}

function normalizeScope(value = '') {
  const scope = String(value || '').trim();
  return Object.values(ShareScope).includes(scope) ? scope : ShareScope.current;
}

function warning(code, message) {
  return Object.freeze({ code, message });
}

function safeHttpUrl(value = '') {
  try {
    const url = new URL(String(value || '').trim());
    return /^https?:$/.test(url.protocol) ? url.href : '';
  } catch (_) {
    return '';
  }
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) deepFreeze(child);
  return value;
}
