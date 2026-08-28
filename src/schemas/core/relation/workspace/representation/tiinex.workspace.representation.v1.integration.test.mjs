import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolveSchemaModule } from '../../../../resolver.js';
import { portableRuntimeValidationContractForSchema } from '../../../../../tooling/portable/schema/qualifiedLocalRoot.runtime.js';
import { inspectRecipientV2Artifact, renderRecipientV2WorkspaceRepresentation } from '../../../../../tooling/portable/handoff/recipientV2.artifacts.js';

const EXPECTED_SHA256 = '9f8e806b365484ebdd477e16d5dd12850f8f801a648a4b8e67cc284383a45cf7';
const schemaBytes = await readFile(new URL('./tiinex.workspace.representation.v1.schema.md', import.meta.url));
assert.equal(crypto.createHash('sha256').update(schemaBytes).digest('hex'), EXPECTED_SHA256, 'Site must carry the exact Anchor-accepted canonical Workspace Representation schema bytes');

const resolution = resolveSchemaModule({ schemaId: 'tiinex.workspace.representation.v1' });
assert.equal(resolution.fallbackUsed, false, 'Workspace Representation must resolve to its exact registered module rather than Root fallback');
assert.equal(resolution.module?.id, 'tiinex.workspace.representation.v1');
assert.equal(resolution.module?.schemaSource?.qualify?.().state, 'qualified');

const runtime = portableRuntimeValidationContractForSchema('tiinex.workspace.representation.v1');
assert.equal(runtime.state, 'qualified');
assert(runtime.compiledContract.validation.requiredSections.includes('Representation Binding'));
assert(runtime.compiledContract.validation.requiredSections.includes('Representation Correlation'));
assert.equal(runtime.compiledContract.validation.requiredSections.includes('Relation Declaration'), false, 'accepted child specialization replaces inherited generic Relation Declaration instance section');
assert.equal(runtime.compiledContract.validation.requiredSections.includes('Relation Target'), false, 'accepted child specialization replaces inherited generic Relation Target instance section');
assert.equal(runtime.compiledContract.validation.ordinaryGroups.some((group) => group.group === 'Relation Declaration'), false);

const facts = {
  factsFormat: 'portable-recipient-v2', factsVersion: 1, role: 'workspace-representation', workspaceId: 'site',
  workspaceArtifactPath: '001-3-site.workspace.md', payloadArtifactPath: '001-3-1-workspace-representation-payload.trace.md',
  sourceWorkspaceTargetInnerPath: '.topics/.workspaces/tiinex-site.workspace.md'
};
const base = {
  createdAt: '2026-08-27 20:00:00', workspaceArtifactPath: facts.workspaceArtifactPath, payloadArtifactPath: facts.payloadArtifactPath,
  workspaceArtifactInnerPath: facts.sourceWorkspaceTargetInnerPath
};
const verified = inspectRecipientV2Artifact({ path: '001-3-2-workspace-representation.trace.md', content: renderRecipientV2WorkspaceRepresentation(base) }, { facts });
assert.equal(verified.status, 'qualified');
assert.equal(verified.conformance.contractState, 'valid');
const stale = inspectRecipientV2Artifact({ path: '001-3-2-workspace-representation.trace.md', content: renderRecipientV2WorkspaceRepresentation({ ...base, bindingState: 'stale' }) }, { facts });
assert.equal(stale.status, 'qualified', 'schema-valid non-ready binding states must remain representable without being promoted to provider readiness');
assert.equal(stale.conformance.contractState, 'valid');

console.log('✓ tiinex.workspace.representation.v1 exact registration, specialization, renderer qualification, and non-ready-state preservation passed');
