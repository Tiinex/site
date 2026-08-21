import { resolveSchemaModule as resolveRegisteredSchemaModule } from './resolver.js';
import { inspectCreationRepresentation } from './creation.representation.js';
import { qualifySchemaReferenceValue, schemaReferenceAuthorityFromBinding } from './schema.reference.js';

export function schemaReferenceAuthoritiesForCreation(targetModule = null) {
  const root = resolveRegisteredSchemaModule({ schemaId: 'tiinex.root.v1' });
  const rootModule = root?.fallbackUsed ? null : root?.module || null;
  return Object.freeze({
    envelope: schemaReferenceAuthorityFromBinding('tiinex.root.v1', rootModule?.binding || {}, qualifiedSourceAuthority(rootModule)),
    current: schemaReferenceAuthorityFromBinding(String(targetModule?.id || ''), targetModule?.binding || {}, qualifiedSourceAuthority(targetModule))
  });
}

export function qualifyCreationSchemaReferences(markdown = '', contract = {}) {
  const observed = inspectCreationRepresentation(markdown);
  const authorities = contract?.schemaReferences || {};
  const envelopeValue = observed.envelopeSchema.length === 1 ? observed.envelopeSchema[0] : '';
  const currentValue = observed.currentSchema.length === 1 ? observed.currentSchema[0] : '';
  const envelope = qualifySchemaReferenceValue(envelopeValue, authorities.envelope || { schemaId: 'tiinex.root.v1', exactTargets: [] });
  const current = qualifySchemaReferenceValue(currentValue, authorities.current || { schemaId: String(contract?.target?.schemaId || ''), exactTargets: [] });
  const findings = Object.freeze([...(envelope.findings || []).map((item) => `Envelope Schema: ${item}`), ...(current.findings || []).map((item) => `Current Schema: ${item}`)]);
  return Object.freeze({ state: findings.length ? 'unavailable' : 'qualified', envelope, current, findings });
}

function qualifiedSourceAuthority(module = null) {
  const qualified = typeof module?.schemaSource?.qualify === 'function' ? module.schemaSource.qualify() : null;
  return qualified?.state === 'qualified' ? qualified.authority || null : null;
}
