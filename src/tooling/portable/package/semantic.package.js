import { portableFinding, summarizePortableFindings } from '../findings.js';
import { indexPortableMaterials } from './material.graph.js';
import { compilePortableSchemaTransitionCompanion } from './schema.transition.companion.js';
import {
  compileSemanticPackageGraph,
  packageContainingMaterial,
  projectPackageGraph,
  selectSemanticPackageManifest
} from './semantic.package.graph.js';
import {
  compileSemanticPackageSchemaResolution,
  projectSchemaResolutions,
  resolveCompanionSchemaReference
} from './semantic.package.schema-resolution.js';
import {
  compileAttachmentStates,
  detectCompanionConflicts,
  ensureTransitionRegistryEntry,
  finalizeTransitionRegistry,
  qualifyAttachmentParticipation,
  resolvePackageTransitionReference
} from './semantic.package.transition-registry.js';
import {
  PORTABLE_SEMANTIC_PACKAGE_COMPILATION_SCHEMA_ID,
  SEMANTIC_PACKAGE_SCHEMA_ID,
  SCHEMA_TRANSITION_COMPANION_SCHEMA_ID,
  TRANSITION_DEFINITION_SCHEMA_ID,
  isPackageManifestArtifact
} from './semantic.package.types.js';

export {
  PORTABLE_SEMANTIC_PACKAGE_COMPILATION_SCHEMA_ID,
  SEMANTIC_PACKAGE_SCHEMA_ID,
  SCHEMA_TRANSITION_COMPANION_SCHEMA_ID,
  TRANSITION_DEFINITION_SCHEMA_ID
} from './semantic.package.types.js';

export function compilePortableSemanticPackage(input = {}) {
  const materialIndex = indexPortableMaterials(input.materials || []);
  const findings = [];
  for (const conflict of materialIndex.representationKeyConflicts || []) {
    findings.push(portableFinding('error', 'portable.material-graph.representation-key.duplicate', 'One supplied representationKey maps to more than one concrete material representation; v1 fails closed instead of deduplicating or choosing one.', {
      representationKey: conflict.representationKey,
      candidates: conflict.candidates
    }));
  }
  if (findings.length) return finalResult({ selected: null, materialIndex, findings });
  const selected = selectSemanticPackageManifest(materialIndex, input.selectedManifest || input.manifest || input.manifestReference || '');
  if (selected.qualification !== 'resolved' || !isPackageManifestArtifact(selected.material)) {
    findings.push(portableFinding('error', 'portable.semantic-package.selected-manifest.unresolved', 'Selected Semantic Package Manifest did not resolve to exactly one manifest artifact.', {
      ref: String(input.selectedManifest || input.manifestReference || ''),
      qualification: selected.qualification
    }));
    return finalResult({ selected: selected.material, materialIndex, findings });
  }

  const contracts = input.contracts || {};
  if (!contracts.semanticPackage || !contracts.schemaTransitionCompanion || !contracts.transitionDefinition) {
    findings.push(portableFinding('error', 'portable.semantic-package.contracts.missing', 'Semantic package compilation requires compiled canonical contracts for Semantic Package Manifest, Schema Transition Companion, and Transition Definition.', { ref: selected.material.path || '' }));
    return finalResult({ selected: selected.material, materialIndex, findings });
  }

  const graph = compileSemanticPackageGraph({
    selectedManifest: selected.material,
    materialIndex,
    compiledContract: contracts.semanticPackage,
    resolvers: input.resolvers || {}
  });
  findings.push(...graph.findings);

  const schemaResolution = compileSemanticPackageSchemaResolution({ nodes: graph.nodes, materialIndex });
  findings.push(...schemaResolution.findings);

  const transitionRegistry = new Map();
  const registryContext = Object.freeze({
    nodes: graph.nodes,
    materialIndex,
    transitionContract: contracts.transitionDefinition,
    resolvers: input.resolvers || {},
    schemaResolutionIndex: schemaResolution.index,
    resolveSchemaConstraint: input.resolveSchemaConstraint
  });

  for (const node of graph.nodes) {
    for (const key of node.localTransitionKeys) {
      ensureTransitionRegistryEntry(transitionRegistry, materialIndex.byKey.get(key), node, 'distributed-.transitions', registryContext);
    }
  }

  const companions = compileCompanions({
    nodes: graph.nodes,
    materialIndex,
    contract: contracts.schemaTransitionCompanion,
    resolvers: input.resolvers || {},
    transitionRegistry,
    registryContext,
    findings
  });

  const companionConflicts = detectCompanionConflicts(companions, findings);
  const attachmentStates = compileAttachmentStates(graph.nodes, companions, companionConflicts, materialIndex);
  const registry = finalizeTransitionRegistry(transitionRegistry);
  appendRegistryQualificationFindings(registry, findings);

  return finalResult({
    selected: selected.material,
    materialIndex,
    packageGraph: projectPackageGraph(graph.nodes, graph.edges),
    schemaResolutions: projectSchemaResolutions(schemaResolution.index),
    companions,
    registry,
    attachmentStates,
    findings
  });
}

function compileCompanions(input) {
  const companions = [];
  for (const node of input.nodes) {
    for (const key of node.localCompanionKeys) {
      const material = input.materialIndex.byKey.get(key);
      const compiled = compilePortableSchemaTransitionCompanion({
        material,
        compiledContract: input.contract,
        resolvers: input.resolvers,
        resolveSchemaReference: ({ target, fromMaterial }) => resolveCompanionSchemaReference(node, fromMaterial, target, { materialIndex: input.materialIndex }),
        resolveTransitionReference: ({ target, fromMaterial }) => resolvePackageTransitionReference(node, fromMaterial, target, { materialIndex: input.materialIndex, nodes: input.nodes }),
        qualifyParticipation: ({ schemaBinding, transitionMaterial }) => qualifyAttachmentParticipation({
          ...input.registryContext,
          schemaBinding,
          transitionMaterial,
          packageNode: node,
          transitionRegistry: input.transitionRegistry
        })
      });
      const projected = Object.freeze({ ...compiled, packageKey: node.manifestKey, packagePath: node.manifestPath });
      companions.push(projected);
      input.findings.push(...compiled.findings);
      attachCompanionProvenance(projected, node, input);
    }
  }
  return Object.freeze(companions.sort((a, b) => compare(a.representationKey, b.representationKey)));
}

function attachCompanionProvenance(compiled, node, input) {
  for (const attachment of compiled.attachmentSet.attachments || []) {
    if (attachment.referenceQualification !== 'resolved' || !attachment.transitionRepresentationKey) continue;
    const target = input.materialIndex.byKey.get(attachment.transitionRepresentationKey);
    const entry = ensureTransitionRegistryEntry(input.transitionRegistry, target, node, 'companion-attachment-reference', input.registryContext);
    const containingPackageKey = packageContainingMaterial(target.representationKey, input.nodes);
    entry.attachmentProvenance.push(Object.freeze({
      companionRepresentationKey: compiled.representationKey,
      companionPath: compiled.path,
      companionSource: compiled.source || Object.freeze({}),
      boundSchemaRepresentationKey: compiled.schemaBinding?.representationKey || '',
      boundSchemaReference: compiled.schemaBinding?.reference || '',
      boundSchemaReferenceTarget: compiled.schemaBinding?.referenceTarget || '',
      attachmentName: attachment.name,
      transitionReference: attachment.reference,
      transitionReferenceTarget: attachment.referenceTarget,
      transitionContainingPackageKey: containingPackageKey,
      attachmentSource: attachment.source || null,
      packageKey: node.manifestKey,
      participationQualification: attachment.participation?.qualification || 'unresolved'
    }));
  }
}

function appendRegistryQualificationFindings(registry, findings) {
  for (const entry of registry) {
    if (entry.representationQualification === 'contradictory' || entry.representationQualification === 'structurally-invalid') {
      findings.push(portableFinding('error', 'portable.semantic-package.transition.representation.invalid', 'A discovered Transition Definition representation is not canonically qualified.', { ref: entry.path, transitionRepresentationKey: entry.representationKey }));
    } else if (entry.representationQualification !== 'valid') {
      findings.push(portableFinding('warning', 'portable.semantic-package.transition.representation.unresolved', 'A discovered Transition Definition representation is not fully qualified.', { ref: entry.path, transitionRepresentationKey: entry.representationKey, qualification: entry.representationQualification }));
    }
  }
}

function finalResult(input = {}) {
  const summary = summarizePortableFindings(input.findings || []);
  const status = summary.counts.error ? 'invalid' : summary.counts.warning ? 'unresolved' : 'valid';
  return Object.freeze({
    schema: PORTABLE_SEMANTIC_PACKAGE_COMPILATION_SCHEMA_ID,
    status,
    selectedManifest: input.selected ? Object.freeze({ representationKey: input.selected.representationKey, path: input.selected.path, schemaId: input.selected.schemaId }) : null,
    packageGraph: input.packageGraph || Object.freeze({ nodes: Object.freeze([]), edges: Object.freeze([]) }),
    schemaResolutions: input.schemaResolutions || Object.freeze([]),
    companions: input.companions || Object.freeze([]),
    schemaAttachments: input.attachmentStates || Object.freeze([]),
    transitionRegistry: input.registry || Object.freeze([]),
    materialCount: input.materialIndex?.materials?.length || 0,
    findings: Object.freeze([...(input.findings || [])]),
    findingSummary: summary,
    limitations: Object.freeze([
      'Package discovery is bounded to explicitly supplied material and explicit package/reference routes; no repository-global fallback exists.',
      'Package locality is discovery/provenance only and is not Transition identity or applicability authority.',
      'Schema assignability and implicit companion inheritance are not inferred.',
      'Attachment participation is read-only qualification and never creates participation or execution authority.'
    ])
  });
}

function compare(a = '', b = '') { const left = String(a); const right = String(b); return left < right ? -1 : left > right ? 1 : 0; }
