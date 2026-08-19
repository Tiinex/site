import { portableFinding } from '../findings.js';
import { projectPortableContractInstance } from '../schema/contract.project.js';
import {
  extractQualifiedMarkdownLinkTarget,
  indexPortableMaterials,
  isAbsoluteReference,
  portableFieldDomainOccurrenceQualification,
  relativePathEscapesBoundary,
  resolvePortableMaterialReference
} from './material.graph.js';
import {
  PORTABLE_EXPLICIT_GENERATION_BINDING_QUALIFICATION_SCHEMA_ID,
  emptyGenerationBindingResolution,
  finalizeGenerationBindingQualification,
  generationBindingMaterialEvidence,
  projectGenerationAuthority,
  projectGenerationBindingFindings,
  projectGenerationBindingResolution
} from './generation.binding.projection.js';

export { PORTABLE_EXPLICIT_GENERATION_BINDING_QUALIFICATION_SCHEMA_ID };
export const GENERATION_AUTHORITY_SCHEMA_ID = 'tiinex.schema.generation.v1';

const freeze = Object.freeze;
const NONE = freeze([]);

/**
 * Qualify one explicit Transition Output Role Generation Binding against an
 * explicitly supplied material graph and exact supplied schema authorities.
 *
 * This seam is deliberately read-only. It resolves/proves authority and
 * projects generation requirements; it does not authorize creation, decide
 * Transition applicability, materialize bytes, choose placement, or persist.
 */
export function qualifyPortableExplicitGenerationBinding(input = {}) {
  const findings = [];
  const materials = Array.isArray(input.materials) ? input.materials : [];
  const materialIndex = indexPortableMaterials(materials);
  const transitionKey = suppliedRepresentationKey(input.transitionMaterial || input.declaringMaterial || input.transition || {});
  const outputRoleName = token(input.outputRoleName || input.outputRole || '');
  const expectedTargetSchema = token(input.expectedTargetSchema || '');

  if (materialIndex.representationKeyConflicts.length) {
    findings.push(portableFinding('error', 'portable.generation-binding.material-identity.ambiguous', 'Supplied material graph contains duplicate representation keys; explicit Generation Binding qualification fails closed.', {
      conflicts: materialIndex.representationKeyConflicts
    }));
    return finalizeGenerationBindingQualification({ qualification: 'invalid', declaredBinding: '', outputRoleName, expectedTargetSchema, findings, resolution: emptyGenerationBindingResolution('invalid', 'material-identity-ambiguous') });
  }

  if (!transitionKey || !materialIndex.byKey.has(transitionKey)) {
    findings.push(portableFinding('warning', 'portable.generation-binding.declaring-material.unresolved', 'Declaring Transition representation is not exactly present in the supplied material graph.', { representationKey: transitionKey }));
    return finalizeGenerationBindingQualification({ qualification: 'unresolved', declaredBinding: '', outputRoleName, expectedTargetSchema, findings, resolution: emptyGenerationBindingResolution('unresolved', 'declaring-material-unresolved') });
  }
  const declaringMaterial = materialIndex.byKey.get(transitionKey);

  const transitionContract = input.transitionContract || input.contracts?.transitionDefinition || null;
  if (!transitionContract || token(transitionContract.schemaId) !== 'tiinex.transition.definition.v1') {
    findings.push(portableFinding('warning', 'portable.generation-binding.transition-authority.unresolved', 'Exact compiled Transition Definition contract authority was not supplied.', { representationKey: transitionKey }));
    return finalizeGenerationBindingQualification({ qualification: 'unresolved', declaredBinding: '', outputRoleName, expectedTargetSchema, declaringMaterial, findings, resolution: emptyGenerationBindingResolution('unresolved', 'transition-authority-unresolved') });
  }

  let transitionProjection;
  try {
    transitionProjection = projectPortableContractInstance({
      markdown: declaringMaterial.markdown,
      compiledContract: transitionContract,
      resolvers: input.resolvers || {}
    });
  } catch (error) {
    findings.push(portableFinding('error', 'portable.generation-binding.transition-projection.failed', 'Declaring Transition representation could not be projected through the supplied Transition Definition authority.', {
      representationKey: transitionKey,
      error: String(error?.message || error)
    }));
    return finalizeGenerationBindingQualification({ qualification: 'invalid', declaredBinding: '', outputRoleName, expectedTargetSchema, declaringMaterial, findings, resolution: emptyGenerationBindingResolution('invalid', 'transition-projection-failed') });
  }

  const roleResolution = exactOutputRole(transitionProjection, outputRoleName);
  if (roleResolution.qualification !== 'resolved') {
    findings.push(portableFinding(roleResolution.qualification === 'ambiguous' ? 'error' : 'warning', `portable.generation-binding.output-role.${roleResolution.qualification}`, roleResolution.finding, {
      outputRoleName,
      representationKey: transitionKey,
      candidateCount: roleResolution.candidates.length
    }));
    return finalizeGenerationBindingQualification({ qualification: roleResolution.qualification, declaredBinding: '', outputRoleName, expectedTargetSchema, declaringMaterial, findings, resolution: emptyGenerationBindingResolution(roleResolution.qualification, roleResolution.finding) });
  }

  const role = roleResolution.role;
  const declaredBinding = token(role.fields?.['Generation Binding']);
  const declaredTargetSchema = token(role.fields?.['Schema Constraint']);
  const expectedSchema = expectedTargetSchema || declaredTargetSchema;

  if (!declaredBinding) {
    findings.push(portableFinding('warning', 'portable.generation-binding.declaration.missing', 'Selected Output Role does not declare Generation Binding.', { outputRoleName }));
    return finalizeGenerationBindingQualification({ qualification: 'unresolved', declaredBinding, outputRoleName, expectedTargetSchema: expectedSchema, declaringMaterial, findings, resolution: emptyGenerationBindingResolution('unresolved', 'generation-binding-missing') });
  }
  if (declaredBinding === 'target-schema') {
    findings.push(portableFinding('error', 'portable.generation-binding.declaration.not-explicit-reference', 'This qualifier owns explicit Generation Binding references only; target-schema remains on the existing target-schema path.', { outputRoleName }));
    return finalizeGenerationBindingQualification({ qualification: 'invalid', declaredBinding, outputRoleName, expectedTargetSchema: expectedSchema, declaringMaterial, findings, resolution: emptyGenerationBindingResolution('invalid', 'target-schema-not-owned') });
  }
  if (!expectedSchema) {
    findings.push(portableFinding('warning', 'portable.generation-binding.expected-target-schema.unresolved', 'Expected output Target Schema is not supplied or declared by the selected Output Role.', { outputRoleName }));
    return finalizeGenerationBindingQualification({ qualification: 'unresolved', declaredBinding, outputRoleName, expectedTargetSchema: expectedSchema, declaringMaterial, findings, resolution: emptyGenerationBindingResolution('unresolved', 'expected-target-schema-unresolved') });
  }
  if (expectedTargetSchema && declaredTargetSchema && expectedTargetSchema !== declaredTargetSchema) {
    findings.push(portableFinding('error', 'portable.generation-binding.expected-target-schema.contradiction', 'Caller expected Target Schema disagrees with the selected Transition Output Role Schema Constraint.', {
      outputRoleName,
      expectedTargetSchema,
      declaredTargetSchema
    }));
    return finalizeGenerationBindingQualification({ qualification: 'invalid', declaredBinding, outputRoleName, expectedTargetSchema: expectedSchema, declaringMaterial, findings, resolution: emptyGenerationBindingResolution('invalid', 'expected-target-schema-contradiction') });
  }

  const shapeQualification = portableFieldDomainOccurrenceQualification(
    transitionProjection,
    'Output Role Declaration',
    'Generation Binding',
    declaredBinding,
    outputRoleName
  );
  if (shapeQualification !== 'core') {
    const invalid = transitionProjection.validation?.findings?.some((item) => item.code === 'portable.contract.field-domain.value.invalid' && item.field === 'Generation Binding');
    findings.push(portableFinding(invalid ? 'error' : 'warning', invalid ? 'portable.generation-binding.reference-shape.invalid' : 'portable.generation-binding.reference-shape.unresolved', invalid
      ? 'Generation Binding is not a canonical machine-qualified Markdown reference.'
      : 'Generation Binding Markdown-reference shape authority is unresolved.', {
      outputRoleName,
      declaredBinding,
      shapeQualification
    }));
    return finalizeGenerationBindingQualification({ qualification: invalid ? 'invalid' : 'unresolved', declaredBinding, outputRoleName, expectedTargetSchema: expectedSchema, declaringMaterial, findings, resolution: emptyGenerationBindingResolution(invalid ? 'invalid' : 'unresolved', 'reference-shape-not-qualified') });
  }

  const target = extractQualifiedMarkdownLinkTarget(declaredBinding);
  if (!target) {
    findings.push(portableFinding('error', 'portable.generation-binding.reference-target.invalid', 'Machine-qualified Generation Binding did not decompose into one reference target.', { declaredBinding }));
    return finalizeGenerationBindingQualification({ qualification: 'invalid', declaredBinding, outputRoleName, expectedTargetSchema: expectedSchema, declaringMaterial, findings, resolution: emptyGenerationBindingResolution('invalid', 'reference-target-invalid') });
  }

  const resolved = resolveGenerationAuthorityReference({
    materialIndex,
    declaringMaterial,
    target,
    packageGraph: input.packageGraph || input.packageContext?.packageGraph || input.packageContext?.graph || null
  });
  const resolution = projectGenerationBindingResolution(resolved);
  if (resolved.qualification !== 'resolved') {
    findings.push(portableFinding(resolved.qualification === 'invalid' || resolved.qualification === 'ambiguous' ? 'error' : 'warning', `portable.generation-binding.reference.${resolved.qualification}`, resolved.finding || 'Generation Binding target did not resolve exactly.', {
      target,
      outputRoleName,
      packageQualification: resolved.packageQualification || 'not-applied'
    }));
    return finalizeGenerationBindingQualification({ qualification: resolved.qualification, declaredBinding, outputRoleName, expectedTargetSchema: expectedSchema, declaringMaterial, findings, resolution });
  }

  const authorityMaterial = resolved.candidates[0];
  if (token(authorityMaterial.schemaId) !== GENERATION_AUTHORITY_SCHEMA_ID) {
    findings.push(portableFinding('error', 'portable.generation-binding.authority-schema.invalid', 'Resolved Generation Binding target is not exactly a tiinex.schema.generation.v1 artifact.', {
      target,
      observedSchemaId: token(authorityMaterial.schemaId),
      representationKey: authorityMaterial.representationKey
    }));
    return finalizeGenerationBindingQualification({ qualification: 'invalid', declaredBinding, outputRoleName, expectedTargetSchema: expectedSchema, declaringMaterial, findings, resolution });
  }

  const generationContract = input.generationContract || input.contracts?.generation || input.contracts?.schemaGeneration || null;
  if (!generationContract || token(generationContract.schemaId) !== GENERATION_AUTHORITY_SCHEMA_ID) {
    findings.push(portableFinding('warning', 'portable.generation-binding.generation-contract.unresolved', 'Exact compiled tiinex.schema.generation.v1 schema authority was not supplied.', {
      representationKey: authorityMaterial.representationKey
    }));
    return finalizeGenerationBindingQualification({ qualification: 'unresolved', declaredBinding, outputRoleName, expectedTargetSchema: expectedSchema, declaringMaterial, findings, resolution });
  }
  if (generationContract.lineageQualification?.state !== 'valid' || generationContract.lineageQualification?.complete !== true) {
    findings.push(portableFinding('warning', 'portable.generation-binding.generation-contract.lineage-unresolved', 'Supplied generation schema authority does not prove a complete valid schema lineage.', {
      lineageQualification: generationContract.lineageQualification || null
    }));
    return finalizeGenerationBindingQualification({ qualification: 'unresolved', declaredBinding, outputRoleName, expectedTargetSchema: expectedSchema, declaringMaterial, findings, resolution });
  }

  let generationProjection;
  try {
    generationProjection = projectPortableContractInstance({
      markdown: authorityMaterial.markdown,
      compiledContract: generationContract,
      resolvers: input.resolvers || {}
    });
  } catch (error) {
    findings.push(portableFinding('error', 'portable.generation-binding.authority-validation.failed', 'Resolved generation authority could not be validated/projected through the supplied exact generation schema authority.', {
      representationKey: authorityMaterial.representationKey,
      error: String(error?.message || error)
    }));
    return finalizeGenerationBindingQualification({ qualification: 'invalid', declaredBinding, outputRoleName, expectedTargetSchema: expectedSchema, declaringMaterial, findings, resolution });
  }

  const validationStatus = token(generationProjection.validation?.status);
  if (!['valid', 'valid-with-preserved-unknowns'].includes(validationStatus)) {
    const qualification = validationStatus === 'incomplete' ? 'incomplete' : validationStatus === 'unresolved' ? 'unresolved' : 'invalid';
    findings.push(portableFinding(qualification === 'unresolved' ? 'warning' : 'error', 'portable.generation-binding.authority.invalid', `Resolved generation authority does not validate as qualified generation authority: ${validationStatus || 'unresolved'}.`, {
      representationKey: authorityMaterial.representationKey,
      validationStatus,
      validationFindings: projectGenerationBindingFindings(generationProjection.validation?.findings || [])
    }));
    return finalizeGenerationBindingQualification({ qualification, declaredBinding, outputRoleName, expectedTargetSchema: expectedSchema, declaringMaterial, findings, resolution });
  }

  const projected = projectGenerationAuthority(generationProjection);
  if (!projected.complete) {
    findings.push(portableFinding('error', 'portable.generation-binding.authority.surface.incomplete', 'Generation authority validated but required planner-facing generation surfaces were not uniquely projectable.', {
      representationKey: authorityMaterial.representationKey,
      missing: projected.missing
    }));
    return finalizeGenerationBindingQualification({ qualification: 'incomplete', declaredBinding, outputRoleName, expectedTargetSchema: expectedSchema, declaringMaterial, findings, resolution });
  }
  if (projected.targetSchema !== expectedSchema) {
    findings.push(portableFinding('error', 'portable.generation-binding.target-schema.mismatch', 'Generation authority Target Schema does not exactly match the Transition Output Role expected schema.', {
      expectedTargetSchema: expectedSchema,
      generationTargetSchema: projected.targetSchema,
      representationKey: authorityMaterial.representationKey
    }));
    return finalizeGenerationBindingQualification({ qualification: 'invalid', declaredBinding, outputRoleName, expectedTargetSchema: expectedSchema, declaringMaterial, findings, resolution });
  }

  const authority = freeze({
    schema: 'tiinex.portable.generation-authority-projection.v1',
    selectedRepresentation: generationBindingMaterialEvidence(authorityMaterial),
    authoritySchemaId: GENERATION_AUTHORITY_SCHEMA_ID,
    validationStatus,
    generationTargetSchema: projected.targetSchema,
    targetOutput: projected.targetOutput,
    generationIdentity: projected.generationIdentity,
    requiredInputs: projected.requiredInputs,
    generationSteps: projected.generationSteps,
    outputBoundary: projected.outputBoundary,
    interpretationLimits: projected.interpretationLimits,
    boundary: freeze({
      generationGuidanceOnly: true,
      creationAuthorized: false,
      transitionApplicabilityEvaluated: false,
      invocationExecuted: false,
      relationMaterialized: false,
      placementDecided: false,
      persistencePerformed: false
    })
  });

  return finalizeGenerationBindingQualification({ qualification: 'qualified', declaredBinding, outputRoleName, expectedTargetSchema: expectedSchema, declaringMaterial, findings, resolution, authority });
}

function resolveGenerationAuthorityReference({ materialIndex, declaringMaterial, target, packageGraph }) {
  const graphNodes = Array.isArray(packageGraph?.nodes) ? packageGraph.nodes : [];
  let declaringNode = null;
  let packageQualification = 'not-applied';

  if (graphNodes.length) {
    const declaringNodes = graphNodes.filter((node) => (node.localMaterialKeys || []).includes(declaringMaterial.representationKey));
    if (declaringNodes.length !== 1) {
      return freeze({
        qualification: declaringNodes.length > 1 ? 'ambiguous' : 'unresolved',
        target,
        escaped: false,
        candidates: NONE,
        finding: declaringNodes.length > 1
          ? 'Declaring material belongs to more than one active package-local material set.'
          : 'Declaring material is not local to any active package node.',
        packageQualification: declaringNodes.length > 1 ? 'ambiguous' : 'unresolved'
      });
    }
    declaringNode = declaringNodes[0];
    packageQualification = 'applied';
    if (!isAbsoluteReference(target) && relativePathEscapesBoundary(declaringMaterial, target, declaringNode.packageRoot)) {
      return freeze({ qualification: 'invalid', target, escaped: true, candidates: NONE, finding: 'Relative Generation Binding escapes the declaring semantic package boundary.', packageQualification });
    }
  }

  const resolved = resolvePortableMaterialReference(materialIndex, declaringMaterial, target);
  if (resolved.qualification !== 'resolved') return freeze({ ...resolved, packageQualification });
  if (!declaringNode) return freeze({ ...resolved, packageQualification });

  const candidate = resolved.candidates[0];
  const targetNodes = graphNodes.filter((node) => (node.localMaterialKeys || []).includes(candidate.representationKey));
  if (targetNodes.length !== 1) {
    return freeze({
      qualification: targetNodes.length > 1 ? 'ambiguous' : 'unresolved',
      target: resolved.target,
      escaped: resolved.escaped,
      candidates: resolved.candidates,
      finding: targetNodes.length > 1
        ? 'Resolved generation target belongs to more than one active package-local material set.'
        : 'Resolved generation target is not reachable as one package-local material representation.',
      packageQualification: targetNodes.length > 1 ? 'ambiguous' : 'unresolved'
    });
  }

  const targetNode = targetNodes[0];
  if (!isAbsoluteReference(target) && targetNode.manifestKey !== declaringNode.manifestKey) {
    return freeze({ qualification: 'invalid', target: resolved.target, escaped: resolved.escaped, candidates: resolved.candidates, finding: 'Relative Generation Binding crosses a declared semantic package boundary.', packageQualification: 'invalid' });
  }
  if (isAbsoluteReference(target) && !(declaringNode.reachablePackageKeys || []).includes(targetNode.manifestKey)) {
    return freeze({ qualification: 'unresolved', target: resolved.target, escaped: resolved.escaped, candidates: resolved.candidates, finding: 'Absolute Generation Binding target is not reachable through the active explicit package graph.', packageQualification: 'unresolved' });
  }
  return freeze({ ...resolved, packageQualification: 'resolved', declaringPackageKey: declaringNode.manifestKey, targetPackageKey: targetNode.manifestKey });
}

function exactOutputRole(projection = {}, outputRoleName = '') {
  if (!outputRoleName) return freeze({ qualification: 'unresolved', role: null, candidates: NONE, finding: 'Output Role name is required for exact Generation Binding qualification.' });
  const parsed = (projection.validation?.declarations || []).find((item) => token(item.contract?.group) === 'Output Role Declaration');
  const candidates = (parsed?.sections || []).flatMap((section) => section.present ? section.entries : []).filter((entry) => token(entry.name) === outputRoleName);
  if (candidates.length === 1) return freeze({ qualification: 'resolved', role: candidates[0], candidates: freeze([...candidates]), finding: '' });
  return freeze({ qualification: candidates.length > 1 ? 'ambiguous' : 'unresolved', role: null, candidates: freeze([...candidates]), finding: candidates.length > 1 ? `Output Role ${outputRoleName} occurs more than once.` : `Output Role ${outputRoleName} is not present.` });
}

function suppliedRepresentationKey(material = {}) {
  return token(material.representationId || material.representationKey || material.id || '');
}

function token(value = '') { return String(value || '').trim(); }
