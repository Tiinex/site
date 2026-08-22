import { resolveSchemaModule as resolveRegisteredSchemaModule } from './resolver.js';
import { inspectCreationRepresentation } from './creation.representation.js';
import { qualifySchemaReferenceMaterialCoherence, qualifySchemaReferenceValue, schemaReferenceAuthorityFromBinding } from './schema.reference.js';

export function schemaReferenceAuthoritiesForCreation(targetModule = null, explicit = null) {
  const root = resolveRegisteredSchemaModule({ schemaId: 'tiinex.root.v1' });
  const rootModule = root?.fallbackUsed ? null : root?.module || null;
  const rootQualification = qualifiedSourceQualification(rootModule);
  const targetQualification = qualifiedSourceQualification(targetModule);
  const defaults = {
    envelope: schemaReferenceAuthorityFromBinding('tiinex.root.v1', rootModule?.binding || {}, rootQualification?.authority || null, rootQualification),
    current: schemaReferenceAuthorityFromBinding(String(targetModule?.id || ''), targetModule?.binding || {}, targetQualification?.authority || null, targetQualification)
  };
  return Object.freeze({
    envelope: explicitSchemaReferenceAuthority(explicit?.envelope, defaults.envelope),
    current: explicitSchemaReferenceAuthority(explicit?.current, defaults.current)
  });
}

export function explicitSchemaReferenceAuthority(value = null, fallback = {}) {
  if (!value) return fallback;
  const schemaId = String(value.schemaId || fallback.schemaId || '').trim();
  const exactTargets = [...new Set([
    ...(Array.isArray(value.exactTargets) ? value.exactTargets : []),
    value.preferredTarget || value.target || ''
  ].map((item) => String(item || '')).filter(Boolean))];
  const preferredTarget = String(value.preferredTarget || value.target || exactTargets[0] || '').trim();
  const fallbackTargets = Object.freeze([...(fallback.exactTargets || [])]);
  const materialBoundTarget = Boolean(preferredTarget && fallback?.materialBoundTarget === true && fallbackTargets.includes(preferredTarget));
  return Object.freeze({
    ...fallback,
    schemaId,
    exactTargets: Object.freeze(exactTargets),
    preferredTarget,
    targetAuthority: exactTargets.length ? 'explicit-exact-reference' : String(fallback.targetAuthority || 'schema-id-only'),
    resolutionState: String(value.resolutionState || value.state || (materialBoundTarget ? 'qualified' : 'unresolved')),
    resolutionEvidence: Object.freeze({ ...(materialBoundTarget ? fallback.resolutionEvidence || {} : {}), ...(value.resolutionEvidence || value.evidence || {}) }),
    semanticSourceTargets: fallbackTargets,
    materialBoundTarget,
    semanticMaterialIdentity: fallback.semanticMaterialIdentity || Object.freeze({ state: 'unavailable' })
  });
}

export function qualifyCreationSchemaReferences(markdown = '', contract = {}) {
  const observed = inspectCreationRepresentation(markdown);
  const authorities = contract?.schemaReferences || {};
  const envelopeValue = observed.envelopeSchema.length === 1 ? observed.envelopeSchema[0] : '';
  const currentValue = observed.currentSchema.length === 1 ? observed.currentSchema[0] : '';
  const envelope = qualifyResolvedSchemaReference(envelopeValue, authorities.envelope || { schemaId: 'tiinex.root.v1', exactTargets: [] });
  const current = qualifyResolvedSchemaReference(currentValue, authorities.current || { schemaId: String(contract?.target?.schemaId || ''), exactTargets: [] });
  const findings = Object.freeze([...(envelope.findings || []).map((item) => `Envelope Schema: ${item}`), ...(current.findings || []).map((item) => `Current Schema: ${item}`)]);
  return Object.freeze({ state: findings.length ? 'unavailable' : 'qualified', envelope, current, findings });
}

function qualifyResolvedSchemaReference(value, authority) {
  const lexical = qualifySchemaReferenceValue(value, authority);
  const material = qualifySchemaReferenceMaterialCoherence(authority);
  const findings = [...(lexical.findings || []), ...(material.findings || [])];
  return Object.freeze({ ...lexical, state: findings.length ? 'unavailable' : 'qualified', resolutionState: authority?.resolutionState || '', materialCoherence: material, findings: Object.freeze(findings) });
}

function qualifiedSourceQualification(module = null) {
  const qualified = typeof module?.schemaSource?.qualify === 'function' ? module.schemaSource.qualify() : null;
  return qualified?.state === 'qualified' ? qualified : null;
}
