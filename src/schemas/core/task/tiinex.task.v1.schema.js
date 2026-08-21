import { defineSchemaModule } from '../../contracts.js';
import { genericArtifactCreationImplementation } from '../../creation.renderer.js';
import { defineArtifactCreationCapability } from '../../creation.capability.js';
import { taskLocalMaterialization } from './tiinex.task.v1.localMaterialization.js';
import binding from './tiinex.task.v1.schema.json' with { type: 'json' };
import { schemaSource } from './tiinex.task.v1.schema.source.js';
import { taskCapabilities } from './tiinex.task.v1.capabilities.js';
import { taskValidate } from './tiinex.task.v1.validate.js';
import { taskPresent } from './tiinex.task.v1.presenter.js';
import { taskTransitions } from './tiinex.task.v1.transitions.js';
import taskI18nEn from './tiinex.task.v1.en.i18n.json' with { type: 'json' };
import taskI18nSv from './tiinex.task.v1.sv.i18n.json' with { type: 'json' };
import { taskFindings } from './tiinex.task.v1.findings.js';
import { TASK_CANONICAL_BODY_SECTIONS } from './tiinex.task.v1.contract.js';

export const taskSchemaModule = defineSchemaModule({
  id: 'tiinex.task.v1',
  label: 'Task',
  kind: 'concrete',
  role: 'core-artifact',
  parentSchemaId: 'tiinex.root.v1',
  summary: 'Canonical Task artifacts with bounded work, completion criteria, scope, and dependencies.',
  binding,
  schemaSource,
  artifactCreation: defineArtifactCreationCapability(binding, Object.freeze({ ...genericArtifactCreationImplementation, transitionTypes: Object.freeze(['create-artifact','continue-from-record']) })),
  capabilities: taskCapabilities,
  validate: taskValidate,
  present: taskPresent,
  read: Object.freeze({ label: 'Task', sections: TASK_CANONICAL_BODY_SECTIONS }),
  viewActions: Object.freeze({ lineage: Object.freeze(['record.open', 'record.markdown', 'record.source']) }),
  transitions: taskTransitions,
  localMaterialization: taskLocalMaterialization,
  i18n: Object.freeze({ en: taskI18nEn, sv: taskI18nSv }),
  findings: taskFindings
});
