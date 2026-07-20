import { defineSchemaModule } from '../contracts.js';
import binding from './workspace.schema.json' with { type: 'json' };
import { workspaceCapabilities } from './workspace.capabilities.js';
import { workspaceValidate } from './workspace.validate.js';
import { workspacePresent } from './workspace.presenter.js';
import { workspaceTransitions } from './workspace.transitions.js';
import { workspaceI18n } from './workspace.i18n.js';
import { workspaceFindings } from './workspace.findings.js';

export const workspaceSchemaModule = defineSchemaModule({
  id: 'tiinex.workspace.v1',
  label: 'Workspace',
  kind: 'concrete',
  role: 'viewer-workspace-entrypoint',
  parentSchemaId: 'tiinex.root.v1',
  originTrustRole: 'viewer-extension',
  summary: 'Viewer-local workspace entrypoint schema and React surface companions.',
  binding,
  capabilities: workspaceCapabilities,
  validate: workspaceValidate,
  present: workspacePresent,
  transitions: workspaceTransitions,
  i18n: workspaceI18n,
  findings: workspaceFindings
});
