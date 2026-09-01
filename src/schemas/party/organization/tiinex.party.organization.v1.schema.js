import { defineSchemaModule } from '../../contracts.js';
import binding from './tiinex.party.organization.v1.schema.json' with { type: 'json' };
import { schemaSource } from './tiinex.party.organization.v1.schema.source.js';

export const partyOrganizationSchemaModule = defineSchemaModule({
  id: 'tiinex.party.organization.v1',
  label: 'Party Organization',
  kind: 'concrete',
  role: 'party-organization-artifact',
  parentSchemaId: 'tiinex.party.v1',
  summary: "Schema for an organization, company, institution, department, unit, or formal organizational party without treating the reference as legal proof or representation authority.",
  binding,
  schemaSource,
  capabilities: Object.freeze({
    supportedSurfaces: Object.freeze(['feed', 'tree', 'detail', 'lineage', 'preview', 'share']),
    canRenderFallback: true,
    boundaries: Object.freeze(['Read companion only; canonical Docs schema bytes remain semantic authority.'])
  }),
  read: Object.freeze({
    label: 'Party Organization',
    sections: Object.freeze(['Organization Identity', 'Organization Boundary', 'Unit Or Parent Relationship', 'Representation Boundary', 'Interpretation Limits'])
  }),
  viewActions: Object.freeze({
    lineage: Object.freeze(['record.open', 'record.markdown', 'record.source'])
  })
});
