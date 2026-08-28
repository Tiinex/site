import binding from './tiinex.workspace.representation.v1.schema.json' with { type: 'json' };
import projection from './tiinex.workspace.representation.v1.schema.runtime.json' with { type: 'json' };
import { defineBundledSchemaSource } from '../../../../schema.source.js';

export const schemaSource = defineBundledSchemaSource(binding, projection, Object.freeze({
  bundledPath: 'src/schemas/core/relation/workspace/representation/tiinex.workspace.representation.v1.schema.md',
  sourceLabel: 'Anchor-accepted local canonical Workspace Representation contract',
  assetUrl: new URL('./tiinex.workspace.representation.v1.schema.md', import.meta.url).href
}));
