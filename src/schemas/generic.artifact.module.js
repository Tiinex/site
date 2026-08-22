import { defineSchemaModule } from './contracts.js';
import { defineArtifactCreationCapability } from './creation.capability.js';
import { genericArtifactCreationImplementation } from './creation.renderer.js';

export function defineGenericArtifactSchemaModule({ id, label, parentSchemaId, summary, role = 'workflow-artifact', kind = 'concrete', binding, schemaSource }) {
  return defineSchemaModule({
    id,
    label,
    kind,
    role,
    parentSchemaId,
    summary,
    binding,
    schemaSource,
    artifactCreation: defineArtifactCreationCapability(binding, Object.freeze({ ...genericArtifactCreationImplementation, transitionTypes: Object.freeze(['create-artifact', 'continue-from-record']) })),
    present: (artifact = {}, context = {}) => Object.freeze({ title: artifact?.title || label, summary: artifact?.summary || summary, badges: Object.freeze(['concrete', id]), disclosure: context.degraded ? 'degraded' : 'normal' }),
    capabilities: Object.freeze({
      supportedSurfaces: Object.freeze(['feed', 'tree', 'detail', 'lineage', 'preview', 'share']),
      canRenderFallback: true,
      boundaries: Object.freeze(['Semantic validation comes from the qualified bundled schema contract; no schema-specific parallel interpreter is installed.'])
    }),
    read: Object.freeze({ label, sections: Object.freeze([]) }),
    viewActions: Object.freeze({ lineage: Object.freeze(['record.open', 'record.markdown', 'record.source']) })
  });
}
