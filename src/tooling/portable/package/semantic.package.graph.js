import { portableFinding } from '../findings.js';
import { projectPortableContractInstance } from '../schema/contract.project.js';
import {
  dirname,
  extractQualifiedMarkdownLinkTarget,
  isAbsoluteReference,
  normalizePortablePath,
  pathWithinBoundary,
  portableFieldDomainOccurrenceQualification,
  relativePathEscapesBoundary,
  resolvePortableMaterialReference
} from './material.graph.js';
import { isCompanionArtifact, isPackageManifestArtifact, isTransitionArtifact } from './semantic.package.types.js';
import { materialIsSchemaDocument } from './material.graph.js';

export function compileSemanticPackageGraph(input = {}) {
  const state = {
    materialIndex: input.materialIndex,
    compiledContract: input.compiledContract,
    resolvers: input.resolvers || {},
    nodes: new Map(),
    edges: [],
    findings: [],
    active: []
  };
  compilePackageNode(input.selectedManifest, state, Object.freeze({ kind: 'selected', fromPackageKey: '', declarationName: '', reference: '', referenceTarget: '' }));
  const nodes = [...state.nodes.values()];
  for (const node of nodes) node.reachablePackageKeys = Object.freeze(reachablePackageKeys(node.manifestKey, state));
  return Object.freeze({ nodes: Object.freeze(nodes), edges: Object.freeze(state.edges), findings: Object.freeze(state.findings), state });
}

export function selectSemanticPackageManifest(index, selector) {
  if (selector && typeof selector === 'object' && selector.representationKey && index.byKey.has(selector.representationKey)) {
    return Object.freeze({ qualification: 'resolved', material: index.byKey.get(selector.representationKey) });
  }
  const token = String(selector || '');
  if (index.byKey.has(token)) return Object.freeze({ qualification: 'resolved', material: index.byKey.get(token) });
  const byPath = index.byPath.get(normalizePortablePath(token)) || [];
  const byReference = index.byReference.get(token) || [];
  const candidates = uniqueMaterials([...byPath, ...byReference]);
  if (candidates.length === 1) return Object.freeze({ qualification: 'resolved', material: candidates[0] });
  return Object.freeze({ qualification: candidates.length > 1 ? 'ambiguous' : 'unresolved', material: null, candidates: Object.freeze(candidates) });
}

export function packageContainingMaterial(materialKey, nodes = []) {
  const matches = [...nodes].filter((node) => node.localMaterialKeys.includes(materialKey));
  return matches.length === 1 ? matches[0].manifestKey : '';
}

export function projectPackageGraph(nodes = [], edges = []) {
  return Object.freeze({
    nodes: Object.freeze([...nodes].map(freezePackageNode).sort((a, b) => compare(a.manifestKey, b.manifestKey))),
    edges: Object.freeze([...edges].sort(compareEdge))
  });
}

function compilePackageNode(manifest, state, route) {
  const key = manifest.representationKey;
  const existing = state.nodes.get(key);
  if (existing) {
    pushUniqueRoute(existing.routes, route);
    if (state.active.includes(key)) {
      state.findings.push(portableFinding('info', 'portable.semantic-package.cycle.observed', 'Package dependency cycle observed and terminated by exact manifest representation.', { ref: manifest.path || key, packageKey: key, route }));
    }
    return existing;
  }

  const manifestPathAvailable = Boolean(String(manifest.path || ''));
  const root = manifestPathAvailable ? dirname(manifest.path) : '';
  const projection = projectPortableContractInstance({ markdown: manifest.markdown, compiledContract: state.compiledContract, resolvers: state.resolvers });
  if (!manifestPathAvailable) {
    state.findings.push(portableFinding('error', 'portable.semantic-package.boundary.manifest-path-missing', 'Semantic Package Manifest cannot establish Boundary Root: manifest-directory without an exact material path.', { ref: key, packageKey: key }));
  }
  state.findings.push(...projection.validation.findings);
  const boundaryRoot = ordinaryFieldValue(projection, 'Package Boundary', 'Boundary Root');
  const discoveryPolicy = ordinaryFieldValue(projection, 'Package Boundary', 'Discovery Policy');
  const nestedPolicy = ordinaryFieldValue(projection, 'Package Boundary', 'Nested Package Policy');
  if (boundaryRoot !== 'manifest-directory' || discoveryPolicy !== 'recursive-within-boundary' || nestedPolicy !== 'explicit-only') {
    state.findings.push(portableFinding('error', 'portable.semantic-package.boundary.unsupported', 'Selected package boundary policy is not the canonical v1 manifest-directory / recursive-within-boundary / explicit-only policy.', { ref: manifest.path || key }));
  }

  const packageManifests = manifestPathAvailable
    ? state.materialIndex.materials.filter((item) => isPackageManifestArtifact(item) && item.path && pathWithinBoundary(item.path, root))
    : [manifest];
  const sameDirectory = packageManifests.filter((item) => dirname(item.path) === root);
  const manifestBoundaryAmbiguous = sameDirectory.length !== 1 || sameDirectory[0].representationKey !== key;
  if (manifestBoundaryAmbiguous) {
    state.findings.push(portableFinding('error', 'portable.semantic-package.boundary.manifest-ambiguous', 'Package boundary directory exposes competing Semantic Package Manifest authority.', { ref: manifest.path || key, count: sameDirectory.length }));
  }

  const allNestedRoots = unique(packageManifests.map((item) => dirname(item.path)).filter((dir) => dir !== root)).sort(compare);
  const nestedRoots = nearestNestedPackageRoots(packageManifests, root);
  const boundaryPolicyValid = boundaryRoot === 'manifest-directory' && discoveryPolicy === 'recursive-within-boundary' && nestedPolicy === 'explicit-only';
  const boundaryUsable = manifestPathAvailable && boundaryPolicyValid && !manifestBoundaryAmbiguous;
  const localMaterials = boundaryUsable
    ? state.materialIndex.materials.filter((item) => item.path && pathWithinBoundary(item.path, root) && !nestedRoots.some((nested) => pathWithinBoundary(item.path, nested)))
    : [manifest];

  const node = {
    manifestKey: key,
    manifestPath: manifest.path,
    manifestSource: Object.freeze({ ...(manifest.source || {}) }),
    manifestReferences: Object.freeze([...(manifest.referenceAliases || [])]),
    packageRoot: root,
    manifestProjection: projection,
    routes: [route],
    nestedPackageRoots: Object.freeze(nestedRoots),
    allNestedPackageRoots: Object.freeze(allNestedRoots),
    boundaryQualification: boundaryUsable ? 'valid' : 'invalid',
    localMaterialKeys: Object.freeze(localMaterials.map((item) => item.representationKey)),
    localSchemaKeys: Object.freeze(localMaterials.filter(materialIsSchemaDocument).map((item) => item.representationKey)),
    localCompanionKeys: Object.freeze(localMaterials.filter(isCompanionArtifact).map((item) => item.representationKey)),
    localTransitionKeys: Object.freeze(localMaterials.filter((item) => isTransitionArtifact(item) && transitionPathIsAutoDiscovered(item.path, root)).map((item) => item.representationKey)),
    includedDeclarations: Object.freeze(declarationEntries(projection, 'Included Package Declaration')),
    externalDeclarations: Object.freeze(declarationEntries(projection, 'External Package Dependency Declaration')),
    schemaBindingDeclarations: Object.freeze(declarationEntries(projection, 'Schema Resolution Binding Declaration')),
    outgoingEdges: [],
    reachablePackageKeys: Object.freeze([])
  };
  state.nodes.set(key, node);
  state.active.push(key);

  for (const entry of node.includedDeclarations) resolveAndTraverseEdge('included', node, entry, state);
  for (const entry of node.externalDeclarations) resolveAndTraverseEdge('external', node, entry, state);

  state.active.pop();
  return node;
}

function resolveAndTraverseEdge(kind, node, entry, state) {
  if (entry.name === 'none') return;
  const edge = resolvePackageEdge({ kind, node, entry, state });
  node.outgoingEdges.push(edge);
  state.edges.push(edge);
  if (edge.qualification === 'resolved') compilePackageNode(state.materialIndex.byKey.get(edge.targetPackageKey), state, edgeRoute(edge));
}

function resolvePackageEdge({ kind, node, entry, state }) {
  const field = 'Package Reference';
  const value = String(entry.fields?.[field] || '');
  const group = kind === 'included' ? 'Included Package Declaration' : 'External Package Dependency Declaration';
  const shape = portableFieldDomainOccurrenceQualification(node.manifestProjection, group, field, value, entry.name);
  if (shape !== 'core') return findingEdge(kind, node, entry, value, '', 'unresolved', '', 'Reference shape authority is unresolved or invalid.', state, 'shape.unresolved', 'warning');

  const target = extractQualifiedMarkdownLinkTarget(value);
  const manifestMaterial = state.materialIndex.byKey.get(node.manifestKey);
  if (kind === 'included' && !isAbsoluteReference(target) && relativePathEscapesBoundary(manifestMaterial, target, node.packageRoot)) {
    return findingEdge(kind, node, entry, value, target, 'invalid', '', 'Included Package Reference escapes the current package boundary.', state, 'boundary.invalid', 'error');
  }
  if (kind === 'external' && !isAbsoluteReference(target) && relativePathEscapesBoundary(manifestMaterial, target, node.packageRoot)) {
    return findingEdge(kind, node, entry, value, target, 'invalid', '', 'External Package Reference must not rely on a relative path escaping the current package boundary.', state, 'relative-escape', 'error');
  }

  const resolved = resolvePortableMaterialReference(state.materialIndex, manifestMaterial, target);
  if (resolved.qualification !== 'resolved') {
    return findingEdge(kind, node, entry, value, target, resolved.qualification, '', resolved.finding || 'Package reference did not resolve exactly.', state, `reference.${resolved.qualification}`, resolved.qualification === 'ambiguous' ? 'error' : 'warning');
  }
  const material = resolved.candidates[0];
  if (!isPackageManifestArtifact(material)) return findingEdge(kind, node, entry, value, target, 'invalid', '', 'Package Reference target is not a Semantic Package Manifest artifact.', state, 'target.invalid', 'error');

  if (kind === 'included') {
    if (!node.allNestedPackageRoots.includes(dirname(material.path))) {
      return findingEdge(kind, node, entry, value, target, 'invalid', '', 'Included Package Reference does not resolve to an explicit nested package boundary below the current package root.', state, 'boundary.invalid', 'error');
    }
  } else if (pathWithinBoundary(material.path, node.packageRoot)) {
    return findingEdge(kind, node, entry, value, target, 'invalid', '', 'External Package Reference resolves inside the current package boundary instead of an external package authority.', state, 'target.local', 'error');
  }

  return frozenEdge(kind, node, entry, value, target, 'resolved', material.representationKey, '');
}

function findingEdge(kind, node, entry, reference, target, qualification, targetPackageKey, message, state, suffix, severity) {
  const edge = frozenEdge(kind, node, entry, reference, target, qualification, targetPackageKey, message);
  state.findings.push(portableFinding(severity, `portable.semantic-package.${kind}.${suffix}`, message, { ref: node.manifestPath, entry: entry.name, target }));
  return edge;
}

function nearestNestedPackageRoots(packageManifests, root) {
  const roots = unique(packageManifests.map((item) => dirname(item.path)).filter((dir) => dir !== root));
  return roots.filter((candidate) => !roots.some((other) => other !== candidate && pathWithinBoundary(candidate, other))).sort(compare);
}

function reachablePackageKeys(start, state) {
  const visited = new Set();
  const stack = [start];
  while (stack.length) {
    const key = stack.pop();
    if (visited.has(key)) continue;
    visited.add(key);
    const node = state.nodes.get(key);
    for (const edge of node?.outgoingEdges || []) if (edge.qualification === 'resolved' && edge.targetPackageKey) stack.push(edge.targetPackageKey);
  }
  return [...visited].sort(compare);
}

function ordinaryFieldValue(projection, groupName, fieldName) {
  const group = (projection.ordinaryGroups || []).find((item) => exact(item.group) === exact(groupName));
  const field = (group?.fields || []).find((item) => exact(item.label) === exact(fieldName));
  return field?.occurrences?.length === 1 ? String(field.occurrences[0].value ?? '') : '';
}

function declarationEntries(projection, groupName) {
  const group = (projection.validation?.declarations || []).find((item) => exact(item.contract?.group) === exact(groupName));
  return group?.sections?.flatMap((section) => section.present ? section.entries : []) || [];
}

function transitionPathIsAutoDiscovered(path, root) {
  if (!pathWithinBoundary(path, root)) return false;
  return normalizePortablePath(path).split('/').filter(Boolean).includes('.transitions');
}

function frozenEdge(kind, node, entry, reference, target, qualification, targetPackageKey, finding) {
  return Object.freeze({
    kind,
    fromPackageKey: node.manifestKey,
    fromPackagePath: node.manifestPath,
    declarationName: entry.name,
    declarationSource: entry.source || null,
    reference,
    referenceTarget: target,
    qualification,
    targetPackageKey,
    finding: String(finding || '')
  });
}

function edgeRoute(edge) {
  return Object.freeze({ kind: edge.kind, fromPackageKey: edge.fromPackageKey, declarationName: edge.declarationName, reference: edge.reference, referenceTarget: edge.referenceTarget });
}

function freezePackageNode(node) {
  return Object.freeze({
    manifestKey: node.manifestKey,
    manifestPath: node.manifestPath,
    manifestSource: node.manifestSource,
    manifestReferences: node.manifestReferences,
    packageRoot: node.packageRoot,
    routes: Object.freeze([...(node.routes || [])].sort(compareObject)),
    nestedPackageRoots: node.nestedPackageRoots,
    allNestedPackageRoots: node.allNestedPackageRoots,
    boundaryQualification: node.boundaryQualification,
    localMaterialKeys: node.localMaterialKeys,
    localSchemaKeys: node.localSchemaKeys,
    localCompanionKeys: node.localCompanionKeys,
    localTransitionKeys: node.localTransitionKeys,
    reachablePackageKeys: node.reachablePackageKeys,
    outgoingEdges: Object.freeze([...(node.outgoingEdges || [])].sort(compareEdge))
  });
}

function pushUniqueRoute(routes, route) {
  const text = JSON.stringify(route);
  if (!routes.some((item) => JSON.stringify(item) === text)) routes.push(route);
}

function unique(values = []) { return [...new Set(values.map(String).filter(Boolean))]; }

function uniqueMaterials(values = []) {
  const seen = new Set();
  return values.filter((item) => {
    if (!item || seen.has(item.representationKey)) return false;
    seen.add(item.representationKey);
    return true;
  });
}

function compare(a = '', b = '') { const left = String(a); const right = String(b); return left < right ? -1 : left > right ? 1 : 0; }
function compareObject(a = {}, b = {}) { return compare(JSON.stringify(a), JSON.stringify(b)); }
function compareEdge(a = {}, b = {}) {
  return compare(`${a.fromPackageKey || ''}\u0000${a.kind || ''}\u0000${a.declarationName || ''}\u0000${a.targetPackageKey || ''}\u0000${a.referenceTarget || ''}`, `${b.fromPackageKey || ''}\u0000${b.kind || ''}\u0000${b.declarationName || ''}\u0000${b.targetPackageKey || ''}\u0000${b.referenceTarget || ''}`);
}
function exact(value = '') { return String(value || '').trim(); }
