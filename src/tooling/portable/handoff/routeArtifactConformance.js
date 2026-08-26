import { validateArtifact } from '../../../validation/validateArtifact.js';
import { C14N_V2_METHOD_ID, canonicalC14nV2SelfState, verifyC14nV2TargetSelfDigest } from '../../../integrity/integrity.c14nV2.js';

export const HANDOFF_ROUTE_ARTIFACT_CONFORMANCE_SCHEMA_ID = 'tiinex.portable.handoff-route-artifact-conformance.v1';

const QUALIFIED_CONTRACT_STATES = new Set(['valid', 'valid-with-preserved-unknowns']);

export function qualifyTiinexRouteArtifact(input = {}) {
  const markdown = String(input.markdown || '');
  const expectedSchemaId = String(input.expectedSchemaId || '').trim();
  const requireExactContract = input.requireExactContract !== false;
  const validation = validateArtifact({ markdown });
  const parsed = validation.parsed || {};
  const findings = [];

  if (!expectedSchemaId) findings.push(finding('error', 'portable.route-artifact.expected-schema.missing', 'Route artifact qualification requires an expected declared schema identifier.'));
  else if (String(validation.schemaId || '') !== expectedSchemaId) findings.push(finding('error', 'portable.route-artifact.schema.mismatch', `Route artifact declares ${validation.schemaId || 'no Current Schema'} instead of required ${expectedSchemaId}.`, { expectedSchemaId, observedSchemaId: String(validation.schemaId || '') }));

  for (const item of validation.findings || []) {
    if (item.severity !== 'error') continue;
    if (input.allowPackageLocalParentOrigin === true && isPackageLocalParentOriginPublicationGap(item)) continue;
    findings.push(finding('error', item.code || 'portable.route-artifact.validation.error', item.message || 'Declared Tiinex contract validation failed.', { source: item.source || '', qualification: item.qualification || '' }));
  }

  if (requireExactContract) {
    if (!validation.contractValidation?.available) findings.push(finding('error', 'portable.route-artifact.contract.unavailable', `Exact registered contract validation is unavailable for ${expectedSchemaId || validation.schemaId || 'the declared schema'}.`));
    else if (!QUALIFIED_CONTRACT_STATES.has(String(validation.contractValidation.state || ''))) {
      const onlyPackageLocalOriginGap = input.allowPackageLocalParentOrigin === true
        && (validation.contractValidation?.result?.findings || validation.findings || []).filter((item) => item?.severity === 'error').every(isPackageLocalParentOriginPublicationGap);
      if (!onlyPackageLocalOriginGap) findings.push(finding('error', 'portable.route-artifact.contract.unqualified', `Declared Tiinex contract did not qualify: ${validation.contractValidation.state || 'unknown'}.`, { contractState: String(validation.contractValidation.state || '') }));
    }
  }

  const selfIntegrity = canonicalC14nV2SelfState(markdown);
  if (selfIntegrity.state !== 'verified') findings.push(finding('error', 'portable.route-artifact.integrity.self.unverified', `Exact route artifact self integrity is not verified: ${selfIntegrity.reason || selfIntegrity.state}.`, { integrityState: selfIntegrity.state, reason: selfIntegrity.reason || '' }));

  const parentQualification = qualifyParentContinuity({ parsed, markdown, resolveParent: input.resolveParent, parentMarkdown: input.parentMarkdown });
  findings.push(...parentQualification.findings);

  const status = findings.some((item) => item.severity === 'error') ? 'blocked' : 'qualified';
  return deepFreeze({
    schema: HANDOFF_ROUTE_ARTIFACT_CONFORMANCE_SCHEMA_ID,
    version: 1,
    status,
    expectedSchemaId,
    observedSchemaId: String(validation.schemaId || ''),
    contractState: validation.contractValidation?.available ? String(validation.contractValidation.state || 'unknown') : 'unavailable',
    validationState: String(validation.validation?.state || 'unknown'),
    selfIntegrity: projectSelfIntegrity(selfIntegrity),
    parentContinuity: parentQualification.projection,
    findings: Object.freeze(findings),
    boundary: 'Exact-byte Tiinex route-artifact qualification. Registered schema/Root validation and independently recomputed continuity integrity are qualification requirements; stored footer equality, package placement, filename, and carrier projections cannot override a schema or integrity failure.'
  });
}

export function qualifySelectedHandoffArtifact(input = {}) {
  return qualifyTiinexRouteArtifact({ ...input, expectedSchemaId: 'tiinex.handoff.v1', requireExactContract: true });
}

function qualifyParentContinuity({ parsed = {}, resolveParent, parentMarkdown = '' } = {}) {
  const findings = [];
  const parent = parsed?.envelope?.parent || {};
  const parentDeclared = Boolean(parent?.schema?.id || parent?.createdAt || parent?.trace || parent?.origin || parent?.originEntries?.length);
  if (!parentDeclared) return Object.freeze({ projection: Object.freeze({ state: 'not-required', parentDeclared: false, targetEntry: null, targetResolution: null }), findings: Object.freeze([]) });

  const targetEntries = (parsed?.integrity?.entries || []).filter((entry) => entry?.method === C14N_V2_METHOD_ID && entry?.towards && entry.towards !== 'self');
  const authorityTargets = parentAuthorityTargets(parent);
  const authorityMatches = targetEntries.filter((entry) => authorityTargets.includes(String(entry.towards || '')));
  let targetEntry = null;
  if (authorityMatches.length === 1) targetEntry = authorityMatches[0];
  else if (!authorityMatches.length && targetEntries.length === 1) targetEntry = targetEntries[0];
  else if (!targetEntries.length) findings.push(finding('error', 'portable.route-artifact.integrity.parent-target.missing', 'Parent-bearing route artifact is missing a c14n-v2 Parent-target integrity entry.'));
  else findings.push(finding('error', 'portable.route-artifact.integrity.parent-target.ambiguous', 'Parent-bearing route artifact has no unique c14n-v2 Parent-target integrity entry.', { targetEntryCount: targetEntries.length, authorityMatchCount: authorityMatches.length }));

  let targetResolution = null;
  if (targetEntry) {
    if (typeof resolveParent === 'function') {
      try { targetResolution = resolveParent({ parsed, parent, targetEntry }) || null; }
      catch (error) { targetResolution = Object.freeze({ state: 'error', reason: String(error?.message || error || 'parent-resolution-failed') }); }
    } else if (parentMarkdown) {
      targetResolution = Object.freeze({ state: 'qualified', markdown: String(parentMarkdown), basis: 'supplied-parent-markdown' });
    }
    if (!targetResolution || targetResolution.state !== 'qualified' || !targetResolution.markdown) {
      findings.push(finding('error', 'portable.route-artifact.integrity.parent-target.unresolved', 'Parent-target integrity cannot be independently qualified because the exact Parent representation is unavailable or ambiguous.', { targetState: String(targetResolution?.state || 'unavailable'), reason: String(targetResolution?.reason || '') }));
    } else {
      const verification = verifyC14nV2TargetSelfDigest({ value: targetEntry.value, targetMarkdown: targetResolution.markdown });
      targetResolution = Object.freeze({ ...targetResolution, verification });
      if (verification.state !== 'verified') findings.push(finding('error', 'portable.route-artifact.integrity.parent-target.unverified', `Parent-target integrity is not verified against the exact Parent representation: ${verification.reason || verification.state}.`, { targetState: verification.state, reason: verification.reason || '' }));
    }
  }

  return Object.freeze({
    projection: deepFreeze({
      state: findings.some((item) => item.severity === 'error') ? 'blocked' : 'qualified',
      parentDeclared: true,
      parentSchemaId: String(parent?.schema?.id || ''),
      trace: String(parent?.trace || ''),
      authorityTargets: Object.freeze(authorityTargets),
      targetEntry: targetEntry ? Object.freeze({ method: targetEntry.method, towards: targetEntry.towards, value: targetEntry.value }) : null,
      targetResolution: targetResolution ? projectTargetResolution(targetResolution) : null
    }),
    findings: Object.freeze(findings)
  });
}

function parentAuthorityTargets(parent = {}) {
  const targets = [];
  for (const entry of parent.originEntries || []) if (String(entry?.label || '').trim() === 'browse + git' && entry?.target) targets.push(String(entry.target));
  if (parent.trace) targets.push(String(parent.trace));
  return [...new Set(targets.filter(Boolean))];
}

function projectSelfIntegrity(state = {}) {
  return Object.freeze({ state: String(state.state || 'unknown'), reason: String(state.reason || ''), declaredValue: String(state.declaredValue || ''), computedValue: String(state.computedValue || '') });
}

function projectTargetResolution(value = {}) {
  return Object.freeze({
    state: String(value.state || 'unknown'),
    reason: String(value.reason || ''),
    basis: String(value.basis || ''),
    workspaceRelativePath: String(value.workspaceRelativePath || ''),
    packagePath: String(value.packagePath || ''),
    sha256: String(value.sha256 || ''),
    verification: value.verification ? Object.freeze({ state: String(value.verification.state || ''), reason: String(value.verification.reason || ''), expectedValue: String(value.verification.expectedValue || ''), targetValue: String(value.verification.targetValue || ''), computedTargetValue: String(value.verification.computedTargetValue || '') }) : null
  });
}


function isPackageLocalParentOriginPublicationGap(item = {}) {
  const code = String(item?.code || '');
  const message = String(item?.message || '');
  return code === 'portable.contract.conditional.field.required.missing' && /Parent Origin:\s*browse \+ git/i.test(message);
}

function finding(severity, code, message, extra = {}) { return Object.freeze({ severity, code, message, ...extra }); }
function deepFreeze(value) { if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value; if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer) return value; for (const child of Object.values(value)) deepFreeze(child); return Object.freeze(value); }
