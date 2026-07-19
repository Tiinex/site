export function normalizeArtifact(parsedArtifact, schemaResolution, validation = []) {
  return {
    title: parsedArtifact.title,
    schemaId: parsedArtifact.envelope.current.schema.id || 'unknown',
    envelopeSchemaId: parsedArtifact.envelope.envelopeSchema.id || 'unknown',
    moduleId: schemaResolution.module.id,
    resolutionStatus: schemaResolution.status,
    fallbackUsed: schemaResolution.fallbackUsed,
    createdAt: parsedArtifact.envelope.current.createdAt || 'unknown',
    parentSchemaId: parsedArtifact.envelope.parent.schema.id || null,
    sections: parsedArtifact.body.sections,
    validation
  };
}
