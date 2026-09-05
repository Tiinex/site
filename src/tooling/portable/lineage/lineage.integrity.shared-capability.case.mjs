import assert from 'node:assert/strict';
import { loadNodePortableInput } from '../input/node.input.js';
import { normalizePortableInput } from '../input/portable.input.js';
import { buildWorkspaceAuditView } from '../../../workspaces/workspace.auditView.js';
import { applyPortableLineageIntegrityRepair } from './lineage.integrity.apply.js';
import { buildPortableLineageIntegrityRepairProjection } from './lineage.integrity.projection.js';

const source = await loadNodePortableInput(['.topics/tooling/010-safe-reduction-and-shared-capability-parity-coordination-task.trace.md']);
const material = normalizePortableInput(source);
assert.equal(material.records.length, 1);

const projection = buildPortableLineageIntegrityRepairProjection({ records: material.records });
assert.equal(projection.boundary.sharedConsumers.includes('Viewer'), true);
assert.equal(projection.boundary.sharedConsumers.includes('CLI'), true);
assert.equal(Array.isArray(projection.repairGroups), true);
assert.equal(projection.repairGroups.length, 1);
assert.equal(projection.repairGroups[0].artifactCount, 1);
assert.equal(projection.repairGroups[0].artifacts[0].path, material.records[0].path);
assert.equal(projection.repairGroups[0].boundary.includes('grouping never authorizes mutation'), true);

const view = buildWorkspaceAuditView({ id: 'repair-parity', title: 'Repair parity' }, { records: material.records });
assert.deepEqual(view.repair.summary, projection.summary);
assert.deepEqual(view.repair.repairGroups, projection.repairGroups);
assert.equal(view.repair.boundary.sourceMutation, false);
assert.equal(view.repair.boundary.remoteWrite, false);

const blockedApplication = applyPortableLineageIntegrityRepair({ records: material.records, repairPlan: null });
assert.equal(blockedApplication.status, 'blocked');
assert.equal(blockedApplication.reAudit.schema, 'tiinex.portable.lineage-integrity-post-repair-audit.v1');
assert.equal(blockedApplication.reAudit.capabilityBoundary.sharedConsumers.includes('Viewer'), true);
assert.equal(blockedApplication.reAudit.capabilityBoundary.sharedConsumers.includes('CLI'), true);
assert.equal(blockedApplication.boundary.postRepairReAuditRequired, true);
assert.equal(blockedApplication.boundary.sharedAuditCapability, true);
assert.equal(blockedApplication.changeset.sourceMutation, false);
assert.equal(blockedApplication.changeset.remoteWrite, false);

console.log('✓ Shared lineage repair projection and post-repair audit preserve Viewer/CLI parity, per-artifact grouping, and local-only mutation boundaries');
