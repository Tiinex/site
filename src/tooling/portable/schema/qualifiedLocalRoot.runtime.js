import { resolveSchemaModule } from '../../../schemas/resolver.js';
import {
  PORTABLE_QUALIFIED_LOCAL_ROOT_RUNTIME_PROJECTION_SCHEMA_ID,
  qualifiedLocalRootRuntimeProjection,
  projectPortableValidationContractWithQualifiedLocalRoot
} from './qualifiedLocalRoot.projection.js';

export { PORTABLE_QUALIFIED_LOCAL_ROOT_RUNTIME_PROJECTION_SCHEMA_ID, qualifiedLocalRootRuntimeProjection, projectPortableValidationContractWithQualifiedLocalRoot };

export function portableRuntimeValidationContractForSchema(schemaId = '', resolutionInput = null) {
  const resolution = resolutionInput || resolveSchemaModule({ schemaId });
  if (resolution?.fallbackUsed || !resolution?.module) return unavailable('registered-schema-resolution-unavailable', { resolution });
  const qualification = typeof resolution.module.schemaSource?.qualify === 'function' ? resolution.module.schemaSource.qualify() : null;
  const baseContract = qualification?.state === 'qualified' ? qualification?.compiledContract?.validationContract || null : null;
  if (!baseContract) return unavailable(qualification?.state === 'qualified' ? 'compiled-validation-contract-unavailable' : 'schema-source-unqualified', { resolution });
  const projected = projectPortableValidationContractWithQualifiedLocalRoot(baseContract);
  return deepFreeze({ ...projected, resolution, baseQualificationState: String(qualification?.state || 'unavailable') });
}

function unavailable(reason, extra = {}) {
  return deepFreeze({ state: 'unavailable', reason: String(reason || 'unavailable'), compiledContract: null, projection: qualifiedLocalRootRuntimeProjection(), ...extra });
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer) return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}
