import { defineSchemaModule } from '../../contracts.js';
import binding from './tiinex.project.v1.schema.json' with { type: 'json' };
import { schemaSource } from './tiinex.project.v1.schema.source.js';

export const projectSchemaModule = defineSchemaModule({
  id: 'tiinex.project.v1',
  label: 'Project',
  kind: 'concrete',
  role: 'coordination-project-artifact',
  parentSchemaId: 'tiinex.root.v1',
  summary: "Schema for a bounded coordinated effort over time with purpose, scope, parties, resources, tasks, events, milestones, decisions, risks, and outcomes without making one project methodology the base concept.",
  binding,
  schemaSource,
  capabilities: Object.freeze({
    supportedSurfaces: Object.freeze(['feed', 'tree', 'detail', 'lineage', 'preview', 'share']),
    canRenderFallback: true,
    boundaries: Object.freeze(['Read companion only; canonical Docs schema bytes remain semantic authority.'])
  }),
  read: Object.freeze({
    label: 'Project',
    sections: Object.freeze(['Project Identity', 'Project Purpose And Scope', 'Parties And Resources', 'Coordination State', 'Milestones And Outcomes', 'Interpretation Limits'])
  }),
  viewActions: Object.freeze({
    lineage: Object.freeze(['record.open', 'record.markdown', 'record.source'])
  })
});
