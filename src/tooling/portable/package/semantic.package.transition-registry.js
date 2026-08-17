import { portableFinding } from '../findings.js';
import { projectPortableContractInstance } from '../schema/contract.project.js';
import {
  isAbsoluteReference,
  relativePathEscapesBoundary,
  resolvePortableMaterialReference
} from './material.graph.js';
import { packageContainingMaterial } from './semantic.package.graph.js';
import { schemaResolutionFor } from './semantic.package.schema-resolution.js';
import { isTransitionArtifact } from './semantic.package.types.js';

export function resolvePackageTransitionReference(node, fromMaterial, target, input = {}) {
  const relative = !isAbsoluteReference(target);
  if (relative && relativePathEscapesBoundary(fromMaterial, target, node.packageRoot)) {
    return Object.freeze({ qualification: 'invalid', candidates: Object.freeze([]), finding: 'Relative Transition Reference must remain inside the companion package boundary; cross-package attachments require an explicit non-relative reference reachable through the package graph.' });
  }
  const resolved = resolvePortableMaterialReference(input.materialIndex, fromMaterial, target);
  if (resolved.qualification !== 'resolved') return resolved;
  const material = resolved.candidates[0];
  if (!isTransitionArtifact(material)) return Object.freeze({ qualification: 'unresolved', candidates: Object.freeze([]), finding: 'Transition Reference target is not a canonical Transition Definition artifact.' });
  const containing = packageContainingMaterial(material.representationKey, input.nodes || []);
  if (relative && containing !== node.manifestKey) {
    return Object.freeze({ qualification: 'invalid', candidates: Object.freeze([material]), finding: 'Relative Transition Reference crosses a declared semantic package boundary; cross-package attachments require an explicit non-relative reference.' });
  }
  if (!containing || !node.reachablePackageKeys.includes(containing)) return Object.freeze({ qualification: 'unresolved', candidates: Object.freeze([]), finding: 'Transition Reference target is not reachable through the active explicit package graph.' });
  return Object.freeze({ qualification: 'resolved', candidates: Object.freeze([material]), material, packageKey: containing, finding: '' });
}

export function ensureTransitionRegistryEntry(registry, material, node, discoveryKind, input = {}) {
  if (!material) return null;
  let entry = registry.get(material.representationKey);
  if (!entry) {
    const projection = projectPortableContractInstance({ markdown: material.markdown, compiledContract: input.transitionContract, resolvers: input.resolvers || {} });
    const identity = ordinaryGroupMap(projection, 'Transition Identity');
    entry = {
      representationKey: material.representationKey,
      path: material.path,
      source: material.source,
      references: Object.freeze([...(material.referenceAliases || [])]),
      schemaId: material.schemaId,
      representationQualification: projection.validation.status,
      transitionIdentity: Object.freeze(identity),
      canonicalIdentifier: String(identity['Canonical Identifier'] || ''),
      version: String(identity.Version || ''),
      projection,
      discoveryProvenance: [],
      attachmentProvenance: []
    };
    registry.set(material.representationKey, entry);
  }
  const containingPackageKey = packageContainingMaterial(material.representationKey, input.nodes || []);
  const route = Object.freeze({
    kind: discoveryKind,
    packageKey: node.manifestKey,
    packagePath: node.manifestPath,
    containingPackageKey,
    materialPath: material.path,
    packageRoutes: Object.freeze([...(node.routes || [])].sort(compareObject))
  });
  if (!entry.discoveryProvenance.some((item) => JSON.stringify(item) === JSON.stringify(route))) entry.discoveryProvenance.push(route);
  return entry;
}

export function qualifyAttachmentParticipation(input = {}) {
  const { schemaBinding, transitionMaterial, packageNode } = input;
  if (schemaBinding?.qualification !== 'resolved' || !schemaBinding.material?.representationKey) return Object.freeze({ qualification: 'unresolved', evidence: Object.freeze([]) });
  const entry = ensureTransitionRegistryEntry(input.transitionRegistry, transitionMaterial, packageNode, 'participation-check', input);
  const boundKey = schemaBinding.material.representationKey;
  const evidence = [];
  let unresolved = false;
  const roles = transitionRoleEntries(entry.projection);
  if (!roles.length) return Object.freeze({ qualification: 'contradictory', evidence: Object.freeze([]) });

  for (const role of roles) {
    const targetKind = String(role.fields?.['Target Kind'] || '');
    const constraint = String(role.fields?.['Schema Constraint'] || '');
    if (!constraint) {
      if (targetKind === 'non-artifact') evidence.push(Object.freeze({ group: role.group, entry: role.name, qualification: 'excluded-non-artifact' }));
      else unresolved = true;
      continue;
    }
    const resolved = resolveRoleSchemaConstraint(constraint, packageNode, transitionMaterial, input);
    if (resolved.qualification === 'resolved') {
      const representationKey = resolved.target?.representationKey || resolved.target?.material?.representationKey || '';
      evidence.push(Object.freeze({ group: role.group, entry: role.name, schemaConstraint: constraint, qualification: representationKey === boundKey ? 'match' : 'resolved-other', representationKey }));
      if (representationKey === boundKey) return Object.freeze({ qualification: 'consistent', evidence: Object.freeze(evidence) });
    } else {
      unresolved = true;
      evidence.push(Object.freeze({ group: role.group, entry: role.name, schemaConstraint: constraint, qualification: resolved.qualification }));
    }
  }
  return Object.freeze({ qualification: unresolved ? 'unresolved' : 'contradictory', evidence: Object.freeze(evidence) });
}

export function detectCompanionConflicts(companions, findings) {
  const bySchema = new Map();
  for (const companion of companions) {
    const key = String(companion.schemaBinding?.representationKey || '');
    if (companion.schemaBinding?.qualification !== 'resolved' || !key) continue;
    if (!bySchema.has(key)) bySchema.set(key, []);
    bySchema.get(key).push(companion);
  }
  const conflicts = new Set();
  for (const [schemaKey, values] of bySchema) {
    if (values.length <= 1) continue;
    conflicts.add(schemaKey);
    findings.push(portableFinding('error', 'portable.companion.binding.competing', 'More than one companion resolves to the same exact schema artifact inside one package compilation.', { schemaRepresentationKey: schemaKey, companions: values.map((item) => item.representationKey) }));
  }
  return conflicts;
}

export function compileAttachmentStates(nodes, companions, conflicts, materialIndex) {
  const bySchema = new Map();
  for (const companion of companions) {
    if (companion.schemaBinding?.qualification !== 'resolved') continue;
    const key = String(companion.schemaBinding?.representationKey || '');
    if (!key) continue;
    if (!bySchema.has(key)) bySchema.set(key, []);
    bySchema.get(key).push(companion);
  }
  const schemaKeys = unique(nodes.flatMap((node) => node.localSchemaKeys || []));
  return Object.freeze(schemaKeys.map((schemaKey) => {
    const material = materialIndex.byKey.get(schemaKey);
    const bound = bySchema.get(schemaKey) || [];
    let state = 'absent';
    if (conflicts.has(schemaKey)) state = 'competing';
    else if (bound.length === 1) state = bound[0].attachmentSet.explicitEmpty ? 'explicit-empty' : 'declared';
    return Object.freeze({
      schemaRepresentationKey: schemaKey,
      schemaId: material?.schemaId || '',
      path: material?.path || '',
      state,
      companions: Object.freeze(bound.map((item) => item.representationKey).sort(compare)),
      attachments: Object.freeze(bound.flatMap((item) => item.attachmentSet.attachments || []))
    });
  }).sort((a, b) => compare(a.schemaRepresentationKey, b.schemaRepresentationKey)));
}

export function finalizeTransitionRegistry(registry) {
  return Object.freeze([...registry.values()].map((entry) => Object.freeze({
    representationKey: entry.representationKey,
    path: entry.path,
    source: entry.source,
    references: entry.references,
    schemaId: entry.schemaId,
    representationQualification: entry.representationQualification,
    transitionIdentity: entry.transitionIdentity,
    canonicalIdentifier: entry.canonicalIdentifier,
    version: entry.version,
    projection: entry.projection,
    discoveryProvenance: Object.freeze([...entry.discoveryProvenance].sort(compareObject)),
    attachmentProvenance: Object.freeze([...entry.attachmentProvenance].sort(compareObject))
  })).sort((a, b) => compare(a.representationKey, b.representationKey)));
}

function resolveRoleSchemaConstraint(value, packageNode, transitionMaterial, input) {
  if (typeof input.resolveSchemaConstraint === 'function') {
    const custom = input.resolveSchemaConstraint({ value, packageNode, transitionMaterial, schemaResolutionIndex: input.schemaResolutionIndex, materials: input.materialIndex.materials });
    if (custom) return custom;
  }
  const resolution = schemaResolutionFor(input.schemaResolutionIndex, packageNode.manifestKey, String(value || '').trim());
  return Object.freeze({ qualification: resolution.qualification, target: resolution.target });
}

function transitionRoleEntries(projection = {}) {
  const groups = ['Input Role Declaration', 'Output Role Declaration'];
  const out = [];
  for (const parsed of projection.validation?.declarations || []) {
    const group = String(parsed.contract?.group || '');
    if (!groups.includes(group)) continue;
    for (const section of parsed.sections || []) {
      if (!section.present) continue;
      for (const entry of section.entries || []) if (entry.name !== 'none') out.push(Object.freeze({ group, name: entry.name, fields: entry.fields }));
    }
  }
  return out;
}

function ordinaryGroupMap(projection, groupName) {
  const group = (projection.ordinaryGroups || []).find((item) => exact(item.group) === exact(groupName));
  const out = {};
  for (const field of group?.fields || []) if (field.occurrences?.length === 1) out[field.label] = String(field.occurrences[0].value ?? '');
  return out;
}

function unique(values = []) { return [...new Set(values.map(String).filter(Boolean))]; }
function compare(a = '', b = '') { const left = String(a); const right = String(b); return left < right ? -1 : left > right ? 1 : 0; }
function compareObject(a = {}, b = {}) { return compare(JSON.stringify(a), JSON.stringify(b)); }
function exact(value = '') { return String(value || '').trim(); }
