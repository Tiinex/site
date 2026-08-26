import { createHash } from 'node:crypto';
import { access, readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { packageFileBytes, sha256Hex } from '../../../../export/package.bytes.js';
import { parseArtifactMarkdown } from '../../../../artifacts/artifact.parse.js';
import { projectHandoffMaterialRequirements, projectParticipantRoleRequirements } from '../../handoff/materialClosure.requirements.js';
import { inferWorkspaceTitle, normalizeAdditionalWorkspaceDescriptors, normalizeTransportRoute, safeWorkspaceToken, serializableMetadata } from './handoff.manufacture.multiRoot.js';
import { buildToolingBootstrapTransportFiles, PORTABLE_TOOLING_BOOTSTRAP_MANIFEST_SCHEMA_ID } from './handoff.manufacture.bootstrap.js';

export { buildToolingBootstrapTransportFiles, PORTABLE_TOOLING_BOOTSTRAP_MANIFEST_SCHEMA_ID };

export const PORTABLE_NODE_WORKSPACE_ENUMERATION_SCHEMA_ID = 'tiinex.portable.node-workspace-enumeration.v1';
const DEFAULT_EXCLUDED_DIRECTORIES = Object.freeze(['.git', 'node_modules', '.site-publish']);
const DEFAULT_MAX_FILES = 10000;

export async function prepareNodeHandoffManufacturingInput(input = {}, options = {}) {
  const workspaceRoot = path.resolve(String(input.workspaceRoot || input.workspace || '.'));
  const workspaceId = safeWorkspaceToken(input.workspaceId || path.basename(workspaceRoot) || 'workspace');
  const requestedWorkspaceTitle = String(input.workspaceTitle || input.title || '').trim();
  const handoffPath = normalizeRelativePath(input.handoffPath || input.handoff || '');
  if (!handoffPath) throw new Error('portable.handoff-manufacture.handoff-path.required');
  const absoluteHandoff = path.resolve(workspaceRoot, handoffPath);
  assertInside(workspaceRoot, absoluteHandoff, 'portable.handoff-manufacture.handoff-path.outside-workspace');
  const handoffMarkdown = await readFile(absoluteHandoff, 'utf8');
  const handoff = Object.freeze({
    id: handoffPath,
    path: handoffPath,
    semanticStatus: String(input.handoffSemanticStatus || 'unknown'),
    markdown: handoffMarkdown
  });

  const enumeration = await enumerateNodeWorkspace(workspaceRoot, {
    workspaceId,
    workspaceTitle: requestedWorkspaceTitle,
    sourceMetadata: input.workspaceSource || input.sourceMetadata || {},
    excludeDirectories: input.excludeDirectories || options.excludeDirectories,
    maxFiles: input.maxFiles || options.maxFiles
  });
  if (enumeration.status !== 'qualified-complete') throw new Error(`portable.handoff-manufacture.workspace-enumeration.${enumeration.status}`);
  const workspaceTitle = requestedWorkspaceTitle || inferWorkspaceTitle(enumeration) || workspaceId;
  const primaryMaterialization = Object.freeze({ ...enumeration.materialization, title: workspaceTitle });
  const additionalWorkspaceDescriptors = normalizeAdditionalWorkspaceDescriptors(input.additionalWorkspaces || input.workspaceRoots || input.workspaceDescriptors || []);
  const workspaceMaterializations = [primaryMaterialization];
  const workspaceEnumerations = [Object.freeze({ id: workspaceId, root: workspaceRoot, evidence: enumeration.evidence })];
  const workspaceRuntimeById = new Map([[workspaceId, Object.freeze({ id: workspaceId, root: workspaceRoot, enumeration })]]);
  const seenWorkspaceIds = new Set([workspaceId]);
  for (const descriptor of additionalWorkspaceDescriptors) {
    const id = safeWorkspaceToken(descriptor.id || descriptor.workspaceId || '');
    if (!descriptor.id && !descriptor.workspaceId) throw new Error('portable.handoff-manufacture.additional-workspace.id.required');
    if (seenWorkspaceIds.has(id)) throw new Error(`portable.handoff-manufacture.workspace-id.duplicate:${id}`);
    seenWorkspaceIds.add(id);
    const root = path.resolve(String(descriptor.root || descriptor.workspaceRoot || descriptor.path || ''));
    if (!descriptor.root && !descriptor.workspaceRoot && !descriptor.path) throw new Error(`portable.handoff-manufacture.additional-workspace.root.required:${id}`);
    const requestedTitle = String(descriptor.title || descriptor.name || descriptor.workspaceTitle || '').trim();
    const enumerated = await enumerateNodeWorkspace(root, {
      workspaceId: id,
      workspaceTitle: requestedTitle,
      sourceMetadata: descriptor.source || descriptor.sourceMetadata || {},
      excludeDirectories: descriptor.excludeDirectories || input.excludeDirectories || options.excludeDirectories,
      maxFiles: descriptor.maxFiles || input.maxFiles || options.maxFiles
    });
    if (enumerated.status !== 'qualified-complete') throw new Error(`portable.handoff-manufacture.workspace-enumeration.${id}.${enumerated.status}`);
    const title = requestedTitle || inferWorkspaceTitle(enumerated) || id;
    workspaceMaterializations.push(Object.freeze({ ...enumerated.materialization, title }));
    workspaceEnumerations.push(Object.freeze({ id, root, evidence: enumerated.evidence }));
    workspaceRuntimeById.set(id, Object.freeze({ id, root, enumeration: enumerated }));
  }
  const transportRoutes = Object.freeze([...(input.transportRoutes || input.handoffRoutes || [])].map((route) => normalizeTransportRoute(route, workspaceId)).filter(Boolean));
  const workspaceTargets = normalizeWorkspaceTargetBindings({
    primaryWorkspaceId: workspaceId,
    primaryTargetPath: input.workspaceTargetPath || input.workspaceArtifactPath || '',
    explicitBindings: input.workspaceTargets || input.workspaceTargetBindings || [],
    additionalWorkspaceDescriptors
  });

  const routeSpecs = transportRoutes.length ? transportRoutes : Object.freeze([{ workspaceId, path: handoffPath }]);
  let requirements = await projectManufacturingRequirements({ handoff, workspaceId, handoffPath, routeSpecs, workspaceRuntimeById });
  let materials = await resolveWorkspaceRequirementMaterials(requirements, workspaceRuntimeById, input.materialBindings || {});
  const dependencyClosure = await expandPointerDependencyClosure({ requirements, materials, workspaceRuntimeById, bindings: input.materialBindings || {} });
  requirements = dependencyClosure.requirements;
  materials = dependencyClosure.materials;
  const toolingBootstrap = await buildToolingBootstrapTransportFiles({
    delivery: input.toolingBootstrap || input.bootstrapDelivery || 'embedded',
    runtimeRoot: input.runtimeRoot || options.runtimeRoot,
    expected: input.expectedToolingBootstrap || null,
    maxFiles: input.bootstrapMaxFiles || options.bootstrapMaxFiles
  });
  const orientationBootstrap = input.transportBootstrapContent
    ? Object.freeze({ present: true, path: String(input.transportBootstrapPath || 'tiinex.package/bootstrap.md'), content: String(input.transportBootstrapContent), mediaType: 'text/markdown' })
    : Object.freeze({ present: false });

  return Object.freeze({
    handoff,
    requirements,
    workspace: Object.freeze({ id: workspaceId, name: workspaceTitle, title: workspaceTitle, records: Object.freeze([]), assets: Object.freeze([]) }),
    workspaceMaterializations: Object.freeze(workspaceMaterializations),
    materials: Object.freeze(materials),
    recipient: Object.freeze({ referenceTargets: Object.freeze([...(input.referenceTargets || [])].map(String)) }),
    bootstrap: orientationBootstrap,
    additionalTransportFiles: toolingBootstrap.files,
    transportRoutes,
    workspaceTargets,
    toolingBootstrap: toolingBootstrap.summary,
    manufacturingEvidence: Object.freeze({
      enumeration: enumeration.evidence,
      workspaceEnumerations: Object.freeze(workspaceEnumerations),
      toolingBootstrap: toolingBootstrap.summary,
      carrierProjection: Object.freeze({ requestedRoutes: transportRoutes.length || 1, boundary: 'Routes are qualified later against packaged workspace bytes; adapter text is not authority.' })
    }),
    verifyRoundtrip: input.verifyRoundtrip !== false
  });
}

export async function enumerateNodeWorkspace(rootInput = '.', options = {}) {
  const root = path.resolve(String(rootInput || '.'));
  const maxFiles = positiveInteger(options.maxFiles, DEFAULT_MAX_FILES);
  const excluded = new Set([...(options.excludeDirectories || DEFAULT_EXCLUDED_DIRECTORIES)].map(String));
  const queue = [root];
  const absoluteFiles = [];
  const skippedSymlinks = [];
  while (queue.length) {
    const current = queue.shift();
    const entries = await readdir(current, { withFileTypes: true });
    entries.sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      if (entry.isDirectory() && excluded.has(entry.name)) continue;
      const absolute = path.join(current, entry.name);
      if (entry.isSymbolicLink()) { skippedSymlinks.push(normalizeRelativePath(path.relative(root, absolute))); continue; }
      if (entry.isDirectory()) queue.push(absolute);
      else if (entry.isFile()) absoluteFiles.push(absolute);
      if (absoluteFiles.length > maxFiles) {
        return Object.freeze({ schema: PORTABLE_NODE_WORKSPACE_ENUMERATION_SCHEMA_ID, status: 'file-limit-exceeded', maxFiles, observedFiles: absoluteFiles.length, materialization: null, evidence: Object.freeze({ state: 'blocked', proof: 'deterministic-node-enumeration-v1', maxFiles, observedFiles: absoluteFiles.length }) });
      }
    }
  }
  absoluteFiles.sort((a, b) => normalizeRelativePath(path.relative(root, a)).localeCompare(normalizeRelativePath(path.relative(root, b))));
  const entries = [];
  const includedEntries = [];
  let totalBytes = 0;
  for (const absolute of absoluteFiles) {
    const relative = normalizeRelativePath(path.relative(root, absolute));
    const data = new Uint8Array(await readFile(absolute));
    const bytes = data.byteLength;
    const sha256 = sha256Hex(data);
    totalBytes += bytes;
    entries.push(Object.freeze({ path: relative, data, bytes, sha256, mediaType: mediaTypeForPath(relative) }));
    includedEntries.push(Object.freeze({ path: relative, bytes, sha256, referenceTarget: '' }));
  }
  const workspaceId = safeWorkspaceToken(options.workspaceId || path.basename(root) || 'workspace');
  const workspaceTitle = String(options.workspaceTitle || '').trim();
  const evidencePayload = Object.freeze({
    schema: 'tiinex.portable.workspace-completeness-evidence.v1',
    state: 'qualified',
    proof: 'deterministic-node-enumeration-v1',
    boundary: 'regular-files-under-workspace-root',
    workspaceId,
    entryCount: includedEntries.length,
    totalBytes,
    exclusions: Object.freeze({ directories: Object.freeze([...excluded].sort()), symbolicLinks: 'excluded-and-reported' }),
    skippedSymlinks: Object.freeze(skippedSymlinks.sort()),
    entriesFingerprint: sha256Text(stableJson(includedEntries))
  });
  return Object.freeze({
    schema: PORTABLE_NODE_WORKSPACE_ENUMERATION_SCHEMA_ID,
    status: 'qualified-complete',
    rootBoundary: '.',
    evidence: evidencePayload,
    materialization: Object.freeze({
      id: workspaceId,
      title: workspaceTitle || workspaceId,
      state: 'complete',
      source: Object.freeze({ kind: 'node-directory-enumeration', workspaceId, boundary: '.', operatorMetadata: Object.freeze(serializableMetadata(options.sourceMetadata || {})), authority: 'none' }),
      completenessEvidence: evidencePayload,
      entries: Object.freeze(entries),
      includedEntries: Object.freeze(includedEntries)
    })
  });
}
async function projectManufacturingRequirements({ handoff, workspaceId, handoffPath, routeSpecs, workspaceRuntimeById }) {
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
    routeWorkspaceId,
    routePath
  });
}

async function resolveWorkspaceRequirementMaterials(requirements, workspaceRuntimeById, bindings = {}) {
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
    if (!target || isExternalReference(target) || target.startsWith('#')) continue;
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


async function expandPointerDependencyClosure(input = {}) {
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
  if (!isExternalReference(target) && !String(target).startsWith('#')) {
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

function resolveRelativeWorkspaceTarget(sourcePath = '', target = '') {
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


function decodeUtf8(value) { try { return new TextDecoder('utf-8', { fatal: true }).decode(packageFileBytes({ data: value })); } catch { return ''; } }
function safeDecodeURIComponent(value = '') { try { return decodeURIComponent(value); } catch { return ''; } }
function escapeRegExp(value = '') { return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

function entryFromEnumeration(enumeration = {}, relative = '') {
  return (enumeration.materialization?.entries || []).find((entry) => normalizeRelativePath(entry.path) === normalizeRelativePath(relative)) || null;
}

function materialCandidateFromWorkspaceEntry(requirement, workspaceId, relative, entry, enumeration) {
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


function normalizeWorkspaceTargetBindings(input = {}) {
  const byWorkspace = new Map();
  const push = (workspaceIdValue, pathValue, source) => {
    const workspaceId = safeWorkspaceToken(workspaceIdValue || '');
    const path = String(pathValue || '').replace(/\\/g, '/').trim();
    if (!workspaceId || !path) return;
    const list = byWorkspace.get(workspaceId) || [];
    list.push(Object.freeze({ workspaceId, path, source }));
    byWorkspace.set(workspaceId, list);
  };
  push(input.primaryWorkspaceId, input.primaryTargetPath, 'primary-workspace-target');
  const explicit = input.explicitBindings;
  if (Array.isArray(explicit)) {
    for (const entry of explicit) push(entry?.workspaceId || entry?.workspace || entry?.id, entry?.path || entry?.workspaceTargetPath || entry?.workspaceArtifactPath, 'explicit-workspace-target-binding');
  } else if (explicit && typeof explicit === 'object') {
    for (const [workspaceId, value] of Object.entries(explicit)) push(workspaceId, typeof value === 'string' ? value : value?.path || value?.workspaceTargetPath || value?.workspaceArtifactPath, 'explicit-workspace-target-binding');
  }
  for (const descriptor of input.additionalWorkspaceDescriptors || []) push(descriptor.id || descriptor.workspaceId, descriptor.workspaceTargetPath || descriptor.workspaceArtifactPath || descriptor.targetPath || '', 'additional-workspace-target');
  return Object.freeze([...byWorkspace.values()].flat());
}

function mediaTypeForPath(value = '') { const lower = String(value).toLowerCase(); if (lower.endsWith('.md')) return 'text/markdown'; if (lower.endsWith('.json')) return 'application/json'; if (/\.(?:m?js|cjs)$/.test(lower)) return 'text/javascript'; if (lower.endsWith('.ts')) return 'text/typescript'; if (lower.endsWith('.css')) return 'text/css'; if (lower.endsWith('.html')) return 'text/html'; if (/\.(?:yml|yaml)$/.test(lower)) return 'text/yaml'; if (lower.endsWith('.txt')) return 'text/plain'; return 'application/octet-stream'; }
function normalizeRelativePath(value = '') { return String(value || '').replace(/\\/g, '/').replace(/^\/+/, '').split('/').filter((part) => part && part !== '.').join('/'); }
function inside(root, absolute) { const relative = path.relative(root, absolute); return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative)); }
function assertInside(root, absolute, code) { if (!inside(root, absolute)) throw new Error(code); }
function isExternalReference(value = '') { return /^[a-z][a-z0-9+.-]*:/i.test(String(value || '')) || String(value || '').startsWith('//'); }
function positiveInteger(value, fallback) { const parsed = Number.parseInt(value, 10); return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback; }
function sha256Text(value = '') { return createHash('sha256').update(String(value), 'utf8').digest('hex'); }
function stableJson(value) { return JSON.stringify(sortJson(value)); }
function sortJson(value) { if (Array.isArray(value)) return value.map(sortJson); if (!value || typeof value !== 'object') return value; return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortJson(value[key])]).filter(([, item]) => typeof item !== 'undefined')); }
