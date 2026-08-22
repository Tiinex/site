export function buildPortableCreationQualification({ exactContract, exactRendererApplied, localContinuityRendererApplied = false, exactRendererParentCompatible, localContinuityParentCompatible = false, exactResultQualification, exactParentQualification, hasDeclaredParent, hasCompleteParent, schemaMaterial, validation, allowIncomplete, blocked }) {
  const exactAvailable = exactContract.status === 'ready';
  return Object.freeze({
    blocked,
    exactCreateTooling: Boolean(exactRendererApplied),
    exactCreateToolingAvailable: exactAvailable,
    exactCreateToolingApplied: Boolean(exactRendererApplied),
    exactCreationResultQualification: String(exactResultQualification?.state || (exactRendererApplied ? 'qualified' : 'not-run')),
    parentAuthorityQualification: String(exactParentQualification?.state || 'unqualified'),
    parentAuthorityReason: String(exactParentQualification?.reason || ''),
    localContinuityUsable: Boolean(localContinuityRendererApplied),
    localContinuityAuthorityConflict: Boolean(localContinuityRendererApplied && localContinuityParentCompatible),
    readableChildSchema: Boolean(schemaMaterial),
    creationMode: exactRendererApplied
      ? 'exact-site-creation-contract'
      : localContinuityRendererApplied
        ? 'local-relative-continuity-authority-conflict'
        : schemaMaterial
          ? hasCompleteParent ? 'llm-writer-from-readable-schema' : 'readable-schema-root-writer'
          : 'unavailable',
    exactRuntimeValidation: Boolean(validation?.qualification?.exactRuntimeValidation),
    contractDrivenStructuralValidation: Boolean(validation?.qualification?.contractDrivenStructuralValidation),
    incompleteDraftAllowed: allowIncomplete,
    remoteWrite: false,
    sourceMutation: false,
    limitations: Object.freeze([
      ...(!exactAvailable ? ['Exact child creation renderer is unavailable; the draft was rendered from readable schema structure and remains partially qualified.'] : []),
      ...(exactAvailable && !exactRendererApplied && !hasDeclaredParent ? ['The exact shared renderer was available but could not be applied at the requested continuity mode; portable tooling did not invent a Parent or alternate creation semantics.'] : []),
      ...(localContinuityRendererApplied ? [`Local continuity is represented with exact relative Trace and labeled relative Origin, while exact Parent qualification remains unresolved (${exactParentQualification?.reason || 'parent-authority-unresolved'}). No missing publication or reference authority is fabricated.`] : []),
      ...(exactAvailable && !exactRendererParentCompatible && hasDeclaredParent && !localContinuityParentCompatible ? [`The supplied Parent is not qualified for exact continuation (${exactParentQualification?.reason || 'parent-unqualified'}); portable tooling did not rewrite or synthesize Parent identity.`] : []),
      ...(hasDeclaredParent && !hasCompleteParent ? ['The supplied Parent declaration was incomplete and draft creation was blocked rather than inventing missing continuity or provenance fields.'] : []),
      ...(validation?.qualification?.limitations || []),
      ...(allowIncomplete ? ['Incomplete placeholders may remain and must not be treated as a qualified artifact.'] : [])
    ])
  });
}


export function portableParentRecordHasAnyValue(parent = {}) {
  return Boolean(parent.id || parent.path || parent.kind || parent.schemaId || parent.currentSchemaId || parent.continuationTrace || parent.currentCreatedAt || parent.createdAt || parent.boundary || parent.sourceMode || parent.source || parent.publishedReference?.target || parent.schemaReferenceAuthority?.preferredTarget);
}

export function portableParentRecordIsComplete(parent = {}) {
  return Boolean((parent.schemaId || parent.currentSchemaId) && (parent.continuationTrace || parent.id) && parent.path);
}
