import { portableFinding } from '../findings.js';
import {
  extractQualifiedMarkdownLinkTarget,
  isAbsoluteReference,
  materialIsSchemaDocument,
  portableFieldDomainOccurrenceQualification,
  relativePathEscapesBoundary,
  resolvePortableMaterialReference
} from './material.graph.js';
import { packageContainingMaterial } from './semantic.package.graph.js';

export function compileSemanticPackageSchemaResolution(input = {}) {
  const state = {
    nodes: input.nodes || [],
    materialIndex: input.materialIndex,
    findings: []
  };
  const index = new Map();
  const nodeByKey = new Map(state.nodes.map((node) => [node.manifestKey, node]));

  for (const node of state.nodes) {
    const reachable = new Set(node.reachablePackageKeys);
    const candidates = new Map();
    for (const packageKey of reachable) {
      const targetNode = nodeByKey.get(packageKey);
      for (const key of targetNode?.localSchemaKeys || []) {
        const material = state.materialIndex.byKey.get(key);
        if (!material?.schemaId) continue;
        if (!candidates.has(material.schemaId)) candidates.set(material.schemaId, []);
        candidates.get(material.schemaId).push(Object.freeze({ material, packageKey }));
      }
    }

    const bindingsById = new Map();
    for (const binding of node.schemaBindingDeclarations || []) {
      if (binding.name === 'none') continue;
      if (!bindingsById.has(binding.name)) bindingsById.set(binding.name, []);
      bindingsById.get(binding.name).push(binding);
    }

    const ids = new Set([...candidates.keys(), ...bindingsById.keys()]);
    for (const schemaId of ids) {
      const key = resolutionKey(node.manifestKey, schemaId);
      const bindings = bindingsById.get(schemaId) || [];
      let resolution;
      if (bindings.length > 1) {
        resolution = schemaResolution(node, schemaId, 'ambiguous', null, candidates.get(schemaId) || [], bindings, ['Duplicate/conflicting Schema Resolution Bindings.']);
        state.findings.push(portableFinding('error', 'portable.semantic-package.schema-binding.duplicate', `Duplicate Schema Resolution Bindings for ${schemaId}.`, { ref: node.manifestPath, schemaId }));
      } else if (bindings.length === 1) {
        resolution = resolveExplicitSchemaBinding(node, schemaId, bindings[0], candidates.get(schemaId) || [], state);
      } else {
        const available = candidates.get(schemaId) || [];
        if (available.length === 1) resolution = schemaResolution(node, schemaId, 'resolved', available[0], available, [], []);
        else if (!available.length) resolution = schemaResolution(node, schemaId, 'unresolved', null, available, [], ['No resolvable schema candidate exists in the reachable package graph.']);
        else resolution = schemaResolution(node, schemaId, 'ambiguous', null, available, [], [`${available.length} competing schema candidates exist without one exact manifest binding.`]);
      }
      index.set(key, resolution);
      appendResolutionFinding(resolution, node, state.findings);
    }
  }

  return Object.freeze({ index, findings: Object.freeze(state.findings) });
}

export function resolveCompanionSchemaReference(node, fromMaterial, target, input = {}) {
  if (!isAbsoluteReference(target) && relativePathEscapesBoundary(fromMaterial, target, node.packageRoot)) {
    return Object.freeze({ qualification: 'invalid', candidates: Object.freeze([]), finding: 'Companion Schema Reference must not escape its selected package boundary through a relative path.' });
  }
  const resolved = resolvePortableMaterialReference(input.materialIndex, fromMaterial, target);
  if (resolved.qualification !== 'resolved') return resolved;
  const material = resolved.candidates[0];
  if (!node.localMaterialKeys.includes(material.representationKey)) return Object.freeze({ qualification: 'unresolved', candidates: Object.freeze([]), finding: 'Companion Schema Reference must resolve inside its own selected package boundary.' });
  if (!materialIsSchemaDocument(material)) return Object.freeze({ qualification: 'unresolved', candidates: Object.freeze([]), finding: 'Companion Schema Reference target is not a schema document.' });
  return Object.freeze({ qualification: 'resolved', candidates: Object.freeze([material]), material, finding: '' });
}

export function schemaResolutionFor(index, packageKey, schemaId) {
  return index.get(resolutionKey(packageKey, schemaId)) || Object.freeze({ qualification: 'unresolved', target: null });
}

export function projectSchemaResolutions(index = new Map()) {
  return Object.freeze([...index.values()].sort((a, b) => compare(`${a.packageKey}\u0000${a.schemaId}`, `${b.packageKey}\u0000${b.schemaId}`)));
}

function resolveExplicitSchemaBinding(node, schemaId, binding, candidates, state) {
  const schemaReference = String(binding.fields?.['Schema Reference'] || '');
  const schemaShape = portableFieldDomainOccurrenceQualification(node.manifestProjection, 'Schema Resolution Binding Declaration', 'Schema Reference', schemaReference, binding.name);
  if (schemaShape !== 'core') return schemaResolution(node, schemaId, 'unresolved', null, candidates, [binding], ['Schema Reference shape authority is unresolved or invalid.']);

  const schemaTarget = extractQualifiedMarkdownLinkTarget(schemaReference);
  const manifestMaterial = state.materialIndex.byKey.get(node.manifestKey);
  if (!isAbsoluteReference(schemaTarget) && relativePathEscapesBoundary(manifestMaterial, schemaTarget, node.packageRoot)) {
    return schemaResolution(node, schemaId, 'invalid', null, candidates, [binding], ['Relative Schema Reference escapes the selected package boundary.']);
  }
  const schemaResolved = resolvePortableMaterialReference(state.materialIndex, manifestMaterial, schemaTarget);
  if (schemaResolved.qualification !== 'resolved') return schemaResolution(node, schemaId, schemaResolved.qualification, null, candidates, [binding], [schemaResolved.finding]);
  const targetMaterial = schemaResolved.candidates[0];
  if (!isAbsoluteReference(schemaTarget) && !node.localMaterialKeys.includes(targetMaterial.representationKey)) {
    return schemaResolution(node, schemaId, 'invalid', null, candidates, [binding], ['Relative Schema Reference crosses a declared semantic package boundary; cross-package schema bindings require an explicit non-relative Schema Reference plus Package Reference.']);
  }
  if (!materialIsSchemaDocument(targetMaterial) || targetMaterial.schemaId !== schemaId) {
    state.findings.push(portableFinding('error', 'portable.semantic-package.schema-binding.target.invalid', `Schema binding for ${schemaId} does not resolve to exactly that schema document.`, { ref: node.manifestPath, schemaId, target: schemaTarget }));
    return schemaResolution(node, schemaId, 'invalid', null, candidates, [binding], ['Resolved Schema Reference does not identify the declared exact schema artifact.']);
  }

  const packageReference = String(binding.fields?.['Package Reference'] || '');
  if (!packageReference) {
    if (!node.localMaterialKeys.includes(targetMaterial.representationKey)) return schemaResolution(node, schemaId, 'invalid', null, candidates, [binding], ['Package-external Schema Reference requires an explicit Package Reference.']);
  } else {
    const packageShape = portableFieldDomainOccurrenceQualification(node.manifestProjection, 'Schema Resolution Binding Declaration', 'Package Reference', packageReference, binding.name);
    if (packageShape !== 'core') return schemaResolution(node, schemaId, 'unresolved', null, candidates, [binding], ['Package Reference shape authority is unresolved or invalid.']);
    const packageTarget = extractQualifiedMarkdownLinkTarget(packageReference);
    if (!isAbsoluteReference(packageTarget) && relativePathEscapesBoundary(manifestMaterial, packageTarget, node.packageRoot)) {
      return schemaResolution(node, schemaId, 'invalid', null, candidates, [binding], ['Relative Package Reference escapes the selected package boundary.']);
    }
    const packageResolved = resolvePortableMaterialReference(state.materialIndex, manifestMaterial, packageTarget);
    if (packageResolved.qualification !== 'resolved') return schemaResolution(node, schemaId, packageResolved.qualification, null, candidates, [binding], [packageResolved.finding]);
    const targetPackageKey = packageResolved.candidates[0].representationKey;
    const directTarget = node.outgoingEdges.some((edge) => edge.qualification === 'resolved' && edge.targetPackageKey === targetPackageKey);
    if (!directTarget) return schemaResolution(node, schemaId, 'invalid', null, candidates, [binding], ['Package Reference is not one of the package authorities explicitly declared by this manifest.']);
    const targetNode = state.nodes.find((candidate) => candidate.manifestKey === targetPackageKey);
    if (!targetNode?.localMaterialKeys.includes(targetMaterial.representationKey)) return schemaResolution(node, schemaId, 'invalid', null, candidates, [binding], ['Schema Reference does not resolve inside the explicitly referenced package boundary.']);
  }

  const packageKey = packageContainingMaterial(targetMaterial.representationKey, state.nodes);
  return schemaResolution(node, schemaId, 'resolved', Object.freeze({ material: targetMaterial, packageKey }), candidates, [binding], []);
}

function appendResolutionFinding(resolution, node, findings) {
  if (resolution.qualification === 'ambiguous' || resolution.qualification === 'invalid') {
    findings.push(portableFinding('error', 'portable.semantic-package.schema-resolution.fail-closed', `Schema resolution for ${resolution.schemaId} is ${resolution.qualification}.`, { ref: node.manifestPath, schemaId: resolution.schemaId, qualification: resolution.qualification }));
  } else if (resolution.qualification === 'unresolved') {
    findings.push(portableFinding('warning', 'portable.semantic-package.schema-resolution.unresolved', `Schema resolution for ${resolution.schemaId} is unresolved.`, { ref: node.manifestPath, schemaId: resolution.schemaId }));
  }
}

function schemaResolution(node, schemaId, qualification, target, candidates, bindings, findings) {
  return Object.freeze({
    packageKey: node.manifestKey,
    packagePath: node.manifestPath,
    schemaId,
    qualification,
    target: target ? Object.freeze({ representationKey: target.material.representationKey, path: target.material.path, packageKey: target.packageKey }) : null,
    candidates: Object.freeze((candidates || []).map((item) => Object.freeze({ representationKey: item.material.representationKey, path: item.material.path, packageKey: item.packageKey }))),
    bindingCount: (bindings || []).length,
    bindingProvenance: Object.freeze((bindings || []).map((binding) => Object.freeze({
      schemaId: String(binding.name || ''),
      schemaReference: String(binding.fields?.['Schema Reference'] || ''),
      packageReference: String(binding.fields?.['Package Reference'] || ''),
      note: String(binding.fields?.Note || ''),
      source: binding.source || null
    }))),
    findings: Object.freeze([...(findings || [])])
  });
}

function resolutionKey(packageKey, schemaId) { return `${packageKey}\u0000${String(schemaId || '').trim()}`; }
function compare(a = '', b = '') { const left = String(a); const right = String(b); return left < right ? -1 : left > right ? 1 : 0; }
