import binding from './tiinex.presentation.surface.v1.schema.json' with { type: 'json' };
import projection from './tiinex.presentation.surface.v1.schema.runtime.json' with { type: 'json' };
import { defineBundledSchemaSource } from '../../schema.source.js';

export const schemaSource = defineBundledSchemaSource(binding, projection, Object.freeze({
  bundledPath: 'src/schemas/presentation/surface/tiinex.presentation.surface.v1.schema.md',
  sourceLabel: 'Viewer schema registry',
  assetUrl: new URL('./tiinex.presentation.surface.v1.schema.md', import.meta.url).href
}));
