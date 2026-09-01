import { defineSchemaModule } from '../contracts.js';
import binding from './tiinex.party.v1.schema.json' with { type: 'json' };
import { schemaSource } from './tiinex.party.v1.schema.source.js';

export const partySchemaSourceModule = defineSchemaModule({
  id: 'tiinex.party.v1',
  label: 'Party',
  kind: 'concrete',
  role: 'party-artifact',
  parentSchemaId: 'tiinex.root.v1',
  summary: "Schema for a bounded party or actor reference such as a person, role, organization, group, institution, team, community, or other social/organizational participant.",
  binding,
  schemaSource
});
