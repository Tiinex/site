import { defineSchemaModule } from '../../../../contracts.js';
import binding from './tiinex.workspace.representation.v1.schema.json' with { type: 'json' };
import { schemaSource } from './tiinex.workspace.representation.v1.schema.source.js';
import { workspaceRepresentationCapabilities } from './tiinex.workspace.representation.v1.capabilities.js';
import { workspaceRepresentationValidate } from './tiinex.workspace.representation.v1.validate.js';
import { workspaceRepresentationPresent } from './tiinex.workspace.representation.v1.presenter.js';
import { workspaceRepresentationTransitions } from './tiinex.workspace.representation.v1.transitions.js';
import workspaceRepresentationI18nEn from './tiinex.workspace.representation.v1.en.i18n.json' with { type: 'json' };
import workspaceRepresentationI18nSv from './tiinex.workspace.representation.v1.sv.i18n.json' with { type: 'json' };
import { workspaceRepresentationFindings } from './tiinex.workspace.representation.v1.findings.js';
import { WORKSPACE_REPRESENTATION_REQUIRED_SECTIONS } from './tiinex.workspace.representation.v1.contract.js';

export const workspaceRepresentationSchemaModule = defineSchemaModule({
  id: 'tiinex.workspace.representation.v1', label: 'Workspace Representation', kind: 'concrete', role: 'core-workspace-representation-binding', parentSchemaId: 'tiinex.relation.v1',
  schemaSource, summary: 'Explicit Workspace-to-External-Payload representation binding with deterministic correlation and fail-closed provider qualification.', binding,
  capabilities: workspaceRepresentationCapabilities, validate: workspaceRepresentationValidate, present: workspaceRepresentationPresent,
  read: Object.freeze({ label: 'Workspace Representation', sections: WORKSPACE_REPRESENTATION_REQUIRED_SECTIONS }),
  viewActions: Object.freeze({ lineage: Object.freeze(['record.open','record.markdown','record.source']) }), transitions: workspaceRepresentationTransitions,
  i18n: Object.freeze({ en: workspaceRepresentationI18nEn, sv: workspaceRepresentationI18nSv }), findings: workspaceRepresentationFindings
});
