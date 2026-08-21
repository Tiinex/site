import { defineSchemaModule } from '../contracts.js';
import binding from './tiinex.workspace.v1.schema.json' with { type: 'json' };
import { schemaSource } from './tiinex.workspace.v1.schema.source.js';
import { workspaceCapabilities } from './tiinex.workspace.v1.capabilities.js';
import { workspaceValidate } from './tiinex.workspace.v1.validate.js';
import { workspacePresent } from './tiinex.workspace.v1.presenter.js';
import { workspaceTransitions } from './tiinex.workspace.v1.transitions.js';
import workspaceI18nEn from './tiinex.workspace.v1.en.i18n.json' with { type: 'json' };
import workspaceI18nSv from './tiinex.workspace.v1.sv.i18n.json' with { type: 'json' };
import { workspaceFindings } from './tiinex.workspace.v1.findings.js';

export const workspaceSchemaModule = defineSchemaModule({
  id: 'tiinex.workspace.v1',
  label: 'Workspace',
  kind: 'concrete',
  role: 'viewer-workspace-entrypoint',
  parentSchemaId: 'tiinex.root.v1',
  originTrustRole: 'viewer-extension',
  summary: 'Viewer-local workspace entrypoint schema and React surface companions.',
  binding,
  schemaSource,
  capabilities: workspaceCapabilities,
  validate: workspaceValidate,
  present: workspacePresent,
  read: Object.freeze({ label: 'Workspace', sections: Object.freeze(['Workspace', 'Sources', 'Display Options', 'Validation', 'Interpretation Limits']) }),
  viewActions: Object.freeze({ lineage: Object.freeze(['record.open', 'record.markdown', 'record.source']) }),
  transitions: workspaceTransitions,
  i18n: Object.freeze({ en: workspaceI18nEn, sv: workspaceI18nSv }),
  findings: workspaceFindings
});
