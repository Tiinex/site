import { schemaRegistry } from './registry.js';
import { resolveSchemaModule as resolveRegisteredSchemaModule } from './resolver.js';
import { qualifyArtifactCreationCapability } from './creation.capability.js';

export const SCHEMA_CAPABILITY_REGISTRY_SCHEMA_ID = 'tiinex.schema.capability.registry.v1';
export const SCHEMA_CAPABILITY_DESCRIPTOR_SCHEMA_ID = 'tiinex.schema.capability.descriptor.v1';
export const SCHEMA_CAPABILITY_RESOLUTION_SCHEMA_ID = 'tiinex.schema.capability.resolution.v1';

export const CapabilityStatus = Object.freeze({
  implemented: 'implemented',
  partial: 'partial',
  unavailable: 'unavailable',
  fallback: 'fallback'
});

export const CoreSchemaSurfaces = Object.freeze(['feed', 'tree', 'detail', 'lineage', 'preview', 'share', 'graph']);
export const CoreSchemaActions = Object.freeze(['read', 'validate', 'present', 'create', 'continue', 'reference', 'fallback', 'findings', 'i18n', 'degrade']);

export function buildSchemaCapabilityRegistry(registry = schemaRegistry) {
  const modules = normalizeRegistryModules(registry).map((module) => describeSchemaCapabilities(module));
  const findings = validateSchemaCapabilityDescriptors(modules);
  return {
    schema: SCHEMA_CAPABILITY_REGISTRY_SCHEMA_ID,
    modules,
    counts: {
      modules: modules.length,
      implementedSurfaces: modules.reduce((sum, module) => sum + countByStatus(module.surfaces, CapabilityStatus.implemented), 0),
      implementedActions: modules.reduce((sum, module) => sum + countByStatus(module.actions, CapabilityStatus.implemented), 0),
      fallbackCapable: modules.filter((module) => module.actions.fallback?.status === CapabilityStatus.implemented).length,
      findings: findings.length,
      errors: findings.filter((finding) => finding.severity === 'error').length,
      warnings: findings.filter((finding) => finding.severity === 'warning').length
    },
    status: findings.some((finding) => finding.severity === 'error') ? 'invalid' : findings.some((finding) => finding.severity === 'warning') ? 'degraded' : 'clean',
    findings
  };
}

export function resolveSchemaCapabilities(input = {}, options = {}) {
  const resolution = resolveRegisteredSchemaModule({ schemaId: input.schemaId, checksum: input.checksum });
  const descriptor = describeSchemaCapabilities(resolution.module, { resolution, unresolvedSchemaId: resolution.unresolvedSchemaId || input.schemaId || '' });
  return {
    schema: SCHEMA_CAPABILITY_RESOLUTION_SCHEMA_ID,
    requested: {
      schemaId: input.schemaId || '',
      checksum: input.checksum || ''
    },
    status: resolution.status,
    fallbackUsed: Boolean(resolution.fallbackUsed),
    unresolvedSchemaId: resolution.unresolvedSchemaId || '',
    descriptor,
    capability: options.capability ? getCapability(descriptor, options.capability) : null
  };
}

export function describeSchemaCapabilities(module = {}, context = {}) {
  const capabilityInput = module.capabilities || {};
  const surfaces = makeSurfaceCapabilityMap(module, capabilityInput);
  const actions = makeActionCapabilityMap(module, capabilityInput);
  const implementation = {
    validate: typeof module.validate === 'function' || hasQualifiedCompiledValidation(module),
    present: typeof module.present === 'function',
    transitions: Boolean(module.transitions && (typeof module.transitions === 'function' || Object.keys(module.transitions || {}).length)),
    findings: Boolean(module.findings),
    i18n: Boolean(module.i18n)
  };
  const findings = validateSingleSchemaCapabilityDescriptor({ module, surfaces, actions, implementation, context });
  return {
    schema: SCHEMA_CAPABILITY_DESCRIPTOR_SCHEMA_ID,
    moduleId: module.id || '',
    label: module.label || module.id || 'Unknown schema module',
    kind: module.kind || 'unknown',
    role: module.role || '',
    parentSchemaId: module.parentSchemaId || null,
    binding: {
      schemaId: module.binding?.schemaId || '',
      checksum: module.binding?.checksum?.value || module.binding?.checksum || '',
      sourcePath: module.binding?.sourcePath || '',
      sourceRepository: module.binding?.sourceRepository || '',
      sourceCommit: module.binding?.sourceCommit || '',
      originTrustRole: module.binding?.originTrustRole || module.originTrustRole || ''
    },
    resolution: context.resolution ? {
      status: context.resolution.status || '',
      fallbackUsed: Boolean(context.resolution.fallbackUsed),
      unresolvedSchemaId: context.unresolvedSchemaId || context.resolution.unresolvedSchemaId || ''
    } : null,
    surfaces,
    actions,
    implementation,
    availability: summarizeAvailability({ surfaces, actions, findings }),
    boundaries: normalizeStringList(capabilityInput.boundaries),
    sourceAccess: normalizeStringList(capabilityInput.sourceAccess),
    fallback: normalizeFallbackPolicy(module, capabilityInput),
    findings
  };
}

export function getCapability(descriptor = {}, capabilityName = '') {
  const name = String(capabilityName || '').trim();
  if (!name) return null;
  return descriptor.actions?.[name] || descriptor.surfaces?.[name] || null;
}

export function validateSchemaCapabilityDescriptors(descriptors = []) {
  const findings = [];
  const seen = new Set();
  for (const descriptor of Array.isArray(descriptors) ? descriptors : []) {
    if (!descriptor.moduleId) findings.push(error('schema.capability.moduleId.missing', 'Schema capability descriptor is missing moduleId.'));
    if (seen.has(descriptor.moduleId)) findings.push(error('schema.capability.moduleId.duplicate', `Duplicate schema capability descriptor for ${descriptor.moduleId}.`));
    seen.add(descriptor.moduleId);
    findings.push(...(descriptor.findings || []));
  }
  return findings;
}

function normalizeRegistryModules(registry = {}) {
  if (Array.isArray(registry.modules)) return registry.modules;
  return Array.from(registry.byId?.values?.() || []);
}


function hasQualifiedCompiledValidation(module = {}) {
  const qualification = typeof module?.schemaSource?.qualify === 'function' ? module.schemaSource.qualify() : null;
  return Boolean(qualification?.state === 'qualified' && qualification?.compiledContract?.validationContract?.lineageQualification?.state === 'valid');
}

function makeSurfaceCapabilityMap(module = {}, capabilities = {}) {
  const explicit = new Set([
    ...normalizeStringList(capabilities.supportedSurfaces),
    ...normalizeStringList(capabilities.surfaces)
  ]);
  const surfaces = {};
  for (const surface of CoreSchemaSurfaces) {
    surfaces[surface] = capability(surface, explicit.has(surface) || (module.id === 'tiinex.root.v1' && surface !== 'graph'), explicit.has(surface) ? 'declared surface support' : 'core schema surface not declared');
  }
  for (const surface of explicit) {
    if (!surfaces[surface]) surfaces[surface] = capability(surface, true, 'declared schema/module surface');
  }
  return freezeCapabilityMap(surfaces);
}

function makeActionCapabilityMap(module = {}, capabilities = {}) {
  const declaredActions = new Set(normalizeStringList(capabilities.actions));
  const actions = {};
  actions.read = capability('read', Boolean(module.id && module.binding), 'registered module with binding');
  actions.validate = capability('validate', typeof module.validate === 'function' || hasQualifiedCompiledValidation(module), typeof module.validate === 'function' ? 'schema-specific validation implementation' : 'qualified compiled schema validation contract');
  actions.present = capability('present', typeof module.present === 'function', 'presentation implementation');
  const creation = qualifyArtifactCreationCapability(module, 'create-artifact');
  actions.create = capability('create', creation.ready || declaredActions.has('create-workspace'), creation.ready ? 'qualified schema creation authority + installed implementation' : 'ordinary creation requires semantic authority and implementation capability');
  actions.continue = capability('continue', false, 'canonical Transition Definition owns Continue applicability; companion transition metadata is non-authoritative');
  actions.reference = capability('reference', false, 'canonical Transition Definition owns Reference applicability; companion transition metadata is non-authoritative');
  actions.fallback = capability('fallback', capabilities.canRenderFallback === true || Boolean(capabilities.fallback) || module.id === 'tiinex.root.v1', 'fallback policy');
  actions.findings = capability('findings', Boolean(module.findings), 'findings companion');
  actions.i18n = capability('i18n', Boolean(module.i18n), 'i18n companion');
  actions.degrade = capability('degrade', actions.fallback.status === CapabilityStatus.implemented || typeof module.present === 'function', 'degraded projection via presenter/fallback');

  for (const action of declaredActions) {
    if (!actions[action]) actions[action] = capability(action, true, 'declared schema action');
  }
  return freezeCapabilityMap(actions);
}

function capability(name, supported, reason) {
  return Object.freeze({ name, status: supported ? CapabilityStatus.implemented : CapabilityStatus.unavailable, reason });
}

function freezeCapabilityMap(map) {
  return Object.freeze(Object.fromEntries(Object.entries(map).sort(([a], [b]) => a.localeCompare(b))));
}

function normalizeStringList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((item) => String(item || '').trim()).filter(Boolean);
  return [String(value).trim()].filter(Boolean);
}

function normalizeFallbackPolicy(module = {}, capabilities = {}) {
  if (module.id === 'tiinex.root.v1') return { status: CapabilityStatus.implemented, mode: 'root-envelope-display' };
  if (capabilities.canRenderFallback === true) return { status: CapabilityStatus.implemented, mode: 'module-fallback' };
  if (capabilities.fallback) return { status: CapabilityStatus.implemented, mode: String(capabilities.fallback) };
  return { status: CapabilityStatus.fallback, mode: 'root-fallback-available-through-registry' };
}

function summarizeAvailability({ surfaces = {}, actions = {}, findings = [] }) {
  const hasErrors = findings.some((finding) => finding.severity === 'error');
  const implementedActions = countByStatus(actions, CapabilityStatus.implemented);
  const implementedSurfaces = countByStatus(surfaces, CapabilityStatus.implemented);
  if (hasErrors) return 'invalid';
  if (implementedActions >= 3 && implementedSurfaces >= 1) return 'implemented';
  if (implementedActions || implementedSurfaces) return 'partial';
  return 'unavailable';
}

function countByStatus(map = {}, status = CapabilityStatus.implemented) {
  return Object.values(map || {}).filter((entry) => entry?.status === status).length;
}

function validateSingleSchemaCapabilityDescriptor({ module = {}, surfaces = {}, actions = {}, implementation = {}, context = {} }) {
  const findings = [];
  if (!module.id) findings.push(error('schema.capability.id.missing', 'Schema module is missing id.'));
  if (!module.binding?.schemaId) findings.push(error('schema.capability.binding.schemaId.missing', `${module.id || 'unknown module'} is missing binding.schemaId.`));
  if (!module.binding?.checksum?.value && !module.binding?.checksum) findings.push(error('schema.capability.binding.checksum.missing', `${module.id || 'unknown module'} is missing binding checksum.`));
  if (!implementation.validate) findings.push(warning('schema.capability.validate.missing', `${module.id || 'unknown module'} has no validate implementation.`));
  if (!implementation.present) findings.push(warning('schema.capability.present.missing', `${module.id || 'unknown module'} has no presenter implementation.`));
  if (module.id !== 'tiinex.root.v1' && actions.fallback?.status !== CapabilityStatus.implemented) {
    findings.push(info('schema.capability.rootFallback.available', `${module.id || 'unknown module'} relies on root fallback when its own module is unavailable.`));
  }
  if (context.resolution?.fallbackUsed) {
    findings.push(warning('schema.capability.rootFallback.used', `Requested schema ${context.unresolvedSchemaId || context.resolution.unresolvedSchemaId || 'unknown'} resolved through root fallback.`));
  }
  if (!Object.values(surfaces).some((surface) => surface.status === CapabilityStatus.implemented)) findings.push(warning('schema.capability.surface.none', `${module.id || 'unknown module'} declares no implemented surfaces.`));
  return findings;
}

function finding(severity, code, message) { return { severity, code, message, source: SCHEMA_CAPABILITY_REGISTRY_SCHEMA_ID }; }
function error(code, message) { return finding('error', code, message); }
function warning(code, message) { return finding('warning', code, message); }
function info(code, message) { return finding('info', code, message); }
