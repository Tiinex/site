import assert from 'node:assert/strict';
import { loadNodePortableInput } from '../input/node.input.js';
import { normalizePortableInput } from '../input/portable.input.js';
import { auditPortableMaterial } from '../engine.facade.js';
import { buildWorkspaceAuditView } from '../../../workspaces/workspace.auditView.js';
import { auditPortableRecord, auditPortableRecords } from './audit.capability.js';

const source = await loadNodePortableInput(['.topics/tooling/010-safe-reduction-and-shared-capability-parity-coordination-task.trace.md']);
const material = normalizePortableInput(source);
assert.equal(material.records.length, 1);
const record = material.records[0];

const recordAudit = auditPortableRecord(record);
assert.equal(recordAudit.schema, 'tiinex.portable.shared-audit-record.v1');
assert.equal(recordAudit.path, record.path);
assert.equal(recordAudit.capabilityBoundary.adapterNeutral, true);
assert(recordAudit.findings.length > 0);
for (const finding of recordAudit.findings) {
  assert.match(finding.findingIdentity, /::/);
  assert.equal(finding.artifactBoundary.path, record.path);
  assert.equal(finding.ownership.kind, 'implementation-source');
  assert(finding.ownership.owner);
}

const batchAudit = auditPortableRecords([record]);
assert.equal(batchAudit.audits.length, 1);
assert.equal(batchAudit.boundary.sharedConsumers.includes('Viewer'), true);
assert.equal(batchAudit.boundary.sharedConsumers.includes('CLI'), true);
assert.equal(batchAudit.boundary.sourceMutation, false);
assert.equal(batchAudit.boundary.remoteWrite, false);

const cliAudit = auditPortableMaterial(source);
const viewerAudit = buildWorkspaceAuditView({ id: 'audit-parity', title: 'Audit parity' }, { records: [record] });
assert.equal(cliAudit.audits.length, 1);
assert.equal(viewerAudit.items.length, 1);
const sharedProjection = (audit) => (audit.findings || []).map((finding) => ({
  code: finding.code,
  severity: finding.severity,
  findingIdentity: finding.findingIdentity,
  owner: finding.ownership?.owner || '',
  artifactPath: finding.artifactBoundary?.path || ''
}));
assert.deepEqual(sharedProjection(cliAudit.audits[0]), sharedProjection(viewerAudit.items[0]));

console.log('✓ Shared portable audit capability keeps CLI/LLM and Viewer finding identity, severity, ownership, and artifact boundaries in parity');
