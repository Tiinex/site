export function creationSchemaReferenceValidationContext(exactContract = {}, parentRecord = null) {
  return Object.freeze({
    envelope: exactContract?.schemaReferences?.envelope || null,
    current: exactContract?.schemaReferences?.current || null,
    parent: parentRecord?.schemaReferenceAuthority || null
  });
}
