import { createRootFallbackModel } from '../schemas/root.fallback.js';
import { schemaBadgeClass, schemaKey } from '../schemas/root.classify.js';

export function normalizeArtifact(parsedArtifact, schemaResolution, validation = []) {
  const currentSchemaId = parsedArtifact.envelope.current.schema.id || 'unknown';
  const fallbackModel = createRootFallbackModel(parsedArtifact, schemaResolution, validation);
  return {
    title: parsedArtifact.title,
    schemaId: currentSchemaId,
    envelopeSchemaId: parsedArtifact.envelope.envelopeSchema.id || 'unknown',
    moduleId: schemaResolution.module.id,
    resolutionStatus: schemaResolution.status,
    fallbackUsed: schemaResolution.fallbackUsed,
    createdAt: parsedArtifact.envelope.current.createdAt || 'unknown',
    parentSchemaId: parsedArtifact.envelope.parent.schema.id || null,
    trace: parsedArtifact.envelope.parent.trace || '',
    traceLabel: parsedArtifact.envelope.parent.traceLabel || '',
    origin: parsedArtifact.envelope.parent.origin || parsedArtifact.envelope.origin || '',
    boundary: parsedArtifact.envelope.parent.boundary || parsedArtifact.envelope.boundary || '',
    schemaKey: schemaKey(currentSchemaId),
    badgeClass: schemaBadgeClass(currentSchemaId),
    rootReadable: fallbackModel.rootReadable,
    rootDisclosure: fallbackModel.disclosure,
    fallbackModel,
    sections: parsedArtifact.body.sections,
    validation
  };
}
