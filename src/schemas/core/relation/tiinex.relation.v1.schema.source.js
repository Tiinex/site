import binding from './tiinex.relation.v1.schema.json' with { type: 'json' };
import projection from './tiinex.relation.v1.schema.runtime.json' with { type: 'json' };
import { defineBundledSchemaSource } from '../../schema.source.js';

export const schemaSource = defineBundledSchemaSource(binding, projection, Object.freeze({
  bundledPath: 'src/schemas/core/relation/tiinex.relation.v1.schema.md',
  sourceLabel: 'Viewer schema registry',
  assetUrl: new URL('./tiinex.relation.v1.schema.md', import.meta.url).href
}));
