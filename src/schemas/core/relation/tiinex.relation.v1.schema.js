import { defineSchemaModule } from '../../contracts.js';
import { relationLocalMaterialization } from './tiinex.relation.v1.localMaterialization.js';
import binding from './tiinex.relation.v1.schema.json' with { type: 'json' };
import { schemaSource } from './tiinex.relation.v1.schema.source.js';
import { relationCapabilities } from './tiinex.relation.v1.capabilities.js';
import { relationValidate } from './tiinex.relation.v1.validate.js';
import { relationPresent } from './tiinex.relation.v1.presenter.js';
import { relationTransitions } from './tiinex.relation.v1.transitions.js';
import relationI18nEn from './tiinex.relation.v1.en.i18n.json' with { type: 'json' };
import relationI18nSv from './tiinex.relation.v1.sv.i18n.json' with { type: 'json' };
import { relationFindings } from './tiinex.relation.v1.findings.js';
import { RELATION_REQUIRED_SECTIONS } from './tiinex.relation.v1.contract.js';
export const relationSchemaModule = defineSchemaModule({
  id: 'tiinex.relation.v1', label: 'Relation', kind: 'concrete', role: 'core-artifact', parentSchemaId:'tiinex.root.v1',
  schemaSource, summary:'Typed non-parent relation between artifacts or bounded targets.', binding, capabilities:relationCapabilities,
  validate:relationValidate, present:relationPresent, read:Object.freeze({label:'Relation',sections:RELATION_REQUIRED_SECTIONS}),
  viewActions:Object.freeze({lineage:Object.freeze(['record.open','record.markdown','record.source'])}), transitions:relationTransitions,
  localMaterialization: relationLocalMaterialization,
  i18n:Object.freeze({en:relationI18nEn,sv:relationI18nSv}), findings:relationFindings
});
