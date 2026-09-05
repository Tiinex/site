import { buildArtifactCreationContract } from './creation.contracts.js';
import { resolveSchemaCapabilities, CapabilityStatus } from './capability.registry.js';

export const SCHEMA_FACTORY_VIEWER_CREATE_ACTION_KIND = 'schema-factory-viewer-create';
export const SCHEMA_FACTORY_VIEWER_PROJECTION_SCHEMA_ID = 'tiinex.site.schema-factory-viewer-projection.v1';

export function projectSchemaFactoryViewerCreateAction(schemaId = '') {
  const cleanSchemaId = String(schemaId || '').trim();
  const resolution = resolveSchemaCapabilities({ schemaId: cleanSchemaId });
  const descriptor = resolution?.descriptor || {};
  const factory = descriptor.factory || {};
  const contract = buildArtifactCreationContract({ schemaId: cleanSchemaId, transitionType: 'create-artifact' });
  const inputDescriptors = (contract.creation?.requiredInputs || []).map((name) => projectInputDescriptor(name, contract, factory));
  const generationReady = Boolean(
    cleanSchemaId
    && resolution?.fallbackUsed !== true
    && factory?.generation?.ready === true
    && factory?.creation?.authorityState === 'qualified'
    && contract.status === 'ready'
  );
  const invocableCreate = Boolean(
    generationReady
    && descriptor?.actions?.create?.status === CapabilityStatus.implemented
    && factory?.invocation?.create?.state === 'qualified'
  );
  const ready = invocableCreate;
  const label = contract.target?.label || descriptor.label || cleanSchemaId || 'Artifact';
  return Object.freeze({
    schema: SCHEMA_FACTORY_VIEWER_PROJECTION_SCHEMA_ID,
    kind: SCHEMA_FACTORY_VIEWER_CREATE_ACTION_KIND,
    id: `schema-factory:create:${cleanSchemaId}`,
    definitionKey: `schema-factory:create:${cleanSchemaId}`,
    label: `Create ${label}`,
    description: `Create one standalone browser-local ${label} directly from its qualified Artifact Creation Contract. This does not imply or synthesize a canonical Transition Definition.`,
    icon: 'create',
    productScope: 'workspace',
    continuityMode: 'root',
    productCapable: ready,
    enabled: ready,
    transitionAuthority: Object.freeze({
      state: factory?.invocation?.create?.state || 'unavailable',
      authority: 'canonical-transition-definition',
      boundary: 'Invocable Create requires separately qualified Transition Definition applicability; Artifact Creation Contract authority alone is generation authority.'
    }),
    capability: Object.freeze({
      state: ready ? 'qualified' : generationReady ? 'generation-qualified-transition-unavailable' : 'unavailable',
      scope: 'workspace',
      read: descriptor?.actions?.read?.status || CapabilityStatus.unavailable,
      validate: descriptor?.actions?.validate?.status || CapabilityStatus.unavailable,
      generationAuthority: factory?.generation?.authorityState || 'unavailable',
      generationImplementation: factory?.generation?.implementationState || 'unavailable',
      generationReady,
      invocableCreate: factory?.invocation?.create?.state || 'unavailable',
      create: descriptor?.actions?.create?.status || CapabilityStatus.unavailable,
      present: descriptor?.actions?.present?.status || CapabilityStatus.unavailable,
      factoryAuthority: factory?.creation?.authorityState || 'unavailable',
      contractStatus: contract.status || 'blocked'
    }),
    authoring: Object.freeze({
      schemaId: cleanSchemaId,
      schemaLabel: label,
      creationContractId: contract.id,
      requiredInputs: Object.freeze([...(contract.creation?.requiredInputs || [])]),
      optionalInputs: Object.freeze([...(contract.creation?.optionalInputs || [])]),
      inputBindings: Object.freeze((contract.creation?.inputBindings || []).map(freezeJson)),
      inputDescriptors: Object.freeze(inputDescriptors),
      factoryDescriptorSchema: factory?.schema || '',
      builderDescriptor: freezeJson(factory)
    }),
    findings: Object.freeze([...(contract.findings || []), ...(factory.findings || []).map((message) => ({ severity: 'warning', code: 'schema-factory.viewer.factory-finding', message: String(message) }))]),
    boundary: 'Viewer product projection only. Schema meaning, creation shape, validation, inheritance, and structured declaration semantics remain owned by the qualified shared schema factory and canonical schema material.'
  });
}

export function projectSchemaFactoryViewerCreateActions(schemaIds = []) {
  return Object.freeze([...new Set((Array.isArray(schemaIds) ? schemaIds : []).map((item) => String(item || '').trim()).filter(Boolean))]
    .map(projectSchemaFactoryViewerCreateAction)
    .filter((action) => action.productCapable));
}

export function isSchemaFactoryViewerCreateAction(action = {}) {
  return action?.kind === SCHEMA_FACTORY_VIEWER_CREATE_ACTION_KIND;
}

export function initialSchemaFactoryAuthoringValues(action = {}) {
  const descriptors = Array.isArray(action?.authoring?.inputDescriptors) ? action.authoring.inputDescriptors : [];
  return Object.freeze(Object.fromEntries(descriptors.map((descriptor) => [descriptor.name, initialValueForDescriptor(descriptor)])));
}

export function normalizeSchemaFactoryAuthoringValues(action = {}, values = {}) {
  const descriptors = Array.isArray(action?.authoring?.inputDescriptors) ? action.authoring.inputDescriptors : [];
  const normalized = {};
  for (const descriptor of descriptors) {
    const value = values?.[descriptor.name];
    if (descriptor.kind === 'ordinary-group') {
      normalized[descriptor.name] = compactStructuredFields(value, descriptor);
      continue;
    }
    if (descriptor.kind === 'named-declaration-section') {
      if (value === 'none' && descriptor.allowLiteralNone) { normalized[descriptor.name] = 'none'; continue; }
      normalized[descriptor.name] = (Array.isArray(value) ? value : []).map((entry) => Object.freeze({
        name: String(entry?.name || '').trim(),
        fields: compactStructuredFields(entry?.fields, descriptor)
      }));
      continue;
    }
    normalized[descriptor.name] = value;
  }
  return Object.freeze(normalized);
}

export function firstMissingSchemaFactoryAuthoringInput(action = {}, values = {}) {
  const descriptors = Array.isArray(action?.authoring?.inputDescriptors) ? action.authoring.inputDescriptors : [];
  for (const descriptor of descriptors) {
    const value = values?.[descriptor.name];
    if (descriptor.kind === 'ordinary-group') {
      const missing = descriptor.requiredFields.find((field) => !nonBlank(value?.[field]));
      if (missing) return `${descriptor.name} · ${missing}`;
      continue;
    }
    if (descriptor.kind === 'named-declaration-section') {
      if (value === 'none' && descriptor.allowLiteralNone) continue;
      if (!Array.isArray(value) || !value.length) return descriptor.name;
      for (const entry of value) {
        if (!nonBlank(entry?.name)) return `${descriptor.name} · declaration name`;
        const missing = descriptor.requiredFields.find((field) => !nonBlank(entry?.fields?.[field]));
        if (missing) return `${descriptor.name} · ${missing}`;
      }
      continue;
    }
    if (!nonBlank(value)) return descriptor.name;
  }
  return '';
}

function projectInputDescriptor(name, contract, factory) {
  const binding = (contract.creation?.inputBindings || []).find((item) => String(item?.input || '') === String(name || '')) || {};
  const group = String(binding.group || binding.section || '');
  const declaration = (factory.declarations || []).find((item) => String(item?.group || '') === group) || null;
  const section = (factory.sections || []).find((item) => String(item?.group || '') === group) || null;
  const shape = declaration || section || {};
  return Object.freeze({
    name: String(name || ''),
    kind: String(binding.kind || 'scalar'),
    section: String(binding.section || ''),
    group,
    field: String(binding.field || ''),
    required: true,
    requiredFields: Object.freeze([...(shape.requiredFields || binding.requiredFields || [])]),
    optionalFields: Object.freeze([...(shape.optionalFields || binding.optionalFields || [])]),
    allowLiteralNone: Boolean(declaration?.allowLiteralNone || binding.allowLiteralNone),
    sourceSchemaId: String(binding.sourceSchemaId || ''),
    qualification: 'derived-from-qualified-factory-binding'
  });
}

function initialValueForDescriptor(descriptor = {}) {
  if (descriptor.kind === 'ordinary-group') return Object.freeze(Object.fromEntries(descriptor.requiredFields.map((field) => [field, ''])));
  if (descriptor.kind === 'named-declaration-section') {
    if (descriptor.allowLiteralNone) return 'none';
    return Object.freeze([Object.freeze({ name: '', fields: Object.freeze(Object.fromEntries(descriptor.requiredFields.map((field) => [field, '']))) })]);
  }
  return '';
}

function compactStructuredFields(value = {}, descriptor = {}) {
  const source = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  const out = {};
  for (const field of [...descriptor.requiredFields, ...descriptor.optionalFields]) {
    if (!Object.prototype.hasOwnProperty.call(source, field)) continue;
    const text = String(source[field] ?? '').trim();
    if (!text && descriptor.optionalFields.includes(field)) continue;
    out[field] = text;
  }
  return Object.freeze(out);
}

function nonBlank(value) { return value !== undefined && value !== null && String(value).trim() !== ''; }
function freezeJson(value) {
  if (!value || typeof value !== 'object') return value;
  if (Array.isArray(value)) return Object.freeze(value.map(freezeJson));
  return Object.freeze(Object.fromEntries(Object.entries(value).map(([key, item]) => [key, freezeJson(item)])));
}
