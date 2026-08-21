import { sha256Hex, utf8Bytes } from '../export/package.bytes.js';
import { qualifyGithubSchemaSourceProvider } from './schema.githubSourceTarget.js';

export const BUNDLED_SCHEMA_SOURCE_SCHEMA_ID = 'tiinex.site.bundled-schema-source.v1';
export const SCHEMA_RUNTIME_PROJECTION_SCHEMA_ID = 'tiinex.site.schema-runtime-projection.v1';

export function defineBundledSchemaSource(binding = {}, projection = {}, options = {}) {
  const schemaId = String(binding?.schemaId || '').trim();
  const expectedChecksum = String(binding?.checksum?.value || binding?.checksum || '').trim();
  const baseAuthority = Object.freeze({
    repository: String(binding?.sourceRepository || '').trim(),
    commit: String(binding?.sourceCommit || '').trim(),
    path: String(binding?.sourcePath || '').trim(),
    blobSha: String(binding?.sourceBlobSha || '').trim(),
    checksum: expectedChecksum
  });
  const providerQualification = qualifyGithubSchemaSourceProvider(binding, baseAuthority);
  const authority = Object.freeze({
    ...baseAuthority,
    provider: providerQualification.state === 'qualified' ? providerQualification.provider : '',
    providerQualification
  });
  const runtimeProjection = normalizeRuntimeProjection(projection);
  let cached = null;
  function qualify() {
    if (cached) return cached;
    const projectionExact = Boolean(
      runtimeProjection.schema === SCHEMA_RUNTIME_PROJECTION_SCHEMA_ID
      && schemaId
      && expectedChecksum
      && runtimeProjection.schemaId === schemaId
      && runtimeProjection.sourceChecksum === expectedChecksum
      && runtimeProjection.bindingChecksum === expectedChecksum
    );
    const validationContract = projectionExact && runtimeProjection.validationContract?.schemaId === schemaId && runtimeProjection.validationContract?.lineageQualification?.state === 'valid'
      ? runtimeProjection.validationContract
      : null;
    const compiledContract = projectionExact ? Object.freeze({
      schemaId,
      validationContract,
      creation: Object.freeze({
        groups: Object.freeze((runtimeProjection.creation.groupNames || []).map((name) => Object.freeze({ name }))),
        requiredInputs: runtimeProjection.creation.requiredInputs,
        optionalInputs: runtimeProjection.creation.optionalInputs,
        requiredSections: runtimeProjection.creation.requiredSections,
        toolingConfigurationFields: runtimeProjection.creation.toolingConfigurationFields,
        inputBindings: runtimeProjection.creation.inputBindings,
        requiredShape: runtimeProjection.creation.requiredShape
      })
    }) : null;
    cached = Object.freeze({
      state: projectionExact ? 'qualified' : 'unavailable',
      schemaId,
      checksum: runtimeProjection.sourceChecksum || '',
      expectedChecksum,
      authority,
      compiledContract,
      projection: runtimeProjection,
      findings: Object.freeze([
        ...(runtimeProjection.schema !== SCHEMA_RUNTIME_PROJECTION_SCHEMA_ID ? ['Schema runtime projection type is invalid.'] : []),
        ...(runtimeProjection.schemaId !== schemaId ? ['Schema runtime projection identity does not match binding.'] : []),
        ...(runtimeProjection.sourceChecksum !== expectedChecksum ? ['Schema runtime projection source checksum does not match binding.'] : []),
        ...(runtimeProjection.bindingChecksum !== expectedChecksum ? ['Schema runtime projection binding checksum does not match binding.'] : []),
        ...(runtimeProjection.validationContract && runtimeProjection.validationContract?.schemaId !== schemaId ? ['Schema runtime validation projection identity does not match binding.'] : []),
        ...(runtimeProjection.validationContract && runtimeProjection.validationContract?.lineageQualification?.state !== 'valid' ? ['Schema runtime validation projection lineage is not exact/valid.'] : [])
      ])
    });
    return cached;
  }
  return Object.freeze({
    schema: BUNDLED_SCHEMA_SOURCE_SCHEMA_ID,
    status: schemaId && expectedChecksum && runtimeProjection.schemaId ? 'bundled' : 'unavailable',
    readable: Boolean(schemaId && options.assetUrl),
    schemaId,
    markdown: '',
    bundledPath: String(options.bundledPath || binding?.sourcePath || '').trim(),
    sourceLabel: String(options.sourceLabel || 'Viewer schema registry').trim(),
    assetUrl: String(options.assetUrl || '').trim(),
    expectedChecksum,
    authority,
    runtimeProjection,
    qualify
  });
}

export function qualifyBundledSchemaSource(source = null) {
  return typeof source?.qualify === 'function'
    ? source.qualify()
    : Object.freeze({ state: 'unavailable', schemaId: String(source?.schemaId || ''), compiledContract: null, findings: Object.freeze(['Schema source qualification owner is unavailable.']) });
}

export function qualifyBundledSchemaReadableText(source = null, markdown = '') {
  const sourceQualification = qualifyBundledSchemaSource(source);
  const text = String(markdown ?? '');
  const checksum = text ? sha256Hex(utf8Bytes(text)) : '';
  const exact = Boolean(
    sourceQualification.state === 'qualified'
    && text
    && checksum === String(source?.expectedChecksum || '')
    && checksum === String(sourceQualification.checksum || '')
  );
  return Object.freeze({
    state: exact ? 'qualified' : 'unavailable',
    schemaId: String(source?.schemaId || ''),
    checksum,
    expectedChecksum: String(source?.expectedChecksum || ''),
    authority: source?.authority || null,
    markdown: exact ? text : '',
    sourceQualification,
    findings: Object.freeze([
      ...(!text ? ['Bundled schema readable source is empty.'] : []),
      ...(text && checksum !== String(source?.expectedChecksum || '') ? ['Bundled schema readable source checksum does not match binding.'] : [])
    ])
  });
}

export function qualifiedCreationAuthorityFromSchemaSource(module = {}) {
  const source = module?.schemaSource || null;
  const binding = module?.binding || {};
  const schemaId = String(module?.id || '').trim();
  const qualification = qualifyBundledSchemaSource(source);
  const compiled = qualification?.compiledContract || null;
  const exact = Boolean(
    qualification?.state === 'qualified'
    && schemaId
    && String(qualification.schemaId || '') === schemaId
    && String(binding.schemaId || '') === schemaId
    && String(qualification.checksum || '')
    && String(qualification.checksum || '') === String(binding.checksum?.value || binding.checksum || '')
    && String(qualification.authority?.path || '') === String(binding.sourcePath || '')
    && String(qualification.authority?.commit || '') === String(binding.sourceCommit || '')
    && String(compiled?.schemaId || '') === schemaId
  );
  const creationGroups = exact && Array.isArray(compiled?.creation?.groups) ? compiled.creation.groups : [];
  const declared = creationGroups.length > 0;
  return Object.freeze({
    state: exact && declared ? 'qualified' : 'unavailable',
    schemaId,
    contractSection: 'Artifact Creation Contract',
    sourceStatus: qualification?.state || 'unavailable',
    checksum: String(qualification?.checksum || ''),
    sourcePath: String(qualification?.authority?.path || ''),
    sourceRepository: String(qualification?.authority?.repository || ''),
    sourceCommit: String(qualification?.authority?.commit || ''),
    compiledContract: exact ? compiled : null,
    contractDeclared: declared
  });
}

function normalizeRuntimeProjection(value = {}) {
  const creation = value?.creation || {};
  return Object.freeze({
    schema: String(value?.schema || ''),
    generator: String(value?.generator || ''),
    schemaId: String(value?.schemaId || '').trim(),
    sourceChecksum: String(value?.sourceChecksum || '').trim(),
    sourceBytes: Number(value?.sourceBytes || 0),
    bindingChecksum: String(value?.bindingChecksum || '').trim(),
    validationContract: freezeRuntimeValidationContract(value?.validationContract || {}),
    creation: Object.freeze({
      declared: Boolean(creation?.declared),
      groupNames: Object.freeze([...(creation?.groupNames || [])].map((item) => String(item || '')).filter(Boolean)),
      requiredInputs: Object.freeze([...(creation?.requiredInputs || [])].map((item) => String(item || '')).filter(Boolean)),
      optionalInputs: Object.freeze([...(creation?.optionalInputs || [])].map((item) => String(item || '')).filter(Boolean)),
      requiredSections: Object.freeze([...(creation?.requiredSections || [])].map((item) => String(item || '')).filter(Boolean)),
      toolingConfigurationFields: Object.freeze([...(creation?.toolingConfigurationFields || [])].map((item) => String(item || '')).filter(Boolean)),
      inputBindings: Object.freeze([...(creation?.inputBindings || [])].map((item) => Object.freeze({ input: String(item?.input || '').trim(), kind: String(item?.kind || '').trim(), section: String(item?.section || '').trim() })).filter((item) => item.input)),
      requiredShape: Object.freeze([...(creation?.requiredShape || [])].map((item) => Object.freeze({ id: String(item?.id || ''), sourceSchemaId: String(item?.sourceSchemaId || ''), group: String(item?.group || ''), category: String(item?.category || ''), line: Number(item?.line || 0), sourceText: String(item?.sourceText || ''), primitive: Object.freeze({ kind: String(item?.primitive?.kind || 'residual'), input: String(item?.primitive?.input || ''), section: String(item?.primitive?.section || '') }) })).filter((item) => item.id))
    })
  });
}


function freezeRuntimeValidationContract(value = {}) {
  return deepFreezeJson({
    schema: String(value?.schema || ''),
    schemaId: String(value?.schemaId || '').trim(),
    lineage: Array.isArray(value?.lineage) ? value.lineage : [],
    lineageQualification: value?.lineageQualification || {},
    validation: value?.validation || {},
    declarations: Array.isArray(value?.declarations) ? value.declarations : [],
    constraints: Array.isArray(value?.constraints) ? value.constraints : []
  });
}

function deepFreezeJson(value) {
  if (!value || typeof value !== 'object') return value;
  if (Array.isArray(value)) return Object.freeze(value.map(deepFreezeJson));
  const out = {};
  for (const [key, item] of Object.entries(value)) out[key] = deepFreezeJson(item);
  return Object.freeze(out);
}
