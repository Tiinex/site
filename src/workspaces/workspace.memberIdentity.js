import { sourceSignature, workspaceSourceInputFromDeclaredEntrypoint } from './workspace.entrypoints.js';

export const WORKSPACE_MEMBER_IDENTITY_SCHEMA = 'tiinex.workspace.memberIdentity.v1';
export const WORKSPACE_MEMBER_BINDING_SCHEMA = 'tiinex.workspace.memberBinding.v1';

export function workspaceEntrypointMemberIdentity(entrypoint = {}, sourceInput = null) {
  const input = sourceInput || workspaceSourceInputFromDeclaredEntrypoint(entrypoint);
  if (!input) return null;
  const name = normalizeSemanticText(entrypoint?.name || '');
  const label = normalizeSemanticText(input.label || entrypoint?.workspaceLabel || entrypoint?.label || entrypoint?.name || '');
  const sourceKind = normalizeSemanticText(input.sourceKind || entrypoint?.sourceKind || entrypoint?.kind || 'github-tree');
  const plan = sourceSignature(input);
  if (!name && !label && !plan) return null;
  const key = ['semantic', name, label, sourceKind, plan].map(encodeIdentityPart).join(':');
  return freezeMemberIdentity({ key, name, label, sourceKind, sourceSignature: plan });
}

export function normalizeWorkspaceMemberIdentity(identity = null) {
  if (!identity || typeof identity !== 'object') return null;
  const key = String(identity.key || '').trim();
  if (!key) return null;
  return freezeMemberIdentity({
    key,
    name: normalizeSemanticText(identity.name || ''),
    label: normalizeSemanticText(identity.label || ''),
    sourceKind: normalizeSemanticText(identity.sourceKind || ''),
    sourceSignature: String(identity.sourceSignature || '').trim()
  });
}

export function workspaceMemberBindingFromApply({ descriptorTarget = null, sourceInput = null } = {}) {
  const target = normalizeDescriptorTarget(descriptorTarget);
  const identity = workspaceEntrypointMemberIdentity(sourceInput?.workspaceEntrypoint || {}, sourceInput);
  if (!target || !identity) return null;
  return Object.freeze({
    schema: WORKSPACE_MEMBER_BINDING_SCHEMA,
    descriptorTarget: target,
    memberIdentity: identity
  });
}

export function appendWorkspaceMemberBinding(workspace = null, binding = null) {
  const normalized = normalizeWorkspaceMemberBinding(binding);
  if (!workspace || !normalized) return workspace;
  const current = normalizeWorkspaceMemberBindings(workspace.workspaceMemberBindings);
  const key = workspaceMemberBindingKey(normalized);
  if (!current.some((item) => workspaceMemberBindingKey(item) === key)) current.push(normalized);
  workspace.workspaceMemberBindings = current;
  return workspace;
}

export function normalizeWorkspaceMemberBindings(value = []) {
  const out = [];
  const seen = new Set();
  for (const item of Array.isArray(value) ? value : []) {
    const normalized = normalizeWorkspaceMemberBinding(item);
    if (!normalized) continue;
    const key = workspaceMemberBindingKey(normalized);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(normalized);
  }
  return out;
}

export function normalizeWorkspaceMemberBinding(binding = null) {
  if (!binding || typeof binding !== 'object') return null;
  const descriptorTarget = normalizeDescriptorTarget(binding.descriptorTarget);
  const memberIdentity = normalizeWorkspaceMemberIdentity(binding.memberIdentity);
  if (!descriptorTarget || !memberIdentity) return null;
  return Object.freeze({
    schema: WORKSPACE_MEMBER_BINDING_SCHEMA,
    descriptorTarget,
    memberIdentity
  });
}

export function singleWorkspaceMemberBinding(workspace = {}) {
  const bindings = normalizeWorkspaceMemberBindings(workspace.workspaceMemberBindings);
  return bindings.length === 1 ? bindings[0] : null;
}

export function workspaceMemberBindingKey(binding = {}) {
  const descriptor = binding?.descriptorTarget || {};
  return [
    String(descriptor.externalTarget || '').trim(),
    String(binding?.memberIdentity?.key || '').trim()
  ].join('|');
}

export function resolveWorkspaceMemberSourceInput(sourceInputs = [], memberIdentity = null) {
  const wanted = normalizeWorkspaceMemberIdentity(memberIdentity);
  if (!wanted) return { ok: false, status: 'invalid', error: 'workspace.member.invalid-identity', matches: [] };
  const matches = [];
  for (const sourceInput of Array.isArray(sourceInputs) ? sourceInputs : []) {
    const identity = workspaceEntrypointMemberIdentity(sourceInput?.workspaceEntrypoint || {}, sourceInput);
    if (identity?.key === wanted.key) matches.push({ sourceInput, memberIdentity: identity });
  }
  if (!matches.length) return { ok: false, status: 'unavailable', error: 'workspace.member.unavailable', matches: [] };
  if (matches.length > 1) return { ok: false, status: 'ambiguous', error: 'workspace.member.ambiguous', matches };
  return { ok: true, status: 'resolved', sourceInput: matches[0].sourceInput, memberIdentity: matches[0].memberIdentity, matches };
}

function normalizeDescriptorTarget(target = null) {
  if (!target || typeof target !== 'object') return null;
  const externalTarget = String(target.externalTarget || '').trim();
  if (!/^https?:\/\//i.test(externalTarget)) return null;
  if (String(target.targetKind || '') !== 'workspace') return null;
  return Object.freeze({
    schema: String(target.schema || 'tiinex.publicTarget.v1'),
    adapterId: String(target.adapterId || '').trim(),
    targetKind: 'workspace',
    externalTarget,
    repository: String(target.repository || '').trim(),
    ref: String(target.ref || '').trim(),
    path: String(target.path || '').trim(),
    issueNumber: Number(target.issueNumber || 0),
    commentId: String(target.commentId || '').trim()
  });
}

function freezeMemberIdentity(input = {}) {
  return Object.freeze({
    schema: WORKSPACE_MEMBER_IDENTITY_SCHEMA,
    kind: 'semantic',
    key: String(input.key || '').trim(),
    name: String(input.name || '').trim(),
    label: String(input.label || '').trim(),
    sourceKind: String(input.sourceKind || '').trim(),
    sourceSignature: String(input.sourceSignature || '').trim()
  });
}

function normalizeSemanticText(value = '') {
  return String(value || '').trim().replace(/\s+/g, ' ').toLowerCase();
}

function encodeIdentityPart(value = '') {
  return encodeURIComponent(String(value || ''));
}
