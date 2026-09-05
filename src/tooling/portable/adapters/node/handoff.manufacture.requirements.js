import { createHash } from 'node:crypto';
import { access, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { packageFileBytes, sha256Hex } from '../../../../export/package.bytes.js';
import { parseArtifactMarkdown } from '../../../../artifacts/artifact.parse.js';
import { projectHandoffMaterialRequirements, projectParticipantRoleRequirements } from '../../handoff/materialClosure.requirements.js';
import { safeWorkspaceToken } from './handoff.manufacture.multiRoot.js';
import { parseWorkspaceQualifiedReference } from '../../handoff/workspaceQualifiedReference.js';

export async function projectManufacturingRequirements({ handoff, workspaceId, handoffPath, routeSpecs, workspaceRuntimeById }) {
  const primary = projectHandoffMaterialRequirements(handoff);
  const combined = { required: [], reference: [], endpointRoles: [], participantRoles: [], dependencies: [], findings: [...(primary.findings || [])] };
  const seenRoute = new Set();
  for (const route of routeSpecs || []) {
    const routeWorkspaceId = String(route.workspaceId || workspaceId || '').trim();
    const routePath = normalizeRelativePath(route.path || route.workspaceRelativePath || '');
    const routeKey = `${routeWorkspaceId}\u0000${routePath}`;
    if (!routeWorkspaceId || !routePath || seenRoute.has(routeKey)) continue;
    seenRoute.add(routeKey);
    const runtime = workspaceRuntimeById.get(routeWorkspaceId);
    if (!runtime) throw new Error(`portable.handoff-manufacture.route.workspace-unresolved:${routeWorkspaceId}`);
    const routeMarkdown = routeWorkspaceId === workspaceId && routePath === handoffPath
      ? handoff.markdown
      : await readWorkspaceText(runtime.root, routePath, 'portable.handoff-manufacture.route.path');
    const projected = routeWorkspaceId === workspaceId && routePath === handoffPath
      ? primary
      : projectHandoffMaterialRequirements({ id: routePath, path: routePath, semanticStatus: 'unknown', markdown: routeMarkdown });
    const primaryRoute = routeWorkspaceId === workspaceId && routePath === handoffPath;
    for (const key of ['required', 'reference', 'endpointRoles']) {
      for (const requirement of projected[key] || []) combined[key].push(scopeRouteRequirement(requirement, routeWorkspaceId, routePath, primaryRoute));
    }
    combined.participantRoles.push(...projectParticipantRoleRequirements(route.participantRoles || route.roles || [], { workspaceId: routeWorkspaceId, routePath }));
    combined.findings.push(...(projected.findings || []));
  }
  if (!seenRoute.has(`${workspaceId}\u0000${handoffPath}`)) {
    for (const key of ['required', 'reference', 'endpointRoles']) for (const requirement of primary[key] || []) combined[key].push(scopeRouteRequirement(requirement, workspaceId, handoffPath, true));
  }
  return Object.freeze({
    ...primary,
    required: Object.freeze(combined.required),
    reference: Object.freeze(combined.reference),
    endpointRoles: Object.freeze(combined.endpointRoles),
    participantRoles: Object.freeze(combined.participantRoles),
    dependencies: Object.freeze(combined.dependencies),
    counts: Object.freeze({ required: combined.required.length, reference: combined.reference.length, endpointRoles: combined.endpointRoles.length, participantRoles: combined.participantRoles.length, dependencies: combined.dependencies.length }),
    findings: Object.freeze(combined.findings)
  });
}

function scopeRouteRequirement(requirement, routeWorkspaceId, routePath, preserveId = false) {
  return Object.freeze({
    ...requirement,
    id: preserveId ? String(requirement.id || '') : `route:${safeWorkspaceToken(routeWorkspaceId)}:${safeWorkspaceToken(routePath)}:${String(requirement.id || '')}`,
    sourceRequirementId: String(requirement.sourceRequirementId || requirement.id || ''),
    routeWorkspaceId,
    routePath
  });
}

export async function resolveWorkspaceRequirementMaterials(requirements, workspaceRuntimeById, bindings = {}) {
  const out = [];
  for (const requirement of [...(requirements.required || []), ...(requirements.reference || []), ...(requirements.endpointRoles || []), ...(requirements.participantRoles || []), ...(requirements.dependencies || [])]) {
    const explicit = bindingForRequirement(bindings, requirement);
    if (explicit) {
      const workspaceBound = materialCandidateFromWorkspaceBinding(requirement, explicit, workspaceRuntimeById);
      if (workspaceBound) { out.push(workspaceBound); continue; }
      const owner = workspaceRuntimeById.get(String(requirement.routeWorkspaceId || '')) || [...workspaceRuntimeById.values()][0];
      const candidate = await materialCandidateFromBinding(requirement, explicit, owner?.root || '.');
      if (candidate) out.push(candidate);
      continue;
    }
    const targetWorkspaceId = String(requirement.targetWorkspaceId || '').trim();
    const targetPath = normalizeRelativePath(requirement.targetPath || '');
    if (targetWorkspaceId && targetPath) {
      const targetRuntime = workspaceRuntimeById.get(targetWorkspaceId);
      const entry = targetRuntime ? entryFromEnumeration(targetRuntime.enumeration, targetPath) : null;
      if (entry) {
        out.push(materialCandidateFromWorkspaceEntry(requirement, targetWorkspaceId, targetPath, entry, targetRuntime.enumeration));
        continue;
      }
    }
    const target = String(requirement.reference?.target || '');
    if (!target) continue;
    const workspaceQualified = resolveCarriedWorkspaceQualifiedReference(target, workspaceRuntimeById);
    if (workspaceQualified) {
      const targetRuntime = workspaceRuntimeById.get(workspaceQualified.workspaceId);
      const entry = targetRuntime ? entryFromEnumeration(targetRuntime.enumeration, workspaceQualified.path) : null;
      if (entry) out.push(materialCandidateFromWorkspaceEntry(requirement, workspaceQualified.workspaceId, workspaceQualified.path, entry, targetRuntime.enumeration));
      continue;
    }
    if (isExternalReference(target) || target.startsWith('#')) continue;
    const routeWorkspaceId = String(requirement.routeWorkspaceId || [...workspaceRuntimeById.keys()][0] || '');
    const runtime = workspaceRuntimeById.get(routeWorkspaceId);
    if (!runtime) continue;
    const handoffDir = path.dirname(path.resolve(runtime.root, String(requirement.routePath || '')));
    const absolute = path.resolve(handoffDir, decodeURIComponent(target.split('#')[0]));
    if (!inside(runtime.root, absolute)) continue;
    const relative = normalizeRelativePath(path.relative(runtime.root, absolute));
    const entry = entryFromEnumeration(runtime.enumeration, relative);
    if (!entry) continue;
    out.push(materialCandidateFromWorkspaceEntry(requirement, routeWorkspaceId, relative, entry, runtime.enumeration));
  }
  return out;
}


export async function expandPointerDependencyClosure(input = {}) {
  let requirements = input.requirements || {};
  let materials = [...(input.materials || [])];
  const dependencies = [...(requirements.dependencies || [])];
  const findings = [...(requirements.findings || [])];
  const seenSourceTargets = new Set();
  const seenDependencyIds = new Set(dependencies.map((item) => String(item.id || '')));
  const maxDependencies = 128;

  for (let cursor = 0; cursor < materials.length; cursor += 1) {
    const material = materials[cursor];
    const requirement = findRequirement(requirements, material.requirementId, dependencies);
    if (!requirement) continue;
    const markdown = decodeUtf8(material.data);
    if (!isTiinexPointerMarkdown(markdown)) continue;
    const targets = pointerDependencyTargets(markdown);
    for (let index = 0; index < targets.length; index += 1) {
      const target = targets[index];
      const dedupeKey = `${material.sha256 || sha256Hex(packageFileBytes(material))}\u0000${target}`;
      if (seenSourceTargets.has(dedupeKey)) continue;
      seenSourceTargets.add(dedupeKey);
      if (dependencies.length >= maxDependencies) throw new Error('portable.handoff-manufacture.pointer-dependency.limit-exceeded');
      const derived = derivePointerDependencyRequirement({ sourceRequirement: requirement, sourceMaterial: material, target, index, workspaceRuntimeById: input.workspaceRuntimeById });
      if (seenDependencyIds.has(derived.id)) continue;
      seenDependencyIds.add(derived.id);
      dependencies.push(derived);
      const resolved = await resolveDerivedDependencyMaterial(derived, material, input.workspaceRuntimeById, input.bindings || {});
      if (resolved) materials.push(resolved);
    }
  }

  requirements = Object.freeze({
    ...requirements,
    dependencies: Object.freeze(dependencies),
    counts: Object.freeze({ ...(requirements.counts || {}), dependencies: dependencies.length }),
    findings: Object.freeze(findings)
  });
  return Object.freeze({ requirements, materials: Object.freeze(materials) });
}

function findRequirement(requirements = {}, requirementId = '', pendingDependencies = []) {
  const id = String(requirementId || '');
  const pending = (pendingDependencies || []).find((item) => String(item.id || '') === id);
  if (pending) return pending;
  for (const key of ['required', 'reference', 'endpointRoles', 'participantRoles', 'dependencies']) {
    const found = (requirements[key] || []).find((item) => String(item.id || '') === id);
    if (found) return found;
  }
  return null;
}

function derivePointerDependencyRequirement({ sourceRequirement = {}, sourceMaterial = {}, target = '', index = 0, workspaceRuntimeById = new Map() }) {
  const routeWorkspaceId = String(sourceRequirement.routeWorkspaceId || sourceMaterial.provenance?.workspaceId || '').trim();
  const routePath = String(sourceRequirement.routePath || '').trim();
  let targetWorkspaceId = '';
  let targetPath = '';
  const workspaceQualified = resolveCarriedWorkspaceQualifiedReference(target, workspaceRuntimeById);
  if (workspaceQualified) {
    targetWorkspaceId = workspaceQualified.workspaceId;
    targetPath = workspaceQualified.path;
  } else if (!isExternalReference(target) && !String(target).startsWith('#')) {
    const sourceWorkspaceId = String(sourceMaterial.provenance?.workspaceId || '').trim();
    const sourceWorkspacePath = normalizeRelativePath(sourceMaterial.provenance?.path || sourceMaterial.path || '');
    if (sourceWorkspaceId && sourceWorkspacePath && workspaceRuntimeById.has(sourceWorkspaceId)) {
      const relative = resolveRelativeWorkspaceTarget(sourceWorkspacePath, target);
      if (relative) {
        targetWorkspaceId = sourceWorkspaceId;
        targetPath = relative;
      }
    }
  }
  const sourceRequirementId = String(sourceRequirement.id || 'pointer');
  const id = `pointer-target:${safeWorkspaceToken(sourceRequirementId)}:${index + 1}:${sha256Text(target).slice(0, 12)}`;
  return Object.freeze({
    id,
    name: `Pointer target ${index + 1} from ${String(sourceRequirement.name || sourceRequirementId)}`,
    classification: 'pointer-target',
    material: 'exact Pointer target dependency',
    purpose: 'recursive package-local dependency closure for carried Tiinex Pointer material',
    availability: 'declared',
    materialReference: String(target),
    reference: Object.freeze({ form: isExternalReference(target) ? 'external-target' : 'pointer-target', raw: String(target), label: '', target: String(target), exactTargetDeclared: true }),
    routeWorkspaceId,
    routePath,
    targetWorkspaceId,
    targetPath,
    sourceRequirementId,
    source: null,
    fields: Object.freeze({ RouteWorkspace: routeWorkspaceId, RoutePath: routePath, SourceRequirement: sourceRequirementId, TargetWorkspace: targetWorkspaceId, TargetPath: targetPath, Reference: String(target) })
  });
}

async function resolveDerivedDependencyMaterial(requirement, sourceMaterial, workspaceRuntimeById, bindings) {
  const explicit = bindingForRequirement(bindings, requirement);
  if (explicit) {
    const workspaceBound = materialCandidateFromWorkspaceBinding(requirement, explicit, workspaceRuntimeById);
    if (workspaceBound) return workspaceBound;
    const owner = workspaceRuntimeById.get(String(requirement.routeWorkspaceId || '')) || [...workspaceRuntimeById.values()][0];
    return materialCandidateFromBinding(requirement, explicit, owner?.root || '.');
  }
  if (requirement.targetWorkspaceId && requirement.targetPath) {
    const runtime = workspaceRuntimeById.get(String(requirement.targetWorkspaceId));
    const entry = runtime ? entryFromEnumeration(runtime.enumeration, requirement.targetPath) : null;
    if (entry) return materialCandidateFromWorkspaceEntry(requirement, requirement.targetWorkspaceId, requirement.targetPath, entry, runtime.enumeration);
  }
  const target = String(requirement.reference?.target || '');
  const sourcePath = String(sourceMaterial.provenance?.sourcePath || '').trim();
  if (sourcePath && !isExternalReference(target) && !target.startsWith('#')) {
    const clean = safeDecodeURIComponent(target.split('#')[0].split('?')[0]);
    if (clean && !path.isAbsolute(clean)) {
      const absolute = path.resolve(path.dirname(sourcePath), clean);
      if (await regularFileExists(absolute)) {
        return materialCandidateFromBinding(requirement, { sourcePath: absolute, referenceTarget: target }, '.');
      }
    }
  }
  return null;
}

function bindingForRequirement(bindings = {}, requirement = {}) {
  const target = String(requirement.reference?.target || requirement.referenceTarget || '');
  return bindings[requirement.id] || bindings[requirement.name] || (target ? bindings[target] : null) || null;
}

function isTiinexPointerMarkdown(markdown = '') {
  if (!markdown) return false;
  try { return String(parseArtifactMarkdown(markdown).envelope?.current?.schema?.id || '').trim() === 'tiinex.pointer.v1'; }
  catch { return false; }
}

function pointerDependencyTargets(markdown = '') {
  const out = [];
  for (const heading of ['Destinations', 'Current Origin']) {
    const section = markdownSection(markdown, heading);
    const links = /\[[^\]\r\n]+\]\(([^)\r\n]+)\)/g;
    let match;
    while ((match = links.exec(section))) {
      const target = String(match[1] || '').trim();
      if (target && !target.startsWith('#')) out.push(target);
    }
  }
  return [...new Set(out)];
}

function markdownSection(markdown = '', heading = '') {
  const source = String(markdown || '');
  const match = new RegExp(`^##\\s+${escapeRegExp(heading)}\\s*$`, 'mi').exec(source);
  if (!match) return '';
  const rest = source.slice(match.index + match[0].length);
  const next = /^#{1,2}\s+/m.exec(rest);
  return (next ? rest.slice(0, next.index) : rest).trim();
}


function resolveCarriedWorkspaceQualifiedReference(target = '', workspaceRuntimeById = new Map()) {
  const parsed = parseWorkspaceQualifiedReference(target);
  return parsed && workspaceRuntimeById?.has?.(parsed.workspaceId) ? parsed : null;
}

export function resolveRelativeWorkspaceTarget(sourcePath = '', target = '') {
  const raw = safeDecodeURIComponent(String(target || '').split('#')[0].split('?')[0]);
  if (!raw || path.posix.isAbsolute(raw) || raw.startsWith('\\')) return '';
  const base = normalizeRelativePath(sourcePath).split('/').slice(0, -1);
  for (const part of raw.replace(/\\/g, '/').split('/')) {
    if (!part || part === '.') continue;
    if (part === '..') { if (!base.length) return ''; base.pop(); }
    else base.push(part);
  }
  return normalizeRelativePath(base.join('/'));
}

async function regularFileExists(absolute) {
  try { await access(absolute); return (await stat(absolute)).isFile(); }
  catch { return false; }
}


export function decodeUtf8(value) { try { return new TextDecoder('utf-8', { fatal: true }).decode(packageFileBytes({ data: value })); } catch { return ''; } }
function safeDecodeURIComponent(value = '') { try { return decodeURIComponent(value); } catch { return ''; } }
function escapeRegExp(value = '') { return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

export function entryFromEnumeration(enumeration = {}, relative = '') {
  const normalized = normalizeRelativePath(relative);
  const matches = (enumeration.materialization?.entries || []).filter((entry) => normalizeRelativePath(entry.path) === normalized);
  return matches.length === 1 ? matches[0] : null;
}

export function materialCandidateFromWorkspaceEntry(requirement, workspaceId, relative, entry, enumeration) {
  return Object.freeze({
    requirementId: requirement.id,
    referenceTarget: String(requirement.reference?.target || requirement.referenceTarget || ''),
    path: relative,
    data: entry.data,
    bytes: entry.bytes,
    sha256: entry.sha256,
    mediaType: entry.mediaType,
    providerId: 'node-workspace-enumerator',
    providerKind: 'qualified-local-workspace',
    provenance: Object.freeze({ workspaceId, path: relative, boundary: '.' }),
    authority: Object.freeze({ localIdentityQualified: true, completenessEvidenceFingerprint: enumeration.evidence.entriesFingerprint })
  });
}


function materialCandidateFromWorkspaceBinding(requirement, binding, workspaceRuntimeById) {
  if (!binding || typeof binding !== 'object') return null;
  const workspaceId = String(binding.workspaceId || binding.targetWorkspaceId || '').trim();
  const relative = normalizeRelativePath(binding.workspacePath || binding.targetPath || (workspaceId ? binding.path : ''));
  if (!workspaceId || !relative) return null;
  const runtime = workspaceRuntimeById.get(workspaceId);
  const entry = runtime ? entryFromEnumeration(runtime.enumeration, relative) : null;
  if (!entry) return null;
  return materialCandidateFromWorkspaceEntry(requirement, workspaceId, relative, entry, runtime.enumeration);
}

async function materialCandidateFromBinding(requirement, binding, workspaceRoot) {
  if (typeof binding === 'string') {
    const absolute = path.resolve(workspaceRoot, binding);
    assertInside(workspaceRoot, absolute, 'portable.handoff-manufacture.material-binding.outside-workspace');
    const data = new Uint8Array(await readFile(absolute));
    return Object.freeze({ requirementId: requirement.id, referenceTarget: String(requirement.reference?.target || ''), path: normalizeRelativePath(path.relative(workspaceRoot, absolute)), data, providerId: 'node-explicit-material-binding', providerKind: 'qualified-local-workspace', authority: Object.freeze({ localIdentityQualified: true }) });
  }
  if (!binding || typeof binding !== 'object') return null;
  if (binding.sourcePath || binding.absolutePath) {
    const sourcePath = path.resolve(String(binding.sourcePath || binding.absolutePath));
    const data = new Uint8Array(await readFile(sourcePath));
    return Object.freeze({ ...binding, requirementId: requirement.id, referenceTarget: String(binding.referenceTarget || requirement.reference?.target || ''), path: normalizeRelativePath(sourcePath), data, bytes: data.byteLength, sha256: sha256Hex(data), providerId: String(binding.providerId || 'node-explicit-external-material-binding'), providerKind: String(binding.providerKind || 'supplied-external-material'), provenance: Object.freeze({ ...(binding.provenance || {}), sourcePath, boundary: 'explicit-material-binding' }), authority: Object.freeze({ ...(binding.authority || {}), localIdentityQualified: true }) });
  }
  if (binding.path) return materialCandidateFromBinding(requirement, String(binding.path), workspaceRoot);
  const data = packageFileBytes(binding);
  return Object.freeze({ ...binding, requirementId: requirement.id, referenceTarget: String(binding.referenceTarget || requirement.reference?.target || ''), data, providerId: String(binding.providerId || 'node-explicit-material-binding'), providerKind: String(binding.providerKind || 'supplied-material'), authority: Object.freeze({ ...(binding.authority || {}), localIdentityQualified: binding.authority?.localIdentityQualified === true || !requirement.reference?.target }) });
}

async function readWorkspaceText(root, relative, code) {
  const absolute = path.resolve(root, relative);
  assertInside(root, absolute, `${code}.outside-workspace`);
  return readFile(absolute, 'utf8');
}


export function normalizeRelativePath(value = '') { return String(value || '').replace(/\\/g, '/').replace(/^\/+/, '').split('/').filter((part) => part && part !== '.').join('/'); }
function inside(root, absolute) { const relative = path.relative(root, absolute); return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative)); }
export function assertInside(root, absolute, code) { if (!inside(root, absolute)) throw new Error(code); }
export function isExternalReference(value = '') { return /^[a-z][a-z0-9+.-]*:/i.test(String(value || '')) || String(value || '').startsWith('//'); }
export function sha256Text(value = '') { return createHash('sha256').update(String(value), 'utf8').digest('hex'); }
export function stableJson(value) { return JSON.stringify(sortJson(value)); }
function sortJson(value) { if (Array.isArray(value)) return value.map(sortJson); if (!value || typeof value !== 'object') return value; return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortJson(value[key])]).filter(([, item]) => typeof item !== 'undefined')); }
