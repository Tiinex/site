import binding from './tiinex.preservation.v1.schema.json' with { type: 'json' };
import projection from './tiinex.preservation.v1.schema.runtime.json' with { type: 'json' };
import { defineBundledSchemaSource } from '../../schema.source.js';

export const schemaSource = defineBundledSchemaSource(binding, projection, Object.freeze({
  bundledPath: 'src/schemas/core/preservation/tiinex.preservation.v1.schema.md',
  sourceLabel: 'Viewer schema registry',
  assetUrl: new URL('./tiinex.preservation.v1.schema.md', import.meta.url).href
}));
