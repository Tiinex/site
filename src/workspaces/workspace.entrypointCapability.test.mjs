import assert from 'node:assert/strict';
import { isWorkspaceEntrypointArtifact, workspaceEntrypointCapability } from './workspace.entrypointCapability.js';
import { inferRecordMaterialRole, MaterialRole } from './workspace.materialRole.js';
import { presentRecordActions, RecordActionKind } from '../actions/record.actions.js';

const schemaDefinition = {
  id: 'schema:workspace',
  path: '.topics/.schemas/tiinex.workspace.v1.schema.md',
  schemaId: 'tiinex.workspace.v1',
  kind: 'workspace schema module',
  title: 'Tiinex Workspace v1 Schema',
  markdown: '# Tiinex Workspace v1 Schema'
};
assert.equal(isWorkspaceEntrypointArtifact(schemaDefinition), false, 'workspace-related schema/type information is not an openable workspace entrypoint');
assert.equal(inferRecordMaterialRole(schemaDefinition), MaterialRole.schemaDefinition, 'workspace schema definition must stay schema-definition material');
assert.equal(presentRecordActions(schemaDefinition).some((action) => action.id === RecordActionKind.workspaceOpen || action.id === RecordActionKind.workspaceMerge), false, 'workspace schema definition gets no Open/Merge capability');

const workspaceArtifact = {
  id: 'workspace:news',
  path: '.topics/news.workspace.md',
  schemaId: 'tiinex.workspace.v1',
  title: 'News',
  markdown: '# News\n\n## Workspace Entrypoints\n'
};
assert.equal(isWorkspaceEntrypointArtifact(workspaceArtifact), true, '*.workspace.md is a workspace entrypoint artifact');
assert.deepEqual(workspaceEntrypointCapability(workspaceArtifact), {
  schema: 'tiinex.workspace.entrypoint.capability.v1',
  eligible: true,
  open: true,
  merge: true,
  source: 'workspace-path'
});
const workspaceActions = presentRecordActions(workspaceArtifact).map((action) => action.id);
assert(workspaceActions.includes(RecordActionKind.workspaceOpen), 'workspace artifact gets Open');
assert(workspaceActions.includes(RecordActionKind.workspaceMerge), 'workspace artifact gets Merge');

const explicitRole = {
  id: 'workspace:legacy-normalized',
  path: '.topics/recovered.md',
  workspaceArtifactRole: { schema: 'tiinex.workspace.artifact.role.v1', openEligible: true, mergeEligible: true }
};
assert.equal(isWorkspaceEntrypointArtifact(explicitRole), true, 'explicit canonical workspace artifact role can carry Open/Merge independent of filename');


const mergeOnlyRole = {
  id: 'workspace:merge-only',
  path: '.topics/recovered-merge.md',
  workspaceArtifactRole: { schema: 'tiinex.workspace.artifact.role.v1', openEligible: false, mergeEligible: true }
};
assert.deepEqual(workspaceEntrypointCapability(mergeOnlyRole), {
  schema: 'tiinex.workspace.entrypoint.capability.v1', eligible: true, open: false, merge: true, source: 'explicit-role'
});
const mergeOnlyActions = presentRecordActions(mergeOnlyRole).map((action) => action.id);
assert.equal(mergeOnlyActions.includes(RecordActionKind.workspaceOpen), false, 'record actions must not invent Open when canonical capability disables it');
assert.equal(mergeOnlyActions.includes(RecordActionKind.workspaceMerge), true, 'record actions must expose Merge when canonical capability enables it');

const openOnlyRole = {
  id: 'workspace:open-only',
  path: '.topics/recovered-open.md',
  workspaceArtifactRole: { schema: 'tiinex.workspace.artifact.role.v1', openEligible: true, mergeEligible: false }
};
assert.deepEqual(workspaceEntrypointCapability(openOnlyRole), {
  schema: 'tiinex.workspace.entrypoint.capability.v1', eligible: true, open: true, merge: false, source: 'explicit-role'
});
const openOnlyActions = presentRecordActions(openOnlyRole).map((action) => action.id);
assert.equal(openOnlyActions.includes(RecordActionKind.workspaceOpen), true, 'record actions must expose Open when canonical capability enables it');
assert.equal(openOnlyActions.includes(RecordActionKind.workspaceMerge), false, 'record actions must not invent Merge when canonical capability disables it');

console.log('✓ workspace entrypoint capability tests passed');
