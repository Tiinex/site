import { defineSchemaModule } from '../contracts.js';
import binding from './tiinex.reduction.v1.schema.json' with { type: 'json' };
import { schemaSource } from './tiinex.reduction.v1.schema.source.js';

export const reductionSchemaModule = defineSchemaModule({
  id: 'tiinex.reduction.v1',
  label: 'Reduction',
  kind: 'concrete',
  role: 'reduction-artifact',
  parentSchemaId: 'tiinex.root.v1',
  summary: "Schema for observable reduction artifacts that preserve carry-forward state, loss, and uncertainty.",
  binding,
  schemaSource,
  capabilities: Object.freeze({
    supportedSurfaces: Object.freeze(['feed', 'tree', 'detail', 'lineage', 'preview', 'share']),
    canRenderFallback: true,
    boundaries: Object.freeze(['Read companion only; canonical Docs schema bytes remain semantic authority.'])
  }),
  read: Object.freeze({
    label: 'Reduction',
    sections: Object.freeze(['Source Context', 'Carry-Forward State', 'Loss And Uncertainty', 'Validation'])
  }),
  viewActions: Object.freeze({
    lineage: Object.freeze(['record.open', 'record.markdown', 'record.source'])
  })
});
