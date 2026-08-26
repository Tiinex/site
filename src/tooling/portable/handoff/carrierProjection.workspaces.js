import { packageFileBytes } from '../../../export/package.bytes.js';
import { handoffWorkspaceProviderForId } from './workspaceByteProvider.js';

export function qualifyHandoffCarrierWorkspaces(bundle = {}, descriptor = {}, byteProvider = null) {
  const manifest = bundle.manifest || parseJsonFile(findFile(bundle, 'tiinex.package/manifest.json')) || {};
  const primaryId = String(manifest.packageScope?.workspaceId || manifest.workspaceId || '');
  const primaryTitle = String(manifest.packageScope?.workspaceTitle || manifest.title || primaryId || '');
  const raw = descriptor.workspaceMaterializations || [];
  const counts = new Map();
  for (const workspace of raw) {
    const id = String(workspace.id || '');
    if (id) counts.set(id, (counts.get(id) || 0) + 1);
  }
  return Object.freeze(raw.map((workspace) => {
    const id = String(workspace.id || '');
    const title = String(id === primaryId ? (primaryTitle || workspace.title || id) : (workspace.title || workspace.name || workspace.source?.workspaceTitle || workspace.source?.title || id || 'workspace'));
    const reasons = [];
    if (!id) reasons.push('workspace-id-unresolved');
    if (id && counts.get(id) !== 1) reasons.push('workspace-id-ambiguous');
    if (String(workspace.qualification || '') !== 'qualified') reasons.push('workspace-qualification-unqualified');
    if (String(workspace.correlationStatus || '') !== 'qualified') reasons.push('workspace-correlation-unqualified');
    const providerWorkspace = byteProvider ? handoffWorkspaceProviderForId(byteProvider, id) : null;
    if (byteProvider && providerWorkspace?.state !== 'qualified') reasons.push(...(providerWorkspace?.reasons || [`workspace-provider-${providerWorkspace?.state || 'unresolved'}`]));
    const state = reasons.length ? (reasons.includes('workspace-id-ambiguous') || providerWorkspace?.state === 'ambiguous' ? 'ambiguous' : 'blocked') : 'qualified';
    return deepFreeze({ state, id, title, slug: slug(title || id), materialization: workspace, provider: providerWorkspace, reasons: Object.freeze([...new Set(reasons)]) });
  }).sort((a, b) => a.id.localeCompare(b.id)));
}

export function selectHandoffCarrierDefaultWorkspace(bundle = {}, workspaces = []) {
  const manifest = bundle.manifest || parseJsonFile(findFile(bundle, 'tiinex.package/manifest.json')) || {};
  const primaryId = String(manifest.packageScope?.workspaceId || manifest.workspaceId || '');
  const matches = workspaces.filter((workspace) => workspace.id === primaryId);
  if (matches.length === 1) return matches[0];
  return workspaces.length === 1 ? workspaces[0] : null;
}

export function handoffCarrierWorkspaceForRoute(workspaces = [], workspaceId = '') {
  const matches = workspaces.filter((workspace) => workspace.id === String(workspaceId || ''));
  if (matches.length === 1) return matches[0];
  return deepFreeze({ state: matches.length > 1 ? 'ambiguous' : 'unresolved', id: String(workspaceId || ''), title: String(workspaceId || ''), slug: slug(workspaceId), materialization: null, provider: null, reasons: Object.freeze([matches.length > 1 ? 'workspace-id-ambiguous' : 'workspace-id-unresolved']) });
}

export function projectHandoffCarrierWorkspace(workspace = {}) {
  return Object.freeze({ id: String(workspace.id || ''), title: String(workspace.title || workspace.id || ''), slug: String(workspace.slug || slug(workspace.title || workspace.id || '')), qualification: String(workspace.state || 'unresolved') });
}

export function findProjectedHandoffCarrierWorkspace(projection = {}, workspaceId = '') {
  return (projection.workspaces || []).find((workspace) => String(workspace.id || '') === String(workspaceId || '')) || null;
}

function findFile(bundle = {}, path = '') { return (bundle.files || []).find((file) => String(file.path || '') === String(path || '')) || null; }
function parseJsonFile(file = null) { try { return file ? JSON.parse(new TextDecoder().decode(packageFileBytes(file))) : null; } catch { return null; } }
function slug(value = '') { return String(value || '').trim().toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 120); }
function deepFreeze(value) { if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value; if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer) return value; for (const child of Object.values(value)) deepFreeze(child); return Object.freeze(value); }
