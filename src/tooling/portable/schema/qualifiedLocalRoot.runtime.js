import { parseArtifactMarkdown } from '../../../artifacts/artifact.parse.js';
import { resolveSchemaModule } from '../../../schemas/resolver.js';
import { qualifySchemaReferenceValue, schemaReferenceAuthorityFromBinding } from '../../../schemas/schema.reference.js';
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

export function portableRuntimeValidationAuthorityForRecord(record = {}) {
  const markdown = String(record?.markdown || '');
  const parsed = parseArtifactMarkdown(markdown);
  const declaredSchema = parsed?.envelope?.current?.schema || {};
  const schemaId = String(declaredSchema.id || record?.schemaId || record?.currentSchemaId || '').trim();
  const runtime = portableRuntimeValidationContractForSchema(schemaId);
  if (runtime.state !== 'qualified' || !runtime.compiledContract) {
    return unavailableAuthority(schemaId, runtime, ['Registered compiled validation authority is unavailable for the declared Current Schema.']);
  }

  const findings = [];
  const currentModule = runtime.resolution?.module || null;
  const currentQualification = typeof currentModule?.schemaSource?.qualify === 'function' ? currentModule.schemaSource.qualify() : null;
  const currentBinding = currentModule?.binding || {};
  const localWorkspaceAuthority = isQualifiedLocalUnpublishedAuthority(currentBinding, currentQualification);
  let currentReferenceState = 'unavailable';
  let currentReferenceBasis = 'unavailable';

  if (!declaredSchema.id || declaredSchema.id !== schemaId) {
    findings.push(`Current Schema identity is unavailable or contradictory for ${schemaId || '(missing schema id)'}.`);
  } else if (localWorkspaceAuthority) {
    currentReferenceState = 'qualified';
    currentReferenceBasis = 'qualified-workspace-local-authority';
  } else if (declaredSchema.form === 'plain-schema-id') {
    findings.push(`Current Schema ${schemaId} declares no version-bearing locator and no qualified local workspace authority supersedes that omission.`);
    currentReferenceBasis = 'schema-id-only-version-unresolved';
  } else {
    const referenceAuthority = schemaReferenceAuthorityFromBinding(schemaId, currentBinding, currentQualification?.authority || null, currentQualification);
    const referenceQualification = qualifySchemaReferenceValue(String(declaredSchema.raw || ''), referenceAuthority);
    if (referenceQualification.state === 'qualified' && referenceQualification.targetState === 'qualified') {
      currentReferenceState = 'qualified';
      currentReferenceBasis = 'declared-current-schema-exact-source-target';
    } else {
      findings.push(...(referenceQualification.findings || []).map((item) => `Current Schema authority: ${item}`));
      currentReferenceBasis = 'declared-current-schema-target-unqualified';
    }
  }

  const lineage = Array.isArray(runtime.compiledContract?.lineage) ? runtime.compiledContract.lineage : [];
  const projectedLineageAuthority = Array.isArray(runtime.compiledContract?.lineageAuthority) ? runtime.compiledContract.lineageAuthority : [];
  if (!lineage.length || runtime.compiledContract?.lineageQualification?.state !== 'valid') {
    findings.push('Compiled validation lineage is unavailable or not valid.');
  }
  if (projectedLineageAuthority.length !== lineage.length) {
    findings.push(`Compiled validation lineage source authority is unavailable for ${schemaId || '(unknown schema)'}.`);
  }

  const lineageAuthorities = projectedLineageAuthority.map((entry) => Object.freeze({
    schemaId: String(entry?.schemaId || ''),
    sourceRepository: String(entry?.source?.repository || '').trim(),
    sourceCommit: String(entry?.source?.commit || '').trim().toLowerCase(),
    sourcePath: String(entry?.source?.path || '').trim(),
    publicationState: String(entry?.source?.publicationState || '').trim(),
    snapshotCompleteness: String(entry?.source?.snapshotCompleteness || '').trim(),
    parentSchemaId: String(entry?.parentSchemaId || '').trim(),
    parentSourceCandidates: Object.freeze((entry?.parentSourceCandidates || []).map((candidate) => Object.freeze({
      repository: String(candidate?.repository || '').trim(),
      commit: String(candidate?.commit || '').trim().toLowerCase(),
      path: String(candidate?.path || '').trim()
    })))
  }));

  // A qualified local unpublished current-schema module is itself the Axiom-approved
  // bounded workspace authority for its compiled validation contract. Its local
  // lineage may intentionally supersede published parent locators, so do not
  // reinterpret those edges through today's registry. For published/current
  // authority, every compiled lineage edge must remain source-coherent.
  if (!localWorkspaceAuthority) {
    for (let index = 1; index < lineageAuthorities.length; index += 1) {
      const parent = lineageAuthorities[index - 1];
      const child = lineageAuthorities[index];
      if (!child.parentSchemaId || child.parentSchemaId !== parent.schemaId) {
        findings.push(`Compiled lineage identity is incoherent across ${parent.schemaId || '(unknown parent)'} -> ${child.schemaId || '(unknown child)'}.`);
        continue;
      }
      if (isQualifiedLocalUnpublishedSource(parent)) continue;
      const candidates = child.parentSourceCandidates || [];
      if (candidates.length !== 1) {
        findings.push(candidates.length
          ? `Declared parent source authority is ambiguous for ${child.schemaId}: ${candidates.length} exact pinned candidates.`
          : `Declared parent source authority is unavailable for ${child.schemaId} -> ${parent.schemaId}.`);
        continue;
      }
      const expected = candidates[0];
      if (!sameSourceTuple(parent, expected)) {
        findings.push(`Compiled lineage substitutes source authority for ${child.schemaId} -> ${parent.schemaId}: declared ${expected.repository || '(unknown repo)'}@${expected.commit || '(unknown commit)'}/${expected.path || '(unknown path)'} but compiled ${parent.sourceRepository || '(unknown repo)'}@${parent.sourceCommit || '(unknown commit)'}/${parent.sourcePath || '(unknown path)'}.`);
      }
    }
  }

  const qualified = currentReferenceState === 'qualified' && findings.length === 0;
  return deepFreeze({
    schema: 'tiinex.portable.runtime-validation-authority.v1',
    state: qualified ? 'qualified' : 'unavailable',
    reason: qualified ? '' : 'exact-schema-authority-or-lineage-unqualified',
    schemaId,
    currentReference: Object.freeze({ state: currentReferenceState, basis: currentReferenceBasis, raw: String(declaredSchema.raw || ''), target: String(declaredSchema.target || '') }),
    lineage: Object.freeze(lineageAuthorities),
    findings: Object.freeze(findings),
    resolution: runtime.resolution,
    compiledContract: qualified ? runtime.compiledContract : null,
    baseQualificationState: runtime.baseQualificationState || 'unavailable'
  });
}

function sameSourceTuple(actual = {}, expected = {}) {
  return String(actual?.sourceRepository || '') === String(expected?.repository || '')
    && String(actual?.sourceCommit || '').toLowerCase() === String(expected?.commit || '').toLowerCase()
    && String(actual?.sourcePath || '') === String(expected?.path || '');
}

function isQualifiedLocalUnpublishedSource(source = {}) {
  return String(source?.publicationState || '').trim().toLowerCase() === 'accepted-local-unpublished'
    && String(source?.snapshotCompleteness || '').trim() === 'exact-axiom-canonical-unpublished-bounded-workspace-contract';
}

function isQualifiedLocalUnpublishedAuthority(binding = {}, qualification = null) {
  const publicationState = String(binding?.publicationState || '').trim().toLowerCase();
  const snapshotCompleteness = String(binding?.snapshotCompleteness || '').trim();
  return qualification?.state === 'qualified'
    && publicationState === 'accepted-local-unpublished'
    && snapshotCompleteness === 'exact-axiom-canonical-unpublished-bounded-workspace-contract';
}

function unavailableAuthority(schemaId = '', runtime = {}, findings = []) {
  return deepFreeze({
    schema: 'tiinex.portable.runtime-validation-authority.v1',
    state: 'unavailable',
    reason: String(runtime?.reason || 'exact-schema-authority-or-lineage-unqualified'),
    schemaId: String(schemaId || ''),
    currentReference: Object.freeze({ state: 'unavailable', basis: 'unavailable', raw: '', target: '' }),
    lineage: Object.freeze([]),
    findings: Object.freeze(findings),
    resolution: runtime?.resolution || null,
    compiledContract: null,
    baseQualificationState: String(runtime?.baseQualificationState || 'unavailable')
  });
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
